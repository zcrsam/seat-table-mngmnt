// src/features/client/pages/HomePage.jsx
import { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import heroBanner from "../../../assets/banner-grandroom.jpg";
import mainWingImg from "../../../assets/main-wing.jpeg";
import towerWingImg from "../../../assets/tower-wing.jpeg";
import diningImg from "../../../assets/dining.jpeg";
import qsinaImg from "../../../assets/qsina.jpeg";
import qsinaImg2 from "../../../assets/qsina2.jpeg";
import qsinaImg3 from "../../../assets/qsina3.jpeg";
import hanakazuImg from "../../../assets/hanakazu.jpeg";
import hanakazuImg2 from "../../../assets/hanakazu2.jpeg";
import hanakazuImg3 from "../../../assets/hanakazu3.jpeg";
import phoenixCourtImg from "../../../assets/phoenix-court.jpeg";
import bellevueLogo from "../../../assets/bellevue-logo.png";

// ─────────────────────────────────────────────
// THEME CONTEXT
// ─────────────────────────────────────────────
const ThemeContext = createContext({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

// ─────────────────────────────────────────────
// DESIGN TOKENS — per-theme
// ─────────────────────────────────────────────
function getTokens(isDark) {
  return isDark
    ? {
        gold:              "#C9A84C",
        goldLight:         "#E2C96A",
        goldDark:          "#9A7A2E",
        goldFaint:         "rgba(201,168,76,0.12)",
        pageBg:            "#0E0D09",
        darkCard:          "#1A1812",
        darkMid:           "#242018",
        textPrimary:       "#F7F3EA",
        textSub:           "rgba(245,239,224,0.52)",
        textMuted:         "#8A8070",
        textFaint:         "#4A4438",
        textDeep:          "#3A3428",
        border:            "rgba(201,168,76,0.18)",
        borderLight:       "rgba(201,168,76,0.10)",
        cardBg:            "rgba(10,9,6,0.52)",
        cardFooterBg:      "rgba(201,168,76,0.05)",
        widgetBg:          "rgba(0,0,0,0.55)",
        fieldBg:           "rgba(255,255,255,0.07)",
        nlBg:              "#242018",
        footerBg:          "#0E0D09",
        diningBg:          "#0E0D09",
        badgeBg:           "rgba(0,0,0,0.42)",
        scrollCueOp:       0.28,
        footerLinkDefault: "#4A4438",
        navBg:             "rgba(14,13,9,0.92)",
        navBorder:         "rgba(201,168,76,0.15)",
        navText:           "rgba(245,239,224,0.70)",
      }
    : {
        gold:        "#A07828",
        goldLight:   "#C9A84C",
        goldDark:    "#7A5A18",
        goldFaint:   "rgba(160,120,40,0.10)",
        pageBg:      "#F5F0E8",
        darkCard:    "#FFFFFF",
        darkMid:     "#EDE7D9",
        textPrimary: "#1A1612",
        textSub:     "rgba(26,22,18,0.60)",
        textMuted:   "#5A5040",
        textFaint:   "#8A7A60",
        textDeep:    "#9A8A70",
        border:      "rgba(160,120,40,0.22)",
        borderLight: "rgba(160,120,40,0.14)",
        cardBg:      "rgba(255,255,255,0.82)",
        cardFooterBg:"rgba(160,120,40,0.06)",
        widgetBg:    "rgba(255,252,245,0.94)",
        fieldBg:     "rgba(0,0,0,0.04)",
        nlBg:        "#EDE7D9",
        footerBg:    "#F5F0E8",
        diningBg:    "#F5F0E8",
        heroOverlay: "rgba(20,15,5,0.62)",
        badgeBg:     "rgba(255,255,255,0.72)",
        scrollCueOp: 0.38,
        footerLinkDefault: "#7A6A50",
        navBg:             "rgba(245,240,232,0.96)",
        navBorder:         "rgba(160,120,40,0.18)",
        navText:           "rgba(26,22,18,0.65)",
      };
}

const F = {
  display: "Georgia, 'Times New Roman', serif",
  body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

// nav height constant — used everywhere to avoid overlap
const NAV_H = 64;

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const EVENT_CATEGORIES = [
  { id: 1, label: "MAIN WING",  subtitle: "Elegant banquets & corporate events", img: mainWingImg,  section: "main-wing"  },
  { id: 2, label: "TOWER WING", subtitle: "Grand celebrations & gala evenings",  img: towerWingImg, section: "tower-wing" },
  { id: 3, label: "DINING",     subtitle: "Fine dining & culinary experiences",  img: diningImg,    section: "dining"     },
];

const RESTAURANTS = [
  {
    id: "qsina", name: "Qsina",
    description: "Qsina offers diverse culinary delights with both international buffets and à la carte options. From lavish breakfast spreads to intimate dinner experiences.",
    imgs: [qsinaImg, qsinaImg2, qsinaImg3],
    diningTimes: [
      { label: "Breakfast Buffet", hours: "6:00 – 10:00 AM" },
      { label: "Lunch",            hours: "MON · TUE · SAT · SUN" },
      { label: "Light Lunch",      hours: "WED · FRI" },
      { label: "Dinner",           hours: "MON · THURS" },
      { label: "Dinner Buffet",    hours: null },
    ],
  },
  {
    id: "hanakazu", name: "Hanakazu",
    description: "Hanakazu brings authentic Japanese cuisine to The Bellevue Manila. Savor fresh sushi, sashimi, and teppanyaki in an elegant setting.",
    imgs: [hanakazuImg, hanakazuImg2, hanakazuImg3],
    diningTimes: [
      { label: "Lunch",   hours: "11:30 AM – 2:30 PM" },
      { label: "Dinner",  hours: "6:00 PM – 10:00 PM" },
      { label: "Omakase", hours: "By reservation" },
    ],
  },
  {
    id: "phoenix-court", name: "Phoenix Court",
    description: "Phoenix Court presents refined Cantonese and Chinese cuisine. Experience dim sum, Peking duck, and classic dishes in a sophisticated atmosphere.",
    imgs: [phoenixCourtImg, qsinaImg2, qsinaImg3],
    diningTimes: [
      { label: "Dim Sum", hours: "5:00 AM – 11:29 PM" },
      { label: "Lunch",   hours: "11:30 AM – 2:30 PM" },
      { label: "Dinner",  hours: "6:00 PM – 10:00 PM" },
    ],
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") { setVis(true); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

// ─────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────
function GoldLine({ width = 32 }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  return <span style={{ display: "inline-block", width, height: 1, background: C.gold, verticalAlign: "middle" }} />;
}

function Divider({ mb = 0, mt = 0 }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  return <div style={{ height: 1, background: C.borderLight, margin: `${mt}px 0 ${mb}px` }} />;
}

// ─────────────────────────────────────────────
// THEME TOGGLE — "DARK ◐ LIGHT" pill matching screenshot
// ─────────────────────────────────────────────
function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  const C = getTokens(isDark);

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: 0,
        background: "none",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {/* Pill track */}
      <span style={{
        position: "relative",
        width: 46,
        height: 25,
        borderRadius: 13,
        background: isDark ? "#2C2A1E" : "#DDD6C0",
        border: `1.5px solid ${isDark ? "rgba(201,168,76,0.28)" : "rgba(160,120,40,0.22)"}`,
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        transition: "background 0.32s, border-color 0.32s",
        verticalAlign: "middle",
      }}>
        {/* Sliding thumb */}
        <span style={{
          position: "absolute",
          top: 2,
          left: isDark ? 2 : "calc(100% - 23px)",
          width: 19,
          height: 19,
          borderRadius: "50%",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "left 0.30s cubic-bezier(.4,0,.2,1)",
          flexShrink: 0,
        }}>
          {/* Half-circle moon icon — same as screenshot */}
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
            <path d="M10 1a9 9 0 1 0 9 9A9 9 0 0 0 10 1zm0 16V3a7 7 0 0 1 0 14z"
              fill={isDark ? "#1C1A10" : "#B8922A"} />
          </svg>
        </span>
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// TOP NAV — fixed, no bottom border, logo + links + toggle + manage booking
// ─────────────────────────────────────────────
function TopNav({ onManageBooking }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkBase = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: F.body,
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
        @media (max-width: 640px) {
          .hp-nav-desktop { display: none !important; }
          .hp-nav-burger  { display: flex !important; }
        }
        @media (min-width: 641px) {
          .hp-nav-burger  { display: none !important; }
          .hp-nav-drawer  { display: none !important; }
        }
      `}</style>

      {/* ── Main nav bar ── */}
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 9000,
        height: NAV_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(16px,4vw,52px)",
        background: C.navBg,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        /* FIX: no border-bottom → removes the white line */
        borderBottom: "none",
        boxSizing: "border-box",
        transition: "background 0.35s",
      }}>
        {/* Logo */}
        <img
          src={bellevueLogo}
          alt="The Bellevue Manila"
          onClick={() => navigate("/")}
          style={{
            height: 32, width: "auto", cursor: "pointer", display: "block",
            filter: isDark ? "none" : "brightness(0) saturate(100%) invert(25%) sepia(40%) saturate(500%) hue-rotate(10deg)",
            transition: "filter 0.35s", flexShrink: 0,
          }}
        />

        {/* Desktop controls */}
        <div className="hp-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
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

          {/* Modern DARK ◐ LIGHT toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <button
          className="hp-nav-burger"
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
      </nav>

      {/* Mobile slide-down drawer */}
      {mobileMenuOpen && (
        <div
          className="hp-nav-drawer"
          style={{
            position: "fixed",
            top: NAV_H, left: 0, right: 0,
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
          <ThemeToggle />
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// HERO + BROWSE
// ─────────────────────────────────────────────
function HeroBrowseSection({ onNavigateToVenues, onManageBooking }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const [loaded, setLoaded] = useState(false);
  const [hovCard, setHovCard] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fade = (delay = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.85s ${delay}s ease, transform 0.85s ${delay}s ease`,
  });

  return (
    <section style={{
      position: "relative",
      /* FIX: paddingTop = nav height so hero content starts below nav */
      paddingTop: NAV_H,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Background */}
      <img src={heroBanner} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover",
        filter: `blur(5px) brightness(${isDark ? 0.22 : 0.28})`,
        transform: "scale(1.06)", pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(6,5,3,0.70)" : "rgba(20,15,5,0.64)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 55% at 50% 26%, rgba(201,168,76,0.10) 0%, transparent 68%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 38%, rgba(0,0,0,0.50) 100%)" }} />

      {/* Hero copy — FIX: tight padding on mobile, no excessive top space */}
      <div style={{
        position: "relative", flex: "0 0 auto",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "clamp(28px,4vw,64px) clamp(20px,5vw,60px) clamp(24px,3vw,44px)",
      }}>
        <h1 style={{
          ...fade(0.10),
          fontFamily: F.display,
          fontSize: "clamp(28px,5.2vw,65px)",
          fontWeight: 600, color: "#F5EFE0",
          lineHeight: 1.06, letterSpacing: "-0.025em",
          margin: "0 0 16px",
        }}>
          Reserve Your
          <br />
          <em style={{ color: "#C9A84C", fontStyle: "italic" }}>Perfect Setting.</em>
        </h1>

        <p style={{
          ...fade(0.19),
          fontFamily: F.body, fontSize: "clamp(13px,1.4vw,16px)",
          color: "rgba(245,239,224,0.55)", lineHeight: 1.85,
          maxWidth: 440, margin: "0 auto 24px", fontWeight: 400,
        }}>
          Choose from premium venues and dining across three wings,
          then pick your seat and get confirmed in minutes.
        </p>
      </div>

      {/* Wing Cards */}
      <div id="browse-wings" style={{
        position: "relative", flex: "1 0 auto",
        padding: "0 clamp(16px,4vw,40px) clamp(24px,5vw,56px)",
      }}>
        {/* Section label */}
        <div style={{
          ...fade(0.37),
          maxWidth: 1160, margin: "0 auto 18px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.14)" }} />
          <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, letterSpacing: "0.30em", textTransform: "uppercase", color: "rgba(201,168,76,0.62)" }}>
            Select a Wing to Reserve
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.14)" }} />
        </div>

        {/* Manage Booking Button */}
        <div style={{ ...fade(0.43), maxWidth: 1160, margin: "0 auto 24px", display: "flex", justifyContent: "center" }}>
          <button
            onClick={onManageBooking}
            style={{
              padding: "12px 24px",
              borderRadius: 0,
              border: "none",
              background: C.gold,
              fontFamily: F.body,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isDark ? "#0E0D09" : "#FFFFFF",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 4px 12px rgba(201,168,76,0.25)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = C.goldLight}
            onMouseLeave={(e) => e.currentTarget.style.background = C.gold}
          >
            Manage My Booking
          </button>
        </div>

        {/* Cards — 1 col mobile, 3 col desktop */}
        <div style={{
          ...fade(0.43),
          maxWidth: 1160, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "clamp(10px,1.8vw,18px)",
        }}>
          {EVENT_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigateToVenues(cat.section)}
              onMouseEnter={() => setHovCard(cat.id)}
              onMouseLeave={() => setHovCard(null)}
              style={{
                cursor: "pointer",
                borderRadius: 10,
                overflow: "hidden",
                /* FIX: theme-aware card background */
                background: isDark ? "rgba(10,9,6,0.62)" : "rgba(255,255,255,0.90)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: hovCard === cat.id
                  ? "1px solid rgba(201,168,76,0.58)"
                  : `1px solid ${isDark ? "rgba(201,168,76,0.13)" : "rgba(160,120,40,0.20)"}`,
                boxShadow: hovCard === cat.id
                  ? "0 20px 56px rgba(0,0,0,0.55)"
                  : "0 4px 22px rgba(0,0,0,0.22)",
                transform: hovCard === cat.id ? "translateY(-6px)" : "translateY(0)",
                transition: "transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s, border-color 0.22s, background 0.35s",
              }}
            >
              {/* Image */}
              <div style={{ height: "clamp(135px,14vw,200px)", overflow: "hidden", position: "relative" }}>
                <img src={cat.img} alt={cat.label} loading="lazy" style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  transition: "transform 0.55s ease",
                  transform: hovCard === cat.id ? "scale(1.07)" : "scale(1.01)",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 52%)",
                  opacity: hovCard === cat.id ? 1 : 0.55, transition: "opacity 0.28s",
                }} />
                <div style={{
                  position: "absolute", top: 12, left: 12,
                  padding: "3px 10px",
                  background: "rgba(0,0,0,0.45)",
                  backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(201,168,76,0.22)", borderRadius: 20,
                }}>
                  <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C" }}>{cat.label}</span>
                </div>
              </div>

              {/* Card footer — FIX: theme-aware text colors */}
              <div style={{
                padding: "13px 15px 15px",
                borderTop: `1px solid ${isDark ? "rgba(201,168,76,0.09)" : "rgba(160,120,40,0.10)"}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: hovCard === cat.id
                  ? (isDark ? "rgba(201,168,76,0.05)" : "rgba(160,120,40,0.04)")
                  : "transparent",
                transition: "background 0.22s",
              }}>
                <div>
                  {/* FIX: C.textPrimary — dark on white (light), cream on dark */}
                  <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: C.textPrimary, marginBottom: 3, transition: "color 0.35s" }}>
                    {cat.label}
                  </div>
                  {/* FIX: C.textMuted */}
                  <div style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, transition: "color 0.35s" }}>
                    {cat.subtitle}
                  </div>
                </div>
                <div style={{
                  width: 27, height: 27, borderRadius: "50%", flexShrink: 0,
                  border: `1px solid ${hovCard === cat.id ? C.gold : C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: hovCard === cat.id ? C.gold : "transparent",
                  transition: "all 0.22s",
                }}>
                  <span style={{
                    fontSize: 12,
                    color: hovCard === cat.id ? (isDark ? "#0E0D09" : "#FFFFFF") : C.gold,
                    display: "inline-block",
                    transform: hovCard === cat.id ? "translateX(1px)" : "translateX(0)",
                    transition: "transform 0.2s, color 0.22s",
                  }}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div style={{ ...fade(0.50), maxWidth: 1160, margin: "14px auto 0", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={() => onNavigateToVenues()}
            style={{ padding: "7px 18px", border: "1px solid rgba(201,168,76,0.26)", background: "transparent", color: "rgba(245,239,224,0.46)", fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.26)"; e.currentTarget.style.color = "rgba(245,239,224,0.46)"; }}>
            View All Venues →
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: loaded ? 0.28 : 0, transition: "opacity 1.2s 1.2s", pointerEvents: "none" }}>
        <span style={{ fontFamily: F.body, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "#C9A84C" }}>Scroll</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
        </svg>
      </div>
    </section>
  );
}

function WingCard({ cat, onNavigateToVenues }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onNavigateToVenues(cat.section)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: "pointer", borderRadius: 10, overflow: "hidden",
        border: hov ? "1px solid rgba(201,168,76,0.58)" : "1px solid rgba(201,168,76,0.13)",
        boxShadow: hov ? "0 20px 56px rgba(0,0,0,0.55)" : "0 4px 22px rgba(0,0,0,0.32)",
        transform: hov ? "translateY(-7px)" : "translateY(0)",
        transition: "transform 0.30s cubic-bezier(.22,.68,0,1.2), box-shadow 0.30s, border-color 0.22s",
        background: "rgba(10,9,6,0.52)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      }}>
      <div style={{ height: "clamp(155px,15vw,205px)", overflow: "hidden", position: "relative" }}>
        <img src={cat.img} alt={cat.label} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.55s ease", transform: hov ? "scale(1.07)" : "scale(1.01)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 52%)", opacity: hov ? 1 : 0.52, transition: "opacity 0.28s" }} />
        <div style={{ position: "absolute", top: 13, left: 13, padding: "4px 10px", background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", border: "1px solid rgba(201,168,76,0.22)", borderRadius: 20 }}>
          <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C" }}>{cat.label}</span>
        </div>
      </div>
      <div style={{ padding: "15px 18px 17px", borderTop: "1px solid rgba(201,168,76,0.09)", display: "flex", alignItems: "center", justifyContent: "space-between", background: hov ? "rgba(201,168,76,0.05)" : "transparent", transition: "background 0.22s" }}>
        <div>
          <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: "#F5EFE0", marginBottom: 3 }}>{cat.label}</div>
          <div style={{ fontFamily: F.body, fontSize: 12, color: "rgba(138,128,112,0.85)" }}>{cat.subtitle}</div>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, border: `1px solid ${hov ? "#C9A84C" : "rgba(201,168,76,0.24)"}`, display: "flex", alignItems: "center", justifyContent: "center", background: hov ? "#C9A84C" : "transparent", transition: "all 0.22s" }}>
          <span style={{ fontSize: 13, color: hov ? "#0E0D09" : "#C9A84C", display: "inline-block", transform: hov ? "translateX(1px)" : "translateX(0)", transition: "transform 0.2s" }}>→</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DINING SECTION
