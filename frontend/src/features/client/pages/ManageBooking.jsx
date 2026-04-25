// src/pages/ManageBooking.jsx
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SeatMap, { STATUS_COLORS } from "../../../components/seatmap/SeatMap";
import {
  getRoomData,
  subscribeToSeatMapChanges,
  dispatchSeatMapUpdate,
} from "../../../utils/seatMapPersistence.js";
import Echo from "../../../utils/websocket.js";
import bellevueLogo from "../../../assets/bellevue-logo.png";
import SharedNavbar from "../../../components/SharedNavbar.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const ThemeContext = createContext({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

function getTokens(isDark) {
  return isDark
    ? {
        gold: "#C4A35A",
        goldLight: "#D9BC7A",
        goldDim: "#8C7240",
        goldFaint: "rgba(196,163,90,0.08)",
        goldFaintest: "rgba(196,163,90,0.04)",
        pageBg: "#0A0908",
        surfaceBase: "#111009",
        surfaceRaised: "#161410",
        surfaceOverlay: "rgba(255,254,251,0.95)",
        surfaceGlass: "rgba(255,254,251,0.88)",
        borderFaint: "rgba(255,255,255,0.04)",
        borderDefault: "rgba(255,255,255,0.08)",
        borderStrong: "rgba(255,255,255,0.13)",
        borderHover: "rgba(196,163,90,0.22)",
        borderAccent: "rgba(196,163,90,0.30)",
        textPrimary: "#EDE8DF",
        textSecondary: "#8A8278",
        textTertiary: "rgba(237,232,223,0.32)",
        textOnAccent: "#0A0908",
        red: "#B85C5C",
        redFaint: "rgba(184,92,92,0.08)",
        redBorder: "rgba(184,92,92,0.20)",
        green: "#4A9E7E",
        greenFaint: "rgba(74,158,126,0.08)",
        greenBorder: "rgba(74,158,126,0.20)",
        badgePending:  { bg: "rgba(196,163,90,0.10)",  text: "#C4A35A",  dot: "#C4A35A"  },
        badgeApproved: { bg: "rgba(74,158,126,0.10)",  text: "#4A9E7E",  dot: "#4A9E7E"  },
        badgeRejected: { bg: "rgba(184,92,92,0.10)",   text: "#B85C5C",  dot: "#B85C5C"  },
        navBg: "rgba(10,9,8,0.95)",
        navBorder: "rgba(196,163,90,0.12)",
        divider: "rgba(255,255,255,0.05)",
        inputFocusShadow: "0 0 0 3px rgba(196,163,90,0.12)",
        modalOverlay: "rgba(0,0,0,0.82)",
        statusNote: { pending: "rgba(196,163,90,0.05)", approved: "rgba(74,158,126,0.05)", rejected: "rgba(184,92,92,0.05)" },
        statusNoteBorder: { pending: "rgba(196,163,90,0.15)", approved: "rgba(74,158,126,0.15)", rejected: "rgba(184,92,92,0.15)" },
        headerGradient: "linear-gradient(160deg,#111009 0%,#161410 100%)",
        spinnerBorder: "rgba(255,255,255,0.15)",
        spinnerTop: "#C4A35A",
        cardBg: "#111009",
        cardBorder: "rgba(255,255,255,0.06)",
      }
    : {
        gold: "#8C6B2A",
        goldLight: "#A07D38",
        goldDim: "#6B5020",
        goldFaint: "rgba(140,107,42,0.07)",
        goldFaintest: "rgba(140,107,42,0.04)",
        pageBg: "#F7F4EE",
        surfaceBase: "#FFFFFF",
        surfaceRaised: "#FAF8F4",
        surfaceOverlay: "rgba(10,9,8,0.92)",
        surfaceGlass: "rgba(10,9,8,0.80)",
        borderFaint: "rgba(0,0,0,0.04)",
        borderDefault: "rgba(0,0,0,0.08)",
        borderStrong: "rgba(0,0,0,0.13)",
        borderHover: "rgba(140,107,42,0.20)",
        borderAccent: "rgba(140,107,42,0.28)",
        textPrimary: "#18140E",
        textSecondary: "#7A7060",
        textTertiary: "rgba(24,20,14,0.35)",
        textOnAccent: "#FFFFFF",
        red: "#A03838",
        redFaint: "rgba(160,56,56,0.07)",
        redBorder: "rgba(160,56,56,0.18)",
        green: "#2E7A5A",
        greenFaint: "rgba(46,122,90,0.07)",
        greenBorder: "rgba(46,122,90,0.18)",
        badgePending:  { bg: "rgba(140,107,42,0.09)",  text: "#8C6B2A",  dot: "#8C6B2A"  },
        badgeApproved: { bg: "rgba(46,122,90,0.09)",   text: "#2E7A5A",  dot: "#2E7A5A"  },
        badgeRejected: { bg: "rgba(160,56,56,0.09)",   text: "#A03838",  dot: "#A03838"  },
        navBg: "rgba(247,244,238,0.96)",
        navBorder: "rgba(140,107,42,0.14)",
        divider: "rgba(0,0,0,0.05)",
        inputFocusShadow: "0 0 0 3px rgba(140,107,42,0.10)",
        modalOverlay: "rgba(0,0,0,0.55)",
        statusNote: { pending: "rgba(140,107,42,0.05)", approved: "rgba(46,122,90,0.05)", rejected: "rgba(160,56,56,0.05)" },
        statusNoteBorder: { pending: "rgba(140,107,42,0.18)", approved: "rgba(46,122,90,0.18)", rejected: "rgba(160,56,56,0.18)" },
        headerGradient: "linear-gradient(160deg,#111009 0%,#1A160F 100%)",
        spinnerBorder: "rgba(0,0,0,0.12)",
        spinnerTop: "#8C6B2A",
        cardBg: "#FFFFFF",
        cardBorder: "rgba(0,0,0,0.07)",
      };
}

const F = {
  display: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  label: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

// ─── API Helper ───────────────────────────────────────────────────────────────
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
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
  room:             b.room ?? b.venue?.name ?? b.venue ?? b.room_name ?? b.venue_name ?? ROOM,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getWholeSeatLabel = (guests, tableData = null) => {
  if (!guests || guests < 1) return "Seat 1";
  if (tableData?.seats?.length) {
    const bookable = tableData.seats
      .filter((s) => s.status === "available")
      .slice(0, guests)
      .map((s) => s.num ?? s.id);
    if (bookable.length > 0) return `Seat ${bookable.join(", ")}`;
  }
  return `Seat ${Array.from({ length: guests }, (_, i) => i + 1).join(", ")}`;
};

const getSeatRatio = (table) => {
  if (!table?.seats?.length) return null;
  const available = table.seats.filter((s) => s.status === "available").length;
  return `${available}/${table.seats.length}`;
};

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
function Spinner({ size = 13, C }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `1.5px solid ${C.spinnerBorder}`,
      borderTopColor: C.spinnerTop,
      borderRadius: "50%", animation: "spin 0.65s linear infinite", flexShrink: 0,
    }} />
  );
}

function SectionLabel({ children, C, style = {} }) {
  return (
    <div style={{
      fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em",
      color: C.gold, fontWeight: 700, textTransform: "uppercase",
      marginBottom: 14, paddingBottom: 8,
      borderBottom: `1px solid ${C.divider}`, ...style,
    }}>
      {children}
    </div>
  );
}

