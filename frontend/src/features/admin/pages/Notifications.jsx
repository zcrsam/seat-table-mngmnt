// src/features/admin/pages/NotificationDashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// BELLEVUE · NOTIFICATION MONITOR
// - Header title: Cinzel font  |  Body: Montserrat
// - Lucide icons throughout
// - Left & Right panels independently scrollable (page itself fixed/no-scroll)
// - Done panel = APPROVED reservations only
// - Cards: data in 2 rows
// - 1-hour popup visible, with Web Audio alert + TTS voice
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, BellRing, Clock, X, Eye, CheckCircle, CalendarDays, Users } from "lucide-react";
import { reservationAPI } from "../../../services/reservationAPI";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          "#F7F4EF",
  surface:     "#FFFFFF",
  gold:        "#C9A84C",
  goldLight:   "rgba(201,168,76,0.10)",
  goldMid:     "rgba(201,168,76,0.20)",
  goldBorder:  "rgba(201,168,76,0.35)",
  goldDark:    "#A8892E",
  navy:        "#1B2A4A",
  navyLight:   "rgba(27,42,74,0.06)",
  blue:        "#4A90D9",
  bluePastel:  "#EBF3FC",
  blueBorder:  "rgba(74,144,217,0.28)",
  green:       "#2E9B6A",
  greenPastel: "#EAF7F1",
  greenBorder: "rgba(46,155,106,0.28)",
  red:         "#D94A4A",
  redPastel:   "#FEF0F0",
  redBorder:   "rgba(217,74,74,0.25)",
  text:        "#1A1F2E",
  textMuted:   "#6B7280",
  textLight:   "#9CA3AF",
  textTiny:    "#B8C0CC",
  border:      "#E2D9C8",
  borderLight: "#EDE7D9",
  shadow:      "rgba(27,42,74,0.07)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseEventDate(dateStr, timeStr) {
  if (!dateStr) return null;
  let base = new Date(dateStr);
  if (isNaN(base)) return null;
  if (timeStr) {
    const m24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    const m12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m24) {
      base.setHours(+m24[1], +m24[2], 0, 0);
    } else if (m12) {
      let h = +m12[1];
      const m = +m12[2];
      const ap = m12[3].toUpperCase();
      if (ap === "PM" && h !== 12) h += 12;
      if (ap === "AM" && h === 12) h = 0;
      base.setHours(h, m, 0, 0);
    }
  }
  return base;
}

function fmtTime(t) {
  if (!t) return "—";
  const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = +m24[1];
    const ap = h >= 12 ? "PM" : "AM";
    return `${((h + 11) % 12) + 1}:${m24[2]} ${ap}`;
  }
  return t;
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt)
    ? String(d)
    : dt.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
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

// ── Sounds ────────────────────────────────────────────────────────────────────
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [
      { f: 880, d: 0.12 }, { f: 880, d: 0.12 },
      { f: 880, d: 0.12 }, { f: 1100, d: 0.24 },
    ].reduce((t, { f, d }) => {
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

function playNewSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [{ f: 523, d: 0.1 }, { f: 659, d: 0.1 }, { f: 784, d: 0.18 }].reduce((t, { f, d }) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.15, t);
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
  const eng = window.speechSynthesis.getVoices()
    .find(v => v.lang.startsWith("en") && /female|zira|samantha/i.test(v.name))
    || window.speechSynthesis.getVoices().find(v => v.lang.startsWith("en"))
    || null;
  if (eng) u.voice = eng;
  setTimeout(() => window.speechSynthesis.speak(u), 500);
}

// ── Bellevue Logo (inline SVG, no external dependency) ───────────────────────
function BellevueLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <svg viewBox="0 0 44 44" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="20.5" fill="none" stroke="#C9A84C" strokeWidth="0.7" strokeDasharray="2.5 2"/>
        <circle cx="22" cy="22" r="17" fill="#1B2A4A"/>
        <text x="22" y="30" textAnchor="middle"
          fontFamily="'Cinzel','Times New Roman',serif"
          fontSize="22" fontWeight="700" fill="#C9A84C">B</text>
      </svg>
      <div>
        <div style={{
          fontFamily: "'Cinzel','Times New Roman',serif",
          fontWeight: 700, fontSize: 14,
          color: C.navy, letterSpacing: 1, lineHeight: 1.1,
        }}>THE BELLEVUE</div>
        <div style={{
          fontFamily: "'Montserrat','Inter',sans-serif",
          fontWeight: 700, fontSize: 7.5,
          color: C.gold, letterSpacing: 3.5,
        }}>MANILA</div>
      </div>
    </div>
  );
}

