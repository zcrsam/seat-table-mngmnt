// src/features/admin/pages/CancelledDashboard.jsx
import { useState, useEffect } from "react";
import AdminNavbar from "../../../components/layout/AdminNavbar";
import Sidebar from "../../../components/layout/Sidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  gold: "#8C6B2A",
  goldLight: "#A07D38",
  goldFaint: "rgba(140,107,42,0.07)",
  goldFaintest: "rgba(140,107,42,0.04)",
  pageBg: "#F7F4EE",
  surfaceBase: "#FFFFFF",
  surfaceInput: "#FFFFFF",
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
  badgeCancelled: { bg: "rgba(160,56,56,0.09)", color: "#A03838", dot: "#A03838" },
  navBg: "rgba(247,244,238,0.97)",
  navBorder: "rgba(140,107,42,0.14)",
  divider: "rgba(0,0,0,0.05)",
  inputFocusShadow: "0 0 0 3px rgba(140,107,42,0.10)",
  modalOverlay: "rgba(0,0,0,0.42)",
  headerGradient: "linear-gradient(160deg,#FAF8F4 0%,#F2EFE8 100%)",
  spinnerBorder: "rgba(0,0,0,0.12)",
  spinnerTop: "#8C6B2A",
  cardBg: "#FFFFFF",
  cardBorder: "rgba(0,0,0,0.07)",
};

const F = {
  display: "'Inter','Helvetica Neue',Arial,sans-serif",
  body:    "'Inter','Helvetica Neue',Arial,sans-serif",
  label:   "'Inter','Helvetica Neue',Arial,sans-serif",
  mono:    "'Inter','Helvetica Neue',Arial,sans-serif",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spinner({ size = 13 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `1.5px solid ${C.spinnerBorder}`,
      borderTopColor: C.spinnerTop,
      borderRadius: "50%", animation: "spin 0.65s linear infinite", flexShrink: 0,
    }} />
  );
}

