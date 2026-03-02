import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import heroBanner from "../assets/banner-grandroom.jpg";

// Venue images
import alabangImg from "../assets/afc.jpeg";
import lagunaImg from "../assets/laguna.jpeg";
import twentyTwentyImg from "../assets/20:20.jpeg";
import businessCenterImg from "../assets/bc.jpeg";
import towerBallroomImg from "../assets/towerb.jpeg";
import grandBallroomImg from "../assets/grandr.jpg";
import qsinaImg from "../assets/qsina.jpeg";
import hanakazuImg from "../assets/hanakazu.jpeg";
import phoenixCourtImg from "../assets/phoenix-court.jpeg";

/* -------------------- Responsive Hook -------------------- */
function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return screenSize;
}

/* -------------------- Theme Colors -------------------- */
const C = {
  gold: "#C9A84C",
};

/* -------------------- Subcategories -------------------- */
const SUBCATEGORIES = {
  "Main Wing": [
    { id: "alabang", name: "Alabang Function Room", img: alabangImg, seats: 15, tables: 14, wing: "Main Wing", rooms: [] },
    { id: "laguna", name: "Laguna Ballroom", img: lagunaImg, seats: 25, tables: 11, wing: "Main Wing", rooms: ["Laguna 1", "Laguna 2"] },
    { id: "20-20", name: "20/20 Function Room", img: twentyTwentyImg, seats: 20, tables: 12, wing: "Main Wing", rooms: [] },
    { id: "business-center", name: "Business Center", img: businessCenterImg, seats: 18, tables: 10, wing: "Main Wing", rooms: [] },
  ],
  "Tower Wing": [
    { id: "tower-ballroom", name: "Tower Ballroom", img: towerBallroomImg, seats: 30, tables: 15, wing: "Tower Wing", rooms: [] },
    { id: "grand-ballroom", name: "Grand Ballroom", img: grandBallroomImg, seats: 40, tables: 20, wing: "Tower Wing", rooms: [] },
  ],
  Dining: [
    { id: "qsina", name: "Qsina", img: qsinaImg, seats: 22, tables: 12, wing: "Dining", rooms: [] },
    { id: "hanakazu", name: "Hanakazu", img: hanakazuImg, seats: 24, tables: 13, wing: "Dining", rooms: [] },
    { id: "phoenix-court", name: "Phoenix Court", img: phoenixCourtImg, seats: 28, tables: 16, wing: "Dining", rooms: [] },
  ],
};

/* -------------------- Venue Card -------------------- */
function VenueCard({ venue, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}
      onClick={() => onClick(venue.id)}
      style={{ cursor: "pointer", position: "relative" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          transition: "all 0.3s ease",
          height: "100%",
          background: "#fff",
        }}
      >
        <div style={{ height: 240, position: "relative", overflow: "hidden" }}>
          <motion.img
            src={venue.img}
            alt={venue.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
            }}
            animate={{ scale: isHovered ? 1.06 : 1 }}
          />
          
          {/* Gold overlay on hover */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(201,168,76,0.2)",
              opacity: 0,
              transition: "opacity 0.3s ease",
            }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Gold left border on hover */}
          <motion.div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              background: C.gold,
              transformOrigin: "bottom",
              scaleY: 0,
              transition: "transform 0.3s ease",
            }}
            animate={{ scaleY: isHovered ? 1 : 0 }}
          />

          {/* Reserve a seat badge on hover */}
          <motion.div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: C.gold,
              color: C.dark,
              padding: "6px 12px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              opacity: 0,
              transform: "translateY(-10px)",
              transition: "all 0.3s ease",
            }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(0)" : "translateY(-10px)"
            }}
          >
            Reserve a seat
          </motion.div>

          {/* Venue details overlay - replacing the yellow oval */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.7)",
              padding: "16px",
              color: "#fff",
            }}
          >
            <h3 style={{ 
              margin: 0, 
              fontSize: 18, 
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 4
            }}>
              {venue.name}
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              opacity: 0.9
            }}>
              {venue.seats} seats • {venue.tables} tables
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------- Chip Component -------------------- */
function Chip({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 20,
        border: `1px solid ${isActive ? C.gold : "rgba(201,168,76,0.2)"}`,
        background: isActive ? C.gold : "transparent",
        color: isActive ? "#fff" : C.gold,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

/* -------------------- Main Page -------------------- */
export default function VenuesPage() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const handleVenueClick = (id) => {
    navigate(`/reserve/${id}`);
  };

  return (
    <div style={{ background: "#F7F3EA", minHeight: "100vh" }}>
      {/* Back button - separate from navbar */}
      <div style={{ 
        padding: "80px 40px 20px 40px", 
        display: "flex", 
        alignItems: "center"
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: C.gold,
            color: "#0E0D09",
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#b8984a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = C.gold;
          }}
        >
          ← Back
        </button>
      </div>

      {/* All venues displayed */}
      <section style={{ padding: "0 40px 40px 40px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Main Wing */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ 
            color: C.gold, 
            fontSize: 24, 
            fontWeight: 600, 
            marginBottom: 24,
            fontFamily: "'Cormorant Garamond', serif"
          }}>
            Main Wing
          </h2>
          <div
            style={{
              display: "flex",
              gap: 24,
              justifyContent: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {SUBCATEGORIES["Main Wing"].map((venue) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  width: "22%",
                  minWidth: 200,
                }}
              >
                <VenueCard
                  venue={venue}
                  onClick={handleVenueClick}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tower Wing */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ 
            color: C.gold, 
            fontSize: 24, 
            fontWeight: 600, 
            marginBottom: 24,
            fontFamily: "'Cormorant Garamond', serif"
          }}>
            Tower Wing
          </h2>
          <div
            style={{
              display: "flex",
              gap: 24,
              justifyContent: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {SUBCATEGORIES["Tower Wing"].map((venue) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                style={{
                  width: "48%",
                  minWidth: 250,
                }}
              >
                <VenueCard
                  venue={venue}
                  onClick={handleVenueClick}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dining */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ 
            color: C.gold, 
            fontSize: 24, 
            fontWeight: 600, 
            marginBottom: 24,
            fontFamily: "'Cormorant Garamond', serif"
          }}>
            Dining
          </h2>
          <div
            style={{
              display: "flex",
              gap: 24,
              justifyContent: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {SUBCATEGORIES["Dining"].map((venue) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                style={{
                  width: "31%",
                  minWidth: 250,
                }}
              >
                <VenueCard
                  venue={venue}
                  onClick={handleVenueClick}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}