// ── InfoRow helper (2 rows of fields) ─────────────────────────────────────────
function InfoGrid({ fields, labelColor = C.textTiny }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      rowGap: 8,
      columnGap: 10,
    }}>
      {fields.map(({ label, value }) => (
        <div key={label}>
          <div style={{
            fontFamily: "'Montserrat','Inter',sans-serif",
            fontSize: 7, fontWeight: 700,
            color: labelColor,
            letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 2,
          }}>{label}</div>
          <div style={{
            fontFamily: "'Montserrat','Inter',sans-serif",
            fontSize: 11, fontWeight: 700, color: C.text,
          }}>{value || "—"}</div>
        </div>
      ))}
    </div>
  );
}

// ── 1-Hour Reminder Popup ─────────────────────────────────────────────────────
function ReminderPopup({ popup, onView, onClose }) {
  return (
    <div style={{
      position: "fixed",
      top: 72, right: 22,
      zIndex: 9999,
      background: C.surface,
      border: `1.5px solid ${C.border}`,
      borderTop: `3px solid ${C.red}`,
      borderRadius: 14,
      boxShadow: `0 18px 52px rgba(27,42,74,0.22), 0 4px 16px rgba(0,0,0,0.07)`,
      width: 305,
      overflow: "hidden",
      animation: "popupIn 0.35s cubic-bezier(0.34,1.5,0.64,1)",
      fontFamily: "'Montserrat','Inter',sans-serif",
    }}>
      {/* Header row */}
      <div style={{
        padding: "12px 14px 10px",
        borderBottom: `1px solid ${C.borderLight}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: C.redPastel,
          border: `1.5px solid ${C.redBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          animation: "bellRing 0.55s ease 0.2s 4",
        }}>
          <BellRing size={16} color={C.red} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>Reminder!</div>
      </div>

      {/* Body */}
      <div style={{ padding: "13px 15px" }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: C.redPastel,
          border: `1px solid ${C.redBorder}`,
          borderRadius: 6, padding: "4px 10px",
          marginBottom: 13,
        }}>
          <Clock size={10} color={C.red} />
          <span style={{
            fontWeight: 800, fontSize: 9,
            color: C.red, letterSpacing: 1.5, textTransform: "uppercase",
          }}>1 HOUR TO GO</span>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          Guest: {popup.name}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 11, color: C.textMuted, marginBottom: 3,
        }}>
          <CalendarDays size={11} color={C.textMuted} />
          {fmtDate(popup.eventDate)} | {fmtTime(popup.eventTime)}
        </div>
        <div style={{
          fontSize: 11, color: C.textMuted, fontWeight: 500,
          paddingLeft: 16,
        }}>
          {popup.room}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        borderTop: `1px solid ${C.borderLight}`,
      }}>
        <button
          onClick={() => onView(popup)}
          style={{
            padding: "10px 0", background: "none", border: "none",
            borderRight: `1px solid ${C.borderLight}`,
            fontFamily: "'Montserrat','Inter',sans-serif",
            fontWeight: 700, fontSize: 12, color: C.green, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "background 0.15s",
          }}
          onMouseOver={e => e.currentTarget.style.background = C.greenPastel}
          onMouseOut={e => e.currentTarget.style.background = "none"}
        >
          <Eye size={13} /> View
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "10px 0", background: "none", border: "none",
            fontFamily: "'Montserrat','Inter',sans-serif",
            fontWeight: 700, fontSize: 12, color: C.red, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "background 0.15s",
          }}
          onMouseOver={e => e.currentTarget.style.background = C.redPastel}
          onMouseOut={e => e.currentTarget.style.background = "none"}
        >
          <X size={13} /> Close
        </button>
      </div>
    </div>
  );
}

