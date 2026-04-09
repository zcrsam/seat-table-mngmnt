// src/pages/AlabangReserve.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainWingNavbar from "../components/MainWingNavbar";
import SeatMap, { STATUS_COLORS } from "../../../components/seatmap/SeatMap";
import {
  getRoomData,
  subscribeToSeatMapChanges,
  dispatchSeatMapUpdate,
} from "../../../utils/seatMapPersistence.js";
import Echo from '../../../utils/websocket.js';
import bellevueLogo from "../../../assets/bellevue-logo.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const WING = "Main Wing";
const ROOM = "Alabang Function Room";

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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

const normalizeBooking = (b) => ({
  db_id:            b.db_id ?? b.id ?? b.reservation_id ?? null,
  id:               b.reference_code ?? b.ref_code ?? String(b.id ?? ""),
  reference_code:   b.reference_code ?? b.ref_code ?? String(b.id ?? ""),
  name:             b.name ?? b.guest_name ?? b.full_name ?? b.guest ?? "",
  email:            b.email ?? b.guest_email ?? "",
  phone:            b.phone ?? b.phone_number ?? b.contact ?? "",
  room:             b.room ?? b.venue ?? b.room_name ?? b.venue_name ?? ROOM,
  table_number:     b.table_number ?? b.table ?? b.table_no ?? "",
  table:            b.table_number ?? b.table ?? b.table_no ?? "",
  seat:             b.seat_number ?? b.seat ?? b.seats ?? "",
  event_date:       b.event_date ?? b.eventDate ?? b.date ?? "",
  event_time:       b.event_time ?? b.eventTime ?? b.time ?? "",
  status:           (b.status ?? "pending").toLowerCase(),
  guests:           b.guests_count ?? b.guests ?? b.guest_count ?? 1,
  type:             b.type ?? "whole",
  special_requests: b.special_requests ?? b.specialRequests ?? "",
});

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

  overlay:    { position: "fixed", inset: 0, background: "rgba(27,42,74,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)", padding: "12px" },
  splitModal: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", overflow: "hidden", position: "relative" },

  splitHeader:      { background: "#1B2A4A", padding: "24px 28px 20px", position: "relative" },
  splitHeaderTag:   { fontFamily: FONT, fontSize: 10, letterSpacing: 2.5, color: "#C9A84C", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" },
  splitHeaderTitle: { fontFamily: FONT, fontSize: 20, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15, margin: 0 },
  splitBody:        { background: "#fff", padding: "20px 28px 28px" },

  splitInfoCard:    { background: "#F7F3EA", borderRadius: 10, padding: "0 18px", marginBottom: 24 },
  splitInfoRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid #EAE5DC" },
  splitInfoRowLast: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0" },
  splitInfoKey:     { fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: "#999", textTransform: "uppercase" },
  splitInfoVal:     { fontFamily: FONT, fontSize: 14, fontWeight: 700, color: "#1B2A4A", textAlign: "right", maxWidth: "60%" },

  splitContinueBtn: { width: "100%", padding: "15px 0", background: "#1B2A4A", color: "#fff", border: "none", borderRadius: 8, fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 2.5, cursor: "pointer", marginBottom: 10, textTransform: "uppercase", transition: "background 0.18s" },
  splitCancelBtn:   { width: "100%", padding: "13px 0", background: "transparent", color: "#AAAAAA", border: "1.5px solid #E8E3DC", borderRadius: 8, fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 2.5, cursor: "pointer", textTransform: "uppercase", transition: "border-color 0.15s" },
  splitCloseBtn:    { position: "absolute", top: 14, right: 16, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.75)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, lineHeight: 1, transition: "background 0.15s" },

  guestInputWrap: { textAlign: "center", margin: "4px 0 22px" },
  guestInputRow:  { display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 10, border: "2px solid #C9A84C", borderRadius: 10, overflow: "hidden", maxWidth: 200, margin: "0 auto 10px" },
  guestStepBtn:   { width: 52, height: 56, border: "none", background: "#F7F3EA", color: "#C9A84C", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontFamily: FONT, transition: "background 0.15s", flexShrink: 0 },
  guestNumInput:  { flex: 1, border: "none", borderLeft: "1.5px solid #E8E3DC", borderRight: "1.5px solid #E8E3DC", textAlign: "center", fontFamily: FONT, fontSize: 32, fontWeight: 700, color: "#1B2A4A", outline: "none", background: "#fff", padding: "8px 0", minWidth: 0 },
  guestLabel:     { fontFamily: FONT, fontSize: 9, letterSpacing: 2, color: "#999", fontWeight: 700, textTransform: "uppercase", textAlign: "center", marginTop: 6 },
  guestNote:      { fontFamily: FONT, fontSize: 12, color: "#666", marginBottom: 0, lineHeight: 1.6, textAlign: "center", marginTop: 8 },

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

  errorBox: { background: "#FFF0F0", border: "1px solid #FFCDD2", borderRadius: 6, padding: "10px 12px", marginBottom: 14, fontFamily: FONT, fontSize: 12, color: "#C62828" },
  backLink: { background: "none", border: "none", color: "#C9A84C", fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "0 0 16px", letterSpacing: 1, display: "block" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getWholeSeatLabel = (guests, tableData = null) => {
  if (!guests || guests < 1) return "Seat 1";
  if (tableData?.seats?.length) {
    const bookable = tableData.seats
      .filter(s => s.status === "available")
      .slice(0, guests)
      .map(s => s.num ?? s.id);
    if (bookable.length > 0) return `Seat ${bookable.join(", ")}`;
  }
  return `Seat ${Array.from({ length: guests }, (_, i) => i + 1).join(", ")}`;
};

const getSeatRatio = (table) => {
  if (!table?.seats?.length) return null;
  const available = table.seats.filter(s => s.status === "available").length;
  return `${available}/${table.seats.length}`;
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step, light = false }) {
  const steps       = ["Guest Count", "Details", "Confirm"];
  const textColor   = light ? "rgba(255,255,255,0.55)" : "#BBB";
  const doneColor   = "#C9A84C";
  const lineDefault = light ? "rgba(255,255,255,0.20)" : "#E8E3DC";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 0, marginTop: 16 }}>
      {steps.map((label, i) => {
        const idx          = i + 1;
        const done         = step > idx;
        const active       = step === idx;
        const circleBg     = done ? doneColor : active ? (light ? "rgba(255,255,255,0.18)" : "#1B2A4A") : (light ? "rgba(255,255,255,0.08)" : "#F0EDE8");
        const circleBorder = done || active ? "none" : `2px solid ${light ? "rgba(255,255,255,0.25)" : "#DDD"}`;
        const numColor     = "#fff";
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
  const bookableSeats = (tableData?.seats || []).filter(s => s.status === "available");
  const pendingSeats  = (tableData?.seats || []).filter(s => s.status === "pending");
  const capacity      = bookableSeats.length || tableData?.capacity || 8;
  const [guests,   setGuests]   = useState(() => Math.min(2, capacity));
  const [inputVal, setInputVal] = useState(String(Math.min(2, capacity)));

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setInputVal(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1 && n <= capacity) setGuests(n);
  };
  const handleInputBlur = () => {
    let n = parseInt(inputVal, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > capacity) n = capacity;
    setGuests(n);
    setInputVal(String(n));
  };

  const infoRows = [
    ["ROOM",        ROOM,                                                   null],
    ["TABLE",       `Table ${tableData?.id ?? "—"}`,                        null],
    ["SEAT NUMBER", `Seat ${seatData?.num ?? seatData?.id ?? "—"}`,         null],
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
              <div style={s.guestInputWrap}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputVal}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="0"
                  style={{
                    ...s.guestNumInput,
                    border: "2px solid #C9A84C",
                    borderRadius: 10,
                    width: "100%",
                    maxWidth: 200,
                    display: "block",
                    margin: "0 auto 10px",
                    MozAppearance: "textfield",
                    WebkitAppearance: "none",
                  }}
                />
                <div style={s.guestLabel}>NUMBER OF GUESTS</div>
                <div style={s.guestNote}>
                  Table <strong style={{ color: "#1B2A4A" }}>{tableData?.id}</strong> has{" "}
                  <strong style={{ color: "#1B2A4A" }}>{capacity} available seat{capacity !== 1 ? "s" : ""}</strong>
                  {pendingSeats.length > 0 && (
                    <span style={{ color: "#E8A838", fontSize: 11 }}>
                      {" "}({pendingSeats.length} pending admin approval)
                    </span>
                  )}.
                </div>
              </div>
              <div style={{ background: "#F7F3EA", borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: "1px solid #E8E3DC" }}>
                <div style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "#999", textTransform: "uppercase", marginBottom: 4 }}>SEATS TO BE RESERVED</div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: "#C9A84C", fontWeight: 700 }}>{getWholeSeatLabel(guests, tableData)}</div>
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
function ModalDetails({ tableData, seatData, mode, guests, onReview, onCancel, prefill = null }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    firstName:       prefill?.firstName       || "",
    lastName:        prefill?.lastName        || "",
    email:           prefill?.email           || "",
    phone:           prefill?.phone           || "+63",
    eventDate:       prefill?.eventDate       || today,
    eventTime:       prefill?.eventTime       || "19:00",
    specialRequests: prefill?.specialRequests || "",
  });
  const [secondsLeft, setSecondsLeft] = useState(24 * 60);

  useEffect(() => {
    if (prefill) {
      setForm({
        firstName:       prefill.firstName       || "",
        lastName:        prefill.lastName        || "",
        email:           prefill.email           || "",
        phone:           prefill.phone           || "+63",
        eventDate:       prefill.eventDate       || today,
        eventTime:       prefill.eventTime       || "19:00",
        specialRequests: prefill.specialRequests || "",
      });
    }
  }, [prefill]);

  useEffect(() => {
    if (secondsLeft <= 0) { onCancel(); return; }
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const mins     = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs     = String(secondsLeft % 60).padStart(2, "0");
  const isUrgent = secondsLeft <= 60;

  const set = k => e => {
    const value = e.target.value;
    if (k === "phone") {
      if (value.startsWith('+63')) {
        const digitsAfter63 = value.slice(3).replace(/[^0-9]/g, '');
        const limitedDigits = digitsAfter63.slice(0, 10);
        setForm(f => ({ ...f, [k]: '+63' + limitedDigits }));
      } else {
        const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
        setForm(f => ({ ...f, [k]: '+63' + digitsOnly }));
      }
    } else {
      setForm(f => ({ ...f, [k]: value }));
    }
  };

  const allFilled = form.firstName && form.lastName && form.email && form.phone && form.eventDate;

  const seatDisplay = mode === "whole"
    ? getWholeSeatLabel(guests, tableData)
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
          <input style={s.formInput} value={form.phone} onChange={set("phone")} type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="Enter phone number" maxLength="13" />
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
function ModalReview({ form, guests, tableData, seatData, mode, onSubmit, onEdit, submitting, isRebook = false, rebookFrom = null }) {
  const formatTime = t => {
    if (!t) return null;
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  const seatDisplay = mode === "whole"
    ? getWholeSeatLabel(guests, tableData)
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
          <div style={s.splitHeaderTag}>{isRebook ? "REBOOK / MOVE SEAT" : mode === "individual" ? "SEAT RESERVATION" : "TABLE RESERVATION"}</div>
          <h2 style={s.splitHeaderTitle}>Review Your Booking</h2>
          <StepIndicator step={3} light={true} />
        </div>

        <div style={{ ...s.splitBody, maxHeight: "65vh", overflowY: "auto" }}>
          {isRebook && rebookFrom && (
            <div style={{ background: "#FFF8E1", border: "1px solid #FFE082", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontFamily: FONT, fontSize: 12, color: "#7B5E00" }}>
              <strong>Rebooking notice:</strong> Your previous reservation{" "}
              <strong style={{ color: "#C9A84C" }}>{rebookFrom.reference_code || rebookFrom.id}</strong> will be cancelled automatically when you submit.
            </div>
          )}

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
              {submitting ? "SUBMITTING…" : isRebook ? "CONFIRM REBOOK" : "SUBMIT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QRCodeWithRef ────────────────────────────────────────────────────────────
function QRCodeWithRef({ value, size = 120, imgRef }) {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (!value) return;
    let cancelled = false;

    const doRender = () => {
      const tmp = document.createElement("div");
      tmp.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;";
      document.body.appendChild(tmp);
      try {
        new window.QRCode(tmp, {
          text: value,
          width: size * 4,
          height: size * 4,
          colorDark: "#000000",
          colorLight: "#FFFFFF",
          correctLevel: window.QRCode.CorrectLevel.L,
        });

        const tryExtract = (attempt = 0) => {
          const qrCanvas = tmp.querySelector("canvas");
          if (qrCanvas) {
            const src = qrCanvas.toDataURL("image/png");
            if (!cancelled) {
              setImgSrc(src);
              if (imgRef) imgRef.current = src;
            }
            document.body.removeChild(tmp);
            return;
          }
          const qrImg = tmp.querySelector("img");
          if (qrImg && qrImg.src) {
            if (!cancelled) {
              setImgSrc(qrImg.src);
              if (imgRef) imgRef.current = qrImg.src;
            }
            document.body.removeChild(tmp);
            return;
          }
          if (attempt < 5) {
            setTimeout(() => tryExtract(attempt + 1), 100 * (attempt + 1));
          } else {
            document.body.removeChild(tmp);
          }
        };

        tryExtract();
      } catch (e) {
        if (tmp.parentNode) document.body.removeChild(tmp);
      }
    };

    if (window.QRCode) {
      doRender();
    } else {
      const existing = document.querySelector('script[data-qrcodejs]');
      if (existing) {
        existing.addEventListener("load", doRender);
      } else {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
        script.setAttribute("data-qrcodejs", "1");
        script.onload = doRender;
        document.head.appendChild(script);
      }
    }

    return () => { cancelled = true; };
  }, [value, size]);

  if (!imgSrc) {
    return (
      <div style={{ width: size, height: size, borderRadius: 10, background: "#F0EDE8", border: "1px solid #E8E3DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#CCC", fontFamily: FONT }}>
        QR
      </div>
    );
  }
  return (
    <img
      src={imgSrc}
      alt="QR Code"
      style={{ width: size, height: size, display: "block", borderRadius: 10, imageRendering: "pixelated" }}
    />
  );
}

// ─── buildQrValue ─────────────────────────────────────────────────────────────
// Encodes a plain URL — phone camera opens directly in browser, never contacts.
// Set VITE_APP_URL in your .env for production (e.g. https://yourdomain.com).
// Falls back to window.location.origin in dev (http://localhost:5173).
const buildQrValue = ({ refCode }) => {
  const base = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, "");
  const ref  = String(refCode || "").trim();
  // Always ensure http:// or https:// prefix so scanners open a browser tab
  const url  = base.startsWith("http") ? base : `https://${base}`;
  return `${url}/alabang-reserve/${ref}`;
};

// ─── MODAL: Success ────────────────────────────────────────────────────────────
function ModalSuccess({ refCode, onBack, mode, guests, isRebook = false, bookingDetails = null }) {
  const qrImgRef = useRef(null);
  const [saving,   setSaving]   = useState(false);
  const [qrReady,  setQrReady]  = useState(false);

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch { return d; }
  };

  // QR now encodes a scannable URL: e.g. http://localhost:5173/alabang-reserve/2026-3832
  const qrValue = buildQrValue({ refCode: refCode || "" });

  // Poll until QR image is rendered
  useEffect(() => {
    let tries = 0;
    const poll = setInterval(() => {
      if (qrImgRef.current) { setQrReady(true); clearInterval(poll); }
      if (++tries > 20) clearInterval(poll);
    }, 100);
    return () => clearInterval(poll);
  }, []);

  // ── Save Photo: QR code + reference code only, clean white card ──────────
  const handleSavePhoto = useCallback(async () => {
    if (saving || !qrReady) return;
    setSaving(true);
    try {
      const dpr    = 3;
      const W      = 320;
      const H      = 380;
      const canvas = document.createElement("canvas");
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);

      // White background
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      // Gold top bar
      const barH = 6;
      ctx.fillStyle = "#C9A84C";
      ctx.beginPath();
      ctx.roundRect(0, 0, W, barH, [16, 16, 0, 0]);
      ctx.fill();

      // QR code centered
      const qrSrc  = qrImgRef.current;
      const qrSize = 220;
      const qrX    = (W - qrSize) / 2;
      const qrY    = barH + 28;

      if (qrSrc) {
        await new Promise((resolve) => {
          const qImg  = new Image();
          qImg.onload = () => {
            // White padding behind QR for clean scan
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 10);
            ctx.fill();

            ctx.drawImage(qImg, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          qImg.onerror = resolve;
          qImg.src     = qrSrc;
        });
      }

      // Divider
      const divY = qrY + qrSize + 20;
      ctx.strokeStyle = "#EAE5DC";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(28, divY);
      ctx.lineTo(W - 28, divY);
      ctx.stroke();

      // Reference code label
      ctx.fillStyle = "#BBBBBB";
      ctx.font      = `600 9px sans-serif`;
      ctx.textAlign = "center";
      ctx.letterSpacing = "1.5px";
      ctx.fillText("REFERENCE CODE", W / 2, divY + 20);

      // Reference code value — big, bold, navy
      ctx.fillStyle = "#1B2A4A";
      ctx.font      = `bold 26px sans-serif`;
      ctx.fillText(refCode || "—", W / 2, divY + 52);

      ctx.textAlign = "left";

      // Download
      const link    = document.createElement("a");
      link.download = `bellevue-reservation-${refCode || "ticket"}.png`;
      link.href     = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Save photo failed:", err);
      alert("Could not save photo. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [refCode, saving, qrReady]);

  const infoRows = [
    { label: "TABLE",  value: bookingDetails?.table || "—" },
    { label: "DATE",   value: formatDate(bookingDetails?.date)  },
    { label: "GUESTS", value: String(guests)                    },
    { label: "STATUS", value: "Pending", gold: true             },
  ];

  return (
    <div style={s.overlay}>
      <div style={{
        background: "#fff", borderRadius: 14, width: "100%", maxWidth: 420,
        boxShadow: "0 24px 60px rgba(0,0,0,0.22)", overflow: "hidden",
      }}>

        {/* Gold line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, #C9A84C, #E8C96C, #C9A84C)" }} />

        {/* Body */}
        <div style={{ padding: "20px 24px 24px" }}>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
              {isRebook ? "Seat Moved" : "Reservation Submitted"}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: "#1B2A4A", lineHeight: 1.15 }}>
              Pending Approval
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: "#999", marginTop: 3 }}>
              Your booking has been received and awaits confirmation.
            </div>
          </div>

          {/* Reference code */}
          <div style={{ borderTop: "1px solid #EAE5DC", borderBottom: "1px solid #EAE5DC", padding: "14px 0", marginBottom: 16 }}>
            <div style={{ fontFamily: FONT, fontSize: 9, color: "#BBB", letterSpacing: 1.8, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>Reference Code</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: "#1B2A4A", letterSpacing: 4, lineHeight: 1 }}>{refCode || "—"}</div>
          </div>

          {/* Info rows + QR */}
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              {infoRows.map(({ label, value, gold }, i) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 0",
                  borderBottom: i < infoRows.length - 1 ? "1px solid #F0EDE8" : "none",
                }}>
                  <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: "#BBBBBB", textTransform: "uppercase" }}>{label}</span>
                  <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: gold ? "#C9A84C" : "#1B2A4A" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* QR */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <div style={{ padding: 8, background: "#fff", border: "1px solid #EAE5DC", borderRadius: 8 }}>
                <QRCodeWithRef value={qrValue} size={96} imgRef={qrImgRef} />
              </div>
              <div style={{ fontFamily: FONT, fontSize: 8, color: "#CCCCCC", letterSpacing: 0.4, textAlign: "center" }}>Scan to verify</div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSavePhoto}
              disabled={saving || !qrReady}
              style={{
                flex: 1, padding: "11px 0",
                background: "transparent",
                color: (saving || !qrReady) ? "#CCC" : "#1B2A4A",
                border: `1.5px solid ${(saving || !qrReady) ? "#E8E3DC" : "#1B2A4A"}`,
                borderRadius: 6,
                fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: 1.5,
                cursor: (saving || !qrReady) ? "not-allowed" : "pointer",
                textTransform: "uppercase",
                transition: "all 0.18s",
                opacity: !qrReady ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!saving && qrReady) { e.currentTarget.style.background = "#1B2A4A"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={e => { if (!saving && qrReady) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1B2A4A"; } }}
            >
              {saving ? "SAVING..." : !qrReady ? "LOADING..." : "SAVE PHOTO"}
            </button>

            <button
              onClick={onBack}
              style={{
                flex: 1, padding: "11px 0", background: "#C9A84C", color: "#1B2A4A",
                border: "none", borderRadius: 6, fontFamily: FONT, fontWeight: 700,
                fontSize: 10, letterSpacing: 1.5, cursor: "pointer",
                textTransform: "uppercase", transition: "background 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#B89635"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#C9A84C"; }}
            >
              BACK TO MAP
            </button>
          </div>
        </div>
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

  const [rebookFrom,         setRebookFrom]         = useState(null);
  const [lastBookingDetails, setLastBookingDetails] = useState(null);

  const echoRef = useRef(null);

  const [tableData, setTableData] = useState(() => {
    const raw = getRoomData(WING, ROOM, null);
    if (!raw) return null;
    if (Array.isArray(raw)) return raw.filter(t => t.seats?.length > 0);
    if (raw.seats?.length > 0) return raw;
    return null;
  });

  useEffect(() => {
    const unsub = subscribeToSeatMapChanges(({ wing, room, data }) => {
      if (wing !== WING || room !== ROOM) return;
      if (Array.isArray(data))          setTableData(data.filter(t => t.seats?.length > 0));
      else if (data?.seats?.length > 0) setTableData(data);
      else                              setTableData(null);
    });
    return unsub;
  }, []);

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
    const onSeatMapUpdate = (e) => {
      const { wing, room, data } = e.detail || {};
      if (wing !== WING || room !== ROOM) return;
      try {
        if (Array.isArray(data))          setTableData(data.filter(t => t.seats?.length > 0));
        else if (data?.seats?.length > 0) setTableData(data);
        else                              setTableData(null);
      } catch {}
    };
    window.addEventListener("storage",        onStorage);
    window.addEventListener("seatmap-update", onSeatMapUpdate);
    return () => {
      window.removeEventListener("storage",        onStorage);
      window.removeEventListener("seatmap-update", onSeatMapUpdate);
    };
  }, []);

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

  useEffect(() => {
    const h = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

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
      const channel   = echo.channel("reservations");
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

  const dispatchCancelSeat = (booking) => {
    const key = `seatmap:${WING}:${ROOM}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const parsed   = JSON.parse(raw);
      const tables   = Array.isArray(parsed) ? parsed : [parsed];
      const tableNum = String(booking.table_number || booking.table || "").replace(/^T/i, "");
      const updated  = tables.map(t => {
        if (tableNum && String(t.id).replace(/^T/i, "") !== tableNum) return t;
        const newSeats = t.seats.map(s => s.status === "pending" ? { ...s, status: "available" } : s);
        return { ...t, seats: newSeats };
      });
      const payload = Array.isArray(parsed) ? updated : updated[0];
      localStorage.setItem(key, JSON.stringify(payload));
      dispatchSeatMapUpdate(WING, ROOM, payload);
      setTableData(Array.isArray(payload) ? payload.filter(t => t.seats?.length > 0) : payload);
    } catch (e) { console.warn("dispatchCancelSeat failed:", e); }
  };

  const resolveTableForSeat = (seat) => {
    if (!seat || !tableData) return null;
    if (Array.isArray(tableData)) return tableData.find(t => t.seats?.some(s => s.id === seat.id)) || tableData[0] || null;
    return tableData;
  };
  const getActiveTable = () => selectedTable || (Array.isArray(tableData) ? tableData[0] : tableData) || null;

  const handleTableClick    = (table) => { setSelectedTable(table); setModal("guestCount"); };
  const handleSeatClick     = (seat)  => {
    if (seat.status === "reserved") { alert("This seat is already reserved and cannot be booked."); return; }
    setSelectedSeat(seat);
    setSelectedTable(resolveTableForSeat(seat));
  };
  const handleGuestContinue = (g)    => { setGuests(g); setModal("details"); };
  const handleReview        = (form) => { setFormData(form); setModal("review"); };
  const handleEditDetails   = ()     => { setModal("details"); };

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

      const response   = await apiCall("/reservations", { method: "POST", body: JSON.stringify(payload) });
      const newRefCode = response.reference_code || "—";
      setRefCode(newRefCode);

      setLastBookingDetails({
        room:  ROOM,
        table: `Table ${activeTable?.id ?? "—"}`,
        date:  formData.eventDate,
        name:  `${formData.firstName} ${formData.lastName}`,
      });

      if (rebookFrom) {
        try {
          await apiCall(`/reservations/${rebookFrom.db_id || rebookFrom.id}/reject`, { method: "PATCH" });
          dispatchCancelSeat(rebookFrom);
        } catch (e) {
          console.warn("[AlabangReserve] Could not cancel old booking during rebook:", e.message);
        }
      }

      if (activeTable) {
        const markPending = (tbl) => {
          if (mode === "individual") {
            return { ...tbl, seats: (tbl.seats || []).map(s => s.id === selectedSeat?.id ? { ...s, status: "pending" } : s) };
          }
          let marked = 0;
          return {
            ...tbl,
            seats: (tbl.seats || []).map(s => {
              if (marked < guests && s.status === "available") { marked++; return { ...s, status: "pending" }; }
              return s;
            }),
          };
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
    setModal(null);
    setSelectedSeat(null);
    setSelectedTable(null);
    setRefCode(null);
    setFormData(null);
    setGuests(2);
    setRebookFrom(null);
    setLastBookingDetails(null);
  };

  const handleRebookRequest = (booking) => {
    setRebookFrom(booking);
    setModal(null);
    if (booking.type) setMode(booking.type);
  };

  const isMobile    = windowSize.width < 600;
  const isTablet    = windowSize.width < 900;
  const activeTable = getActiveTable();
  const canProceed  = mode === "individual" && selectedSeat && selectedSeat.status !== "reserved";

  const displayTable = mode === "whole"
    ? (activeTable ? `Table ${activeTable.id}` : "—")
    : (selectedTable ? `Table ${selectedTable.id}` : "—");
  const displaySeat = mode === "individual"
    ? (selectedSeat ? `Seat ${selectedSeat.num ?? selectedSeat.id}` : "Select a seat")
    : getWholeSeatLabel(guests, activeTable);
  const seatRatio = activeTable ? getSeatRatio(activeTable) : null;

  const rebookPrefill = rebookFrom ? {
    firstName:       (rebookFrom.name || "").split(/\s+/)[0] || "",
    lastName:        (rebookFrom.name || "").split(/\s+/).slice(1).join(" ") || "",
    email:           rebookFrom.email || "",
    phone:           rebookFrom.phone || "",
    eventDate:       rebookFrom.event_date || rebookFrom.eventDate || "",
    eventTime:       rebookFrom.event_time || rebookFrom.eventTime || "19:00",
    specialRequests: rebookFrom.special_requests || "",
  } : null;

  const detailsPrefill = formData ? {
    firstName:       formData.firstName       || "",
    lastName:        formData.lastName        || "",
    email:           formData.email           || "",
    phone:           formData.phone           || "+63",
    eventDate:       formData.eventDate       || "",
    eventTime:       formData.eventTime       || "19:00",
    specialRequests: formData.specialRequests || "",
  } : rebookPrefill;

  const pagePadding = isMobile ? "12px 14px" : isTablet ? "20px 20px" : "32px 40px";

  return (
    <div style={s.root}>
      <MainWingNavbar active="ALABANG FUNCTION ROOM" />

      <div style={{ ...s.page, padding: pagePadding }}>

        {/* Back */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 8 }}>
          <button onClick={() => navigate("/venues")} aria-label="Back to venues"
            style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: "50%", border: "2px solid #C9A84C", color: "#C9A84C", cursor: "pointer", flexShrink: 0, transition: "background 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff";    e.currentTarget.style.color = "#C9A84C"; }}>
            <ChevronLeftIcon size={18} />
          </button>
          <div style={{ width: 28, height: 2, background: "#C9A84C", borderRadius: 2 }} />
          <div style={{ color: "#C9A84C", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: FONT }}>
            ALL VENUES
          </div>
        </div>

        {/* Rebook banner */}
        {rebookFrom && (
          <div style={{ background: "#FFF8E1", border: "1px solid #FFE082", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: "#7B5E00", letterSpacing: 0.5 }}>
                🔄 Rebooking mode — select your new {mode === "individual" ? "seat" : "table"}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: "#9B7500", marginTop: 3 }}>
                Previous booking: <strong>{rebookFrom.reference_code || rebookFrom.id}</strong> · Old seat will be released on submit.
              </div>
            </div>
            <button
              onClick={() => setRebookFrom(null)}
              style={{ background: "transparent", border: "1px solid #FFE082", borderRadius: 6, padding: "5px 12px", fontFamily: FONT, fontSize: 11, fontWeight: 700, color: "#9B7500", cursor: "pointer", letterSpacing: 0.5, flexShrink: 0 }}>
              Cancel rebook
            </button>
          </div>
        )}

        <h1 style={{ ...s.pageTitle, fontSize: isMobile ? 24 : isTablet ? 30 : 38 }}>
          Alabang Function Room
        </h1>
        <p style={{ ...s.pageSubtitle, fontSize: isMobile ? 13 : 14, marginBottom: isMobile ? 18 : 28 }}>
          Book your preferred table in the Main Wing of Alabang Function Room
        </p>

        {/* Mode toggle */}
        <div style={{ ...s.toggleBar, marginBottom: isMobile ? 16 : 24, gap: isMobile ? 10 : 20, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}>
          <span style={s.toggleLabel}>I WANT TO RESERVE A:</span>
          <div style={s.togglePillGroup}>
            <button style={{ ...s.togglePillBtn(mode === "whole"),      padding: isMobile ? "9px 18px" : "8px 22px", fontSize: isMobile ? 12 : 11 }} onClick={() => { setMode("whole");      setSelectedSeat(null); }}>Whole Table</button>
            <button style={{ ...s.togglePillBtn(mode === "individual"), padding: isMobile ? "9px 18px" : "8px 22px", fontSize: isMobile ? 12 : 11 }} onClick={() => { setMode("individual"); setSelectedTable(null); }}>Individual Seat</button>
          </div>
        </div>

        {/* Layout */}
        <div style={{ ...s.layout, flexDirection: isMobile || isTablet ? "column" : "row", gap: isMobile ? 16 : 28 }}>
          <div style={{ ...s.mapCard, minWidth: 0, width: "100%" }}>
            <SeatMap
              tableData={tableData}
              editMode={false}
              selectedSeat={selectedSeat}
              onSeatClick={handleSeatClick}
              onTableClick={handleTableClick}
              windowWidth={windowSize.width}
              wing={WING}
              room={ROOM}
            />
          </div>

          <div style={{ ...s.rightPanel, width: isMobile || isTablet ? "100%" : 260, flexDirection: "column" }}>
            {/* Legend */}
            <div style={s.legendCard}>
              <div style={s.legendTitle}>Status Legend</div>
              <div style={{ display: "flex", flexWrap: isMobile ? "wrap" : "nowrap", flexDirection: isMobile ? "row" : "column", gap: isMobile ? "6px 18px" : 0 }}>
                {Object.entries(STATUS_COLORS).map(([key, color]) => (
                  <div key={key} style={{ ...s.legendRow, marginBottom: isMobile ? 0 : 8 }}>
                    <div style={s.legendDot(color)} />
                    <span style={{ ...s.legendText, fontSize: isMobile ? 14 : 13 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection + CTA */}
            <div style={s.selCard}>
              <div style={s.selTitle}>Your Selection</div>
              <div style={s.selRow}>
                <span style={s.selLabel}>TABLE:</span>
                <span style={{ ...s.selVal, fontSize: isMobile ? 15 : 13 }}>
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
                <span style={{ ...s.selVal, color: "#C9A84C", fontSize: mode === "whole" ? (isMobile ? 12 : 11) : (isMobile ? 15 : 13) }}>{displaySeat}</span>
              </div>
              <div style={s.selRow}>
                <span style={{ ...s.selLabel, fontSize: 9 }}>ROOM:</span>
                <span style={{ ...s.selVal, fontSize: isMobile ? 12 : 11, color: "#666" }}>{ROOM}</span>
              </div>

              {mode === "whole" && (
                <button
                  style={{ ...s.ctaBtn(true), padding: isMobile ? "14px 0" : "11px 0", fontSize: isMobile ? 13 : 11 }}
                  onClick={() => setModal("guestCount")}
                  onMouseEnter={e => { e.currentTarget.style.background = "#B89635"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#C9A84C"; }}>
                  {rebookFrom ? "Move to This Table" : "Reserve This Table"}
                </button>
              )}
              {mode === "individual" && (
                <button
                  style={{ ...s.ctaBtn(canProceed), padding: isMobile ? "14px 0" : "11px 0", fontSize: isMobile ? 13 : 11 }}
                  onClick={canProceed ? () => setModal("guestCount") : undefined}>
                  {selectedSeat
                    ? (rebookFrom ? "Move to This Seat" : "Reserve This Seat")
                    : "Select a Seat First"}
                </button>
              )}
            </div>

            {/* Policy */}
            <div style={s.policyCard}>
              <div style={s.policyTitle}>Hotel Policy</div>
              <div style={{ ...s.policyText, fontSize: isMobile ? 13 : 12 }}>
                Pending seats are held for one (1) day. After expiry the seat returns to available.<br /><br />
                Reservations are confirmed only after admin approval.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

      {modal === "guestCount" && (
        <ModalGuestCount
          seatData={mode === "individual" ? selectedSeat : null}
          tableData={mode === "individual" ? resolveTableForSeat(selectedSeat) : activeTable}
          mode={mode}
          onContinue={handleGuestContinue}
          onCancel={() => setModal(null)}
        />
      )}

      {modal === "details" && (
        <ModalDetails
          tableData={activeTable}
          seatData={selectedSeat}
          mode={mode}
          guests={guests}
          onReview={handleReview}
          onCancel={() => setModal(null)}
          prefill={detailsPrefill}
        />
      )}

      {modal === "review" && formData && (
        <ModalReview
          form={formData}
          guests={guests}
          mode={mode}
          tableData={activeTable}
          seatData={selectedSeat}
          onSubmit={handleSubmit}
          onEdit={handleEditDetails}
          submitting={submitting}
          isRebook={!!rebookFrom}
          rebookFrom={rebookFrom}
        />
      )}

      {modal === "success" && (
        <ModalSuccess
          refCode={refCode}
          onBack={handleBack}
          mode={mode}
          guests={guests}
          isRebook={!!rebookFrom}
          bookingDetails={lastBookingDetails}
        />
      )}
    </div>
  );
}