function CloseBtn({ onClick, disabled = false, C, light = false }) {
  return (
    <button onClick={onClick} disabled={disabled} title="Close"
      style={{
        width: 34, height: 34, borderRadius: "50%",
        background: light ? "rgba(255,255,255,0.06)" : C.surfaceRaised,
        border: `1px solid ${light ? "rgba(255,255,255,0.12)" : C.borderDefault}`,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.20s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = light ? "rgba(255,255,255,0.12)" : C.goldFaint;
          e.currentTarget.style.borderColor = light ? "rgba(196,163,90,0.35)" : C.borderAccent;
          e.currentTarget.style.background = light ? "rgba(255,255,255,0.12)" : C.goldFaint;
          e.currentTarget.style.borderColor = light ? "rgba(196,163,90,0.35)" : C.borderAccent;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = light ? "rgba(255,255,255,0.06)" : C.surfaceRaised;
          e.currentTarget.style.borderColor = light ? "rgba(255,255,255,0.12)" : C.borderDefault;
          e.currentTarget.style.background = light ? "rgba(255,255,255,0.06)" : C.surfaceRaised;
          e.currentTarget.style.borderColor = light ? "rgba(255,255,255,0.12)" : C.borderDefault;
        }
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke={light ? "rgba(237,232,223,0.60)" : C.textSecondary}
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

function ModalShell({ children, onClose, disabled, C, maxWidth = 500, zIndex = 4000 }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: C.modalOverlay,
        zIndex, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !disabled) onClose(); }}
    >
      <div style={{
        background: C.surfaceBase, borderRadius: 14,
        width: "100%", maxWidth,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.30)",
        border: `1px solid ${C.borderDefault}`,
        fontFamily: F.body, position: "relative",
        animation: "modalIn 0.20s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "2px",
          background: `linear-gradient(90deg, transparent 0%, ${C.gold}80 30%, ${C.gold}80 70%, transparent 100%)`,
        }} />
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ eyebrow, title, onClose, disabled, C, meta }) {
  return (
    <div style={{
      background: C.headerGradient,
      padding: "20px 22px 18px",
      position: "sticky", top: 0, zIndex: 2,
      borderBottom: `1px solid ${C.divider}`,
    }}>
      <div style={{ position: "absolute", top: 14, right: 16, zIndex: 20 }}>
        <CloseBtn onClick={onClose} disabled={disabled} C={C} />
      </div>
      <div style={{ paddingRight: 44 }}>
        {eyebrow && (
          <div style={{
            fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em",
            color: C.gold, fontWeight: 700, textTransform: "uppercase",
            marginBottom: 6, opacity: 0.80,
          }}>
            {eyebrow}
          </div>
        )}
        <div style={{
          fontFamily: F.display, fontSize: 20, fontWeight: 400,
          color: "#EDE8DF", letterSpacing: "0.01em", lineHeight: 1.2,
        }}>
          {title}
        </div>
        {meta && <div style={{ marginTop: 10 }}>{meta}</div>}
      </div>
    </div>
  );
}

// ─── Themed Field Input ───────────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", placeholder = "", C, required = false }) {
  const [focused, setFocused] = useState(false);

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    border: `1.5px solid ${focused ? C.borderAccent : C.borderDefault}`,
    borderRadius: 8, background: C.surfaceInput,
    fontFamily: F.body, fontSize: 13, color: C.textPrimary,
    outline: "none", transition: "border-color 0.18s, box-shadow 0.18s",
    boxShadow: focused ? C.inputFocusShadow : "none",
    colorScheme: C.surfaceInput === "#FFFFFF" ? "light" : "dark",
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", fontFamily: F.label, fontSize: 9,
        letterSpacing: "0.18em", color: focused ? C.gold : C.textSecondary,
        fontWeight: 700, textTransform: "uppercase", marginBottom: 7,
        transition: "color 0.18s",
      }}>
        {label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={inputStyle} />
    </div>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  const C = getTokens(isDark);
  return (
    <button type="button" onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 12px 6px 8px",
        padding: "6px 12px 6px 8px",
        background: "transparent",
        border: `1px solid ${C.borderDefault}`,
        borderRadius: 20, cursor: "pointer", flexShrink: 0,
        transition: "all 0.22s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderAccent; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; }}
    >
    
      <span style={{
        position: "relative", width: 28, height: 16, borderRadius: 8,
        background: isDark ? "rgba(196,163,90,0.22)" : "rgba(0,0,0,0.08)",
        position: "relative", width: 28, height: 16, borderRadius: 8,
        background: isDark ? "rgba(196,163,90,0.22)" : "rgba(0,0,0,0.08)",
        display: "inline-flex", alignItems: "center", flexShrink: 0,
        transition: "background 0.28s",
      }}>
        <span style={{
          position: "absolute",
          left: isDark ? 2 : "calc(100% - 14px)",
          width: 12, height: 12, borderRadius: "50%",
          background: isDark ? "#C4A35A" : "#8C6B2A",
          left: isDark ? 2 : "calc(100% - 14px)",
          width: 12, height: 12, borderRadius: "50%",
          background: isDark ? "#C4A35A" : "#8C6B2A",
          transition: "left 0.24s cubic-bezier(.4,0,.2,1)",
        }} />
      </span>
      <span style={{ fontFamily: F.label, fontSize: 11, fontWeight: 500, letterSpacing: "0.03em", color: C.textSecondary }}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step, C }) {
  const steps = ["Guest Count", "Details", "Confirm"];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginTop: 16 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: done ? C.gold : active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                border: done || active ? "none" : "1.5px solid rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.2s",
              }}>
                {done
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  : <span style={{ fontFamily: F.label, fontSize: 10, fontWeight: 700, color: active ? "#EDE8DF" : "rgba(237,232,223,0.40)" }}>{idx}</span>
                }
              </div>
              <span style={{
                fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                color: done ? C.gold : active ? "#EDE8DF" : "rgba(237,232,223,0.35)",
                whiteSpace: "nowrap", textTransform: "uppercase",
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1.5, marginTop: 12, marginLeft: 6, marginRight: 6,
                background: done ? C.gold : "rgba(255,255,255,0.10)",
                borderRadius: 2, transition: "background 0.2s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
function PrimaryBtn({ children, onClick, disabled = false, loading = false, C, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{
        width: "100%", padding: "13px",
        background: disabled ? (C.textTertiary) : C.gold,
        border: "none", borderRadius: 8,
        fontFamily: F.label, fontSize: 10, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: disabled ? C.textSecondary : C.textOnAccent,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "all 0.20s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        marginBottom: 8, ...style,
      }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.background = C.goldLight; }}
      onMouseLeave={(e) => { if (!disabled && !loading) e.currentTarget.style.background = C.gold; }}
    >
      {loading ? <><Spinner C={C} />{children}</> : children}
    </button>
  );
}

function GhostBtn({ children, onClick, disabled = false, C, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        width: "100%", padding: "12px",
        background: "transparent",
        border: `1px solid ${C.borderDefault}`,
        borderRadius: 8,
        fontFamily: F.label, fontSize: 10, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase",
        color: C.textSecondary, cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.18s", ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; } }}
      onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; } }}
    >
      {children}
    </button>
  );
}

