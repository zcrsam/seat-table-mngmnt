// src/features/booking/pages/ForgotCode.jsx
import { useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import bellevueLogo from "../../../assets/bellevue-logo.png";
import SharedNavbar from "../../../components/SharedNavbar.jsx";

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
<<<<<<< Updated upstream
        badgePending:  { bg: "rgba(196,163,90,0.10)",  color: "#C4A35A",  dot: "#C4A35A"  },
        badgeApproved: { bg: "rgba(74,158,126,0.10)",  color: "#4A9E7E",  dot: "#4A9E7E"  },
        badgeRejected: { bg: "rgba(184,92,92,0.10)",   color: "#B85C5C",  dot: "#B85C5C"  },
=======
        badgePending:  { bg: "rgba(196,163,90,0.10)",  color: "#C4A35A",  dot: "#C4A35A"   },
        badgeApproved: { bg: "rgba(74,158,126,0.10)",  color: "#4A9E7E",  dot: "#4A9E7E"   },
        badgeRejected: { bg: "rgba(184,92,92,0.10)",   color: "#B85C5C",  dot: "#B85C5C"   },
>>>>>>> Stashed changes
        navBg: "rgba(10,9,8,0.95)",
        navBorder: "rgba(196,163,90,0.12)",
        divider: "rgba(255,255,255,0.05)",
        inputFocusShadow: "0 0 0 3px rgba(196,163,90,0.12)",
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
<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
      };
}

const F = {
  display: "'Inter', 'Helvetica Neue', Arial, sans-serif",
<<<<<<< Updated upstream
  body:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
  label:   "'Inter', 'Helvetica Neue', Arial, sans-serif",
=======
  body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  label: "'Inter', 'Helvetica Neue', Arial, sans-serif",
>>>>>>> Stashed changes
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8000/api";

<<<<<<< Updated upstream
// ─── Parsing helpers ──────────────────────────────────────────────────────────
=======
>>>>>>> Stashed changes
function parseLookup(raw) {
  const t = raw.trim();
  if (!t) return null;
  const m = t.match(/^(.+?)(\d{2})$/);
  if (m && m[1].length > 0) return { surname: m[1], phone: m[2] };
  return null;
}

function extractList(data) {
  if (!data) return [];
  if (Array.isArray(data))              return data;
  if (Array.isArray(data.data))         return data.data;
  if (Array.isArray(data.reservations)) return data.reservations;
  if (Array.isArray(data.results))      return data.results;
  if (data.id || data.name)             return [data];
  return [];
}

function clientFilter(list, surname, phone) {
  const sLow = surname.toLowerCase();
<<<<<<< Updated upstream
  return list
    .filter((r) => {
      const fullName = (r.name || r.full_name || r.fullName || "").trim();
      const parts    = fullName.split(/\s+/);
      const lastWord = parts[parts.length - 1]?.toLowerCase() || "";
      const nameMatch =
        lastWord === sLow ||
        parts.some((p) => p.toLowerCase().startsWith(sLow)) ||
        fullName.toLowerCase().includes(sLow);
      const ph = String(
        r.phone || r.contact_number || r.mobile || r.phone_number || ""
      ).replace(/\D/g, "");
      const phoneMatch = ph.length >= 2 && ph.slice(-2) === phone;
      return nameMatch && phoneMatch;
    })
    .sort((a, b) => {
      const aName  = (a.name || a.full_name || a.fullName || "").trim();
      const bName  = (b.name || b.full_name || b.fullName || "").trim();
      const aParts = aName.split(/\s+/);
      const bParts = bName.split(/\s+/);
      const aLast  = aParts[aParts.length - 1]?.toLowerCase() || "";
      const bLast  = bParts[bParts.length - 1]?.toLowerCase() || "";
      const aExact = aLast === sLow;
      const bExact = bLast === sLow;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });
=======
  return list.filter((r) => {
    const fullName = (r.name || r.full_name || r.fullName || "").trim();
    const parts = fullName.split(/\s+/);
    const lastWord = parts[parts.length - 1]?.toLowerCase() || "";
    const exactSurnameMatch = lastWord === sLow;
    const nameMatch = exactSurnameMatch ||
    const nameMatch = exactSurnameMatch ||
      parts.some((p) => p.toLowerCase().startsWith(sLow)) ||
      fullName.toLowerCase().includes(sLow);
    const ph = String(r.phone || r.contact_number || r.mobile || r.phone_number || "").replace(/\D/g, "");
    const ph = String(r.phone || r.contact_number || r.mobile || r.phone_number || "").replace(/\D/g, "");
    const phoneMatch = ph.length >= 2 && ph.slice(-2) === phone;
    return nameMatch && phoneMatch;
  }).sort((a, b) => {
    const aName = (a.name || a.full_name || a.fullName || "").trim();
    const bName = (b.name || b.full_name || b.fullName || "").trim();
    const aParts = aName.split(/\s+/);
    const bParts = bName.split(/\s+/);
    const aLast = aParts[aParts.length - 1]?.toLowerCase() || "";
    const bLast = bParts[bParts.length - 1]?.toLowerCase() || "";
    const aExact = aLast === sLow;
    const bExact = bLast === sLow;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });
>>>>>>> Stashed changes
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, C }) {
  const s = (status || "").toLowerCase();
  const cfg =
<<<<<<< Updated upstream
    s === "pending"  ? { ...C.badgePending,  label: "Pending"   } :
    s === "reserved" ? { ...C.badgeApproved, label: "Confirmed" } :
    s === "approved" ? { ...C.badgeApproved, label: "Confirmed" } :
    s === "rejected" ? { ...C.badgeRejected, label: "Cancelled" } :
    s === "cancelled"? { ...C.badgeRejected, label: "Cancelled" } :
    { bg: "rgba(130,130,130,0.10)", color: "#888", dot: "#888", label: status ?? "Unknown" };

=======
    status === "pending"  ? { ...C.badgePending,  label: "Pending"   } :
    status === "reserved" ? { ...C.badgeApproved, label: "Confirmed" } :
    status === "rejected" ? { ...C.badgeRejected, label: "Cancelled" } :
    { bg: "rgba(130,130,130,0.10)", color: "#888", label: status ?? "Unknown" };
>>>>>>> Stashed changes
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      padding: "4px 10px 4px 8px", borderRadius: 4,
      fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", fontFamily: F.label,
      border: `1px solid ${cfg.color}24`,
<<<<<<< Updated upstream
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 4, height: 4, borderRadius: "50%",
        background: cfg.color, display: "inline-block", flexShrink: 0,
      }} />
