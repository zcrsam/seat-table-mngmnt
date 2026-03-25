// src/features/admin/pages/NotificationDashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// BELLEVUE · NOTIFICATION MONITOR  –  v3
// Fixes:
//   • White screen — logo import wrapped in try/catch, errors caught gracefully
//   • Multi-alert "View" — shows a picker modal when popup has 2+ events,
//     letting admin choose WHICH reservation to view in detail
//   • WebSocket — real-time via Laravel Echo (Pusher) instead of polling
//   • Polling removed — Echo handles all live updates
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Bell, BellDot, Clock, X, CalendarDays,
  MapPin, Users, Phone, Mail, FileText, Hash, CheckCircle,
  Wifi, WifiOff,
} from "lucide-react";
import { reservationAPI } from "../../../services/reservationAPI";

// ── Skip logo import to prevent white screen ─────────────────
let bellevueLogo = null;

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:           "#F5F6FA",
  surface:      "#FFFFFF",
  gold:         "#C9A84C",
  goldBorder:   "rgba(201,168,76,0.30)",
  navy:         "#1B2A4A",
  navyLight:    "rgba(27,42,74,0.06)",
  blue:         "#3B82F6",
  bluePastel:   "#EFF6FF",
  blueBorder:   "rgba(59,130,246,0.20)",
  green:        "#16A34A",
  greenPastel:  "#F0FDF4",
  greenBorder:  "rgba(22,163,74,0.20)",
  red:          "#DC2626",
  redPastel:    "#FEF2F2",
  redBorder:    "rgba(220,38,38,0.20)",
  amber:        "#D97706",
  amberPastel:  "#FFFBEB",
  amberBorder:  "rgba(217,119,6,0.22)",
  text:         "#111827",
  textSub:      "#374151",
  textMuted:    "#6B7280",
  textLight:    "#9CA3AF",
  textTiny:     "#D1D5DB",
  border:       "#E5E7EB",
  borderLight:  "#F3F4F6",
  shadow:       "rgba(17,24,39,0.05)",
  shadowMd:     "rgba(17,24,39,0.10)",
  font:         "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const PAGE = 20;

// ── Status helpers ─────────────────────────────────────────────────────────────
function isApproved(r) {
  const s = (r.status || r.reservationStatus || r.reservation_status || "")
    .toLowerCase().trim();
  return s === "reserved" || s === "approved" || s === "confirmed" || s === "done";
}

// ── Date / time helpers ───────────────────────────────────────────────────────
function parseEventDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const base = new Date(dateStr);
  if (isNaN(base)) return null;
  if (timeStr) {
    const m24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    const m12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m24) {
      base.setHours(+m24[1], +m24[2], 0, 0);
    } else if (m12) {
      let h = +m12[1];
      const ap = m12[3].toUpperCase();
      if (ap === "PM" && h !== 12) h += 12;
      if (ap === "AM" && h === 12) h = 0;
      base.setHours(h, +m12[2], 0, 0);
    }
  }
  return base;
}

function fmtTime(t) {
  if (!t) return "—";
  const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = +m24[1];
    return `${((h + 11) % 12) + 1}:${m24[2]} ${h >= 12 ? "PM" : "AM"}`;
  }
  return t;
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt)
    ? String(d)
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function relativeTimeLabel(diffMs) {
  if (diffMs <= 0) return "now";
  const totalMin = Math.round(diffMs / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const hrs  = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const hLabel = hrs === 1 ? "1 hr" : `${hrs} hrs`;
  return mins === 0 ? hLabel : `${hLabel} ${mins} min`;
}

function clockStr() {
  return new Date().toLocaleTimeString("en-PH", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}
function dateStr() {
  return new Date()
    .toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}

// ── Audio ─────────────────────────────────────────────────────────────────────
let _alertInterval = null;

function _playAlertOnce(onDone) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [
      { f: 880, d: 0.12 }, { f: 880, d: 0.12 },
      { f: 880, d: 0.12 }, { f: 1100, d: 0.24 },
    ];
    let t = ctx.currentTime + 0.05;
    notes.forEach(({ f, d }) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "square";
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.start(t); o.stop(t + d);
      t += d + 0.06;
    });
    if (onDone) setTimeout(onDone, (t - ctx.currentTime) * 1000 + 500);
  } catch (e) { if (onDone) onDone(); }
}

function playAlertThenSpeak(text) {
  stopAlertSound();
  _playAlertOnce(() => speakText(text));
  _alertInterval = setInterval(() => _playAlertOnce(), 4000);
}

function stopAlertSound() {
  if (_alertInterval !== null) { clearInterval(_alertInterval); _alertInterval = null; }
}

