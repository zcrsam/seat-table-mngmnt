// src/pages/ManageBooking.jsx
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SharedNavbar from "../../../components/SharedNavbar.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const WING = "Main Wing";
const ROOM = "Alabang Function Room";

// ─── Design Tokens ────────────────────────────────────────────────────────────
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
        borderStrong: "rgba(255,255,255,0.18)", borderAccent: "rgba(196,163,90,0.30)",
        textPrimary: "#EDE8DF", textSecondary: "#8A8278",
        textTertiary: "rgba(237,232,223,0.32)", textOnAccent: "#0A0908",
        red: "#8C6B2A", redFaint: "rgba(140,107,42,0.08)", redBorder: "rgba(140,107,42,0.20)",
        green: "#4A9E7E", greenFaint: "rgba(74,158,126,0.08)", greenBorder: "rgba(74,158,126,0.20)",
        badgePending:  { bg: "rgba(196,163,90,0.10)",  color: "#C4A35A", dot: "#C4A35A" },
        badgeApproved: { bg: "rgba(74,158,126,0.10)",  color: "#4A9E7E", dot: "#4A9E7E" },
        badgeRejected: { bg: "rgba(184,92,92,0.10)",   color: "#B85C5C", dot: "#B85C5C" },
        navBg: "rgba(10,9,8,0.95)", navBorder: "rgba(196,163,90,0.12)",
        divider: "rgba(255,255,255,0.05)", inputFocusShadow: "0 0 0 3px rgba(196,163,90,0.12)",
        modalOverlay: "rgba(0,0,0,0.82)",
        statusNote: { pending: "rgba(196,163,90,0.05)", approved: "rgba(74,158,126,0.05)", rejected: "rgba(184,92,92,0.05)" },
        statusNoteBorder: { pending: "rgba(196,163,90,0.15)", approved: "rgba(74,158,126,0.15)", rejected: "rgba(184,92,92,0.15)" },
        headerGradient: "linear-gradient(160deg,#111009 0%,#161410 100%)",
        spinnerBorder: "rgba(255,255,255,0.15)", spinnerTop: "#C4A35A",
        cardBg: "#111009", cardBorder: "rgba(255,255,255,0.06)",
      }
    : {
        gold: "#8C6B2A", goldLight: "#A07D38", goldDim: "#6B5020",
        goldFaint: "rgba(140,107,42,0.07)", goldFaintest: "rgba(140,107,42,0.04)",
        pageBg: "#F7F4EE", surfaceBase: "#FFFFFF", surfaceRaised: "#FAF8F4",
        surfaceInput: "#FFFFFF",
        borderFaint: "rgba(0,0,0,0.04)", borderDefault: "rgba(0,0,0,0.08)",
        borderStrong: "rgba(0,0,0,0.22)", borderAccent: "rgba(140,107,42,0.28)",
        textPrimary: "#18140E", textSecondary: "#7A7060",
        textTertiary: "rgba(24,20,14,0.35)", textOnAccent: "#FFFFFF",
        red: "#8C6B2A", redFaint: "rgba(140,107,42,0.07)", redBorder: "rgba(140,107,42,0.18)",
        green: "#2E7A5A", greenFaint: "rgba(46,122,90,0.07)", greenBorder: "rgba(46,122,90,0.18)",
        badgePending:  { bg: "rgba(140,107,42,0.09)", color: "#8C6B2A", dot: "#8C6B2A" },
        badgeApproved: { bg: "rgba(46,122,90,0.09)",  color: "#2E7A5A", dot: "#2E7A5A" },
        badgeRejected: { bg: "rgba(160,56,56,0.09)",  color: "#A03838", dot: "#A03838" },
        navBg: "rgba(247,244,238,0.96)", navBorder: "rgba(140,107,42,0.14)",
        divider: "rgba(0,0,0,0.05)", inputFocusShadow: "0 0 0 3px rgba(140,107,42,0.10)",
        modalOverlay: "rgba(0,0,0,0.55)",
        statusNote: { pending: "rgba(140,107,42,0.05)", approved: "rgba(46,122,90,0.05)", rejected: "rgba(160,56,56,0.05)" },
        statusNoteBorder: { pending: "rgba(140,107,42,0.18)", approved: "rgba(46,122,90,0.18)", rejected: "rgba(160,56,56,0.18)" },
        headerGradient: "linear-gradient(160deg,#111009 0%,#1A160F 100%)",
        spinnerBorder: "rgba(0,0,0,0.12)", spinnerTop: "#8C6B2A",
        cardBg: "#FFFFFF", cardBorder: "rgba(0,0,0,0.07)",
      };
}

