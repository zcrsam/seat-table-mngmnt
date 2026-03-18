// src/pages/AlabangReserve.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainWingNavbar from "../components/MainWingNavbar";
import SeatMap, { STATUS_COLORS } from "../../../components/seatmap/SeatMap";
import {
  getRoomData,
  subscribeToSeatMapChanges,
  dispatchSeatMapUpdate,
} from "../../../utils/seatMapPersistence.js";
import Echo from '../../../utils/websocket.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const WING = "Main Wing";
const ROOM = "Alabang Function Room";

// ── Single font constant — Inter/sans-serif only ──────────────────────────────
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ─── Inline ChevronLeft SVG ───────────────────────────────────────────────────
function ChevronLeftIcon({ size = 18 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// ─── API helper ───────────────────────────────────────────────────────────────
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) {
    let msg = data?.message || `HTTP ${response.status}`;
    if (data?.errors) msg += "\n" + Object.values(data.errors).flat().join("\n");
    throw new Error(msg);
  }
  return data;
};

// ─── STYLES — all fontFamily values use FONT ──────────────────────────────────
const s = {
  root:            { fontFamily: FONT, background: "#F7F3EA", minHeight: "100vh", width: "100%", color: "#1B2A4A" },
  page:            { padding: "32px 40px", maxWidth: 1200, margin: "0 auto" },
  pageTitle:       { fontSize: 38, fontWeight: 700, fontFamily: FONT, color: "#1B2A4A", margin: 0, lineHeight: 1.1, letterSpacing: "-0.5px" },
  pageSubtitle:    { fontSize: 14, color: "#6b6256", fontFamily: FONT, marginTop: 6, marginBottom: 28, fontWeight: 400, maxWidth: 560, lineHeight: 1.5 },
  toggleBar:       { display: "flex", alignItems: "center", gap: 20, marginBottom: 28, flexWrap: "wrap" },
  toggleLabel:     { fontFamily: FONT, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, color: "#888", textTransform: "uppercase" },
  togglePillGroup: { display: "flex", alignItems: "center", background: "#E8E3DC", borderRadius: 24, padding: 3, gap: 2 },
  togglePillBtn:   (active) => ({ padding: "8px 22px", border: "none", background: active ? "#1B2A4A" : "transparent", color: active ? "#FFFFFF" : "#888", cursor: "pointer", fontSize: 11, letterSpacing: 1.5, fontWeight: 700, fontFamily: FONT, borderRadius: 20, transition: "all 0.18s", outline: "none", textTransform: "uppercase" }),
  layout:          { display: "flex", gap: 28, alignItems: "flex-start" },
  mapCard:         { flex: 1, minWidth: 320 },
  rightPanel:      { width: 260, display: "flex", flexDirection: "column", gap: 14, flexShrink: 0 },

  legendCard:  { background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  legendTitle: { fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 10, textTransform: "uppercase" },
  legendRow:   { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  legendDot:   (color) => ({ width: 13, height: 13, borderRadius: 3, background: color, flexShrink: 0 }),
  legendText:  { fontFamily: FONT, fontSize: 13, color: "#333", fontWeight: 500 },

  selCard:  { background: "#fff", borderRadius: 10, padding: "16px 18px", color: "#1B2A4A", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  selTitle: { fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 10, textTransform: "uppercase" },
  selRow:   { marginBottom: 6, display: "flex", alignItems: "baseline", gap: 4 },
  selLabel: { fontFamily: FONT, fontSize: 10, letterSpacing: 1.5, color: "#999", fontWeight: 700, textTransform: "uppercase", flexShrink: 0 },
  selVal:   { fontFamily: FONT, fontSize: 13, color: "#1B2A4A", fontWeight: 600 },
  ctaBtn:   (enabled) => ({ marginTop: 10, width: "100%", padding: "11px 0", background: enabled ? "#C9A84C" : "#E8E3DC", color: enabled ? "#1B2A4A" : "#AAA", border: "none", borderRadius: 6, fontFamily: FONT, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, cursor: enabled ? "pointer" : "default", transition: "all 0.2s", textTransform: "uppercase" }),

  policyCard:  { background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  policyTitle: { fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 8, textTransform: "uppercase" },
  policyText:  { fontFamily: FONT, fontSize: 12, color: "#666", lineHeight: 1.6 },

  overlay:    { position: "fixed", inset: 0, background: "rgba(27,42,74,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" },
  splitModal: { background: "#fff", borderRadius: 16, width: 480, minWidth: 340, maxWidth: "92vw", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", overflow: "hidden", position: "relative" },

  splitHeader:      { background: "#1B2A4A", padding: "28px 36px 24px", position: "relative" },
  splitHeaderTag:   { fontFamily: FONT, fontSize: 10, letterSpacing: 2.5, color: "#C9A84C", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" },
  splitHeaderTitle: { fontFamily: FONT, fontSize: 22, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15, margin: 0 },
  splitBody:        { background: "#fff", padding: "24px 36px 32px" },

  splitInfoCard:    { background: "#F7F3EA", borderRadius: 10, padding: "0 18px", marginBottom: 24 },
  splitInfoRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid #EAE5DC" },
  splitInfoRowLast: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0" },
  splitInfoKey:     { fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: "#999", textTransform: "uppercase" },
  splitInfoVal:     { fontFamily: FONT, fontSize: 14, fontWeight: 700, color: "#1B2A4A", textAlign: "right", maxWidth: "60%" },

  splitContinueBtn: { width: "100%", padding: "15px 0", background: "#1B2A4A", color: "#fff", border: "none", borderRadius: 8, fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 2.5, cursor: "pointer", marginBottom: 10, textTransform: "uppercase", transition: "background 0.18s" },
  splitCancelBtn:   { width: "100%", padding: "13px 0", background: "transparent", color: "#AAAAAA", border: "1.5px solid #E8E3DC", borderRadius: 8, fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 2.5, cursor: "pointer", textTransform: "uppercase", transition: "border-color 0.15s" },
  splitCloseBtn:    { position: "absolute", top: 16, right: 18, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.75)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, lineHeight: 1, transition: "background 0.15s" },

  counterWrap:  { textAlign: "center", margin: "4px 0 22px" },
  counterRow:   { display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginBottom: 6 },
  counterBtn:   { width: 32, height: 32, borderRadius: "50%", border: "2px solid #C9A84C", background: "transparent", color: "#C9A84C", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  counterNum:   { fontFamily: FONT, fontSize: 52, fontWeight: 700, color: "#1B2A4A", lineHeight: 1 },
  counterLabel: { fontFamily: FONT, fontSize: 9, letterSpacing: 2, color: "#999", fontWeight: 700, textTransform: "uppercase" },
  counterNote:  { fontFamily: FONT, fontSize: 12, color: "#666", marginBottom: 0, lineHeight: 1.6, textAlign: "center" },

  timerBar: { background: "#F7F3EA", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 11, fontFamily: FONT, color: "#666", letterSpacing: 1, border: "1px solid #E8E3DC" },
  timerNum: { color: "#C9A84C", fontWeight: 700, fontSize: 16, fontFamily: FONT },

  infoBadge:      { background: "#F7F3EA", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 16, marginBottom: 16, fontSize: 12, fontFamily: FONT, color: "#666", border: "1px solid #E8E3DC", flexWrap: "wrap" },
  infoBadgeItem:  { display: "flex", flexDirection: "column" },
  infoBadgeLabel: { fontSize: 9, letterSpacing: 1.5, color: "#999", fontWeight: 700, textTransform: "uppercase", fontFamily: FONT },
  infoBadgeVal:   { color: "#1B2A4A", fontWeight: 700, fontSize: 12, fontFamily: FONT },

  formLabel: { fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: "#555", marginBottom: 5, display: "block" },
  formInput: { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1.5px solid #E0DAD0", background: "#FAFAF7", color: "#1B2A4A", fontFamily: FONT, fontSize: 13, marginBottom: 14, boxSizing: "border-box", outline: "none" },
  formRow:   { display: "flex", gap: 10 },

  sectionLabel: { fontFamily: FONT, fontSize: 10, letterSpacing: 1.5, fontWeight: 700, color: "#C9A84C", marginBottom: 10, marginTop: 16, textTransform: "uppercase" },
  reviewRow:    { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F0EDE4", padding: "9px 0", fontFamily: FONT, fontSize: 13 },
  reviewKey:    { color: "#888" },
  reviewVal:    { color: "#1B2A4A", fontWeight: 600, textAlign: "right" },
  pendingBadge: { background: "#FFF3E0", color: "#E8A838", borderRadius: 4, padding: "2px 8px", fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: 1 },

  editBtn:   { flex: 1, padding: "12px 0", border: "2px solid #1B2A4A", background: "transparent", color: "#1B2A4A", borderRadius: 6, fontFamily: FONT, fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" },
  submitBtn: { flex: 1, padding: "12px 0", border: "none", background: "#1B2A4A", color: "#fff", borderRadius: 6, fontFamily: FONT, fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" },

  successModal: { background: "#fff", borderRadius: 14, padding: "48px 40px", width: 380, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.14)", textAlign: "center", position: "relative" },
  checkCircle:  { width: 60, height: 60, borderRadius: "50%", background: "#E8F5EE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 30, color: "#4CAF79" },
  successTitle: { fontFamily: FONT, fontSize: 26, fontWeight: 700, color: "#1B2A4A", marginBottom: 12 },
  successNote:  { fontFamily: FONT, fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 22 },
  refCode:      { background: "#1B2A4A", color: "#C9A84C", borderRadius: 6, padding: "14px 20px", fontFamily: FONT, fontWeight: 700, fontSize: 16, letterSpacing: 3, marginBottom: 8, display: "block", textAlign: "center" },
  refNote:      { fontFamily: FONT, fontSize: 11, color: "#AAA", marginBottom: 22, letterSpacing: 1 },
  closeBtn:     { position: "absolute", top: 14, right: 16, width: 32, height: 32, borderRadius: "50%", background: "transparent", border: "1.5px solid #E0DAD0", color: "#888", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 400, lineHeight: 1, transition: "all 0.15s" },

  backToVenuesBtn: { width: "100%", padding: "12px 0", border: "2px solid #1B2A4A", background: "transparent", color: "#1B2A4A", borderRadius: 6, fontFamily: FONT, fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getWholeSeatLabel = (guests) => {
  if (!guests || guests < 1) return "Seat 1";
  return `Seat ${Array.from({ length: guests }, (_, i) => i + 1).join(", ")}`;
};

const getSeatRatio = (table) => {
  if (!table?.seats?.length) return null;
  const available = table.seats.filter(s => s.status === "available").length;
  return `${available}/${table.seats.length}`;
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step, light = false }) {
  const steps    = ["Guest Count", "Details", "Confirm"];
  const textColor   = light ? "rgba(255,255,255,0.55)" : "#BBB";
  const doneColor   = "#C9A84C";
  const lineDefault = light ? "rgba(255,255,255,0.20)" : "#E8E3DC";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 0, marginTop: 16 }}>
      {steps.map((label, i) => {
        const idx    = i + 1;
        const done   = step > idx;
        const active = step === idx;
        const circleBg     = done ? doneColor : active ? (light ? "rgba(255,255,255,0.18)" : "#1B2A4A") : (light ? "rgba(255,255,255,0.08)" : "#F0EDE8");
        const circleBorder = done || active ? "none" : `2px solid ${light ? "rgba(255,255,255,0.25)" : "#DDD"}`;
        const numColor     = done ? "#fff" : "#fff";
        const labelColor   = done ? doneColor : active ? (light ? "#fff" : "#1B2A4A") : textColor;

        return (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: circleBg, border: circleBorder, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                {done ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: numColor }}>{idx}</span>
                )}
              </div>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: 0.2, color: labelColor, whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, marginTop: 13, marginLeft: 6, marginRight: 6, background: done ? doneColor : lineDefault, borderRadius: 2, transition: "background 0.2s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MODAL 1: Guest Count ─────────────────────────────────────────────────────
function ModalGuestCount({ seatData, tableData, mode, onContinue, onCancel }) {
  const [guests, setGuests] = useState(2);
  const capacity = tableData?.seats?.length || tableData?.capacity || 8;

  const infoRows = [
    ["ROOM",        ROOM,                                                       null],
    ["TABLE",       `Table ${tableData?.id ?? "—"}`,                            null],
    ["SEAT NUMBER", `Seat ${seatData?.num ?? seatData?.id ?? "—"}`,             null],
    ["STATUS",
      seatData?.status === "available" ? "Available" : "Unavailable",
      seatData?.status === "available" ? "#3DAA6E" : "#E8A838"],
  ];

  return (
    <div style={s.overlay}>
      <div style={s.splitModal}>
        <div style={s.splitHeader}>
          <button style={s.splitCloseBtn} onClick={onCancel}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.24)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}>✕</button>
          <div style={s.splitHeaderTag}>{mode === "individual" ? "SEAT RESERVATION" : "TABLE RESERVATION"}</div>
          <h2 style={s.splitHeaderTitle}>{mode === "individual" ? "Reserve this seat?" : "Reserve this table?"}</h2>
          <StepIndicator step={1} light={true} />
        </div>

        <div style={s.splitBody}>
          {mode === "individual" && (
            <div style={s.splitInfoCard}>
              {infoRows.map(([key, val, color], i) => (
                <div key={key} style={i === infoRows.length - 1 ? s.splitInfoRowLast : s.splitInfoRow}>
                  <span style={s.splitInfoKey}>{key}</span>
                  <span style={{ ...s.splitInfoVal, color: color || "#1B2A4A" }}>{val}</span>
                </div>
              ))}
            </div>
          )}

          {mode === "whole" && (
            <>
              <div style={s.counterWrap}>
                <div style={s.counterRow}>
                  <button style={s.counterBtn} onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
                  <div style={s.counterNum}>{guests}</div>
                  <button style={s.counterBtn} onClick={() => setGuests(g => Math.min(capacity, g + 1))}>+</button>
                </div>
                <div style={s.counterLabel}>NUMBER OF GUESTS</div>
                <div style={{ ...s.counterNote, marginTop: 8 }}>
                  Table <strong style={{ color: "#1B2A4A" }}>{tableData?.id}</strong> seats up to{" "}
                  <strong style={{ color: "#1B2A4A" }}>{capacity} guests</strong>.
                </div>
              </div>
              <div style={{ background: "#F7F3EA", borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: "1px solid #E8E3DC" }}>
                <div style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "#999", textTransform: "uppercase", marginBottom: 4 }}>SEATS TO BE RESERVED</div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: "#C9A84C", fontWeight: 700 }}>{getWholeSeatLabel(guests)}</div>
              </div>
            </>
          )}

          <button style={s.splitContinueBtn}
            onClick={() => onContinue(mode === "individual" ? 1 : guests)}
            onMouseEnter={e => { e.currentTarget.style.background = "#2A3F6A"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1B2A4A"; }}>
            CONTINUE
          </button>
          <button style={s.splitCancelBtn} onClick={onCancel}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#BBBBBB"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E3DC"; }}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL 2: Details ─────────────────────────────────────────────────────────
function ModalDetails({ tableData, seatData, mode, guests, onReview, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    eventDate: today, eventTime: "19:00", specialRequests: "",
  });
  const [secondsLeft, setSecondsLeft] = useState(24 * 60);

  useEffect(() => {
    if (secondsLeft <= 0) { onCancel(); return; }
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const mins     = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs     = String(secondsLeft % 60).padStart(2, "0");
  const isUrgent = secondsLeft <= 60;
  const set      = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const allFilled = form.firstName && form.lastName && form.email && form.phone && form.eventDate;

  const seatDisplay = mode === "whole"
    ? getWholeSeatLabel(guests)
    : (seatData ? `Seat ${seatData.num ?? seatData.id}` : "—");

  return (
    <div style={s.overlay}>
      <div style={s.splitModal}>
        <div style={s.splitHeader}>
          <button style={s.splitCloseBtn} onClick={onCancel}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.24)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}>✕</button>
          <div style={s.splitHeaderTag}>{mode === "individual" ? "SEAT RESERVATION" : "TABLE RESERVATION"}</div>
          <h2 style={s.splitHeaderTitle}>Your Information</h2>
          <StepIndicator step={2} light={true} />
        </div>

        <div style={{ ...s.splitBody, maxHeight: "65vh", overflowY: "auto" }}>
          <div style={{ ...s.timerBar, border: isUrgent ? "1px solid #E0524433" : "1px solid #E8E3DC", background: isUrgent ? "#FFF5F5" : "#F7F3EA" }}>
            <span style={{ color: "#555" }}>
              Seat is being held for you<br />
              <span style={{ fontSize: 10, color: isUrgent ? "#E05252" : "#888" }}>
                {isUrgent ? "⚠ Hurry! Your hold is about to expire." : "Complete this form before the timer expires"}
              </span>
            </span>
            <span style={{ ...s.timerNum, color: isUrgent ? "#E05252" : "#C9A84C" }}>
              {mins}:{secs}<span style={{ fontSize: 9, color: "#AAA", marginLeft: 2 }}>min</span>
            </span>
          </div>

          <div style={s.infoBadge}>
            <div style={s.infoBadgeItem}><span style={s.infoBadgeLabel}>ROOM</span><span style={s.infoBadgeVal}>{ROOM}</span></div>
            <div style={s.infoBadgeItem}><span style={s.infoBadgeLabel}>TABLE</span><span style={s.infoBadgeVal}>{tableData?.id ?? "—"}</span></div>
            <div style={s.infoBadgeItem}><span style={s.infoBadgeLabel}>SEAT{mode === "whole" && guests > 1 ? "S" : ""}</span><span style={{ ...s.infoBadgeVal, color: "#C9A84C" }}>{seatDisplay}</span></div>
            <div style={s.infoBadgeItem}><span style={s.infoBadgeLabel}>GUESTS</span><span style={s.infoBadgeVal}>{guests}</span></div>
          </div>

          <div style={s.formRow}>
            <div style={{ flex: 1 }}><label style={s.formLabel}>FIRST NAME *</label><input style={s.formInput} value={form.firstName} onChange={set("firstName")} /></div>
            <div style={{ flex: 1 }}><label style={s.formLabel}>LAST NAME *</label><input style={s.formInput} value={form.lastName} onChange={set("lastName")} /></div>
          </div>
          <label style={s.formLabel}>EMAIL ADDRESS *</label>
          <input style={s.formInput} value={form.email} onChange={set("email")} type="email" />
          <label style={s.formLabel}>PHONE NUMBER *</label>
          <input style={s.formInput} value={form.phone} onChange={set("phone")} type="tel" />
          <div style={s.formRow}>
            <div style={{ flex: 1 }}><label style={s.formLabel}>EVENT DATE *</label><input style={s.formInput} value={form.eventDate} onChange={set("eventDate")} type="date" min={today} /></div>
            <div style={{ flex: 1 }}><label style={s.formLabel}>EVENT TIME</label><input style={s.formInput} value={form.eventTime} onChange={set("eventTime")} type="time" /></div>
          </div>
          <label style={s.formLabel}>SPECIAL REQUESTS</label>
          <textarea style={{ ...s.formInput, resize: "vertical", minHeight: 56 }} value={form.specialRequests} onChange={set("specialRequests")} />

          <button
            disabled={!allFilled}
            style={{ ...s.splitContinueBtn, marginTop: 6, opacity: allFilled ? 1 : 0.45, cursor: allFilled ? "pointer" : "default" }}
            onClick={() => allFilled && onReview(form)}>
            REVIEW BOOKING
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL 3: Review ──────────────────────────────────────────────────────────
function ModalReview({ form, guests, tableData, seatData, mode, onSubmit, onEdit, submitting }) {
  const formatTime = t => {
    if (!t) return null;
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  const seatDisplay = mode === "whole"
    ? getWholeSeatLabel(guests)
    : `Seat ${seatData?.num ?? seatData?.number ?? seatData?.label ?? seatData?.id ?? "—"}`;

  const rows = [
    ["Venue",      "The Bellevue Manila"],
    ["Room",       `${WING} — ${ROOM}`],
    ["Table",      `Table ${tableData?.id ?? "—"}`],
    ["Seat(s)",    seatDisplay],
    ["Guests",     `${guests} guest${guests !== 1 ? "s" : ""}`],
    ["Event Date", form.eventDate || "—"],
    ["Event Time", form.eventTime ? formatTime(form.eventTime) : null],
  ];

  return (
    <div style={s.overlay}>
      <div style={s.splitModal}>
        <div style={s.splitHeader}>
          <button style={s.splitCloseBtn} onClick={onEdit}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.24)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}>✕</button>
          <div style={s.splitHeaderTag}>{mode === "individual" ? "SEAT RESERVATION" : "TABLE RESERVATION"}</div>
          <h2 style={s.splitHeaderTitle}>Review Your Booking</h2>
          <StepIndicator step={3} light={true} />
        </div>

        <div style={{ ...s.splitBody, maxHeight: "65vh", overflowY: "auto" }}>
          <div style={s.sectionLabel}>RESERVATION DETAILS</div>
          {rows.map(([k, v]) => (
            <div key={k} style={s.reviewRow}>
              <span style={s.reviewKey}>{k}</span>
              {k === "Event Time" && !v
                ? <span style={s.pendingBadge}>Pending</span>
                : <span style={{ ...s.reviewVal, color: k === "Seat(s)" ? "#C9A84C" : "#1B2A4A" }}>{v}</span>}
            </div>
          ))}

          <div style={s.sectionLabel}>GUEST INFORMATION</div>
          {[
            ["Full Name",        `${form.firstName} ${form.lastName}`],
            ["Email",            form.email],
            ["Phone",            form.phone],
            ["Special Requests", form.specialRequests || "None"],
          ].map(([k, v]) => (
            <div key={k} style={s.reviewRow}>
              <span style={s.reviewKey}>{k}</span>
              <span style={s.reviewVal}>{v}</span>
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button style={s.editBtn} onClick={onEdit} disabled={submitting}>EDIT DETAILS</button>
            <button
              style={{ ...s.submitBtn, opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
              onClick={onSubmit} disabled={submitting}>
              {submitting ? "SUBMITTING…" : "SUBMIT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: Success ───────────────────────────────────────────────────────────
function ModalSuccess({ refCode, onBack, mode, guests }) {
  return (
    <div style={s.overlay}>
      <div style={s.successModal}>
        <button style={s.closeBtn} onClick={onBack}
          onMouseEnter={e => { e.currentTarget.style.background = "#E8E3DC"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>✕</button>
        <div style={s.checkCircle}>✓</div>
        <div style={s.successTitle}>Reservation<br />Submitted!</div>
        <div style={s.successNote}>
          Your reservation has been received.{" "}
          {mode === "individual" && "Your seat has been marked as pending until admin approval."}{" "}
          {mode === "whole" && (
            <span>Reserved: <strong style={{ color: "#C9A84C" }}>{getWholeSeatLabel(guests)}</strong>. </span>
          )}
          You will be notified once the admin approves your booking.
        </div>
        <span style={s.refCode}>{refCode || "—"}</span>
        <div style={s.refNote}>Screenshot or copy this reference code for your records.</div>
        <button style={s.backToVenuesBtn} onClick={onBack}>BACK TO SEAT MAP</button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AlabangReserve() {
  const navigate = useNavigate();
  const [mode,          setMode]          = useState("whole");
  const [selectedSeat,  setSelectedSeat]  = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [windowSize,    setWindowSize]    = useState({ width: window.innerWidth, height: window.innerHeight });
  const [modal,         setModal]         = useState(null);
  const [guests,        setGuests]        = useState(2);
  const [formData,      setFormData]      = useState(null);
  const [refCode,       setRefCode]       = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [wsConnected,   setWsConnected]   = useState(false);

  const echoRef = useRef(null);

  // ── Table data from localStorage ──────────────────────────────────────────
  const [tableData, setTableData] = useState(() => {
    const raw = getRoomData(WING, ROOM, null);
    if (!raw) return null;
    if (Array.isArray(raw)) return raw.filter(t => t.seats?.length > 0);
    if (raw.seats?.length > 0) return raw;
    return null;
  });

  // ── Subscribe to seat map changes ─────────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToSeatMapChanges(({ wing, room, data }) => {
      if (wing !== WING || room !== ROOM) return;
      if (Array.isArray(data))         setTableData(data.filter(t => t.seats?.length > 0));
      else if (data?.seats?.length > 0) setTableData(data);
      else                              setTableData(null);
    });
    return unsub;
  }, []);

  // ── Cross-tab storage fallback ────────────────────────────────────────────
  useEffect(() => {
    const SEAT_KEY = `seatmap:${WING}:${ROOM}`;
    const onStorage = (e) => {
      if (e.key !== SEAT_KEY) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (!parsed) return;
        if (Array.isArray(parsed))         setTableData(parsed.filter(t => t.seats?.length > 0));
        else if (parsed.seats?.length > 0) setTableData(parsed);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── DB sync on mount ──────────────────────────────────────────────────────
  const hasSynced = useRef(false);
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;
    const syncWithDatabase = async () => {
      try {
        const res = { success: true, data: [] };
        if (!res.success) return;
        setTableData(prev => {
          if (!prev) return prev;
          const applyToTable = (tbl) => ({
            ...tbl,
            seats: (tbl.seats || []).map(seat => {
              const match = res.data.find(r => {
                if (r.table !== String(tbl.id)) return false;
                const nums = String(r.seat || "").replace(/Seat\s*/gi, "").split(",").map(s => parseInt(s.trim())).filter(Boolean);
                return nums.includes(seat.num);
              });
              return match ? { ...seat, status: match.status } : seat;
            }),
          });
          const result = Array.isArray(prev) ? prev.map(applyToTable) : applyToTable(prev);
          dispatchSeatMapUpdate(WING, ROOM, result);
          return result;
        });
      } catch (err) {
        console.warn("[AlabangReserve] Seat sync failed:", err.message);
      }
    };
    syncWithDatabase();
    const interval = setInterval(syncWithDatabase, 30_000);
    return () => clearInterval(interval);
  }, []);

  // ── Window resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const pusherKey     = import.meta.env.VITE_PUSHER_APP_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
    if (!echoRef.current && pusherKey && pusherKey !== "your_key") {
      try {
        echoRef.current = new Echo({ broadcaster: "pusher", key: pusherKey, cluster: pusherCluster });
      } catch (err) {
        console.log("WebSocket init failed:", err);
        return;
      }
    }
    const echo = echoRef.current;
    if (!echo) return;

    try {
      const channel = echo.channel("reservations");
      const syncSeats = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/rooms/${WING}/${ROOM}/seats`, { headers: { Accept: "application/json" } });
          if (res.ok) {
            const data = await res.json();
            if (data?.data) dispatchSeatMapUpdate(WING, ROOM, data.data);
          }
        } catch (err) { console.error("Failed to sync seats:", err); }
      };

      channel.listen("ReservationCreated", syncSeats);
      channel.listen("ReservationUpdated", syncSeats);
      channel.listen("ReservationDeleted", syncSeats);
      channel.listen("SeatReserved",       syncSeats);
      channel.listen("TableReserved",      syncSeats);

      echo.connector.pusher.connection.bind("connected",    () => setWsConnected(true));
      echo.connector.pusher.connection.bind("disconnected", () => setWsConnected(false));
      echo.connector.pusher.connection.bind("error",        () => setWsConnected(false));

      return () => {
        try {
          ["ReservationCreated","ReservationUpdated","ReservationDeleted","SeatReserved","TableReserved"]
            .forEach(e => channel.stopListening(e));
        } catch (_) {}
      };
    } catch (err) { console.log("WebSocket channel setup failed:", err); }
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const resolveTableForSeat = (seat) => {
    if (!seat || !tableData) return null;
    if (Array.isArray(tableData)) return tableData.find(t => t.seats?.some(s => s.id === seat.id)) || tableData[0] || null;
    return tableData;
  };
  const getActiveTable = () => selectedTable || (Array.isArray(tableData) ? tableData[0] : tableData) || null;

  const handleTableClick = (table) => { setSelectedTable(table); setModal("guestCount"); };
  const handleSeatClick  = (seat) => {
    if (seat.status === "reserved" || seat.status === "pending") {
      alert(`This seat is already ${seat.status}. Please choose an available seat.`);
      return;
    }
    setSelectedSeat(seat);
    setSelectedTable(resolveTableForSeat(seat));
  };
  const handleGuestContinue = (g)    => { setGuests(g);     setModal("details"); };
  const handleReview        = (form) => { setFormData(form); setModal("review");  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData || submitting) return;
    setSubmitting(true);
    try {
      const activeTable = getActiveTable();
      const payload = {
        name:             `${formData.firstName} ${formData.lastName}`,
        email:            formData.email,
        phone:            formData.phone,
        venue_id:         1,
        table_number:     String(activeTable?.id ?? "T1"),
        seat_number:      mode === "individual"
                          ? String(selectedSeat?.num ?? selectedSeat?.id ?? "")
                          : Array.from({ length: guests }, (_, i) => i + 1).join(","),
        guests_count:     guests,
        event_date:       formData.eventDate,
        event_time:       formData.eventTime ? formData.eventTime.substring(0, 5) : null,
        special_requests: formData.specialRequests || "",
        type:             mode,
      };

      const response = await apiCall("/reservations", { method: "POST", body: JSON.stringify(payload) });
      setRefCode(response.reference_code || "—");

      if (activeTable) {
        const markPending = (tbl) => {
          if (mode === "individual") {
            return { ...tbl, seats: (tbl.seats || []).map(s => s.id === selectedSeat?.id ? { ...s, status: "pending" } : s) };
          }
          let marked = 0;
          return { ...tbl, seats: (tbl.seats || []).map(s => {
            if (marked < guests && s.status === "available") { marked++; return { ...s, status: "pending" }; }
            return s;
          })};
        };
        const updated = Array.isArray(tableData)
          ? tableData.map(t => t.id === activeTable.id ? markPending(t) : t)
          : markPending(tableData);
        setTableData(updated);
        dispatchSeatMapUpdate(WING, ROOM, updated);
      }
      setModal("success");
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setModal(null); setSelectedSeat(null); setSelectedTable(null);
    setRefCode(null); setFormData(null); setGuests(2);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const isMobile    = windowSize.width < 480;
  const isTablet    = windowSize.width < 768;
  const activeTable = getActiveTable();
  const canProceed  = mode === "individual" && selectedSeat?.status === "available";

  const displayTable = mode === "whole"
    ? (activeTable ? `Table ${activeTable.id}` : "—")
    : (selectedTable ? `Table ${selectedTable.id}` : "—");
  const displaySeat = mode === "individual"
    ? (selectedSeat ? `Seat ${selectedSeat.num ?? selectedSeat.id}` : "Select a seat")
    : getWholeSeatLabel(guests);
  const seatRatio = activeTable ? getSeatRatio(activeTable) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>
      <MainWingNavbar active="ALABANG FUNCTION ROOM" />

      <div style={{ ...s.page, ...(isMobile ? { padding: "16px 14px" } : isTablet ? { padding: "24px 20px" } : {}) }}>

        {/* Back */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, marginTop: 8 }}>
          <button onClick={() => navigate("/venues")} aria-label="Back to venues"
            style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: "50%", border: "2px solid #C9A84C", color: "#C9A84C", cursor: "pointer", flexShrink: 0, transition: "background 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff";    e.currentTarget.style.color = "#C9A84C"; }}>
            <ChevronLeftIcon size={18} />
          </button>
          <div style={{ width: 32, height: 2, background: "#C9A84C", borderRadius: 2 }} />
          <div style={{ color: "#C9A84C", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: FONT }}>
            ALL VENUES
          </div>
        </div>

        <h1 style={{ ...s.pageTitle, ...(isMobile ? { fontSize: 26 } : isTablet ? { fontSize: 32 } : {}) }}>
          Alabang Function Room
        </h1>
        <p style={s.pageSubtitle}>Book your preferred table in the Main Wing of Alabang Function Room</p>

        {/* Mode toggle */}
        <div style={{ ...s.toggleBar, marginBottom: 24 }}>
          <span style={s.toggleLabel}>I WANT TO RESERVE A:</span>
          <div style={s.togglePillGroup}>
            <button style={s.togglePillBtn(mode === "whole")}      onClick={() => { setMode("whole");      setSelectedSeat(null); }}>Whole Table</button>
            <button style={s.togglePillBtn(mode === "individual")} onClick={() => { setMode("individual"); setSelectedTable(null); }}>Individual Seat</button>
          </div>
        </div>

        <div style={{ ...s.layout, ...(isMobile || isTablet ? { flexDirection: "column" } : {}) }}>
          <div style={s.mapCard}>
            <SeatMap tableData={tableData} editMode={false} selectedSeat={selectedSeat}
              onSeatClick={handleSeatClick} onTableClick={handleTableClick}
              windowWidth={windowSize.width} wing={WING} room={ROOM} />
          </div>

          <div style={{ ...s.rightPanel, ...(isMobile || isTablet ? { width: "100%" } : {}) }}>
            <div style={s.legendCard}>
              <div style={s.legendTitle}>Status Legend</div>
              {Object.entries(STATUS_COLORS).map(([key, color]) => (
                <div key={key} style={s.legendRow}>
                  <div style={s.legendDot(color)} />
                  <span style={s.legendText}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              ))}
            </div>

            <div style={s.selCard}>
              <div style={s.selTitle}>Your Selection</div>
              <div style={s.selRow}>
                <span style={s.selLabel}>TABLE:</span>
                <span style={s.selVal}>
                  {displayTable}
                  {seatRatio && (
                    <span style={{ marginLeft: 6, background: "#F7F3EA", border: "1px solid #E8E3DC", borderRadius: 4, padding: "1px 6px", fontSize: 10, color: "#C9A84C", fontWeight: 700, fontFamily: FONT }}>
                      {seatRatio}
                    </span>
                  )}
                </span>
              </div>
              <div style={s.selRow}>
                <span style={s.selLabel}>SEAT{mode === "whole" && guests > 1 ? "S" : ""}:</span>
                <span style={{ ...s.selVal, color: "#C9A84C", fontSize: mode === "whole" ? 11 : 13 }}>{displaySeat}</span>
              </div>
              <div style={s.selRow}>
                <span style={{ ...s.selLabel, fontSize: 9 }}>ROOM:</span>
                <span style={{ ...s.selVal, fontSize: 11, color: "#666" }}>{ROOM}</span>
              </div>

              {mode === "whole" && (
                <button style={s.ctaBtn(true)} onClick={() => setModal("guestCount")}
                  onMouseEnter={e => { e.currentTarget.style.background = "#B89635"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#C9A84C"; }}>
                  Reserve This Table
                </button>
              )}
              {mode === "individual" && (
                <button style={s.ctaBtn(canProceed)} onClick={canProceed ? () => setModal("guestCount") : undefined}>
                  {selectedSeat ? "Reserve This Seat" : "Select a Seat First"}
                </button>
              )}
            </div>

            <div style={s.policyCard}>
              <div style={s.policyTitle}>Hotel Policy</div>
              <div style={s.policyText}>
                Pending seats are held for one (1) day. After expiry the seat returns to available.<br /><br />
                Reservations are confirmed only after admin approval.
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal === "guestCount" && (
        <ModalGuestCount
          seatData={mode === "individual" ? selectedSeat : null}
          tableData={mode === "individual" ? resolveTableForSeat(selectedSeat) : activeTable}
          mode={mode} onContinue={handleGuestContinue} onCancel={() => setModal(null)} />
      )}
      {modal === "details" && (
        <ModalDetails tableData={activeTable} seatData={selectedSeat} mode={mode} guests={guests}
          onReview={handleReview} onCancel={() => setModal(null)} />
      )}
      {modal === "review" && formData && (
        <ModalReview form={formData} guests={guests} mode={mode} tableData={activeTable}
          seatData={selectedSeat} onSubmit={handleSubmit} onEdit={() => setModal("details")} submitting={submitting} />
      )}
      {modal === "success" && (
        <ModalSuccess refCode={refCode} onBack={handleBack} mode={mode} guests={guests} />
      )}
    </div>
  );
}