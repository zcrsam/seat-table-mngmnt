// src/features/booking/pages/ManageBooking.jsx
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import bellevueLogo from "../../../assets/bellevue-logo.png";

// ─────────────────────────────────────────────
// THEME CONTEXT
// ─────────────────────────────────────────────
const ThemeContext = createContext({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

function getTokens(isDark) {
  return isDark
    ? {
        gold: "#C9A84C", goldLight: "#D9B96A", goldFaint: "rgba(201,168,76,0.08)",
        pageBg: "#0A0908", cardBg: "#111010", cardBorder: "rgba(255,255,255,0.07)",
        cardBorderHover: "rgba(201,168,76,0.30)",
        inputBg: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.10)", inputFocus: "#C9A84C",
        textPrimary: "#F2EDE4", textMuted: "#7A7060", textSubtle: "rgba(242,237,228,0.45)",
        navBg: "rgba(10,9,8,0.90)", navBorder: "rgba(255,255,255,0.06)",
        heroBg: "#0A0908", headerGradient: "linear-gradient(160deg,#111010 0%,#161410 100%)",
        labelColor: "rgba(201,168,76,0.70)", divider: "rgba(255,255,255,0.06)",
        red: "#C0564A", green: "#3A9E78",
        overlayCard: "rgba(10,9,8,0.80)", overlayCardBorder: "rgba(255,255,255,0.08)",
        badgePending:  { bg: "rgba(201,168,76,0.10)",  color: "#C9A84C",   dot: "#C9A84C"   },
        badgeApproved: { bg: "rgba(58,158,120,0.12)",  color: "#3A9E78",   dot: "#3A9E78"   },
        badgeRejected: { bg: "rgba(192,86,74,0.10)",   color: "#C0564A",   dot: "#C0564A"   },
        statusNote:       { pending: "rgba(201,168,76,0.05)",   approved: "rgba(58,158,120,0.05)",  rejected: "rgba(192,86,74,0.05)"  },
        statusNoteBorder: { pending: "rgba(201,168,76,0.15)",   approved: "rgba(58,158,120,0.15)",  rejected: "rgba(192,86,74,0.15)"  },
        detailBorder: "rgba(255,255,255,0.05)", detailLabel: "rgba(242,237,228,0.35)", detailValue: "#F2EDE4",
        sectionLabel: "rgba(201,168,76,0.55)",
        spinnerBorder: "rgba(255,255,255,0.15)", spinnerTop: "#C9A84C",
        modalOverlay: "rgba(0,0,0,0.78)",
      }
    : {
        gold: "#9A7828", goldLight: "#B8922A", goldFaint: "rgba(154,120,40,0.07)",
        pageBg: "#F3EFE6", cardBg: "#FFFFFF", cardBorder: "rgba(0,0,0,0.07)",
        cardBorderHover: "rgba(154,120,40,0.30)",
        inputBg: "#FFFFFF", inputBorder: "rgba(0,0,0,0.10)", inputFocus: "#9A7828",
        textPrimary: "#1A1612", textMuted: "#6B6050", textSubtle: "rgba(26,22,18,0.40)",
        navBg: "rgba(243,239,230,0.92)", navBorder: "rgba(0,0,0,0.07)",
        heroBg: "#1A1612", headerGradient: "linear-gradient(160deg,#111010 0%,#1E1A14 100%)",
        labelColor: "rgba(154,120,40,0.75)", divider: "rgba(0,0,0,0.06)",
        red: "#B0443A", green: "#2E8A66",
        overlayCard: "rgba(255,253,248,0.92)", overlayCardBorder: "rgba(0,0,0,0.08)",
        badgePending:  { bg: "rgba(154,120,40,0.09)",  color: "#9A7828",  dot: "#9A7828"  },
        badgeApproved: { bg: "rgba(46,138,102,0.10)",  color: "#2E8A66",  dot: "#2E8A66"  },
        badgeRejected: { bg: "rgba(176,68,58,0.09)",   color: "#B0443A",  dot: "#B0443A"  },
        statusNote:       { pending: "rgba(154,120,40,0.05)",  approved: "rgba(46,138,102,0.05)",  rejected: "rgba(176,68,58,0.05)"  },
        statusNoteBorder: { pending: "rgba(154,120,40,0.18)",  approved: "rgba(46,138,102,0.18)",  rejected: "rgba(176,68,58,0.18)"  },
        detailBorder: "rgba(0,0,0,0.05)", detailLabel: "rgba(26,22,18,0.38)", detailValue: "#1A1612",
        sectionLabel: "rgba(154,120,40,0.60)",
        spinnerBorder: "rgba(0,0,0,0.12)", spinnerTop: "#9A7828",
        modalOverlay: "rgba(0,0,0,0.55)",
      };
}

const F = {
  display: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ─────────────────────────────────────────────
// RESOLVE NUMERIC DB ID
// ─────────────────────────────────────────────
function resolveNumericId(reservation) {
  const candidates = [
    reservation?.db_id, reservation?.numeric_id,
    reservation?.reservation_id, reservation?.id,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0 && Number.isInteger(n)) return n;
  }
  const stripped = parseInt(String(reservation?.id ?? "").replace(/\D/g, ""), 10);
  if (Number.isFinite(stripped) && stripped > 0) return stripped;
  return null;
}

function extractList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.reservations)) return data.reservations;
  if (Array.isArray(data.results)) return data.results;
  if (data.id || data.name) return [data];
  return [];
}

