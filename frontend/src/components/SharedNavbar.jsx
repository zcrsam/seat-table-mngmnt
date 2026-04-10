import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bellevueLogo from "../assets/bellevue-logo.png";

// DESIGN TOKENS
function getTokens(isDark) {
  return isDark ? {
    gold: "#C9A84C",
    goldLight: "#E2C96A",
    goldDim: "#A07828",
    goldFaint: "rgba(201,168,76,0.08)",
    goldBorder: "rgba(201,168,76,0.20)",
    pageBg: "#111009",
    cardBg: "#1C1A14",
    text: "#F0E8D0",
    textSub: "#C8B880",
    textMuted: "#7A6E58",
    border: "rgba(201,168,76,0.14)",
    navBg: "#0E0C08",
    navBorder: "rgba(201,168,76,0.10)",
    navText: "rgba(245,239,224,0.70)",
  } : {
    gold: "#9A6E1C",
    goldLight: "#C49A2C",
    goldDim: "#7A5814",
    goldFaint: "rgba(154,110,28,0.07)",
    goldBorder: "rgba(154,110,28,0.18)",
    pageBg: "#F4EFE4",
    cardBg: "#FFFFFF",
    text: "#1A1510",
    textSub: "#6A5830",
    textMuted: "#9A8C6E",
    border: "rgba(154,110,28,0.12)",
    navBg: "#F2EDE0",
    navBorder: "rgba(154,110,28,0.14)",
    navText: "rgba(26,22,18,0.65)",
  };
}

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

// THEME TOGGLE
function ThemeToggle({ isDark, toggle, C }) {
  // Track: rounded pill, border only. Knob: solid gold circle slides inside.
  const TRACK_W = 52;
  const TRACK_H = 28;
  const KNOB    = 20;
  const PAD     = 4;

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        width: TRACK_W, height: TRACK_H,
        borderRadius: TRACK_H / 2,
        background: "transparent",
        border: `1.5px solid ${isDark ? "rgba(201,168,76,0.45)" : "rgba(154,110,28,0.40)"}`,
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "border-color 0.3s",
      }}
    >
      {/* Knob */}
      <span style={{
        position: "absolute",
        top: PAD - 2,
        left: isDark ? PAD - 2 : TRACK_W - KNOB - PAD + 2,
        width: KNOB, height: KNOB,
        borderRadius: "50%",
        background: C.gold,
        display: "block",
        transition: "left 0.28s cubic-bezier(0.4,0,0.2,1), background 0.3s",
        boxShadow: `0 1px 4px rgba(0,0,0,0.22)`,
      }} />
    </button>
  );
}

// MAIN SHARED NAVBAR
export default function SharedNavbar({ 
  isDark, 
  toggle, 
  showNavigation = false, 
  scrolled = false,
  height = 58 
}) {
  const navigate = useNavigate();
  const C = getTokens(isDark);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navBgSolid = isDark ? "#0E0C08" : "#F2EDE0";
  const navBordSolid = isDark ? "rgba(201,168,76,0.10)" : "rgba(154,110,28,0.14)";

  const navLinkBase = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: C.navText,
    padding: 0,
    whiteSpace: "nowrap",
    transition: "color 0.2s",
  };

  return (
    <>
      <style>{`
        nav { outline: none; border: none; }
        @media (max-width: 640px) {
          .shared-nav-desktop { display: none !important; }
          .shared-nav-burger  { display: flex !important; }
        }
        @media (min-width: 641px) {
          .shared-nav-burger  { display: none !important; }
          .shared-nav-drawer  { display: none !important; }
        }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000,
        height: height,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(24px, 4vw, 60px)",
        background: scrolled ? (showNavigation ? C.navBg : navBgSolid) : (showNavigation ? C.navBg : navBgSolid),
        backdropFilter: scrolled && showNavigation ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled && showNavigation ? "blur(20px)" : "none",
        borderBottom: scrolled && showNavigation ? `1px solid ${C.navBorder}` : `1px solid ${navBordSolid}`,
        boxSizing: "border-box",
        transition: "background 0.35s, border-color 0.35s",
      }}>
        <img
          src={bellevueLogo}
          alt="The Bellevue Manila"
          onClick={() => navigate("/")}
          style={{
            height: height === 58 ? 28 : 32, width: "auto", cursor: "pointer", display: "block", flexShrink: 0,
            filter: isDark
              ? (height === 58 
                ? "brightness(0) saturate(100%) invert(82%) sepia(18%) saturate(350%) hue-rotate(2deg)"
                : "none")
              : (height === 58
                ? "brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(600%) hue-rotate(8deg)"
                : "brightness(0) saturate(100%) invert(25%) sepia(40%) saturate(500%) hue-rotate(10deg)"),
            opacity: 0.90, transition: "filter 0.35s, opacity 0.25s",
          }}
        />

        {/* Right side navigation items */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          {/* Desktop Navigation */}
          {showNavigation && (
            <div className="shared-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button type="button" style={navLinkBase} onClick={() => navigate("/venues")}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.navText}>
                Event
              </button>

              <button type="button" style={navLinkBase}
                onClick={() => { const el = document.getElementById("home-dining"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.navText}>
                Dining
              </button>

              <div style={{ width: 1, height: 18, background: C.border, flexShrink: 0 }} />
            </div>
          )}

          {/* Theme Toggle - positioned on the right */}
          <ThemeToggle isDark={isDark} toggle={toggle} C={C} />
        </div>

        {/* Mobile Menu Button */}
        {showNavigation && (
          <button
            className="shared-nav-burger"
            type="button"
            onClick={() => setMobileMenuOpen(p => !p)}
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              width: 36, height: 36,
              background: "none",
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              cursor: "pointer",
              flexDirection: "column",
              gap: 4,
              padding: 0,
              flexShrink: 0,
            }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: "block", width: 18, height: 1.5, background: C.navText, borderRadius: 2, transition: "background 0.2s" }} />
            ))}
          </button>
        )}
      </nav>

      {/* Mobile Menu Drawer */}
      {showNavigation && mobileMenuOpen && (
        <div
          className="shared-nav-drawer"
          style={{
            position: "fixed",
            top: height, left: 0, right: 0,
            zIndex: 8999,
            background: isDark ? "#1A1812" : "#FFFFFF",
            borderBottom: `1px solid ${C.border}`,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <button type="button" style={{ ...navLinkBase, textAlign: "left" }}
            onClick={() => { navigate("/venues"); setMobileMenuOpen(false); }}>
            Event
          </button>
          <button type="button" style={{ ...navLinkBase, textAlign: "left" }}
            onClick={() => {
              setMobileMenuOpen(false);
              const el = document.getElementById("home-dining");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}>
            Dining
          </button>
          <div style={{ height: 1, background: C.border }} />
        </div>
      )}
    </>
  );
}
