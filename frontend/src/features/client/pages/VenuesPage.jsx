import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bellevueLogo from "../../../assets/bellevue-logo.png";

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
// DESIGN TOKENS — theme-aware
// ─────────────────────────────────────────────
function getTokens(isDark) {
  return isDark ? {
    gold:        "#C9A84C",
    goldLight:   "#E2C96A",
    goldFaint:   "rgba(201,168,76,0.10)",
    goldBorder:  "rgba(201,168,76,0.22)",
    pageBg:      "#1A1612",
    cardBg:      "#2A241E",
    text:        "#F5EFE0",
    textSub:     "#D7C697",
    textMuted:   "#A6987A",
    border:      "rgba(201,168,76,0.18)",
    borderLight: "rgba(201,168,76,0.10)",
    navBg:       "rgba(14,13,9,0.85)",
    navBorder:   "rgba(201,168,76,0.15)",
    surface:     "#2A241E",
  } : {
    gold:        "#A07828",
    goldLight:   "#C9A84C",
    goldFaint:   "rgba(160,120,40,0.10)",
    goldBorder:  "rgba(160,120,40,0.22)",
    pageBg:      "#F7F3EA",
    cardBg:      "#FFFFFF",
    text:        "#1A1612",
    textSub:     "#5A5040",
    textMuted:   "#8A7A60",
    border:      "rgba(160,120,40,0.18)",
    borderLight: "rgba(160,120,40,0.10)",
    navBg:       "rgba(245,240,232,0.92)",
    navBorder:   "rgba(160,120,40,0.18)",
    surface:     "#FFFFFF",
  };
}

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Section anchor IDs
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
// DATA
// ─────────────────────────────────────────────
// Assets
import alabangImg       from "../../../assets/afc.jpeg";
import lagunaImg        from "../../../assets/laguna.jpeg";
import twentyTwentyImg  from "../../../assets/20:20.jpeg";
import businessCenterImg from "../../../assets/bc.jpeg";
import towerBallroomImg from "../../../assets/towerb.jpeg";
import grandBallroomImg from "../../../assets/grandr.jpg";
import qsinaImg         from "../../../assets/qsina.jpeg";
import hanakazuImg      from "../../../assets/hanakazu.jpeg";
import phoenixCourtImg  from "../../../assets/phoenix-court.jpeg";

const SUBCATEGORIES = {
  "Main Wing": [
    { id: "alabang",         name: "Alabang Function Room", img: alabangImg,         seats: 150, tables: 14, rooms: [] },
    { id: "laguna",          name: "Laguna Ballroom",       img: lagunaImg,          seats: 250, tables: 11, rooms: ["Laguna 1", "Laguna 2"] },
    { id: "20-20",           name: "20/20 Function Room",   img: twentyTwentyImg,    seats: 120, tables: 12, rooms: ["20/20 A", "20/20 B", "20/20 C"] },
    { id: "business-center", name: "Business Center",       img: businessCenterImg,  seats: 80,  tables: 10, rooms: [] },
  ],
  "Tower Wing": [
    { id: "tower-ballroom", name: "Tower Ballroom", img: towerBallroomImg, seats: 300, tables: 15, rooms: ["Tower 1", "Tower 2", "Tower 3"] },
    { id: "grand-ballroom", name: "Grand Ballroom", img: grandBallroomImg, seats: 400, tables: 20, rooms: ["Grand A", "Grand B", "Grand C"] },
  ],
  "Dining": [
    { id: "qsina",         name: "Qsina",         img: qsinaImg,        seats: 120, tables: 12, rooms: [] },
    { id: "hanakazu",      name: "Hanakazu",      img: hanakazuImg,     seats: 80,  tables: 10, rooms: [] },
    { id: "phoenix-court", name: "Phoenix Court", img: phoenixCourtImg, seats: 140, tables: 16, rooms: [] },
  ],
};