// ─── MODAL 1: Guest Count ─────────────────────────────────────────────────────
function ModalGuestCount({ seatData, tableData, mode, onContinue, onCancel, C, isDark }) {
  const bookableSeats = (tableData?.seats || []).filter((s) => s.status === "available");
  const pendingSeats  = (tableData?.seats || []).filter((s) => s.status === "pending");
  const capacity      = bookableSeats.length || tableData?.capacity || 8;
  const [guests, setGuests] = useState(() => Math.min(2, capacity));

  const infoRows = [
    ["Room",        ROOM,                                                   null],
    ["Table",       `Table ${tableData?.id ?? "—"}`,                        null],
    ["Seat Number", `Seat ${seatData?.num ?? seatData?.id ?? "—"}`,         null],
    ["Availability",
      seatData?.status === "available" ? "Available" : "Unavailable",
      seatData?.status === "available" ? C.green : C.gold],
  ];

  return (
    <ModalShell onClose={onCancel} C={C}>
      <ModalHeader
        eyebrow={mode === "individual" ? "Seat Reservation" : "Table Reservation"}
        title={mode === "individual" ? "Reserve This Seat" : "Reserve This Table"}
        onClose={onCancel}
        C={C}
        meta={<StepIndicator step={1} C={C} />}
      />

      <div style={{ padding: "22px 24px 26px" }}>
        {mode === "individual" && (
          <div style={{
            background: C.goldFaintest, border: `1px solid ${C.borderAccent}`,
            borderRadius: 10, overflow: "hidden", marginBottom: 22,
          }}>
            {infoRows.map(([key, val, color], i) => (
              <div key={key} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "11px 16px",
                borderBottom: i < infoRows.length - 1 ? `1px solid ${C.divider}` : "none",
              }}>
                <span style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textTertiary }}>
                  {key}
                </span>
                <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: color || C.textPrimary }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}

        {mode === "whole" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>
                Number of Guests
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 10 }}>
                <button
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  style={{
                    width: 44, height: 52, border: `1.5px solid ${C.borderDefault}`,
                    borderRight: "none", borderRadius: "8px 0 0 8px",
                    background: C.surfaceInput, color: C.gold, fontSize: 20, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.15s", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.goldFaint; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C.surfaceInput; }}
                >−</button>
                <div style={{
                  width: 80, height: 52, border: `1.5px solid ${C.borderAccent}`,
                  background: C.surfaceInput, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.textPrimary,
                  colorScheme: isDark ? "dark" : "light",
                }}>
                  {guests}
                </div>
                <button
                  onClick={() => setGuests((g) => Math.min(capacity, g + 1))}
                  style={{
                    width: 44, height: 52, border: `1.5px solid ${C.borderDefault}`,
                    borderLeft: "none", borderRadius: "0 8px 8px 0",
                    background: C.surfaceInput, color: C.gold, fontSize: 20, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.15s", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.goldFaint; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C.surfaceInput; }}
                >+</button>
              </div>
              <div style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>
                Table <strong style={{ color: C.textPrimary }}>{tableData?.id}</strong> has{" "}
                <strong style={{ color: C.textPrimary }}>{capacity} available seat{capacity !== 1 ? "s" : ""}</strong>
                {pendingSeats.length > 0 && (
                  <span style={{ color: C.gold }}>{" "}({pendingSeats.length} pending approval)</span>
                )}
              </div>
            </div>

            <div style={{
              padding: "12px 16px", borderRadius: 8, marginBottom: 20,
              background: C.goldFaintest, border: `1px solid ${C.borderAccent}`,
            }}>
              <div style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.textTertiary, textTransform: "uppercase", marginBottom: 4 }}>
                Seats to be Reserved
              </div>
              <div style={{ fontFamily: F.body, fontSize: 13, color: C.gold, fontWeight: 600 }}>
                {getWholeSeatLabel(guests, tableData)}
              </div>
            </div>
          </>
        )}

        <PrimaryBtn onClick={() => onContinue(mode === "individual" ? 1 : guests)} C={C}>
          Continue
        </PrimaryBtn>
        <GhostBtn onClick={onCancel} C={C}>Cancel</GhostBtn>
      </div>
    </ModalShell>
  );
}

