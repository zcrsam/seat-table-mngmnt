// src/features/admin/pages/NotificationDashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// BELLEVUE · NOTIFICATION MONITOR
// Typography to match the Reservation Dashboard:
//   - Labels:      14px, weight 600, uppercase, muted color
//   - Values:      14px, weight 500 (NOT bold)
//   - Guest name:  14px, weight 600 (semi-bold, not 800)
//   - Headers:     weight 600
//   - Cinzel only for "NOTIFICATION MONITOR" title
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, BellDot, Clock, X, Eye, CalendarDays,
  MapPin, Users, Phone, Mail, FileText, Hash, CheckCircle,
} from "lucide-react";
import { reservationAPI } from "../../../services/reservationAPI";
import bellevueLogo from "../../../assets/bellevue-logo.png";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          "#F7F4EF",
  surface:     "#FFFFFF",
  gold:        "#C9A84C",
  goldBorder:  "rgba(201,168,76,0.35)",
  navy:        "#1B2A4A",
  navyLight:   "rgba(27,42,74,0.05)",
  blue:        "#4A90D9",
  bluePastel:  "#EBF3FC",
  blueBorder:  "rgba(74,144,217,0.25)",
  green:       "#2E9B6A",
  greenPastel: "#EAF7F1",
  greenBorder: "rgba(46,155,106,0.25)",
  red:         "#D94A4A",
  redPastel:   "#FEF0F0",
  redBorder:   "rgba(217,74,74,0.22)",
  text:        "#1A1F2E",
  textSub:     "#374151",
  textMuted:   "#6B7280",
  textLight:   "#9CA3AF",
  textTiny:    "#B0B7C3",
  border:      "#E8E2D6",
  borderLight: "#F0EBE1",
  shadow:      "rgba(27,42,74,0.06)",
  shadowMd:    "rgba(27,42,74,0.10)",
};

// ── Status filter  ────────────────────────────────────────────────────────────
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

function _playOnce() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [{ f:880,d:.12 },{ f:880,d:.12 },{ f:880,d:.12 },{ f:1100,d:.24 }]
      .reduce((t, { f, d }) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "square";
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.22, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.start(t); o.stop(t + d);
        return t + d + 0.06;
      }, ctx.currentTime + 0.05);
  } catch (e) {}
}

function playAlertSound() {
  stopAlertSound();
  _playOnce();
  _alertInterval = setInterval(_playOnce, 4000);
}

function stopAlertSound() {
  if (_alertInterval !== null) {
    clearInterval(_alertInterval);
    _alertInterval = null;
  }
}

function playNewSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [{ f:523,d:.1 },{ f:659,d:.1 },{ f:784,d:.18 }]
      .reduce((t, { f, d }) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.13, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.start(t); o.stop(t + d);
        return t + d + 0.04;
      }, ctx.currentTime + 0.05);
  } catch (e) {}
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95; u.pitch = 1.05; u.volume = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const eng =
    voices.find(v => v.lang.startsWith("en") && /female|zira|samantha/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith("en")) ||
    null;
  if (eng) u.voice = eng;
  setTimeout(() => window.speechSynthesis.speak(u), 500);
}

