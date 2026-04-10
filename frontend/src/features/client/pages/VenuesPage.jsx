import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SharedNavbar from "../../../components/SharedNavbar.jsx";

// ─────────────────────────────────────────────
// THEME HOOK
// ─────────────────────────────────────────────
function useThemeMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("bellevue-theme");
      if (saved !== null) return saved === "dark";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      try { localStorage.setItem("bellevue-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  };

  return { isDark, toggle };
}

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
function getTokens(isDark) {
  return isDark ? {
    gold:         "#C9A84C",
    goldLight:    "#E2C96A",
    goldDim:      "#A07828",
    goldFaint:    "rgba(201,168,76,0.08)",
    goldBorder:   "rgba(201,168,76,0.20)",
    pageBg:       "#111009",
    cardBg:       "#1C1A14",
    cardBgHov:    "#221F17",
    text:         "#F0E8D0",
    textSub:      "#C8B880",
    textMuted:    "#7A6E58",
    border:       "rgba(201,168,76,0.14)",
    borderHov:    "rgba(201,168,76,0.38)",
    navBg:        "rgba(10,9,6,0.88)",
    navBorder:    "rgba(201,168,76,0.12)",
    surface:      "#1C1A14",
    surfaceEl:    "#211F18",
    modalBg:      "#18160F",
    divider:      "rgba(201,168,76,0.10)",
    shadow:       "0 2px 20px rgba(0,0,0,0.45)",
    shadowHov:    "0 20px 56px rgba(0,0,0,0.60)",
    tagBg:        "rgba(201,168,76,0.10)",
    overlayBg:    "rgba(6,5,3,0.78)",
    // ellipsis button specific
    dotsBg:       "#2A2720",
    dotsBorder:   "#C9A84C",
    dotsColor:    "#C9A84C",
    dotsBgHov:    "rgba(201,168,76,0.18)",
  } : {
    gold:         "#9A6E1C",
    goldLight:    "#C49A2C",
    goldDim:      "#7A5814",
    goldFaint:    "rgba(154,110,28,0.07)",
    goldBorder:   "rgba(154,110,28,0.18)",
    pageBg:       "#F4EFE4",
    cardBg:       "#FFFFFF",
    cardBgHov:    "#FDFAF4",
    text:         "#1A1510",
    textSub:      "#6A5830",
    textMuted:    "#9A8C6E",
    border:       "rgba(154,110,28,0.12)",
    borderHov:    "rgba(154,110,28,0.38)",
    navBg:        "rgba(244,239,228,0.92)",
    navBorder:    "rgba(154,110,28,0.14)",
    surface:      "#FFFFFF",
    surfaceEl:    "#F9F6EF",
    modalBg:      "#FFFFFF",
    divider:      "rgba(154,110,28,0.10)",
    shadow:       "0 2px 20px rgba(100,80,30,0.10)",
    shadowHov:    "0 20px 56px rgba(100,80,30,0.18)",
    tagBg:        "rgba(154,110,28,0.08)",
    overlayBg:    "rgba(20,16,8,0.55)",
    // ellipsis button specific
    dotsBg:       "#F0EBE0",
    dotsBorder:   "#9A6E1C",
    dotsColor:    "#9A6E1C",
    dotsBgHov:    "rgba(154,110,28,0.14)",
  };
}

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const SECTION_IDS = {
  "Main Wing":  "section-main-wing",
  "Tower Wing": "section-tower-wing",
  "Dining":     "section-dining",
};

// ─────────────────────────────────────────────
// RESPONSIVE HOOK
// ─────────────────────────────────────────────
function useResponsive() {
  const [s, setS] = useState({ isMobile: false });
  useEffect(() => {
    const check = () => setS({ isMobile: window.innerWidth < 768 });
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return s;
}

// ─────────────────────────────────────────────
// STATIC VENUE DATA — descriptions & highlights
// Images and identity stay static; seats/tables get overridden by API
// ─────────────────────────────────────────────
import alabangImg        from "../../../assets/afc.jpeg";
import lagunaImg         from "../../../assets/laguna.jpeg";
import twentyTwentyImg   from "../../../assets/20-20.jpeg";
import businessCenterImg from "../../../assets/bc.jpeg";
import towerBallroomImg  from "../../../assets/towerb.jpeg";
import grandBallroomImg  from "../../../assets/grandr.jpg";
import qsinaImg          from "../../../assets/qsina.jpeg";
import hanakazuImg       from "../../../assets/hanakazu.jpeg";
import phoenixCourtImg   from "../../../assets/phoenix-court.jpeg";

// Each entry carries static fallback values for seats/tables that get
// replaced by live API data once it loads.
const STATIC_VENUES = {
  "Main Wing": [
    {
      id: "alabang",
      name: "Alabang Function Room",
      img: alabangImg,
      seats: 150,
      tables: 14,
      rooms: [],
      description: "The Alabang Function Room is an elegantly appointed venue ideal for intimate corporate events, private dinners, and social gatherings. Featuring refined interiors and flexible seating configurations, it offers a warm yet professional atmosphere suited to discerning guests.",
      // which room names in the seat-map data map to this venue
      seatMapKeys: ["Alabang Function Room"],
    },
    {
      id: "laguna",
      name: "Laguna Ballroom",
      img: lagunaImg,
      seats: 250,
      tables: 11,
      rooms: ["Laguna 1", "Laguna 2"],
      description: "The Laguna Ballroom is a premier event space combining timeless elegance with modern functionality. Its grand proportions and tasteful décor make it a favored choice for weddings, gala evenings, and corporate celebrations.",
      seatMapKeys: ["Laguna Ballroom", "Laguna 1", "Laguna 2"],
    },
    {
      id: "20-20",
      name: "20/20 Function Room",
      img: twentyTwentyImg,
      seats: 120,
      tables: 12,
      rooms: ["20/20 A", "20/20 B", "20/20 C"],
      description: "A versatile multi-use function room with a contemporary aesthetic, the 20/20 offers three configurable sub-sections suited to seminars, product launches, and board meetings.",
     seatMapKeys: ["20/20 Function Room", "20/20 Function Room A", "20/20 Function Room B", "20/20 Function Room C"],
    },
    {
      id: "business-center",
      name: "Business Center",
      img: businessCenterImg,
      seats: 80,
      tables: 10,
      rooms: [],
      description: "The Business Center is a purpose-built executive venue designed for high-level conferences, board meetings, and corporate workshops.",
      seatMapKeys: ["Business Center"],
    },
  ],
  "Tower Wing": [
    {
      id: "tower-ballroom",
      name: "Tower Ballroom",
      img: towerBallroomImg,
      seats: 300,
      tables: 15,
      rooms: ["Tower 1", "Tower 2", "Tower 3"],
      description: "Rising above the city, the Tower Ballroom is a signature event destination offering sweeping panoramic views and refined grandeur.",
      seatMapKeys: ["Tower Ballroom", "Tower 1", "Tower 2", "Tower 3"],
    },
    {
      id: "grand-ballroom",
      name: "Grand Ballroom",
      img: grandBallroomImg,
      seats: 400,
      tables: 20,
      rooms: ["Grand A", "Grand B", "Grand C"],
      description: "The Grand Ballroom is Bellevue Manila's most prestigious event space — a sweeping venue of exceptional scale and elegance.",
      seatMapKeys: ["Grand Ballroom", "Grand A", "Grand B", "Grand C"],
    },
  ],
  "Dining": [
    {
      id: "qsina",
      name: "Qsina",
      img: qsinaImg,
      seats: 120,
      tables: 12,
      rooms: [],
      description: "Qsina is Bellevue Manila's celebrated all-day dining restaurant, offering an elevated international buffet experience complemented by live cooking stations.",
      seatMapKeys: ["Qsina"],
    },
    {
      id: "hanakazu",
      name: "Hanakazu",
      img: hanakazuImg,
      seats: 80,
      tables: 10,
      rooms: [],
      description: "Hanakazu is Bellevue Manila's Japanese specialty restaurant, offering an authentic izakaya and kaiseki dining experience.",
      seatMapKeys: ["Hanakazu"],
    },
    {
      id: "phoenix-court",
      name: "Phoenix Court",
      img: phoenixCourtImg,
      seats: 140,
      tables: 16,
      rooms: [],
      description: "Phoenix Court is Bellevue Manila's distinguished Chinese restaurant, renowned for its masterfully prepared Cantonese dishes and traditional dim sum.",
      seatMapKeys: ["Phoenix Court"],
    },
  ],
};

// ─────────────────────────────────────────────
// SEAT MAP STORAGE KEY HELPERS (mirrors Dashboard logic)
// ─────────────────────────────────────────────
const WING_FOR_ROOM = {};
Object.entries({
  "Main Wing":  ["Alabang Function Room", "Laguna Ballroom", "Laguna 1", "Laguna 2", "20/20 Function Room", "20/20 Function Room A", "20/20 Function Room B", "20/20 Function Room C", "Business Center"],
  "Tower Wing": ["Tower Ballroom", "Tower 1", "Tower 2", "Tower 3", "Grand Ballroom", "Grand A", "Grand B", "Grand C"],
  "Dining":     ["Qsina", "Hanakazu", "Phoenix Court"],
}).forEach(([wing, rooms]) => rooms.forEach(r => { WING_FOR_ROOM[r] = wing; }));

/**
 * Reads seat-map data from localStorage for a given wing+room key,
 * then returns { seats: number, tables: number } counted from saved layout.
 * Returns null if no saved data exists.
 */
function readSeatMapCounts(wing, room) {
  try {
    const raw = localStorage.getItem(`seatmap:${wing}:${room}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const tableArr = Array.isArray(parsed) ? parsed : [parsed];
    const validTables = tableArr.filter(t => t && Array.isArray(t.seats) && t.seats.length > 0);
    const totalSeats  = validTables.reduce((sum, t) => sum + t.seats.length, 0);
    return { seats: totalSeats, tables: validTables.length };
  } catch {
    return null;
  }
}

/**
 * For a venue, aggregate seat/table counts across all its seatMapKeys.
 * Picks the key with the most data as the "canonical" count,
 * then sums sub-rooms if the venue is divisible.
 */
function aggregateCounts(venue) {
  const keys = venue.seatMapKeys || [];
  let totalSeats = 0, totalTables = 0, found = false;

  // First try the primary key (first in list, usually the parent room name)
  const primary = readSeatMapCounts(WING_FOR_ROOM[keys[0]], keys[0]);
  if (primary) {
    totalSeats  = primary.seats;
    totalTables = primary.tables;
    found = true;
  }

  // Then try sub-rooms — if they have data and primary didn't, use sub-room sum
  if (!found || totalSeats === 0) {
    let subSeats = 0, subTables = 0, subFound = false;
    for (let i = 1; i < keys.length; i++) {
      const c = readSeatMapCounts(WING_FOR_ROOM[keys[i]], keys[i]);
      if (c) { subSeats += c.seats; subTables += c.tables; subFound = true; }
    }
    if (subFound && subSeats > totalSeats) {
      totalSeats  = subSeats;
      totalTables = subTables;
      found = true;
    }
  }

  return found ? { seats: totalSeats, tables: totalTables } : null;
}

// ─────────────────────────────────────────────
// API: fetch reservation stats per venue
// Counts approved/reserved bookings to show available vs reserved seats
// ─────────────────────────────────────────────
async function fetchVenueStats() {
  try {
    const res  = await fetch(`${API_BASE}/reservations?per_page=500&page=1`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const list = Array.isArray(json) ? json
      : Array.isArray(json.data)         ? json.data
      : Array.isArray(json.reservations) ? json.reservations
      : [];

    // Build a map: venue/room name → { reserved, pending }
    const stats = {};
    list.forEach(r => {
      const room   = r.room || r.venue || "";
      const status = (r.status || "").toLowerCase();
      if (!room) return;
      if (!stats[room]) stats[room] = { reserved: 0, pending: 0, total: 0 };
      stats[room].total++;
      if (status === "reserved" || status === "approved") stats[room].reserved++;
      if (status === "pending")  stats[room].pending++;
    });
    return stats;
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────
// BACK BUTTON
// ─────────────────────────────────────────────
function BackButton({ onClick, C }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label="Go back"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 52, height: 52, borderRadius: "50%",
        background: "transparent",
        border: `1px solid ${hov ? C.gold : C.textMuted}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        transition: "border-color 0.3s, transform 0.3s",
        transform: hov ? "scale(1.06)" : "scale(1)",
        padding: 0, flexShrink: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={hov ? C.gold : C.textMuted} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: "stroke 0.3s", display: "block" }}>
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────
// SUB-ROOM DROPDOWN
// ─────────────────────────────────────────────
function RoomDropdown({ rooms, venueId, onRoomClick, C }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px 5px 10px", borderRadius: 4,
          background: open ? C.goldFaint : "transparent",
          border: `1px solid ${open ? C.gold : C.goldBorder}`,
          fontSize: 11, fontWeight: 600,
          color: open ? C.gold : C.textMuted,
          cursor: "pointer", transition: "all 0.18s",
          fontFamily: FONT, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = C.goldFaint; e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.gold; }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.goldBorder; } }}
      >
        <span>Sub-rooms ({rooms.length})</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 5px)", left: 0, zIndex: 999,
          background: C.surface, border: `1px solid ${C.goldBorder}`,
          borderRadius: 6, boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          minWidth: 172, overflow: "hidden",
        }}>
          {rooms.filter(r => r && typeof r === "string" && r.trim() !== "").map((r, i) => {
            const roomId = `${venueId}__${String(r).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            return (
              <button key={r} type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); onRoomClick(roomId); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "10px 14px",
                  background: "transparent", border: "none",
                  borderTop: i === 0 ? "none" : `1px solid ${C.divider}`,
                  textAlign: "left", fontSize: 13, color: C.text,
                  cursor: "pointer", fontFamily: FONT, fontWeight: 400, transition: "background 0.12s, color 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.goldFaint; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.text; }}
              >
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.goldDim, flexShrink: 0 }} />
                {r}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// VENUE DETAIL MODAL
// ─────────────────────────────────────────────
function VenueModal({ venue, onClose, onReserve, C, isDark }) {
  const { isMobile } = useResponsive();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const liveCounts = aggregateCounts(venue);
  const displaySeats  = liveCounts?.seats  ?? venue.seats;
  const displayTables = liveCounts?.tables ?? venue.tables;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: C.overlayBg,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "16px" : "32px",
        animation: "bvFadeIn 0.22s ease",
      }}
    >
      <style>{`
        @keyframes bvFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes bvSlideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.modalBg,
          border: `1px solid ${C.goldBorder}`,
          borderRadius: 14,
          width: "100%", maxWidth: 680,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.72)" : "0 32px 80px rgba(80,60,10,0.24)",
          animation: "bvSlideUp 0.30s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      >
        {/* Hero image */}
        <div style={{ height: isMobile ? 200 : 260, position: "relative", flexShrink: 0, overflow: "hidden" }}>
          <img src={venue.img} alt={venue.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.70) 100%)" }} />

          {/* Close btn */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(0,0,0,0.42)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.16)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0, transition: "background 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.72)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.42)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Venue name */}
          <div style={{ position: "absolute", bottom: 20, left: 24, right: 60 }}>
            <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.20em", textTransform: "uppercase", margin: "0 0 6px 0" }}>
              Venue Details
            </p>
            <h2 style={{ fontFamily: FONT, fontSize: isMobile ? 20 : 26, fontWeight: 700, color: "#FFFFFF", margin: 0, lineHeight: 1.15, letterSpacing: "-0.3px" }}>
              {venue.name}
            </h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", padding: isMobile ? "22px 20px 28px" : "28px 32px 36px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Stats row — uses live counts */}
          <div style={{ display: "flex", gap: 0, border: `1px solid ${C.divider}`, borderRadius: 8, overflow: "hidden" }}>
            {[
              { label: "Capacity",  value: displaySeats > 0  ? `${displaySeats} guests`  : `${venue.seats} guests` },
              { label: "Tables",    value: displayTables > 0 ? `${displayTables} tables` : `${venue.tables} tables` },
              { label: "Sub-rooms", value: venue.rooms.length > 0 ? `${venue.rooms.length} available` : "Open hall" },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                flex: 1, padding: "14px 16px",
                borderLeft: i === 0 ? "none" : `1px solid ${C.divider}`,
                background: C.surfaceEl,
              }}>
                <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 4px 0" }}>
                  {stat.label}
                </p>
                <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Availability pill — if we have reservation stats */}
          {venue._stats && (venue._stats.reserved > 0 || venue._stats.pending > 0) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {venue._stats.reserved > 0 && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 12px",
                  background: "rgba(184,92,92,0.10)",
                  border: "1px solid rgba(184,92,92,0.25)",
                  borderRadius: 4,
                  fontFamily: FONT, fontSize: 11, fontWeight: 600, color: "#C07070",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C07070" }} />
                  {venue._stats.reserved} seats reserved
                </span>
              )}
              {venue._stats.pending > 0 && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 12px",
                  background: "rgba(201,168,76,0.10)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: 4,
                  fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.gold,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
                  {venue._stats.pending} pending approval
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 10px 0" }}>
              About this space
            </p>
            <p style={{ fontFamily: FONT, fontSize: 14, color: C.textSub, lineHeight: 1.82, margin: 0, fontWeight: 400 }}>
              {venue.description}
            </p>
          </div>

          {/* Highlights */}
          {venue.highlights && venue.highlights.length > 0 && (
            <div>
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 12px 0" }}>
                Highlights
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {venue.highlights.map((h) => (
                  <span key={h} style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "6px 12px",
                    background: C.goldFaint,
                    border: `1px solid ${C.goldBorder}`,
                    borderRadius: 4,
                    fontFamily: FONT, fontSize: 12, fontWeight: 500, color: C.textSub,
                  }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sub-rooms list */}
          {venue.rooms && venue.rooms.length > 0 && (
            <div>
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 12px 0" }}>
                Available Sub-rooms
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {venue.rooms.map((r) => (
                  <span key={r} style={{
                    padding: "5px 12px",
                    background: "transparent",
                    border: `1px solid ${C.goldBorder}`,
                    borderRadius: 4,
                    fontFamily: FONT, fontSize: 12, fontWeight: 500, color: C.textMuted,
                  }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: C.divider }} />

          {/* Reserve CTA */}
          <button
            type="button"
            onClick={() => { onClose(); onReserve(venue.id); }}
            style={{
              width: "100%", padding: "14px 20px",
              background: C.gold, color: "#FFFFFF",
              border: "none", borderRadius: 8,
              cursor: "pointer", fontWeight: 600, fontSize: 12,
              fontFamily: FONT, letterSpacing: "0.14em", textTransform: "uppercase",
              transition: "background 0.18s, transform 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.gold; e.currentTarget.style.transform = "scale(1)"; }}
          >
            Reserve this Space
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VENUE CARD
// ─────────────────────────────────────────────
function VenueCard({ venue, onClick, onDetails, C }) {
  const [hov, setHov] = useState(false);
  const [dotsHov, setDotsHov] = useState(false);

  // Use live counts from seatmap if available, fall back to static
  const liveCounts = aggregateCounts(venue);
  const displaySeats  = liveCounts?.seats  ?? venue.seats;
  const displayTables = liveCounts?.tables ?? venue.tables;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 10, overflow: "hidden",
        background: C.cardBg,
        border: `1px solid ${hov ? C.borderHov : C.border}`,
        boxShadow: hov ? C.shadowHov : C.shadow,
        transition: "box-shadow 0.32s, border-color 0.32s, transform 0.32s",
        transform: hov ? "translateY(-5px)" : "translateY(0)",
        display: "flex", flexDirection: "column", height: "100%",
      }}
    >
      {/* Image */}
      <div
        onClick={() => onClick(venue.id)}
        style={{ height: 210, position: "relative", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}
      >
        <img
          src={venue.img} alt={venue.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
            transform: hov ? "scale(1.06)" : "scale(1)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.72) 100%)" }} />

        {/* Capacity badge — top right on image */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(0,0,0,0.56)",
          backdropFilter: "blur(6px)",
          border: `1px solid rgba(201,168,76,0.35)`,
          borderRadius: 5,
          padding: "4px 9px",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: "#E8D898", letterSpacing: "0.06em" }}>
            {displaySeats > 0 ? displaySeats : venue.seats}
          </span>
        </div>

        <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
          <p style={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, color: "#FFFFFF", margin: 0, lineHeight: 1.25, letterSpacing: "-0.2px" }}>
            {venue.name}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>

        {/* Live stats row */}
        <div style={{ display: "flex", gap: 0, border: `1px solid ${C.divider}`, borderRadius: 6, overflow: "hidden" }}>
          {[
            { label: "Seats",  value: displaySeats  > 0 ? displaySeats  : venue.seats  },
            { label: "Tables", value: displayTables > 0 ? displayTables : venue.tables },
            ...(venue.rooms.length > 0 ? [{ label: "Rooms", value: venue.rooms.length }] : []),
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, padding: "8px 10px",
              borderLeft: i === 0 ? "none" : `1px solid ${C.divider}`,
              background: C.surfaceEl,
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {venue.rooms && Array.isArray(venue.rooms) && venue.rooms.length > 0 && (
          <RoomDropdown rooms={venue.rooms} venueId={venue.id} onRoomClick={onClick} C={C} />
        )}

        <div style={{ height: 1, background: C.divider }} />

        {/* CTA row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(venue.id); }}
            style={{
              flex: 1, padding: "10px 14px",
              background: C.gold, color: "#FFFFFF",
              border: "none", borderRadius: 6,
              cursor: "pointer", fontWeight: 600, fontSize: 12,
              fontFamily: FONT, letterSpacing: "0.10em", textTransform: "uppercase",
              transition: "background 0.18s, transform 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.gold; e.currentTarget.style.transform = "scale(1)"; }}
          >
            View & Reserve
          </button>

          {/* ··· Details button — high-contrast, always visible */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDetails(venue); }}
            title="View venue details"
            onMouseEnter={() => setDotsHov(true)}
            onMouseLeave={() => setDotsHov(false)}
            style={{
              width: 40, height: 40, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: dotsHov ? C.dotsBgHov : C.dotsBg,
              border: `1.5px solid ${C.dotsBorder}`,
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.20s",
            }}
          >
            {/* Three horizontal dots using SVG — guaranteed visible */}
            <svg
              width="18"
              height="4"
              viewBox="0 0 18 4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block", flexShrink: 0 }}
            >
              <circle cx="2"  cy="2" r="2" fill={C.dotsColor} />
              <circle cx="9"  cy="2" r="2" fill={C.dotsColor} />
              <circle cx="16" cy="2" r="2" fill={C.dotsColor} />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader({ title, subtitle, index, C }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.22em", textTransform: "uppercase" }}>
          {String(index).padStart(2, "0")}
        </span>
        <div style={{ flex: 1, height: 1, background: C.divider }} />
      </div>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(22px, 2.4vw, 32px)", fontWeight: 700, color: C.text, margin: "0 0 6px 0", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
        {title}
      </h2>
      <p style={{ fontFamily: FONT, color: C.textMuted, fontSize: 13, margin: 0, lineHeight: 1.7, fontWeight: 400 }}>
        {subtitle}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function VenuesPage() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { isMobile } = useResponsive();
  const { isDark, toggle } = useThemeMode();
  const C = getTokens(isDark);

  const [modalVenue,   setModalVenue]   = useState(null);
  // venues state holds the merged static+live data
  const [subcategories, setSubcategories] = useState(STATIC_VENUES);
  const [loadingStats,  setLoadingStats]  = useState(true);

  // ── Pull live seat-map counts from localStorage on mount ──────────────────
  // Also poll for storage changes (in case admin saves a layout in another tab)
  useEffect(() => {
    const merge = () => {
      setSubcategories(prev => {
        const next = {};
        for (const [wing, venues] of Object.entries(prev)) {
          next[wing] = venues.map(v => {
            const live = aggregateCounts(v);
            if (!live) return v;
            return {
              ...v,
              seats:  live.seats  > 0 ? live.seats  : v.seats,
              tables: live.tables > 0 ? live.tables : v.tables,
            };
          });
        }
        return next;
      });
    };

    merge();
    window.addEventListener("storage", merge);
    return () => window.removeEventListener("storage", merge);
  }, []);

  // ── Pull reservation stats from API ──────────────────────────────────────
  useEffect(() => {
    setLoadingStats(true);
    fetchVenueStats().then(stats => {
      setSubcategories(prev => {
        const next = {};
        for (const [wing, venues] of Object.entries(prev)) {
          next[wing] = venues.map(v => {
            // Aggregate stats across all room keys for this venue
            const combined = { reserved: 0, pending: 0, total: 0 };
            v.seatMapKeys.forEach(key => {
              if (stats[key]) {
                combined.reserved += stats[key].reserved;
                combined.pending  += stats[key].pending;
                combined.total    += stats[key].total;
              }
            });
            // Also check by venue name directly
            if (stats[v.name]) {
              combined.reserved += stats[v.name].reserved;
              combined.pending  += stats[v.name].pending;
              combined.total    += stats[v.name].total;
            }
            return { ...v, _stats: combined };
          });
        }
        return next;
      });
      setLoadingStats(false);
    });
  }, []);

  // ── Scroll to section if ?section= param present ─────────────────────────
  useEffect(() => {
    const params  = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section) {
      const idMap = {
        "main-wing":  SECTION_IDS["Main Wing"],
        "tower-wing": SECTION_IDS["Tower Wing"],
        "dining":     SECTION_IDS["Dining"],
      };
      const targetId = idMap[section];
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.search]);

  const handleVenueClick = (id) => {
    const routes = {
      "alabang":         "/alabang-reserve",
      "laguna":          "/laguna-ballroom",
      "20-20":           "/function-room-2020",
      "business-center": "/business-center",
      "tower-ballroom":  "/tower-ballroom",
      "grand-ballroom":  "/grand-ballroom",
      "qsina":           "/qsina",
      "hanakazu":        "/hanakazu",
      "phoenix-court":   "/phoenix-court",
    };
    navigate(routes[id] ?? `/reserve/${id}`);
  };

  const handleBack = () => navigate("/", { state: { scrollTo: "event" } });

  return (
    <div style={{ background: C.pageBg, minHeight: "100vh", fontFamily: FONT }}>

      {/* Navbar */}
      <SharedNavbar
        isDark={isDark}
        toggle={toggle}
        showNavigation={false}
        scrolled={false}
        height={58}
      />

      {/* Modal */}
      {modalVenue && (
        <VenueModal
          venue={modalVenue}
          isDark={isDark}
          C={C}
          onClose={() => setModalVenue(null)}
          onReserve={handleVenueClick}
        />
      )}

      {/* Content */}
      <div style={{ paddingTop: 58 }}>
        <div style={{
          padding: isMobile ? "36px 20px 28px" : "52px clamp(32px, 5vw, 72px) 36px",
          maxWidth: 1280, margin: "0 auto",
          display: "flex", flexDirection: "column", gap: 28,
        }}>

          {/* Back + breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <BackButton onClick={handleBack} C={C} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: FONT, fontSize: 12, color: C.textMuted, fontWeight: 400 }}>Home</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span style={{ fontFamily: FONT, fontSize: 12, color: C.gold, fontWeight: 500 }}>Venues</span>
            </div>
          </div>

          {/* Title block */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 24, height: 1, background: C.gold }} />
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                  All Venues
                </span>
              </div>
              <h1 style={{
                margin: 0, fontFamily: FONT,
                fontSize: "clamp(26px, 3.4vw, 44px)",
                color: C.text, lineHeight: 1.08,
                fontWeight: 700, letterSpacing: "-0.8px",
              }}>
                Browse venues and<br />reserve your space.
              </h1>
            </div>
            <p style={{
              margin: 0, fontFamily: FONT, color: C.textMuted,
              fontSize: 13, lineHeight: 1.75, fontWeight: 400,
              maxWidth: 320, flexShrink: 0,
            }}>
              Explore our spaces below — click a card to view layouts and reserve.{" "}
              Tap the{" "}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, verticalAlign: "middle" }}>
                <svg width="14" height="3" viewBox="0 0 14 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="1.5"  cy="1.5" r="1.5" fill={C.gold} />
                  <circle cx="7"    cy="1.5" r="1.5" fill={C.gold} />
                  <circle cx="12.5" cy="1.5" r="1.5" fill={C.gold} />
                </svg>
              </span>{" "}
              button to view venue details.
            </p>
          </div>

          <div style={{ height: 1, background: `linear-gradient(90deg, ${C.gold} 0%, ${C.divider} 60%, transparent 100%)`, opacity: 0.6 }} />
        </div>

        {/* Sections */}
        <div style={{ padding: isMobile ? "8px 20px 80px" : `8px clamp(32px, 5vw, 72px) 100px`, maxWidth: 1280, margin: "0 auto" }}>

          {/* MAIN WING */}
          <div id={SECTION_IDS["Main Wing"]} style={{ paddingTop: 52, marginBottom: 72, scrollMarginTop: 80 }}>
            <SectionHeader C={C} index={1} title="Main Wing" subtitle="Function rooms and ballrooms suitable for conferences and weddings." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20, alignItems: "start" }}>
              {subcategories["Main Wing"].map((venue) => (
                <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} onDetails={setModalVenue} C={C} />
              ))}
            </div>
          </div>

          {/* TOWER WING */}
          <div id={SECTION_IDS["Tower Wing"]} style={{ paddingTop: 52, marginBottom: 72, scrollMarginTop: 80 }}>
            <SectionHeader C={C} index={2} title="Tower Wing" subtitle="Larger ballrooms and divisible halls — perfect for galas and large events." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20, alignItems: "start" }}>
              {subcategories["Tower Wing"].map((venue) => (
                <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} onDetails={setModalVenue} C={C} />
              ))}
            </div>
          </div>

          {/* DINING */}
          <div id={SECTION_IDS["Dining"]} style={{ paddingTop: 52, marginBottom: 32, scrollMarginTop: 80 }}>
            <SectionHeader C={C} index={3} title="Dining" subtitle="Restaurants and dining spaces — select a venue to reserve a table." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20, alignItems: "start" }}>
              {subcategories["Dining"].map((venue) => (
                <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} onDetails={setModalVenue} C={C} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}