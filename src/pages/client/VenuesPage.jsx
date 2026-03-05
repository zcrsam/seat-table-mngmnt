import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Assets
import alabangImg from "../../assets/afc.jpeg";
import lagunaImg from "../../assets/laguna.jpeg";
import twentyTwentyImg from "../../assets/20:20.jpeg";
import businessCenterImg from "../../assets/bc.jpeg";
import towerBallroomImg from "../../assets/towerb.jpeg";
import grandBallroomImg from "../../assets/grandr.jpg";
import qsinaImg from "../../assets/qsina.jpeg";
import hanakazuImg from "../../assets/hanakazu.jpeg";
import phoenixCourtImg from "../../assets/phoenix-court.jpeg";

/* -------------------- Responsive Hook -------------------- */
function useResponsive() {
  const [screenSize, setScreenSize] = useState({ isMobile: false, isTablet: false, isDesktop: true });
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setScreenSize({ isMobile: w < 768, isTablet: w >= 768 && w < 1024, isDesktop: w >= 1024 });
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return screenSize;
}

/* -------------------- Theme Colors -------------------- */
const C = { gold: "#C9A84C", goldDark: "#9B7A35", goldDarker: "#7f5f1a", dark: "#7f5f1a", muted: "#6b6256" };
const F = { display: "'Cormorant Garamond', Georgia, serif", body: "'DM Sans', sans-serif" };

/* -------------------- Subcategories / Data -------------------- */
const SUBCATEGORIES = {
  "Main Wing": [
    { id: "alabang", name: "Alabang Function Room", img: alabangImg, seats: 150, tables: 14, wing: "Main Wing", rooms: [] },
    { id: "laguna", name: "Laguna Ballroom", img: lagunaImg, seats: 250, tables: 11, wing: "Main Wing", rooms: ["Laguna 1", "Laguna 2"] },
    { id: "20-20", name: "20/20 Function Room", img: twentyTwentyImg, seats: 120, tables: 12, wing: "Main Wing", rooms: ["20/20 A", "20/20 B", "20/20 C"] },
    { id: "business-center", name: "Business Center", img: businessCenterImg, seats: 80, tables: 10, wing: "Main Wing", rooms: [] },
  ],
  "Tower Wing": [
    { id: "tower-ballroom", name: "Tower Ballroom", img: towerBallroomImg, seats: 300, tables: 15, wing: "Tower Wing", rooms: ["Tower 1", "Tower 2", "Tower 3"] },
    { id: "grand-ballroom", name: "Grand Ballroom", img: grandBallroomImg, seats: 400, tables: 20, wing: "Tower Wing", rooms: ["Grand A", "Grand B", "Grand C"] },
  ],
  // ── Dining venues have NO sub-rooms ──
  "Dining": [
    { id: "qsina", name: "Qsina", img: qsinaImg, seats: 120, tables: 12, wing: "Dining", rooms: [] },
    { id: "hanakazu", name: "Hanakazu", img: hanakazuImg, seats: 80, tables: 10, wing: "Dining", rooms: [] },
    { id: "phoenix-court", name: "Phoenix Court", img: phoenixCourtImg, seats: 140, tables: 16, wing: "Dining", rooms: [] },
  ],
};

