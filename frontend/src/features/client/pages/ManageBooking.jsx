// src/features/booking/pages/ManageBooking.jsx
import { useState, useEffect, createContext, useContext } from "react";
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
        gold: "#C9A84C", goldLight: "#E2C96A", goldFaint: "rgba(201,168,76,0.10)",
        pageBg: "#0E0D09", cardBg: "#1A1812", cardBorder: "rgba(201,168,76,0.16)",
        inputBg: "rgba(255,255,255,0.06)", inputBorder: "rgba(201,168,76,0.22)", inputFocus: "#C9A84C",
        textPrimary: "#F7F3EA", textMuted: "#8A8070",
        navBg: "rgba(14,13,9,0.85)", navBorder: "rgba(201,168,76,0.15)",
        heroBg1: "#0E0D09", heroBg2: "#1A1812", headerHint: "#C9A84C",
        labelColor: "rgba(201,168,76,0.72)", divider: "rgba(201,168,76,0.12)",
        red: "#E05252", green: "#0FBA81",
        overlayCard: "rgba(14,13,9,0.82)",
        overlayCardBorder: "rgba(201,168,76,0.18)",
        badgePending:  { bg: "rgba(244,158,12,0.15)",  color: "#F49E0C" },
        badgeApproved: { bg: "rgba(15,186,129,0.15)",  color: "#0FBA81" },
        badgeRejected: { bg: "rgba(224,82,82,0.15)",   color: "#E05252" },
        statusNote:       { pending: "rgba(244,158,12,0.08)",  approved: "rgba(15,186,129,0.08)",  rejected: "rgba(224,82,82,0.08)" },
        statusNoteBorder: { pending: "rgba(244,158,12,0.22)",  approved: "rgba(15,186,129,0.22)",  rejected: "rgba(224,82,82,0.22)" },
        detailBorder: "rgba(201,168,76,0.08)", detailLabel: "rgba(201,168,76,0.66)", detailValue: "#F5EFE0",
      }
    : {
        gold: "#A07828", goldLight: "#C9A84C", goldFaint: "rgba(160,120,40,0.10)",
        pageBg: "#F5F0E8", cardBg: "#FFFFFF", cardBorder: "rgba(160,120,40,0.18)",
        inputBg: "rgba(255,255,255,0.90)", inputBorder: "rgba(160,120,40,0.28)", inputFocus: "#9A7A2E",
        textPrimary: "#1A1612", textMuted: "#5A5040",
        navBg: "rgba(245,240,232,0.90)", navBorder: "rgba(160,120,40,0.18)",
        heroBg1: "#1A1612", heroBg2: "#2A2018", headerHint: "#C9A84C",
        labelColor: "rgba(160,120,40,0.80)", divider: "rgba(160,120,40,0.14)",
        red: "#C0392B", green: "#0FBA81",
        overlayCard: "rgba(255,251,244,0.90)",
        overlayCardBorder: "rgba(160,120,40,0.22)",
        badgePending:  { bg: "rgba(244,158,12,0.15)",  color: "#B8860B" },
        badgeApproved: { bg: "rgba(15,186,129,0.15)",  color: "#0FBA81" },
        badgeRejected: { bg: "rgba(224,82,82,0.15)",   color: "#C0392B" },
        statusNote:       { pending: "rgba(244,158,12,0.08)",  approved: "rgba(15,186,129,0.08)",  rejected: "rgba(224,82,82,0.08)" },
        statusNoteBorder: { pending: "rgba(244,158,12,0.22)",  approved: "rgba(15,186,129,0.22)",  rejected: "rgba(224,82,82,0.22)" },
        detailBorder: "rgba(160,120,40,0.08)", detailLabel: "rgba(160,120,40,0.66)", detailValue: "#1A1612",
      };
}

const F = {
  display: "Georgia, 'Times New Roman', serif",
  body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ─────────────────────────────────────────────
// SHARED CLOSE BUTTON
// ─────────────────────────────────────────────
function CloseBtn({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Close"
      style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "#C9A84C",
        border: "2px solid #C9A84C",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.18s, transform 0.15s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.28)",
        padding: 0,
        zIndex: 10,
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = "#A07828"; e.currentTarget.style.transform = "scale(1.08)"; } }}
      onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.transform = "scale(1)"; } }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────