// ─────────────────────────────────────────────
function DiningSection({ onNavigate, initialRestaurantId }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);

  const [ref, vis] = useScrollReveal(0.08);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("13:00");
  const [guests, setGuests] = useState(2);
  const [activeRestaurant, setActiveRestaurant] = useState(0);
  const [forcedHighlightedLabel, setForcedHighlightedLabel] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const restaurant = RESTAURANTS[activeRestaurant];
  const imgs = restaurant?.imgs ?? [qsinaImg, qsinaImg2, qsinaImg3];
  const totalRestaurants = RESTAURANTS.length;

  useEffect(() => {
    if (!initialRestaurantId) return;
    const idx = RESTAURANTS.findIndex((r) => r.id === initialRestaurantId);
    if (idx >= 0) setActiveRestaurant(idx);
  }, [initialRestaurantId]);

  useEffect(() => { setActiveImg(0); }, [activeRestaurant]);
  useEffect(() => { setForcedHighlightedLabel(null); }, [activeRestaurant]);
  useEffect(() => {
    const id = setInterval(() => setActiveImg((n) => (n + 1) % imgs.length), 4000);
    return () => clearInterval(id);
  }, [imgs.length]);

  const selectedMinutes = useMemo(() => {
    if (!time) return null;
    const s = String(time).trim();
    const m = /^(\d{1,2}):(\d{2})$/.exec(s);
    if (m) { let hh = Number(m[1]); const mm = Number(m[2]); if (Number.isFinite(hh) && Number.isFinite(mm)) { if (hh === 24) hh = 0; return hh * 60 + mm; } }
    return null;
  }, [time]);

  const parseHoursRange = (hours) => {
    if (!hours || typeof hours !== "string") return null;
    const re = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i;
    const m = re.exec(hours); if (!m) return null;
    const toMin = (h, min, ap) => {
      let hh = Number(h); const mm = Number(min || 0); const u = String(ap || "").toUpperCase();
      if (u === "AM") { if (hh === 12) hh = 0; } else if (u === "PM") { if (hh !== 12) hh += 12; }
      return hh * 60 + mm;
    };
    const start = toMin(m[1], m[2], m[3]); const end = toMin(m[4], m[5], m[6]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return { start, end };
  };

  const fallbackSlot = useMemo(() => {
    if (selectedMinutes == null) return null;
    if (selectedMinutes >= 360  && selectedMinutes < 600)  return "Breakfast Buffet";
    if (selectedMinutes >= 660  && selectedMinutes < 780)  return "Lunch";
    if (selectedMinutes >= 780  && selectedMinutes < 1020) return "Light Lunch";
    if (selectedMinutes >= 1020 && selectedMinutes < 1200) return "Dinner";
    if (selectedMinutes >= 1200 && selectedMinutes < 1320) return "Dinner Buffet";
    return null;
  }, [selectedMinutes]);

  const getNextDateForWeekdays = (weekdays) => {
    if (!weekdays?.length) return null;
    const names = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const dow = names[d.getDay()];
      if (weekdays.includes(dow)) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    return null;
  };

  const repTime = (label) => ({ "Breakfast Buffet":"08:00", Lunch:"12:00", "Light Lunch":"15:00", Dinner:"18:00", "Dinner Buffet":"20:00" }[label] || "12:00");

  const selectDiningTime = (d) => {
    const range = parseHoursRange(d.hours);
    if (range) { const hh = Math.floor(range.start / 60); const mm = range.start % 60; setTime(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`); }
    else setTime(repTime(d.label));
    const hh = String(d.hours || "").toLowerCase();
    const dayMatches = hh.match(/mon|tue|wed|thu|thur|fri|sat|sun/g);
    if (dayMatches?.length) { const tokens = dayMatches.map((s) => s.replace("thur", "thu").slice(0, 3)); const next = getNextDateForWeekdays(tokens); if (next) setDate(next); }
    setForcedHighlightedLabel(d.label);
  };

  const highlightedLabel = useMemo(() => {
    const times = restaurant?.diningTimes ?? [];
    if (forcedHighlightedLabel && times.some((t) => t.label === forcedHighlightedLabel)) return forcedHighlightedLabel;
    if (!times?.length || selectedMinutes == null) return null;
    for (const t of times) {
      const range = parseHoursRange(t.hours); if (!range) continue;
      const { start, end } = range;
      if (start <= end ? selectedMinutes >= start && selectedMinutes <= end : selectedMinutes >= start || selectedMinutes <= end) return t.label;
    }
    return null;
  }, [restaurant, selectedMinutes, forcedHighlightedLabel]);

  return (
    <section
      ref={ref}
      style={{
        background: C.diningBg,
        /* FIX: sufficient top padding so content never overlaps nav */
        padding: "clamp(52px,8vw,110px) clamp(16px,4vw,40px) clamp(64px,9vw,120px)",
        overflow: "hidden",
        transition: "background 0.35s ease",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Responsive grid — stacks on mobile */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "clamp(52px,6vw,80px)",
          alignItems: "start",
        }}>

          {/* LEFT — image + widget */}
          <div style={{ position: "relative", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(-30px)", transition: "opacity 0.8s, transform 0.8s" }}>
            <div style={{ borderRadius: 10, overflow: "hidden", height: 400, position: "relative" }}>
              {imgs.map((src, i) => (
                <img key={src} src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: activeImg === i ? 1 : 0, transition: "opacity 0.55s ease" }} />
              ))}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(14,13,9,0.80) 0%,transparent 55%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 110, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                {imgs.map((_, i) => (
                  <button key={i} type="button" onClick={() => setActiveImg(i)} style={{ width: 6, height: 6, borderRadius: "50%", border: "none", background: i === activeImg ? C.gold : "rgba(255,255,255,0.35)", cursor: "pointer", padding: 0, transition: "background 0.2s" }} />
                ))}
              </div>
            </div>

            {/* Floating booking widget */}
            <div style={{ position: "absolute", bottom: -28, left: 20, right: 20, background: C.widgetBg, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 22px", boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.55)" : "0 20px 60px rgba(0,0,0,0.14)", transition: "background 0.35s, border-color 0.35s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.goldFaint, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: C.gold, fontSize: 13 }}>⌖</span>
                </div>
                <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold }}>Find Restaurants</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <FieldInput type="date" value={date} onChange={(v) => { setForcedHighlightedLabel(null); setDate(v); }} />
                <FieldInput type="time" value={time} onChange={(v) => { setForcedHighlightedLabel(null); setTime(v); }} />
              </div>
              <GuestPicker value={guests} onChange={setGuests} style={{ marginBottom: 12 }} />
              <button type="button" onClick={() => onNavigate("venue")}
                style={{ width: "100%", padding: "11px", background: C.gold, border: "none", borderRadius: 4, fontFamily: F.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: isDark ? "#0E0D09" : "#FFFFFF", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.goldLight)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}>
                SUBMIT
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ paddingTop: 10, opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(30px)", transition: "opacity 0.8s 0.15s, transform 0.8s 0.15s", position: "relative", zIndex: 10005 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {[{d:-1,disabled:activeRestaurant===0,lbl:"←"},{d:1,disabled:activeRestaurant===totalRestaurants-1,lbl:"→"}].map(({d,disabled,lbl}) => (
                <button key={lbl} type="button" disabled={disabled}
                  onClick={() => setActiveRestaurant((n) => Math.max(0, Math.min(totalRestaurants-1, n+d)))}
                  style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.border}`, background: "transparent", color: disabled ? C.textMuted : C.gold, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", fontSize: 15 }}
                  onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = C.gold; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}>
                  {lbl}
                </button>
              ))}
            </div>

            <h2 style={{ fontFamily: F.display, fontSize: "clamp(32px,4.5vw,58px)", fontWeight: 600, color: C.textPrimary, marginBottom: 12, lineHeight: 0.95, letterSpacing: "-0.01em", transition: "color 0.35s" }}>
              {restaurant?.name}
            </h2>
            <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, lineHeight: 1.85, marginBottom: 24, maxWidth: 380, transition: "color 0.35s" }}>
              {restaurant?.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
              {(restaurant?.diningTimes ?? []).map((d) => {
                const active = highlightedLabel ? d.label === highlightedLabel : false;
                return (
                  <button key={d.label} type="button" onClick={() => selectDiningTime(d)}
                    style={{ padding: "6px 13px", borderRadius: 3, background: active ? C.gold : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"), border: `1px solid ${active ? C.gold : C.border}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", position: "relative", zIndex: 10006, transition: "background 0.2s, border-color 0.2s" }}>
                    <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: active ? (isDark ? "#0E0D09" : "#FFFFFF") : C.gold }}>{d.label}</div>
                    {d.hours && <div style={{ fontFamily: F.body, fontSize: 11, color: active ? (isDark ? "rgba(14,13,9,0.55)" : "rgba(255,255,255,0.7)") : C.textMuted, marginTop: 2 }}>{d.hours}</div>}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {imgs.map((src, i) => (
                <div key={src}
                  onClick={() => { setActiveImg(i); const pref = restaurant?.diningTimes?.[0]; if (pref) selectDiningTime(pref); }}
                  style={{ flex: 1, height: 62, borderRadius: 5, overflow: "hidden", cursor: "pointer", border: activeImg === i ? `2px solid ${C.gold}` : "2px solid transparent", transition: "border 0.2s", position: "relative", zIndex: 40 }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldInput({ type, value, onChange }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", background: C.fieldBg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.textPrimary, fontFamily: F.body, fontSize: 13, outline: "none", boxSizing: "border-box", colorScheme: isDark ? "dark" : "light", transition: "background 0.3s, border-color 0.3s, color 0.3s" }} />
  );
}

function GuestPicker({ value, onChange, min = 1, max = 20, style }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const clamp = (n) => Math.max(min, Math.min(max, n));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: C.fieldBg, border: `1px solid ${C.border}`, borderRadius: 4, transition: "background 0.3s, border-color 0.3s", ...style }}>
      <button type="button" onClick={() => onChange(clamp(value-1))} disabled={value<=min} style={{ width: 28, height: 28, borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: value<=min ? C.textMuted : C.gold, fontSize: 17, cursor: value<=min ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: value<=min ? 0.5 : 1 }}>−</button>
      <div style={{ flex: 1, display: "grid", gap: 3 }}>
        <div style={{ fontFamily: F.body, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.textSub, textAlign: "center" }}>Guests</div>
        <input type="text" inputMode="numeric" pattern="[0-9]*" value={String(value)}
          onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g,""); const next = raw===""?min:Number(raw); if(!Number.isFinite(next))return; onChange(clamp(Math.round(next))); }}
          style={{ width: "100%", height: 27, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${C.border}`, borderRadius: 5, color: C.textPrimary, fontFamily: F.body, fontSize: 13, textAlign: "center", outline: "none", transition: "background 0.3s, color 0.3s" }} />
      </div>
      <button type="button" onClick={() => onChange(clamp(value+1))} disabled={value>=max} style={{ width: 28, height: 28, borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: value>=max ? C.textMuted : C.gold, fontSize: 17, cursor: value>=max ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: value>=max ? 0.5 : 1 }}>+</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────────
function NewsletterSection() {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [ref, vis] = useScrollReveal(0.2);

  return (
    <section ref={ref} style={{ position: "relative", overflow: "hidden", background: C.nlBg, borderTop: `1px solid ${C.borderLight}`, transition: "background 0.35s ease" }}>
      <div style={{ position: "absolute", inset: 0, opacity: isDark ? 0.03 : 0.04, backgroundImage: `linear-gradient(${C.gold} 1px,transparent 1px),linear-gradient(90deg,${C.gold} 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "clamp(44px,6vw,72px) clamp(16px,5vw,60px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 36, flexWrap: "wrap", opacity: vis ? 1 : 0, transition: "opacity 0.8s" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <GoldLine width={20} />
            <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold }}>Stay Connected</span>
          </div>
          <h3 style={{ fontFamily: F.display, fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 600, color: C.textPrimary, lineHeight: 1.2, margin: 0, transition: "color 0.35s" }}>Via email</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-end" }}>
          <div style={{ display: "flex", overflow: "hidden", borderRadius: 3, border: `1px solid ${C.border}` }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ padding: "12px 18px", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: "none", color: C.textPrimary, fontFamily: F.body, fontSize: 13, outline: "none", width: "clamp(180px,22vw,250px)", transition: "background 0.3s, color 0.3s" }} />
            <button type="button" onClick={() => { if (!email) return; setSent(true); setTimeout(() => { setSent(false); setEmail(""); }, 2500); }} style={{ padding: "12px 16px", background: sent ? C.gold : (isDark ? "#0E0D09" : "#1A1612"), border: "none", cursor: "pointer", color: sent ? (isDark ? "#0E0D09" : "#FFFFFF") : C.gold, transition: "all 0.25s", fontFamily: F.body, fontSize: 15 }}>
              {sent ? "✓" : "→"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["f","Facebook","https://www.facebook.com/thebellevuemanila/"],["t","X","https://x.com/bellevuemanila"],["i","Instagram","https://www.instagram.com/bellevuemanila/"],["y","YouTube","https://www.youtube.com/channel/UC01W6kRH_R-T0ok6RDT3aGg"]].map(([icon,label,href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" title={label} style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.border}`, color: C.textMuted, fontFamily: F.body, fontSize: 13, fontWeight: 700, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}>
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────
function Footer({ onNavigate, onManageBooking }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);

  return (
    <footer style={{ background: C.footerBg, borderTop: `1px solid ${C.borderLight}`, transition: "background 0.35s ease" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(44px,6vw,72px) clamp(16px,5vw,60px) clamp(28px,4vw,44px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "clamp(24px,4vw,40px)", marginBottom: 44 }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <img src={bellevueLogo} alt="The Bellevue Manila" style={{ height: 36, width: "auto", display: "block", filter: isDark ? "none" : "brightness(0) saturate(100%) invert(30%) sepia(50%) saturate(400%) hue-rotate(5deg)", transition: "filter 0.35s" }} />
            </div>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.textFaint, lineHeight: 1.85, margin: "0 0 14px", transition: "color 0.35s" }}>
              Luxury event spaces and seamless reservations in the heart of Alabang.
            </p>
            {/* FIX: gold bg, border-radius 0 */}
            <button type="button" onClick={onManageBooking}
              style={{ padding: "8px 15px", background: C.gold, border: "none", borderRadius: 0, fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: isDark ? "#0E0D09" : "#FFFFFF", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.goldLight}
              onMouseLeave={e => e.currentTarget.style.background = C.gold}>
              Manage My Booking →
            </button>
          </div>
          <div>
            <FooterHeading>Venues</FooterHeading>
            <FooterLink onClick={() => onNavigate("main-wing")}>Main Wing</FooterLink>
            <FooterLink onClick={() => onNavigate("tower-wing")}>Tower Wing</FooterLink>
            <FooterLink onClick={() => onNavigate("dining")}>Dining</FooterLink>
          </div>
          <div>
            <FooterHeading>Reservations</FooterHeading>
            <FooterLink onClick={() => onNavigate("main-wing")}>Book a Seat</FooterLink>
            <FooterLink onClick={() => onNavigate("dining")}>Book a Table</FooterLink>
            <FooterLink onClick={onManageBooking}>Manage Booking</FooterLink>
          </div>
          <div>
            <FooterHeading>Contact</FooterHeading>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.textFaint, lineHeight: 2, margin: 0, transition: "color 0.35s" }}>
              02 871 8181 5139<br />
              North Bridgeway, Filinvest City<br />
              Alabang, Muntinlupa City<br />
              <a href="mailto:reservations@thebellevue.com" style={{ color: C.goldDark, textDecoration: "none" }}>reservations@thebellevue.com</a>
            </p>
          </div>
        </div>
        <Divider mb={22} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.textDeep, transition: "color 0.35s" }}>© {new Date().getFullYear()} The Bellevue Manila. All rights reserved.</span>
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.textDeep, transition: "color 0.35s" }}>Seat & Table Management System</span>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  return <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 13 }}>{children}</div>;
}