/* -------------------- Venue Card -------------------- */
function VenueCard({ venue, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -5, boxShadow: "0 22px 56px rgba(0,0,0,0.13)", borderColor: C.gold }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "pointer", height: "100%", border: "1px solid transparent", borderRadius: 14 }}
      onClick={() => onClick(venue.id)}
    >
      <div style={{ borderRadius: 14, overflow: "hidden", height: "100%", background: "#fff", display: "flex", flexDirection: "column", boxShadow: "0 4px 18px rgba(0,0,0,0.07)" }}>
        {/* Image */}
        <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
          <motion.img
            src={venue.img}
            alt={venue.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            animate={{ scale: isHovered ? 1.04 : 1 }}
            transition={{ duration: 0.35 }}
          />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg,transparent,rgba(0,0,0,0.62))", height: 90 }} />
          <motion.div style={{ position: "absolute", inset: 0, background: C.gold, opacity: 0, pointerEvents: "none" }} animate={{ opacity: isHovered ? 0.06 : 0 }} transition={{ duration: 0.18 }} />

          {/* Availability badge */}
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(201,168,76,0.85)", color: "#FFFFFF", borderRadius: 6, padding: "5px 10px", fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, backdropFilter: "blur(4px)" }}>
            {venue.tables} tables available
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {/* Name + seats row */}
          <div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.dark, lineHeight: 1.1, marginBottom: 4 }}>{venue.name}</div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: "#888", fontWeight: 400 }}>{venue.seats} seats available</div>
          </div>

          {/* Sub-rooms (if any) */}
          {venue.rooms && venue.rooms.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {venue.rooms.map((r) => {
                const roomId = `${venue.id}__${String(r).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                return (
                  <button
                    key={r}
                    onClick={(e) => { e.stopPropagation(); onClick(roomId); }}
                    style={{ padding: "5px 12px", borderRadius: 20, background: "transparent", border: `1px solid rgba(201,168,76,0.35)`, fontSize: 12, color: C.muted, cursor: "pointer", transition: "all 0.16s", fontFamily: F.body, fontWeight: 500 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.12)"; e.currentTarget.style.color = C.dark; e.currentTarget.style.borderColor = C.gold; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
                  >{r}</button>
                );
              })}
            </div>
          )}

          {/* No sub-room fallback description */}
          {(!venue.rooms || venue.rooms.length === 0) && (
            <div style={{ fontFamily: F.body, fontSize: 13, color: "#999", lineHeight: 1.5 }}>
              A versatile space for events and gatherings.
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onClick(venue.id); }}
              style={{ flex: 1, padding: "11px 12px", background: C.dark, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: F.body, transition: "all 0.14s", letterSpacing: 0.3 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.goldDark; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.dark; }}
            >
              View & Reserve
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); alert("More info — implement modal"); }}
              style={{ padding: "11px 14px", background: "transparent", border: `1px solid rgba(0,0,0,0.1)`, borderRadius: 8, cursor: "pointer", transition: "all 0.14s", color: C.dark, fontFamily: F.body, fontWeight: 500, fontSize: 13 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.borderColor = C.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"; }}
            >
              Info
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------- Section Header -------------------- */
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ color: C.dark, fontSize: "clamp(26px,3.2vw,34px)", fontWeight: 700, marginBottom: 6, margin: 0, fontFamily: F.display, lineHeight: 1.1 }}>{title}</h2>
      <div style={{ width: 40, height: 3, background: C.gold, borderRadius: 2, margin: "8px 0 10px" }} />
      <div style={{ color: C.muted, fontSize: 14, fontFamily: F.body }}>{subtitle}</div>
    </div>
  );
}

/* -------------------- Main Page -------------------- */
export default function VenuesPage() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleVenueClick = (id) => {
    if (id === "alabang") {
      navigate("/alabang-reserve");
    } else {
      navigate(`/reserve/${id}`);
    }
  };

  const handleBack = () => {
    navigate("/", { state: { scrollTo: "event" } });
  };

  return (
    <div style={{ background: "#FAF6F0", minHeight: "100vh", fontFamily: F.body }}>

      {/* ── Header ── */}
      <div style={{ padding: isMobile ? "20px 16px 0" : "32px 32px 0", maxWidth: 1200, margin: "0 auto" }}>

        {/* Back button + breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, marginTop: 8 }}>
          <button
            onClick={handleBack}
            title="Back to event section"
            aria-label="Back to event section"
            style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#ffffff", borderRadius: 999, border: `2px solid ${C.gold}`, color: C.gold, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", fontSize: 16, flexShrink: 0, transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.goldDark; e.currentTarget.style.color = C.goldDark; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
          >
            ←
          </button>
          <div style={{ width: 32, height: 2, background: C.gold, borderRadius: 2 }} />
          <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: F.body }}>ALL VENUES</div>
        </div>

        <h1 style={{ margin: "0 0 8px 0", fontFamily: F.display, fontSize: "clamp(32px,4.2vw,52px)", color: C.dark, lineHeight: 1.05, fontWeight: 700 }}>
          Browse venues and reserve your space.
        </h1>
        <p style={{ margin: "0 0 24px 0", color: C.muted, fontSize: 14, maxWidth: 820, fontFamily: F.body, lineHeight: 1.6 }}>
          Explore our venues below — click a card to view layouts and reserve. Sub-rooms are noted where available.
        </p>
        <div style={{ height: 1, background: "rgba(201,168,76,0.18)", borderRadius: 2 }} />
      </div>

      {/* ── Venue sections ── */}
      <section style={{ padding: isMobile ? "20px 16px 60px" : "28px 32px 80px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Main Wing */}
        <div style={{ marginBottom: 60 }}>
          <SectionHeader title="Main Wing" subtitle="Function rooms and ballrooms suitable for conferences and weddings." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {SUBCATEGORIES["Main Wing"].map((venue) => (
              <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} />
            ))}
          </div>
        </div>

        {/* Tower Wing */}
        <div style={{ marginBottom: 60, borderTop: "1px solid rgba(201,168,76,0.12)", paddingTop: 32 }}>
          <SectionHeader title="Tower Wing" subtitle="Larger ballrooms and divisible halls — perfect for galas and large events." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {SUBCATEGORIES["Tower Wing"].map((venue) => (
              <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} />
            ))}
          </div>
        </div>

        {/* Dining */}
        <div style={{ marginBottom: 60, borderTop: "1px solid rgba(201,168,76,0.12)", paddingTop: 32 }}>
          <SectionHeader title="Dining" subtitle="Restaurants and dining spaces — select a venue to reserve a table." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {SUBCATEGORIES["Dining"].map((venue) => (
              <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} />
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}