// ─────────────────────────────────────────────
// THEME TOGGLE  — identical to ManageBooking
// ─────────────────────────────────────────────
function ThemeToggle({ isDark, toggle }) {
  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{ display:"flex", alignItems:"center", padding:0, background:"none", border:"none", cursor:"pointer", flexShrink:0 }}
    >
      <span style={{
        position:"relative", width:46, height:25, borderRadius:13,
        background: isDark ? "#2C2A1E" : "#DDD6C0",
        border:`1.5px solid ${isDark ? "rgba(201,168,76,0.28)" : "rgba(160,120,40,0.22)"}`,
        display:"inline-flex", alignItems:"center", flexShrink:0,
        transition:"background 0.32s, border-color 0.32s", verticalAlign:"middle",
      }}>
        <span style={{
          position:"absolute", top:2,
          left: isDark ? 2 : "calc(100% - 23px)",
          width:19, height:19, borderRadius:"50%", background:"#FFFFFF",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"left 0.30s cubic-bezier(.4,0,.2,1)", flexShrink:0,
        }}>
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
            <path d="M10 1a9 9 0 1 0 9 9A9 9 0 0 0 10 1zm0 16V3a7 7 0 0 1 0 14z" fill={isDark ? "#1C1A10" : "#B8922A"} />
          </svg>
        </span>
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// NAVBAR  — same structure/style as ManageBooking
// ─────────────────────────────────────────────
function VenuesNav({ isDark, toggle }) {
  const navigate = useNavigate();
  const C = getTokens(isDark);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:9000,
      height:64,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 clamp(16px,4vw,52px)",
      background: C.navBg,
      backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
      borderBottom:`1px solid ${C.navBorder}`,
      boxSizing:"border-box",
      transition:"background 0.35s",
    }}>
      <img
        src={bellevueLogo}
        alt="The Bellevue Manila"
        onClick={() => navigate("/")}
        style={{
          height:32, width:"auto", cursor:"pointer", display:"block", flexShrink:0,
          filter: isDark
            ? "none"
            : "brightness(0) saturate(100%) invert(25%) sepia(40%) saturate(500%) hue-rotate(10deg)",
          transition:"filter 0.35s",
        }}
      />
      <ThemeToggle isDark={isDark} toggle={toggle} />
    </nav>
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
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          display:"inline-flex", alignItems:"center", gap:6,
          padding:"6px 14px", borderRadius:20,
          background: open ? C.goldFaint : "transparent",
          border:`1px solid ${open ? C.gold : C.goldBorder}`,
          fontSize:14, color: open ? C.gold : C.textMuted,
          cursor:"pointer", transition:"all 0.16s",
          fontFamily:FONT, fontWeight:500, whiteSpace:"nowrap",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background=C.goldFaint; e.currentTarget.style.color=C.gold; e.currentTarget.style.borderColor=C.gold; }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.textMuted; e.currentTarget.style.borderColor=C.goldBorder; } }}
      >
        <span>Sub-rooms ({rooms.length})</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition:"transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:999,
          background:C.surface, border:`1px solid ${C.goldBorder}`,
          borderRadius:10, boxShadow:"0 8px 28px rgba(0,0,0,0.12)",
          minWidth:180, overflow:"hidden",
        }}>
          {rooms.filter(r => r && typeof r === "string" && r.trim() !== "").map((r, i) => {
            const roomId = `${venueId}__${String(r).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            return (
              <button
                key={r}
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); onRoomClick(roomId); }}
                style={{
                  display:"block", width:"100%", padding:"11px 16px",
                  background:"transparent", border:"none",
                  borderTop: i === 0 ? "none" : `1px solid ${C.borderLight}`,
                  textAlign:"left", fontSize:14, color:C.text,
                  cursor:"pointer", fontFamily:FONT, fontWeight:400, transition:"background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.goldFaint)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
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
// VENUE CARD
// ─────────────────────────────────────────────
function VenueCard({ venue, onClick, C }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius:14, overflow:"visible",
        background:C.surface,
        boxShadow: hov ? "0 18px 48px rgba(0,0,0,0.14)" : "0 2px 16px rgba(0,0,0,0.07)",
        border:`1px solid ${hov ? C.gold : C.borderLight}`,
        transition:"box-shadow 0.25s, border-color 0.25s, transform 0.25s",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        display:"flex", flexDirection:"column", height:"100%", position:"relative",
      }}
    >
      {/* Image */}
      <div
        onClick={() => onClick(venue.id)}
        style={{ height:200, position:"relative", overflow:"hidden", cursor:"pointer", borderRadius:"14px 14px 0 0" }}
      >
        <img
          src={venue.img} alt={venue.name}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform 0.4s", transform: hov ? "scale(1.05)" : "scale(1)" }}
        />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.65) 100%)" }} />
        <div style={{ position:"absolute", bottom:12, left:14, right:14 }}>
          <div style={{ fontFamily:FONT, fontSize:18, fontWeight:700, color:"#FFFFFF", lineHeight:1.2, textShadow:"0 1px 6px rgba(0,0,0,0.5)" }}>
            {venue.name}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding:"14px 16px 18px", display:"flex", flexDirection:"column", gap:12, flex:1, borderRadius:"0 0 14px 14px" }}>
        {venue.rooms && Array.isArray(venue.rooms) && venue.rooms.length > 0 && (
          <RoomDropdown rooms={venue.rooms} venueId={venue.id} onRoomClick={onClick} C={C} />
        )}
        {(!venue.rooms || venue.rooms.length === 0) && (
          <p style={{ fontFamily:FONT, fontSize:14, color:C.textMuted, lineHeight:1.6, margin:0 }}>
            A versatile space for events and gatherings.
          </p>
        )}

        {/* CTA row */}
        <div style={{ marginTop:"auto", display:"flex", gap:8 }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(venue.id); }}
            style={{ flex:1, padding:"11px 12px", background:C.gold, color:"#FFFFFF", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, fontFamily:FONT, letterSpacing:0.2, transition:"background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.goldLight)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}
          >
            View & Reserve
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(venue.id); }}
            style={{ padding:"11px 14px", background:"transparent", border:`1px solid ${C.goldBorder}`, borderRadius:8, cursor:"pointer", color:C.gold, fontFamily:FONT, fontWeight:500, fontSize:14, transition:"all 0.14s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background=C.goldFaint; e.currentTarget.style.borderColor=C.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor=C.goldBorder; }}
          >
            •••
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader({ title, subtitle, C }) {
  return (
    <div style={{ marginBottom:28 }}>
      <h2 style={{ fontFamily:FONT, fontSize:"clamp(22px, 2.6vw, 30px)", fontWeight:700, color:C.gold, margin:0, lineHeight:1.15, letterSpacing:"-0.3px" }}>
        {title}
      </h2>
      <div style={{ width:44, height:3, background:C.gold, borderRadius:2, margin:"10px 0 12px" }} />
      <p style={{ fontFamily:FONT, color:C.textMuted, fontSize:14, margin:0, lineHeight:1.65, fontWeight:400 }}>
        {subtitle}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function VenuesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const { isDark, toggle } = useThemeMode();
  const C = getTokens(isDark);

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
          if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
        }, 80);
        return;
      }
    }
    window.scrollTo({ top:0, behavior:"instant" });
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

  const handleBack = () => navigate("/", { state: { scrollTo:"event" } });

  const pad    = isMobile ? "20px 16px 0"    : "40px 48px 0";
  const secPad = isMobile ? "24px 16px 80px" : "36px 48px 100px";

  return (
    <div style={{ background:C.pageBg, minHeight:"100vh", fontFamily:FONT }}>

      {/* ── Navbar — same as ManageBooking ── */}
      <VenuesNav isDark={isDark} toggle={toggle} />

      {/* ── Page content ── */}
      <div style={{ paddingTop:64 }}>
        <div style={{ padding:pad, maxWidth:1240, margin:"0 auto" }}>

          {/* ── Back button — gold circle chevron-left, matches ManageBooking ── */}
          <div style={{ marginBottom:28, marginTop:20 }}>
            <button
              onClick={handleBack}
              aria-label="Go back"
              style={{
                width:48, height:48, borderRadius:"50%",
                background:"rgba(201,168,76,0.12)",
                backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
                border:`1.5px solid ${C.gold}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", transition:"all 0.22s", padding:0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background="rgba(201,168,76,0.28)"; e.currentTarget.style.transform="scale(1.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background="rgba(201,168,76,0.12)"; e.currentTarget.style.transform="scale(1)"; }}
            >
              <svg
                width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke={C.gold} strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ display:"block", flexShrink:0 }}
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Label row */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
            <div style={{ width:30, height:2, background:C.gold, borderRadius:2, flexShrink:0 }} />
            <span style={{ fontFamily:FONT, color:C.gold, fontSize:13, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase" }}>
              All Venues
            </span>
          </div>

          {/* Title */}
          <h1 style={{ margin:"0 0 10px 0", fontFamily:FONT, fontSize:"clamp(24px, 3vw, 40px)", color:C.text, lineHeight:1.1, fontWeight:700, letterSpacing:"-0.5px" }}>
            Browse venues and reserve your space.
          </h1>

          <p style={{ margin:"0 0 30px 0", color:C.textMuted, fontSize:14, fontFamily:FONT, fontWeight:400, lineHeight:1.7, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            Explore our venues below — click a card to view layouts and reserve. Sub-rooms are available via the dropdown where noted.
          </p>

          {/* Divider */}
          <div style={{ height:1, background:`linear-gradient(90deg, ${C.goldBorder}, transparent)` }} />
        </div>

        {/* ── Venue sections ── */}
        <section style={{ padding:secPad, maxWidth:1240, margin:"0 auto" }}>

          {/* MAIN WING */}
          <div id={SECTION_IDS["Main Wing"]} style={{ marginBottom:72, scrollMarginTop:80 }}>
            <SectionHeader C={C}
              title="Main Wing"
              subtitle="Function rooms and ballrooms suitable for conferences and weddings."
            />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:24, alignItems:"start" }}>
              {SUBCATEGORIES["Main Wing"].map((venue) => (
                <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} C={C} />
              ))}
            </div>
          </div>

          {/* TOWER WING */}
          <div id={SECTION_IDS["Tower Wing"]} style={{ marginBottom:72, borderTop:`1px solid ${C.borderLight}`, paddingTop:48, scrollMarginTop:80 }}>
            <SectionHeader C={C}
              title="Tower Wing"
              subtitle="Larger ballrooms and divisible halls — perfect for galas and large events."
            />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:24, alignItems:"start" }}>
              {SUBCATEGORIES["Tower Wing"].map((venue) => (
                <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} C={C} />
              ))}
            </div>
          </div>

          {/* DINING */}
          <div id={SECTION_IDS["Dining"]} style={{ marginBottom:32, borderTop:`1px solid ${C.borderLight}`, paddingTop:48, scrollMarginTop:80 }}>
            <SectionHeader C={C}
              title="Dining"
              subtitle="Restaurants and dining spaces — select a venue to reserve a table."
            />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:24, alignItems:"start" }}>
              {SUBCATEGORIES["Dining"].map((venue) => (
                <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} C={C} />
              ))}
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}