const F = {
  display: "'Inter','Helvetica Neue',Arial,sans-serif",
  body:    "'Inter','Helvetica Neue',Arial,sans-serif",
  mono:    "'Inter','Helvetica Neue',Arial,sans-serif",
  label:   "'Inter','Helvetica Neue',Arial,sans-serif",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  event_date:       (b.event_date ?? b.eventDate ?? b.date ?? "").toString().split("T")[0],
  event_time:       b.event_time ?? b.eventTime ?? b.time ?? "",
  status:           (b.status ?? "pending").toLowerCase(),
  guests:           b.guests_count ?? b.guests ?? b.guest_count ?? 1,
  type:             b.type ?? "whole",
  special_requests: b.special_requests ?? b.specialRequests ?? "",
});

const isCancellable = (status) => {
  const s = (status ?? "").toLowerCase();
  return s === "pending" || s === "approved" || s === "reserved";
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Spinner({ size = 13, C }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `1.5px solid ${C.spinnerBorder}`, borderTopColor: C.spinnerTop,
      borderRadius: "50%", animation: "spin 0.65s linear infinite", flexShrink: 0,
    }} />
  );
}

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  const C = getTokens(isDark);
  return (
    <button type="button" onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 8px",
        background: "transparent", border: `1px solid ${C.borderDefault}`,
        borderRadius: 20, cursor: "pointer", flexShrink: 0, transition: "all 0.22s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderAccent; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; }}
    >
      <span style={{
        position: "relative", width: 28, height: 16, borderRadius: 8,
        background: isDark ? "rgba(196,163,90,0.22)" : "rgba(0,0,0,0.08)",
        display: "inline-flex", alignItems: "center", flexShrink: 0, transition: "background 0.28s",
      }}>
        <span style={{
          position: "absolute", left: isDark ? 2 : "calc(100% - 14px)",
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

// ─── Cancel Reason Modal ──────────────────────────────────────────────────────
function CancelReasonModal({ onConfirm, onDismiss, cancelling, C }) {
  const [reason, setReason] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, background: C.modalOverlay, zIndex: 5000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    }}
      onClick={(e) => { if (e.target === e.currentTarget && !cancelling) onDismiss(); }}
    >
      <div style={{
        background: C.surfaceBase, borderRadius: 14, width: "100%", maxWidth: 420,
        boxShadow: "0 24px 80px rgba(0,0,0,0.30)", border: `1px solid ${C.borderDefault}`,
        fontFamily: F.body, animation: "modalIn 0.20s cubic-bezier(0.16,1,0.3,1)", overflow: "hidden",
      }}>
        {/* ── Gold top bar instead of red ── */}
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent 0%,${C.gold}90 30%,${C.gold}90 70%,transparent 100%)` }} />
        <div style={{ padding: "22px 22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: C.goldFaint, border: `1px solid ${C.borderAccent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Cancel Booking</div>
              <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 600, color: C.textPrimary, lineHeight: 1.2 }}>Are you sure?</div>
            </div>
          </div>

          <div style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 18,
            background: C.goldFaint, border: `1px solid ${C.borderAccent}`,
            fontFamily: F.body, fontSize: 12.5, color: C.textSecondary, lineHeight: 1.65,
          }}>
            This action <strong style={{ color: C.textPrimary }}>cannot be undone</strong>. Your reservation will be permanently cancelled.
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontFamily: F.label, fontSize: 9,
              letterSpacing: "0.18em", color: focused ? C.gold : C.textSecondary,
              fontWeight: 700, textTransform: "uppercase", marginBottom: 7, transition: "color 0.18s",
            }}>
              Reason for cancellation{" "}
              <span style={{ color: C.textTertiary, fontWeight: 400, letterSpacing: "0.06em", textTransform: "none" }}>(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. Change of plans, date conflict, found another venue…"
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box", padding: "11px 14px",
                border: `1.5px solid ${focused ? C.borderAccent : C.borderDefault}`,
                borderRadius: 8, background: C.surfaceInput,
                fontFamily: F.body, fontSize: 13, color: C.textPrimary,
                outline: "none", resize: "vertical", minHeight: 80,
                transition: "border-color 0.18s, box-shadow 0.18s",
                boxShadow: focused ? C.inputFocusShadow : "none",
                colorScheme: "light",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onDismiss} disabled={cancelling}
              style={{
                flex: 1, padding: "12px", background: "transparent",
                border: `1px solid ${C.borderDefault}`, borderRadius: 8,
                fontFamily: F.label, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: C.textSecondary, cursor: cancelling ? "not-allowed" : "pointer", transition: "all 0.18s",
              }}
              onMouseEnter={(e) => { if (!cancelling) { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
            >Keep Booking</button>
            <button onClick={() => onConfirm(reason.trim())} disabled={cancelling}
              style={{
                flex: 1, padding: "12px",
                background: cancelling ? C.goldDim : C.gold,
                border: "none", borderRadius: 8,
                fontFamily: F.label, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: C.textOnAccent, cursor: cancelling ? "not-allowed" : "pointer", transition: "all 0.18s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={(e) => { if (!cancelling) e.currentTarget.style.background = C.goldLight; }}
              onMouseLeave={(e) => { if (!cancelling) e.currentTarget.style.background = C.gold; }}
            >
              {cancelling ? <><Spinner C={C} size={12} />Cancelling…</> : "Yes, Cancel It"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cancel Success Modal ─────────────────────────────────────────────────────
function CancelSuccessModal({ booking, onDone, C }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: C.modalOverlay, zIndex: 5000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    }}>
      <div style={{
        background: C.surfaceBase, borderRadius: 14, width: "100%", maxWidth: 400,
        boxShadow: "0 24px 80px rgba(0,0,0,0.30)", border: `1px solid ${C.borderDefault}`,
        fontFamily: F.body, animation: "modalIn 0.20s cubic-bezier(0.16,1,0.3,1)", overflow: "hidden",
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,transparent 0%,${C.green}90 30%,${C.green}90 70%,transparent 100%)` }} />

        <div style={{ padding: "28px 26px 26px" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, margin: "0 auto 18px",
            background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em", color: C.green, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
              Booking Cancelled
            </div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.textPrimary, lineHeight: 1.2, marginBottom: 10 }}>
              Successfully Cancelled
            </div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>
              Your reservation <strong style={{ color: C.textPrimary, fontFamily: F.mono, letterSpacing: "0.06em" }}>{booking?.reference_code || booking?.id || "—"}</strong> has been cancelled. You will receive a confirmation email shortly.
            </div>
          </div>

          <div style={{
            padding: "12px 16px", borderRadius: 10, marginBottom: 22,
            background: C.goldFaintest, border: `1px solid ${C.borderAccent}`,
          }}>
            {[
              ["Name",   booking?.name || "—"],
              ["Email",  booking?.email || "—"],
              ["Status", "Cancelled"],
            ].map(([label, value], i, arr) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "7px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${C.divider}` : "none",
              }}>
                <span style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textTertiary }}>{label}</span>
                <span style={{ fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: label === "Status" ? C.green : C.textPrimary }}>{value}</span>
              </div>
            ))}
          </div>

          <button onClick={onDone}
            style={{
              width: "100%", padding: "13px", border: "none", borderRadius: 8,
              background: C.gold, color: C.textOnAccent,
              fontFamily: F.label, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              cursor: "pointer", transition: "background 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLight; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.gold; }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Edit Field ────────────────────────────────────────────────────────
function EditField({ label, value, onChange, type = "text", placeholder = "", required = false, min, C, isDark }) {
  const [focused, setFocused] = useState(false);
  const isTextarea = type === "textarea";
  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "10px 12px",
    border: `1.5px solid ${focused ? C.borderAccent : C.borderDefault}`,
    borderRadius: 8, background: C.surfaceInput, color: C.textPrimary,
    fontFamily: F.body, fontSize: 13, outline: "none",
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
        {label}{required && <span style={{ color: C.gold, marginLeft: 3 }}>*</span>}
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ManageBooking() {
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

  const [referenceCode, setReferenceCode]         = useState("");
  const [searching, setSearching]                 = useState(false);
  const [saving, setSaving]                       = useState(false);
  const [cancelling, setCancelling]               = useState(false);
  const [showCancelModal, setShowCancelModal]     = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [cancelledBooking, setCancelledBooking]   = useState(null);
  const [error, setError]                         = useState("");
  const [booking, setBooking]                     = useState(null);
  const [editing, setEditing]                     = useState(false);
  const [editForm, setEditForm]                   = useState({});
  const [focused, setFocused]                     = useState(false);

  // ── Date / time formatters ──────────────────────────────────────────────────
  const fmtDate = (d) => {
    if (!d) return "—";
    const dateOnly = String(d).split("T")[0];
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

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const trimmed = referenceCode.trim();
    if (!trimmed) { setError("Please enter your reference code."); return; }
    setError(""); setSearching(true); setBooking(null);
    try {
      const response = await fetch(`${API_BASE_URL}/reservations?reference_code=${encodeURIComponent(trimmed)}`, {
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
          eventDate:       normalized.event_date,
          eventTime:       normalized.event_time || "",
          specialRequests: normalized.special_requests,
        });
      } else {
        setError("No booking found with this reference code. Please check and try again.");
      }
    } catch (err) {
      setError("Failed to search. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // ── Update ──────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    setError(""); setSaving(true);
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
      setError(err.message || "Failed to update booking. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel ──────────────────────────────────────────────────────────────────
  const handleCancelConfirm = async (reason) => {
    setCancelling(true);
    setError("");
    const resourceId = booking.db_id ?? booking.id;
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${resourceId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ cancellation_reason: reason || null }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `HTTP ${response.status}`);
      }
      setCancelledBooking(booking);
      setShowCancelModal(false);
      setShowCancelSuccess(true);
      setBooking(null);
      setReferenceCode("");
    } catch (err) {
      setError(`Failed to cancel booking: ${err.message}`);
      setShowCancelModal(false);
    } finally {
      setCancelling(false);
    }
  };

  // ── Sub-components ──────────────────────────────────────────────────────────
  function StatusBadge({ status }) {
    const cfg =
      status === "pending"   ? { ...C.badgePending,  label: "Pending"   } :
      status === "reserved"  ? { ...C.badgeApproved, label: "Confirmed" } :
      status === "approved"  ? { ...C.badgeApproved, label: "Approved"  } :
      status === "rejected"  ? { ...C.badgeRejected, label: "Rejected"  } :
      status === "cancelled" || status === "canceled"
        ? { bg: "rgba(130,130,130,0.10)", color: "#888", dot: "#888", label: "Cancelled" }
        : { bg: "rgba(130,130,130,0.10)", color: "#888", dot: "#888", label: status ?? "Unknown" };
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

  const canCancel = booking ? isCancellable(booking.status) : false;

  return (
    <ThemeContext.Provider value={{ isDark, toggle: toggleTheme }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div style={{ minHeight: "100vh", fontFamily: F.body, background: C.pageBg, position: "relative", transition: "background 0.30s" }}>

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

        <SharedNavbar />

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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            <div style={{ width: "100%", maxWidth: 440 }}>

              {/* ── SEARCH STATE ──────────────────────────────────────────── */}
              {!booking && (
                <>
                  <div style={{ marginBottom: 40, animation: "fadeUp 0.32s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ display: "inline-block", width: 24, height: "1px", background: C.gold, opacity: 0.6 }} />
                      <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.26em", color: C.gold, fontWeight: 700, textTransform: "uppercase" }}>Guest Services</span>
                    </div>
                    <h1 style={{ fontFamily: F.display, fontSize: "clamp(30px,5vw,44px)", fontWeight: 400, color: C.textPrimary, lineHeight: 1.12, margin: "0 0 12px", letterSpacing: "0.01em", marginBottom: -20, }}>
                      Manage Your<br />Booking
                    </h1>
               
                  </div>

                  <div style={{ animation: "fadeUp 0.36s ease" }}>
                    {/* ── FIX 1: "How it works" box — improved contrast ── */}
                    <div style={{
                      padding: "14px 16px", borderRadius: 8, marginBottom: 20,
                      background: isDark ? "rgba(196,163,90,0.10)" : "rgba(140,107,42,0.09)",
                      border: `1px solid ${C.borderAccent}`,
                      display: "flex", gap: 12, alignItems: "flex-start",
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 6,
                        background: isDark ? "rgba(196,163,90,0.15)" : "rgba(140,107,42,0.12)",
                        border: `1px solid ${C.borderAccent}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        marginTop: 1,
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" >
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <div>
                        <div style={{
                          fontFamily: F.label, fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.12em", textTransform: "uppercase",
                          color: C.gold, marginBottom: 5,
                        }}>
                          How it works
                        </div>
                        <div style={{
                          fontFamily: F.body, fontSize: 13,
                          color: C.textPrimary,   /* ← was textSecondary, now full contrast */
                          lineHeight: 1.60,
                        }}>
                          Enter your booking reference code to view, edit, or cancel your reservation.
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{
                        display: "flex", alignItems: "center", gap: 6,
                        fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em",
                        color: focused ? C.gold : C.textSecondary,
                        fontWeight: 700, textTransform: "uppercase", marginBottom: 8, transition: "color 0.18s",
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        Reference Code <span style={{ color: C.gold, marginLeft: 2 }}>*</span>
                      </label>
                      <input
                        value={referenceCode}
                        onChange={(e) => { setReferenceCode(e.target.value); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="e.g. 2024-0001"
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
                        background: C.goldFaint, borderLeft: `3px solid ${C.gold}`,
                        fontSize: 12.5, color: C.gold, lineHeight: 1.60,
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
                        borderRadius: 10, fontFamily: F.label, fontSize: 10, fontWeight: 700,
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
                    {/* Booking Found — primary emphasis */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{
                        fontFamily: F.display, fontSize: "clamp(26px,4.5vw,36px)",
                        fontWeight: 600, color: "#1A4D2E",
                        letterSpacing: "-0.01em", lineHeight: 1.1,
                      }}>Booking Found</span>
                    </div>
                    {/* Manage Your Booking — secondary / subdued */}
                    <p style={{ fontFamily: F.label, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textTertiary, fontWeight: 700, margin: "0 0 6px" }}>
                      Manage Your Booking
                    </p>
                    <p style={{ fontFamily: F.body, fontSize: 12.5, color: C.textSecondary, margin: 0 }}>
                      {editing ? "Update your booking information below." : "View details, edit information, or cancel your reservation."}
                    </p>
                  </div>

                  {/* Card */}
                  <div style={{ background: C.surfaceBase, borderRadius: 14, border: `1px solid ${C.borderDefault}`, overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ height: "2px", background: `linear-gradient(90deg, transparent 0%, ${C.gold}80 30%, ${C.gold}80 70%, transparent 100%)` }} />
                    <div style={{ padding: "20px 22px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
                        <div>
                          <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Reference Code</div>
                          <div style={{ fontFamily: F.mono, fontSize: 28, fontWeight: 500, color: C.textPrimary, letterSpacing: "0.06em", lineHeight: 1 }}>
                            {booking.reference_code || booking.id || "—"}
                          </div>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      {!canCancel && !editing && (
                        <div style={{
                          padding: "9px 13px", borderRadius: 7, marginBottom: 16,
                          background: C.goldFaint, border: `1px solid ${C.borderAccent}`,
                          fontFamily: F.body, fontSize: 12, color: C.gold, lineHeight: 1.55,
                          display: "flex", alignItems: "flex-start", gap: 8,
                        }}>
                          <svg style={{ flexShrink: 0, marginTop: 1 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <span>
                            This booking is <strong>{booking.status}</strong> and cannot be cancelled.
                            Only <strong>pending</strong> or <strong>approved</strong> bookings may be cancelled.
                          </span>
                        </div>
                      )}

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
                            <div style={{ padding: "10px 14px", borderRadius: 8, background: C.goldFaint, border: `1px solid ${C.borderAccent}`, color: C.gold, fontSize: 12.5, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 8 }}>
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
                              ["Venue",        booking.venue?.name || booking.venue || "Main Wing"],
                              ["Room",         booking.room || booking.venue?.name || "Alabang Function Room"],
                              ["Date",         fmtDate(booking.event_date)],
                              ["Time",         fmtTime(booking.event_time)],
                              ["Guests",       booking.guests ? `${booking.guests} pax` : "1"],
                              ["Table / Seat", [booking.table, booking.seat].filter(Boolean).join(" / ") || "1"],
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

                  {/* Action Buttons */}
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

                        {/* ── FIX 2: Cancel button — neutral ghost style, no red ── */}
                        {canCancel ? (
                          <button onClick={() => { setError(""); setShowCancelModal(true); }}
                            style={{
                              flex: 1, padding: "11px 16px",
                              background: "transparent",
                              border: `1px solid ${C.borderStrong}`,
                              borderRadius: 8,
                              fontFamily: F.label, fontSize: 10, fontWeight: 700,
                              letterSpacing: "0.10em", textTransform: "uppercase",
                              color: C.textSecondary,
                              cursor: "pointer", transition: "all 0.18s",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = C.borderAccent;
                              e.currentTarget.style.color = C.textPrimary;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = C.borderStrong;
                              e.currentTarget.style.color = C.textSecondary;
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            Cancel
                          </button>
                        ) : (
                          <button disabled title={`Cannot cancel a ${booking.status} booking`}
                            style={{ flex: 1, padding: "11px 16px", background: "transparent", border: `1px solid ${C.borderDefault}`, borderRadius: 8, fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.textTertiary, cursor: "not-allowed", opacity: 0.5 }}
                          >Cancel</button>
                        )}
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

      {/* Cancel Success Modal */}
      {showCancelSuccess && (
        <CancelSuccessModal
          booking={cancelledBooking}
          C={C}
          onDone={() => {
            setShowCancelSuccess(false);
            setCancelledBooking(null);
          }}
        />
      )}
    </ThemeContext.Provider>
  );
}