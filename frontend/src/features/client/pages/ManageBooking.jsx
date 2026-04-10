// src/pages/AlabangReserve.jsx
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainWingNavbar from "../components/MainWingNavbar";
import SeatMap, { STATUS_COLORS } from "../../../components/seatmap/SeatMap";
import {
  getRoomData,
  subscribeToSeatMapChanges,
  dispatchSeatMapUpdate,
} from "../../../utils/seatMapPersistence.js";
import Echo from "../../../utils/websocket.js";
import bellevueLogo from "../../../assets/bellevue-logo.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const WING = "Main Wing";
const ROOM = "Alabang Function Room";

// ─── Design Tokens (mirrors ManageBooking exactly) ────────────────────────────
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
        surfaceInput: "rgba(255,255,255,0.04)",
        borderFaint: "rgba(255,255,255,0.04)",
        borderDefault: "rgba(255,255,255,0.08)",
        borderStrong: "rgba(255,255,255,0.12)",
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
        badgePending:  { bg: "rgba(196,163,90,0.10)",  color: "#C4A35A",  dot: "#C4A35A"   },
        badgeApproved: { bg: "rgba(74,158,126,0.10)",  color: "#4A9E7E",  dot: "#4A9E7E"   },
        badgeRejected: { bg: "rgba(184,92,92,0.10)",   color: "#B85C5C",  dot: "#B85C5C"   },
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
        surfaceInput: "#FFFFFF",
        borderFaint: "rgba(0,0,0,0.04)",
        borderDefault: "rgba(0,0,0,0.08)",
        borderStrong: "rgba(0,0,0,0.13)",
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
        badgePending:  { bg: "rgba(140,107,42,0.09)",  color: "#8C6B2A",  dot: "#8C6B2A"  },
        badgeApproved: { bg: "rgba(46,122,90,0.09)",   color: "#2E7A5A",  dot: "#2E7A5A"  },
        badgeRejected: { bg: "rgba(160,56,56,0.09)",   color: "#A03838",  dot: "#A03838"  },
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

// ─── Shared UI Primitives (mirrors ManageBooking) ─────────────────────────────
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

function CloseBtn({ onClick, disabled = false, C }) {
  return (
    <button onClick={onClick} disabled={disabled} title="Close"
      style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.10)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "border-color 0.18s, background 0.18s",
        padding: 0, zIndex: 10,
      }}
      onMouseEnter={(e) => {
        if (!disabled) { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.goldFaint; }
      }}
      onMouseLeave={(e) => {
        if (!disabled) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.background = "transparent"; }
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="rgba(237,232,223,0.50)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        {meta && <div style={{ marginTop: 8 }}>{meta}</div>}
      </div>
    </div>
  );
}

