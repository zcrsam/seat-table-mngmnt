// src/features/admin/pages/UnifiedSeatMapEditor.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminNavbar from "../../../components/layout/AdminNavbar";
import Sidebar from "../../../components/layout/Sidebar";
import SeatMap from "../../../components/seatmap/SeatMap";

// Venue configurations
const VENUE_CONFIGS = {
  "business-center": {
    wing: "Main Wing",
    room: "Business Center",
    title: "Business Center",
    theme: "light",
    colors: {
      gold: "#8C6B2A",
      goldFaint: "rgba(140,107,42,0.08)",
      pageBg: "#F7F4EE",
      surfaceBase: "#FFFFFF",
      borderDefault: "rgba(0,0,0,0.08)",
      borderAccent: "rgba(140,107,42,0.28)",
      textPrimary: "#18140E",
      textSecondary: "#7A7060",
      textTertiary: "rgba(24,20,14,0.35)",
      navBg: "rgba(247,244,238,0.98)",
      navBorder: "rgba(140,107,42,0.14)",
      divider: "rgba(0,0,0,0.06)",
      canvasBg: "#EDEAE2",
      canvasBorder: "rgba(140,107,42,0.18)",
    }
  },
  "20-20-a": {
    wing: "Main Wing",
    room: "20/20 Function Room A",
    title: "20/20 Function Room A",
    theme: "dark",
    colors: {
      gold: "#C4A35A", goldLight: "#D9BC7A", goldDim: "#8C7240",
      goldFaint: "rgba(196,163,90,0.08)", goldFaintest: "rgba(196,163,90,0.04)",
      pageBg: "#0A0908", surfaceBase: "#111009", surfaceRaised: "#161410",
      surfaceInput: "rgba(255,255,255,0.04)",
      borderFaint: "rgba(255,255,255,0.04)", borderDefault: "rgba(255,255,255,0.08)",
      borderStrong: "rgba(255,255,255,0.12)", borderAccent: "rgba(196,163,90,0.30)",
      textPrimary: "#EDE8DF", textSecondary: "#8A8278",
      textTertiary: "rgba(237,232,223,0.32)", textOnAccent: "#0A0908",
      red: "#B85C5C", redFaint: "rgba(184,92,92,0.08)", redBorder: "rgba(184,92,92,0.20)",
      green: "#4A9E7E", greenFaint: "rgba(74,158,126,0.08)", greenBorder: "rgba(74,158,126,0.20)",
    }
  },
  "20-20-b": {
    wing: "Main Wing",
    room: "20/20 Function Room B",
    title: "20/20 Function Room B",
    theme: "dark",
    colors: {
      gold: "#C4A35A", goldLight: "#D9BC7A", goldDim: "#8C7240",
      goldFaint: "rgba(196,163,90,0.08)", goldFaintest: "rgba(196,163,90,0.04)",
      pageBg: "#0A0908", surfaceBase: "#111009", surfaceRaised: "#161410",
      surfaceInput: "rgba(255,255,255,0.04)",
      borderFaint: "rgba(255,255,255,0.04)", borderDefault: "rgba(255,255,255,0.08)",
      borderStrong: "rgba(255,255,255,0.12)", borderAccent: "rgba(196,163,90,0.30)",
      textPrimary: "#EDE8DF", textSecondary: "#8A8278",
      textTertiary: "rgba(237,232,223,0.32)", textOnAccent: "#0A0908",
      red: "#B85C5C", redFaint: "rgba(184,92,92,0.08)", redBorder: "rgba(184,92,92,0.20)",
      green: "#4A9E7E", greenFaint: "rgba(74,158,126,0.08)", greenBorder: "rgba(74,158,126,0.20)",
    }
  },
  "20-20-c": {
    wing: "Main Wing",
    room: "20/20 Function Room C",
    title: "20/20 Function Room C",
    theme: "dark",
    colors: {
      gold: "#C4A35A", goldLight: "#D9BC7A", goldDim: "#8C7240",
      goldFaint: "rgba(196,163,90,0.08)", goldFaintest: "rgba(196,163,90,0.04)",
      pageBg: "#0A0908", surfaceBase: "#111009", surfaceRaised: "#161410",
      surfaceInput: "rgba(255,255,255,0.04)",
      borderFaint: "rgba(255,255,255,0.04)", borderDefault: "rgba(255,255,255,0.08)",
      borderStrong: "rgba(255,255,255,0.12)", borderAccent: "rgba(196,163,90,0.30)",
      textPrimary: "#EDE8DF", textSecondary: "#8A8278",
      textTertiary: "rgba(237,232,223,0.32)", textOnAccent: "#0A0908",
      red: "#B85C5C", redFaint: "rgba(184,92,92,0.08)", redBorder: "rgba(184,92,92,0.20)",
      green: "#4A9E7E", greenFaint: "rgba(74,158,126,0.08)", greenBorder: "rgba(74,158,126,0.20)",
    }
  }
};

const FONTS = {
  light: {
    body: "'DM Sans', sans-serif",
    heading: "'Cormorant Garamond', Georgia, serif",
  },
  dark: {
    display: "'Playfair Display','Times New Roman',serif",
    body: "'Inter','Helvetica Neue',Arial,sans-serif",
    label: "'Inter','Helvetica Neue',Arial,sans-serif",
  }
};

export default function UnifiedSeatMapEditor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [venueType, setVenueType] = useState("business-center");
  const navigate = useNavigate();
  const location = useLocation();

  // Determine venue type from URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("20-20A")) setVenueType("20-20-a");
    else if (path.includes("20-20B")) setVenueType("20-20-b");
    else if (path.includes("20-20C")) setVenueType("20-20-c");
    else setVenueType("business-center");
  }, [location.pathname]);

  const config = VENUE_CONFIGS[venueType];
  const C = config.colors;
  const F = FONTS[config.theme];

  return (
    <div style={{ minHeight: "100vh", fontFamily: F.body, background: C.pageBg, color: C.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <AdminNavbar />

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeNav="seat-map"
        />

        {/* Main content area */}
        <div style={{ flex: 1, minWidth: 0, height: "calc(100vh - 0px)", background: C.pageBg, overflow: "hidden" }}>

          {/* Top bar */}
          <div style={{
            position: "sticky", top: 0, zIndex: 100,
            background: config.theme === "dark" ? C.surfaceBase : C.navBg,
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${config.theme === "dark" ? C.borderDefault : C.navBorder}`,
            padding: "28px 28px",
            height: 52,
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "8px" }}>
                <span style={{ fontFamily: F.label || F.body, fontSize: 9, letterSpacing: "0.20em", color: C.gold, fontWeight: 700, textTransform: "uppercase" }}>
                  SEAT MAP EDITOR
                </span>
                <span style={{ color: C.textTertiary, fontSize: 11 }}>·</span>
                <span style={{ fontFamily: F.label || F.body, fontSize: 9, letterSpacing: "0.14em", color: C.textSecondary, fontWeight: 600, textTransform: "uppercase" }}>
                  {config.title}
                </span>
              </div>
            </div>
          </div>

          {/* Seat Map content */}
          <div style={{ padding: "0", height: "calc(100vh - 320px)", width: "100%", maxWidth: "1400px", margin: "0 auto", overflow: "hidden" }}>
            <SeatMap
              editMode={true}
              wing={config.wing}
              room={config.room}
              virtualWidth={1200}
              virtualHeight={800}
            />
          </div>
        </div>
      </div>
    </div>
  );
}