// ─────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────
function Spinner({ size = 14, C }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `1.5px solid ${C.spinnerBorder}`,
      borderTopColor: C.spinnerTop,
      borderRadius: "50%", animation: "spin 0.65s linear infinite", flexShrink: 0,
    }} />
  );
}

// ─────────────────────────────────────────────
// CLOSE BUTTON
// ─────────────────────────────────────────────
function CloseBtn({ onClick, disabled = false, C }) {
  return (
    <button
      onClick={onClick} disabled={disabled} title="Close"
      style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "transparent",
        border: `1px solid ${C.cardBorder}`,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "border-color 0.18s, background 0.18s",
        padding: 0, zIndex: 10,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = C.gold;
          e.currentTarget.style.background = C.goldFaint;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = C.cardBorder;
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke={C.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────
// FIELD INPUT
// ─────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", placeholder = "", C, required = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontFamily: F.body, fontSize: 10,
        letterSpacing: "0.14em", color: C.sectionLabel, fontWeight: 600,
        textTransform: "uppercase", marginBottom: 6,
      }}>
        {label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box", padding: "10px 12px",
          border: `1px solid ${focused ? C.inputFocus : C.inputBorder}`,
          borderRadius: 8, background: C.inputBg,
          fontFamily: F.body, fontSize: 13, color: C.textPrimary,
          outline: "none", transition: "border-color 0.18s",
          colorScheme: C.inputBg === "#FFFFFF" ? "light" : "dark",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION DIVIDER LABEL
// ─────────────────────────────────────────────
function SectionLabel({ children, C, style = {} }) {
  return (
    <div style={{
      fontSize: 9, letterSpacing: "0.20em", color: C.sectionLabel, fontWeight: 600,
      textTransform: "uppercase", marginBottom: 14, paddingBottom: 8,
      borderBottom: `1px solid ${C.divider}`, ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// THEME TOGGLE
// ─────────────────────────────────────────────
function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex", alignItems: "center", padding: 0,
        background: "none", border: "none", cursor: "pointer", flexShrink: 0,
      }}>
      <span style={{
        position: "relative", width: 42, height: 23, borderRadius: 12,
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"}`,
        display: "inline-flex", alignItems: "center", flexShrink: 0,
        transition: "background 0.28s",
      }}>
        <span style={{
          position: "absolute", top: 3,
          left: isDark ? 3 : "calc(100% - 20px)",
          width: 15, height: 15, borderRadius: "50%",
          background: isDark ? "#C9A84C" : "#9A7828",
          transition: "left 0.26s cubic-bezier(.4,0,.2,1)",
        }} />
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────
function ManageBookingNav() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000,
      height: 60, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 clamp(16px,4vw,52px)",
      background: C.navBg, backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: `1px solid ${C.navBorder}`,
      boxSizing: "border-box", transition: "background 0.30s",
    }}>
      <img
        src={bellevueLogo} alt="The Bellevue Manila"
        onClick={() => navigate("/")}
        style={{
          height: 30, width: "auto", cursor: "pointer", display: "block", flexShrink: 0,
          filter: isDark ? "none" : "brightness(0) saturate(100%) invert(25%) sepia(40%) saturate(500%) hue-rotate(10deg)",
          transition: "filter 0.30s",
        }}
      />
      <ThemeToggle />
    </nav>
  );
}

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────
function StatusBadge({ status, C }) {
  const s = (status || "").toLowerCase();
  const cfg =
    s === "pending"   ? { ...C.badgePending,  label: "Pending"   } :
    s === "reserved"  ? { ...C.badgeApproved, label: "Confirmed" } :
    s === "approved"  ? { ...C.badgeApproved, label: "Confirmed" } :
    s === "confirmed" ? { ...C.badgeApproved, label: "Confirmed" } :
    s === "rejected"  ? { ...C.badgeRejected, label: "Cancelled" } :
    s === "cancelled" ? { ...C.badgeRejected, label: "Cancelled" } :
    s === "canceled"  ? { ...C.badgeRejected, label: "Cancelled" } :
    { bg: "rgba(120,120,120,0.08)", color: "#888", dot: "#888", label: status ?? "Unknown" };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      padding: "3px 10px 3px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.10em",
      textTransform: "uppercase", fontFamily: F.body,
    }}>
      <span style={{
        width: 4, height: 4, borderRadius: "50%",
        background: cfg.dot, display: "inline-block", flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// DETAIL ROW
// ─────────────────────────────────────────────
function DetailRow({ label, value, C }) {
  if (value === null || value === undefined || value === "" || value === "—") return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", padding: "9px 0",
      borderBottom: `1px solid ${C.detailBorder}`,
    }}>
      <span style={{
        fontFamily: F.body, fontSize: 11, fontWeight: 500,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: C.detailLabel, minWidth: 100, flexShrink: 0,
      }}>{label}</span>
      <span style={{
        fontFamily: F.body, fontSize: 13, color: C.detailValue,
        textAlign: "right", maxWidth: 260, lineHeight: 1.6,
      }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL SHELL
// ─────────────────────────────────────────────
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
        background: C.cardBg, borderRadius: 16, width: maxWidth,
        maxWidth: "95vw", maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.30)",
        border: `1px solid ${C.cardBorder}`,
        fontFamily: F.body, position: "relative",
        animation: "modalIn 0.20s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL HEADER
// ─────────────────────────────────────────────
function ModalHeader({ eyebrow, title, meta, onClose, disabled, C }) {
  return (
    <div style={{
      background: C.headerGradient,
      padding: "22px 24px 20px",
      borderRadius: "16px 16px 0 0",
      position: "sticky", top: 0, zIndex: 2,
      borderBottom: `1px solid rgba(255,255,255,0.05)`,
    }}>
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 20 }}>
        <CloseBtn onClick={onClose} disabled={disabled} C={{ ...C, cardBorder: "rgba(255,255,255,0.10)", textMuted: "rgba(242,237,228,0.50)", goldFaint: "rgba(201,168,76,0.12)" }} />
      </div>
      <div style={{ paddingRight: 44 }}>
        {eyebrow && (
          <div style={{
            fontFamily: F.body, fontSize: 9, letterSpacing: "0.22em",
            color: "rgba(201,168,76,0.70)", fontWeight: 600,
            textTransform: "uppercase", marginBottom: 6,
          }}>
            {eyebrow}
          </div>
        )}
        <div style={{
          fontFamily: F.display, fontSize: 20, fontWeight: 400,
          color: "#F2EDE4", letterSpacing: "0.01em", lineHeight: 1.2,
        }}>
          {title}
        </div>
        {meta && <div style={{ marginTop: 8 }}>{meta}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────
function EditModal({ reservation, onClose, onSaved, C, isDark }) {
  const status = (reservation.status || "").toLowerCase();
  const isApproved = status === "reserved" || status === "approved" || status === "confirmed";

  const [form, setForm] = useState({
    name:             reservation.name             || "",
    email:            reservation.email            || "",
    phone:            reservation.phone            || reservation.contact_number || reservation.mobile || "",
    event_date:       reservation.event_date       || reservation.eventDate || "",
    event_time:       reservation.event_time       || reservation.eventTime || "",
    guests_count:     String(reservation.guests_count || reservation.guests || ""),
    special_requests: reservation.special_requests || "",
  });
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim())        { setErrMsg("Full name is required.");        return; }
    if (!form.email.trim())       { setErrMsg("Email address is required.");    return; }
    if (!form.phone.trim())       { setErrMsg("Phone number is required.");     return; }
    if (!form.event_date)         { setErrMsg("Event date is required.");       return; }
    if (!form.event_time)         { setErrMsg("Event time is required.");       return; }
    if (!form.guests_count || isNaN(Number(form.guests_count)) || Number(form.guests_count) < 1) {
      setErrMsg("A valid guest count is required.");
      return;
    }

    const numId = resolveNumericId(reservation);
    if (!numId) {
      setErrMsg("Cannot identify reservation record. Please refresh and try again.");
      return;
    }

    setErrMsg(""); setSaving(true);

    const guestsNum = Number(form.guests_count);
    const payload = {
      name:             form.name.trim(),
      email:            form.email.trim(),
      phone:            form.phone.trim(),
      contact_number:   form.phone.trim(),
      mobile:           form.phone.trim(),
      event_date:       form.event_date,
      eventDate:        form.event_date,
      event_time:       form.event_time,
      eventTime:        form.event_time,
      guests_count:     guestsNum,
      guests:           guestsNum,
      special_requests: form.special_requests.trim(),
    };

    try {
      let res = await fetch(`${API_BASE}/reservations/${numId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 405) {
        res = await fetch(`${API_BASE}/reservations/${numId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.message || data?.error ||
          (data?.errors ? Object.values(data.errors).flat().join(", ") : null) ||
          `HTTP ${res.status}`
        );
      }

      let serverData = {};
      try { const j = await res.json(); serverData = j?.data ?? j ?? {}; } catch (_) {}

      const merged = {
        ...reservation,
        name:             serverData.name             ?? form.name.trim(),
        email:            serverData.email            ?? form.email.trim(),
        phone:            serverData.phone            ?? serverData.contact_number ?? form.phone.trim(),
        contact_number:   serverData.contact_number   ?? serverData.phone          ?? form.phone.trim(),
        mobile:           serverData.mobile           ?? serverData.phone          ?? form.phone.trim(),
        event_date:       serverData.event_date       ?? serverData.eventDate      ?? form.event_date,
        eventDate:        serverData.eventDate        ?? serverData.event_date     ?? form.event_date,
        event_time:       serverData.event_time       ?? serverData.eventTime      ?? form.event_time,
        eventTime:        serverData.eventTime        ?? serverData.event_time     ?? form.event_time,
        guests_count:     serverData.guests_count     ?? serverData.guests         ?? guestsNum,
        guests:           serverData.guests           ?? serverData.guests_count   ?? guestsNum,
        special_requests: serverData.special_requests ?? form.special_requests.trim(),
      };

      onSaved(merged);
    } catch (e) {
      setErrMsg(e.message || "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell onClose={onClose} disabled={saving} C={C} zIndex={4500}>
      <ModalHeader
        eyebrow="Edit Booking"
        title="Update Your Details"
        onClose={onClose}
        disabled={saving}
        C={C}
        meta={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: 10, color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", fontWeight: 600 }}>
              REF {reservation.id || reservation.reference_code || "—"}
            </span>
            <StatusBadge status={reservation.status} C={C} />
          </div>
        }
      />

      <div style={{ padding: "24px 24px 28px" }}>

        {isApproved && (
          <div style={{
            marginBottom: 20, padding: "11px 14px",
            background: C.statusNote.approved,
            border: `1px solid ${C.statusNoteBorder.approved}`,
            borderRadius: 8, fontSize: 12, color: C.green, lineHeight: 1.65,
          }}>
            <strong style={{ color: C.green }}>Confirmed booking.</strong> You may update personal details and special requests. Changes to date, time, or guest count may require staff review.
          </div>
        )}

        {errMsg && (
          <div style={{
            marginBottom: 18, padding: "11px 14px",
            background: C.statusNote.rejected,
            border: `1px solid ${C.statusNoteBorder.rejected}`,
            borderRadius: 8, fontSize: 12, color: C.red, lineHeight: 1.65,
          }}>
            {errMsg}
          </div>
        )}

        <SectionLabel C={C}>Personal Information</SectionLabel>
        <Field label="Full Name"     value={form.name}   onChange={set("name")}  C={C} required placeholder="e.g. Sarah Abane" />
        <Field label="Email Address" value={form.email}  onChange={set("email")} C={C} required type="email" placeholder="e.g. sarah@email.com" />
        <Field label="Phone Number"  value={form.phone}  onChange={set("phone")} C={C} required type="tel"   placeholder="e.g. 09171234567" />

        <SectionLabel C={C} style={{ marginTop: 22 }}>Event Details</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Event Date" value={form.event_date} onChange={set("event_date")} C={C} required type="date" />
          <Field label="Event Time" value={form.event_time} onChange={set("event_time")} C={C} required type="time" />
        </div>
        <Field label="Number of Guests" value={form.guests_count} onChange={set("guests_count")} C={C} required type="number" placeholder="e.g. 4" />

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "block", fontFamily: F.body, fontSize: 10, letterSpacing: "0.14em",
            color: C.sectionLabel, fontWeight: 600, textTransform: "uppercase", marginBottom: 6,
          }}>
            Special Requests
          </label>
          <textarea
            value={form.special_requests}
            onChange={(e) => set("special_requests")(e.target.value)}
            placeholder="Dietary needs, accessibility requirements, preferences..."
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 12px",
              border: `1px solid ${C.inputBorder}`, borderRadius: 8,
              background: C.inputBg, fontFamily: F.body, fontSize: 13,
              color: C.textPrimary, outline: "none", resize: "vertical",
              transition: "border-color 0.18s", colorScheme: isDark ? "dark" : "light",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = C.inputFocus; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = C.inputBorder; }}
          />
        </div>

        <div style={{
          padding: "10px 12px", borderRadius: 8, marginBottom: 22,
          background: C.goldFaint, border: `1px solid ${C.divider}`,
          fontSize: 11, color: C.textMuted, lineHeight: 1.65,
        }}>
          Venue, table, and seat assignments cannot be changed here. Please contact us directly for those modifications.
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose} disabled={saving}
            style={{
              flex: 1, padding: "11px", border: `1px solid ${C.cardBorder}`,
              borderRadius: 8, background: "transparent", color: C.textMuted,
              fontFamily: F.body, fontSize: 12, fontWeight: 500, letterSpacing: "0.04em",
              cursor: saving ? "not-allowed" : "pointer", transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.cardBorder; e.currentTarget.style.color = C.textMuted; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={saving}
            style={{
              flex: 2, padding: "11px", border: "none", borderRadius: 8,
              background: saving ? C.textMuted : C.gold,
              color: "#FFFFFF",
              fontFamily: F.body, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
              cursor: saving ? "not-allowed" : "pointer", transition: "all 0.18s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = C.goldLight; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = C.gold; }}
          >
            {saving ? <><Spinner size={13} C={C} /> Saving</> : "Save Changes"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────
// CANCEL MODAL
// ─────────────────────────────────────────────
function CancelModal({ reservation, onConfirm, onClose, loading, C, error }) {
  const eventDate = reservation?.eventDate || reservation?.event_date || "—";
  return (
    <ModalShell onClose={onClose} disabled={loading} C={C} maxWidth={420} zIndex={4000}>
      <div style={{ padding: "28px 24px 26px" }}>
        {/* Close */}
        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <CloseBtn onClick={onClose} disabled={loading} C={C} />
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: C.statusNote.rejected,
            border: `1px solid ${C.statusNoteBorder.rejected}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 9, letterSpacing: "0.18em", color: C.red, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
            Cancel Booking
          </div>
          <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.textPrimary, lineHeight: 1.2 }}>
            Are you sure?
          </div>
        </div>

        {/* Booking summary */}
        <div style={{
          padding: "14px 16px", borderRadius: 8, marginBottom: 16,
          background: C.goldFaint, border: `1px solid ${C.divider}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>
            {reservation?.name}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
            {reservation?.room || reservation?.venue} &middot; {eventDate}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: "0.10em", fontWeight: 600 }}>
            REF {reservation?.id}
          </div>
        </div>

        {/* Warning */}
        <div style={{
          padding: "11px 14px", borderRadius: 8, marginBottom: 20,
          background: C.statusNote.rejected, border: `1px solid ${C.statusNoteBorder.rejected}`,
          fontSize: 12, color: C.red, lineHeight: 1.65,
        }}>
          This action cannot be undone. Your reservation and allocated seat or table will be released immediately.
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 16,
            background: C.statusNote.rejected, border: `1px solid ${C.statusNoteBorder.rejected}`,
            fontSize: 12, color: C.red, lineHeight: 1.65,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose} disabled={loading}
            style={{
              flex: 1, padding: "11px", border: `1px solid ${C.cardBorder}`,
              borderRadius: 8, background: "transparent", color: C.textMuted,
              fontFamily: F.body, fontSize: 12, fontWeight: 500, letterSpacing: "0.04em",
              cursor: loading ? "not-allowed" : "pointer", transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.cardBorder; e.currentTarget.style.color = C.textMuted; }}
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm} disabled={loading}
            style={{
              flex: 1, padding: "11px", border: `1px solid ${loading ? "transparent" : C.red}`,
              borderRadius: 8, background: loading ? C.textMuted : "transparent",
              color: loading ? "#fff" : C.red,
              fontFamily: F.body, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
              cursor: loading ? "not-allowed" : "pointer", transition: "all 0.18s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = C.red; e.currentTarget.style.color = "#fff"; } }}
            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.red; } }}
          >
            {loading ? <><Spinner size={12} C={C} /> Cancelling</> : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────
// RESERVATION DETAIL MODAL
// ─────────────────────────────────────────────
function ReservationDetailModal({ reservation, onClose, onCancel, onEdit, C, isDark, fmtDate, fmtTime }) {
  const status     = (reservation.status || "").toLowerCase();
  const isPending  = status === "pending";
  const isApproved = status === "reserved" || status === "approved" || status === "confirmed";
  const isRejected = status === "rejected" || status === "cancelled" || status === "canceled";
  const statusKey  = isApproved ? "approved" : isRejected ? "rejected" : "pending";

  const canEdit   = isPending || isApproved;
  const canCancel = isPending || isApproved;

  return (
    <ModalShell onClose={onClose} C={C} zIndex={3500}>
      <ModalHeader
        title={reservation.name}
        onClose={onClose}
        C={C}
        meta={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: 10, color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", fontWeight: 600 }}>
              REF {reservation.id || reservation.reference_code || "—"}
            </span>
            <StatusBadge status={reservation.status} C={C} />
          </div>
        }
      />

      <div style={{ padding: "20px 24px 26px" }}>
        <DetailRow label="Venue"  value={reservation.room || reservation.venue} C={C} />
        <DetailRow label="Date"   value={fmtDate(reservation.eventDate || reservation.event_date)} C={C} />
        <DetailRow label="Time"   value={fmtTime(reservation.eventTime || reservation.event_time)} C={C} />
        <DetailRow label="Guests" value={reservation.guests ? `${reservation.guests} pax` : null}  C={C} />
        <DetailRow
          label="Seat / Table"
          value={
            reservation.type === "whole"
              ? `Table ${reservation.table || "—"} (${reservation.guests} seat${reservation.guests !== 1 ? "s" : ""})`
              : reservation.seat
                ? `Table ${reservation.table || "—"}, Seat ${reservation.seat}`
                : null
          }
          C={C}
        />
        <DetailRow
          label="Type"
          value={
            reservation.type === "whole" ? "Whole Table" :
            reservation.type === "seat"  ? "Individual Seat" :
            reservation.type || null
          }
          C={C}
        />
        <DetailRow label="Email"    value={reservation.email} C={C} />
        <DetailRow label="Phone"    value={reservation.phone || reservation.contact_number || reservation.mobile} C={C} />
        <DetailRow label="Requests" value={reservation.special_requests} C={C} />

        {/* Status note */}
        <div style={{
          marginTop: 16, padding: "11px 14px", borderRadius: 8,
          background: C.statusNote[statusKey],
          border: `1px solid ${C.statusNoteBorder[statusKey]}`,
          fontSize: 12, color: C.textMuted, lineHeight: 1.65,
        }}>
          {isPending  && <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>Pending review.</strong> You may edit your details or cancel this booking while awaiting approval.</>}
          {isApproved && <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>Confirmed.</strong> You may update personal details and special requests, or cancel your booking.</>}
          {isRejected && <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>Cancelled.</strong> This booking is no longer active.</>}
        </div>

        {(canEdit || canCancel) && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {canEdit && (
              <button
                onClick={() => onEdit(reservation)}
                style={{
                  flex: canCancel ? 1 : 2, padding: "11px",
                  background: "transparent", border: `1px solid ${C.gold}`,
                  borderRadius: 8, fontFamily: F.body, fontSize: 12, fontWeight: 600,
                  color: C.gold, cursor: "pointer", letterSpacing: "0.06em",
                  transition: "all 0.18s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.goldFaint; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Details
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(reservation)}
                style={{
                  flex: 1, padding: "11px",
                  background: "transparent", border: `1px solid ${C.red}`,
                  borderRadius: 8, fontFamily: F.body, fontSize: 12, fontWeight: 600,
                  color: C.red, cursor: "pointer", letterSpacing: "0.06em",
                  transition: "all 0.18s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.statusNote.rejected; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Cancel Booking
              </button>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────
// RESULTS MODAL
// ─────────────────────────────────────────────
function ResultsModal({ results, onClose, onSelectReservation, C, isDark, fmtDate, fmtTime }) {
  return (
    <ModalShell onClose={onClose} C={C} maxWidth={540} zIndex={3000}>
      <ModalHeader
        eyebrow="Reservations Found"
        title={`${results.length} Booking${results.length !== 1 ? "s" : ""} Located`}
        onClose={onClose}
        C={C}
      />

      <div style={{ padding: "16px 18px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
        {results.map((r, idx) => (
          <div
            key={r.id || idx}
            onClick={() => onSelectReservation(r)}
            style={{
              background: "transparent", borderRadius: 10,
              border: `1px solid ${C.cardBorder}`,
              padding: "14px 16px", cursor: "pointer", transition: "all 0.18s",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.cardBorderHover;
              e.currentTarget.style.background = C.goldFaint;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.cardBorder;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.name}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: "0.10em", fontWeight: 600, marginBottom: 4 }}>
                REF {r.id || r.reference_code || "—"}
              </div>
              <div style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>
                {r.room || r.venue || "—"} &middot; {fmtDate(r.eventDate || r.event_date)} &middot; {fmtTime(r.eventTime || r.event_time)}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <StatusBadge status={r.status} C={C} />
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke={C.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "14px 18px 20px", textAlign: "center" }}>
        <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, margin: 0 }}>
          Select a booking to view its details or make changes.
        </p>
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ManageBooking() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    try {
      const s = localStorage.getItem("bellevue-theme");
      if (s !== null) return s === "dark";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  const toggleTheme = () => setIsDark((p) => {
    const n = !p;
    try { localStorage.setItem("bellevue-theme", n ? "dark" : "light"); } catch {}
    return n;
  });

  const C = getTokens(isDark);

  const [lookup,              setLookup]              = useState("");
  const [results,             setResults]             = useState(null);
  const [searching,           setSearching]           = useState(false);
  const [error,               setError]               = useState("");
  const [cancelTarget,        setCancelTarget]        = useState(null);
  const [cancelling,          setCancelling]          = useState(false);
  const [cancelError,         setCancelError]         = useState("");
  const [editTarget,          setEditTarget]          = useState(null);
  const [toast,               setToast]               = useState(null);
  const [focused,             setFocused]             = useState(false);
  const [showResultsModal,    setShowResultsModal]    = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const savedReservationRef = useRef(null);

  const showToast = (msg, isSuccess = true) => {
    setToast({ msg, isSuccess });
    setTimeout(() => setToast(null), 4000);
  };

  const fmtTime = (t) => {
    if (!t) return null;
    const [h, m] = t.split(":");
    const hr = parseInt(h) || 0;
    const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    return `${hr12}:${m || "00"} ${hr < 12 ? "AM" : "PM"}`;
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    const p = new Date(d);
    return isNaN(p) ? d : p.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  };

  const tryFetch = async (url) => {
    try {
      const res  = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.status === 404) return { ok: false, status: 404 };
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { return { ok: false }; }
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  };

  const handleSearch = async () => {
    const trimmed = lookup.trim();
    if (!trimmed) { setError("Please enter your reference code."); return; }

    setError(""); setSearching(true);
    setResults(null); setShowResultsModal(false); setSelectedReservation(null);

    const finishWithMatched = (matched) => {
      setResults(matched);
      if (matched.length === 1)      { setSelectedReservation(matched[0]); }
      else if (matched.length > 1)   { setShowResultsModal(true); }
      else                           { setError("No reservations found. Please double-check your reference code."); }
    };

    try {
      const refSearch = await tryFetch(`${API_BASE}/reservations?reference_code=${encodeURIComponent(trimmed)}`);
      if (refSearch.ok) {
        const refList = extractList(refSearch.data);
        const exact = refList.filter(r =>
          r.reference_code === trimmed || r.id === trimmed || String(r.id) === trimmed
        );
        if (exact.length > 0)   { finishWithMatched(exact);   return; }
        if (refList.length > 0) { finishWithMatched(refList); return; }
      }

      if (/^\d+$/.test(trimmed)) {
        const idSearch = await tryFetch(`${API_BASE}/reservations/${trimmed}`);
        if (idSearch.ok && idSearch.data) {
          const single = idSearch.data?.data ?? idSearch.data;
          if (single && (single.id || single.name)) { finishWithMatched([single]); return; }
        }
      }

      setError("No reservations found. Please double-check your reference code.");
    } finally {
      setSearching(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelError(""); setCancelling(true);

    const numId = resolveNumericId(cancelTarget);

    try {
      if (!numId) throw new Error("Could not determine reservation ID. Please refresh and try again.");

      let res = await fetch(`${API_BASE}/reservations/${numId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ reason: "Cancelled by guest" }),
      });

      if (res.status === 404 || res.status === 405) {
        res = await fetch(`${API_BASE}/reservations/${numId}/cancel`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ reason: "Cancelled by guest" }),
        });
      }

      if (res.status === 404 || res.status === 405) {
        res = await fetch(`${API_BASE}/reservations/${numId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ status: "rejected", reason: "Cancelled by guest" }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.message || data?.error ||
          (data?.errors ? Object.values(data.errors).flat().join(", ") : null) ||
          `Server error (HTTP ${res.status})`
        );
      }

      const cancelled = { ...cancelTarget, status: "rejected" };
      setResults((prev) => prev?.map((r) => r.id === cancelTarget.id ? cancelled : r) ?? prev);
      setCancelTarget(null); setCancelling(false); setSelectedReservation(null);
      showToast("Your booking has been successfully cancelled.", true);

    } catch (e) {
      setCancelError(e.message || "Cancellation failed. Please try again or contact us directly.");
      setCancelling(false);
    }
  };

  const handleEditSaved = (updated) => {
    savedReservationRef.current = updated;
    setResults((prev) => prev?.map((r) => r.id === updated.id ? updated : r) ?? prev);
    setEditTarget(null);
    setSelectedReservation(updated);
    showToast("Your booking details have been updated successfully.", true);
  };

  const handleOpenEdit = (reservation) => {
    savedReservationRef.current = null;
    setSelectedReservation(null);
    setEditTarget(reservation);
  };

  const handleOpenCancel = (reservation) => {
    setCancelError(""); setSelectedReservation(null); setCancelTarget(reservation);
  };

  const handleEditClose = () => {
    const fallback = savedReservationRef.current ?? editTarget;
    savedReservationRef.current = null;
    setEditTarget(null);
    if (fallback) setSelectedReservation(fallback);
  };

  const handleCancelModalClose = () => {
    if (cancelling) return;
    const reservation = cancelTarget;
    setCancelTarget(null); setCancelError("");
    if (reservation) setSelectedReservation(reservation);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle: toggleTheme }}>
      <div style={{ minHeight: "100vh", fontFamily: F.body, position: "relative", overflow: "hidden" }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('/src/assets/bg-login.jpeg')",
            backgroundSize: "cover", backgroundPosition: "center",
            filter: "blur(4px) brightness(0.75)", transform: "scale(1.05)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: isDark
              ? "rgba(10,9,8,0.50)"
              : "rgba(243,239,230,0.35)",
          }} />
        </div>

        <ManageBookingNav />

        <div style={{
          position: "relative", zIndex: 1, minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "80px clamp(16px,5vw,48px) 48px",
        }}>

          {/* Back button */}
          <div style={{ position: "absolute", top: 76, left: "clamp(16px,4vw,52px)" }}>
            <button
              onClick={() => navigate("/")} title="Go back"
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.18s", padding: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="rgba(242,237,228,0.70)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(201,168,76,0.50)" }} />
              <span style={{ fontFamily: F.body, fontSize: 9, letterSpacing: "0.26em", color: "rgba(201,168,76,0.75)", fontWeight: 600, textTransform: "uppercase" }}>
                Manage Booking
              </span>
              <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(201,168,76,0.50)" }} />
            </div>
            <h1 style={{
              fontFamily: F.display, fontSize: "clamp(28px,5vw,44px)", fontWeight: 400,
              color: "#F2EDE4", lineHeight: 1.15, margin: "0 0 12px", letterSpacing: "0.01em",
            }}>
              Manage Your Reservation
            </h1>
            <p style={{ fontFamily: F.body, fontSize: 13, color: "rgba(242,237,228,0.55)", margin: 0, lineHeight: 1.7, maxWidth: 500 }}>
              Enter your reference code to locate, modify, or cancel your booking.
            </p>
          </div>

          {/* Search card */}
          <div style={{
            width: "100%", maxWidth: 460,
            background: isDark ? "rgba(10,9,8,0.82)" : "rgba(255,253,248,0.90)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            borderRadius: 16, border: `1px solid ${C.overlayCardBorder}`,
            padding: "26px 24px 24px",
            boxShadow: "0 16px 60px rgba(0,0,0,0.25)",
            transition: "background 0.30s",
          }}>
            <label style={{
              display: "block", fontFamily: F.body, fontSize: 9, letterSpacing: "0.20em",
              color: C.labelColor, fontWeight: 600, textTransform: "uppercase", marginBottom: 7,
            }}>
              Reference Code
            </label>

            <input
              value={lookup}
              onChange={(e) => { setLookup(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g., 2026-6355"
              autoComplete="off" spellCheck={false}
              style={{
                width: "100%", boxSizing: "border-box", padding: "13px 15px",
                border: `1px solid ${error ? C.red : focused ? C.inputFocus : C.inputBorder}`,
                borderRadius: 10,
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)",
                fontFamily: F.mono, fontSize: 18, fontWeight: 600, letterSpacing: "0.08em",
                color: C.textPrimary, outline: "none",
                transition: "border-color 0.18s",
                colorScheme: isDark ? "dark" : "light", marginBottom: 8,
              }}
            />

            {error && (
              <div style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 14,
                background: C.statusNote.rejected, border: `1px solid ${C.statusNoteBorder.rejected}`,
                fontSize: 12, color: C.red, lineHeight: 1.65,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSearch} disabled={searching}
              style={{
                width: "100%", padding: "13px",
                background: searching
                  ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")
                  : C.gold,
                border: "none", borderRadius: 10,
                fontFamily: F.body, fontSize: 11, fontWeight: 600,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: searching ? C.textMuted : "#FFFFFF",
                cursor: searching ? "not-allowed" : "pointer", transition: "all 0.18s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={(e) => {
                if (!searching) { e.currentTarget.style.background = C.goldLight; }
              }}
              onMouseLeave={(e) => {
                if (!searching) { e.currentTarget.style.background = C.gold; }
              }}
            >
              {searching
                ? <><Spinner size={13} C={C} /> Searching</>
                : <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Find My Booking
                </>
              }
            </button>

            <div style={{ textAlign: "center", paddingTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <div>
                <span style={{ fontFamily: F.body, fontSize: 12, color: C.textSubtle }}>
                  Need to make a booking?{" "}
                </span>
                <button
                  onClick={() => navigate("/venues")}
                  style={{
                    background: "none", border: "none", fontFamily: F.body, fontSize: 12,
                    fontWeight: 600, color: C.gold, cursor: "pointer", padding: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  View all venues
                </button>
              </div>
              <div>
                <span style={{ fontFamily: F.body, fontSize: 12, color: C.textSubtle }}>
                  Forgot your reference code?{" "}
                </span>
                <button
                  onClick={() => navigate("/forgotcode")}
                  style={{
                    background: "none", border: "none", fontFamily: F.body, fontSize: 12,
                    fontWeight: 600, color: C.red, cursor: "pointer", padding: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  Recover it here
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showResultsModal && results && results.length > 1 && (
          <ResultsModal
            results={results}
            onClose={() => setShowResultsModal(false)}
            onSelectReservation={(r) => { setShowResultsModal(false); setSelectedReservation(r); }}
            C={C} isDark={isDark} fmtDate={fmtDate} fmtTime={fmtTime}
          />
        )}

        {selectedReservation && !editTarget && (
          <ReservationDetailModal
            reservation={selectedReservation}
            onClose={() => setSelectedReservation(null)}
            onCancel={handleOpenCancel}
            onEdit={handleOpenEdit}
            C={C} isDark={isDark} fmtDate={fmtDate} fmtTime={fmtTime}
          />
        )}

        {editTarget && (
          <EditModal
            reservation={editTarget}
            onClose={handleEditClose}
            onSaved={handleEditSaved}
            C={C} isDark={isDark}
          />
        )}

        {cancelTarget && (
          <CancelModal
            reservation={cancelTarget}
            loading={cancelling}
            onConfirm={handleCancel}
            onClose={handleCancelModalClose}
            C={C}
            error={cancelError}
          />
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 28, left: "50%",
            transform: "translateX(-50%)",
            background: isDark ? "#111010" : "#FFFFFF",
            border: `1px solid ${toast.isSuccess ? C.statusNoteBorder.approved : C.statusNoteBorder.rejected}`,
            color: toast.isSuccess ? C.green : C.red,
            fontFamily: F.body, fontSize: 12, fontWeight: 600,
            padding: "12px 20px", borderRadius: 10,
            boxShadow: "0 8px 28px rgba(0,0,0,0.20)", zIndex: 9999,
            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 10,
            animation: "slideUp 0.28s cubic-bezier(0.16,1,0.3,1)",
            letterSpacing: "0.02em",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: toast.isSuccess ? C.green : C.red, flexShrink: 0,
            }} />
            {toast.msg}
          </div>
        )}

        <style>{`
          @keyframes slideUp  { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
          @keyframes spin     { to { transform: rotate(360deg); } }
          @keyframes modalIn  { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
}