// PARSE LOOKUP  "abane35" → { surname:"abane", phone:"35" }
// ─────────────────────────────────────────────
function parseLookup(raw) {
  const t = raw.trim();
  if (!t) return null;
  const m = t.match(/^(.+?)(\d{2})$/);
  if (m && m[1].length > 0) return { surname: m[1], phone: m[2] };
  return null;
}

// ─────────────────────────────────────────────
// Normalize any API shape into a flat array
// ─────────────────────────────────────────────
function extractList(data) {
  if (!data) return [];
  if (Array.isArray(data))               return data;
  if (Array.isArray(data.data))          return data.data;
  if (Array.isArray(data.reservations))  return data.reservations;
  if (Array.isArray(data.results))       return data.results;
  if (data.id || data.name)              return [data];
  return [];
}

// ─────────────────────────────────────────────
// Client-side filter
// ─────────────────────────────────────────────
function clientFilter(list, surname, phone) {
  const sLow = surname.toLowerCase();
  return list.filter((r) => {
    const fullName = (r.name || r.full_name || r.fullName || "").trim();
    const parts    = fullName.split(/\s+/);
    const nameMatch =
      parts.some((p) => p.toLowerCase().startsWith(sLow)) ||
      fullName.toLowerCase().includes(sLow);
    const ph = String(r.phone || r.contact_number || r.mobile || r.phone_number || "")
      .replace(/\D/g, "");
    const phoneMatch = ph.length >= 2 && ph.slice(-2) === phone;
    return nameMatch && phoneMatch;
  });
}

