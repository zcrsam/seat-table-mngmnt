import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Assets
import alabangImg from "../../../assets/afc.jpeg";
import lagunaImg from "../../../assets/laguna.jpeg";
import twentyTwentyImg from "../../../assets/20:20.jpeg";
import businessCenterImg from "../../../assets/bc.jpeg";
import towerBallroomImg from "../../../assets/towerb.jpeg";
import grandBallroomImg from "../../../assets/grandr.jpg";
import qsinaImg from "../../../assets/qsina.jpeg";
import hanakazuImg from "../../../assets/hanakazu.jpeg";
import phoenixCourtImg from "../../../assets/phoenix-court.jpeg";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// Font   : Inter / system sans-serif — consistent throughout
// Colors : gold (#C9A74D) + slate (#3D3629)
// Min font size: 14px
// ─────────────────────────────────────────────
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const C = {
  gold:        "#C9A74D",
  goldDark:    "#9B7A35",
  goldFaint:   "rgba(201,167,77,0.10)",
  goldBorder:  "rgba(201,167,77,0.30)",
  cream:       "#F7F3EA",
  slate:       "#3D3629",
  slateLight:  "#7A6E5F",
  cardBg:      "#FFFFFF",
  borderLight: "rgba(201,167,77,0.14)",
};

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
const SUBCATEGORIES = {
  "Main Wing": [
    { id: "alabang",         name: "Alabang Function Room", img: alabangImg,        seats: 150, tables: 14, rooms: [] },
    { id: "laguna",          name: "Laguna Ballroom",       img: lagunaImg,         seats: 250, tables: 11, rooms: ["Laguna 1", "Laguna 2"] },
    { id: "20-20",           name: "20/20 Function Room",   img: twentyTwentyImg,   seats: 120, tables: 12, rooms: ["20/20 A", "20/20 B", "20/20 C"] },
    { id: "business-center", name: "Business Center",       img: businessCenterImg, seats: 80,  tables: 10, rooms: [] },
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
// CHEVRON LEFT ICON
// ─────────────────────────────────────────────
function ChevronLeftIcon({ size = 20 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// SUB-ROOM DROPDOWN
// ─────────────────────────────────────────────
function RoomDropdown({ rooms, venueId, onRoomClick }) {
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
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 20,
          background: open ? C.goldFaint : "transparent",
          border: `1px solid ${open ? C.gold : C.goldBorder}`,
          fontSize: 14,
          color: open ? C.gold : C.slateLight,
          cursor: "pointer",
          transition: "all 0.16s",
          fontFamily: FONT,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = C.goldFaint;
          e.currentTarget.style.color = C.gold;
          e.currentTarget.style.borderColor = C.gold;
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = C.slateLight;
            e.currentTarget.style.borderColor = C.goldBorder;
          }
        }}
      >
        <span>Sub-rooms ({rooms.length})</span>
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          zIndex: 999,
          background: C.cardBg,
          border: `1px solid ${C.goldBorder}`,
          borderRadius: 10,
          boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
          minWidth: 180,
          overflow: "hidden",
        }}>
          {rooms.filter(r => r && typeof r === 'string' && r.trim() !== '').map((r, i) => {
            const roomId = `${venueId}__${String(r).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            return (
              <button
                key={r}
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); onRoomClick(roomId); }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "11px 16px",
                  background: "transparent",
                  border: "none",
                  borderTop: i === 0 ? "none" : `1px solid ${C.borderLight}`,
                  textAlign: "left",
                  fontSize: 14,
                  color: C.slate,
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontWeight: 400,
                  transition: "background 0.12s",
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
function VenueCard({ venue, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14,
        overflow: "visible",
        background: C.cardBg,
        boxShadow: hov ? "0 18px 48px rgba(0,0,0,0.12)" : "0 2px 16px rgba(0,0,0,0.07)",
        border: `1px solid ${hov ? C.gold : C.borderLight}`,
        transition: "box-shadow 0.25s, border-color 0.25s, transform 0.25s",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Image */}
      <div
        onClick={() => onClick(venue.id)}
        style={{
          height: 200,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          borderRadius: "14px 14px 0 0",
        }}
      >
        <img
          src={venue.img}
          alt={venue.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            display: "block",
            transition: "transform 0.4s",
            transform: hov ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.65) 100%)",
        }} />
        {/* Name overlay */}
        <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
          <div style={{
            fontFamily: FONT,
            fontSize: 18,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.2,
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}>
            {venue.name}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{
        padding: "14px 16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        borderRadius: "0 0 14px 14px",
      }}>
        {venue.rooms && Array.isArray(venue.rooms) && venue.rooms.length > 0 && (
          <RoomDropdown rooms={venue.rooms} venueId={venue.id} onRoomClick={onClick} />
        )}

        {(!venue.rooms || venue.rooms.length === 0) && (
          <p style={{
            fontFamily: FONT,
            fontSize: 14,
            color: C.slateLight,
            lineHeight: 1.6,
            margin: 0,
          }}>
            A versatile space for events and gatherings.
          </p>
        )}

        {/* CTA row */}
        <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(venue.id); }}
            style={{
              flex: 1,
              padding: "11px 12px",
              background: C.gold,
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: FONT,
              letterSpacing: 0.2,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.goldDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}
          >
            View & Reserve
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(venue.id); }}
            style={{
              padding: "11px 14px",
              background: "transparent",
              border: `1px solid ${C.goldBorder}`,
              borderRadius: 8,
              cursor: "pointer",
              color: C.gold,
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 14,
              transition: "all 0.14s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.goldFaint;
              e.currentTarget.style.borderColor = C.gold;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = C.goldBorder;
            }}
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
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{
        fontFamily: FONT,
        fontSize: "clamp(22px, 2.6vw, 30px)",
        fontWeight: 700,
        color: C.gold,
        margin: 0,
        lineHeight: 1.15,
        letterSpacing: "-0.3px",
      }}>
        {title}
      </h2>
      <div style={{
        width: 44,
        height: 3,
        background: C.gold,
        borderRadius: 2,
        margin: "10px 0 12px",
      }} />
      <p style={{
        fontFamily: FONT,
        color: C.slateLight,
        fontSize: 14,
        margin: 0,
        lineHeight: 1.65,
        fontWeight: 400,
      }}>
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

  const pad    = isMobile ? "20px 16px 0"     : "40px 48px 0";
  const secPad = isMobile ? "24px 16px 80px"  : "36px 48px 100px";

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: FONT }}>

      {/* ── Page header ── */}
      <div style={{ padding: pad, maxWidth: 1240, margin: "0 auto" }}>

        {/* Back row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32, marginTop: 12 }}>
          <button
            onClick={handleBack}
            aria-label="Back to home"
            style={{
              width: 44,
              height: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: C.cardBg,
              borderRadius: "50%",
              border: `2px solid ${C.gold}`,
              color: C.gold,
              cursor: "pointer",
              boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
              transition: "background 0.15s, color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.gold;
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.cardBg;
              e.currentTarget.style.color = C.gold;
            }}
          >
            <ChevronLeftIcon size={20} />
          </button>

          <div style={{ width: 30, height: 2, background: C.gold, borderRadius: 2, flexShrink: 0 }} />

          <span style={{
            fontFamily: FONT,
            color: C.gold,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}>
            All Venues
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          margin: "0 0 10px 0",
          fontFamily: FONT,
          fontSize: "clamp(24px, 3vw, 40px)",
          color: C.slate,
          lineHeight: 1.1,
          fontWeight: 700,
          letterSpacing: "-0.5px",
        }}>
          Browse venues and reserve your space.
        </h1>

        <p style={{
          margin: "0 0 30px 0",
          color: C.slateLight,
          fontSize: 14,
          fontFamily: FONT,
          fontWeight: 400,
          lineHeight: 1.7,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          Explore our venues below — click a card to view layouts and reserve. Sub-rooms are available via the dropdown where noted.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, ${C.goldBorder}, transparent)` }} />
      </div>

      {/* ── Venue sections ── */}
      <section style={{ padding: secPad, maxWidth: 1240, margin: "0 auto" }}>

        {/* MAIN WING */}
        <div id={SECTION_IDS["Main Wing"]} style={{ marginBottom: 72, scrollMarginTop: 80 }}>
          <SectionHeader
            title="Main Wing"
            subtitle="Function rooms and ballrooms suitable for conferences and weddings."
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}>
            {SUBCATEGORIES["Main Wing"].map((venue) => (
              <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} />
            ))}
          </div>
        </div>

        {/* TOWER WING */}
        <div
          id={SECTION_IDS["Tower Wing"]}
          style={{ marginBottom: 72, borderTop: `1px solid ${C.borderLight}`, paddingTop: 48, scrollMarginTop: 80 }}
        >
          <SectionHeader
            title="Tower Wing"
            subtitle="Larger ballrooms and divisible halls — perfect for galas and large events."
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}>
            {SUBCATEGORIES["Tower Wing"].map((venue) => (
              <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} />
            ))}
          </div>
        </div>

        {/* DINING */}
        <div
          id={SECTION_IDS["Dining"]}
          style={{ marginBottom: 32, borderTop: `1px solid ${C.borderLight}`, paddingTop: 48, scrollMarginTop: 80 }}
        >
          <SectionHeader
            title="Dining"
            subtitle="Restaurants and dining spaces — select a venue to reserve a table."
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}>
            {SUBCATEGORIES["Dining"].map((venue) => (
              <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} />
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}