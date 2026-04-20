// src/pages/BusinessCenterReserve.jsx
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SharedNavbar from "../../../components/SharedNavbar.jsx";
import SeatMap, { STATUS_COLORS } from "../../../components/seatmap/SeatMap";
import Echo from "../../../utils/websocket.js";
import bellevueLogo from "../../../assets/bellevue-logo.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const WING = "Main Wing";
const ROOM = "Business Center";

// Design Tokens
const ThemeContext = createContext({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

function getTokens(isDark) {
  return isDark
    ? {
        gold: "#C4A35A", goldLight: "#D9BC7A", goldDim: "#8C7240",
        goldFaint: "rgba(196,163,90,0.08)", goldFaintest: "rgba(196,163,90,0.04)",
        pageBg: "#0A0908", surfaceBase: "#111009", surfaceRaised: "#161410",
        surfaceInput: "rgba(255,255,255,0.04)",
        borderFaint: "rgba(255,255,255,0.04)", borderDefault: "rgba(255,255,255,0.08)",
        borderStrong: "rgba(255,255,255,0.12)", borderAccent: "rgba(196,163,90,0.30)",
        textPrimary: "#EDE8DF", textSecondary: "#8A8278",
        textTertiary: "rgba(237,232,223,0.32)", textOnAccent: "#0A0908",
        red: "#B85C5C", redFaint: "rgba(184,92,92,0.08)", redBorder: "rgba(184,92,92,0.20)",
        green: "#4A9E7E", greenFaint: "rgba(74,158,126,0.08)", greenBorder: "rgba(74,158,126,0.20)",
        badgePending:  { bg: "rgba(196,163,90,0.10)", color: "#C4A35A", dot: "#C4A35A" },
        badgeReserved: { bg: "rgba(74,158,126,0.10)", color: "#4A9E7E", dot: "#4A9E7E" },
        badgeRejected: { bg: "rgba(184,92,92,0.10)", color: "#B85C5C", dot: "#B85C5C" },
        headerGradient: "linear-gradient(180deg, #161410 0%, #111009 100%)",
        modalOverlay: "rgba(10,9,8,0.75)",
        bottomSheet: "rgba(17,16,9,0.98)",
        inputFocusShadow: "0 0 0 3px rgba(196,163,90,0.20)",
        shadowHov: "0 8px 32px rgba(0,0,0,0.12)",
        shadow: "0 4px 16px rgba(0,0,0,0.08)",
        divider: "rgba(255,255,255,0.08)",
      }
    : {
        gold: "#C4A35A", goldLight: "#D9BC7A", goldDim: "#8C7240",
        goldFaint: "rgba(196,163,90,0.08)", goldFaintest: "rgba(196,163,90,0.04)",
        pageBg: "#F7F4EE", surfaceBase: "#FFFFFF", surfaceRaised: "#FFFFFF",
        surfaceInput: "rgba(10,9,8,0.04)",
        borderFaint: "rgba(10,9,8,0.04)", borderDefault: "rgba(10,9,8,0.08)",
        borderStrong: "rgba(10,9,8,0.12)", borderAccent: "rgba(196,163,90,0.30)",
        textPrimary: "#0A0908", textSecondary: "#5A534A",
        textTertiary: "rgba(10,9,8,0.32)", textOnAccent: "#FFFFFF",
        red: "#B85C5C", redFaint: "rgba(184,92,92,0.08)", redBorder: "rgba(184,92,92,0.20)",
        green: "#4A9E7E", greenFaint: "rgba(74,158,126,0.08)", greenBorder: "rgba(74,158,126,0.20)",
        badgePending:  { bg: "rgba(196,163,90,0.10)", color: "#C4A35A", dot: "#C4A35A" },
        badgeReserved: { bg: "rgba(74,158,126,0.10)", color: "#4A9E7E", dot: "#4A9E7E" },
        badgeRejected: { bg: "rgba(184,92,92,0.10)", color: "#B85C5C", dot: "#B85C5C" },
        headerGradient: "linear-gradient(180deg, #FFFFFF 0%, #F7F4EE 100%)",
        modalOverlay: "rgba(247,244,238,0.75)",
        bottomSheet: "rgba(247,244,238,0.98)",
        inputFocusShadow: "0 0 0 3px rgba(196,163,90,0.20)",
        shadowHov: "0 8px 32px rgba(0,0,0,0.12)",
        shadow: "0 4px 16px rgba(0,0,0,0.08)",
        divider: "rgba(10,9,8,0.08)",
      };
}

const FONT = "'Inter','Helvetica Neue',Arial,sans-serif";

// Persistence helpers
function layoutKey(wing, room) { return `seatmap_layout:${wing}:${room}`; }

function mergeApiStatusIntoLayout(localLayout, apiData) {
  if (!localLayout || !apiData) return localLayout;
  if (!apiData.tables) return localLayout;
  
  const updated = { ...localLayout };
  updated.tables = updated.tables.map(localTable => {
    const apiTable = apiData.tables.find(t => t.id === localTable.id);
    if (!apiTable) return localTable;
    
    return {
      ...localTable,
      status: apiTable.status || localTable.status,
      seats: localTable.seats.map(localSeat => {
        const apiSeat = apiTable.seats?.find(s => s.id === localSeat.id);
        if (!apiSeat) return localSeat;
        return { ...localSeat, status: apiSeat.status || localSeat.status };
      })
    };
  });
  
  return updated;
}

function loadLayoutForClient(wing, room) {
  try {
    const raw = localStorage.getItem(layoutKey(wing, room));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.v === 2) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveLayoutForClient(wing, room, layout) {
  try { localStorage.setItem(layoutKey(wing, room), JSON.stringify(layout)); } catch {}
}

function loadLayoutForAdmin(wing, room) {
  try {
    const raw = localStorage.getItem(`admin_${layoutKey(wing, room)}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLayoutForAdmin(wing, room, layout) {
  try { localStorage.setItem(`admin_${layoutKey(wing, room)}`, JSON.stringify(layout)); } catch {}
}

// API
function getSeatRatio(table) {
  if (!table?.seats) return 0;
  const total = table.seats.length;
  const available = table.seats.filter(s => s.status === "available").length;
  return total > 0 ? available / total : 0;
}

function getWholeSeatLabel(guests, table) {
  if (!table?.seats) return `${guests} Guests`;
  const total = table.seats.length;
  const available = table.seats.filter(s => s.status === "available").length;
  return `${guests} Guests (${available}/${total} seats available)`;
}

// Shared Primitives
function Spinner({ size = 13, C }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size,
      borderBottom: `${size/4}px solid ${C.goldFaintest}`,
      borderLeft: `${size/4}px solid ${C.goldFaintest}`,
      borderRight: `${size/4}px solid ${C.goldFaintest}`,
      borderTop: `${size/4}px solid ${C.gold}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    }} />
  );
}

function SectionLabel({ children, C, style = {} }) {
  return (
    <div style={{
      fontFamily: FONT, fontSize: 9, letterSpacing: "0.20em",
      color: C.gold, fontWeight: 700, textTransform: "uppercase",
      marginBottom: 12, ...style
    }}>
      {children}
    </div>
  );
}

function CloseBtn({ onClick, disabled = false, C }) {
  return (
    <button onClick={onClick} disabled={disabled} title="Close"
      style={{
        width: 32, height: 32, borderRadius: "50%", background: "transparent",
        border: `1px solid ${C.borderDefault}`, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.18s", flexShrink: 0,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = C.borderAccent; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.borderColor = C.borderDefault; }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

function ModalShell({ children, onClose, disabled, C, maxWidth = 500 }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: C.modalOverlay, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget && !disabled) onClose(); }}
    >
      <div style={{ background: C.surfaceBase, borderRadius: 16, boxShadow: C.shadowHov, maxWidth: maxWidth, width: "100%", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${C.borderDefault}` }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ eyebrow, title, onClose, disabled, C, meta }) {
  return (
    <div style={{ background: C.headerGradient, padding: "20px 22px 18px", position: "sticky", top: 0, zIndex: 2, borderBottom: `1px solid ${C.divider}` }}>
      <div style={{ position: "absolute", top: 14, right: 16, zIndex: 20 }}>
        <CloseBtn onClick={onClose} disabled={disabled} C={C} />
      </div>
      {eyebrow && <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.22em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{eyebrow}</div>}
      <div style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 20, fontWeight: 700, color: C.textPrimary, lineHeight: 1.2, paddingRight: 32 }}>{title}</div>
      {meta && <div style={{ marginTop: 12 }}>{meta}</div>}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled = false, loading = false, C, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{ width: "100%", padding: "13px", background: disabled ? C.textTertiary : C.gold, border: "none", borderRadius: 8, fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: disabled ? C.textSecondary : C.textOnAccent, cursor: disabled || loading ? "not-allowed" : "pointer", transition: "all 0.20s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, ...style }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = C.goldLight; }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.background = C.gold; }}
    >
      {loading && <Spinner size={13} C={C} />}
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, disabled = false, C, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: "100%", padding: "12px", background: "transparent", border: `1px solid ${C.borderDefault}`, borderRadius: 8, fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.textSecondary, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.18s", ...style }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; } }}
    >
      {children}
    </button>
  );
}

// Step Indicator
function StepIndicator({ step, C }) {
  const steps = ["Guest Count", "Details", "Confirm"];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginTop: 16 }}>
      {steps.map((label, i) => {
        const idx = i + 1; const done = step > idx; const active = step === idx;
        return (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: done ? C.gold : active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)", border: done || active ? "none" : "1.5px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                {done ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textOnAccent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: active ? C.gold : C.textTertiary }}>{idx}</span>
                )}
              </div>
              {i < steps.length - 1 && <div style={{ width: 32, height: 2, background: done ? C.gold : "rgba(255,255,255,0.06)", marginTop: 13 }} />}
            </div>
            <div style={{ marginLeft: 8, marginTop: 2 }}>
              <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: done ? C.textPrimary : active ? C.gold : C.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Input Field
function Input({ label, required = false, type = "text", placeholder, value, onChange, disabled = false, C }) {
  const [focused, setFocused] = useState(false);
  const isTextarea = type === "textarea";
  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "11px 14px", border: `1.5px solid ${focused ? C.borderAccent : C.borderDefault}`, borderRadius: 8, background: C.surfaceInput, fontFamily: FONT, fontSize: 13, color: C.textPrimary, outline: "none", transition: "border-color 0.18s, box-shadow 0.18s", boxShadow: focused ? C.inputFocusShadow : "none", colorScheme: "dark", resize: isTextarea ? "vertical" : undefined, minHeight: isTextarea ? 72 : undefined };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: focused ? C.gold : C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 7, transition: "color 0.18s" }}>
        {label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
      </label>
      {isTextarea ? (
        <textarea style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} />
      ) : (
        <input type={type} style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} />
      )}
    </div>
  );
}

// Guest Count Modal
function GuestCountModal({ mode, seatData, tableData, guests, onCancel, onContinue, C }) {
  const [localGuests, setLocalGuests] = useState(guests);
  const handleContinue = () => onContinue(localGuests);
  const canGo = localGuests >= 1 && localGuests <= 12;
  const seatRatio = tableData ? getSeatRatio(tableData) : null;
  const seatColors = seatRatio !== null ? [
    seatRatio > 0.5 ? C.green : seatRatio > 0.2 ? C.gold : C.red,
    seatData?.status === "available" ? C.green : C.gold,
  ] : [];
  return (
    <ModalShell onClose={onCancel} C={C}>
      <ModalHeader eyebrow={mode === "individual" ? "Seat Reservation" : "Table Reservation"} title={mode === "individual" ? "Reserve This Seat" : "Reserve This Table"} onClose={onCancel} C={C} meta={<StepIndicator step={1} C={C} />} />
      <div style={{ padding: "22px 24px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: mode === "individual" ? "linear-gradient(135deg, #C4A35A, #D9BC7A)" : "linear-gradient(135deg, #4A9E7E, #6AB89A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {mode === "individual" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m23 21-3.5-3.5M21 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>
              {mode === "individual" ? `Seat ${seatData?.num ?? seatData?.id}` : `Table ${tableData?.id}`}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: C.textSecondary }}>
              {mode === "whole" ? getWholeSeatLabel(localGuests, tableData) : seatData ? `Seat ${seatData.num ?? seatData.id}` : "Seat 1"}
            </div>
          </div>
        </div>
        <SectionLabel C={C}>Number of Guests</SectionLabel>
        <Input label="Guests" type="number" placeholder="Enter number of guests" value={localGuests} onChange={v => setLocalGuests(Math.max(1, Math.min(12, parseInt(v) || 1)))} C={C} />
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <GhostBtn onClick={onCancel} C={C}>Cancel</GhostBtn>
          <PrimaryBtn onClick={handleContinue} disabled={!canGo} C={C}>Continue</PrimaryBtn>
        </div>
      </div>
    </ModalShell>
  );
}

// Details Modal
function DetailsModal({ mode, seatData, tableData, guests, onCancel, onContinue, onEdit, C, defaultValues = {} }) {
  const [formData, setFormData] = useState({
    firstName: defaultValues.firstName || "",
    lastName: defaultValues.lastName || "",
    email: defaultValues.email || "",
    phone: defaultValues.phone || "+63",
    eventDate: defaultValues.eventDate || "",
    eventTime: defaultValues.eventTime || "19:00",
    specialRequests: defaultValues.specialRequests || "",
  });
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleContinue = () => onContinue(formData);
  const canGo = formData.firstName && formData.lastName && formData.email && formData.phone && formData.eventDate && formData.eventTime;
  const seatDisplay = mode === "whole" ? getWholeSeatLabel(guests, tableData) : seatData ? `Seat ${seatData.num ?? seatData.id}` : "Seat 1";
  return (
    <ModalShell onClose={onCancel} C={C}>
      <ModalHeader eyebrow={mode === "individual" ? "Seat Reservation" : "Table Reservation"} title="Your Information" onClose={onCancel} C={C} meta={<StepIndicator step={2} C={C} />} />
      <div style={{ padding: "18px 24px 26px", maxHeight: "64vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px", background: C.surfaceRaised, borderRadius: 8, border: `1px solid ${C.borderDefault}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: mode === "individual" ? "linear-gradient(135deg, #C4A35A, #D9BC7A)" : "linear-gradient(135deg, #4A9E7E, #6AB89A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {mode === "individual" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m23 21-3.5-3.5M21 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>
              {mode === "individual" ? `Seat ${seatData?.num ?? seatData?.id}` : `Table ${tableData?.id}`}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 10, color: C.textSecondary }}>{seatDisplay}</div>
          </div>
        </div>
        <SectionLabel C={C}>Contact Information</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
          <Input label="First Name" placeholder="John" value={formData.firstName} onChange={v => handleChange("firstName", v)} required C={C} />
          <Input label="Last Name" placeholder="Doe" value={formData.lastName} onChange={v => handleChange("lastName", v)} required C={C} />
        </div>
        <Input label="Email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={v => handleChange("email", v)} required C={C} />
        <Input label="Phone" type="tel" placeholder="+63 912 345 6789" value={formData.phone} onChange={v => handleChange("phone", v)} required C={C} />
        <SectionLabel C={C}>Event Details</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
          <Input label="Event Date" type="date" value={formData.eventDate} onChange={v => handleChange("eventDate", v)} required C={C} />
          <Input label="Event Time" type="time" value={formData.eventTime} onChange={v => handleChange("eventTime", v)} required C={C} />
        </div>
        <Input label="Special Requests" type="textarea" placeholder="Any special requirements or preferences..." value={formData.specialRequests} onChange={v => handleChange("specialRequests", v)} C={C} />
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <GhostBtn onClick={onCancel} C={C}>Cancel</GhostBtn>
          <PrimaryBtn onClick={handleContinue} disabled={!canGo} C={C}>Continue</PrimaryBtn>
        </div>
      </div>
    </ModalShell>
  );
}

// Review Modal
function ReviewModal({ mode, seatData, tableData, guests, formData, onCancel, onConfirm, onEdit, C, isRebook = false, rebookFrom = null }) {
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };
  const seatDisplay = mode === "whole" ? getWholeSeatLabel(guests, tableData) : seatData ? `Seat ${seatData.num ?? seatData.id}` : "Seat 1";
  return (
    <ModalShell onClose={onEdit} disabled={submitting} C={C}>
      <ModalHeader eyebrow={isRebook ? "Rebook / Move Seat" : mode === "individual" ? "Seat Reservation" : "Table Reservation"} title="Review Your Booking" onClose={onEdit} disabled={submitting} C={C} meta={<StepIndicator step={3} C={C} />} />
      <div style={{ padding: "20px 24px 26px", maxHeight: "64vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24, padding: "16px", background: C.surfaceRaised, borderRadius: 12, border: `1px solid ${C.borderDefault}` }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: mode === "individual" ? "linear-gradient(135deg, #C4A35A, #D9BC7A)" : "linear-gradient(135deg, #4A9E7E, #6AB89A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {mode === "individual" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m23 21-3.5-3.5M21 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>
              {mode === "individual" ? `Seat ${seatData?.num ?? seatData?.id}` : `Table ${tableData?.id}`}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: C.textSecondary }}>{seatDisplay}</div>
          </div>
        </div>
        <SectionLabel C={C}>Guest Information</SectionLabel>
        <div style={{ background: C.surfaceRaised, borderRadius: 8, padding: 16, marginBottom: 20, border: `1px solid ${C.borderDefault}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Name</div>
              <div style={{ fontFamily: FONT, fontSize: 13, color: C.textPrimary }}>{formData.firstName} {formData.lastName}</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Guests</div>
              <div style={{ fontFamily: FONT, fontSize: 13, color: C.textPrimary }}>{guests} Guest{guests > 1 ? "s" : ""}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: formData.specialRequests ? 16 : 0 }}>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Email</div>
              <div style={{ fontFamily: FONT, fontSize: 13, color: C.textPrimary, wordBreak: "break-all" }}>{formData.email}</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Phone</div>
              <div style={{ fontFamily: FONT, fontSize: 13, color: C.textPrimary }}>{formData.phone}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 0 }}>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Date</div>
              <div style={{ fontFamily: FONT, fontSize: 13, color: C.textPrimary }}>{new Date(formData.eventDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Time</div>
              <div style={{ fontFamily: FONT, fontSize: 13, color: C.textPrimary }}>{formData.eventTime}</div>
            </div>
          </div>
          {formData.specialRequests && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.borderDefault}` }}>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Special Requests</div>
              <div style={{ fontFamily: FONT, fontSize: 13, color: C.textPrimary, lineHeight: 1.5 }}>{formData.specialRequests}</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <GhostBtn onClick={onEdit} disabled={submitting} C={C}>Edit Details</GhostBtn>
          <PrimaryBtn onClick={handleSubmit} disabled={submitting} loading={submitting} C={C}>
            {isRebook ? "Confirm Rebook" : "Confirm Reservation"}
          </PrimaryBtn>
        </div>
      </div>
    </ModalShell>
  );
}

// QR Code Component
function QRCode({ value, size = 160, C }) {
  const [imgSrc, setImgSrc] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const doRender = () => {
      if (cancelled || !value) return;
      try {
        const qr = new QRCode(document.createElement("div"), {
          text: value,
          width: size,
          height: size,
          colorDark: C.textPrimary,
          colorLight: C.surfaceBase,
          correctLevel: QRCode.CorrectLevel.H,
        });
        const canvas = qr._el.querySelector("canvas");
        if (canvas && !cancelled) setImgSrc(canvas.toDataURL());
      } catch (e) { console.error("[QRCode] Failed to generate QR:", e); }
    };
    if (window.QRCode) {
      doRender();
    } else {
      const existing = document.querySelector('script[data-qrcodejs="1"]');
      if (existing) existing.addEventListener("load", doRender);
      else {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
        script.setAttribute("data-qrcodejs", "1");
        script.onload = doRender;
        document.head.appendChild(script);
      }
    }
    return () => { cancelled = true; };
  }, [value, size]);
  if (!imgSrc) return <div style={{ width: size, height: size, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(237,232,223,0.20)", fontFamily: FONT }}>QR</div>;
  return <img src={imgSrc} alt="QR Code" style={{ width: size, height: size, borderRadius: 8, border: `1px solid ${C.borderDefault}` }} />;
}

// Confirmation Modal
function ConfirmationModal({ refCode, mode, seatData, tableData, guests, formData, onBack, onNewReservation, C }) {
  const [qrReady, setQrReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const qrImgRef = useRef(null);
  useEffect(() => {
    let tries = 0;
    const poll = setInterval(() => {
      if (qrImgRef.current) { setQrReady(true); clearInterval(poll); }
      if (++tries > 20) clearInterval(poll);
    }, 100);
    return () => clearInterval(poll);
  }, []);
  const handleSavePhoto = useCallback(async () => {
    if (!qrReady || !qrImgRef.current || saving) return;
    setSaving(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const qrSize = 256;
      canvas.width = qrSize;
      canvas.height = qrSize + 80;
      ctx.fillStyle = C.surfaceBase;
      ctx.fillRect(0, 0, qrSize, qrSize + 80);
      const qrImg = qrImgRef.current.querySelector("img");
      if (qrImg) {
        ctx.drawImage(qrImg, 0, 0, qrSize, qrSize);
        ctx.fillStyle = C.textPrimary;
        ctx.font = "bold 20px 'Inter'";
        ctx.textAlign = "center";
        ctx.fillText("Business Center", qrSize / 2, qrSize + 35);
        ctx.font = "14px 'Inter'";
        ctx.fillText(`Ref: ${refCode}`, qrSize / 2, qrSize + 55);
      }
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `business-center-qr-${refCode}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (err) { console.error("[ConfirmationModal] Failed to save QR photo:", err); }
    finally { setSaving(false); }
  }, [refCode, saving, qrReady, C]);
  const seatDisplay = mode === "whole" ? getWholeSeatLabel(guests, tableData) : seatData ? `Seat ${seatData.num ?? seatData.id}` : "Seat 1";
  return (
    <ModalShell onClose={onBack} C={C} maxWidth={460}>
      <div style={{ padding: "26px 26px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #4A9E7E, #6AB89A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>Reservation Confirmed</div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: C.textSecondary }}>Your booking has been successfully placed</div>
          </div>
        </div>
        <div style={{ background: C.surfaceRaised, borderRadius: 12, padding: 20, marginBottom: 20, border: `1px solid ${C.borderDefault}` }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div ref={qrImgRef} style={{ display: "flex", justifyContent: "center" }}>
              <QRCode value={refCode} size={160} C={C} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Reference Code</div>
              <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.gold, letterSpacing: "0.08em", marginBottom: 8 }}>{refCode}</div>
              <div style={{ fontFamily: FONT, fontSize: 10, color: C.textSecondary, marginBottom: 12 }}>Save this code for check-in</div>
              <button onClick={handleSavePhoto} disabled={!qrReady || saving}
                style={{ padding: "6px 12px", background: qrReady && !saving ? C.gold : C.textTertiary, border: "none", borderRadius: 6, fontFamily: FONT, fontSize: 9, fontWeight: 600, color: qrReady && !saving ? C.textOnAccent : C.textSecondary, cursor: qrReady && !saving ? "pointer" : "not-allowed", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 6, alignSelf: "center" }}
                onMouseEnter={e => { if (qrReady && !saving) e.currentTarget.style.background = C.goldLight; }}
                onMouseLeave={e => { if (qrReady && !saving) e.currentTarget.style.background = C.gold; }}
              >
                {saving ? <Spinner size={10} C={C} /> : <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
                {saving ? "Saving..." : "Save QR Photo"}
              </button>
            </div>
          </div>
        </div>
        <div style={{ background: C.surfaceRaised, borderRadius: 8, padding: 16, marginBottom: 20, border: `1px solid ${C.borderDefault}` }}>
          <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Booking Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, fontSize: 11, color: C.textPrimary }}>
            <div>
              <div style={{ color: C.textSecondary, marginBottom: 2 }}>Guest</div>
              <div>{formData.firstName} {formData.lastName}</div>
            </div>
            <div>
              <div style={{ color: C.textSecondary, marginBottom: 2 }}>Guests</div>
              <div>{guests}</div>
            </div>
            <div>
              <div style={{ color: C.textSecondary, marginBottom: 2 }}>Date</div>
              <div>{new Date(formData.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
            </div>
            <div>
              <div style={{ color: C.textSecondary, marginBottom: 2 }}>Time</div>
              <div>{formData.eventTime}</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ color: C.textSecondary, marginBottom: 2 }}>Seat/Table</div>
              <div>{seatDisplay}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <GhostBtn onClick={onBack} C={C}>Back to Venue</GhostBtn>
          <PrimaryBtn onClick={onNewReservation} C={C}>Make New Reservation</PrimaryBtn>
        </div>
      </div>
    </ModalShell>
  );
}

// Bottom Sheet
function BottomSheet({ mode, selectedSeat, selectedTable, guests, activeTable, canProceed, onReserve, C, rebookFrom = null }) {
  const displayTable = mode === "whole" ? (activeTable ? `Table ${activeTable.id}` : "T1") : (selectedTable ? `Table ${selectedTable.id}` : "T1");
  const displaySeat = mode === "individual" ? (selectedSeat ? `Seat ${selectedSeat.num ?? selectedSeat.id}` : "Select a seat") : getWholeSeatLabel(guests, activeTable);
  const canGo = mode === "whole" ? true : canProceed;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: C.bottomSheet, borderTop: `1px solid ${C.borderAccent}`, borderRadius: "20px 20px 0 0", boxShadow: "0 -8px 32px rgba(0,0,0,0.28)", padding: "0 0 max(env(safe-area-inset-bottom), 12px) 0", animation: "slideUp 0.26s cubic-bezier(0.16,1,0.3,1)" }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: C.borderDefault, margin: "8px auto 12px" }} />
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: mode === "individual" ? "linear-gradient(135deg, #C4A35A, #D9BC7A)" : "linear-gradient(135deg, #4A9E7E, #6AB89A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {mode === "individual" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m23 21-3.5-3.5M21 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>
              {mode === "individual" ? "Individual Seat" : "Whole Table"}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 10, color: C.textSecondary }}>{displaySeat}</div>
          </div>
        </div>
        <button onClick={canGo ? onReserve : undefined} disabled={!canGo}
          style={{ width: "100%", padding: "13px", background: canGo ? C.gold : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"), border: "none", borderRadius: 8, fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: canGo ? C.textOnAccent : C.textTertiary, cursor: canGo ? "pointer" : "not-allowed", transition: "all 0.20s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onMouseEnter={e => { if (canGo) e.currentTarget.style.background = C.goldLight; }}
          onMouseLeave={e => { if (canGo) e.currentTarget.style.background = C.gold; }}
        >
          {mode === "whole"
            ? (rebookFrom ? "Move to This Table" : "Reserve This Table")
            : selectedSeat ? (rebookFrom ? "Move to This Seat" : "Reserve This Seat") : "Select a Seat First"
          }
        </button>
      </div>
    </div>
  );
}

export default function BusinessCenterReserve() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const C = getTokens(isDark);
  const navigate = useNavigate();
  const location = useLocation();

  const [mode,               setMode]               = useState("whole");
  const [selectedSeat,       setSelectedSeat]       = useState(null);
  const [selectedTable,      setSelectedTable]      = useState(null);
  const [windowSize,         setWindowSize]         = useState({ width: window.innerWidth, height: window.innerHeight });
  const [modal,              setModal]              = useState(null);
  const [guests,             setGuests]             = useState(2);
  const [formData,           setFormData]           = useState(null);
  const [refCode,            setRefCode]            = useState(null);
  const [submitting,         setSubmitting]         = useState(false);
  const [rebookFrom,         setRebookFrom]         = useState(null);
  const [lastBookingDetails, setLastBookingDetails] = useState(null);
  const [tableData,          setTableData]          = useState(() => loadLayoutForClient(WING, ROOM));

  const [holdSecondsLeft, setHoldSecondsLeft] = useState(24 * 60);
  const holdStartedRef = useRef(false);
  const echoRef = useRef(null);

  const startHoldTimer = useCallback(() => {
    if (holdStartedRef.current) return;
    holdStartedRef.current = true;
    setHoldSecondsLeft(24 * 60);
    const id = setInterval(() => {
      setHoldSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          holdStartedRef.current = false;
          setModal(null);
          setSelectedSeat(null);
          setSelectedTable(null);
          return 24 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [modal, holdSecondsLeft]);

  useEffect(() => {
    const onStorage = e => {
      if (e.key !== layoutKey(WING, ROOM)) return;
      try { const parsed = e.newValue ? JSON.parse(e.newValue) : null; if (parsed?.v === 2) setTableData(parsed); } catch {}
    };
    const onSeatMapSaved = e => {
      if (e.detail?.wing !== WING || e.detail?.room !== ROOM) return;
      try { const parsed = e.detail.payload ? JSON.parse(e.detail.payload) : null; if (parsed?.v === 2) setTableData(parsed); } catch {}
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("seatmap:saved", onSeatMapSaved);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("seatmap:saved", onSeatMapSaved); };
  }, []);

  useEffect(() => {
    const localLayout = loadLayoutForClient(WING, ROOM);
    if (localLayout) setTableData(localLayout);
    const fetchAndMerge = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/rooms/${encodeURIComponent(WING)}/${encodeURIComponent(ROOM)}/seats`, { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.data) return;
        setTableData(prev => { const base = prev || localLayout; if (!base) return data.data; return mergeApiStatusIntoLayout(base, data.data); });
        setTableData(merged => { try { localStorage.setItem(layoutKey(WING, ROOM), JSON.stringify(merged)); } catch {} return merged; });
      } catch (err) { console.error("[BusinessCenterReserve] Failed to fetch seat status:", err); }
    };
    fetchAndMerge();
  }, []);

  useEffect(() => {
    const h = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
    if (!echoRef.current && pusherKey && pusherKey !== "your_key") {
      try { echoRef.current = new Echo({ broadcaster: "pusher", key: pusherKey, cluster: pusherCluster }); } catch { return; }
    }
    const echo = echoRef.current; if (!echo) return;
    try {
      const channel = echo.channel(`seatmap.${WING}.${ROOM}`);
      const syncSeats = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/rooms/${encodeURIComponent(WING)}/${encodeURIComponent(ROOM)}/seats`, { headers: { Accept: "application/json" } });
          if (res.ok) { const data = await res.json(); if (data?.data) setTableData(prev => mergeApiStatusIntoLayout(prev, data.data)); }
        } catch {}
      };
      ["ReservationCreated","ReservationUpdated","ReservationDeleted","SeatReserved","TableReserved"].forEach(e => channel.listen(e, syncSeats));
      return () => { try { ["ReservationCreated","ReservationUpdated","ReservationDeleted","SeatReserved","TableReserved"].forEach(e => channel.stopListening(e)); } catch {} };
    } catch {}
  }, []);

  const getTables           = () => { if (!tableData) return []; if (tableData.tables) return tableData.tables; if (Array.isArray(tableData)) return tableData; return [tableData]; };
  const resolveTableForSeat = seat => { if (!seat) return null; const tables = getTables(); return tables.find(t => t.seats?.some(s => s.id === seat.id)) || tables[0] || null; };
  const getActiveTable      = () => selectedTable || getTables()[0] || null;

  const handleTableClick    = table => { setSelectedTable(table); setModal("guestCount"); };
  const handleSeatClick     = seat  => {
    if (seat.status === "reserved") { alert("This seat is already reserved and cannot be booked."); return; }
    setSelectedSeat(seat); setSelectedTable(resolveTableForSeat(seat));
  };
  const handleGuestContinue = g => { setGuests(g); startHoldTimer(); setModal("details"); };
  const handleReview        = form => { setFormData(form); setModal("review"); };
  const handleEditDetails   = ()   => setModal("details");

  const handleSubmit = async () => {
    if (!formData || submitting) return;
    setSubmitting(true);
    try {
      const activeTable = getActiveTable();
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email, phone: formData.phone,
        event_date: formData.eventDate, event_time: formData.eventTime,
        special_requests: formData.specialRequests,
        guests: guests,
        status: "pending",
        wing: WING, room: ROOM,
        venue_id: 7, // Business Center venue ID
        ...(mode === "individual" && selectedSeat ? { seat_id: selectedSeat.id } : {}),
        ...(mode === "whole" && activeTable ? { table_id: activeTable.id } : {}),
        ...(rebookFrom && { rebook_from: rebookFrom.id }),
      };
      const res = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Submission failed"); }
      const data = await res.json();
      if (data.data?.reference_code) setRefCode(data.data.reference_code);
      if (data.data) setLastBookingDetails(data.data);
      const updated = { ...tableData };
      if (mode === "whole" && activeTable) {
        updated.tables = updated.tables.map(t => {
          if (t.id === activeTable.id) {
            const marked = Math.min(guests, t.seats.filter(s => s.status === "available").length);
            return { ...t, seats: t.seats.map(s => { if (marked < guests && s.status === "available") { marked++; return { ...s, status: "pending" }; } return s; }) };
          }
          return t;
        });
        try { localStorage.setItem(layoutKey(WING, ROOM), JSON.stringify(updated)); } catch {}
        setTableData(updated);
      } else if (mode === "individual" && selectedSeat) {
        updated.tables = updated.tables.map(t => ({
          ...t,
          seats: t.seats.map(s => (s.id === selectedSeat.id ? { ...s, status: "pending" } : s))
        }));
        try { localStorage.setItem(layoutKey(WING, ROOM), JSON.stringify(updated)); } catch {}
        setTableData(updated);
      }
      setModal("confirmation");
    } catch (err) {
      console.error("[BusinessCenterReserve] Submit failed:", err);
      alert(err.message || "Failed to submit reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToVenue = () => {
    setModal(null);
    setSelectedSeat(null);
    setSelectedTable(null);
    setFormData(null);
    setRefCode(null);
    setRebookFrom(null);
    navigate("/venues");
  };

  const handleNewReservation = () => {
    setModal(null);
    setSelectedSeat(null);
    setSelectedTable(null);
    setFormData(null);
    setRefCode(null);
    setRebookFrom(null);
  };

  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width < 1024;
  const activeTable = getActiveTable();
  const canProceed  = mode === "individual" && selectedSeat && selectedSeat.status !== "reserved";
  const canGo       = mode === "whole" ? true : canProceed;
  const seatRatio   = activeTable ? getSeatRatio(activeTable) : null;

  const displayTable = mode === "whole" ? (activeTable ? `Table ${activeTable.id}` : "T1") : (selectedTable ? `Table ${selectedTable.id}` : "T1");
  const displaySeat  = mode === "individual" ? (selectedSeat ? `Seat ${selectedSeat.num ?? selectedSeat.id}` : "Select a seat") : getWholeSeatLabel(guests, activeTable);

  const rebookPrefill  = rebookFrom ? { firstName: (rebookFrom.name || "").split(/\s+/)[0] || "", lastName: (rebookFrom.name || "").split(/\s+/).slice(1).join(" ") || "", email: rebookFrom.email || "", phone: rebookFrom.phone || "", eventDate: rebookFrom.event_date || "", eventTime: rebookFrom.event_time || "19:00", specialRequests: rebookFrom.special_requests || "" } : null;
  const detailsPrefill = formData ? { firstName: formData.firstName || "", lastName: formData.lastName || "", email: formData.email || "", phone: formData.phone || "+63", eventDate: formData.eventDate || "", eventTime: formData.eventTime || "19:00", specialRequests: formData.specialRequests || "" } : rebookPrefill;

  const BOTTOM_SHEET_H = 180;
  const NAV_H = 64;
  const mobileMapHeight = windowSize.height - NAV_H - BOTTOM_SHEET_H;

  return (
    <ThemeContext.Provider value={{ isDark, toggle: toggleTheme }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div style={{ minHeight: "100vh", fontFamily: FONT, background: C.pageBg, transition: "background 0.30s", position: "relative" }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${bellevueLogo}')`, backgroundSize: "cover", backgroundPosition: "center", filter: isDark ? "blur(6px) brightness(0.35)" : "blur(6px) brightness(0.45) saturate(0.4)", transform: "scale(1.05)", transition: "filter 0.40s" }} />
          <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(12,11,10,0.75)" : "rgba(247,244,238,0.65)", transition: "background 0.40s" }} />
        </div>

        <SharedNavbar isDark={isDark} toggle={toggleTheme} showNavigation={false} />

        {/* MOBILE LAYOUT */}
        {isMobile ? (
          <div style={{ position: "relative", zIndex: 1, paddingTop: NAV_H }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px 8px", background: isDark ? "rgba(10,9,8,0.85)" : "rgba(247,244,238,0.90)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${C.borderAccent}` }}>
              <button onClick={() => navigate("/venues")} title="Back"
                style={{ width: 34, height: 34, borderRadius: "50%", background: "transparent", border: `1px solid ${C.borderDefault}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT, fontSize: 8, letterSpacing: "0.22em", color: C.gold, fontWeight: 700, textTransform: "uppercase" }}>Seat Reservation</div>
                <div style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 15, fontWeight: 600, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Business Center</div>
              </div>
              {holdSecondsLeft < 24 * 60 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "rgba(196,163,90,0.10)", borderRadius: 6, border: `1px solid rgba(196,163,90,0.20)` }}>
                  <Spinner size={10} C={C} />
                  <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.gold }}>
                    {Math.floor(holdSecondsLeft / 60)}:{(holdSecondsLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
            <div style={{ height: mobileMapHeight, position: "relative" }}>
              {tableData && (
                <SeatMap
                  layout={tableData}
                  mode={mode}
                  selectedSeat={selectedSeat}
                  selectedTable={selectedTable}
                  onSeatClick={handleSeatClick}
                  onTableClick={handleTableClick}
                  showControls={false}
                  compact={true}
                  C={C}
                />
              )}
            </div>
            <BottomSheet
              mode={mode}
              selectedSeat={selectedSeat}
              selectedTable={selectedTable}
              guests={guests}
              activeTable={activeTable}
              canProceed={canProceed}
              onReserve={() => setModal("guestCount")}
              C={C}
              rebookFrom={rebookFrom}
            />
          </div>
        ) : (
          /* DESKTOP LAYOUT */
          <div style={{ position: "relative", zIndex: 1, paddingTop: NAV_H, minHeight: "calc(100vh - 64px)" }}>
            <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
              {/* Left Panel - Seat Map */}
              <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => navigate("/venues")} title="Back"
                    style={{ width: 40, height: 40, borderRadius: "50%", background: C.surfaceBase, border: `1px solid ${C.borderDefault}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", transition: "all 0.18s", padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderAccent}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.borderDefault}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                  <div style={{ background: C.surfaceBase, padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.borderDefault}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                    <div style={{ fontFamily: FONT, fontSize: 10, letterSpacing: "0.22em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Business Center</div>
                    <div style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 16, fontWeight: 600, color: C.textPrimary }}>Seat Reservation</div>
                  </div>
                  {holdSecondsLeft < 24 * 60 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(196,163,90,0.10)", borderRadius: 8, border: `1px solid rgba(196,163,90,0.20)` }}>
                      <Spinner size={12} C={C} />
                      <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.gold }}>
                        Hold: {Math.floor(holdSecondsLeft / 60)}:{(holdSecondsLeft % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ width: "100%", height: "100%", position: "relative", padding: "80px 20px 20px" }}>
                  {tableData && (
                    <SeatMap
                      layout={tableData}
                      mode={mode}
                      selectedSeat={selectedSeat}
                      selectedTable={selectedTable}
                      onSeatClick={handleSeatClick}
                      onTableClick={handleTableClick}
                      showControls={true}
                      compact={false}
                      C={C}
                    />
                  )}
                </div>
              </div>
              {/* Right Panel - Info & Actions */}
              <div style={{ width: 380, background: C.surfaceBase, borderLeft: `1px solid ${C.borderDefault}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "24px 24px 20px", borderBottom: `1px solid ${C.borderDefault}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #C4A35A, #D9BC7A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="m23 21-3.5-3.5M21 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 20, fontWeight: 700, color: C.textPrimary, marginBottom: 2 }}>Business Center</div>
                      <div style={{ fontFamily: FONT, fontSize: 12, color: C.textSecondary }}>Professional meeting space</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <button onClick={() => setMode("whole")} style={{ flex: 1, padding: "8px", background: mode === "whole" ? C.gold : "transparent", border: `1px solid ${mode === "whole" ? C.gold : C.borderDefault}`, borderRadius: 6, fontFamily: FONT, fontSize: 10, fontWeight: 600, color: mode === "whole" ? C.textOnAccent : C.textSecondary, cursor: "pointer", transition: "all 0.18s" }}>
                      Whole Table
                    </button>
                    <button onClick={() => setMode("individual")} style={{ flex: 1, padding: "8px", background: mode === "individual" ? C.gold : "transparent", border: `1px solid ${mode === "individual" ? C.gold : C.borderDefault}`, borderRadius: 6, fontFamily: FONT, fontSize: 10, fontWeight: 600, color: mode === "individual" ? C.textOnAccent : C.textSecondary, cursor: "pointer", transition: "all 0.18s" }}>
                      Individual Seat
                    </button>
                  </div>
                  <div style={{ background: C.surfaceRaised, borderRadius: 8, padding: 12, border: `1px solid ${C.borderDefault}` }}>
                    <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: "0.18em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Current Selection</div>
                    <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{displayTable}</div>
                    <div style={{ fontFamily: FONT, fontSize: 11, color: C.textSecondary }}>{displaySeat}</div>
                  </div>
                </div>
                <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
                  <SectionLabel C={C}>Business Center Features</SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      <span style={{ fontFamily: FONT, fontSize: 11, color: C.textPrimary }}>High-Speed WiFi</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                      <span style={{ fontFamily: FONT, fontSize: 11, color: C.textPrimary }}>Projector</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span style={{ fontFamily: FONT, fontSize: 11, color: C.textPrimary }}>Meeting Room</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      <span style={{ fontFamily: FONT, fontSize: 11, color: C.textPrimary }}>Power Outlets</span>
                    </div>
                  </div>
                  <SectionLabel C={C}>Status Legend</SectionLabel>
                  {Object.entries(STATUS_COLORS).map(([key, color]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ fontFamily: FONT, fontSize: 11, color: C.textSecondary, fontWeight: 500 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "20px 24px 24px", borderTop: `1px solid ${C.borderDefault}` }}>
                  <button onClick={() => setModal("guestCount")} disabled={!canGo}
                    style={{ width: "100%", padding: "14px", background: canGo ? C.gold : C.textTertiary, border: "none", borderRadius: 8, fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: canGo ? C.textOnAccent : C.textSecondary, cursor: canGo ? "pointer" : "not-allowed", transition: "all 0.20s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    onMouseEnter={e => { if (canGo) e.currentTarget.style.background = C.goldLight; }}
                    onMouseLeave={e => { if (canGo) e.currentTarget.style.background = C.gold; }}
                  >
                    {mode === "whole"
                      ? (rebookFrom ? "Move to This Table" : "Reserve This Table")
                      : selectedSeat ? (rebookFrom ? "Move to This Seat" : "Reserve This Seat") : "Select a Seat First"
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {modal === "guestCount" && (
          <GuestCountModal
            mode={mode}
            seatData={selectedSeat}
            tableData={activeTable}
            guests={guests}
            onCancel={() => setModal(null)}
            onContinue={handleGuestContinue}
            C={C}
          />
        )}
        {modal === "details" && (
          <DetailsModal
            mode={mode}
            seatData={selectedSeat}
            tableData={activeTable}
            guests={guests}
            onCancel={() => setModal(null)}
            onContinue={handleReview}
            onEdit={handleEditDetails}
            C={C}
            defaultValues={detailsPrefill}
          />
        )}
        {modal === "review" && formData && (
          <ReviewModal
            mode={mode}
            seatData={selectedSeat}
            tableData={activeTable}
            guests={guests}
            formData={formData}
            onCancel={() => setModal(null)}
            onConfirm={handleSubmit}
            onEdit={handleEditDetails}
            C={C}
            isRebook={!!rebookFrom}
            rebookFrom={rebookFrom}
          />
        )}
        {modal === "confirmation" && refCode && (
          <ConfirmationModal
            refCode={refCode}
            mode={mode}
            seatData={selectedSeat}
            tableData={activeTable}
            guests={guests}
            formData={formData}
            onBack={handleBackToVenue}
            onNewReservation={handleNewReservation}
            C={C}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
}