function playNewSound(onDone) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [{ f: 523, d: 0.10 }, { f: 659, d: 0.10 }, { f: 784, d: 0.18 }];
    let t = ctx.currentTime + 0.05;
    notes.forEach(({ f, d }) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.13, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.start(t); o.stop(t + d);
      t += d + 0.04;
    });
    if (onDone) setTimeout(onDone, (t - ctx.currentTime) * 1000 + 400);
  } catch (e) { if (onDone) onDone(); }
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95; u.pitch = 1.05; u.volume = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const eng =
    voices.find(v => v.lang.startsWith("en") && /female|zira|samantha/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith("en")) || null;
  if (eng) u.voice = eng;
  window.speechSynthesis.speak(u);
}

// ── InfoGrid — 2 × 3 ──────────────────────────────────────────────────────────
function InfoGrid({ fields, labelColor = C.textLight, valueColor = C.textSub }) {
  const slots = [...fields];
  while (slots.length < 6) slots.push({ label: "", value: "" });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 10px" }}>
      {slots.slice(0, 6).map(({ label, value }, i) => (
        <div key={i}>
          {label && (
            <>
              <div style={{ fontFamily: C.font, fontSize: 10, fontWeight: 600, color: labelColor, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
              <div style={{ fontFamily: C.font, fontSize: 12, fontWeight: 500, color: valueColor, lineHeight: 1.4 }}>{value || "—"}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Reservation Detail Modal ──────────────────────────────────────────────────
function ReservationDetailModal({ res, onClose }) {
  if (!res) return null;

  const rawStatus = (res.status || res.reservationStatus || res.reservation_status || "").toLowerCase();
  const statusColor = rawStatus === "done" ? C.blue
    : (rawStatus === "reserved" || rawStatus === "approved" || rawStatus === "confirmed") ? C.green
    : C.textMuted;
  const statusLabel = rawStatus === "reserved" ? "Reserved"
    : rawStatus === "approved"  ? "Approved"
    : rawStatus === "confirmed" ? "Confirmed"
    : rawStatus === "done"      ? "Done"
    : rawStatus || "—";

  const sections = [
    {
      title: "Guest Information",
      rows: [
        { icon: <Users size={13} color={C.gold} />,    label: "Guest Name", value: res.guest_name || res.name || "—" },
        { icon: <Mail  size={13} color={C.gold} />,    label: "Email",      value: res.email || res.guest_email || "—" },
        { icon: <Phone size={13} color={C.gold} />,    label: "Phone",      value: res.phone || res.contact || res.guest_phone || "—" },
        { icon: <Users size={13} color={C.gold} />,    label: "Guests",     value: (res.guests_count ?? res.guests_number ?? res.guests) ? `${res.guests_count ?? res.guests_number ?? res.guests} Pax` : "1 Pax" },
      ],
    },
    {
      title: "Reservation Details",
      rows: [
        { icon: <Hash         size={13} color={C.gold} />, label: "Reference",  value: res.reference_code || res.ref_code || res.id || "—" },
        { icon: <MapPin       size={13} color={C.gold} />, label: "Venue",      value: res.room || res.venue || "—" },
        { icon: <FileText     size={13} color={C.gold} />, label: "Table",      value: res.table_number ?? res.table ?? "—" },
        { icon: <FileText     size={13} color={C.gold} />, label: "Seat",       value: res.seat_number  ?? res.seat  ?? "—" },
        { icon: <CalendarDays size={13} color={C.gold} />, label: "Event Date", value: fmtDate(res.event_date || res.eventDate || res.reservationDate) },
        { icon: <Clock        size={13} color={C.gold} />, label: "Event Time", value: fmtTime(res.event_time || res.eventTime || res.reservationTime) },
      ],
    },
    {
      title: "Additional Info",
      rows: [
        { icon: <FileText    size={13} color={C.gold} />, label: "Special Requests", value: res.special_requests || res.notes || res.remarks || "None" },
        { icon: <CheckCircle size={13} color={C.gold} />, label: "Status",            value: statusLabel },
      ],
    },
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(17,24,39,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeUp .2s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.surface, borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(17,24,39,.20), 0 4px 20px rgba(0,0,0,.06)", animation: "popupIn .3s cubic-bezier(.34,1.5,.64,1)" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: C.font, fontWeight: 700, fontSize: 15, color: C.navy }}>Reservation Details</div>
            <div style={{ fontFamily: C.font, fontSize: 13, fontWeight: 400, color: C.textMuted, marginTop: 2 }}>{res.guest_name || res.name || "Guest"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}40`, borderRadius: 20, padding: "3px 12px", fontFamily: C.font, fontSize: 12, fontWeight: 600, color: statusColor }}>{statusLabel}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>
          {sections.map(({ title, rows }) => (
            <div key={title} style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: C.font, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${C.borderLight}` }}>{title}</div>
              {rows.map(({ icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: C.font, fontSize: 10, fontWeight: 600, color: C.textLight, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontFamily: C.font, fontSize: 13, fontWeight: 500, color: C.textSub, lineHeight: 1.4 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 22px", background: C.navy, color: "#fff", border: "none", borderRadius: 8, fontFamily: C.font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── NEW: Multi-event Picker Modal ─────────────────────────────────────────────
// Shows when admin clicks "View" on a popup that contains 2+ events,
// letting them choose WHICH reservation to inspect.
function EventPickerModal({ items, approvedCards, onSelect, onClose }) {
  const [nowMs, setNowMs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(17,24,39,0.50)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeUp .2s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.surface, borderRadius: 14, width: "100%", maxWidth: 460, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(17,24,39,.22)", animation: "popupIn .3s cubic-bezier(.34,1.5,.64,1)" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: C.font, fontWeight: 700, fontSize: 15, color: C.navy }}>Choose Event to View</div>
            <div style={{ fontFamily: C.font, fontSize: 12, color: C.textMuted, marginTop: 2 }}>{items.length} upcoming events — select one to see full details</div>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px 14px" }}>
          {items.map((item, idx) => {
            const dt   = parseEventDate(item.eventDate, item.eventTime);
            const diff = dt ? dt.getTime() - nowMs : null;
            const rel  = diff !== null && diff > 0
              ? relativeTimeLabel(diff) + " before event"
              : diff !== null && diff <= 0 ? "Event started" : null;
            const urgent = diff !== null && diff <= 30 * 60000;

            // Try to find full reservation data for this item
            const fullRes = approvedCards.find(r => (r.id ?? r.db_id) === item.id);

            return (
              <button
                key={idx}
                onClick={() => fullRes && onSelect(fullRes)}
                disabled={!fullRes}
                style={{
                  display:      "block",
                  width:        "100%",
                  textAlign:    "left",
                  background:   fullRes ? C.surface : C.borderLight,
                  border:       `1.5px solid ${urgent ? C.redBorder : C.border}`,
                  borderRadius: 10,
                  padding:      "13px 15px",
                  marginBottom: 8,
                  cursor:       fullRes ? "pointer" : "not-allowed",
                  transition:   "all .15s",
                  boxShadow:    `0 1px 4px ${C.shadow}`,
                  opacity:      fullRes ? 1 : 0.55,
                }}
                onMouseEnter={e => { if (fullRes) { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.boxShadow = `0 4px 14px rgba(201,168,76,.15)`; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = urgent ? C.redBorder : C.border; e.currentTarget.style.boxShadow = `0 1px 4px ${C.shadow}`; }}
              >
                {/* Row: index badge + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: C.font, fontSize: 10, fontWeight: 700, color: C.gold }}>{idx + 1}</span>
                  </div>
                  <div style={{ fontFamily: C.font, fontWeight: 700, fontSize: 13, color: C.navy, flex: 1 }}>{item.name}</div>
                  {rel && (
                    <span style={{ background: urgent ? C.redPastel : C.amberPastel, border: `1px solid ${urgent ? C.redBorder : C.amberBorder}`, borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700, color: urgent ? C.red : C.amber, whiteSpace: "nowrap" }}>
                      {rel}
                    </span>
                  )}
                </div>

                {/* Details row */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CalendarDays size={11} color={C.textLight} />
                    <span style={{ fontFamily: C.font, fontSize: 11, color: C.textMuted }}>{fmtDate(item.eventDate)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={11} color={C.textLight} />
                    <span style={{ fontFamily: C.font, fontSize: 11, color: C.textMuted }}>{fmtTime(item.eventTime)}</span>
                  </div>
                  {item.room && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={11} color={C.textLight} />
                      <span style={{ fontFamily: C.font, fontSize: 11, color: C.textMuted }}>{item.room}</span>
                    </div>
                  )}
                </div>

                {/* CTA hint */}
                <div style={{ marginTop: 8, fontFamily: C.font, fontSize: 10, color: fullRes ? C.gold : C.textLight, fontWeight: 600, letterSpacing: 0.5 }}>
                  {fullRes ? "Click to view full details →" : "Details not available"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: "100%", padding: "9px 0", background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.font, fontSize: 12, fontWeight: 600, color: C.textMuted, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reminder Popup ────────────────────────────────────────────────────────────
function ReminderPopup({ popup, onView, onClose, queueCount }) {
  const [nowMs, setNowMs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const items = popup.items || [];

  return (
    <div style={{ position: "fixed", top: 72, right: 18, zIndex: 9999, width: 310, fontFamily: C.font, animation: "popupIn .35s cubic-bezier(.34,1.5,.64,1)" }}>
      {/* Bell icon */}
      <div style={{ position: "absolute", top: -24, left: 14, width: 48, height: 48, borderRadius: "50%", background: C.surface, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.10)", animation: "bellRing .6s ease .1s 4" }}>
        <BellDot size={22} color={C.navy} strokeWidth={1.8} />
      </div>

      <div style={{ background: C.surface, borderRadius: "24px 12px 12px 12px", overflow: "hidden", boxShadow: "0 8px 36px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)", position: "relative", zIndex: 2 }}>
        <div style={{ padding: "28px 18px 16px" }}>
          <div style={{ height: 8 }} />

          <div style={{ fontWeight: 700, fontSize: 16, color: C.text, textAlign: "center", marginBottom: 4 }}>
            {items.length > 1 ? `${items.length} Upcoming Events!` : "Upcoming Event!"}
          </div>

          {queueCount > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 10 }}>
              <span style={{ background: C.amberPastel, border: `1px solid ${C.amberBorder}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, color: C.amber, display: "flex", alignItems: "center", gap: 4 }}>
                <Bell size={10} color={C.amber} />
                {queueCount} reminders queued
              </span>
            </div>
          )}

          {/* Items list */}
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {items.map((item, idx) => {
              const dt   = parseEventDate(item.eventDate, item.eventTime);
              const diff = dt ? dt.getTime() - nowMs : null;
              const rel  = diff !== null && diff > 0
                ? relativeTimeLabel(diff) + " before event"
                : diff !== null && diff <= 0 ? "Event started" : null;

              return (
                <div key={idx} style={{ marginBottom: idx < items.length - 1 ? 10 : 0, paddingBottom: idx < items.length - 1 ? 10 : 0, borderBottom: idx < items.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 1 }}>{fmtDate(item.eventDate)} · {fmtTime(item.eventTime)}</div>
                  {item.room && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 1 }}>{item.room}</div>}
                  {rel && (
                    <span style={{ display: "inline-block", marginTop: 4, background: diff <= 30 * 60000 ? C.redPastel : C.amberPastel, border: `1px solid ${diff <= 30 * 60000 ? C.redBorder : C.amberBorder}`, borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 600, color: diff <= 30 * 60000 ? C.red : C.amber }}>
                      {rel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hint when multiple items */}
          {items.length > 1 && (
            <div style={{ marginTop: 10, padding: "6px 10px", background: C.bluePastel, border: `1px solid ${C.blueBorder}`, borderRadius: 8, fontSize: 11, color: C.blue, fontWeight: 600, textAlign: "center" }}>
              Click "View" to choose which event to inspect
            </div>
          )}
        </div>

        <div style={{ height: 1, background: C.borderLight }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <button
            onClick={() => onView(popup)}
            style={{ padding: "13px 0", background: "none", border: "none", borderRight: `1px solid ${C.borderLight}`, fontFamily: C.font, fontWeight: 600, fontSize: 14, color: C.green, cursor: "pointer" }}
            onMouseOver={e => e.currentTarget.style.background = C.greenPastel}
            onMouseOut={e  => e.currentTarget.style.background = "none"}
          >View</button>
          <button
            onClick={onClose}
            style={{ padding: "13px 0", background: "none", border: "none", fontFamily: C.font, fontWeight: 600, fontSize: 14, color: C.red, cursor: "pointer" }}
            onMouseOver={e => e.currentTarget.style.background = C.redPastel}
            onMouseOut={e  => e.currentTarget.style.background = "none"}
          >Dismiss</button>
        </div>
      </div>
    </div>
  );
}

// ── Card helpers ──────────────────────────────────────────────────────────────
function cardFields(res) {
  return [
    { label: "Venue",  value: res.room || res.venue },
    { label: "Table",  value: res.table_number ?? res.table },
    { label: "Seat",   value: res.seat_number  ?? res.seat  },
    { label: "Date",   value: fmtDate(res.event_date  || res.eventDate  || res.reservationDate) },
    { label: "Guests", value: (res.guests_count ?? res.guests) ? `${res.guests_count ?? res.guests} Pax` : "1 Pax" },
    { label: "Time",   value: fmtTime(res.event_time  || res.eventTime  || res.reservationTime) },
  ];
}

function NewResCard({ res, isNew, onClick }) {
  const [hi, setHi] = useState(isNew);
  useEffect(() => {
    if (isNew) { const t = setTimeout(() => setHi(false), 4000); return () => clearTimeout(t); }
  }, [isNew]);

  return (
    <div
      onClick={() => onClick(res)}
      style={{ background: C.surface, border: `1px solid ${hi ? C.blue : C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8, boxShadow: hi ? "0 4px 14px rgba(59,130,246,.12)" : `0 1px 4px ${C.shadow}`, transition: "all .4s ease", animation: isNew ? "cardSlideIn .4s cubic-bezier(.34,1.5,.64,1)" : "none", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.boxShadow = `0 4px 14px rgba(201,168,76,.12)`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = hi ? C.blue : C.border; e.currentTarget.style.boxShadow = hi ? "0 4px 14px rgba(59,130,246,.12)" : `0 1px 4px ${C.shadow}`; }}
    >
      <div style={{ fontFamily: C.font, fontWeight: 600, fontSize: 13, color: C.navy, marginBottom: 10 }}>
        {res.guest_name || res.name || "Unknown Guest"}
      </div>
      <InfoGrid fields={cardFields(res)} labelColor={C.textLight} valueColor={C.textSub} />
    </div>
  );
}

function DoneCard({ res, onClick }) {
  return (
    <div
      onClick={() => onClick(res)}
      style={{ background: C.greenPastel, border: `1px solid ${C.greenBorder}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8, boxShadow: `0 1px 4px ${C.shadow}`, cursor: "pointer", transition: "all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 14px rgba(22,163,74,.12)`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 1px 4px ${C.shadow}`; }}
    >
      <div style={{ fontFamily: C.font, fontWeight: 600, fontSize: 13, color: C.navy, marginBottom: 10 }}>
        {res.guest_name || res.name || "Unknown Guest"}
      </div>
      <InfoGrid fields={cardFields(res)} labelColor={C.textLight} valueColor="#166534" />
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px", fontFamily: C.font, fontSize: 13, color: C.textLight }}>
      {msg}
    </div>
  );
}

function LoadMoreBtn({ onClick, remaining }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "block", width: "100%", padding: "10px 0", background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.font, fontSize: 12, fontWeight: 600, color: C.textMuted, cursor: "pointer", marginBottom: 8 }}
      onMouseOver={e => e.currentTarget.style.background = C.border}
      onMouseOut={e  => e.currentTarget.style.background = C.borderLight}
    >
      Load more ({remaining} remaining)
    </button>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function NotificationDashboard() {
  const [approvedCards, setApprovedCards] = useState([]);
  const [popupQueue,    setPopupQueue]    = useState([]);
  const popup = popupQueue[0] ?? null;

  // pickerItems: when admin clicks View on a multi-event popup,
  // we show this list so they can choose which to view
  const [pickerItems,  setPickerItems]  = useState(null);
  const [detailRes,    setDetailRes]    = useState(null);
  const [newIds,       setNewIds]       = useState(new Set());
  const [clock,        setClock]        = useState(clockStr());
  const [date,         setDate]         = useState(dateStr());
  const [loading,      setLoading]      = useState(true);
  const [wsStatus,     setWsStatus]     = useState("connecting"); // "connecting" | "connected" | "disconnected"

  const [pendingPage, setPendingPage] = useState(1);
  const [donePage,    setDonePage]    = useState(1);
  const [pendingPerPage, setPendingPerPage] = useState(20);
  const [donePerPage, setDonePerPage] = useState(20);

  const knownApprovedIds = useRef(new Set());
  const firedAlerts      = useRef(new Set());
  const leftRef          = useRef(null);
  const echoRef          = useRef(null);

  // ── Dismiss popup ──────────────────────────────────────────────────────────
  const dismissPopup = useCallback(() => {
    setPopupQueue(q => {
      const next = q.slice(1);
      if (next.length === 0) stopAlertSound();
      return next;
    });
  }, []);

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => { setClock(clockStr()); setDate(dateStr()); }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Alert check ───────────────────────────────────────────────────────────
  const checkAlerts = useCallback((list) => {
    const candidates = list
      .map(res => {
        const id  = res.id ?? res.db_id;
        const key = `${id}-alert`;
        if (firedAlerts.current.has(key)) return null;
        const dt   = parseEventDate(
          res.event_date  || res.eventDate  || res.reservationDate,
          res.event_time  || res.eventTime  || res.reservationTime,
        );
        if (!dt) return null;
        const diff = dt.getTime() - Date.now();
        if (diff > 0 && diff <= 2 * 3_600_000) return { res, id, key, diff };
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.diff - b.diff);

    if (candidates.length === 0) return;
    candidates.forEach(({ key }) => firedAlerts.current.add(key));

    const items = candidates.map(({ res }) => ({
      id:        res.id ?? res.db_id,
      name:      res.guest_name || res.name || "Guest",
      room:      res.room || res.venue || "",
      eventDate: res.event_date  || res.eventDate  || res.reservationDate,
      eventTime: res.event_time  || res.eventTime  || res.reservationTime,
    }));

    setPopupQueue(q => [...q, { items, primaryId: items[0].id }]);

    const first    = candidates[0].res;
    const diff0    = candidates[0].diff;
    const relLabel = relativeTimeLabel(diff0);

    if (candidates.length === 1) {
      playAlertThenSpeak(
        `Reminder. ${first.guest_name || first.name || "A guest"}'s reservation ` +
        `at ${first.room || first.venue || "the venue"} starts in ${relLabel}.`,
      );
    } else {
      playAlertThenSpeak(
        `Reminder. ${candidates.length} reservations are coming up soon. ` +
        `The earliest starts in ${relLabel}.`,
      );
    }
  }, []);

  // ── Add new reservation to state ──────────────────────────────────────────
  const addNewReservation = useCallback((res, isInit = false) => {
    const id = res.id ?? res.db_id;
    if (!id) return;
    if (knownApprovedIds.current.has(id)) return;
    knownApprovedIds.current.add(id);

    setApprovedCards(prev => {
      const updated = [res, ...prev].sort((a, b) =>
        (b.submittedTimestamp || +new Date(b.created_at) || 0) -
        (a.submittedTimestamp || +new Date(a.created_at) || 0)
      );
      return updated;
    });

    if (!isInit) {
      setNewIds(prev => new Set([...prev, id]));
      setPendingPage(1);
      setTimeout(() => setNewIds(prev => {
        const next = new Set(prev); next.delete(id); return next;
      }), 4000);
      if (leftRef.current) leftRef.current.scrollTo({ top: 0, behavior: "smooth" });

      playNewSound(() =>
        speakText(`New approved reservation from ${res.guest_name || res.name || "a guest"}.`)
      );

      checkAlerts([res]);
    }
  }, [checkAlerts]);

  // ── Initial fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const resp = await reservationAPI.getAll("?per_page=50");
        const raw  = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : [];

        const approved = raw
          .filter(isApproved)
          .sort((a, b) =>
            (b.submittedTimestamp || +new Date(b.created_at) || 0) -
            (a.submittedTimestamp || +new Date(a.created_at) || 0)
          );

        approved.forEach(res => {
          const id = res.id ?? res.db_id;
          knownApprovedIds.current.add(id);
        });

        setApprovedCards(approved);
        checkAlerts(approved);
      } catch (e) {
        console.error("[NotifDashboard] Initial fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [checkAlerts]);

  // ── WebSocket via Simple Connection ─────────────────────────────────────
  useEffect(() => {
    const wsHost = import.meta.env.VITE_WS_HOST || 'localhost';
    const wsPort = import.meta.env.VITE_WS_PORT || '6001';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${wsHost}:${wsPort}`;
    
    console.log('[Notifications WS] Connecting to:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('[Notifications WS] Connected to WebSocket server');
      setWsStatus("connected");
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[Notifications WS] Received:', data);
        
        // Handle different event types
        if (data.event === 'ReservationUpdated' && data.payload && data.payload.reservation) {
          const res = data.payload.reservation;
          if (isApproved(res)) {
            addNewReservation(res, false);
          }
        }
        
        // Handle test data from WebSocket server
        if (data.event === 'connected') {
          console.log('[Notifications WS] Connection confirmed');
        }
      } catch (error) {
        console.error('[Notifications WS] Error parsing message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('[Notifications WS] Disconnected');
      setWsStatus("disconnected");
    };
    
    ws.onerror = (error) => {
      console.error('[Notifications WS] Error:', error);
      setWsStatus("disconnected");
    };
    
    // Store WebSocket for cleanup
    echoRef.current = ws;
    
    return () => {
      if (ws) {
        ws.close();
        echoRef.current = null;
      }
    };
  }, [addNewReservation]);

  // ── Split into upcoming vs done ───────────────────────────────────────────
  const { pendingCards, doneCards } = useMemo(() => {
    const pending = [];
    const done    = [];
    approvedCards.forEach(res => {
      const dt = parseEventDate(
        res.event_date  || res.eventDate  || res.reservationDate,
        res.event_time  || res.eventTime  || res.reservationTime,
      );
      if (!dt || dt.getTime() > Date.now()) pending.push(res);
      else done.push(res);
    });
    return { pendingCards: pending, doneCards: done };
  }, [approvedCards]);

  const pendingVisible = pendingCards.slice((pendingPage - 1) * pendingPerPage, pendingPage * pendingPerPage);
  const doneVisible    = doneCards.slice((donePage - 1) * donePerPage, donePage * donePerPage);

  // ── Handle "View" click on popup ──────────────────────────────────────────
  const handlePopupView = useCallback((p) => {
    dismissPopup();
    const items = p.items || [];

    if (items.length === 1) {
      // Only one event — open detail directly
      const full = approvedCards.find(r => (r.id ?? r.db_id) === items[0].id);
      if (full) setDetailRes(full);
    } else {
      // Multiple events — show picker so admin can choose
      setPickerItems(items);
    }
  }, [approvedCards, dismissPopup]);

  // ── Connection status label & color ───────────────────────────────────────
  const wsColor = wsStatus === "connected" ? C.green : wsStatus === "connecting" ? C.amber : C.red;
  const wsLabel = wsStatus === "connected" ? "Live" : wsStatus === "connecting" ? "Connecting…" : "Offline";
  const WsIcon  = wsStatus === "connected" ? Wifi : WifiOff;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: C.font, background: C.bg, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px; }
        @keyframes cardSlideIn {
          from { opacity:0; transform:translateY(-8px) scale(.98); }
          to   { opacity:1; transform:none; }
        }
        @keyframes popupIn {
          from { opacity:0; transform:translateY(-10px) scale(.96); }
          to   { opacity:1; transform:none; }
        }
        @keyframes bellRing {
          0%,100% { transform:rotate(0deg); }
          25%     { transform:rotate(-18deg); }
          75%     { transform:rotate(18deg); }
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.3; transform:scale(1.8); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>

      {/* ══════════════════════════ HEADER ══════════════════════════════════ */}
      <header style={{ height: 64, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0, boxShadow: `0 1px 6px ${C.shadow}`, gap: 16 }}>
        {/* Logo — graceful fallback if missing */}
        {bellevueLogo && (
          <img
            src={bellevueLogo}
            alt="The Bellevue Manila"
            style={{ height: 38, width: "auto", objectFit: "contain", flexShrink: 0 }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        )}

        <div style={{ width: 1, height: 26, background: C.border }} />

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: C.font, fontWeight: 700, fontSize: 14, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Notification Monitor
          </div>
        </div>

        {/* WebSocket status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${wsColor}15`, border: `1px solid ${wsColor}40`, borderRadius: 20, padding: "4px 12px", flexShrink: 0 }}>
          <WsIcon size={12} color={wsColor} />
          <span style={{ fontFamily: C.font, fontSize: 11, fontWeight: 600, color: wsColor }}>{wsLabel}</span>
        </div>

        {/* Bell */}
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: popup ? C.navy : C.borderLight, border: `1.5px solid ${popup ? C.gold : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s", animation: popup ? "bellRing .6s ease infinite" : "none", position: "relative" }}>
          {popup ? <BellDot size={16} color={C.gold} /> : <Bell size={16} color={C.gold} />}
          {popup && (
            <div style={{ position: "absolute", top: 3, right: 3, width: 7, height: 7, borderRadius: "50%", background: C.red, border: "1.5px solid #fff", animation: "dotPulse 1.2s ease infinite" }} />
          )}
        </div>

        <div style={{ width: 1, height: 26, background: C.border }} />

        {/* Clock */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: C.font, fontWeight: 700, fontSize: 16, color: C.navy, lineHeight: 1.15 }}>{clock}</div>
          <div style={{ fontFamily: C.font, fontSize: 10, fontWeight: 500, color: C.textLight, letterSpacing: 0.8, marginTop: 2 }}>{date}</div>
        </div>
      </header>

      {/* ══════════════════════════ LOADING ═════════════════════════════════ */}
      {loading && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 30, height: 30, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
          <div style={{ fontFamily: C.font, fontSize: 13, fontWeight: 400, color: C.textMuted }}>Loading notifications…</div>
        </div>
      )}

      {/* ══════════════════════════ TWO COLUMNS ═════════════════════════════ */}
      {!loading && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "3fr 1.4fr", gap: 16, padding: "16px 20px", minHeight: 0, animation: "fadeUp .3s ease" }}>

          {/* LEFT — Upcoming */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", boxShadow: `0 2px 10px ${C.shadow}`, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ background: C.bluePastel, borderBottom: `1px solid ${C.blueBorder}`, padding: "11px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: C.font, fontWeight: 600, fontSize: 13, color: C.navy }}>Upcoming Reservations</span>
              <span style={{ background: C.blue, color: "#fff", borderRadius: 20, padding: "2px 10px", fontFamily: C.font, fontSize: 12, fontWeight: 600 }}>{pendingCards.length}</span>
            </div>
            <div ref={leftRef} style={{ flex: 1, overflowY: "auto", padding: "10px 12px", minHeight: 0 }}>
              {pendingCards.length === 0 ? (
                <EmptyState msg="No upcoming reservations" />
              ) : (
                <>
                  {pendingVisible.map(res => (
                    <NewResCard
                      key={res.id ?? res.db_id}
                      res={res}
                      isNew={newIds.has(res.id ?? res.db_id)}
                      onClick={setDetailRes}
                    />
                  ))}
                  {pendingCards.length > 0 && (
                    <div style={{ 
                      padding: "12px 16px", 
                      borderTop: `1px solid ${C.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexShrink: 0
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 11, color: C.textMuted }}>
                          {Math.min((pendingPage - 1) * pendingPerPage + 1, pendingCards.length)}-{Math.min(pendingPage * pendingPerPage, pendingCards.length)} of {pendingCards.length}
                        </span>
                        <select
                          value={pendingPerPage}
                          onChange={e => { setPendingPerPage(Number(e.target.value)); setPendingPage(1); }}
                          style={{
                            padding: "4px 8px",
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            fontSize: 11,
                            color: C.text,
                            background: C.surface,
                            cursor: "pointer"
                          }}
                        >
                          {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button
                          onClick={() => setPendingPage(Math.max(1, pendingPage - 1))}
                          disabled={pendingPage <= 1}
                          style={{
                            padding: "4px 8px",
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            background: pendingPage <= 1 ? C.bg : C.surface,
                            color: pendingPage <= 1 ? C.textMuted : C.text,
                            cursor: pendingPage <= 1 ? "not-allowed" : "pointer",
                            fontSize: 11
                          }}
                        >
                          Previous
                        </button>
                        <span style={{ fontSize: 11, color: C.text, padding: "0 8px" }}>
                          {pendingPage} / {Math.ceil(pendingCards.length / pendingPerPage)}
                        </span>
                        <button
                          onClick={() => setPendingPage(Math.min(Math.ceil(pendingCards.length / pendingPerPage), pendingPage + 1))}
                          disabled={pendingPage >= Math.ceil(pendingCards.length / pendingPerPage)}
                          style={{
                            padding: "4px 8px",
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            background: pendingPage >= Math.ceil(pendingCards.length / pendingPerPage) ? C.bg : C.surface,
                            color: pendingPage >= Math.ceil(pendingCards.length / pendingPerPage) ? C.textMuted : C.text,
                            cursor: pendingPage >= Math.ceil(pendingCards.length / pendingPerPage) ? "not-allowed" : "pointer",
                            fontSize: 11
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT — Done */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", boxShadow: `0 2px 10px ${C.shadow}`, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ background: C.greenPastel, borderBottom: `1px solid ${C.greenBorder}`, padding: "11px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: C.font, fontWeight: 600, fontSize: 13, color: C.navy }}>Done</span>
              <span style={{ background: C.green, color: "#fff", borderRadius: 20, padding: "2px 10px", fontFamily: C.font, fontSize: 12, fontWeight: 600 }}>{doneCards.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", minHeight: 0 }}>
              {doneCards.length === 0 ? (
                <EmptyState msg="No completed reservations" />
              ) : (
                <>
                  {doneVisible.map(res => (
                    <DoneCard key={`done-${res.id ?? res.db_id}`} res={res} onClick={setDetailRes} />
                  ))}
                  {doneCards.length > 0 && (
                    <div style={{ 
                      padding: "12px 16px", 
                      borderTop: `1px solid ${C.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexShrink: 0
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 11, color: C.textMuted }}>
                          {Math.min((donePage - 1) * donePerPage + 1, doneCards.length)}-{Math.min(donePage * donePerPage, doneCards.length)} of {doneCards.length}
                        </span>
                        <select
                          value={donePerPage}
                          onChange={e => { setDonePerPage(Number(e.target.value)); setDonePage(1); }}
                          style={{
                            padding: "4px 8px",
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            fontSize: 11,
                            color: C.text,
                            background: C.surface,
                            cursor: "pointer"
                          }}
                        >
                          {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button
                          onClick={() => setDonePage(Math.max(1, donePage - 1))}
                          disabled={donePage <= 1}
                          style={{
                            padding: "4px 8px",
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            background: donePage <= 1 ? C.bg : C.surface,
                            color: donePage <= 1 ? C.textMuted : C.text,
                            cursor: donePage <= 1 ? "not-allowed" : "pointer",
                            fontSize: 11
                          }}
                        >
                          Previous
                        </button>
                        <span style={{ fontSize: 11, color: C.text, padding: "0 8px" }}>
                          {donePage} / {Math.ceil(doneCards.length / donePerPage)}
                        </span>
                        <button
                          onClick={() => setDonePage(Math.min(Math.ceil(doneCards.length / donePerPage), donePage + 1))}
                          disabled={donePage >= Math.ceil(doneCards.length / donePerPage)}
                          style={{
                            padding: "4px 8px",
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            background: donePage >= Math.ceil(doneCards.length / donePerPage) ? C.bg : C.surface,
                            color: donePage >= Math.ceil(doneCards.length / donePerPage) ? C.textMuted : C.text,
                            cursor: donePage >= Math.ceil(doneCards.length / donePerPage) ? "not-allowed" : "pointer",
                            fontSize: 11
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ REMINDER POPUP ══════════════════════════ */}
      {popup && (
        <ReminderPopup
          popup={popup}
          queueCount={popupQueue.length}
          onView={handlePopupView}
          onClose={dismissPopup}
        />
      )}

      {/* ══════════════════════════ EVENT PICKER ════════════════════════════ */}
      {pickerItems && (
        <EventPickerModal
          items={pickerItems}
          approvedCards={approvedCards}
          onSelect={(res) => { setPickerItems(null); setDetailRes(res); }}
          onClose={() => setPickerItems(null)}
        />
      )}

      {/* ══════════════════════════ DETAIL MODAL ════════════════════════════ */}
      {detailRes && (
        <ReservationDetailModal
          res={detailRes}
          onClose={() => {
          // Check if we came from EventPickerModal (multiple events)
          const hasMultipleEvents = approvedCards.some(r => 
            popup?.items?.some(item => (item.id ?? item.db_id) === (res.id ?? res.db_id))
          );
          
          if (hasMultipleEvents) {
            // Go back to event picker
            setDetailRes(null);
            setPickerItems(popup?.items || []);
          } else {
            // Just close the modal
            setDetailRes(null);
          }
        }}
        />
      )}
    </div>
  );
}