// ─── Themed Field Input ───────────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", placeholder = "", C, isDark, required = false, min, max, rows }) {
  const [focused, setFocused] = useState(false);
  const isTextarea = type === "textarea";
  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "11px 14px",
    border: `1.5px solid ${focused ? C.borderAccent : C.borderDefault}`,
    borderRadius: 8, background: C.surfaceInput,
    fontFamily: F.body, fontSize: 13, color: C.textPrimary,
    outline: "none", transition: "border-color 0.18s, box-shadow 0.18s",
    boxShadow: focused ? C.inputFocusShadow : "none",
    colorScheme: isDark ? "dark" : "light",
    resize: isTextarea ? "vertical" : undefined,
    minHeight: isTextarea ? 72 : undefined,
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
      {isTextarea
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} rows={rows || 3}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={inputStyle} />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} min={min} max={max}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={inputStyle} />
      }
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
        display: "inline-flex", alignItems: "center", flexShrink: 0,
        transition: "background 0.28s",
      }}>
        <span style={{
          position: "absolute",
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

// ─── Navbar ───────────────────────────────────────────────────────────────────
function NavBar({ onBack }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000,
      height: 64, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 clamp(20px,5vw,64px)",
      background: C.navBg, backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderBottom: `1px solid ${C.navBorder}`,
      boxSizing: "border-box", transition: "background 0.30s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src={bellevueLogo} alt="The Bellevue Manila" onClick={() => navigate("/")}
          style={{
            height: 26, width: "auto", cursor: "pointer", display: "block", flexShrink: 0,
            filter: isDark
              ? "brightness(0) saturate(100%) invert(82%) sepia(18%) saturate(400%) hue-rotate(0deg) brightness(96%)"
              : "brightness(0) saturate(100%)",
            transition: "filter 0.30s",
          }} />
        <div style={{ width: 1, height: 18, background: C.borderDefault }} />
        <span style={{
          fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em",
          color: C.textSecondary, fontWeight: 700, textTransform: "uppercase",
        }}>
          {ROOM}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", background: "transparent",
            border: `1px solid ${C.borderDefault}`, borderRadius: 8,
            fontFamily: F.label, fontSize: 9, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: C.textSecondary, cursor: "pointer", transition: "all 0.18s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All Venues
        </button>
        <ThemeToggle />
      </div>
    </nav>
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
        {/* Success indicator */}
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

        {/* Reference */}
        <div style={{
          padding: "14px 16px", borderRadius: 10, marginBottom: 16,
          background: C.goldFaintest, border: `1px solid ${C.borderAccent}`,
        }}>
          <div style={{ fontFamily: F.label, fontSize: 8, letterSpacing: "0.20em", fontWeight: 700, textTransform: "uppercase", color: C.textTertiary, marginBottom: 6 }}>Reference Code</div>
          <div style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 800, color: C.textPrimary, letterSpacing: "0.12em" }}>{refCode || "—"}</div>
        </div>

        {/* Info + QR */}
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AlabangReserve() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    try { const s = localStorage.getItem("bellevue-theme"); if (s !== null) return s === "dark"; } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });
  const toggleTheme = () => setIsDark((p) => {
    const n = !p;
    try { localStorage.setItem("bellevue-theme", n ? "dark" : "light"); } catch {}
    return n;
  });

  const C = getTokens(isDark);

  const [mode,          setMode]          = useState("whole");
  const [selectedSeat,  setSelectedSeat]  = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [windowSize,    setWindowSize]    = useState({ width: window.innerWidth, height: window.innerHeight });
  const [modal,         setModal]         = useState(null);
  const [guests,        setGuests]        = useState(2);
  const [formData,      setFormData]      = useState(null);
  const [refCode,       setRefCode]       = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  const [rebookFrom,         setRebookFrom]         = useState(null);
  const [lastBookingDetails, setLastBookingDetails] = useState(null);

  const echoRef = useRef(null);

  const [tableData, setTableData] = useState(() => {
    const raw = getRoomData(WING, ROOM, null);
    if (!raw) return null;
    if (Array.isArray(raw)) return raw.filter((t) => t.seats?.length > 0);
    if (raw.seats?.length > 0) return raw;
    return null;
  });

  useEffect(() => {
    const unsub = subscribeToSeatMapChanges(({ wing, room, data }) => {
      if (wing !== WING || room !== ROOM) return;
      if (Array.isArray(data)) setTableData(data.filter((t) => t.seats?.length > 0));
      else if (data?.seats?.length > 0) setTableData(data);
      else setTableData(null);
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
        if (Array.isArray(parsed)) setTableData(parsed.filter((t) => t.seats?.length > 0));
        else if (parsed.seats?.length > 0) setTableData(parsed);
      } catch {}
    };
    const onSeatMapUpdate = (e) => {
      const { wing, room, data } = e.detail || {};
      if (wing !== WING || room !== ROOM) return;
      try {
        if (Array.isArray(data)) setTableData(data.filter((t) => t.seats?.length > 0));
        else if (data?.seats?.length > 0) setTableData(data);
        else setTableData(null);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("seatmap-update", onSeatMapUpdate);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("seatmap-update", onSeatMapUpdate); };
  }, []);

  const hasSynced = useRef(false);
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;
    const syncWithDatabase = async () => {
      try {
        const res = { success: true, data: [] };
        if (!res.success) return;
        setTableData((prev) => {
          if (!prev) return prev;
          const applyToTable = (tbl) => ({
            ...tbl,
            seats: (tbl.seats || []).map((seat) => {
              const match = res.data.find((r) => {
                if (r.table !== String(tbl.id)) return false;
                const nums = String(r.seat || "").replace(/Seat\s*/gi, "").split(",").map((s) => parseInt(s.trim())).filter(Boolean);
                return nums.includes(seat.num);
              });
              return match ? { ...seat, status: match.status } : seat;
            }),
          });
          const result = Array.isArray(prev) ? prev.map(applyToTable) : applyToTable(prev);
          dispatchSeatMapUpdate(WING, ROOM, result);
          return result;
        });
      } catch (err) { console.warn("[AlabangReserve] Seat sync failed:", err.message); }
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
    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
    if (!echoRef.current && pusherKey && pusherKey !== "your_key") {
      try { echoRef.current = new Echo({ broadcaster: "pusher", key: pusherKey, cluster: pusherCluster }); }
      catch (err) { console.log("WebSocket init failed:", err); return; }
    }
    const echo = echoRef.current;
    if (!echo) return;
    try {
      const channel = echo.channel("reservations");
      const syncSeats = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/rooms/${WING}/${ROOM}/seats`, { headers: { Accept: "application/json" } });
          if (res.ok) { const data = await res.json(); if (data?.data) dispatchSeatMapUpdate(WING, ROOM, data.data); }
        } catch (err) { console.error("Failed to sync seats:", err); }
      };
      ["ReservationCreated", "ReservationUpdated", "ReservationDeleted", "SeatReserved", "TableReserved"]
        .forEach((e) => channel.listen(e, syncSeats));
      return () => {
        try { ["ReservationCreated", "ReservationUpdated", "ReservationDeleted", "SeatReserved", "TableReserved"].forEach((e) => channel.stopListening(e)); }
        catch (_) {}
      };
    } catch (err) { console.log("WebSocket channel setup failed:", err); }
  }, []);

  const dispatchCancelSeat = (booking) => {
    const key = `seatmap:${WING}:${ROOM}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const tables = Array.isArray(parsed) ? parsed : [parsed];
      const tableNum = String(booking.table_number || booking.table || "").replace(/^T/i, "");
      const updated = tables.map((t) => {
        if (tableNum && String(t.id).replace(/^T/i, "") !== tableNum) return t;
        return { ...t, seats: t.seats.map((s) => s.status === "pending" ? { ...s, status: "available" } : s) };
      });
      const payload = Array.isArray(parsed) ? updated : updated[0];
      localStorage.setItem(key, JSON.stringify(payload));
      dispatchSeatMapUpdate(WING, ROOM, payload);
      setTableData(Array.isArray(payload) ? payload.filter((t) => t.seats?.length > 0) : payload);
    } catch (e) { console.warn("dispatchCancelSeat failed:", e); }
  };

  const resolveTableForSeat = (seat) => {
    if (!seat || !tableData) return null;
    if (Array.isArray(tableData)) return tableData.find((t) => t.seats?.some((s) => s.id === seat.id)) || tableData[0] || null;
    return tableData;
  };
  const getActiveTable = () => selectedTable || (Array.isArray(tableData) ? tableData[0] : tableData) || null;

  const handleTableClick    = (table) => { setSelectedTable(table); setModal("guestCount"); };
  const handleSeatClick     = (seat)  => {
    if (seat.status === "reserved") { return; }
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
        } catch (e) { console.warn("[AlabangReserve] Could not cancel old booking:", e.message); }
      }

      if (activeTable) {
        const markPending = (tbl) => {
          if (mode === "individual") {
            return { ...tbl, seats: (tbl.seats || []).map((s) => s.id === selectedSeat?.id ? { ...s, status: "pending" } : s) };
          }
          let marked = 0;
          return { ...tbl, seats: (tbl.seats || []).map((s) => { if (marked < guests && s.status === "available") { marked++; return { ...s, status: "pending" }; } return s; }) };
        };
        const updated = Array.isArray(tableData)
          ? tableData.map((t) => t.id === activeTable.id ? markPending(t) : t)
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
    setRebookFrom(null); setLastBookingDetails(null);
  };

  const isMobile  = windowSize.width < 640;
  const isTablet  = windowSize.width < 960;
  const activeTable = getActiveTable();
  const canProceed  = mode === "individual" && selectedSeat && selectedSeat.status !== "reserved";

  const displayTable = mode === "whole"
    ? (activeTable ? `Table ${activeTable.id}` : "—")
    : (selectedTable ? `Table ${selectedTable.id}` : "—");
  const displaySeat = mode === "individual"
    ? (selectedSeat ? `Seat ${selectedSeat.num ?? selectedSeat.id}` : "—")
    : getWholeSeatLabel(guests, activeTable);
  const seatRatio = activeTable ? getSeatRatio(activeTable) : null;

  const detailsPrefill = formData ? {
    firstName: formData.firstName || "", lastName: formData.lastName || "",
    email: formData.email || "", phone: formData.phone || "+63",
    eventDate: formData.eventDate || "", eventTime: formData.eventTime || "19:00",
    specialRequests: formData.specialRequests || "",
  } : rebookFrom ? {
    firstName: (rebookFrom.name || "").split(/\s+/)[0] || "",
    lastName: (rebookFrom.name || "").split(/\s+/).slice(1).join(" ") || "",
    email: rebookFrom.email || "", phone: rebookFrom.phone || "+63",
    eventDate: rebookFrom.event_date || "", eventTime: rebookFrom.event_time || "19:00",
    specialRequests: rebookFrom.special_requests || "",
  } : null;

  return (
    <ThemeContext.Provider value={{ isDark, toggle: toggleTheme }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div style={{
        minHeight: "100vh", fontFamily: F.body,
        background: C.pageBg, color: C.textPrimary,
        transition: "background 0.30s, color 0.30s",
      }}>
        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('/src/assets/bg-login.jpeg')",
            backgroundSize: "cover", backgroundPosition: "center",
            filter: isDark ? "blur(80px) brightness(0.18)" : "blur(80px) brightness(0.35) saturate(0.3)",
            transform: "scale(1.05)", transition: "filter 0.40s",
          }} />
          <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(10,9,8,0.70)" : "rgba(247,244,238,0.72)", transition: "background 0.40s" }} />
        </div>

        <NavBar onBack={() => navigate("/venues")} />

        <div style={{ position: "relative", zIndex: 1, paddingTop: 64, minHeight: "100vh" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "24px 16px" : isTablet ? "28px 24px" : "36px 48px" }}>

            {/* Page header */}
            <div style={{ marginBottom: isMobile ? 20 : 28, animation: "fadeUp 0.30s ease" }}>
              {rebookFrom && (
                <div style={{
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  flexWrap: "wrap", gap: 10,
                  padding: "12px 16px", borderRadius: 10, marginBottom: 18,
                  background: C.statusNote.pending, border: `1px solid ${C.statusNoteBorder.pending}`,
                }}>
                  <div>
                    <div style={{ fontFamily: F.label, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.08em", marginBottom: 3 }}>
                      Rebooking Mode — Select your new {mode === "individual" ? "seat" : "table"}
                    </div>
                    <div style={{ fontFamily: F.body, fontSize: 11, color: C.textSecondary }}>
                      Previous booking: <strong style={{ color: C.textPrimary }}>{rebookFrom.reference_code || rebookFrom.id}</strong> · Old seat released on submit
                    </div>
                  </div>
                  <button onClick={() => setRebookFrom(null)}
                    style={{
                      background: "transparent", border: `1px solid ${C.borderDefault}`, borderRadius: 6,
                      padding: "5px 12px", fontFamily: F.label, fontSize: 10, fontWeight: 700,
                      color: C.textSecondary, cursor: "pointer", letterSpacing: "0.06em", flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
                  >
                    Cancel Rebook
                  </button>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ display: "inline-block", width: 24, height: "1px", background: C.gold, opacity: 0.6 }} />
                <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.26em", color: C.gold, fontWeight: 700, textTransform: "uppercase" }}>
                  Main Wing
                </span>
              </div>
              <h1 style={{
                fontFamily: F.display, fontSize: isMobile ? 26 : isTablet ? 32 : 40,
                fontWeight: 400, color: C.textPrimary, lineHeight: 1.12,
                margin: "0 0 8px", letterSpacing: "0.01em",
              }}>
                Alabang Function Room
              </h1>
              <p style={{ fontFamily: F.body, fontSize: 13.5, color: C.textSecondary, margin: 0, lineHeight: 1.65, maxWidth: 520 }}>
                Select your preferred table or seat in the Main Wing. All reservations are subject to admin confirmation.
              </p>
            </div>

            {/* Mode toggle */}
            <div style={{
              display: "flex", alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? 10 : 16, marginBottom: isMobile ? 18 : 24,
              flexDirection: isMobile ? "column" : "row",
              animation: "fadeUp 0.32s ease",
            }}>
              <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", flexShrink: 0 }}>
                Reserve a:
              </span>
              <div style={{
                display: "flex", alignItems: "center",
                background: C.surfaceInput, borderRadius: 8,
                border: `1px solid ${C.borderDefault}`, padding: 3, gap: 2,
              }}>
                {[["whole", "Whole Table"], ["individual", "Individual Seat"]].map(([val, label]) => (
                  <button key={val}
                    onClick={() => { setMode(val); if (val === "whole") setSelectedSeat(null); else setSelectedTable(null); }}
                    style={{
                      padding: "8px 18px",
                      background: mode === val ? C.gold : "transparent",
                      color: mode === val ? C.textOnAccent : C.textSecondary,
                      border: "none", borderRadius: 6,
                      fontFamily: F.label, fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      cursor: "pointer", transition: "all 0.18s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main layout */}
            <div style={{
              display: "flex", gap: isMobile ? 16 : 24,
              flexDirection: isMobile || isTablet ? "column" : "row",
              alignItems: "flex-start",
              animation: "fadeUp 0.34s ease",
            }}>
              {/* Seat map */}
              <div style={{
                flex: 1, minWidth: 0,
                background: C.cardBg, borderRadius: 12,
                border: `1px solid ${C.cardBorder}`,
                overflow: "hidden",
                boxShadow: isDark ? "0 2px 24px rgba(0,0,0,0.30)" : "0 2px 16px rgba(0,0,0,0.06)",
              }}>
                <div style={{
                  padding: "14px 18px", borderBottom: `1px solid ${C.divider}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Seat Map</div>
                    <div style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary }}>{ROOM}</div>
                  </div>
                  {activeTable && seatRatio && (
                    <div style={{
                      padding: "4px 10px", borderRadius: 6,
                      background: C.goldFaintest, border: `1px solid ${C.borderAccent}`,
                      fontFamily: F.label, fontSize: 9, fontWeight: 700,
                      letterSpacing: "0.14em", color: C.gold, textTransform: "uppercase",
                    }}>
                      {seatRatio} available
                    </div>
                  )}
                </div>
                <div style={{ padding: isMobile ? "12px" : "16px" }}>
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
              </div>

              {/* Right panel */}
              <div style={{ width: isMobile || isTablet ? "100%" : 268, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Legend */}
                <div style={{
                  background: C.cardBg, borderRadius: 12,
                  border: `1px solid ${C.cardBorder}`,
                  padding: "16px 18px",
                  boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.22)" : "0 1px 8px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.divider}` }}>
                    Status Legend
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "6px 20px" : "8px 0", flexDirection: isMobile ? "row" : "column" }}>
                    {Object.entries(STATUS_COLORS).map(([key, color]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <LegendDot color={color} />
                        <span style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, fontWeight: 500 }}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection card */}
                <div style={{
                  background: C.cardBg, borderRadius: 12,
                  border: `1px solid ${C.cardBorder}`,
                  padding: "16px 18px",
                  boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.22)" : "0 1px 8px rgba(0,0,0,0.05)",
                }}>
                  <SectionLabel C={C}>Your Selection</SectionLabel>

                  {[
                    ["Table",  displayTable,  null],
                    ["Seat" + (mode === "whole" && guests > 1 ? "s" : ""), displaySeat, C.gold],
                    ["Room",   ROOM,          null],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: `1px solid ${C.divider}` }}>
                      <span style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textTertiary, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: color || C.textPrimary, textAlign: "right", maxWidth: "62%", lineHeight: 1.4 }}>{value}</span>
                    </div>
                  ))}

                  <div style={{ marginTop: 14 }}>
                    {mode === "whole" && (
                      <button
                        onClick={() => setModal("guestCount")}
                        style={{
                          width: "100%", padding: "12px", border: "none", borderRadius: 8,
                          background: C.gold, color: C.textOnAccent,
                          fontFamily: F.label, fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.16em", textTransform: "uppercase",
                          cursor: "pointer", transition: "background 0.18s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLight; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C.gold; }}
                      >
                        {rebookFrom ? "Move to This Table" : "Reserve This Table"}
                      </button>
                    )}
                    {mode === "individual" && (
                      <button
                        onClick={canProceed ? () => setModal("guestCount") : undefined}
                        style={{
                          width: "100%", padding: "12px", border: `1px solid ${canProceed ? "transparent" : C.borderDefault}`,
                          borderRadius: 8,
                          background: canProceed ? C.gold : "transparent",
                          color: canProceed ? C.textOnAccent : C.textTertiary,
                          fontFamily: F.label, fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.16em", textTransform: "uppercase",
                          cursor: canProceed ? "pointer" : "default",
                          transition: "all 0.18s",
                        }}
                        onMouseEnter={(e) => { if (canProceed) e.currentTarget.style.background = C.goldLight; }}
                        onMouseLeave={(e) => { if (canProceed) e.currentTarget.style.background = C.gold; }}
                      >
                        {selectedSeat
                          ? (rebookFrom ? "Move to This Seat" : "Reserve This Seat")
                          : "Select a Seat First"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Policy */}
                <div style={{
                  background: C.cardBg, borderRadius: 12,
                  border: `1px solid ${C.cardBorder}`,
                  padding: "16px 18px",
                  boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.22)" : "0 1px 8px rgba(0,0,0,0.05)",
                }}>
                  <SectionLabel C={C}>Venue Policy</SectionLabel>
                  <div style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, lineHeight: 1.70 }}>
                    Pending seats are held for <strong style={{ color: C.textPrimary, fontWeight: 600 }}>24 hours</strong>. After expiry, the seat returns to available.
                    <br /><br />
                    All reservations require <strong style={{ color: C.textPrimary, fontWeight: 600 }}>admin approval</strong> before confirmation.
                  </div>
                </div>

                {/* Manage existing */}
                <div style={{
                  background: C.cardBg, borderRadius: 12,
                  border: `1px solid ${C.cardBorder}`,
                  padding: "14px 18px",
                  boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.22)" : "0 1px 8px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, marginBottom: 10, lineHeight: 1.55 }}>
                    Have an existing booking?
                  </div>
                  <button onClick={() => navigate("/manage-booking")}
                    style={{
                      width: "100%", padding: "10px 14px",
                      background: "transparent", border: `1px solid ${C.borderDefault}`,
                      borderRadius: 8, fontFamily: F.label, fontSize: 9, fontWeight: 700,
                      letterSpacing: "0.16em", textTransform: "uppercase",
                      color: C.textSecondary, cursor: "pointer", transition: "all 0.18s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
                  >
                    Manage Reservation
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
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
            C={C} isDark={isDark}
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
            C={C} isDark={isDark}
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
            C={C}
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
            C={C} isDark={isDark}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
}