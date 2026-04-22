import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bellevueLogo from "../assets/bellevue-logo.png";

function getTokens(isDark) {
  return isDark ? {
    gold:      "#C9A84C",
    goldLight: "#E2C96A",
    goldFaint: "rgba(201,168,76,0.08)",
    goldBorder:"rgba(201,168,76,0.20)",
    border:    "rgba(201,168,76,0.14)",
    navText:   "rgba(245,239,224,0.70)",
  } : {
    gold:      "#9A6E1C",
    goldLight: "#C49A2C",
    goldFaint: "rgba(154,110,28,0.07)",
    goldBorder:"rgba(154,110,28,0.18)",
    border:    "rgba(154,110,28,0.12)",
    navText:   "rgba(26,22,18,0.65)",
  };
}

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

function ThemeToggle({ isDark, toggle, C }) {
  const TRACK_W = 48, TRACK_H = 26, KNOB = 20, PAD = 3;
  return (
    <button type="button" onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{ position:"relative", width:TRACK_W, height:TRACK_H, borderRadius:TRACK_H/2, border:`1px solid ${C.goldBorder}`, background:isDark?C.gold:"transparent", cursor:"pointer", padding:0, flexShrink:0, transition:"all 0.3s ease", display:"flex", alignItems:"center" }}>
      <span style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", left:isDark?TRACK_W-KNOB-PAD:PAD, width:KNOB, height:KNOB, borderRadius:"50%", background:isDark?"#111009":C.gold, display:"block", transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow:"0 2px 6px rgba(0,0,0,0.15)" }} />
    </button>
  );
}

export default function SharedNavbar({ isDark, toggle, showNavigation = false, scrolled = false, height = 58 }) {
  const navigate = useNavigate();
  const C = getTokens(isDark);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navBg = isDark ? "#0E0C08" : "#F2EDE0";

  const navLinkBase = {
    background:"none", border:"none", cursor:"pointer", fontFamily:FONT,
    fontSize:11, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase",
    color:C.navText, padding:0, whiteSpace:"nowrap", transition:"color 0.2s",
  };

  return (
    <>
      <style>{`
        #bv-nav,
        #bv-nav::before,
        #bv-nav::after {
          border: none !important;
          border-top: none !important;
          border-bottom: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          outline: none !important;
          background-image: none !important;
        }
        #bv-nav::before,
        #bv-nav::after {
          display: none !important;
          content: none !important;
        }
        @media (max-width:640px) {
          .bv-nav-desktop { display:none !important; }
          .bv-nav-burger  { display:flex !important; }
        }
        @media (min-width:641px) {
          .bv-nav-burger  { display:none !important; }
          .bv-nav-drawer  { display:none !important; }
        }
      `}</style>

      <nav id="bv-nav" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:9000,
        height:height,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 clamp(24px,4vw,60px)",
        background: navBg,
        border:       "none",
        borderTop:    "none",
        borderBottom: "none",
        borderLeft:   "none",
        borderRight:  "none",
        boxShadow:    "none",
        outline:      "none",
        boxSizing:    "border-box",
        transition:   "background 0.35s",
      }}>
        <img src={bellevueLogo} alt="The Bellevue Manila" onClick={() => navigate("/")}
          style={{ height:height===58?28:32, width:"auto", cursor:"pointer", display:"block", flexShrink:0,
            filter: isDark
              ? (height===58 ? "brightness(0) saturate(100%) invert(82%) sepia(18%) saturate(350%) hue-rotate(2deg)" : "none")
              : (height===58 ? "brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(600%) hue-rotate(8deg)" : "brightness(0) saturate(100%) invert(25%) sepia(40%) saturate(500%) hue-rotate(10deg)"),
            opacity:0.90, transition:"filter 0.35s,opacity 0.25s" }} />

        <div style={{ display:"flex", alignItems:"center", gap:16, flexShrink:0 }}>
          {showNavigation && (
            <div className="bv-nav-desktop" style={{ display:"flex", alignItems:"center", gap:16 }}>
              <button type="button" style={navLinkBase} onClick={() => navigate("/venues")}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.navText}>
                Event
              </button>
              <button type="button" style={navLinkBase}
                onClick={() => { const el = document.getElementById("home-dining"); if (el) el.scrollIntoView({ behavior:"smooth", block:"start" }); }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.navText}>
                Dining
              </button>
              <div style={{ width:1, height:18, background:C.border, flexShrink:0 }} />
            </div>
          )}
          <ThemeToggle isDark={isDark} toggle={toggle} C={C} />
        </div>

        {showNavigation && (
          <button className="bv-nav-burger" type="button" onClick={() => setMobileMenuOpen(p => !p)}
            style={{ display:"none", alignItems:"center", justifyContent:"center", width:36, height:36, background:"none", border:`1px solid ${C.border}`, borderRadius:6, cursor:"pointer", flexDirection:"column", gap:4, padding:0, flexShrink:0 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display:"block", width:18, height:1.5, background:C.navText, borderRadius:2 }} />
            ))}
          </button>
        )}
      </nav>

      {showNavigation && mobileMenuOpen && (
        <div className="bv-nav-drawer" style={{ position:"fixed", top:height, left:0, right:0, zIndex:8999, background:isDark?"#1A1812":"#FFFFFF", borderBottom:`1px solid ${C.border}`, padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          <button type="button" style={{ ...navLinkBase, textAlign:"left" }} onClick={() => { navigate("/venues"); setMobileMenuOpen(false); }}>Event</button>
          <button type="button" style={{ ...navLinkBase, textAlign:"left" }}
            onClick={() => { setMobileMenuOpen(false); const el = document.getElementById("home-dining"); if (el) el.scrollIntoView({ behavior:"smooth", block:"start" }); }}>
            Dining
          </button>
          <div style={{ height:1, background:C.border }} />
        </div>
      )}
    </>
  );
}