// ── InfoGrid — 2 rows × 3 columns, light typography ──────────────────────────
function InfoGrid({ fields, labelColor = C.textTiny, valueColor = C.textSub }) {
  const slots = [...fields];
  while (slots.length < 6) slots.push({ label: "", value: "" });
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "9px 10px",
    }}>
      {slots.slice(0, 6).map(({ label, value }, i) => (
        <div key={i}>
          {label && (
            <>
              <div style={{
                fontFamily:    "'Montserrat',sans-serif",
                fontSize:      12,
                fontWeight:    600,
                color:         labelColor,
                letterSpacing: 1.3,
                textTransform: "uppercase",
                marginBottom:  3,
              }}>{label}</div>
              <div style={{
                fontFamily: "'Montserrat',sans-serif",
                fontSize:   12,
                fontWeight: 500,
                color:      valueColor,
                lineHeight: 1.3,
              }}>{value || "—"}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}


// ── Full Reservation Detail Modal ────────────────────────────────────────────
function ReservationDetailModal({ res, onClose }) {
  if (!res) return null;

  const statusColor = () => {
    const s = (res.status || res.reservationStatus || res.reservation_status || "").toLowerCase();
    if (s === "reserved" || s === "approved" || s === "confirmed") return C.green;
    if (s === "done") return C.blue;
    return C.textMuted;
  };

  const statusLabel = () => {
    const s = (res.status || res.reservationStatus || res.reservation_status || "").toLowerCase();
    if (s === "reserved") return "Reserved";
    if (s === "approved") return "Approved";
    if (s === "confirmed") return "Confirmed";
    if (s === "done") return "Done";
    return s || "—";
  };

  const sections = [
    {
      title: "Guest Information",
      rows: [
        { icon: <Users size={13} color={C.gold} />,       label: "Guest Name",        value: res.guest_name || res.name || "—" },
        { icon: <Mail size={13} color={C.gold} />,        label: "Email",             value: res.email || res.guest_email || "—" },
        { icon: <Phone size={13} color={C.gold} />,       label: "Phone",             value: res.phone || res.contact || res.guest_phone || "—" },
        { icon: <Users size={13} color={C.gold} />,       label: "Guests",            value: (res.guests_count ?? res.guests_number ?? res.guests) ? `${res.guests_count ?? res.guests_number ?? res.guests} Pax` : "1 Pax" },
      ],
    },
    {
      title: "Reservation Details",
      rows: [
        { icon: <Hash size={13} color={C.gold} />,        label: "Reference",         value: res.reference_code || res.ref_code || res.id || "—" },
        { icon: <MapPin size={13} color={C.gold} />,      label: "Venue",             value: res.room || res.venue || "—" },
        { icon: <FileText size={13} color={C.gold} />,    label: "Table",             value: res.table_number ?? res.table ?? "—" },
        { icon: <FileText size={13} color={C.gold} />,    label: "Seat",              value: res.seat_number ?? res.seat ?? "—" },
        { icon: <CalendarDays size={13} color={C.gold} />,label: "Event Date",        value: res.event_date || res.eventDate || res.reservationDate ? (() => { const d = new Date(res.event_date || res.eventDate || res.reservationDate); return isNaN(d) ? String(res.event_date || res.eventDate || res.reservationDate) : d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }); })() : "—" },
        { icon: <Clock size={13} color={C.gold} />,       label: "Event Time",        value: (() => { const t = res.event_time || res.eventTime || res.reservationTime; if (!t) return "—"; const m24 = t.match(/^(\d{1,2}):(\d{2})$/); if (m24) { const h = +m24[1]; return `${((h+11)%12)+1}:${m24[2]} ${h>=12?"PM":"AM"}`; } return t; })() },
      ],
    },
    {
      title: "Additional Info",
      rows: [
        { icon: <FileText size={13} color={C.gold} />,    label: "Special Requests",  value: res.special_requests || res.notes || res.remarks || "None" },
        { icon: <CheckCircle size={13} color={C.gold} />, label: "Status",            value: statusLabel() },
      ],
    },
  ];

  return (
    <div style={{
      position:        "fixed",
      inset:           0,
      zIndex:          10000,
      background:      "rgba(27,42,74,0.45)",
      backdropFilter:  "blur(4px)",
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      padding:         20,
      animation:       "fadeUp .2s ease",
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background:   C.surface,
        borderRadius: 16,
        width:        "100%",
        maxWidth:     520,
        maxHeight:    "85vh",
        overflow:     "hidden",
        display:      "flex",
        flexDirection:"column",
        boxShadow:    "0 24px 64px rgba(27,42,74,.22), 0 4px 20px rgba(0,0,0,.08)",
        animation:    "popupIn .3s cubic-bezier(.34,1.5,.64,1)",
      }}>
        {/* Modal header */}
        <div style={{
          padding:         "18px 20px 16px",
          borderBottom:    `1px solid ${C.borderLight}`,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "space-between",
          flexShrink:      0,
          background:      C.surface,
        }}>
          <div>
            <div style={{
              fontFamily:    "'Cinzel',serif",
              fontWeight:    600,
              fontSize:      14,
              color:         C.navy,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}>Reservation Details</div>
            <div style={{
              fontFamily: "'Montserrat',sans-serif",
              fontSize:   14,
              fontWeight: 400,
              color:      C.textMuted,
              marginTop:  2,
            }}>{res.guest_name || res.name || "Guest"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background:   `${statusColor()}18`,
              border:       `1px solid ${statusColor()}40`,
              borderRadius: 20,
              padding:      "3px 12px",
              fontFamily:   "'Montserrat',sans-serif",
              fontSize:     14,
              fontWeight:   600,
              color:        statusColor(),
            }}>{statusLabel()}</div>
            <button
              onClick={onClose}
              style={{
                width:         30,
                height:        30,
                borderRadius:  "50%",
                background:    C.bg,
                border:        `1px solid ${C.border}`,
                display:       "flex",
                alignItems:    "center",
                justifyContent:"center",
                cursor:        "pointer",
                flexShrink:    0,
                transition:    "background .15s",
              }}
              onMouseOver={e => e.currentTarget.style.background = C.borderLight}
              onMouseOut={e  => e.currentTarget.style.background = C.bg}
            >
              <X size={14} color={C.textMuted} />
            </button>
          </div>
        </div>

        {/* Modal body — scrollable */}
        <div style={{
          flex:      1,
          overflowY: "auto",
          padding:   "16px 20px 20px",
        }}>
          {sections.map(({ title, rows }) => (
            <div key={title} style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily:    "'Montserrat',sans-serif",
                fontSize:      14,
                fontWeight:    700,
                color:         C.gold,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                marginBottom:  10,
                paddingBottom: 6,
                borderBottom:  `1px solid ${C.borderLight}`,
              }}>{title}</div>

              {rows.map(({ icon, label, value }) => (
                <div key={label} style={{
                  display:       "flex",
                  alignItems:    "flex-start",
                  gap:           10,
                  marginBottom:  8,
                }}>
                  <div style={{
                    width:          28,
                    height:         28,
                    borderRadius:   8,
                    background:     "rgba(201,168,76,0.08)",
                    border:         "1px solid rgba(201,168,76,0.18)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    flexShrink:     0,
                    marginTop:      1,
                  }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily:    "'Montserrat',sans-serif",
                      fontSize:      14,
                      fontWeight:    600,
                      color:         C.textTiny,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      marginBottom:  2,
                    }}>{label}</div>
                    <div style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontSize:   14,
                      fontWeight: 500,
                      color:      C.textSub,
                      lineHeight: 1.4,
                    }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding:      "12px 20px",
          borderTop:    `1px solid ${C.borderLight}`,
          flexShrink:   0,
          display:      "flex",
          justifyContent:"flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding:      "8px 22px",
              background:   C.navy,
              color:        "#fff",
              border:       "none",
              borderRadius: 8,
              fontFamily:   "'Montserrat',sans-serif",
              fontSize:     14,
              fontWeight:   600,
              cursor:       "pointer",
              transition:   "opacity .15s",
            }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
            onMouseOut={e  => e.currentTarget.style.opacity = "1"}
          >Close</button>
        </div>
      </div>
    </div>
  );
}

// ── 1-Hour Reminder Popup ────────────────────────────────────────────────────
function ReminderPopup({ popup, onView, onClose, queueCount = 1 }) {
  const d = popup.eventDate ? new Date(popup.eventDate) : null;
  const dStr = d && !isNaN(d)
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : popup.eventDate || "";
  const t = popup.eventTime || "";
  const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
  const timeStr = m24
    ? `${((+m24[1]+11)%12)+1}:${m24[2]} ${+m24[1]>=12?"PM":"AM"}`
    : t;

  return (
    <div style={{
      position:  "fixed",
      top:       66,
      right:     18,
      zIndex:    9999,
      width:     popup.multiple ? 320 : 280,
      animation: "popupIn .35s cubic-bezier(.34,1.5,.64,1)",
      fontFamily:"-apple-system,'Montserrat',sans-serif",
    }}>
      <div style={{
        position:       "absolute",
        top:            -26,
        left:           12,
        width:          52,
        height:         52,
        borderRadius:   "50%",
        background:     "#FFFFFF",
        border:         "1.5px solid #E5E5E5",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        zIndex:         3,
        boxShadow:      "0 2px 8px rgba(0,0,0,0.08)",
        animation:      "bellRing .55s ease .1s 4",
      }}>
        <BellDot size={24} color="#1A1F2E" strokeWidth={1.8} />
      </div>

      <div style={{
        background:   "#FFFFFF",
        borderRadius: "28px 12px 12px 12px",
        overflow:     "hidden",
        boxShadow:    "0 8px 36px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)",
        position:     "relative",
        zIndex:       2,
      }}>
        <div style={{ padding: "20px 20px 16px 20px" }}>
          <div style={{ height: 16 }} />
          <div style={{
            fontWeight:   700,
            fontSize:     18,
            color:        "#111827",
            textAlign:    "center",
            marginBottom: 12,
          }}>
            {popup.multiple ? `${popup.count} Reminders!` : "Reminder!"}
          </div>
          {queueCount > 1 && (
            <div style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            5,
              background:     "#FEF3C7",
              border:         "1px solid #F59E0B",
              borderRadius:   20,
              padding:        "3px 10px",
              fontFamily:     "'Montserrat',sans-serif",
              fontWeight:     600,
              fontSize:       12,
              color:          "#92400E",
              marginBottom:   8,
            }}>
              <Bell size={11} color="#92400E" />
              {queueCount} reminders queued
            </div>
          )}
          <div style={{
            fontWeight:   700,
            fontSize:     14,
            color:        "#111827",
            marginBottom: 6,
          }}>1 HOUR TO GO</div>
          
          {/* Show multiple reservations or single */}
          {popup.multiple ? (
            <div>
              {popup.allReservations.map((res, index) => (
                <div key={index} style={{ 
                  marginBottom: index < popup.allReservations.length - 1 ? 8 : 0,
                  paddingBottom: index < popup.allReservations.length - 1 ? 8 : 0,
                  borderBottom: index < popup.allReservations.length - 1 ? "1px solid #F0F0F0" : "none"
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 2 }}>
                    {res.guest_name || res.name || "Guest"}
                  </div>
                  <div style={{ fontWeight: 400, fontSize: 12, color: "#6B7280" }}>
                    {res.event_date ? new Date(res.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""} | {res.event_time || ""}
                  </div>
                  <div style={{ fontWeight: 400, fontSize: 12, color: "#6B7280" }}>
                    {res.room || res.venue || "-"}
                  </div>
                </div>
              ))}
              {popup.count > 3 && (
                <div style={{ 
                  textAlign: "center", 
                  fontSize: 12, 
                  color: "#9CA3AF", 
                  fontWeight: 600,
                  marginTop: 8 
                }}>
                  ...and {popup.count - 3} more
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 400, fontSize: 14, color: "#6B7280", marginBottom: 3 }}>
                Guest: {popup.name}
              </div>
              <div style={{ fontWeight: 400, fontSize: 14, color: "#6B7280", marginBottom: 3 }}>
                {dStr} | {timeStr}
              </div>
              <div style={{ fontWeight: 400, fontSize: 14, color: "#6B7280" }}>
                {popup.room}
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 1, background: "#F0F0F0" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <button
            onClick={() => onView(popup)}
            style={{
              padding:    "14px 0",
              background: "none",
              border:     "none",
              borderRight:"1px solid #F0F0F0",
              fontFamily: "-apple-system,'Montserrat',sans-serif",
              fontWeight: 600,
              fontSize:   15,
              color:      "#2E9B6A",
              cursor:     "pointer",
              transition: "background .15s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "#EAF7F1"}
            onMouseOut={e  => e.currentTarget.style.background = "none"}
          >View</button>
          <button
            onClick={onClose}
            style={{
              padding:    "14px 0",
              background: "none",
              border:     "none",
              fontFamily: "-apple-system,'Montserrat',sans-serif",
              fontWeight: 600,
              fontSize:   15,
              color:      "#D94A4A",
              cursor:     "pointer",
              transition: "background .15s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "#FEF0F0"}
            onMouseOut={e  => e.currentTarget.style.background = "none"}
          >Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Card fields ───────────────────────────────────────────────────────────────
function cardFields(res) {
  return [
    { label: "Venue", value: res.room || res.venue },
    { label: "Table", value: res.table_number ?? res.table },
    { label: "Seat",  value: res.seat_number  ?? res.seat  },
    { label: "Date",  value: fmtDate(res.event_date  || res.eventDate  || res.reservationDate) },
    { label: "Guest", value: (res.guests_count ?? res.guests)
                               ? `${res.guests_count ?? res.guests} Pax`
                               : "1 Pax" },
    { label: "Time",  value: fmtTime(res.event_time  || res.eventTime  || res.reservationTime) },
  ];
}

// ── Left card (white — upcoming) ──────────────────────────────────────────────
function NewResCard({ res, isNew }) {
  const [popupQueue, setPopupQueue] = useState([]);
  const popup = popupQueue[0] ?? null;   // always show the head of the queue
  const [hi, setHi] = useState(isNew);
  useEffect(() => {
    if (isNew) { const t = setTimeout(() => setHi(false), 4000); return () => clearTimeout(t); }
  }, [isNew]);

  return (
    <div style={{
      background:   C.surface,
      border:       `1px solid ${hi ? C.blue : C.border}`,
      borderRadius: 10,
      padding:      "16px 18px",
      marginBottom: 9,
      boxShadow:    hi ? "0 4px 16px rgba(74,144,217,.12)" : `0 1px 4px ${C.shadow}`,
      transition:   "all .4s ease",
      animation:    isNew ? "cardSlideIn .4s cubic-bezier(.34,1.5,.64,1)" : "none",
    }}>
      <div style={{
        fontFamily:   "'Montserrat',sans-serif",
        fontWeight:   600,
        fontSize:     14,
        color:        C.navy,
        marginBottom: 10,
      }}>
        {res.guest_name || res.name || "Unknown Guest"}
      </div>
      <InfoGrid
        fields={cardFields(res)}
        labelColor={C.textTiny}
        valueColor={C.textSub}
      />
    </div>
  );
}

// ── Right card (green — done / past) ─────────────────────────────────────────
function DoneCard({ res }) {
  return (
    <div style={{
      background:   C.greenPastel,
      border:       `1px solid ${C.greenBorder}`,
      borderRadius: 10,
      padding:      "16px 18px",
      marginBottom: 8,
      boxShadow:    `0 1px 4px ${C.shadow}`,
    }}>
      <div style={{
        fontFamily:   "'Montserrat',sans-serif",
        fontWeight:   600,
        fontSize:     11,
        color:        C.navy,
        marginBottom: 10,
      }}>
        {res.guest_name || res.name || "Unknown Guest"}
      </div>
      <InfoGrid
        fields={cardFields(res)}
        labelColor="#7A9A8A"
        valueColor="#2D4A3E"
      />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ msg }) {
  return (
    <div style={{
      textAlign:  "center",
      padding:    "50px 20px",
      fontFamily: "'Montserrat',sans-serif",
      fontSize:   14,
      color:      C.textLight,
    }}>{msg}</div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const POLL_MS = 15000;

export default function NotificationDashboard() {
  const [approvedCards, setApprovedCards] = useState([]);
  const [popupQueue, setPopupQueue] = useState([]);
const popup = popupQueue[0] ?? null;   // always show the head of the queue
  const [detailRes,     setDetailRes]     = useState(null);
  const [newIds,        setNewIds]        = useState(new Set());
  const [clock,         setClock]         = useState(clockStr());
  const [date,          setDate]          = useState(dateStr());
  const [loading,       setLoading]       = useState(true);
  const [countdown,     setCountdown]     = useState(POLL_MS / 1000);

  const knownApprovedIds = useRef(new Set());
  const firedAlerts      = useRef(new Set());
  const timerRef         = useRef(null);
  const leftRef          = useRef(null);

  // Helper: dismiss head of queue (used in both onView and onClose)
  const dismissPopup = useCallback(() => {
    setPopupQueue(q => q.slice(1));
    if (popupQueue.length <= 1) stopAlertSound(); // stop sound only when queue empties
  }, [popupQueue.length]);

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => { setClock(clockStr()); setDate(dateStr()); }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Countdown to next poll ─────────────────────────────────────────────────
  const resetCd = useCallback(() => {
    setCountdown(POLL_MS / 1000);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setCountdown(c => (c <= 1 ? POLL_MS / 1000 : c - 1)), 1000,
    );
  }, []);
  useEffect(() => { resetCd(); return () => clearInterval(timerRef.current); }, [resetCd]);

  // ── 1-hour alert check ─────────────────────────────────────────────────────
  const checkAlerts = useCallback((list) => {
    const candidates = list
      .map(res => {
        const id  = res.id ?? res.db_id;
        const key = `${id}-1h`;
        if (firedAlerts.current.has(key)) return null;
        const dt = parseEventDate(
          res.event_date || res.eventDate || res.reservationDate,
          res.event_time || res.eventTime || res.reservationTime,
        );
        if (!dt) return null;
        const diff = dt.getTime() - Date.now();
        if (diff > 0 && diff <= 2 * 3600000) return { res, id, key, diff };
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.diff - b.diff);

    if (candidates.length === 0) return;

    // Mark all as fired immediately so re-polls don't re-queue them
    candidates.forEach(({ key }) => firedAlerts.current.add(key));

    // Push all into the queue
    setPopupQueue(q => [
      ...q,
      ...candidates.map(({ res, id }) => ({
        id,
        name:      res.guest_name || res.name || "Guest",
        room:      res.room || res.venue || "-",
        eventDate: res.event_date  || res.eventDate  || res.reservationDate,
        eventTime: res.event_time  || res.eventTime  || res.reservationTime,
      })),
    ]);

    playAlertSound();
    // Announce the count if more than one
    const first = candidates[0].res;
    if (candidates.length === 1) {
      speakText(
        `Reminder. 1 hour to go. ` +
        `${first.guest_name || first.name || "A guest"}'s reservation ` +
        `at ${first.room || first.venue || "the venue"} starts in 1 hour.`,
      );
    } else {
      speakText(`Reminder. ${candidates.length} reservations are starting in 1 hour.`);
    }
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (isInit = false) => {
    try {
      const resp = await reservationAPI.getAll();
      const raw  = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : [];

      const approved = raw
        .filter(isApproved)
        .sort((a, b) =>
          (b.submittedTimestamp || +new Date(b.created_at) || 0) -
          (a.submittedTimestamp || +new Date(a.created_at) || 0)
        );

      const freshIds = new Set();
      approved.forEach(res => {
        const id = res.id ?? res.db_id;
        if (!knownApprovedIds.current.has(id)) {
          knownApprovedIds.current.add(id);
          if (!isInit) freshIds.add(id);
        }
      });

      setApprovedCards(approved);

      if (!isInit && freshIds.size > 0) {
        setNewIds(freshIds);
        playNewSound();
        const first = approved.find(r => freshIds.has(r.id ?? r.db_id));
        if (first)
          speakText(`New approved reservation from ${first.guest_name || first.name || "a guest"}.`);
        setTimeout(() => setNewIds(new Set()), 4000);
        if (leftRef.current) leftRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }

      checkAlerts(approved);
      resetCd();
    } catch (e) {
      console.error("[NotifDashboard]", e);
    } finally {
      setLoading(false);
    }
  }, [checkAlerts, resetCd]);

  useEffect(() => {
    fetchData(true);
    const t = setInterval(() => fetchData(false), POLL_MS);
    return () => clearInterval(t);
  }, [fetchData]);

  // ── Split into pending (upcoming) and done (past event date) ───────────────
  const now = new Date();

  const pendingCards = approvedCards.filter(res => {
    const dt = parseEventDate(
      res.event_date || res.eventDate || res.reservationDate,
      res.event_time || res.eventTime || res.reservationTime,
    );
    // No parseable date → treat as upcoming (keep in left column)
    return !dt || dt.getTime() > now.getTime();
  });

  const doneCards = approvedCards.filter(res => {
    const dt = parseEventDate(
      res.event_date || res.eventDate || res.reservationDate,
      res.event_time || res.eventTime || res.reservationTime,
    );
    // Has a date AND it's in the past → move to Done
    return dt && dt.getTime() <= now.getTime();
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily:    "'Montserrat',sans-serif",
      background:    C.bg,
      height:        "100vh",
      display:       "flex",
      flexDirection: "column",
      overflow:      "hidden",
      color:         C.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
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
          25%     { transform:rotate(-20deg); }
          75%     { transform:rotate(20deg); }
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.3; transform:scale(1.8); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(5px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>

      {/* ═══════════════════════════════ HEADER ══════════════════════════════ */}
      <header style={{
        height:       64,
        background:   C.surface,
        borderBottom: `1px solid ${C.border}`,
        display:      "flex",
        alignItems:   "center",
        padding:      "0 26px",
        flexShrink:   0,
        boxShadow:    `0 1px 8px ${C.shadow}`,
        gap:          16,
      }}>
        {/* Logo */}
        <img
          src={bellevueLogo}
          alt="The Bellevue Manila"
          style={{ height: 40, width: "auto", objectFit: "contain", flexShrink: 0 }}
          onError={e => { e.currentTarget.style.display = "none"; }}
        />

        <div style={{ width: 1, height: 28, background: C.border }} />

        {/* Title */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily:    "'Cinzel',serif",
            fontWeight:    600,
            fontSize:      15,
            color:         C.gold,
            letterSpacing: 1.8,
            textTransform: "uppercase",
          }}>
            Notification Monitor
          </div>
          
        </div>

        {/* Bell icon */}
        <div style={{
          width:         40,
          height:        40,
          borderRadius:  "50%",
          background:    popup ? C.navy : "#F0EBE1",
          border:        `1.5px solid ${popup ? C.gold : C.border}`,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          flexShrink:    0,
          transition:    "all .2s",
          animation:     popup ? "bellRing .6s ease infinite" : "none",
          cursor:        "default",
          position:      "relative",
        }}>
          {popup
            ? <BellDot size={18} color={C.gold} />
            : <Bell    size={18} color={C.gold} />
          }
          {popup && (
            <div style={{
              position:     "absolute",
              top:          4,
              right:        4,
              width:        8,
              height:       8,
              borderRadius: "50%",
              background:   C.red,
              border:       "1.5px solid #fff",
              animation:    "dotPulse 1.2s ease infinite",
            }} />
          )}
        </div>

        <div style={{ width: 1, height: 28, background: C.border }} />

        {/* Clock */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontFamily:    "'Montserrat',sans-serif",
            fontWeight:    600,
            fontSize:      17,
            color:         C.navy,
            letterSpacing: 0.3,
            lineHeight:    1.15,
          }}>{clock}</div>
          <div style={{
            fontFamily:    "'Montserrat',sans-serif",
            fontSize:      14,
            fontWeight:    400,
            color:         C.textLight,
            letterSpacing: 0.8,
            marginTop:     2,
          }}>{date}</div>
        </div>
      </header>

      {/* ═══════════════════════════════ LOADING ═════════════════════════════ */}
      {loading && (
        <div style={{
          flex:           1,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexDirection:  "column",
          gap:            12,
        }}>
          <div style={{
            width:          32,
            height:         32,
            border:         `2px solid ${C.border}`,
            borderTopColor: C.gold,
            borderRadius:   "50%",
            animation:      "spin .8s linear infinite",
          }} />
          <div style={{
            fontFamily: "'Montserrat',sans-serif",
            fontSize:   14,
            fontWeight: 400,
            color:      C.textMuted,
          }}>Loading notifications…</div>
        </div>
      )}

      {/* ═══════════════════════════════ TWO COLUMNS ═════════════════════════ */}
      {!loading && (
        <div style={{
          flex:                1,
          display:             "grid",
          gridTemplateColumns: "3.5fr 1.5fr",
          rowGap:             0,
          columnGap:           24,
          padding:             "16px 22px",
          minHeight:           0,
          animation:           "fadeUp .3s ease",
        }}>

          {/* ── LEFT — New / Upcoming Reservations ────────────────────────── */}
          <div style={{
            background:    C.surface,
            border:        `1px solid ${C.border}`,
            borderRadius:  12,
            overflow:      "hidden",
            boxShadow:     `0 2px 12px ${C.shadow}`,
            display:       "flex",
            flexDirection: "column",
            minHeight:     0,
          }}>
            <div style={{
              background:    C.bluePastel,
              borderBottom:  `1px solid ${C.blueBorder}`,
              padding:       "12px 16px",
              flexShrink:    0,
              display:       "flex",
              alignItems:    "center",
              justifyContent:"space-between",
            }}>
              <span style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 600,
                fontSize:   14,
                color:      C.navy,
              }}>New Reservation</span>
              <span style={{
                background:   C.blue,
                color:        "#fff",
                borderRadius: 20,
                padding:      "2px 12px",
                fontFamily:   "'Montserrat',sans-serif",
                fontSize:     14,
                fontWeight:   600,
              }}>{pendingCards.length}</span>
            </div>

            <div
              ref={leftRef}
              style={{ flex: 1, overflowY: "auto", padding: "10px 12px", minHeight: 0 }}
            >
              {pendingCards.length === 0
                ? <EmptyState msg="No upcoming reservations" />
                : pendingCards.map(res => (
                    <NewResCard
                      key={res.id ?? res.db_id}
                      res={res}
                      isNew={newIds.has(res.id ?? res.db_id)}
                    />
                  ))
              }
            </div>
          </div>

          {/* ── RIGHT — Done (past event date/time) ───────────────────────── */}
          <div style={{
            background:    C.surface,
            border:        `1px solid ${C.border}`,
            borderRadius:  12,
            overflow:      "hidden",
            boxShadow:     `0 2px 12px ${C.shadow}`,
            display:       "flex",
            flexDirection: "column",
            minHeight:     0,
          }}>
            <div style={{
              background:    C.greenPastel,
              borderBottom:  `1px solid ${C.greenBorder}`,
              padding:       "12px 16px",
              flexShrink:    0,
              display:       "flex",
              alignItems:    "center",
              justifyContent:"space-between",
            }}>
              <span style={{
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 600,
                fontSize:   14,
                color:      C.navy,
              }}>Done</span>
              <span style={{
                background:   C.green,
                color:        "#fff",
                borderRadius: 20,
                padding:      "2px 12px",
                fontFamily:   "'Montserrat',sans-serif",
                fontSize:     14,
                fontWeight:   600,
              }}>{doneCards.length}</span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", minHeight: 0 }}>
              {doneCards.length === 0
                ? <EmptyState msg="No completed reservations" />
                : doneCards.map(res => (
                    <DoneCard key={`done-${res.id ?? res.db_id}`} res={res} />
                  ))
              }
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════ POPUP ═══════════════════════════════ */}
      {popup && (
        <ReminderPopup
          popup={popup}
          queueCount={popupQueue.length}
          onView={(p) => {
            const full = approvedCards.find(r => (r.id ?? r.db_id) === p.id) || p;
            setDetailRes(full);
            dismissPopup();
          }}
          onClose={dismissPopup}
        />
      )}

      {/* ═══════════════════════════════ DETAIL MODAL ════════════════════════ */}
      {detailRes && (
        <ReservationDetailModal
          res={detailRes}
          onClose={() => setDetailRes(null)}
        />
      )}

    </div>
  );
}