// ─── MODAL 2: Details ─────────────────────────────────────────────────────────
function ModalDetails({ tableData, seatData, mode, guests, onReview, onCancel, prefill, C, isDark }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    firstName: prefill?.firstName || "",
    lastName:  prefill?.lastName  || "",
    email:     prefill?.email     || "",
    phone:     prefill?.phone     || "+63",
    eventDate: prefill?.eventDate || today,
    eventTime: prefill?.eventTime || "19:00",
    specialRequests: prefill?.specialRequests || "",
  });
  const [secondsLeft, setSecondsLeft] = useState(24 * 60);

  useEffect(() => {
    if (prefill) setForm({
      firstName: prefill.firstName || "",
      lastName:  prefill.lastName  || "",
      email:     prefill.email     || "",
      phone:     prefill.phone     || "+63",
      eventDate: prefill.eventDate || today,
      eventTime: prefill.eventTime || "19:00",
      specialRequests: prefill.specialRequests || "",
    });
  }, [prefill]);

  useEffect(() => {
    if (secondsLeft <= 0) { onCancel(); return; }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const isUrgent = secondsLeft <= 60;

  const set = (k) => (v) => {
    if (k === "phone") {
      if (v.startsWith("+63")) {
        const digits = v.slice(3).replace(/[^0-9]/g, "").slice(0, 10);
        setForm((f) => ({ ...f, phone: "+63" + digits }));
      } else {
        const digits = v.replace(/[^0-9]/g, "").slice(0, 10);
        setForm((f) => ({ ...f, phone: "+63" + digits }));
      }
    } else setForm((f) => ({ ...f, [k]: v }));
  };

  const allFilled = form.firstName && form.lastName && form.email && form.phone && form.eventDate;
  const seatDisplay = mode === "whole"
    ? getWholeSeatLabel(guests, tableData)
    : seatData ? `Seat ${seatData.num ?? seatData.id}` : "—";

  return (
    <ModalShell onClose={onCancel} C={C}>
      <ModalHeader
        eyebrow={mode === "individual" ? "Seat Reservation" : "Table Reservation"}
        title="Your Information"
        onClose={onCancel}
        C={C}
        meta={<StepIndicator step={2} C={C} />}
      />

      <div style={{ padding: "18px 24px 26px", maxHeight: "64vh", overflowY: "auto" }}>
        {/* Timer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 14px", borderRadius: 8, marginBottom: 16,
          background: isUrgent ? C.statusNote.rejected : C.goldFaintest,
          border: `1px solid ${isUrgent ? C.statusNoteBorder.rejected : C.borderAccent}`,
        }}>
          <div>
            <div style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: isUrgent ? C.red : C.textSecondary, marginBottom: 2 }}>
              Seat Hold Timer
            </div>
            <div style={{ fontFamily: F.body, fontSize: 11, color: isUrgent ? C.red : C.textTertiary }}>
              {isUrgent ? "⚠ Hold expiring soon" : "Complete before the timer expires"}
            </div>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 20, fontWeight: 700, color: isUrgent ? C.red : C.gold, letterSpacing: "0.04em" }}>
            {mins}:{secs}
          </div>
        </div>

        {/* Booking summary badge */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 20, borderRadius: 8, overflow: "hidden",
          border: `1px solid ${C.borderDefault}`,
        }}>
          {[
            ["Room",  ROOM.split(" ").slice(0, 2).join(" ")],
            ["Table", `Table ${tableData?.id ?? "—"}`],
            ["Seat",  seatDisplay],
            ["Guests", String(guests)],
          ].map(([label, value], i, arr) => (
            <div key={label} style={{
              flex: 1, padding: "10px 12px",
              background: C.surfaceInput,
              borderRight: i < arr.length - 1 ? `1px solid ${C.borderDefault}` : "none",
            }}>
              <div style={{ fontFamily: F.label, fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textTertiary, marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, color: label === "Seat" ? C.gold : C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
            </div>
          ))}
        </div>

        <SectionLabel C={C}>Personal Information</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="First Name" value={form.firstName} onChange={set("firstName")} C={C} isDark={isDark} required />
          <Field label="Last Name"  value={form.lastName}  onChange={set("lastName")}  C={C} isDark={isDark} required />
        </div>
        <Field label="Email Address" value={form.email} onChange={set("email")} type="email" C={C} isDark={isDark} required />
        <Field label="Phone Number"  value={form.phone} onChange={set("phone")} type="tel" C={C} isDark={isDark} required placeholder="+63XXXXXXXXXX" />

        <SectionLabel C={C} style={{ marginTop: 4 }}>Event Details</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Event Date" value={form.eventDate} onChange={set("eventDate")} type="date" min={today} C={C} isDark={isDark} required />
          <Field label="Event Time" value={form.eventTime} onChange={set("eventTime")} type="time" C={C} isDark={isDark} />
        </div>
        <Field label="Special Requests" value={form.specialRequests} onChange={set("specialRequests")} type="textarea" C={C} isDark={isDark} placeholder="Dietary needs, accessibility, preferences…" />

        <PrimaryBtn onClick={() => allFilled && onReview(form)} disabled={!allFilled} C={C} style={{ marginTop: 6 }}>
          Review Booking
        </PrimaryBtn>
      </div>
    </ModalShell>
  );
}

// ─── MODAL 3: Review ──────────────────────────────────────────────────────────
function ModalReview({ form, guests, tableData, seatData, mode, onSubmit, onEdit, submitting, isRebook, rebookFrom, C }) {
  const fmt = (t) => {
    if (!t) return null;
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  const seatDisplay = mode === "whole"
    ? getWholeSeatLabel(guests, tableData)
    : `Seat ${seatData?.num ?? seatData?.id ?? "—"}`;

  const reservationRows = [
    ["Venue",      "The Bellevue Manila"],
    ["Room",       `${WING} — ${ROOM}`],
    ["Table",      `Table ${tableData?.id ?? "—"}`],
    ["Seat(s)",    seatDisplay],
    ["Guests",     `${guests} guest${guests !== 1 ? "s" : ""}`],
    ["Event Date", form.eventDate || "—"],
    ["Event Time", form.eventTime ? fmt(form.eventTime) : "—"],
  ];

  const guestRows = [
    ["Full Name",        `${form.firstName} ${form.lastName}`],
    ["Email",            form.email],
    ["Phone",            form.phone],
    ["Special Requests", form.specialRequests || "None"],
  ];

  const Row = ({ label, value, accent }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 0", borderBottom: `1px solid ${C.divider}` }}>
      <span style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textTertiary, minWidth: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: F.body, fontSize: 12.5, color: accent ? C.gold : C.textPrimary, fontWeight: accent ? 700 : 500, textAlign: "right", maxWidth: 260, lineHeight: 1.5 }}>{value}</span>
    </div>
  );

  return (
    <ModalShell onClose={onEdit} disabled={submitting} C={C}>
      <ModalHeader
        eyebrow={isRebook ? "Rebook / Move Seat" : mode === "individual" ? "Seat Reservation" : "Table Reservation"}
        title="Review Your Booking"
        onClose={onEdit}
        disabled={submitting}
        C={C}
        meta={<StepIndicator step={3} C={C} />}
      />

      <div style={{ padding: "20px 24px 26px", maxHeight: "64vh", overflowY: "auto" }}>
        {isRebook && rebookFrom && (
          <div style={{
            padding: "11px 14px", borderRadius: 8, marginBottom: 18,
            background: C.statusNote.pending, border: `1px solid ${C.statusNoteBorder.pending}`,
            fontSize: 12, color: C.gold, lineHeight: 1.65,
          }}>
            <strong style={{ color: C.gold }}>Rebooking notice:</strong> Previous reservation{" "}
            <strong>{rebookFrom.reference_code || rebookFrom.id}</strong> will be cancelled on submit.
          </div>
        )}

        <SectionLabel C={C}>Reservation Details</SectionLabel>
        {reservationRows.map(([k, v]) => <Row key={k} label={k} value={v} accent={k === "Seat(s)"} />)}

        <SectionLabel C={C} style={{ marginTop: 18 }}>Guest Information</SectionLabel>
        {guestRows.map(([k, v]) => <Row key={k} label={k} value={v} />)}

        <div style={{
          padding: "10px 14px", borderRadius: 8, margin: "18px 0 20px",
          background: C.goldFaintest, border: `1px solid ${C.borderAccent}`,
          fontSize: 11.5, color: C.textSecondary, lineHeight: 1.65,
        }}>
          Your booking will be <strong style={{ color: C.textPrimary }}>pending admin review</strong> upon submission.
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} disabled={submitting}
            style={{
              flex: 1, padding: "12px", border: `1px solid ${C.borderDefault}`,
              borderRadius: 8, background: "transparent", color: C.textSecondary,
              fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
          >
            Edit Details
          </button>
          <button onClick={onSubmit} disabled={submitting}
            style={{
              flex: 2, padding: "12px", border: "none", borderRadius: 8,
              background: submitting ? C.textSecondary : C.gold,
              color: C.textOnAccent,
              fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.18s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = C.goldLight; }}
            onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = C.gold; }}
          >
            {submitting ? <><Spinner C={C} />Submitting…</> : isRebook ? "Confirm Rebook" : "Submit Booking"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── QR Code ──────────────────────────────────────────────────────────────────
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
        new window.QRCode(tmp, { text: value, width: size * 4, height: size * 4, colorDark: "#000000", colorLight: "#FFFFFF", correctLevel: window.QRCode.CorrectLevel.L });
        const tryExtract = (attempt = 0) => {
          const qrCanvas = tmp.querySelector("canvas");
          if (qrCanvas) {
            const src = qrCanvas.toDataURL("image/png");
            if (!cancelled) { setImgSrc(src); if (imgRef) imgRef.current = src; }
            document.body.removeChild(tmp); return;
          }
          const qrImg = tmp.querySelector("img");
          if (qrImg?.src) {
            if (!cancelled) { setImgSrc(qrImg.src); if (imgRef) imgRef.current = qrImg.src; }
            document.body.removeChild(tmp); return;
          }
          if (attempt < 5) setTimeout(() => tryExtract(attempt + 1), 100 * (attempt + 1));
          else document.body.removeChild(tmp);
        };
        tryExtract();
      } catch (e) { if (tmp.parentNode) document.body.removeChild(tmp); }
    };
    if (window.QRCode) { doRender(); } else {
      const existing = document.querySelector("script[data-qrcodejs]");
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

  if (!imgSrc) return (
    <div style={{ width: size, height: size, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(237,232,223,0.20)", fontFamily: F.label }}>QR</div>
  );
  return <img src={imgSrc} alt="QR Code" style={{ width: size, height: size, display: "block", borderRadius: 8, imageRendering: "pixelated" }} />;
}

const buildQrValue = ({ refCode }) => {
  const base = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, "");
  const url = base.startsWith("http") ? base : `https://${base}`;
  return `${url}/alabang-reserve/${String(refCode || "").trim()}`;
};

// ─── MODAL: Success ────────────────────────────────────────────────────────────
function ModalSuccess({ refCode, onBack, mode, guests, isRebook, bookingDetails, C, isDark }) {
  const qrImgRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); } catch { return d; }
  };

  const qrValue = buildQrValue({ refCode: refCode || "" });

  useEffect(() => {
    let tries = 0;
    const poll = setInterval(() => {
      if (qrImgRef.current) { setQrReady(true); clearInterval(poll); }
      if (++tries > 20) clearInterval(poll);
    }, 100);
    return () => clearInterval(poll);
  }, []);

  const handleSavePhoto = useCallback(async () => {
    if (saving || !qrReady) return;
    setSaving(true);
    try {
      const dpr = 3; const W = 320; const H = 380;
      const canvas = document.createElement("canvas");
      canvas.width = W * dpr; canvas.height = H * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#0A0908";
      ctx.beginPath(); ctx.roundRect(0, 0, W, H, 16); ctx.fill();
      const barH = 6; ctx.fillStyle = "#C4A35A";
      ctx.beginPath(); ctx.roundRect(0, 0, W, barH, [16, 16, 0, 0]); ctx.fill();
      const qrSize = 220; const qrX = (W - qrSize) / 2; const qrY = barH + 28;
      if (qrImgRef.current) {
        await new Promise((resolve) => {
          const qImg = new Image();
          qImg.onload = () => {
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath(); ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 10); ctx.fill();
            ctx.drawImage(qImg, qrX, qrY, qrSize, qrSize); resolve();
          };
          qImg.onerror = resolve; qImg.src = qrImgRef.current;
        });
      }
      const divY = qrY + qrSize + 20;
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(28, divY); ctx.lineTo(W - 28, divY); ctx.stroke();
      ctx.fillStyle = "#8A8278"; ctx.font = "600 9px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("REFERENCE CODE", W / 2, divY + 20);
      ctx.fillStyle = "#EDE8DF"; ctx.font = "bold 26px sans-serif";
      ctx.fillText(refCode || "—", W / 2, divY + 52);
      const link = document.createElement("a");
      link.download = `bellevue-reservation-${refCode || "ticket"}.png`;
      link.href = canvas.toDataURL("image/png"); link.click();
    } catch (err) { alert("Could not save photo. Please try again."); }
    finally { setSaving(false); }
  }, [refCode, saving, qrReady]);

  return (
    <ModalShell onClose={onBack} C={C} maxWidth={460}>
      <div style={{ padding: "26px 26px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8, flexShrink: 0,
            background: C.statusNote.approved, border: `1px solid ${C.statusNoteBorder.approved}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em", color: isRebook ? C.gold : C.green, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>
              {isRebook ? "Seat Moved" : "Reservation Submitted"}
            </div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.textPrimary, lineHeight: 1.2 }}>
              Pending Approval
            </div>
          </div>
        </div>

        <div style={{
          padding: "14px 16px", borderRadius: 10, marginBottom: 16,
          background: C.goldFaintest, border: `1px solid ${C.borderAccent}`,
        }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: "0.20em", fontWeight: 700, textTransform: "uppercase", color: C.textTertiary, marginBottom: 6 }}>Reference Code</div>
          <div style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 800, color: C.textPrimary, letterSpacing: "0.12em" }}>{refCode || "—"}</div>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            {[
              { label: "Table",  value: bookingDetails?.table || "—" },
              { label: "Date",   value: fmtDate(bookingDetails?.date) },
              { label: "Guests", value: String(guests) },
              { label: "Status", value: "Pending Review", gold: true },
            ].map(({ label, value, gold }, i, arr) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${C.divider}` : "none",
              }}>
                <span style={{ fontFamily: F.label, fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", color: C.textTertiary, textTransform: "uppercase" }}>{label}</span>
                <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: gold ? C.gold : C.textPrimary }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ padding: 8, background: "#FFFFFF", borderRadius: 8, border: `1px solid ${C.borderDefault}` }}>
              <QRCodeWithRef value={qrValue} size={88} imgRef={qrImgRef} />
            </div>
            <div style={{ fontFamily: F.label, fontSize: 8, color: C.textTertiary, letterSpacing: "0.06em" }}>Scan to verify</div>
          </div>
        </div>

        <div style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, lineHeight: 1.65, padding: "10px 14px", borderRadius: 8, background: C.goldFaintest, border: `1px solid ${C.borderAccent}`, marginBottom: 20 }}>
          Your booking is awaiting confirmation. You'll be notified once an admin reviews your reservation.
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSavePhoto} disabled={saving || !qrReady}
            style={{
              flex: 1, padding: "12px",
              background: "transparent",
              border: `1px solid ${(saving || !qrReady) ? C.borderDefault : C.borderStrong}`,
              borderRadius: 8,
              fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: (saving || !qrReady) ? C.textTertiary : C.textSecondary,
              cursor: (saving || !qrReady) ? "not-allowed" : "pointer",
              transition: "all 0.18s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}
            onMouseEnter={(e) => { if (!saving && qrReady) { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; } }}
            onMouseLeave={(e) => { if (!saving && qrReady) { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.color = C.textSecondary; } }}
          >
            {saving ? <><Spinner C={C} />Saving…</> : !qrReady ? "Loading…" : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Save Pass
              </>
            )}
          </button>
          <button onClick={onBack}
            style={{
              flex: 1, padding: "12px", border: "none", borderRadius: 8,
              background: C.gold, color: C.textOnAccent,
              fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", cursor: "pointer", transition: "background 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLight; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.gold; }}
          >
            Back to Map
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Legend Dot ───────────────────────────────────────────────────────────────
function LegendDot({ color }) {
  return <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block", flexShrink: 0 }} />;
}

// ─── Inline Edit Field ────────────────────────────────────────────────────────
function EditField({ label, value, onChange, type = "text", placeholder = "", C, required = false }) {
  const [focused, setFocused] = useState(false);

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: `1.5px solid ${focused ? C.borderAccent : C.borderDefault}`,
    borderRadius: 8,
    background: C.surfaceInput,
    color: C.textPrimary,
    fontFamily: F.body,
    fontSize: 13,
    outline: "none",
    colorScheme: isDark ? "dark" : "light",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxShadow: focused ? C.inputFocusShadow : "none",
    resize: isTextarea ? "vertical" : undefined,
    minHeight: isTextarea ? 72 : undefined,
  };

  return (
    <div>
      <label style={{
        fontFamily: F.label, fontSize: 9, letterSpacing: "0.14em",
        color: focused ? C.gold : C.textSecondary,
        fontWeight: 700, textTransform: "uppercase", marginBottom: 6,
        display: "block", transition: "color 0.18s",
      }}>
        {label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
      </label>
      {isTextarea
        ? <textarea value={value} rows={3} placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={inputStyle} />
        : <input type={type} value={value} placeholder={placeholder} min={min}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={inputStyle} />
      }
    </div>
  );
}

// ─── Cancel Reason Modal ──────────────────────────────────────────────────────
function CancelReasonModal({ onConfirm, onDismiss, cancelling, C }) {
  const [reason, setReason] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: C.modalOverlay,
        zIndex: 5000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !cancelling) onDismiss(); }}
    >
      <div style={{
        background: C.surfaceBase, borderRadius: 14,
        width: "100%", maxWidth: 420,
        boxShadow: "0 24px 80px rgba(0,0,0,0.30)",
        border: `1px solid ${C.borderDefault}`,
        fontFamily: F.body,
        animation: "modalIn 0.20s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
      }}>
        {/* Red accent bar */}
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent 0%,${C.red}90 30%,${C.red}90 70%,transparent 100%)` }} />

        <div style={{ padding: "22px 22px 24px" }}>
          {/* Icon + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: C.redFaint, border: `1px solid ${C.redBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em", color: C.red, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>
                Cancel Booking
              </div>
              <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 600, color: C.textPrimary, lineHeight: 1.2 }}>
                Are you sure?
              </div>
            </div>
          </div>

          <div style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 18,
            background: C.redFaint, border: `1px solid ${C.redBorder}`,
            fontFamily: F.body, fontSize: 12.5, color: C.textSecondary, lineHeight: 1.65,
          }}>
            This action <strong style={{ color: C.textPrimary }}>cannot be undone</strong>. Your reservation will be permanently cancelled.
          </div>

          {/* Reason textarea */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontFamily: F.label, fontSize: 9,
              letterSpacing: "0.18em", color: focused ? C.red : C.textSecondary,
              fontWeight: 700, textTransform: "uppercase", marginBottom: 7,
              transition: "color 0.18s",
            }}>
              Reason for cancellation <span style={{ color: C.textTertiary, fontWeight: 400, letterSpacing: "0.06em", textTransform: "none" }}>(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. Change of plans, date conflict, found another venue…"
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "11px 14px",
                border: `1.5px solid ${focused ? C.redBorder : C.borderDefault}`,
                borderRadius: 8, background: C.surfaceInput,
                fontFamily: F.body, fontSize: 13, color: C.textPrimary,
                outline: "none", resize: "vertical", minHeight: 80,
                transition: "border-color 0.18s, box-shadow 0.18s",
                boxShadow: focused ? `0 0 0 3px rgba(160,56,56,0.09)` : "none",
                colorScheme: "light",
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onDismiss}
              disabled={cancelling}
              style={{
                flex: 1, padding: "12px",
                background: "transparent",
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 8,
                fontFamily: F.label, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: C.textSecondary,
                cursor: cancelling ? "not-allowed" : "pointer",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => { if (!cancelling) { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
            >
              Keep Booking
            </button>
            <button
              onClick={() => onConfirm(reason.trim())}
              disabled={cancelling}
              style={{
                flex: 1, padding: "12px",
                background: cancelling ? C.borderStrong : C.textSecondary,
                border: "none", borderRadius: 8,
                fontFamily: F.label, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#fff",
                cursor: cancelling ? "not-allowed" : "pointer",
                transition: "all 0.18s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={(e) => { if (!cancelling) e.currentTarget.style.background = C.borderAccent; }}
              onMouseLeave={(e) => { if (!cancelling) e.currentTarget.style.background = C.textSecondary; }}
            >
              {cancelling
                ? <><Spinner C={C} size={12} />Cancelling…</>
                : "Yes, Cancel It"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ManageBooking() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    try { const s = localStorage.getItem("bellevue-theme"); if (s !== null) return s === "dark"; } catch {}
    try { const s = localStorage.getItem("bellevue-theme"); if (s !== null) return s === "dark"; } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });
  const toggleTheme = () => setIsDark((p) => {

function CancelSuccessModal({ reference, onClose, C }) {
  return (
    <ModalShell onClose={onClose} C={C} maxWidth={430}>
      <div style={{ padding: "26px 26px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            flexShrink: 0,
            background: C.statusNote.approved,
            border: `1px solid ${C.statusNoteBorder.approved}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div>
            <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em", color: C.green, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>
              Booking Cancelled
            </div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.textPrimary, lineHeight: 1.2 }}>
              Cancellation Successful
            </div>
          </div>
        </div>

        <div style={{
          padding: "12px 14px",
          borderRadius: 10,
          background: C.greenFaint,
          border: `1px solid ${C.greenBorder}`,
          color: C.textPrimary,
          fontFamily: F.body,
          fontSize: 13,
          lineHeight: 1.55,
          marginBottom: 14,
        }}>
          Your booking has been cancelled successfully.
        </div>

        {!!reference && (
          <div style={{
            padding: "12px 14px",
            borderRadius: 10,
            background: C.goldFaintest,
            border: `1px solid ${C.borderAccent}`,
            marginBottom: 18,
          }}>
            <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: "0.18em", fontWeight: 700, textTransform: "uppercase", color: C.textTertiary, marginBottom: 6 }}>
              Reference Code
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 800, color: C.textPrimary, letterSpacing: "0.08em" }}>
              {reference}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: 8,
            background: C.gold,
            color: C.textOnAccent,
            fontFamily: F.label,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.18s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLight; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.gold; }}
        >
          Done
        </button>
      </div>
    </ModalShell>
  );
}
    const n = !p;
    try { localStorage.setItem("bellevue-theme", n ? "dark" : "light"); } catch {}
    return n;
  });

  const C = getTokens(isDark);

  // ── State ──────────────────────────────────────────────────────────────────
  const [referenceCode, setReferenceCode]     = useState("");
  const [searching, setSearching]             = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [cancelling, setCancelling]           = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [cancelledReference, setCancelledReference] = useState("");
  const [error, setError]                     = useState("");
  const [booking, setBooking]                 = useState(null);
  const [editing, setEditing]                 = useState(false);
  const [editForm, setEditForm]               = useState({});
  const [focused, setFocused]                 = useState(false);

  // ── Format helpers ─────────────────────────────────────────────────────────
  const fmtDate = (d) => {
    if (!d) return "—";
    const dateOnly = d.toString().split("T")[0];
    const p = new Date(dateOnly + "T00:00:00");
    return isNaN(p) ? d : p.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  };

  const fmtTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hr = parseInt(h) || 0;
    const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    return `${hr12}:${m || "00"} ${hr < 12 ? "AM" : "PM"}`;
  };

  // ── Search booking ─────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const trimmed = referenceCode.trim();
    if (!trimmed) { setError("Please enter your reference code."); return; }

    setError(""); setSearching(true); setBooking(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reservations?reference_code=${trimmed}`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Failed to search booking");

      const data = await response.json();
      const bookings = Array.isArray(data) ? data : (data.data ? data.data : [data]);
      const found = bookings.find((b) =>
        b.reference_code === trimmed || b.id === trimmed || String(b.id) === trimmed
      );

      if (found) {
        const normalized = normalizeBooking(found);
        setBooking(normalized);
        setEditForm({
          name:            normalized.name,
          email:           normalized.email,
          phone:           normalized.phone || "+63",
          eventDate:       (normalized.event_date || "").split("T")[0],
          eventTime:       normalized.event_time || "",
          specialRequests: normalized.special_requests,
        });
      } else {
        setError("No booking found with this reference code. Please check and try again.");
      }
    } catch (err) {
      console.error("Error searching booking:", err);
      setError("Failed to search. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // ── Update booking ─────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    setError("");
    setSaving(true);

    try {
      const payload = {
        name:             editForm.name,
        email:            editForm.email,
        phone:            editForm.phone,
        event_date:       editForm.eventDate,
        event_time:       editForm.eventTime,
        special_requests: editForm.specialRequests,
      };

      const resourceId = booking.db_id ?? booking.id;

      const response = await fetch(`${API_BASE_URL}/reservations/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      await response.json().catch(() => ({}));

      setBooking((prev) => ({
        ...prev,
        name:             editForm.name,
        email:            editForm.email,
        phone:            editForm.phone,
        event_date:       editForm.eventDate,
        event_time:       editForm.eventTime,
        special_requests: editForm.specialRequests,
      }));

      setEditing(false);
    } catch (err) {
      console.error("Error updating booking:", err);
      setError(err.message || "Failed to update booking. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isCancelableStatus = (status) => ["pending", "approved", "reserved"].includes((status || "").toLowerCase());

  // ── Cancel booking ──────────────────────────────────────────────────────────
  const handleCancelConfirm = async (reason) => {
    if (!isCancelableStatus(booking?.status)) {
      setError("Only pending or approved reservations can be cancelled.");
      setShowCancelModal(false);
      return;
    }

    setCancelling(true);
    setError("");

    try {
      const resourceId = booking.db_id ?? booking.id;

      const response = await fetch(`${API_BASE_URL}/reservations/${resourceId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          reason: reason || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      const cancelledCode = booking?.reference_code || booking?.id || referenceCode;
      setShowCancelModal(false);
      setCancelledReference(cancelledCode || "");
      setShowCancelSuccessModal(true);
      setBooking(null);
      setReferenceCode("");
    } catch (err) {
      console.error("Cancel error:", err);
      setError(`Failed to cancel booking: ${err.message}`);
      setShowCancelModal(false);
    } finally {
      setCancelling(false);
    }
  };

  // ── Sub-components ─────────────────────────────────────────────────────────
  function StatusBadge({ status }) {
    const cfg =
      status === "pending"  ? { ...C.badgePending,  label: "Pending"   } :
      status === "reserved" ? { ...C.badgeApproved, label: "Confirmed" } :
      status === "approved" ? { ...C.badgeApproved, label: "Approved"  } :
      status === "rejected" ? { ...C.badgeRejected, label: "Cancelled" } :
      { bg: "rgba(130,130,130,0.10)", color: "#888", dot: "#888", label: status ?? "Unknown" };
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: cfg.bg, color: cfg.color,
        padding: "4px 10px 4px 8px", borderRadius: 4,
        fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", fontFamily: F.label,
        border: `1px solid ${cfg.color}24`,
      }}>
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
        {cfg.label}
      </span>
    );
  }

  
  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ThemeContext.Provider value={{ isDark, toggle: toggleTheme }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div style={{
        minHeight: "100vh", fontFamily: F.body,
        background: C.pageBg, position: "relative",
        transition: "background 0.30s",
      }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('/src/assets/bg-login.jpeg')",
            backgroundSize: "cover", backgroundPosition: "center",
            filter: isDark ? "blur(6px) brightness(0.35)" : "blur(6px) brightness(0.45) saturate(0.4)",
            transform: "scale(1.05)", transition: "filter 0.40s",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: isDark ? "rgba(12,11,10,0.75)" : "rgba(237,233,224,0.65)",
            transition: "background 0.40s",
          }} />
        </div>

        <SharedNavbar isDark={isDark} toggle={toggleTheme} />

        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", paddingTop: 64 }}>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "clamp(40px,6vh,80px) clamp(20px,6vw,80px)",
            minHeight: "calc(100vh - 64px)",
          }}>

            {/* Back button */}
            <div style={{ position: "absolute", top: 80, left: "clamp(16px,4vw,40px)" }}>
              <button onClick={() => navigate("/")} title="Go back"
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "transparent", border: `1px solid ${C.borderDefault}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.18s", padding: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.background = C.goldFaint; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.background = "transparent"; }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-left-icon lucide-chevron-left"
                  style={{ color: C.textSecondary }}
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>

            <div style={{ width: "100%", maxWidth: 440 }}>

              {/* ── SEARCH STATE ─────────────────────────────────────────── */}
              {!booking && (
                <>
                  <div style={{ marginBottom: 40, animation: "fadeUp 0.32s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ display: "inline-block", width: 24, height: "1px", background: C.gold, opacity: 0.6 }} />
                      <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.26em", color: C.gold, fontWeight: 700, textTransform: "uppercase" }}>
                        Guest Services
                      </span>
                    </div>
                    <h1 style={{ fontFamily: F.display, fontSize: "clamp(30px,5vw,44px)", fontWeight: 400, color: C.textPrimary, lineHeight: 1.12, margin: "0 0 12px", letterSpacing: "0.01em" }}>
                      Manage Your<br />Booking
                    </h1>
                    <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.textSecondary, margin: 0, lineHeight: 1.70 }}>
                      Enter your reference code to view and manage your booking.
                    </p>
                  </div>

                  <div style={{ animation: "fadeUp 0.36s ease" }}>
                    <div style={{
                      padding: "12px 14px", borderRadius: 8, marginBottom: 20,
                      background: C.goldFaint, border: `1px solid ${C.borderAccent}`,
                      display: "flex", gap: 12, alignItems: "flex-start",
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6, background: C.goldFaintest,
                        border: `1px solid ${C.borderAccent}`, display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, marginBottom: 3 }}>
                          How it works
                        </div>
                        <div style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, lineHeight: 1.65 }}>
                          Enter your booking reference code to view, edit, or cancel your reservation.
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{
                        display: "flex", alignItems: "center", gap: 6,
                        fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em",
                        color: focused ? C.gold : C.textSecondary,
                        fontWeight: 700, textTransform: "uppercase", marginBottom: 8,
                        transition: "color 0.18s",
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        Reference Code <span style={{ color: C.red, marginLeft: 2 }}>*</span>
                      </label>
                      <input
                        value={referenceCode}
                        onChange={(e) => { setReferenceCode(e.target.value); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="e.g. 2024-001"
                        autoComplete="off"
                        style={{
                          width: "100%", boxSizing: "border-box", padding: "14px 18px",
                          border: `1.5px solid ${focused ? C.borderAccent : C.borderDefault}`,
                          borderRadius: 10, background: C.surfaceInput,
                          fontFamily: F.mono, fontSize: 17, fontWeight: 500, letterSpacing: "0.06em",
                          color: C.textPrimary, outline: "none",
                          transition: "border-color 0.18s, box-shadow 0.18s",
                          boxShadow: focused ? C.inputFocusShadow : "none",
                          colorScheme: isDark ? "dark" : "light",
                        }}
                      />
                    </div>

                    {error && (
                      <div style={{
                        padding: "10px 14px", borderRadius: 8, marginBottom: 14,
                        background: C.redFaint, borderLeft: `3px solid ${C.red}`,
                        fontSize: 12.5, color: C.red, lineHeight: 1.60,
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                      </div>
                    )}

                    <button onClick={handleSearch} disabled={searching}
                      style={{
                        width: "100%", padding: "14px",
                        background: searching ? (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)") : C.gold,
                        border: `1px solid ${searching ? C.borderDefault : "transparent"}`,
                        borderRadius: 10,
                        fontFamily: F.label, fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.18em", textTransform: "uppercase",
                        color: searching ? C.textSecondary : C.textOnAccent,
                        cursor: searching ? "not-allowed" : "pointer", transition: "all 0.20s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      }}
                      onMouseEnter={(e) => { if (!searching) e.currentTarget.style.background = C.goldLight; }}
                      onMouseLeave={(e) => { if (!searching) e.currentTarget.style.background = C.gold; }}
                    >
                      {searching
                        ? <><span style={{ display: "inline-block", width: 13, height: 13, border: `1.5px solid ${C.textSecondary}40`, borderTopColor: C.textSecondary, borderRadius: "50%", animation: "spin 0.65s linear infinite" }} />Searching...</>
                        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>Find My Booking</>
                      }
                    </button>

                    <div style={{ marginTop: 24, paddingTop: 22, borderTop: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: F.body, fontSize: 12.5, color: C.textSecondary }}>Don't have your code?</span>
                      <button onClick={() => navigate("/forgot-code")}
                        style={{ background: "none", border: "none", fontFamily: F.label, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gold, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
                      >
                        Recover Code
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── BOOKING FOUND STATE ───────────────────────────────────── */}
              {booking && (
                <div style={{ animation: "fadeUp 0.28s ease" }}>

                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em", color: C.green, fontWeight: 700, textTransform: "uppercase" }}>
                        Booking Found
                      </span>
                    </div>
                    <h1 style={{ fontFamily: F.display, fontSize: "clamp(30px,5vw,44px)", fontWeight: 400, color: C.textPrimary, lineHeight: 1.12, margin: "0 0 10px", letterSpacing: "0.01em" }}>
                      Manage Your<br />Booking
                    </h1>
                    <p style={{ fontFamily: F.body, fontSize: 12.5, color: C.textSecondary, margin: 0 }}>
                      {editing ? "Update your booking information below." : "View details, edit information, or cancel your reservation."}
                    </p>
                  </div>

                  {/* Card */}
                  <div style={{
                    background: C.surfaceBase, borderRadius: 14,
                    border: `1px solid ${C.borderDefault}`,
                    overflow: "hidden", marginBottom: 14,
                  }}>
                    <div style={{ height: "2px", background: `linear-gradient(90deg, transparent 0%, ${C.gold}80 30%, ${C.gold}80 70%, transparent 100%)` }} />

                    <div style={{ padding: "20px 22px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
                        <div>
                          <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
                            Reference Code
                          </div>
                          <div style={{ fontFamily: F.mono, fontSize: 28, fontWeight: 500, color: C.textPrimary, letterSpacing: "0.06em", lineHeight: 1 }}>
                            {booking.reference_code || booking.id || "—"}
                          </div>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div style={{ height: "1px", background: C.divider, marginBottom: 20 }} />

                      {editing ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          <EditField label="Full Name" required value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} placeholder="Full name" C={C} isDark={isDark} />
                          <EditField label="Email Address" type="email" required value={editForm.email} onChange={(v) => setEditForm({ ...editForm, email: v })} placeholder="email@example.com" C={C} isDark={isDark} />
                          <EditField label="Phone Number" type="tel" required value={editForm.phone}
                            onChange={(v) => {
                              const digits = (v.startsWith("+63") ? v.slice(3) : v).replace(/[^0-9]/g, "").slice(0, 10);
                              setEditForm({ ...editForm, phone: "+63" + digits });
                            }}
                            placeholder="+63XXXXXXXXXX" C={C} isDark={isDark}
                          />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <EditField label="Event Date" type="date" required value={editForm.eventDate} min={new Date().toISOString().split("T")[0]} onChange={(v) => setEditForm({ ...editForm, eventDate: v })} C={C} isDark={isDark} />
                            <EditField label="Event Time" type="time" value={editForm.eventTime} onChange={(v) => setEditForm({ ...editForm, eventTime: v })} C={C} isDark={isDark} />
                          </div>
                          <EditField label="Special Requests" type="textarea" value={editForm.specialRequests} onChange={(v) => setEditForm({ ...editForm, specialRequests: v })} placeholder="Dietary needs, accessibility, preferences…" C={C} isDark={isDark} />

                          {error && (
                            <div style={{ padding: "10px 14px", borderRadius: 8, background: C.redFaint, border: `1px solid ${C.redBorder}`, color: C.red, fontSize: 12.5, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 8 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                              {error}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, marginBottom: 3 }}>{booking.name || "—"}</div>
                            <div style={{ fontSize: 12.5, color: C.textSecondary }}>
                              {booking.email}{booking.email && booking.phone ? " • " : ""}{booking.phone}
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 14 }}>
                            {[
                              ["Date",         fmtDate(booking.event_date)],
                              ["Time",         fmtTime(booking.event_time)],
                              ["Guests",       booking.guests ? `${booking.guests} pax` : "—"],
                              ["Table / Seat", [booking.table, booking.seat].filter(Boolean).join(" / ") || "—"],
                            ].map(([label, val]) => (
                              <div key={label}>
                                <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textTertiary, fontWeight: 700, marginBottom: 3 }}>{label}</div>
                                <div style={{ fontFamily: F.body, fontSize: 12.5, color: C.textPrimary }}>{val}</div>
                              </div>
                            ))}
                          </div>

                          {booking.special_requests && (
                            <div>
                              <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textTertiary, fontWeight: 700, marginBottom: 3 }}>Special Requests</div>
                              <div style={{ fontFamily: F.body, fontSize: 12.5, color: C.textPrimary, lineHeight: 1.6 }}>{booking.special_requests}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── ACTION BUTTONS ──────────────────────────────────────── */}
                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    {editing ? (
                      <>
                        <button onClick={() => { setEditing(false); setError(""); }} disabled={saving}
                          style={{ flex: 1, padding: "11px 16px", background: "transparent", border: `1px solid ${C.borderDefault}`, borderRadius: 8, fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.textSecondary, cursor: saving ? "not-allowed" : "pointer", transition: "all 0.18s" }}
                          onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; } }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
                        >Cancel</button>
                        <button onClick={handleUpdate} disabled={saving}
                          style={{ flex: 1, padding: "11px 16px", background: saving ? C.goldDim : C.gold, border: "none", borderRadius: 8, fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.textOnAccent, cursor: saving ? "not-allowed" : "pointer", transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                          onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = C.goldLight; }}
                          onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = C.gold; }}
                        >
                          {saving ? <><Spinner C={C} size={12} />Saving…</> : <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 0-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            Save Changes
                          </>}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setBooking(null); setError(""); }}
                          style={{ flex: 1, padding: "11px 16px", background: "transparent", border: `1px solid ${C.borderDefault}`, borderRadius: 8, fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.textSecondary, cursor: "pointer", transition: "all 0.18s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
                        >Search Again</button>

                        <button onClick={() => { setEditing(true); setError(""); }}
                          style={{ flex: 1, padding: "11px 16px", background: C.gold, border: "none", borderRadius: 8, fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.textOnAccent, cursor: "pointer", transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLight; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = C.gold; }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit Details
                        </button>

                        {/* Cancel — only allowed for pending/approved bookings */}
                        <button onClick={() => {
                          if (!isCancelableStatus(booking?.status)) {
                            setError("Only pending or approved reservations can be cancelled.");
                            return;
                          }
                          setError("");
                          setShowCancelModal(true);
                        }}
                          disabled={!isCancelableStatus(booking?.status)}
                          style={{
                            flex: 1,
                            padding: "11px 16px",
                            background: isCancelableStatus(booking?.status) ? C.textSecondary : C.borderStrong,
                            border: "none",
                            borderRadius: 8,
                            fontFamily: F.label,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.10em",
                            textTransform: "uppercase",
                            color: "#fff",
                            cursor: isCancelableStatus(booking?.status) ? "pointer" : "not-allowed",
                            transition: "0.18s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                          onMouseEnter={(e) => { if (isCancelableStatus(booking?.status)) e.currentTarget.style.background = C.borderAccent; }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isCancelableStatus(booking?.status) ? C.textSecondary : C.borderStrong;
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>

                  {!editing && error && (
                    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: C.redFaint, border: `1px solid ${C.redBorder}`, color: C.red, fontSize: 12.5, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Reason Modal */}
      {showCancelModal && (
        <CancelReasonModal
          onConfirm={handleCancelConfirm}
          onDismiss={() => setShowCancelModal(false)}
          cancelling={cancelling}
          C={C}
        />
      )}

      {showCancelSuccessModal && (
        <CancelSuccessModal
          reference={cancelledReference}
          onClose={() => {
            setShowCancelSuccessModal(false);
            setCancelledReference("");
          }}
          C={C}
        />
      )}
    </ThemeContext.Provider>
  );
}