// ── New Reservation Card (Left) ───────────────────────────────────────────────
function NewResCard({ res, isNew }) {
  const [hi, setHi] = useState(isNew);
  useEffect(() => {
    if (isNew) { const t = setTimeout(() => setHi(false), 4000); return () => clearTimeout(t); }
  }, [isNew]);

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${hi ? C.blue : C.border}`,
      borderRadius: 12,
      padding: "14px 15px",
      marginBottom: 10,
      boxShadow: hi ? `0 4px 18px rgba(74,144,217,0.14)` : `0 2px 8px ${C.shadow}`,
      transition: "all 0.4s ease",
      animation: isNew ? "cardSlideIn 0.4s cubic-bezier(0.34,1.5,0.64,1)" : "none",
    }}>
      {/* Name */}
      <div style={{
        fontFamily: "'Montserrat','Inter',sans-serif",
        fontWeight: 800, fontSize: 14, color: C.navy, marginBottom: 11,
      }}>
        {res.name || res.guest_name || "Unknown Guest"}
      </div>

      {/* 2 rows of 3 columns */}
      <InfoGrid
        fields={[
          { label: "VENUE", value: res.room || res.venue },
          { label: "TABLE", value: res.table },
          { label: "SEAT",  value: res.seat },
          { label: "DATE",  value: fmtDate(res.eventDate || res.reservationDate) },
          { label: "GUEST", value: res.guests ? `${res.guests} Pax` : "1 Pax" },
          { label: "TIME",  value: fmtTime(res.eventTime || res.reservationTime) },
        ]}
        labelColor={C.textTiny}
      />
    </div>
  );
}

// ── Done Card (Right — approved only) ────────────────────────────────────────
function DoneCard({ res }) {
  return (
    <div style={{
      background: C.greenPastel,
      border: `1px solid ${C.greenBorder}`,
      borderRadius: 12,
      padding: "13px 15px",
      marginBottom: 9,
      boxShadow: `0 1px 6px ${C.shadow}`,
    }}>
      <div style={{
        fontFamily: "'Montserrat','Inter',sans-serif",
        fontWeight: 800, fontSize: 14, color: C.navy, marginBottom: 10,
      }}>
        {res.name || res.guest_name || "Unknown Guest"}
      </div>

      <InfoGrid
        fields={[
          { label: "VENUE", value: res.room || res.venue },
          { label: "TABLE", value: res.table },
          { label: "SEAT",  value: res.seat },
          { label: "DATE",  value: fmtDate(res.eventDate || res.reservationDate) },
          { label: "GUEST", value: res.guests ? `${res.guests} Pax` : "1 Pax" },
          { label: "TIME",  value: fmtTime(res.eventTime || res.reservationTime) },
        ]}
        labelColor="#5A7A6A"
      />
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const POLL_MS = 15000;

export default function NotificationDashboard() {
  const [newCards,  setNewCards]  = useState([]);
  const [doneCards, setDoneCards] = useState([]);
  const [popup,     setPopup]     = useState(null);
  const [newIds,    setNewIds]    = useState(new Set());
  const [clock,     setClock]     = useState(clockStr());
  const [date,      setDate]      = useState(dateStr());
  const [loading,   setLoading]   = useState(true);
  const [countdown, setCountdown] = useState(POLL_MS / 1000);

  const knownIds    = useRef(new Set());
  const firedAlerts = useRef(new Set());
  const timerRef    = useRef(null);
  const leftRef     = useRef(null);

  useEffect(() => {
    const t = setInterval(() => { setClock(clockStr()); setDate(dateStr()); }, 1000);
    return () => clearInterval(t);
  }, []);

  const resetCd = useCallback(() => {
    setCountdown(POLL_MS / 1000);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setCountdown(c => (c <= 1 ? POLL_MS / 1000 : c - 1)), 1000
    );
  }, []);
  useEffect(() => { resetCd(); return () => clearInterval(timerRef.current); }, [resetCd]);

  const checkAlerts = useCallback((raw, isInit) => {
    raw.forEach(res => {
      const id  = res.id ?? res.db_id;
      const key = `${id}-1h`;
      if (firedAlerts.current.has(key)) return;
      const dt   = parseEventDate(res.eventDate || res.reservationDate, res.eventTime || res.reservationTime);
      if (!dt) return;
      const diff = dt.getTime() - Date.now();
      if (diff > 0 && diff <= 2 * 3600000) {
        firedAlerts.current.add(key);
        if (!isInit) {
          setPopup({
            id,
            name:      res.name || res.guest_name || "Guest",
            room:      res.room || res.venue || "—",
            eventDate: res.eventDate || res.reservationDate,
            eventTime: res.eventTime || res.reservationTime,
          });
          playAlertSound();
          speakText(`Reminder. 1 hour to go. ${res.name || "A guest"}'s reservation at ${res.room || res.venue || "the venue"} starts in 1 hour.`);
        }
      }
    });
  }, []);

  const fetchData = useCallback(async (isInit = false) => {
    try {
      const resp = await reservationAPI.getAll();
      const raw  = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : [];

      // Sort newest first
      const sorted = [...raw].sort((a, b) => (b.submittedTimestamp || 0) - (a.submittedTimestamp || 0));

      // Filter for approved reservations only
      const approved = sorted.filter(r => {
        const s = (r.status || r.reservationStatus || "").toLowerCase();
        return s === "approved" || s === "confirmed" || s === "done";
      });

      const freshIds = new Set();
      raw.forEach(res => {
        const id = res.id ?? res.db_id;
        if (!knownIds.current.has(id)) {
          knownIds.current.add(id);
          if (!isInit) freshIds.add(id);
        }
      });

      setNewCards(approved);  // Only approved reservations in New Reservation panel
      setDoneCards(approved);  // Same approved reservations in Done panel

      if (!isInit && freshIds.size > 0) {
        setNewIds(freshIds);
        playNewSound();
        const first = raw.find(r => freshIds.has(r.id ?? r.db_id));
        if (first) speakText(`New reservation from ${first.name || first.guest_name || "a guest"}.`);
        setTimeout(() => setNewIds(new Set()), 4000);
        if (leftRef.current) leftRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }

      checkAlerts(raw, isInit);
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

  return (
    <div style={{
      fontFamily: "'Montserrat','Inter',sans-serif",
      background: C.bg,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",   /* PAGE DOES NOT SCROLL */
      color: C.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }

        @keyframes cardSlideIn {
          from { opacity:0; transform:translateY(-10px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }
        @keyframes popupIn {
          from { opacity:0; transform:translateY(-12px) scale(0.95); }
          to   { opacity:1; transform:none; }
        }
        @keyframes bellRing {
          0%,100% { transform:rotate(0deg); }
          25%     { transform:rotate(-22deg); }
          75%     { transform:rotate(22deg); }
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.35; transform:scale(1.9); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        height: 64,
        background: C.surface,
        borderBottom: `1.5px solid ${C.border}`,
        display: "flex", alignItems: "center",
        padding: "0 26px",
        flexShrink: 0,
        boxShadow: `0 2px 12px ${C.shadow}`,
        gap: 16,
      }}>
        <BellevueLogo />

        <div style={{ width: 1, height: 30, background: C.border }} />

        {/* Title — Cinzel */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Cinzel','Times New Roman',serif",
            fontWeight: 700, fontSize: 16,
            color: C.navy, letterSpacing: 2, textTransform: "uppercase",
          }}>Notification Monitor</div>
          <div style={{
            fontFamily: "'Montserrat','Inter',sans-serif",
            fontSize: 8, fontWeight: 600,
            color: C.textLight, letterSpacing: 1.5, marginTop: 2,
          }}>LIVE · AUTO-REFRESH EVERY {POLL_MS / 1000}s · COUNTDOWN: {countdown}s</div>
        </div>

        {/* Live indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(46,155,106,0.08)",
          border: `1.5px solid rgba(46,155,106,0.22)`,
          borderRadius: 20, padding: "5px 12px",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: C.green,
            animation: "dotPulse 1.6s ease infinite",
          }} />
          <span style={{
            fontFamily: "'Montserrat','Inter',sans-serif",
            fontSize: 9, fontWeight: 800, color: C.green, letterSpacing: 1.5,
          }}>LIVE</span>
        </div>

        {/* Bell button */}
        <button style={{
          width: 40, height: 40, borderRadius: "50%",
          background: popup ? "#1B2A4A" : C.navyLight,
          border: `1.5px solid ${popup ? C.goldBorder : C.borderLight}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          transition: "all 0.2s",
          animation: popup ? "bellRing 0.55s ease infinite" : "none",
        }}>
          {popup
            ? <BellRing size={18} color={C.gold} />
            : <Bell size={18} color={C.textMuted} />
          }
        </button>

        <div style={{ width: 1, height: 30, background: C.border }} />

        {/* Clock — Cinzel */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Cinzel','Times New Roman',serif",
            fontWeight: 600, fontSize: 18,
            color: C.navy, letterSpacing: 0.5, lineHeight: 1.1,
          }}>{clock}</div>
          <div style={{
            fontFamily: "'Montserrat','Inter',sans-serif",
            fontSize: 8, fontWeight: 600,
            color: C.textLight, letterSpacing: 1, marginTop: 2,
          }}>{date}</div>
        </div>
      </header>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{
          flex: 1, display: "flex",
          alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 14,
        }}>
          <div style={{
            width: 36, height: 36,
            border: `3px solid ${C.border}`,
            borderTopColor: C.gold, borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{
            fontFamily: "'Montserrat','Inter',sans-serif",
            fontSize: 13, fontWeight: 600, color: C.textMuted,
          }}>Loading notifications…</div>
        </div>
      )}

      {/* ── TWO COLUMNS (both independently scrollable) ── */}
      {!loading && (
        <div style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          padding: "18px 22px",
          minHeight: 0,          /* KEY: allows children to scroll independently */
          animation: "fadeUp 0.35s ease",
        }}>

          {/* LEFT — New Reservations */}
          <div style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: `0 4px 18px ${C.shadow}`,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}>
            <div style={{
              background: C.bluePastel,
              borderBottom: `1.5px solid ${C.blueBorder}`,
              padding: "13px 16px",
              flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{
                fontFamily: "'Montserrat','Inter',sans-serif",
                fontWeight: 800, fontSize: 14, color: C.navy,
              }}>Approved Reservations</div>
              <div style={{
                background: C.blue, color: "#fff",
                borderRadius: 20, padding: "3px 14px",
                fontFamily: "'Montserrat','Inter',sans-serif",
                fontSize: 13, fontWeight: 800,
              }}>{newCards.length}</div>
            </div>

            {/* SCROLLABLE AREA */}
            <div
              ref={leftRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px",
                minHeight: 0,
              }}
            >
              {newCards.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "60px 20px",
                  fontFamily: "'Montserrat','Inter',sans-serif",
                  fontSize: 12, color: C.textLight, fontWeight: 500,
                }}>No reservations yet</div>
              ) : newCards.map(res => (
                <NewResCard
                  key={res.id ?? res.db_id}
                  res={res}
                  isNew={newIds.has(res.id ?? res.db_id)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — Done (approved only) */}
          <div style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: `0 4px 18px ${C.shadow}`,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}>
            <div style={{
              background: C.greenPastel,
              borderBottom: `1.5px solid ${C.greenBorder}`,
              padding: "13px 16px",
              flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{
                fontFamily: "'Montserrat','Inter',sans-serif",
                fontWeight: 800, fontSize: 14, color: C.navy,
              }}>Done</div>
              <div style={{
                background: C.green, color: "#fff",
                borderRadius: 20, padding: "3px 14px",
                fontFamily: "'Montserrat','Inter',sans-serif",
                fontSize: 13, fontWeight: 800,
              }}>{doneCards.length}</div>
            </div>

            {/* SCROLLABLE AREA */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px",
              minHeight: 0,
            }}>
              {doneCards.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "60px 20px",
                  fontFamily: "'Montserrat','Inter',sans-serif",
                  fontSize: 12, color: C.textLight, fontWeight: 500,
                }}>No approved reservations</div>
              ) : doneCards.map(res => (
                <DoneCard key={`done-${res.id ?? res.db_id}`} res={res} />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── REMINDER POPUP ── */}
      {popup && (
        <ReminderPopup
          popup={popup}
          onView={() => setPopup(null)}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}