=======
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
>>>>>>> Stashed changes
      {cfg.label}
    </span>
  );
}

// ─── Theme toggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  const C = getTokens(isDark);
  const C = getTokens(isDark);
  return (
<<<<<<< Updated upstream
    <button
      type="button"
      onClick={toggle}
=======
    <button type="button" onClick={toggle}
>>>>>>> Stashed changes
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 12px 6px 8px",
        background: "transparent",
        border: `1px solid ${C.borderDefault}`,
        borderRadius: 20,
        cursor: "pointer", flexShrink: 0,
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
      <span style={{
<<<<<<< Updated upstream
        fontFamily: F.label, fontSize: 11, fontWeight: 500,
        letterSpacing: "0.03em", color: C.textSecondary,
=======
        fontFamily: F.label, fontSize: 11, fontWeight: 500, letterSpacing: "0.03em",
        color: C.textSecondary,
>>>>>>> Stashed changes
      }}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}

<<<<<<< Updated upstream
// ─── Main component ───────────────────────────────────────────────────────────
=======
function NavBar() {
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
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000,
      height: 64, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 clamp(20px,5vw,64px)",
      background: C.navBg, backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderBottom: `1px solid ${C.navBorder}`,
      boxSizing: "border-box", transition: "background 0.30s",
    }}>
      <img src={bellevueLogo} alt="The Bellevue Manila" onClick={() => navigate("/")}
        style={{
          height: 26, width: "auto", cursor: "pointer", display: "block", flexShrink: 0,
          filter: isDark
            ? "brightness(0) saturate(100%) invert(82%) sepia(18%) saturate(400%) hue-rotate(0deg) brightness(96%)"
            : "brightness(0) saturate(100%)",
          transition: "filter 0.30s",
        }} />
        style={{
          height: 26, width: "auto", cursor: "pointer", display: "block", flexShrink: 0,
          filter: isDark
            ? "brightness(0) saturate(100%) invert(82%) sepia(18%) saturate(400%) hue-rotate(0deg) brightness(96%)"
            : "brightness(0) saturate(100%)",
          transition: "filter 0.30s",
        }} />
      <ThemeToggle />
    </nav>
  );
}

