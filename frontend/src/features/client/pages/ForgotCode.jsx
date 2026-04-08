// src/features/booking/pages/ForgotCode.jsx
import { useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import bellevueLogo from "../../../assets/bellevue-logo.png";

const ThemeContext = createContext({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

function getTokens(isDark) {
  return isDark
    ? {
        gold: "#C9A84C", goldLight: "#E2C96A", goldFaint: "rgba(201,168,76,0.10)",
        pageBg: "#0E0D09", cardBg: "#1A1812", cardBorder: "rgba(201,168,76,0.16)",
        inputBg: "rgba(255,255,255,0.06)", inputBorder: "rgba(201,168,76,0.22)", inputFocus: "#C9A84C",
        textPrimary: "#F7F3EA", textMuted: "#8A8070",
        navBg: "rgba(14,13,9,0.85)", navBorder: "rgba(201,168,76,0.15)",
        red: "#E05252", green: "#0FBA81",
        divider: "rgba(201,168,76,0.12)",
        badgePending:  { bg: "rgba(244,158,12,0.15)",  color: "#F49E0C" },
        badgeApproved: { bg: "rgba(15,186,129,0.15)",  color: "#0FBA81" },
        badgeRejected: { bg: "rgba(224,82,82,0.15)",   color: "#E05252" },
      }
    : {
        gold: "#A07828", goldLight: "#C9A84C", goldFaint: "rgba(160,120,40,0.10)",
        pageBg: "#F5F0E8", cardBg: "#FFFFFF", cardBorder: "rgba(160,120,40,0.18)",
        inputBg: "rgba(255,255,255,0.90)", inputBorder: "rgba(160,120,40,0.28)", inputFocus: "#9A7A2E",
        textPrimary: "#1A1612", textMuted: "#5A5040",
        navBg: "rgba(245,240,232,0.90)", navBorder: "rgba(160,120,40,0.18)",
        red: "#C0392B", green: "#0FBA81",
        divider: "rgba(160,120,40,0.14)",
        badgePending:  { bg: "rgba(244,158,12,0.15)",  color: "#B8860B" },
        badgeApproved: { bg: "rgba(15,186,129,0.15)",  color: "#0FBA81" },
        badgeRejected: { bg: "rgba(224,82,82,0.15)",   color: "#C0392B" },
      };
}

const F = {
  display: "Georgia, 'Times New Roman', serif",
  body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Parse combination code (surname + last 2 digits)
function parseLookup(raw) {
  const t = raw.trim();
  if (!t) return null;
  const m = t.match(/^(.+?)(\d{2})$/);
  if (m && m[1].length > 0) return { surname: m[1], phone: m[2] };
  return null;
}

function extractList(data) {
  if (!data) return [];
  if (Array.isArray(data))               return data;
  if (Array.isArray(data.data))          return data.data;
  if (Array.isArray(data.reservations))  return data.reservations;
  if (Array.isArray(data.results))       return data.results;
  if (data.id || data.name)              return [data];
  return [];
}

function clientFilter(list, surname, phone) {
  const sLow = surname.toLowerCase();
  return list.filter((r) => {
    const fullName = (r.name || r.full_name || r.fullName || "").trim();
    const parts = fullName.split(/\s+/);
    
    // Prioritize exact surname match (last word)
    const lastWord = parts[parts.length - 1]?.toLowerCase() || "";
    const exactSurnameMatch = lastWord === sLow;
    
    // Also accept partial matches but with higher priority for exact
    const nameMatch = exactSurnameMatch || 
      parts.some((p) => p.toLowerCase().startsWith(sLow)) ||
      fullName.toLowerCase().includes(sLow);
      
    const ph = String(r.phone || r.contact_number || r.mobile || r.phone_number || "")
      .replace(/\D/g, "");
    const phoneMatch = ph.length >= 2 && ph.slice(-2) === phone;
    
    return nameMatch && phoneMatch;
  }).sort((a, b) => {
    // Sort exact matches to the top
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
}

function StatusBadge({ status, C }) {
  const cfg =
    status === "pending"  ? { ...C.badgePending,  label: "Pending"   } :
    status === "reserved" ? { ...C.badgeApproved, label: "Confirmed" } :
    status === "rejected" ? { ...C.badgeRejected, label: "Cancelled" } :
    { bg: "rgba(130,130,130,0.12)", color: "#888", label: status ?? "Unknown" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: F.body, border: `1px solid ${cfg.color}40` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle} title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{ display: "flex", alignItems: "center", padding: 0, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
      <span style={{ position: "relative", width: 46, height: 25, borderRadius: 13, background: isDark ? "#2C2A1E" : "#DDD6C0", border: `1.5px solid ${isDark ? "rgba(201,168,76,0.28)" : "rgba(160,120,40,0.22)"}`, display: "inline-flex", alignItems: "center", flexShrink: 0, transition: "background 0.32s, border-color 0.32s", verticalAlign: "middle" }}>
        <span style={{ position: "absolute", top: 2, left: isDark ? 2 : "calc(100% - 23px)", width: 19, height: 19, borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", transition: "left 0.30s cubic-bezier(.4,0,.2,1)", flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
            <path d="M10 1a9 9 0 1 0 9 9A9 9 0 0 0 10 1zm0 16V3a7 7 0 0 1 0 14z" fill={isDark ? "#1C1A10" : "#B8922A"} />
          </svg>
        </span>
      </span>
    </button>
  );
}

function NavBar() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,4vw,52px)", background: C.navBg, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderBottom: `1px solid ${C.navBorder}`, boxSizing: "border-box", transition: "background 0.35s" }}>
      <img src={bellevueLogo} alt="The Bellevue Manila" onClick={() => navigate("/")}
        style={{ height: 32, width: "auto", cursor: "pointer", display: "block", flexShrink: 0, filter: isDark ? "none" : "brightness(0) saturate(100%) invert(25%) sepia(40%) saturate(500%) hue-rotate(10deg)", transition: "filter 0.35s" }} />
      <ThemeToggle />
    </nav>
  );
}

export default function ForgotCode() {
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

  const [combination, setCombination] = useState("");
  const [searching, setSearching]   = useState(false);
  const [error, setError]           = useState("");
  const [results, setResults]       = useState(null);
  const [focused, setFocused]       = useState(false);

  const fmtDate = (d) => {
    if (!d) return "—";
    const p = new Date(d);
    return isNaN(p) ? d : p.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  };
  const fmtTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hr = parseInt(h) || 0;
    const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    return `${hr12}:${m || "00"} ${hr < 12 ? "AM" : "PM"}`;
  };

  const handleSearch = async () => {
    const trimmed = combination.trim();
    if (!trimmed) { setError("Please enter your combination code."); return; }
    
    const parsed = parseLookup(trimmed);
    if (!parsed) { setError("Enter your surname + last 2 phone digits. Example: abane35"); return; }

    const { surname, phone } = parsed;
    setError(""); setSearching(true); setResults(null);

    const tryFetch = async (url) => {
      try {
        const res  = await fetch(url, { headers: { Accept: "application/json" } });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { return { ok: false }; }
        return { ok: res.ok, status: res.status, data };
      } catch (e) { return { ok: false }; }
    };

    try {
      const s1 = await tryFetch(`${API_BASE}/reservations?per_page=500&page=1`);
      if (s1.data) {
        const matched = clientFilter(extractList(s1.data), surname, phone);
        if (matched.length > 0) { setResults([matched[0]]); return; } // Only show the best match
      }
      const s2 = await tryFetch(`${API_BASE}/reservations`);
      if (s2.data) {
        const matched = clientFilter(extractList(s2.data), surname, phone);
        if (matched.length > 0) { setResults([matched[0]]); return; } // Only show the best match
      }
      setError("No reservations found. Please double-check your surname and phone number.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle: toggleTheme }}>
      <div style={{ minHeight: "100vh", fontFamily: F.body, position: "relative", overflow: "hidden" }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/src/assets/bg-login.jpeg')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(3px) brightness(0.85)", transform: "scale(1.04)" }} />
          <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(14,13,9,0.45)" : "rgba(245,240,232,0.38)" }} />
        </div>

        <NavBar />

        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px clamp(16px,5vw,48px) 48px" }}>

          {/* Back */}
          <div style={{ position: "absolute", top: 80, left: "clamp(16px,4vw,52px)" }}>
            <button onClick={() => navigate("/manage-booking")} title="Go back"
              style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(201,168,76,0.12)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1.5px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.22s", padding: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.28)"; e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.12)"; e.currentTarget.style.transform = "scale(1)"; }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ display: "inline-block", width: 28, height: 1.5, background: C.gold }} />
              <span style={{ fontFamily: F.body, fontSize: 10, letterSpacing: "0.26em", color: C.gold, fontWeight: 700, textTransform: "uppercase" }}>Forgot Reference Code</span>
              <span style={{ display: "inline-block", width: 28, height: 1.5, background: C.gold }} />
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(24px,4.5vw,38px)", fontWeight: 600, color: "#F7F3EA", lineHeight: 1.15, margin: "0 0 10px", letterSpacing: "-0.01em", textShadow: "0 2px 20px rgba(0,0,0,0.35)" }}>
              Recover Your Reference Code
            </h1>
            <p style={{ fontFamily: F.body, fontSize: 14, color: "rgba(247,243,234,0.65)", margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
              Enter your combination code (surname + last 2 phone digits) to recover your reference code.
            </p>
          </div>

          {/* Search Card */}
          {!results && (
            <div style={{ width: "100%", maxWidth: 460, background: isDark ? "rgba(14,13,9,0.78)" : "rgba(255,251,244,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 20, border: `1px solid ${isDark ? "rgba(201,168,76,0.18)" : "rgba(160,120,40,0.22)"}`, padding: "28px 26px 26px", boxShadow: "0 24px 80px rgba(0,0,0,0.30)", transition: "background 0.35s" }}>

              <label style={{ display: "block", fontFamily: F.body, fontSize: 10, letterSpacing: "0.20em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
                Combination Code <span style={{ color: C.red }}>*</span>
              </label>
              <input
                value={combination}
                onChange={(e) => { setCombination(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="e.g. abane35"
                autoComplete="off"
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: `1.5px solid ${focused ? C.inputFocus : C.inputBorder}`, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.80)", fontFamily: F.mono, fontSize: 18, fontWeight: 700, color: C.textPrimary, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: focused ? `0 0 0 3px ${C.gold}22` : "none", colorScheme: isDark ? "dark" : "light", marginBottom: 14 }}
              />

              {error && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.24)", borderRadius: 10, padding: "10px 12px", marginBottom: 16, fontSize: 12, color: C.red, lineHeight: 1.6 }}>
                  <span style={{ flexShrink: 0, fontSize: 14 }}>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleSearch} disabled={searching}
                style={{ width: "100%", marginTop: 10, padding: "14px", background: searching ? (isDark ? "#2A2018" : "#D4C9B0") : C.gold, border: "none", borderRadius: 12, fontFamily: F.body, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: searching ? C.textMuted : (isDark ? "#0E0D09" : "#FFFFFF"), cursor: searching ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onMouseEnter={(e) => { if (!searching) { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={(e) => { if (!searching) { e.currentTarget.style.background = C.gold; e.currentTarget.style.transform = "translateY(0)"; } }}>
                {searching
                  ? <><span style={{ display: "inline-block", width: 13, height: 13, border: `2px solid ${C.textMuted}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Searching…</>
                  : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> Find My Code</>
                }
              </button>

              <p style={{ textAlign: "center", marginTop: 16, fontFamily: F.body, fontSize: 12, color: isDark ? "rgba(247,243,234,0.45)" : C.textMuted }}>
                Remember your code?{" "}
                <button onClick={() => navigate("/manage-booking")}
                  style={{ background: "none", border: "none", fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.gold, cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Go back →
                </button>
              </p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div style={{ width: "100%", maxWidth: 560 }}>

              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <p style={{ fontFamily: F.body, fontSize: 13, color: isDark ? "rgba(247,243,234,0.55)" : C.textMuted, margin: "0 0 8px" }}>
                  {results.length === 1 
                    ? <>Found <strong style={{ color: C.gold }}>1</strong> reservation matching your details.</>
                    : <>Found <strong style={{ color: C.gold }}>{results.length}</strong> reservations matching your details.</>
                  }
                </p>
                <button onClick={() => setResults(null)}
                  style={{ background: "none", border: "none", fontFamily: F.body, fontSize: 12, color: C.gold, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Search again
                </button>
              </div>

              {results.map((r, idx) => {
                const refCode = r.reference_code || r.id || "—";
                const statusKey = r.status === "reserved" ? "approved" : r.status === "rejected" ? "rejected" : "pending";
                return (
                  <div key={r.id || idx} style={{ background: isDark ? "rgba(14,13,9,0.82)" : "rgba(255,251,244,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 18, border: `1px solid ${isDark ? "rgba(201,168,76,0.20)" : "rgba(160,120,40,0.22)"}`, padding: "22px 24px", marginBottom: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>

                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                      <div>
                        <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{r.name}</div>
                        <div style={{ fontFamily: F.body, fontSize: 10, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
                          {r.room || r.venue || "—"}
                        </div>
                        <StatusBadge status={r.status} C={C} />
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: F.body, fontSize: 9, letterSpacing: "0.18em", color: C.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Reference Code</div>
                        <div style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 700, color: C.textPrimary, letterSpacing: "0.08em", background: C.goldFaint, padding: "6px 14px", borderRadius: 8, border: `1px solid ${isDark ? "rgba(201,168,76,0.25)" : "rgba(160,120,40,0.20)"}` }}>
                          {refCode}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: C.divider, marginBottom: 14 }} />

                    {/* Details */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 16 }}>
                      {[
                        ["Date", fmtDate(r.eventDate || r.event_date)],
                        ["Time", fmtTime(r.eventTime || r.event_time)],
                        ["Guests", r.guests ? `${r.guests} pax` : r.guests_count ? `${r.guests_count} pax` : "—"],
                        ["Table / Seat", [r.table || r.table_number, r.seat || r.seat_number].filter(Boolean).join(" / ") || "—"],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontFamily: F.body, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                          <div style={{ fontFamily: F.body, fontSize: 13, color: C.textPrimary }}>{val}</div>
                        </div>
                      ))}
                    </div>

                   
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
}