function FooterLink({ children, onClick }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontFamily: F.body, fontSize: 13, color: hov ? C.gold : C.footerLinkDefault, marginBottom: 9, cursor: "pointer", transition: "color 0.2s" }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [diningRestaurantId, setDiningRestaurantId] = useState(null);

  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("bellevue-theme");
      if (saved !== null) return saved === "dark";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try { localStorage.setItem("bellevue-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  };

  const C = getTokens(isDark);
  const goToVenues = (section) => { if (section) navigate(`/venues?section=${section}`); else navigate("/venues"); };
  const goToManageBooking = () => navigate("/manage-booking");

  // Scroll restoration
  useEffect(() => {
    const headerH = NAV_H; const markerY = headerH + 8;
    const inView = (id) => { const el = document.getElementById(id); if (!el) return false; const r = el.getBoundingClientRect(); return r.top <= markerY && r.bottom > markerY; };
    const onScroll = () => window.dispatchEvent(new CustomEvent("homeActiveSection", { detail: inView("home-dining") ? "dining" : null }));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo === "dining") {
      requestAnimationFrame(() => { const el = document.getElementById("home-dining"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); });
      navigate(".", { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleNavigate = (target) => {
    if (target === "venue") { navigate("/venues"); return; }
    if (target === "dining") {
      requestAnimationFrame(() => { const el = document.getElementById("home-dining"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); });
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle: toggleTheme }}>
      {/* paddingTop: 72px accounts for the fixed Navbar */}
      <div style={{ background: C.pageBg, minHeight: "100vh", paddingTop: 72, transition: "background 0.35s ease" }}>

        {/* Fixed nav — no bottom border */}
        <TopNav onManageBooking={goToManageBooking} />

        {/* 1: Hero + Wing Cards */}
        <HeroBrowseSection onNavigateToVenues={goToVenues} onManageBooking={goToManageBooking} />

        {/* 2: Dining */}
        <div id="home-dining">
          <DiningSection onNavigate={handleNavigate} initialRestaurantId={diningRestaurantId} />
        </div>

        {/* 3: Newsletter */}
        <NewsletterSection />

        {/* 4: Footer */}
        <Footer onNavigate={goToVenues} onManageBooking={goToManageBooking} />
      </div>
    </ThemeContext.Provider>
  );
}