// ─────────────────────────────────────────────
// THEME TOGGLE
// ─────────────────────────────────────────────
function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{ display:"flex", alignItems:"center", padding:0, background:"none", border:"none", cursor:"pointer", flexShrink:0 }}>
      <span style={{ position:"relative", width:46, height:25, borderRadius:13, background: isDark ? "#2C2A1E" : "#DDD6C0", border:`1.5px solid ${isDark ? "rgba(201,168,76,0.28)" : "rgba(160,120,40,0.22)"}`, display:"inline-flex", alignItems:"center", flexShrink:0, transition:"background 0.32s, border-color 0.32s", verticalAlign:"middle" }}>
        <span style={{ position:"absolute", top:2, left: isDark ? 2 : "calc(100% - 23px)", width:19, height:19, borderRadius:"50%", background:"#FFFFFF", display:"flex", alignItems:"center", justifyContent:"center", transition:"left 0.30s cubic-bezier(.4,0,.2,1)", flexShrink:0 }}>
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
            <path d="M10 1a9 9 0 1 0 9 9A9 9 0 0 0 10 1zm0 16V3a7 7 0 0 1 0 14z" fill={isDark ? "#1C1A10" : "#B8922A"} />
          </svg>
        </span>
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
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:9000, height:64, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 clamp(16px,4vw,52px)", background:C.navBg, backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", borderBottom:`1px solid ${C.navBorder}`, boxSizing:"border-box", transition:"background 0.35s" }}>
      <img src={bellevueLogo} alt="The Bellevue Manila" onClick={() => navigate("/")}
        style={{ height:32, width:"auto", cursor:"pointer", display:"block", flexShrink:0, filter: isDark ? "none" : "brightness(0) saturate(100%) invert(25%) sepia(40%) saturate(500%) hue-rotate(10deg)", transition:"filter 0.35s" }} />
      <ThemeToggle />
    </nav>
  );
}

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────
function StatusBadge({ status, C }) {
  const cfg =
    status === "pending"  ? { ...C.badgePending,  label:"Pending"   } :
    status === "reserved" ? { ...C.badgeApproved, label:"Confirmed" } :
    status === "rejected" ? { ...C.badgeRejected, label:"Cancelled" } :
    { bg:"rgba(130,130,130,0.12)", color:"#888", label: status ?? "Unknown" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:cfg.bg, color:cfg.color, padding:"4px 12px", borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:F.body, border:`1px solid ${cfg.color}40` }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.color, display:"inline-block" }} />
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
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"9px 0", borderBottom:`1px solid ${C.detailBorder}` }}>
      <span style={{ fontFamily:F.body, fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:C.detailLabel, minWidth:110, flexShrink:0 }}>{label}</span>
      <span style={{ fontFamily:F.body, fontSize:13, color:C.detailValue, textAlign:"right", maxWidth:240, lineHeight:1.5 }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// CANCEL MODAL
// ─────────────────────────────────────────────
function CancelModal({ reservation, onConfirm, onClose, loading, C }) {
  const eventDate = reservation?.eventDate || reservation?.event_date || "—";
  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.70)", zIndex:4000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:C.cardBg, borderRadius:18, padding:"28px 24px", width:400, maxWidth:"95vw", boxShadow:"0 32px 80px rgba(0,0,0,0.35)", border:`1px solid ${C.cardBorder}`, fontFamily:F.body, position:"relative", animation:"scaleIn 0.2s ease" }}>

        {/* ── X close button ── */}
        <div style={{ position:"absolute", top:14, right:14 }}>
          <CloseBtn onClick={onClose} disabled={loading} />
        </div>

        <div style={{ fontSize:28, marginBottom:12 }}>⚠️</div>
        <div style={{ fontSize:10, letterSpacing:"0.22em", color:C.gold, fontWeight:700, marginBottom:4, textTransform:"uppercase" }}>Cancel Booking</div>
        <div style={{ fontSize:18, fontWeight:700, color:C.textPrimary, marginBottom:12, fontFamily:F.display }}>Are you sure?</div>
        <div style={{ background:C.goldFaint, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:600, color:C.textPrimary, marginBottom:3 }}>{reservation?.name}</div>
          <div style={{ fontSize:12, color:C.textMuted }}>{reservation?.room || reservation?.venue} · {eventDate}</div>
          <div style={{ fontSize:10, color:C.gold, fontWeight:700, marginTop:5, letterSpacing:"0.08em", fontFamily:F.mono }}>REF: {reservation?.id}</div>
        </div>
        <p style={{ fontSize:12, color:C.red, marginBottom:20, lineHeight:1.6, background:"rgba(224,82,82,0.06)", border:"1px solid rgba(224,82,82,0.20)", borderRadius:8, padding:"9px 12px" }}>
          This action <strong>cannot be undone</strong>. Your seat/table will be released.
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onClose} disabled={loading}
            style={{ flex:1, padding:"11px", border:`1.5px solid ${C.cardBorder}`, borderRadius:10, background:"transparent", color:C.textMuted, fontFamily:F.body, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={(e)=>{ e.currentTarget.style.borderColor=C.gold; e.currentTarget.style.color=C.gold; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.borderColor=C.cardBorder; e.currentTarget.style.color=C.textMuted; }}>
            Keep It
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex:1, padding:"11px", border:"none", borderRadius:10, background:loading?"#aaa":C.red, color:"#fff", fontFamily:F.body, fontSize:13, fontWeight:700, cursor:loading?"not-allowed":"pointer", transition:"background 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {loading
              ? <><span style={{ display:"inline-block", width:12, height:12, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Cancelling…</>
              : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RESERVATION DETAIL MODAL
// ─────────────────────────────────────────────
function ReservationDetailModal({ reservation, onClose, onCancel, C, isDark, fmtDate, fmtTime }) {
  const isPending  = reservation.status === "pending";
  const isApproved = reservation.status === "reserved";
  const isRejected = reservation.status === "rejected";
  const statusKey  = isApproved ? "approved" : isRejected ? "rejected" : "pending";

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.70)", zIndex:3500, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:C.cardBg, borderRadius:20, width:500, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 40px 100px rgba(0,0,0,0.45)", border:`1px solid ${C.cardBorder}`, fontFamily:F.body, position:"relative", animation:"scaleIn 0.22s ease" }}>

        {/* ── Header band ── */}
        <div style={{ background:`linear-gradient(110deg, ${C.heroBg1} 0%, ${C.heroBg2} 100%)`, padding:"20px 22px 18px", borderRadius:"20px 20px 0 0", position:"sticky", top:0, zIndex:1 }}>
          {/* X button — top-right of header */}
          <div style={{ position:"absolute", top:14, right:14, zIndex:20 }}>
            <CloseBtn onClick={onClose} />
          </div>

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", paddingRight:48 }}>
            <div>
              <div style={{ fontFamily:F.display, fontSize:18, fontWeight:600, color:"#F7F3EA", marginBottom:4 }}>{reservation.name}</div>
              <div style={{ fontFamily:F.mono, fontSize:11, color:C.gold, letterSpacing:"0.12em", fontWeight:700 }}>REF #{reservation.id || reservation.reference_code || "—"}</div>
            </div>
            <StatusBadge status={reservation.status} C={C} />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:"20px 22px 24px" }}>
          <DetailRow label="Venue"      value={reservation.room || reservation.venue}                        C={C} />
          <DetailRow label="Date"       value={fmtDate(reservation.eventDate || reservation.event_date)}     C={C} />
          <DetailRow label="Time"       value={fmtTime(reservation.eventTime || reservation.event_time)}     C={C} />
          <DetailRow label="Guests"     value={reservation.guests ? `${reservation.guests} pax` : null}      C={C} />
          <DetailRow label="Seat/Table"
            value={reservation.type === "whole"
              ? `Table ${reservation.table || "—"} (${reservation.guests} seat${reservation.guests !== 1 ? "s" : ""})`
              : reservation.seat ? `Table ${reservation.table || "—"}, Seat ${reservation.seat}` : null
            } C={C} />
          <DetailRow label="Type"  value={reservation.type === "whole" ? "Whole Table" : reservation.type === "seat" ? "Individual Seat" : reservation.type || null} C={C} />
          <DetailRow label="Email" value={reservation.email}                                       C={C} />
          <DetailRow label="Phone" value={reservation.phone || reservation.contact_number || reservation.mobile} C={C} />

          <div style={{ marginTop:14, padding:"10px 13px", borderRadius:8, background:C.statusNote[statusKey], border:`1px solid ${C.statusNoteBorder[statusKey]}`, fontSize:12, color:C.textMuted, lineHeight:1.6 }}>
            {isPending  && <><strong style={{ color:C.textPrimary }}>Pending review.</strong> You may cancel while not yet approved.</>}
            {isApproved && <><strong style={{ color:C.textPrimary }}>Confirmed.</strong> Please arrive on time. Cancellation unavailable for confirmed bookings.</>}
            {isRejected && <><strong style={{ color:C.textPrimary }}>Cancelled.</strong> This booking is no longer active.</>}
          </div>

          {isPending && (
            <button
              onClick={() => { onClose(); onCancel(reservation); }}
              style={{ marginTop:14, width:"100%", padding:"11px", background:"transparent", border:`1.5px solid ${C.red}`, borderRadius:10, fontFamily:F.body, fontSize:12, fontWeight:700, color:C.red, cursor:"pointer", letterSpacing:"0.06em", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
              onMouseEnter={(e)=>{ e.currentTarget.style.background=C.red; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.red; }}>
              🗑 Cancel This Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RESULTS MODAL  (list of reservations found)
// ─────────────────────────────────────────────
function ResultsModal({ results, onClose, onSelectReservation, C, isDark, fmtDate, fmtTime }) {
  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:C.cardBg, borderRadius:20, width:540, maxWidth:"95vw", maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 40px 100px rgba(0,0,0,0.45)", border:`1px solid ${C.cardBorder}`, fontFamily:F.body, animation:"scaleIn 0.22s ease", overflow:"hidden" }}>

        {/* ── Modal header ── */}
        <div style={{ background:`linear-gradient(110deg, ${C.heroBg1} 0%, ${C.heroBg2} 100%)`, padding:"18px 22px 16px", flexShrink:0, borderRadius:"20px 20px 0 0", position:"relative" }}>
          {/* X button — absolutely positioned top-right */}
          <div style={{ position:"absolute", top:14, right:14, zIndex:20 }}>
            <CloseBtn onClick={onClose} />
          </div>

          <div style={{ paddingRight:52 }}>
            <div style={{ fontFamily:F.body, fontSize:10, letterSpacing:"0.22em", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>
              Reservations Found
            </div>
            <div style={{ fontFamily:F.display, fontSize:20, fontWeight:600, color:"#F7F3EA" }}>
              {results.length} Booking{results.length !== 1 ? "s" : ""} Located
            </div>
          </div>
        </div>

        {/* ── Scrollable list ── */}
        <div style={{ overflowY:"auto", padding:"16px 18px 20px", display:"flex", flexDirection:"column", gap:10 }}>
          {results.map((r, idx) => (
            <div
              key={r.id || idx}
              onClick={() => onSelectReservation(r)}
              style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius:12, border:`1px solid ${C.cardBorder}`, padding:"14px 18px", cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}
              onMouseEnter={(e)=>{ e.currentTarget.style.borderColor=C.gold; e.currentTarget.style.background= isDark ? "rgba(201,168,76,0.06)" : "rgba(160,120,40,0.05)"; e.currentTarget.style.transform="translateX(3px)"; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.borderColor=C.cardBorder; e.currentTarget.style.background= isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"; e.currentTarget.style.transform="translateX(0)"; }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:F.display, fontSize:15, fontWeight:600, color:C.textPrimary, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.name}</div>
                <div style={{ fontFamily:F.mono, fontSize:10, color:C.gold, letterSpacing:"0.10em", fontWeight:700, marginBottom:3 }}>REF #{r.id || r.reference_code || "—"}</div>
                <div style={{ fontFamily:F.body, fontSize:11, color:C.textMuted }}>
                  {r.room || r.venue || "—"} &nbsp;·&nbsp; {fmtDate(r.eventDate || r.event_date)} &nbsp;·&nbsp; {fmtTime(r.eventTime || r.event_time)}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                <StatusBadge status={r.status} C={C} />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding:"0 18px 18px", flexShrink:0 }}>
          <p style={{ fontFamily:F.body, fontSize:11, color:C.textMuted, textAlign:"center", margin:0 }}>
            Tap any booking to view details or manage it.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
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

  const [lookup,             setLookup]             = useState("");
  const [results,            setResults]            = useState(null);
  const [searching,          setSearching]          = useState(false);
  const [error,              setError]              = useState("");
  const [cancelTarget,       setCancelTarget]       = useState(null);
  const [cancelling,         setCancelling]         = useState(false);
  const [toast,              setToast]              = useState(null);
  const [focused,            setFocused]            = useState(false);
  const [showResultsModal,   setShowResultsModal]   = useState(false);
  const [selectedReservation,setSelectedReservation]= useState(null);

  const showToast = (msg, isSuccess = true) => {
    setToast({ msg, isSuccess });
    setTimeout(() => setToast(null), 3500);
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
    return isNaN(p) ? d : p.toLocaleDateString("en-PH", { year:"numeric", month:"long", day:"numeric" });
  };

  // ── localStorage fallback ───────────────────────────────────────────────
  const localSearch = (surname, phone) => {
    try {
      const stored = JSON.parse(localStorage.getItem("bellevue_reservations") || "[]");
      const matched = clientFilter(stored, surname, phone);
      setResults(matched);
      if (matched.length > 0) {
        setShowResultsModal(true);
      } else {
        setError("No reservations found. Double-check your lookup code and try again.");
      }
    } catch {
      setError("Unable to search at this time. Please try again.");
      setResults([]);
    }
  };

  // ── Safe fetch helper ───────────────────────────────────────────────────
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

  // ── Main search ─────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const trimmed = lookup.trim();
    if (!trimmed) { setError("Please enter your lookup code."); return; }
    const parsed = parseLookup(trimmed);
    if (!parsed) { setError("Enter your surname + last 2 phone digits. Example: abane35"); return; }

    const { surname, phone } = parsed;
    setError(""); setSearching(true); setResults(null); setShowResultsModal(false);

    const finishWithMatched = (matched) => {
      setResults(matched);
      if (matched.length > 0) {
        setShowResultsModal(true);
      } else {
        setError("No reservations found. Double-check your lookup code and try again.");
      }
    };

    try {
      const s1 = await tryFetch(`${API_BASE}/reservations?per_page=500&page=1`);
      if (s1.data) {
        const matched = clientFilter(extractList(s1.data), surname, phone);
        if (matched.length > 0) { finishWithMatched(matched); return; }
      }

      const s2 = await tryFetch(`${API_BASE}/reservations/search?surname=${encodeURIComponent(surname)}&phone_last2=${encodeURIComponent(phone)}`);
      if (s2.ok) {
        const list = extractList(s2.data);
        if (list.length > 0) { finishWithMatched(list); return; }
      }

      const s3 = await tryFetch(`${API_BASE}/reservations/search?last_name=${encodeURIComponent(surname)}&phone=${encodeURIComponent(phone)}`);
      if (s3.ok) {
        const list = extractList(s3.data);
        if (list.length > 0) { finishWithMatched(list); return; }
      }

      const s4 = await tryFetch(`${API_BASE}/reservations/lookup?code=${encodeURIComponent(surname + phone)}`);
      if (s4.ok) {
        const list = extractList(s4.data);
        if (list.length > 0) { finishWithMatched(list); return; }
      }

      const s5 = await tryFetch(`${API_BASE}/reservations`);
      if (s5.data) {
        const matched = clientFilter(extractList(s5.data), surname, phone);
        if (matched.length > 0) { finishWithMatched(matched); return; }
      }

      setError("No reservations found. Double-check your lookup code and try again.");
    } finally {
      setSearching(false);
    }
  };

  // ── Cancel ──────────────────────────────────────────────────────────────
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
        const stored = JSON.parse(localStorage.getItem("bellevue_reservations") || "[]");
        localStorage.setItem("bellevue_reservations", JSON.stringify(
          stored.map((r) => (r.id === cancelTarget.id || String(r.db_id) === String(numId))
            ? { ...r, status: "rejected" } : r)
        ));
      } catch {}
    }
    setResults((prev) => prev?.map((r) => r.id === cancelTarget.id ? { ...r, status: "rejected" } : r) ?? prev);
    setCancelTarget(null);
    setCancelling(false);
    showToast("Booking cancelled successfully.");
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <ThemeContext.Provider value={{ isDark, toggle: toggleTheme }}>
      <div style={{ minHeight:"100vh", fontFamily:F.body, position:"relative", overflow:"hidden" }}>

        {/* ── Full-page blurred background image ── */}
        <div style={{ position:"fixed", inset:0, zIndex:0 }}>
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:"url('/src/assets/bg-login.jpeg')",
            backgroundSize:"cover", backgroundPosition:"center",
            filter:"blur(3px) brightness(0.85)",
            transform:"scale(1.04)",
          }} />
          <div style={{ position:"absolute", inset:0, background: isDark ? "rgba(14,13,9,0.45)" : "rgba(245,240,232,0.38)" }} />
        </div>

        <ManageBookingNav />

        {/* ── Centered content ── */}
        <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px clamp(16px,5vw,48px) 48px" }}>

          {/* Back button */}
          <div style={{ position:"absolute", top:80, left:"clamp(16px,4vw,52px)" }}>
            <button
              onClick={() => navigate("/")}
              title="Go back"
              style={{ width:48, height:48, borderRadius:"50%", background:"rgba(201,168,76,0.12)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:`1.5px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.22s", padding:0 }}
              onMouseEnter={(e)=>{ e.currentTarget.style.background="rgba(201,168,76,0.28)"; e.currentTarget.style.transform="scale(1.08)"; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.background="rgba(201,168,76,0.12)"; e.currentTarget.style.transform="scale(1)"; }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Heading */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <span style={{ display:"inline-block", width:28, height:1.5, background:C.gold }} />
              <span style={{ fontFamily:F.body, fontSize:10, letterSpacing:"0.26em", color:C.gold, fontWeight:700, textTransform:"uppercase" }}>Manage Booking</span>
              <span style={{ display:"inline-block", width:28, height:1.5, background:C.gold }} />
            </div>
            <h1 style={{ fontFamily:F.display, fontSize:"clamp(26px,5vw,42px)", fontWeight:600, color:"#F7F3EA", lineHeight:1.15, margin:"0 0 10px", letterSpacing:"-0.01em", textShadow:"0 2px 20px rgba(0,0,0,0.35)" }}>
              View Your Reservation
            </h1>
            <p style={{ fontFamily:F.body, fontSize:14, color:"rgba(247,243,234,0.65)", margin:0, lineHeight:1.6, maxWidth:360 }}>
              Enter your lookup code to access and manage your booking.
            </p>
          </div>

          {/* ── Search card ── */}
          <div style={{ width:"100%", maxWidth:480, background: isDark ? "rgba(14,13,9,0.78)" : "rgba(255,251,244,0.88)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderRadius:20, border:`1px solid ${C.overlayCardBorder}`, padding:"28px 26px 26px", boxShadow:"0 24px 80px rgba(0,0,0,0.30)", transition:"background 0.35s" }}>

            <label style={{ display:"block", fontFamily:F.body, fontSize:10, letterSpacing:"0.20em", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>
              Lookup Code
            </label>
            <p style={{ fontFamily:F.body, fontSize:12, color:C.textMuted, margin:"0 0 14px", lineHeight:1.6 }}>
              Combine your <strong style={{ color:C.textPrimary }}>surname</strong> + <strong style={{ color:C.textPrimary }}>last 2 digits</strong> of your registered phone number.
            </p>

            <input
              value={lookup}
              onChange={(e) => { setLookup(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g.  abane35  or  DelaC23"
              autoComplete="off" spellCheck={false}
              style={{
                width:"100%", boxSizing:"border-box", padding:"14px 16px",
                border:`1.5px solid ${error ? C.red : focused ? C.inputFocus : C.inputBorder}`,
                borderRadius:12, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.80)",
                fontFamily:F.mono, fontSize:18, fontWeight:700, letterSpacing:"0.06em", color:C.textPrimary,
                outline:"none", transition:"border-color 0.2s, box-shadow 0.2s",
                boxShadow: focused ? `0 0 0 3px ${C.gold}22` : error ? `0 0 0 3px ${C.red}14` : "none",
                colorScheme: isDark ? "dark" : "light", marginBottom:8,
              }}
            />

            <div style={{ fontSize:11, color:C.textMuted, marginBottom: error ? 12 : 18, lineHeight:1.6 }}>
              Example: <strong style={{ color:C.gold, fontFamily:F.mono }}>abane</strong> + last 2 digits <strong style={{ color:C.gold, fontFamily:F.mono }}>35</strong> → <strong style={{ color:C.gold, fontFamily:F.mono }}>abane35</strong>
            </div>

            {error && (
              <div style={{ display:"flex", alignItems:"flex-start", gap:8, background:"rgba(224,82,82,0.08)", border:"1px solid rgba(224,82,82,0.24)", borderRadius:10, padding:"10px 12px", marginBottom:16, fontSize:12, color:C.red, lineHeight:1.6, animation:"fadeIn 0.2s ease" }}>
                <span style={{ flexShrink:0, fontSize:14 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={searching}
              style={{ width:"100%", padding:"14px", background: searching ? (isDark ? "#2A2018" : "#D4C9B0") : C.gold, border:"none", borderRadius:12, fontFamily:F.body, fontSize:13, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color: searching ? C.textMuted : (isDark ? "#0E0D09" : "#FFFFFF"), cursor: searching ? "not-allowed" : "pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
              onMouseEnter={(e) => { if (!searching) { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${C.gold}40`; } }}
              onMouseLeave={(e) => { if (!searching) { e.currentTarget.style.background = C.gold; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; } }}>
              {searching
                ? <><span style={{ display:"inline-block", width:13, height:13, border:`2px solid ${C.textMuted}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />Searching…</>
                : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Find My Booking</>
              }
            </button>

            <div style={{ textAlign:"center", paddingTop:18 }}>
              <span style={{ fontFamily:F.body, fontSize:12, color: isDark ? "rgba(247,243,234,0.45)" : C.textMuted }}>Need to make a booking? </span>
              <button onClick={() => navigate("/venues")}
                style={{ background:"none", border:"none", fontFamily:F.body, fontSize:12, fontWeight:700, color:C.gold, cursor:"pointer", padding:0, letterSpacing:"0.04em", textDecoration:"underline", textUnderlineOffset:3 }}>
                View All Venues →
              </button>
            </div>
          </div>
        </div>

        {/* ── Results modal (list) ── */}
        {showResultsModal && results && results.length > 0 && (
          <ResultsModal
            results={results}
            onClose={() => setShowResultsModal(false)}
            onSelectReservation={(r) => { setShowResultsModal(false); setSelectedReservation(r); }}
            C={C} isDark={isDark}
            fmtDate={fmtDate} fmtTime={fmtTime}
          />
        )}

        {/* ── Single reservation detail modal ── */}
        {selectedReservation && (
          <ReservationDetailModal
            reservation={selectedReservation}
            onClose={() => setSelectedReservation(null)}
            onCancel={(r) => { setCancelTarget(r); }}
            C={C} isDark={isDark}
            fmtDate={fmtDate} fmtTime={fmtTime}
          />
        )}

        {/* ── Cancel confirmation modal ── */}
        {cancelTarget && (
          <CancelModal
            reservation={cancelTarget} loading={cancelling}
            onConfirm={handleCancel} onClose={() => setCancelTarget(null)} C={C}
          />
        )}

        {/* ── Toast ── */}
        {toast && (
          <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background: toast.isSuccess ? C.green : C.red, color:"#fff", fontFamily:F.body, fontSize:13, fontWeight:700, padding:"13px 24px", borderRadius:14, boxShadow:"0 8px 32px rgba(0,0,0,0.28)", zIndex:9999, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:8, animation:"slideUp 0.3s ease" }}>
            {toast.isSuccess ? "✅" : "❌"} {toast.msg}
          </div>
        )}

        <style>{`
          @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
          @keyframes spin { to{transform:rotate(360deg)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
          @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
}