>>>>>>> Stashed changes
export default function ForgotCode() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    try {
      const s = localStorage.getItem("bellevue-theme");
      if (s !== null) return s === "dark";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  const toggleTheme = () =>
    setIsDark((p) => {
      const n = !p;
      try { localStorage.setItem("bellevue-theme", n ? "dark" : "light"); } catch {}
      return n;
    });

  const C = getTokens(isDark);

  const [combination, setCombination] = useState("");
  const [searching,   setSearching]   = useState(false);
  const [error,       setError]       = useState("");
  const [results,     setResults]     = useState(null);
  const [focused,     setFocused]     = useState(false);

  // ── Date / time formatters ──────────────────────────────────────────────────
  // Parse without UTC shift: "2025-04-20" → local midnight, not UTC midnight
  const fmtDate = (d) => {
    if (!d) return "—";
    const dateStr = String(d).split("T")[0]; // strip any time portion
    const parts   = dateStr.split("-");
    if (parts.length !== 3) return d;
    const [year, month, day] = parts.map(Number);
    if (!year || !month || !day) return d;
    return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const fmtTime = (t) => {
    if (!t) return "—";
    const [h, m] = String(t).split(":");
    const hr  = parseInt(h, 10) || 0;
    const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    return `${hr12}:${m || "00"} ${hr < 12 ? "AM" : "PM"}`;
  };

  // ── Search handler ──────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const trimmed = combination.trim();
<<<<<<< Updated upstream
    if (!trimmed) {
      setError("Please enter your combination code.");
      return;
    }
    const parsed = parseLookup(trimmed);
    if (!parsed) {
      setError("Enter your surname + last 2 phone digits. Example: abane35");
      return;
    }

    const { surname, phone } = parsed;
    setError("");
    setSearching(true);
    setResults(null);

=======
    if (!trimmed) { setError("Please enter your combination code."); return; }
    const parsed = parseLookup(trimmed);
    if (!parsed) { setError("Enter your surname + last 2 phone digits. Example: abane35"); return; }
    const { surname, phone } = parsed;
    setError(""); setSearching(true); setResults(null);
>>>>>>> Stashed changes
    const tryFetch = async (url) => {
      try {
        const res  = await fetch(url, { headers: { Accept: "application/json" } });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { return { ok: false }; }
        return { ok: res.ok, status: res.status, data };
      } catch {
        return { ok: false };
      }
    };
    try {
      const s1 = await tryFetch(`${API_BASE}/reservations?per_page=500&page=1`);
      if (s1.data) {
        const matched = clientFilter(extractList(s1.data), surname, phone);
<<<<<<< Updated upstream
        if (matched.length > 0) {
          // Dev helper — remove in production
          console.log("[ForgotCode] matched reservation object:", matched[0]);
          setResults([matched[0]]);
          return;
        }
=======
        if (matched.length > 0) { setResults([matched[0]]); return; }
>>>>>>> Stashed changes
      }

      const s2 = await tryFetch(`${API_BASE}/reservations`);
      if (s2.data) {
        const matched = clientFilter(extractList(s2.data), surname, phone);
<<<<<<< Updated upstream
        if (matched.length > 0) {
          console.log("[ForgotCode] matched reservation object:", matched[0]);
          setResults([matched[0]]);
          return;
        }
=======
        if (matched.length > 0) { setResults([matched[0]]); return; }
>>>>>>> Stashed changes
      }

      setError("No reservations found. Please double-check your surname and phone number.");
    } finally {
      setSearching(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ThemeContext.Provider value={{ isDark, toggle: toggleTheme }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        minHeight: "100vh", fontFamily: F.body,
        background: C.pageBg,
        position: "relative",
        transition: "background 0.30s",
      }}>
<<<<<<< Updated upstream
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        minHeight: "100vh", fontFamily: F.body,
        background: C.pageBg,
        position: "relative",
        transition: "background 0.30s",
      }}>

        {/* Background image */}
        {/* Background image */}
=======

        {/* Background image */}
>>>>>>> Stashed changes
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('/src/assets/bg-login.jpeg')",
            backgroundSize: "cover", backgroundPosition: "center",
            filter: isDark
              ? "blur(6px) brightness(0.35)"
              : "blur(6px) brightness(0.45) saturate(0.4)",
            transform: "scale(1.05)",
            transition: "filter 0.40s",
          }} />
          <div style={{
            position: "absolute", inset: 0,
<<<<<<< Updated upstream
            background: isDark ? "rgba(12,11,10,0.75)" : "rgba(237,233,224,0.65)",
=======
            background: isDark
              ? "rgba(12,11,10,0.75)"
              : "rgba(237,233,224,0.65)",
>>>>>>> Stashed changes
            transition: "background 0.40s",
          }} />
        </div>

        {/* Navbar */}
        <SharedNavbar
          isDark={isDark}
          toggle={toggleTheme}
          showNavigation={false}
          scrolled={false}
          height={64}
        />