function SectionLabel({ children, style = {} }) {
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

function CancelledBadge() {
  const badge = C.badgeCancelled;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px 3px 7px",
      background: badge.bg,
      border: `1px solid ${badge.color}33`,
      borderRadius: 20,
      fontFamily: F.label, fontSize: 9, fontWeight: 700,
      letterSpacing: "0.12em", textTransform: "uppercase",
      color: badge.color, flexShrink: 0,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: badge.dot, flexShrink: 0 }} />
      Cancelled
    </span>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ reservation, onClose }) {
  const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return d; }
  };
  const fmtTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };
  const fmtDateTime = (dt) => {
    if (!dt) return "—";
    try {
      return new Date(dt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "numeric", minute: "2-digit",
      });
    } catch { return dt; }
  };

  const resRows = [
    ["Reference",  reservation.reference_code || "—"],
    ["Room",       reservation.room || "—"],
    ["Table",      reservation.table_number ? `Table ${reservation.table_number}` : "—"],
    ["Seat",       (reservation.seat || reservation.seat_number) ? `Seat ${reservation.seat || reservation.seat_number}` : "—"],
    ["Guests",     (reservation.guests_count || reservation.guests) ? `${reservation.guests_count || reservation.guests} guest${(reservation.guests_count || reservation.guests) !== 1 ? "s" : ""}` : "—"],
    ["Event Date", fmtDate(reservation.event_date)],
    ["Event Time", fmtTime(reservation.event_time)],
  ];

  const guestRows = [
    ["Full Name",  reservation.name || "—"],
    ["Email",      reservation.email || "—"],
    ["Phone",      reservation.phone || "—"],
    ["Special Requests", reservation.special_requests || "None"],
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: C.modalOverlay,
        zIndex: 4000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.surfaceBase, borderRadius: 14,
        width: "100%", maxWidth: 520,
        maxHeight: "92vh",
        boxShadow: "0 24px 80px rgba(0,0,0,0.16)",
        border: `1px solid ${C.borderDefault}`,
        fontFamily: F.body,
        animation: "modalIn 0.20s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent 0%,${C.red}90 30%,${C.red}90 70%,transparent 100%)`, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          background: C.headerGradient,
          padding: "18px 22px 16px",
          borderBottom: `1px solid ${C.divider}`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ flex: 1, paddingRight: 14 }}>
            <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.22em", color: C.red, fontWeight: 700, textTransform: "uppercase", marginBottom: 5, opacity: 0.85 }}>
              Cancelled Reservation
            </div>
            <div style={{ fontFamily: F.display, fontSize: 19, fontWeight: 600, color: C.textPrimary, lineHeight: 1.2, marginBottom: 8 }}>
              {reservation.name || "—"}
            </div>
            <CancelledBadge />
          </div>
          <button onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: "50%", background: "transparent",
              border: `1px solid ${C.borderDefault}`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "border-color 0.18s", padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke={C.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 22px 24px", overflowY: "auto", flex: 1 }}>

          {/* Cancellation reason */}
          <div style={{
            padding: "14px 16px", borderRadius: 10, marginBottom: 20,
            background: C.redFaint,
            border: `1px solid ${C.redBorder}`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, marginBottom: 8,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 5,
                background: `${C.red}15`,
                border: `1px solid ${C.redBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: C.red, fontWeight: 700 }}>
                Guest's Reason for Cancellation
              </div>
            </div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.textPrimary, lineHeight: 1.65, paddingLeft: 2 }}>
              {reservation.cancellation_reason || <span style={{ color: C.textSecondary, fontStyle: "italic" }}>No reason provided</span>}
            </div>
            {reservation.cancelled_at && (
              <div style={{
                marginTop: 10, paddingTop: 10,
                borderTop: `1px solid ${C.redBorder}`,
                fontFamily: F.label, fontSize: 9, letterSpacing: "0.10em",
                textTransform: "uppercase", color: C.textTertiary, fontWeight: 700,
              }}>
                Cancelled on: <span style={{ color: C.textSecondary, fontWeight: 500 }}>{fmtDateTime(reservation.cancelled_at)}</span>
              </div>
            )}
          </div>

          <SectionLabel>Reservation Details</SectionLabel>
          {resRows.map(([label, value], i, arr) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "8px 0",
              borderBottom: i < arr.length - 1 ? `1px solid ${C.divider}` : "none",
            }}>
              <span style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textTertiary, minWidth: 100, flexShrink: 0 }}>{label}</span>
              <span style={{ fontFamily: F.body, fontSize: 12.5, color: label === "Reference" ? C.gold : C.textPrimary, fontWeight: label === "Reference" ? 700 : 500, textAlign: "right", maxWidth: 280, lineHeight: 1.5, letterSpacing: label === "Reference" ? "0.06em" : "normal" }}>{value}</span>
            </div>
          ))}

          <SectionLabel style={{ marginTop: 18 }}>Guest Information</SectionLabel>
          {guestRows.map(([label, value], i, arr) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "8px 0",
              borderBottom: i < arr.length - 1 ? `1px solid ${C.divider}` : "none",
            }}>
              <span style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textTertiary, minWidth: 100, flexShrink: 0 }}>{label}</span>
              <span style={{ fontFamily: F.body, fontSize: 12.5, color: C.textPrimary, fontWeight: 500, textAlign: "right", maxWidth: 280, lineHeight: 1.5 }}>{value}</span>
            </div>
          ))}

          <div style={{
            marginTop: 18, padding: "10px 14px", borderRadius: 8,
            background: C.redFaint,
            border: `1px solid ${C.redBorder}`,
            fontFamily: F.body, fontSize: 12, color: C.textSecondary, lineHeight: 1.6,
          }}>
            This reservation was <strong style={{ color: C.textPrimary }}>cancelled by the guest</strong> and cannot be modified from here. Contact the guest directly if you need to reinstate this booking.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  const isSuccess = type === "success";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px",
      background: C.surfaceBase,
      border: `1px solid ${isSuccess ? C.greenBorder : C.redBorder}`,
      borderRadius: 10,
      boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
      fontFamily: F.body, fontSize: 13,
      animation: "fadeUp 0.22s ease",
      maxWidth: 400,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: isSuccess ? C.green : C.red, flexShrink: 0 }} />
      <span style={{ color: C.textPrimary, flex: 1, lineHeight: 1.5 }}>{message}</span>
      <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: C.textSecondary }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CancelledDashboard() {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 960;

  // ── Load cancelled reservations ───────────────────────────────────────────
  const loadReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reservations?status=cancelled&per_page=500`, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data :
        Array.isArray(data.data) ? data.data :
        Array.isArray(data.reservations) ? data.reservations : [];

      // Include explicit cancelled statuses and guest-cancelled records saved as rejected
      const cancelled = list.filter((r) => {
        const status = (r.status || "").toLowerCase();
        const hasCancellationMeta = Boolean(r.cancelled_at || r.cancellation_reason);
        return ["cancelled", "canceled"].includes(status) || (status === "rejected" && hasCancellationMeta);
      });
      setReservations(cancelled);

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const todayCount = cancelled.filter(r => {
        if (!r.cancelled_at) return false;
        return new Date(r.cancelled_at).toISOString().split("T")[0] === todayStr;
      }).length;
      const weekCount = cancelled.filter(r => {
        if (!r.cancelled_at) return false;
        return new Date(r.cancelled_at) >= weekAgo;
      }).length;
      setStats({ total: cancelled.length, today: todayCount, thisWeek: weekCount });
    } catch (e) {
      console.error("[CancelledDashboard] Failed to load:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReservations(); }, []);

  // ── Filter ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = reservations;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.reference_code?.toLowerCase().includes(q) ||
        r.cancellation_reason?.toLowerCase().includes(q)
      );
    }
    setFilteredReservations(filtered);
    setPagination(p => ({ ...p, lastPage: Math.ceil(filtered.length / 10) || 1, totalItems: filtered.length, currentPage: 1 }));
  }, [reservations, search]);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.lastPage) return;
    setPagination(p => ({ ...p, currentPage: page }));
  };

  const getPageNumbers = () => {
    const { currentPage, lastPage } = pagination;
    if (lastPage <= 5) return Array.from({ length: lastPage }, (_, i) => i + 1);
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(lastPage, currentPage + 1);
    const pages = [];
    if (start > 1) { pages.push(1); if (start > 2) pages.push("..."); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < lastPage) { if (end < lastPage - 1) pages.push("..."); pages.push(lastPage); }
    return pages;
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return d; }
  };
  const fmtDateTime = (dt) => {
    if (!dt) return "—";
    try {
      return new Date(dt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit",
      });
    } catch { return dt; }
  };

  const pagedReservations = filteredReservations.slice(
    (pagination.currentPage - 1) * 10,
    pagination.currentPage * 10
  );

  const statCards = [
    { label: "Total Cancelled", count: stats.total,    icon: "total" },
    { label: "Cancelled Today", count: stats.today,    icon: "today" },
    { label: "This Week",       count: stats.thisWeek, icon: "week"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
      `}</style>

      <div style={{ minHeight: "100vh", fontFamily: F.body, background: C.pageBg, color: C.textPrimary }}>
        <AdminNavbar />

        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            activeNav="cancelled"
          />

          <div style={{ flex: 1, minWidth: 0, height: "calc(100vh - 60px)", background: C.pageBg, overflow: "auto" }}>

            {/* Top bar */}
            <div style={{
              position: "sticky", top: 0, zIndex: 100,
              background: C.navBg,
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              borderBottom: `1px solid ${C.navBorder}`,
              padding: isMobile ? "10px 16px" : "0 28px",
              height: isMobile ? "auto" : 52,
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              gap: 10, flexWrap: isMobile ? "wrap" : "nowrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em", color: C.red, fontWeight: 700, textTransform: "uppercase" }}>Admin</span>
                <span style={{ color: C.textTertiary, fontSize: 11 }}>·</span>
                <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.14em", color: C.textSecondary, fontWeight: 600, textTransform: "uppercase" }}>Cancelled Reservations</span>
              </div>

              {/* Right side: refresh button + search */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={loadReservations}
                  disabled={loading}
                  title="Refresh"
                  style={{
                    width: 32, height: 32, borderRadius: 7,
                    background: "transparent",
                    border: `1px solid ${C.borderDefault}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "border-color 0.18s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.borderColor = C.borderAccent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; }}
                >
                  {loading
                    ? <Spinner size={12} />
                    : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                    )
                  }
                </button>

                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke={searchFocused ? C.red : C.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    style={{
                      padding: "7px 12px 7px 28px",
                      background: C.surfaceInput,
                      border: `1.5px solid ${searchFocused ? C.redBorder : C.borderDefault}`,
                      borderRadius: 8, color: C.textPrimary,
                      fontFamily: F.body, fontSize: 12,
                      width: isMobile ? "100%" : 240, outline: "none",
                      transition: "border-color 0.18s,box-shadow 0.18s",
                      boxShadow: searchFocused ? `0 0 0 3px rgba(160,56,56,0.09)` : "none",
                    }}
                    placeholder="Search name, email, ref, reason…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{
              padding: isMobile ? "20px 16px" : isTablet ? "24px 20px" : "28px 32px",
              animation: "fadeUp 0.28s ease",
            }}>

              {/* Heading */}
              <div style={{ marginBottom: isMobile ? 18 : 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ display: "inline-block", width: 22, height: "1px", background: C.red, opacity: 0.5 }} />
                  <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.26em", color: C.red, fontWeight: 700, textTransform: "uppercase" }}>Dashboard</span>
                </div>
                <h1 style={{ fontFamily: F.display, fontSize: isMobile ? 22 : isTablet ? 28 : 34, fontWeight: 700, color: C.textPrimary, lineHeight: 1.15, margin: "0 0 6px" }}>
                  Cancelled Reservations
                </h1>
                <p style={{ fontFamily: F.body, fontSize: 13, color: C.textSecondary, margin: 0, lineHeight: 1.65 }}>
                  Reservations cancelled by guests — review cancellation reasons below
                </p>
              </div>

              {/* Stat cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)",
                gap: isMobile ? 10 : 12,
                marginBottom: isMobile ? 18 : 22,
              }}>
                {statCards.map(({ label, count }) => (
                  <div key={label} style={{
                    background: C.cardBg,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 10,
                    padding: isMobile ? "14px 12px" : "18px 20px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 2,
                      background: `linear-gradient(90deg, transparent 0%, ${C.red}60 50%, transparent 100%)`,
                    }} />
                    <div style={{
                      fontFamily: F.display,
                      fontSize: isMobile ? 28 : 36,
                      fontWeight: 700, color: C.red,
                      lineHeight: 1, marginBottom: isMobile ? 6 : 8,
                      letterSpacing: "-0.02em",
                    }}>
                      {loading ? "—" : count}
                    </div>
                    <div style={{ fontFamily: F.label, fontSize: 9, color: C.textTertiary, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table card */}
              <div style={{ background: C.cardBg, borderRadius: 12, border: `1px solid ${C.cardBorder}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>

                {/* Card header */}
                <div style={{
                  padding: isMobile ? "12px 14px" : "14px 22px",
                  borderBottom: `1px solid ${C.divider}`,
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: isMobile ? "wrap" : "nowrap",
                  gap: 10,
                  background: C.headerGradient,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontFamily: F.label, fontSize: 9, letterSpacing: "0.20em", color: C.red, fontWeight: 700, textTransform: "uppercase" }}>Cancelled</div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      padding: "2px 8px",
                      background: C.redFaint,
                      border: `1px solid ${C.redBorder}`,
                      borderRadius: 20,
                      fontFamily: F.label, fontSize: 9, fontWeight: 700, color: C.red, letterSpacing: "0.10em",
                    }}>
                      {loading ? "—" : filteredReservations.length}
                    </span>
                  </div>

                  {pagination.lastPage > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                      <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}
                        style={{ width: 29, height: 29, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.borderDefault}`, borderRadius: 6, background: "transparent", color: pagination.currentPage <= 1 ? C.textTertiary : C.textSecondary, cursor: pagination.currentPage <= 1 ? "not-allowed" : "pointer", fontSize: 14, transition: "all 0.15s", fontFamily: F.body }}
                      >‹</button>
                      {getPageNumbers().map((p, idx) =>
                        p === "..." ? (
                          <span key={`e-${idx}`} style={{ width: 29, height: 29, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.textTertiary }}>…</span>
                        ) : (
                          <button key={p} onClick={() => handlePageChange(p)}
                            style={{ width: 29, height: 29, display: "flex", alignItems: "center", justifyContent: "center", border: pagination.currentPage === p ? `1px solid ${C.red}` : `1px solid ${C.borderDefault}`, borderRadius: 6, background: pagination.currentPage === p ? C.red : "transparent", color: pagination.currentPage === p ? "#fff" : C.textSecondary, cursor: "pointer", fontSize: 11, fontWeight: pagination.currentPage === p ? 700 : 400, fontFamily: F.label, transition: "all 0.15s" }}
                          >{p}</button>
                        )
                      )}
                      <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.lastPage}
                        style={{ width: 29, height: 29, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.borderDefault}`, borderRadius: 6, background: "transparent", color: pagination.currentPage >= pagination.lastPage ? C.textTertiary : C.textSecondary, cursor: pagination.currentPage >= pagination.lastPage ? "not-allowed" : "pointer", fontSize: 14, transition: "all 0.15s", fontFamily: F.body }}
                      >›</button>
                    </div>
                  )}
                </div>

                {/* List */}
                <div style={{ padding: isMobile ? "10px" : "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ height: 90, borderRadius: 8, background: "linear-gradient(90deg,#F0EDE6 25%,#E8E4DC 50%,#F0EDE6 75%)", backgroundSize: "200% 100%", animation: `shimmer 1.4s ease infinite`, animationDelay: `${i * 0.08}s`, border: `1px solid rgba(0,0,0,0.04)` }} />
                    ))
                  ) : pagedReservations.length === 0 ? (
                    <div style={{ padding: "60px 24px", textAlign: "center" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: C.redFaint, border: `1px solid ${C.redBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 14px",
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                      </div>
                      <div style={{ fontFamily: F.label, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: C.textSecondary, textTransform: "uppercase" }}>
                        {search ? "No Results Found" : "No Cancelled Reservations"}
                      </div>
                      <div style={{ fontFamily: F.body, fontSize: 12, color: C.textTertiary, marginTop: 6 }}>
                        {search ? "Try adjusting your search" : "There are no guest-cancelled reservations yet"}
                      </div>
                    </div>
                  ) : (
                    pagedReservations.map((reservation, idx) => (
                      <div
                        key={reservation.id || idx}
                        onClick={() => { setSelectedReservation(reservation); setShowModal(true); }}
                        style={{
                          background: C.surfaceBase,
                          border: `1px solid ${C.borderDefault}`,
                          borderRadius: 8,
                          padding: isMobile ? "12px" : "14px 18px",
                          cursor: "pointer",
                          transition: "all 0.16s ease",
                          animation: `fadeUp 0.22s ease both`,
                          animationDelay: `${idx * 0.025}s`,
                          position: "relative", overflow: "hidden",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.redBorder; e.currentTarget.style.boxShadow = `0 3px 12px rgba(160,56,56,0.09)`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: C.red, opacity: 0.35, borderRadius: "0 2px 2px 0" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                          <div style={{ flex: 1, minWidth: 0, paddingLeft: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                              <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{reservation.name || "—"}</div>
                              {reservation.reference_code && (
                                <span style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: C.gold, padding: "2px 6px", background: C.goldFaint, border: `1px solid rgba(140,107,42,0.15)`, borderRadius: 4, flexShrink: 0 }}>
                                  {reservation.reference_code}
                                </span>
                              )}
                            </div>
                            <div style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, marginBottom: 6, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                              <span>{reservation.email || "—"}</span>
                              {reservation.phone && <><span style={{ color: C.textTertiary }}>·</span><span>{reservation.phone}</span></>}
                            </div>

                            {/* Cancellation reason preview */}
                            {reservation.cancellation_reason && (
                              <div style={{
                                display: "flex", alignItems: "flex-start", gap: 6,
                                padding: "7px 10px", borderRadius: 6,
                                background: C.redFaint, border: `1px solid ${C.redBorder}`,
                                marginBottom: 6,
                              }}>
                                <svg style={{ flexShrink: 0, marginTop: 1 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span style={{
                                  fontFamily: F.body, fontSize: 11.5, color: C.red,
                                  lineHeight: 1.5,
                                  display: "-webkit-box", WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical", overflow: "hidden",
                                }}>
                                  {reservation.cancellation_reason}
                                </span>
                              </div>
                            )}

                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              {reservation.event_date && (
                                <span style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.textTertiary, padding: "2px 6px", background: "rgba(0,0,0,0.04)", border: `1px solid rgba(0,0,0,0.06)`, borderRadius: 4 }}>
                                  Event: {fmtDate(reservation.event_date)}
                                </span>
                              )}
                              {reservation.cancelled_at && (
                                <span style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.red, opacity: 0.7, padding: "2px 6px", background: C.redFaint, border: `1px solid ${C.redBorder}`, borderRadius: 4 }}>
                                  Cancelled: {fmtDateTime(reservation.cancelled_at)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7, flexShrink: 0 }}>
                            <CancelledBadge />
                            <div style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.textTertiary }}>
                              View
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {!loading && filteredReservations.length > 0 && (
                  <div style={{ padding: "10px 18px", borderTop: `1px solid ${C.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontFamily: F.body, fontSize: 11, color: C.textTertiary }}>
                      Showing <strong style={{ color: C.textSecondary }}>{(pagination.currentPage - 1) * 10 + 1}–{Math.min(pagination.currentPage * 10, filteredReservations.length)}</strong> of <strong style={{ color: C.textSecondary }}>{filteredReservations.length}</strong> cancelled reservations
                    </div>
                    {search && (
                      <div style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textTertiary }}>
                        Search: <span style={{ color: C.red }}>{search}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {showModal && selectedReservation && (
          <DetailModal
            reservation={selectedReservation}
            onClose={() => { setShowModal(false); setSelectedReservation(null); }}
          />
        )}
      </div>
    </>
  );
}