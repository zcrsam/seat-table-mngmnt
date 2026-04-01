// src/features/booking/pages/ManageBooking.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bellevueLogo from "../../../assets/bellevue-logo.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function useThemeMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("bellevue-theme");
      if (saved !== null) return saved === "dark";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "bellevue-theme") setIsDark(e.newValue === "dark");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      try { localStorage.setItem("bellevue-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  };

  return { isDark, toggle };
}

function getTokens(isDark) {
  return isDark ? {
    gold: "#C9A84C", goldLight: "#E2C96A", goldFaint: "rgba(201,168,76,0.10)",
    pageBg: "#0E0D09", cardBg: "#1A1812", cardBorder: "rgba(201,168,76,0.16)",
    inputBg: "rgba(255,255,255,0.06)", inputBorder: "rgba(201,168,76,0.22)", inputFocus: "#C9A84C",
    textPrimary: "#F7F3EA", textMuted: "#8A8070",
    navBg: "rgba(14,13,9,0.94)", navBorder: "rgba(201,168,76,0.14)",
    heroBg1: "#0E0D09", heroBg2: "#1A1812", headerHint: "#C9A84C",
    labelColor: "rgba(201,168,76,0.72)", divider: "rgba(201,168,76,0.12)",
    red: "#E05252", green: "#0FBA81", toggleTrack: "rgba(201,168,76,0.06)",
    badgePending:  { bg: "rgba(244,158,12,0.15)",  color: "#F49E0C" },
    badgeApproved: { bg: "rgba(15,186,129,0.15)",  color: "#0FBA81" },
    badgeRejected: { bg: "rgba(224,82,82,0.15)",   color: "#E05252" },
    statusNote:       { pending: "rgba(244,158,12,0.08)",  approved: "rgba(15,186,129,0.08)",  rejected: "rgba(224,82,82,0.08)" },
    statusNoteBorder: { pending: "rgba(244,158,12,0.22)",  approved: "rgba(15,186,129,0.22)",  rejected: "rgba(224,82,82,0.22)" },
    detailLabel: "rgba(201,168,76,0.60)", detailValue: "#F7F3EA", detailBorder: "rgba(201,168,76,0.10)",
  } : {
    gold: "#9A7A2E", goldLight: "#C9A84C", goldFaint: "rgba(160,120,40,0.10)",
    pageBg: "#F5F0E8", cardBg: "#FFFFFF", cardBorder: "rgba(160,120,40,0.18)",
    inputBg: "#FAFAF7", inputBorder: "rgba(160,120,40,0.28)", inputFocus: "#9A7A2E",
    textPrimary: "#1A1612", textMuted: "#6A5A40",
    navBg: "rgba(245,240,232,0.96)", navBorder: "rgba(160,120,40,0.16)",
    heroBg1: "#1A1612", heroBg2: "#2A2018", headerHint: "#C9A84C",
    labelColor: "rgba(160,120,40,0.80)", divider: "rgba(160,120,40,0.14)",
    red: "#C0392B", green: "#0B9E6D", toggleTrack: "rgba(160,120,40,0.06)",
    badgePending:  { bg: "rgba(244,158,12,0.12)",  color: "#C87F00" },
    badgeApproved: { bg: "rgba(15,186,129,0.12)",  color: "#0B8A5F" },
    badgeRejected: { bg: "rgba(224,82,82,0.12)",   color: "#C0392B" },
    statusNote:       { pending: "rgba(244,158,12,0.06)",  approved: "rgba(15,186,129,0.06)",  rejected: "rgba(224,82,82,0.06)" },
    statusNoteBorder: { pending: "rgba(244,158,12,0.20)",  approved: "rgba(15,186,129,0.20)",  rejected: "rgba(224,82,82,0.20)" },
    detailLabel: "rgba(154,122,46,0.75)", detailValue: "#1A1612", detailBorder: "rgba(160,120,40,0.12)",
  };
}

const F = {
  display: "Georgia, 'Times New Roman', serif",
  body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
};

// Parse "DelaC23" → { surname: "DelaC", phone: "23" }
function parseLookup(raw) {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.+?)(\d{2})$/);
  if (!match) return null;
  return { surname: match[1], phone: match[2] };
}