<<<<<<< Updated upstream
        {/* Page body */}
=======
>>>>>>> Stashed changes
        <div style={{
          position: "relative", zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          paddingTop: 64,
        }}>
<<<<<<< Updated upstream
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(40px,6vh,80px) clamp(20px,6vw,80px)",
            minHeight: "calc(100vh - 64px)",
          }}>

            {/* Back button */}
            <div style={{ position: "absolute", top: 80, left: "clamp(16px,4vw,40px)" }}>
              <button
                onClick={() => navigate("/manage-booking")}
                title="Go back"
=======

          {/* Main content */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(40px,6vh,80px) clamp(20px,6vw,80px)",
            minHeight: "calc(100vh - 64px)",
          }}>

            {/* Back button */}
            <div style={{ position: "absolute", top: 80, left: "clamp(16px,4vw,40px)" }}>
              <button onClick={() => navigate("/manage-booking")} title="Go back"
>>>>>>> Stashed changes
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "transparent",
                  border: `1px solid ${C.borderDefault}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.18s", padding: 0,
                }}
<<<<<<< Updated upstream
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.borderAccent;
                  e.currentTarget.style.background  = C.goldFaint;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.borderDefault;
                  e.currentTarget.style.background  = "transparent";
                }}
              >
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
=======
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.background = C.goldFaint; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.background = "transparent"; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
>>>>>>> Stashed changes
                </svg>
              </button>
            </div>

<<<<<<< Updated upstream
            {/* ── Card ── */}
            <div style={{ width: "100%", maxWidth: 420 }}>

              {/* Header — hidden once results appear */}
=======
            <div style={{ width: "100%", maxWidth: 420 }}>

              {/* Header — only shown when no results */}
>>>>>>> Stashed changes
              {!results && (
                <div style={{ marginBottom: 40, animation: "fadeUp 0.32s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ display: "inline-block", width: 24, height: "1px", background: C.gold, opacity: 0.6 }} />
                    <span style={{
                      fontFamily: F.label, fontSize: 9, letterSpacing: "0.26em",
                      color: C.gold, fontWeight: 700, textTransform: "uppercase",
                    }}>
                      Guest Services
                    </span>
                  </div>
                  <h1 style={{
                    fontFamily: F.display, fontSize: "clamp(30px,5vw,44px)", fontWeight: 400,
<<<<<<< Updated upstream
                    color: C.textPrimary, lineHeight: 1.12, margin: "0 0 12px",
                    letterSpacing: "0.01em",
=======
                    color: C.textPrimary, lineHeight: 1.12, margin: "0 0 12px", letterSpacing: "0.01em",
>>>>>>> Stashed changes
                  }}>
                    Recover Your<br />Reference Code
                  </h1>
                  <p style={{
                    fontFamily: F.body, fontSize: 13.5, color: C.textSecondary,
<<<<<<< Updated upstream
                    margin: "0 0 -20px", lineHeight: 1.70,
=======
                    margin: 0, lineHeight: 1.70,
>>>>>>> Stashed changes
                  }}>
                    Enter your combination code to locate your booking reference.
                  </p>
                </div>
              )}

<<<<<<< Updated upstream
              {/* ── Search form ── */}
              {!results && (
                <div style={{ animation: "fadeUp 0.36s ease" }}>

                  {/* How-it-works hint */}
=======
              {/* Search form */}
              {!results && (
                <div style={{ animation: "fadeUp 0.36s ease" }}>
                  {/* How it works */}
>>>>>>> Stashed changes
                  <div style={{
                    padding: "12px 14px", borderRadius: 8, marginBottom: 20,
                    background: C.goldFaint, border: `1px solid ${C.borderAccent}`,
                    display: "flex", gap: 12, alignItems: "flex-start",
                  }}>
                    <div style={{
<<<<<<< Updated upstream
                      width: 28, height: 28, borderRadius: 6,
                      background: C.goldFaintest, border: `1px solid ${C.borderAccent}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke={C.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8"  x2="12"   y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <div>
                      <div style={{
                        fontFamily: F.label, fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.10em", textTransform: "uppercase",
                        color: C.gold, marginBottom: 3,
                      }}>
                        How it works
                      </div>
                      <div style={{
                        fontFamily: F.body, fontSize: 12,
                        color: C.textSecondary, lineHeight: 1.65,
                      }}>
                        Combine your surname with the last 2 digits of your phone number.<br />
                        <span style={{ color: C.textPrimary, fontWeight: 500 }}>
                          Example: "abane35"
                        </span>
=======
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
                        Combine your surname with the last 2 digits of your phone number.<br />
                        <span style={{ color: C.textPrimary, fontWeight: 500 }}>Example: "abane35"</span>
>>>>>>> Stashed changes
                      </div>
                    </div>
                  </div>

<<<<<<< Updated upstream
                  {/* Input */}
=======
>>>>>>> Stashed changes
                  <div style={{ marginBottom: 14 }}>
                    <label style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em",
                      color: focused ? C.gold : C.textSecondary,
                      fontWeight: 700, textTransform: "uppercase", marginBottom: 8,
                      transition: "color 0.18s",
                    }}>
