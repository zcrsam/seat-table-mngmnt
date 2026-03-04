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
const C = { gold: "#C9A84C", goldDark: "#9B7A35", goldDarker: "#7f5f1a", dark: "#0E0D09", muted: "#6b6256" };

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
  Dining: [
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
      whileHover={{ y: -6, boxShadow: "0 22px 68px rgba(0,0,0,0.16)", borderColor: C.gold }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "pointer", height: "100%", border: '1px solid transparent', borderRadius: 12 }}
      onClick={() => onClick(venue.id)}
    >
      <div style={{ borderRadius: 12, overflow: "hidden", height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
          <motion.img
            src={venue.img}
            alt={venue.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            animate={{ scale: isHovered ? 1.04 : 1 }}
          />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg,transparent,rgba(0,0,0,0.65))", height: 86 }} />
          <motion.div style={{ position: 'absolute', inset: 0, background: C.gold, opacity: 0, pointerEvents: 'none' }} animate={{ opacity: isHovered ? 0.06 : 0 }} transition={{ duration: 0.18 }} />
          <div style={{ position: "absolute", left: 12, bottom: 12, color: "#fff" }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 700 }}>{venue.name}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, opacity: 0.9 }}>{venue.seats} seats • {venue.tables} tables</div>
          </div>
        </div>

        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {/* sub-room count intentionally removed */}

          {venue.rooms && venue.rooms.length ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {venue.rooms.map((r) => {
                const roomId = `${venue.id}__${String(r).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                return (
                  <button
                    key={r}
                    onClick={(e) => { e.stopPropagation(); onClick(roomId); }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 12,
                      background: 'transparent',
                      border: `1px solid rgba(0,0,0,0.08)`,
                      fontSize: 12,
                      color: '#4b463f',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(201,168,76,0.12)';
                        e.currentTarget.style.color = '#0e0d09';
                        e.currentTarget.style.borderColor = C.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#4b463f';
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                      }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#6b6256' }}>A versatile space for events and gatherings.</div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onClick(venue.id); }}
              style={{ flex: 1, padding: '10px 12px', background: '#E6E6E6', color: '#0E0D09', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, transition: 'all 0.12s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.goldDark; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#E6E6E6'; e.currentTarget.style.color = '#0E0D09'; }}
              onMouseDown={(e) => { e.currentTarget.style.background = C.goldDarker; }}
              onMouseUp={(e) => { e.currentTarget.style.background = C.goldDark; }}
            >
              View & Reserve
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); alert('More info — implement modal'); }}
              style={{ padding: '10px 12px', background: 'transparent', border: `1px solid rgba(0,0,0,0.08)`, borderRadius: 6, cursor: 'pointer', transition: 'all 0.12s', color: C.dark }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.12)'; e.currentTarget.style.color = C.dark; e.currentTarget.style.borderColor = C.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.dark; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}
              onMouseDown={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.12)'; }}
              onMouseUp={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.12)'; }}
            >
              Info
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------- Main Page -------------------- */
export default function VenuesPage() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const handleVenueClick = (id) => {
    if (id === "alabang") {
      navigate("/alabang-reserve");
    } else {
      navigate(`/reserve/${id}`);
    }
  };

  return (
    <div style={{ background: '#F7F3EA', minHeight: '100vh' }}>
      <div style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: 20, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 42, marginBottom: 12 }}>
            <button
              onClick={() => navigate('/')}
              title="Back to home"
              aria-label="Back to home"
              style={{ width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: 999, border: `2px solid ${C.gold}`, color: C.gold, cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', fontSize: 16, marginRight: 6 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.goldDark; e.currentTarget.style.color = C.goldDark; e.currentTarget.style.boxShadow = '0 8px 22px rgba(201,168,76,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)'; }}
            >
              ←
            </button>
            <div style={{ width: 40, height: 2, background: C.gold, borderRadius: 2 }} />
            <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>ALL VENUES</div>
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,4.2vw,48px)', color: C.dark, lineHeight: 1.05 }}>Browse venues and reserve your space.</h1>
          <p style={{ marginTop: 12, color: C.muted, fontSize: 14, maxWidth: 820, fontFamily: "'DM Sans',sans-serif" }}>Explore our venues below — click a card to view layouts and reserve. Sub-rooms are noted where available.</p>
          <div style={{ marginTop: 42, marginBottom: -32, height: 2, width: '100%', background: 'rgba(201,168,76,0.16)', borderRadius: 2, margin: '12px 0' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* kept intentionally empty to preserve spacing on wide screens */}
        </div>
      </div>

      <section style={{ padding: '0 24px 60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Main Wing */}
        <div style={{ marginTop: 8, marginBottom: 60 }}>
          <h2 style={{ color: C.gold, fontSize: 'clamp(36px,3.2vw,34px)', fontWeight: 600, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Main Wing</h2>
          <div style={{ marginBottom: 20, color: C.muted, fontSize: 14 }}>Includes function rooms and ballrooms suitable for conferences and weddings.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {SUBCATEGORIES['Main Wing'].map((venue) => (
              <div key={venue.id} style={{ width: '100%' }}>
                <VenueCard venue={venue} onClick={handleVenueClick} />
              </div>
            ))}
          </div>
        </div>

        {/* Tower Wing */}
        <div style={{ marginBottom: 60, borderTop: `1px solid rgba(201,168,76,0.10)`, paddingTop: 24 }}>
          <h2 style={{ color: C.gold, fontSize: 'clamp(26px,3.2vw,34px)', fontWeight: 600, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Tower Wing</h2>
          <div style={{ marginBottom: 20, color: C.muted, fontSize: 14 }}>Larger ballrooms and divisible halls — perfect for galas and large events.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {SUBCATEGORIES['Tower Wing'].map((venue) => (
              <div key={venue.id} style={{ width: '100%' }}>
                <VenueCard venue={venue} onClick={handleVenueClick} />
              </div>
            ))}
          </div>
        </div>

        {/* Dining */}
        <div style={{ marginBottom: 60, borderTop: `1px solid rgba(201,168,76,0.10)`, paddingTop: 24 }}>
          <h2 style={{ color: C.gold, fontSize: 'clamp(26px,3.2vw,34px)', fontWeight: 600, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>Dining</h2>
          <div style={{ marginBottom: 20, color: C.muted, fontSize: 14 }}>Restaurants and dining spaces — select a venue or a sub-area to reserve a table.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {SUBCATEGORIES['Dining'].map((venue) => (
              <div key={venue.id} style={{ width: '100%' }}>
                <VenueCard venue={venue} onClick={handleVenueClick} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}