function StatusBadge({ status, C }) {
  const cfg =
    status === "pending"  ? { ...C.badgePending,  label: "Pending"  } :
    status === "reserved" ? { ...C.badgeApproved, label: "Approved" } :
    status === "rejected" ? { ...C.badgeRejected, label: "Rejected" } :
    { bg: "rgba(130,130,130,0.12)", color: "#888", label: status ?? "Unknown" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: F.body, border: `1px solid ${cfg.color}30` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

function DetailRow({ label, value, C }) {
  if (!value || value === "—") return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 0", borderBottom: `1px solid ${C.detailBorder}` }}>
      <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.detailLabel, minWidth: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: F.body, fontSize: 13, color: C.detailValue, textAlign: "right", maxWidth: 240, lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

function StatusNote({ isPending, isApproved, C, statusKey }) {
  return (
    <div style={{ marginTop: 14, padding: "10px 13px", borderRadius: 8, background: C.statusNote[statusKey], border: `1px solid ${C.statusNoteBorder[statusKey]}`, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
      {isPending  && <><strong>Pending review.</strong> You may cancel while not yet approved.</>}
      {isApproved && <><strong>Confirmed.</strong> Please arrive on time. Cancellation unavailable for confirmed bookings.</>}
      {!isPending && !isApproved && <><strong>Cancelled or rejected.</strong></>}
    </div>
  );
}

function CancelModal({ reservation, onConfirm, onClose, loading, C }) {
  const eventDate = reservation?.eventDate || reservation?.event_date || "—";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.cardBg, borderRadius: 16, padding: "28px 24px", width: 380, maxWidth: "95vw", boxShadow: "0 32px 80px rgba(0,0,0,0.30)", border: `1px solid ${C.cardBorder}`, fontFamily: F.body }}>
        <div style={{ fontSize: 26, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 10, letterSpacing: "0.22em", color: C.gold, fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Cancel Booking</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary, marginBottom: 10, fontFamily: F.display }}>Are you sure?</div>
        <div style={{ background: C.goldFaint, border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "11px 13px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{reservation?.name}</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{reservation?.room || reservation?.venue} · {eventDate}</div>
          <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, marginTop: 4, letterSpacing: "0.08em", fontFamily: F.mono }}>REF: {reservation?.id}</div>
        </div>
        <p style={{ fontSize: 12, color: C.red, marginBottom: 18, lineHeight: 1.6, background: "rgba(224,82,82,0.06)", border: "1px solid rgba(224,82,82,0.18)", borderRadius: 8, padding: "9px 12px" }}>
          This action <strong>cannot be undone</strong>. Your seat/table will be released.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} disabled={loading}
            style={{ flex: 1, padding: "10px", border: `1.5px solid ${C.cardBorder}`, borderRadius: 8, background: "transparent", color: C.textMuted, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.cardBorder; e.currentTarget.style.color = C.textMuted; }}>
            Keep It
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: loading ? "#ccc" : C.red, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
            {loading ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeToggleBtn({ isDark, toggle, C }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={toggle}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px 5px 6px", borderRadius: 20, border: `1px solid ${hov ? C.gold : C.cardBorder}`, background: hov ? (isDark ? "rgba(201,168,76,0.12)" : "rgba(160,120,40,0.10)") : C.toggleTrack, cursor: "pointer", transition: "all 0.2s" }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: isDark ? "rgba(201,168,76,0.20)" : "rgba(255,180,30,0.25)", border: `1px solid ${C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
        {isDark ? "🌙" : "☀️"}
      </span>
      <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: hov ? C.gold : C.textMuted, transition: "color 0.2s" }}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function ManageBooking() {
  const navigate = useNavigate();
  const { isDark, toggle } = useThemeMode();
  const C = getTokens(isDark);

  const [lookup,       setLookup]       = useState("");
  const [results,      setResults]      = useState(null);
  const [searching,    setSearching]    = useState(false);
  const [error,        setError]        = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling,   setCancelling]   = useState(false);
  const [toast,        setToast]        = useState(null);
  const [focused,      setFocused]      = useState(false);

  const showToast = (msg, isSuccess = true) => {
    setToast({ msg, isSuccess });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSearch = async () => {
    const parsed = parseLookup(lookup);
    if (!parsed) {
      setError("Enter your surname + last 2 phone digits as one code. Example: DelaC23");
      return;
    }
    const { surname, phone } = parsed;
    setError("");
    setSearching(true);
    setResults(null);

    try {
      const res = await fetch(
        `${API_BASE}/reservations/search?surname=${encodeURIComponent(surname)}&phone_last2=${encodeURIComponent(phone)}`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setResults(list);
        if (list.length === 0) setError("No reservations found. Check your code and try again.");
      } else if (res.status === 422 || res.status === 404) {
        const errData = await res.json().catch(() => ({}));
        setError(errData?.message || "No reservations found.");
        setResults([]);
      } else {
        fallbackLocalSearch(surname, phone);
      }
    } catch {
      fallbackLocalSearch(surname, phone);
    } finally {
      setSearching(false);
    }
  };

  const fallbackLocalSearch = (surname, phone) => {
    try {
      const stored = JSON.parse(localStorage.getItem("bellevue_reservations") || "[]");
      const matched = stored.filter((r) => {
        const fullName = String(r.name || "").trim();
        const parts    = fullName.split(/\s+/);
        const lastName = parts[parts.length - 1] || "";
        const nameMatch =
          lastName.toLowerCase().includes(surname.toLowerCase()) ||
          fullName.toLowerCase().startsWith(surname.toLowerCase());
        const ph = String(r.phone || r.contact_number || r.mobile || "").replace(/\D/g, "");
        return nameMatch && ph.length >= 2 && ph.slice(-2) === phone;
      });
      setResults(matched);
      if (matched.length === 0) setError("No reservations found. Check your code and try again.");
    } catch {
      setError("Unable to search at this time. Please try again.");
      setResults([]);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    const numId = Number(cancelTarget.db_id ?? cancelTarget.numeric_id ?? cancelTarget.id);
    try {
      const res = await fetch(`${API_BASE}/reservations/${numId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      try {
        const stored  = JSON.parse(localStorage.getItem("bellevue_reservations") || "[]");
        const updated = stored.map((r) =>
          r.id === cancelTarget.id || String(r.db_id) === String(numId) ? { ...r, status: "rejected" } : r
        );
        localStorage.setItem("bellevue_reservations", JSON.stringify(updated));
      } catch {}
    }
    setResults((prev) => prev.map((r) => r.id === cancelTarget.id ? { ...r, status: "rejected" } : r));
    setCancelTarget(null);
    setCancelling(false);
    showToast("Booking cancelled successfully.");
  };

  const fmtTime = (t) => {
    if (!t) return "All day";
    const [h, m] = t.split(":");
    const hr = parseInt(h) || 0;
    const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    return `${hr12}:${m || "00"} ${hr < 12 ? "AM" : "PM"}`;
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    const p = new Date(d);
    if (isNaN(p)) return d;
    return p.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, fontFamily: F.body, transition: "background 0.3s" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: C.navBg, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.navBorder}`,
        padding: "0 clamp(20px,5vw,60px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 58, transition: "background 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
          <img src={bellevueLogo} alt="Bellevue" style={{ height: 28, width: "auto", filter: isDark ? "none" : "brightness(0) saturate(100%) invert(25%) sepia(40%) saturate(500%) hue-rotate(10deg)", transition: "filter 0.3s" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggleBtn isDark={isDark} toggle={toggle} C={C} />
          <div style={{ width: 1, height: 16, background: C.divider }} />
          <button onClick={() => navigate("/")}
            style={{ padding: "5px 13px", border: `1px solid ${C.cardBorder}`, background: "transparent", borderRadius: 6, fontFamily: F.body, fontSize: 11, fontWeight: 600, color: C.textMuted, cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.06em" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.cardBorder; e.currentTarget.style.color = C.textMuted; }}>
            ← Home
          </button>
        </div>
      </nav>

      {/* ── Compact hero ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.heroBg1} 0%, ${C.heroBg2} 100%)`,
        padding: "28px clamp(20px,5vw,60px) 30px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 130%, rgba(201,168,76,0.07), transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ display: "inline-block", width: 18, height: 1, background: C.headerHint }} />
            <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: C.headerHint }}>Reservation Lookup</span>
            <span style={{ display: "inline-block", width: 18, height: 1, background: C.headerHint }} />
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(20px,3vw,30px)", fontWeight: 600, color: "#F7F3EA", lineHeight: 1.2, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
            Manage Your Booking
          </h1>
          <p style={{ fontFamily: F.body, fontSize: 12, color: "rgba(247,243,234,0.42)", margin: 0 }}>
            Enter your lookup code to access your reservation.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px clamp(16px,4vw,24px) 56px" }}>

        {/* Search card */}
        <div style={{
          background: C.cardBg, borderRadius: 14,
          boxShadow: isDark ? "0 8px 36px rgba(0,0,0,0.32)" : "0 4px 20px rgba(0,0,0,0.06)",
          border: `1px solid ${C.cardBorder}`, padding: "24px 20px",
          transition: "background 0.3s",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.20em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>
            Lookup Code
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Your <strong style={{ color: C.textPrimary }}>surname</strong> + <strong style={{ color: C.textPrimary }}>last 2 digits</strong> of your registered phone number combined.
          </div>

          {/* Single input */}
          <input
            value={lookup}
            onChange={(e) => { setLookup(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g.  DelaC23"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "12px 16px",
              border: `1.5px solid ${focused ? C.inputFocus : C.inputBorder}`,
              borderRadius: 10, background: C.inputBg,
              fontFamily: F.mono, fontSize: 20, fontWeight: 700,
              letterSpacing: "0.06em", color: C.textPrimary,
              outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
              boxShadow: focused ? `0 0 0 3px ${C.gold}18` : "none",
              colorScheme: isDark ? "dark" : "light",
              marginBottom: 8,
            }}
          />

          {/* Inline format hint */}
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
            Example: surname is <strong style={{ color: C.gold, fontFamily: F.mono }}>DelaC</strong>, phone ends in <strong style={{ color: C.gold, fontFamily: F.mono }}>23</strong> → enter <strong style={{ color: C.gold, fontFamily: F.mono }}>DelaC23</strong>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 7, background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.22)", borderRadius: 8, padding: "9px 12px", marginBottom: 12, fontSize: 12, color: C.red, lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleSearch}
            disabled={searching}
            style={{
              width: "100%", padding: "12px",
              background: searching ? (isDark ? "#2A2018" : "#D4C9B0") : C.gold,
              border: "none", borderRadius: 10,
              fontFamily: F.body, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: searching ? C.textMuted : (isDark ? "#0E0D09" : "#FFFFFF"),
              cursor: searching ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => { if (!searching) e.currentTarget.style.background = C.goldLight; }}
            onMouseLeave={(e) => { if (!searching) e.currentTarget.style.background = C.gold; }}
          >
            {searching ? (
              <>
                <span style={{ display: "inline-block", width: 13, height: 13, border: `2px solid ${C.textMuted}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Searching…
              </>
            ) : "Find My Booking"}
          </button>
        </div>

        {/* ── Results ── */}
        {results !== null && results.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: C.divider }} />
              <span style={{ fontFamily: F.body, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textMuted }}>
                {results.length} Reservation{results.length !== 1 ? "s" : ""} Found
              </span>
              <div style={{ flex: 1, height: 1, background: C.divider }} />
            </div>

            {results.map((r, idx) => {
              const isPending  = r.status === "pending";
              const isApproved = r.status === "reserved";
              const isRejected = r.status === "rejected";
              const statusKey  = isApproved ? "approved" : isRejected ? "rejected" : "pending";

              return (
                <div key={r.id || idx} style={{
                  background: C.cardBg, borderRadius: 12,
                  border: `1px solid ${C.cardBorder}`,
                  boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.06)",
                  overflow: "hidden", marginBottom: 14,
                }}>
                  {/* Header */}
                  <div style={{
                    background: `linear-gradient(100deg, ${C.heroBg1} 0%, ${C.heroBg2} 100%)`,
                    padding: "14px 18px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                  }}>
                    <div>
                      <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: "#F7F3EA", marginBottom: 2 }}>{r.name}</div>
                      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: "0.12em", fontWeight: 700 }}>
                        REF #{r.id || r.reference_code || "—"}
                      </div>
                    </div>
                    <StatusBadge status={r.status} C={C} />
                  </div>

                  {/* Body */}
                  <div style={{ padding: "14px 18px" }}>
                    <DetailRow label="Venue"        value={r.room || r.venue} C={C} />
                    <DetailRow label="Date"         value={fmtDate(r.eventDate || r.event_date)} C={C} />
                    <DetailRow label="Time"         value={fmtTime(r.eventTime || r.event_time)} C={C} />
                    <DetailRow label="Guests"       value={r.guests ? `${r.guests} pax` : undefined} C={C} />
                    <DetailRow label="Seat / Table" value={
                      r.type === "whole"
                        ? `Table ${r.table || "—"} (${r.guests} seat${r.guests !== 1 ? "s" : ""})`
                        : r.seat ? `Table ${r.table || "—"}, Seat ${r.seat}` : undefined
                    } C={C} />
                    <DetailRow label="Type"  value={r.type === "whole" ? "Whole Table" : "Individual Seat"} C={C} />
                    <DetailRow label="Email" value={r.email} C={C} />

                    <StatusNote isPending={isPending} isApproved={isApproved} C={C} statusKey={statusKey} />

                    {isPending && (
                      <button
                        onClick={() => setCancelTarget(r)}
                        style={{
                          marginTop: 10, width: "100%", padding: "9px",
                          background: "transparent", border: `1.5px solid ${C.red}`,
                          borderRadius: 8, fontFamily: F.body, fontSize: 12,
                          fontWeight: 700, color: C.red, cursor: "pointer",
                          letterSpacing: "0.06em", transition: "all 0.2s",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.red; }}
                      >
                        🗑 Cancel This Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {results !== null && results.length === 0 && !error && (
          <div style={{ marginTop: 20, textAlign: "center", padding: "32px 20px", background: C.cardBg, borderRadius: 12, border: `1px solid ${C.cardBorder}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <div style={{ fontFamily: F.display, fontSize: 16, color: C.textPrimary, marginBottom: 4 }}>No Results Found</div>
            <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, maxWidth: 260, margin: "0 auto", lineHeight: 1.6 }}>
              We couldn't find a reservation for that code. Please double-check and try again.
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", paddingTop: 24 }}>
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>Need to book? </span>
          <button onClick={() => navigate("/venues")}
            style={{ background: "none", border: "none", fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.gold, cursor: "pointer", padding: 0, letterSpacing: "0.04em", textDecoration: "underline", textUnderlineOffset: 3 }}>
            View All Venues →
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal reservation={cancelTarget} loading={cancelling} onConfirm={handleCancel} onClose={() => setCancelTarget(null)} C={C} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)",
          background: toast.isSuccess ? C.green : C.red, color: "#fff",
          fontFamily: F.body, fontSize: 13, fontWeight: 700,
          padding: "11px 20px", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.20)",
          zIndex: 9999, animation: "slideUp 0.3s ease", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {toast.isSuccess ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}