<<<<<<< Updated upstream
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Combination Code{" "}
                      <span style={{ color: C.red, marginLeft: 2 }}>*</span>
=======
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      Combination Code <span style={{ color: C.red, marginLeft: 2 }}>*</span>
>>>>>>> Stashed changes
                    </label>
                    <input
                      value={combination}
                      onChange={(e) => { setCombination(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="e.g. abane35"
                      autoComplete="off"
                      style={{
<<<<<<< Updated upstream
                        width: "100%", boxSizing: "border-box",
                        padding: "14px 18px",
                        border: `1.5px solid ${focused ? C.borderAccent : C.borderDefault}`,
                        borderRadius: 10,
                        background: C.surfaceInput,
                        fontFamily: F.mono, fontSize: 17, fontWeight: 500,
                        letterSpacing: "0.06em", color: C.textPrimary,
                        outline: "none",
=======
                        width: "100%", boxSizing: "border-box", padding: "14px 18px",
                        border: `1.5px solid ${focused ? C.borderAccent : C.borderDefault}`,
                        borderRadius: 10,
                        background: C.surfaceInput,
                        fontFamily: F.mono, fontSize: 17, fontWeight: 500, letterSpacing: "0.06em",
                        color: C.textPrimary, outline: "none",
>>>>>>> Stashed changes
                        transition: "border-color 0.18s, box-shadow 0.18s",
                        boxShadow: focused ? C.inputFocusShadow : "none",
                        colorScheme: isDark ? "dark" : "light",
                      }}
                    />
                  </div>

<<<<<<< Updated upstream
                  {/* Error */}
=======
>>>>>>> Stashed changes
                  {error && (
                    <div style={{
                      padding: "10px 14px", borderRadius: 8, marginBottom: 14,
                      background: C.redFaint, borderLeft: `3px solid ${C.red}`,
                      fontSize: 12.5, color: C.red, lineHeight: 1.60,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
<<<<<<< Updated upstream
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8"  x2="12"    y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
=======
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
>>>>>>> Stashed changes
                      </svg>
                      {error}
                    </div>
                  )}

<<<<<<< Updated upstream
                  {/* Submit */}
                  <button
                    onClick={handleSearch}
                    disabled={searching}
=======
                  <button
                    onClick={handleSearch} disabled={searching}
>>>>>>> Stashed changes
                    style={{
                      width: "100%", padding: "14px",
                      background: searching
                        ? (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)")
                        : C.gold,
                      border: `1px solid ${searching ? C.borderDefault : "transparent"}`,
                      borderRadius: 10,
                      fontFamily: F.label, fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: searching ? C.textSecondary : C.textOnAccent,
<<<<<<< Updated upstream
                      cursor: searching ? "not-allowed" : "pointer",
                      transition: "all 0.20s",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 10,
=======
                      cursor: searching ? "not-allowed" : "pointer", transition: "all 0.20s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
>>>>>>> Stashed changes
                      marginBottom: 0,
                    }}
                    onMouseEnter={(e) => { if (!searching) e.currentTarget.style.background = C.goldLight; }}
                    onMouseLeave={(e) => { if (!searching) e.currentTarget.style.background = C.gold; }}
                  >
<<<<<<< Updated upstream
                    {searching ? (
                      <>
                        <span style={{
                          display: "inline-block", width: 13, height: 13,
                          border: `1.5px solid ${C.textSecondary}40`,
                          borderTopColor: C.textSecondary,
                          borderRadius: "50%",
                          animation: "spin 0.65s linear infinite",
                        }} />
                        Searching…
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Find My Code
                      </>
                    )}
                  </button>

                  {/* Footer link */}
                  <div style={{
                    marginTop: 24, paddingTop: 22,
                    borderTop: `1px solid ${C.divider}`,
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
=======
                    {searching
                      ? <>
                          <span style={{ display: "inline-block", width: 13, height: 13, border: `1.5px solid ${C.textSecondary}40`, borderTopColor: C.textSecondary, borderRadius: "50%", animation: "spin 0.65s linear infinite" }} />
                          Searching…
                        </>
                      : <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          Find My Code
                        </>
                    }
                  </button>

                  <div style={{
                    marginTop: 24, paddingTop: 22,
                    borderTop: `1px solid ${C.divider}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
>>>>>>> Stashed changes
                  }}>
                    <span style={{ fontFamily: F.body, fontSize: 12.5, color: C.textSecondary }}>
                      Remember your code?
                    </span>
<<<<<<< Updated upstream
                    <button
                      onClick={() => navigate("/manage-booking")}
                      style={{
                        background: "none", border: "none",
                        fontFamily: F.label, fontSize: 11, fontWeight: 700,
                        letterSpacing: "0.08em", textTransform: "uppercase",
=======
                    <button onClick={() => navigate("/manage-booking")}
                      style={{
                        background: "none", border: "none", fontFamily: F.label, fontSize: 11,
                        fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
>>>>>>> Stashed changes
                        color: C.gold, cursor: "pointer", padding: 0,
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      Manage Booking
<<<<<<< Updated upstream
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
=======
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
>>>>>>> Stashed changes
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

<<<<<<< Updated upstream
              {/* ── Results ── */}
=======
              {/* Results */}
>>>>>>> Stashed changes
              {results && (
                <div style={{ animation: "fadeUp 0.28s ease" }}>

                  {/* Result header */}
                  <div style={{ marginBottom: 28 }}>
<<<<<<< Updated upstream
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
=======
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
>>>>>>> Stashed changes
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
<<<<<<< Updated upstream
                        flexShrink: 0,
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke={C.green} strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round">
=======
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
>>>>>>> Stashed changes
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{
<<<<<<< Updated upstream
                        fontFamily: F.label, fontSize: 20, letterSpacing: "0.01em",
                        color: C.green, fontWeight: 700,
=======
                        fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em",
                        color: C.green, fontWeight: 700, textTransform: "uppercase",
>>>>>>> Stashed changes
                      }}>
                        Booking Located
                      </span>
                    </div>
<<<<<<< Updated upstream
=======
                    <h2 style={{
                      fontFamily: F.display, fontSize: "clamp(24px,4vw,34px)", fontWeight: 400,
                      color: C.textPrimary, lineHeight: 1.15, margin: "0 0 6px",
                    }}>
                      Here is Your Code
                    </h2>
>>>>>>> Stashed changes
                    <p style={{ fontFamily: F.body, fontSize: 12.5, color: C.textSecondary, margin: 0 }}>
                      {results.length === 1
                        ? "Found 1 reservation matching your details."
                        : `Found ${results.length} reservations matching your details.`
                      }
                    </p>
                  </div>

<<<<<<< Updated upstream
                  {/* Result cards */}
                  {results.map((r, idx) => {
                    // ── Defensive field resolution ────────────────────────────
                    // Covers both camelCase and snake_case API responses
                    const refCode    = r.reference_code  || r.referenceCode  || r.id       || "—";
                    const guestName  = r.name            || r.full_name      || r.fullName  || "—";
                    // Try venue relationship first, then fallback to direct fields
                    const venueName  = r.room            || r.venue?.name    || r.venue_name || r.location || "No room assigned";
                    const eventDate  = r.event_date      || r.eventDate      || r.date      || null;
                    const eventTime  = r.event_time      || r.eventTime      || r.time      || null;
                    const guestCount = r.guests_count    ?? r.guests         ?? r.pax       ?? null;
                    const tableNum   = r.table_number    || r.table          || null;
                    const seatNum    = r.seat_number     || r.seat           || null;
                    const tableSeat  = [tableNum, seatNum].filter(Boolean).join(" / ") || "—";

                    return (
                      <div
                        key={r.id || idx}
                        style={{
                          background: C.surfaceBase,
                          borderRadius: 14,
                          border: `1px solid ${C.borderDefault}`,
                          overflow: "hidden",
                          marginBottom: 14,
                        }}
                      >
                        {/* Gold accent bar */}
=======
                  {results.map((r, idx) => {
                    const refCode = r.reference_code || r.id || "—";
                    return (
                      <div key={r.id || idx} style={{
                        background: C.surfaceBase,
                        borderRadius: 14, border: `1px solid ${C.borderDefault}`,
                        overflow: "hidden", marginBottom: 14,
                      }}>

                        {/* Gold accent top bar */}
>>>>>>> Stashed changes
                        <div style={{
                          height: "2px",
                          background: `linear-gradient(90deg, transparent 0%, ${C.gold}80 30%, ${C.gold}80 70%, transparent 100%)`,
                        }} />

                        <div style={{ padding: "20px 22px" }}>
<<<<<<< Updated upstream

                          {/* Reference code + status */}
=======
                          {/* Reference code — the hero element */}
>>>>>>> Stashed changes
                          <div style={{
                            display: "flex", alignItems: "flex-start",
                            justifyContent: "space-between", gap: 16, marginBottom: 18,
                          }}>
                            <div>
                              <div style={{
                                fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em",
<<<<<<< Updated upstream
                                color: C.gold, fontWeight: 700,
                                textTransform: "uppercase", marginBottom: 6,
=======
                                color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 6,
>>>>>>> Stashed changes
                              }}>
                                Reference Code
                              </div>
                              <div style={{
                                fontFamily: F.mono, fontSize: 28, fontWeight: 500,
<<<<<<< Updated upstream
                                color: C.textPrimary, letterSpacing: "0.06em", lineHeight: 1,
=======
                                color: C.textPrimary, letterSpacing: "0.06em",
                                lineHeight: 1,
>>>>>>> Stashed changes
                              }}>
                                {refCode}
                              </div>
                            </div>
                            <StatusBadge status={r.status} C={C} />
                          </div>

<<<<<<< Updated upstream
                          <div style={{ height: "1px", background: C.divider, marginBottom: 16 }} />

                          {/* Guest name + venue */}
                          <div style={{ marginBottom: 16 }}>
                            <div style={{
                              fontSize: 15, fontWeight: 600,
                              color: C.textPrimary, marginBottom: 3,
                              fontFamily: F.body,
                            }}>
                              {guestName}
                            </div>
                            <div style={{ fontSize: 12.5, color: C.textSecondary, fontFamily: F.body }}>
                              {venueName}
=======
                          {/* Divider */}
                          <div style={{ height: "1px", background: C.divider, marginBottom: 16 }} />

                          {/* Guest & booking info */}
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>
                              {r.name}
                            </div>
                            <div style={{ fontSize: 12.5, color: C.textSecondary }}>
                              {r.room || r.venue || "—"}
>>>>>>> Stashed changes
                            </div>
                          </div>

                          {/* Detail grid */}
                          <div style={{
<<<<<<< Updated upstream
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px 20px",
                          }}>
                            {[
                              ["Date",         fmtDate(eventDate)],
                              ["Time",         fmtTime(eventTime)],
                              ["Guests",       guestCount !== null ? `${guestCount} pax` : "—"],
                              ["Table / Seat", tableSeat],
=======
                            display: "grid", gridTemplateColumns: "1fr 1fr",
                            gap: "12px 20px",
                          }}>
                            {[
                              ["Date", fmtDate(r.eventDate || r.event_date)],
                              ["Time", fmtTime(r.eventTime || r.event_time)],
                              ["Guests", r.guests ? `${r.guests} pax` : r.guests_count ? `${r.guests_count} pax` : "—"],
                              ["Table / Seat", [r.table || r.table_number, r.seat || r.seat_number].filter(Boolean).join(" / ") || "—"],
>>>>>>> Stashed changes
                            ].map(([label, val]) => (
                              <div key={label}>
                                <div style={{
                                  fontFamily: F.label, fontSize: 9, letterSpacing: "0.14em",
                                  textTransform: "uppercase", color: C.textTertiary,
                                  fontWeight: 700, marginBottom: 3,
                                }}>
                                  {label}
                                </div>
<<<<<<< Updated upstream
                                <div style={{
                                  fontFamily: F.body, fontSize: 12.5,
                                  color: C.textPrimary, lineHeight: 1.5,
                                }}>
=======
                                <div style={{ fontFamily: F.body, fontSize: 12.5, color: C.textPrimary }}>
>>>>>>> Stashed changes
                                  {val}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

<<<<<<< Updated upstream
                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <button
                      onClick={() => { setResults(null); setCombination(""); setError(""); }}
=======
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <button onClick={() => setResults(null)}
>>>>>>> Stashed changes
                      style={{
                        flex: 1, padding: "11px 16px",
                        background: "transparent",
                        border: `1px solid ${C.borderDefault}`,
<<<<<<< Updated upstream
                        borderRadius: 8,
                        fontFamily: F.label, fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.10em", textTransform: "uppercase",
                        color: C.textSecondary, cursor: "pointer", transition: "all 0.18s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.borderAccent;
                        e.currentTarget.style.color       = C.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.borderDefault;
                        e.currentTarget.style.color       = C.textSecondary;
                      }}
                    >
                      Search Again
                    </button>
                    <button
                      onClick={() => navigate("/manage-booking")}
                      style={{
                        flex: 1, padding: "11px 16px",
                        background: C.gold, border: "none",
                        borderRadius: 8,
                        fontFamily: F.label, fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.10em", textTransform: "uppercase",
                        color: C.textOnAccent, cursor: "pointer", transition: "all 0.18s",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 8,
=======
                        borderRadius: 8, fontFamily: F.label, fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.10em", textTransform: "uppercase",
                        color: C.textSecondary, cursor: "pointer", transition: "all 0.18s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
                    >
                      Search Again
                    </button>
                    <button onClick={() => navigate("/manage-booking")}
                      style={{
                        flex: 1, padding: "11px 16px",
                        background: C.gold, border: "none",
                        borderRadius: 8, fontFamily: F.label, fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.10em", textTransform: "uppercase",
                        color: C.textOnAccent, cursor: "pointer", transition: "all 0.18s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
>>>>>>> Stashed changes
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLight; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = C.gold; }}
                    >
<<<<<<< Updated upstream
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
=======
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
>>>>>>> Stashed changes
                      </svg>
                      Manage Booking
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
<<<<<<< Updated upstream
          </div>
=======
>>>>>>> Stashed changes
        </div>
      </div>
    </ThemeContext.Provider>
  );
}