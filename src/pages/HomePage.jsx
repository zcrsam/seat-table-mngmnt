import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import heroBanner from "../assets/banner-grandroom.jpg";
import bellevueLogo from "../assets/bellevue-logo.png";

// Local images
import mainWingImg from "../assets/main-wing.jpeg";
import towerWingImg from "../assets/tower-wing.jpeg";
import diningImg from "../assets/dining.jpeg";

import alabangImg from "../assets/afc.jpeg";
import lagunaImg from "../assets/laguna.jpeg";
import twentyTwentyImg from "../assets/20:20.jpeg";
import businessCenterImg from "../assets/bc.jpeg";
import towerBallroomImg from "../assets/towerb.jpeg";
import grandBallroomImg from "../assets/grandr.jpg";

import qsinaImg from "../assets/qsina.jpeg";
import qsinaImg2 from "../assets/qsina2.jpeg";
import qsinaImg3 from "../assets/qsina3.jpeg";
import hanakazuImg from "../assets/hanakazu.jpeg";
import hanakazuImg2 from "../assets/hanakazu2.jpeg";
import hanakazuImg3 from "../assets/hanakazu3.jpeg";
import phoenixCourtImg from "../assets/phoenix-court.jpeg";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const C = {
  gold: "#C9A84C",
  goldLight: "#E2C96A",
  goldDark: "#9A7A2E",
  goldFaint: "rgba(201,168,76,0.12)",
  dark: "#0E0D09",
  darkCard: "#1A1812",
  darkMid: "#242018",
  cream: "#F7F3EA",
  creamDark: "#EDE7D9",
  creamDeep: "#E0D8C8",
  ink: "#1E1A10",
  muted: "#8A8070",
  border: "rgba(201,168,76,0.18)",
  borderLight: "rgba(201,168,76,0.10)",
};

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const EVENT_CATEGORIES = [
  {
    id: 1,
    label: "MAIN WING",
    subtitle: "An elegant night at Bellevue",
    img: mainWingImg,
  },
  {
    id: 2,
    label: "TOWER WING",
    subtitle: "An elegant night at Bellevue",
    img: towerWingImg,
  },
  {
    id: 3,
    label: "DINING",
    subtitle: "An elegant night at Bellevue",
    img: diningImg,
  },
];

const VENUES = [
  {
    id: 1,
    name: "Alabang Function Room",
    seats: 15,
    tables: 14,
    img: alabangImg,
    routeId: "alabang",
    wing: "Main Wing",
    rooms: [],
  },
  {
    id: 2,
    name: "Laguna Ballroom",
    seats: 25,
    tables: 11,
    img: lagunaImg,
    routeId: "laguna",
    wing: "Main Wing",
    rooms: ["Laguna 1", "Laguna 2"],
  },
  {
    id: 3,
    name: "20/20 Function Room",
    seats: 20,
    tables: 12,
    img: twentyTwentyImg,
    routeId: "2020",
    wing: "Main Wing",
    rooms: ["20/20 Function Room A", "20/20 Function Room B", "20/20 Function Room C"],
  },
  {
    id: 4,
    name: "Business Center",
    seats: 12,
    tables: 8,
    img: businessCenterImg,
    routeId: "business",
    wing: "Main Wing",
    rooms: [],
  },
  {
    id: 5,
    name: "Tower Ballroom",
    seats: 32,
    tables: 16,
    img: towerBallroomImg,
    routeId: "tower",
    wing: "Tower Wing",
    rooms: ["Tower 1", "Tower 2", "Tower 3"],
  },
  {
    id: 6,
    name: "Grand Ballroom",
    seats: 48,
    tables: 20,
    img: grandBallroomImg,
    routeId: "grand",
    wing: "Tower Wing",
    rooms: ["Grand A", "Grand B", "Grand C"],
  },
];

const WINGS = ["Main Wing", "Tower Wing", "Dining"];

const DINING_TIMES = [
  { label: "Breakfast Buffet", hours: "6:00 – 10:00 AM" },
  { label: "Lunch", hours: "MON · TUE · SAT · SUN" },
  { label: "Light Lunch", hours: "WED · FRI" },
  { label: "Dinner", hours: "MON · THURS" },
  { label: "Dinner Buffet", hours: null },
];

const GALLERY_IMGS = [
  qsinaImg,
  qsinaImg2,
  qsinaImg3,
];

const RESTAURANTS = [
  {
    id: "qsina",
    name: "Qsina",
    description:
      "Qsina offers diverse culinary delights with both international buffets and à la carte options. From lavish breakfast spreads to intimate dinner experiences.",
    imgs: [
      qsinaImg,
      qsinaImg2,
      qsinaImg3,
    ],
    diningTimes: [
      { label: "Breakfast Buffet", hours: "6:00 – 10:00 AM" },
      { label: "Lunch", hours: "MON · TUE · SAT · SUN" },
      { label: "Light Lunch", hours: "WED · FRI" },
      { label: "Dinner", hours: "MON · THURS" },
      { label: "Dinner Buffet", hours: null },
    ],
  },
  {
    id: "hanakazu",
    name: "Hanakazu",
    description:
      "Hanakazu brings authentic Japanese cuisine to The Bellevue Manila. Savor fresh sushi, sashimi, and teppanyaki in an elegant setting.",
    imgs: [
      hanakazuImg,
      hanakazuImg2,
      hanakazuImg3,
    ],
    diningTimes: [
      { label: "Lunch", hours: "11:30 AM – 2:30 PM" },
      { label: "Dinner", hours: "6:00 PM – 10:00 PM" },
      { label: "Omakase", hours: "By reservation" },
    ],
  },
  {
    id: "phoenix-court",
    name: "Phoenix Court",
    description:
      "Phoenix Court presents refined Cantonese and Chinese cuisine. Experience dim sum, Peking duck, and classic dishes in a sophisticated atmosphere.",
    imgs: [
      phoenixCourtImg,
      qsinaImg2,
      qsinaImg3,
    ],
    diningTimes: [
      { label: "Dim Sum", hours: "5:00 AM – 11:29 PM" },
      { label: "Lunch", hours: "11:30 AM – 2:30 PM" },
      { label: "Dinner", hours: "6:00 PM – 10:00 PM" },
    ],
  },
];

// ─────────────────────────────────────────────
// HELPERS / ATOMS
// ─────────────────────────────────────────────
function Divider({ color = C.border, mb = 0, mt = 0 }) {
  return <div style={{ height: 1, background: color, margin: `${mt}px 0 ${mb}px` }} />;
}

function GoldLine({ width = 32 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width,
        height: 1,
        background: C.gold,
        verticalAlign: "middle",
      }}
    />
  );
}

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setVis(true);
      return;
    }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVis(true);
        obs.disconnect();
      }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, vis];
}

function useIsMobile(breakpointPx = 860) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpointPx : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpointPx]);
  return isMobile;
}

// ─────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────
function Hero({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fadeStyle = (delay = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.8s ${delay}s ease, transform 0.8s ${delay}s ease`,
  });

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 680,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* BG */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${heroBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          filter: "blur(4px) brightness(0.78)",
          transform: "scale(1.04)",
          transition: "transform 10s ease",
        }}
      />
      {/* Layered gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(14,13,9,0.55) 0%,rgba(14,13,9,0.3) 40%,rgba(14,13,9,0.7) 80%,rgba(14,13,9,0.95) 100%)",
        }}
      />
      {/* Subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center,transparent 40%,rgba(14,13,9,0.45) 100%)",
        }}
      />

      {/* Decorative border lines */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 40,
          right: 40,
          height: 1,
          background: `linear-gradient(90deg,transparent,${C.border},transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 40,
          right: 40,
          height: 1,
          background: `linear-gradient(90deg,transparent,${C.border},transparent)`,
        }}
      />

      <div style={{ position: "relative", textAlign: "center", maxWidth: 740, padding: "0 24px" }}>
        {/* Eyebrow */}
        <div
          style={{
            ...fadeStyle(0),
            marginBottom: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <GoldLine width={36} />
          <span
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.gold,
            }}
          >
            Seat & Table Reservation
          </span>
          <GoldLine width={36} />
        </div>

        {/* H1 */}
        <h1
          style={{
            ...fadeStyle(0.12),
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "clamp(46px,7.5vw,88px)",
            fontWeight: 600,
            color: "#F7F3EA",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 22,
          }}
        >
          Reserve Your
          <br />
          <em style={{ color: C.gold, fontStyle: "italic" }}>Perfect Seat</em>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            ...fadeStyle(0.22),
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "clamp(14px,1.8vw,17px)",
            color: "rgba(247,243,234,0.60)",
            lineHeight: 1.75,
            maxWidth: 500,
            margin: "0 auto 40px",
          }}
        >
          Experience unparalleled luxury and seamless event booking at The Bellevue Manila. Select
          an upcoming event below to secure your placement.
        </p>

        {/* Search bar */}
        <div
          style={{
            ...fadeStyle(0.32),
            display: "flex",
            maxWidth: 520,
            margin: "0 auto 20px",
            background: "rgba(255,255,255,0.8)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            opacity: 0.8,
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onNavigate("venue", query)}
            placeholder="Search venue or event"
            style={{
              flex: 1,
              padding: "16px 22px",
              border: "none",
              outline: "none",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 14,
              color: C.ink,
              background: "transparent",
            }}
          />
          <button
            type="button"
            onClick={() => onNavigate("venue", query)}
            style={{
              padding: "16px 22px",
              marginRight: 3,
              marginTop: 3,
              marginBottom: 3,
              background: C.dark,
              border: "none",
              cursor: "pointer",
              color: C.gold,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.darkCard)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.dark)}
          >
            <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", color: C.gold }}>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden={false}>Search</span>
          </button>
        </div>

        {/* CTA pills */}
        <div
          style={{
            ...fadeStyle(0.40),
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {WINGS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                label === "Dining"
                  ? onNavigate("dining")
                  : onNavigate("spaces", label)
              }
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: `1px solid ${C.border}`,
                background: "rgba(14,13,9,0.4)",
                backdropFilter: "blur(8px)",
                color: "rgba(247,243,234,0.7)",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.gold;
                e.currentTarget.style.color = C.gold;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = "rgba(247,243,234,0.7)";
              }}
            >
              {label}
            </button>
          ))}
        </div>

      {/* Scroll hint */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: 0.5,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 9,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: C.gold,
          }}
        >
          
        </span>
        <div style={{ width: 0, height: 0, background: `linear-gradient(to bottom,${C.gold},transparent)` }} />
      </div>
        {/* close main hero content container */}
        </div>
      </section>
  );
}

function BrowseSection({ onNavigate }) {
  const [ref, vis] = useScrollReveal();

  const catToWing = (label) => {
    const l = String(label || "").toLowerCase();
    if (l.includes("main")) return "Main Wing";
    if (l.includes("tower")) return "Tower Wing";
    if (l.includes("dining")) return "Dining";
    return null;
  };

  return (
    <section
      ref={ref}
      style={{
        background: C.cream,
        padding: "clamp(64px,9vw,110px) clamp(20px,5vw,60px)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 44,
            flexWrap: "wrap",
            gap: 16,
            opacity: vis ? 1 : 0,
            transform: vis ? "none" : "translateY(20px)",
            transition: "opacity 0.7s, transform 0.7s",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <GoldLine width={24} />
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.gold,
                }}
              >
                Browse by event type
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(30px,4vw,46px)",
                fontWeight: 600,
                color: C.ink,
                lineHeight: 1.1,
              }}
            >
              Select an event to view
              <br />
              the layout and reserve.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("all-venues")}
            style={{
              padding: "11px 26px",
              border: `1px solid ${C.gold}`,
              background: "transparent",
              color: C.goldDark,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              cursor: "pointer",
              borderRadius: 2,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.gold;
              e.currentTarget.style.color = C.dark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = C.goldDark;
            }}
          >
            VIEW ALL VENUES →
          </button>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {EVENT_CATEGORIES.map((cat, i) => (
            <EventCard
              key={cat.id}
              cat={cat}
              style={{
                opacity: vis ? 1 : 0,
                transform: vis ? "none" : "translateY(28px)",
                transition: `opacity 0.7s ${0.1 + i * 0.12}s, transform 0.7s ${0.1 + i * 0.12}s`,
              }}
              onClick={() => {
                const wing = catToWing(cat.label);
                if (wing === "Dining") {
                  onNavigate("dining");
                } else if (wing) {
                  onNavigate("spaces", wing);
                }
              }}
            />
          ))}
        </div>
      {/* close outer container div */}
      </div>
    </section>
  );
}

function EventCard({ cat, style, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...style,
        cursor: "pointer",
        borderRadius: 6,
        overflow: "hidden",
        background: "#fff",
        boxShadow: hov ? "0 16px 40px rgba(0,0,0,0.13)" : "0 2px 14px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-6px)" : style.transform || "none",
        transition: "transform 0.3s, box-shadow 0.3s, opacity 0.7s",
      }}
    >
      <div style={{ height: 188, overflow: "hidden", position: "relative" }}>
        <img
          src={cat.img}
          alt={cat.label}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s",
            transform: hov ? "scale(1.06)" : "scale(1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 55%)",
            opacity: hov ? 1 : 0.4,
            transition: "opacity 0.3s",
          }}
        />
      </div>
      <div style={{ padding: "16px 18px", borderTop: `1px solid ${C.creamDeep}` }}>
        <div
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: C.ink,
            marginBottom: 4,
          }}
        >
          {cat.label}
        </div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: C.muted }}>
          {cat.subtitle}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// WORLD-CLASS VENUES CAROUSEL
// ─────────────────────────────────────────────
function VenuesSection({ onReserveVenue, venues = [], highlightVenueId = null }) {
  const isMobile = useIsMobile();
  const [ref, vis] = useScrollReveal(0.1);
  const [activeIdx, setActiveIdx] = useState(0);
  const outerRef = useRef(null);
  const trackRef = useRef(null);
  const [offset, setOffset] = useState(0);

  const CARD_WIDTH = 520;
  const GAP = 20;
  const total = venues.length;

  const clampIndex = (i) => {
    if (!total) return 0;
    return Math.max(0, Math.min(total - 1, i));
  };

  useEffect(() => {
    setActiveIdx((i) => clampIndex(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  useEffect(() => {
    if (!venues.length || highlightVenueId == null) return;
    const idx = venues.findIndex((v) => v.id === highlightVenueId);
    if (idx >= 0) setActiveIdx(clampIndex(idx));
  }, [highlightVenueId, venues.length]);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer || !total) return;
    const outerW = outer.offsetWidth;
    const centerX = outerW / 2;
    const x = centerX - (activeIdx * (CARD_WIDTH + GAP) + CARD_WIDTH / 2);
    setOffset(x);
  }, [activeIdx, total]);

  useEffect(() => {
    const handleResize = () => {
      const outer = outerRef.current;
      if (!outer || !total) return;
      const outerW = outer.offsetWidth;
      const centerX = outerW / 2;
      const x = centerX - (activeIdx * (CARD_WIDTH + GAP) + CARD_WIDTH / 2);
      setOffset(x);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIdx, total]);

  const handleMove = (dir) => {
    setActiveIdx((i) => clampIndex(i + dir));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") handleMove(-1);
      if (e.key === "ArrowRight") handleMove(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  const touchStartRef = useRef(null);
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e) => {
    const startX = touchStartRef.current;
    if (startX == null) return;
    const dx = startX - (e.changedTouches[0]?.clientX ?? startX);
    if (Math.abs(dx) > 40) {
      handleMove(dx > 0 ? 1 : -1);
    }
    touchStartRef.current = null;
  };

  const dragStartRef = useRef(null);
  const handleMouseDown = (e) => {
    dragStartRef.current = e.clientX;
  };
  const handleMouseUp = (e) => {
    const startX = dragStartRef.current;
    if (startX == null) return;
    const dx = startX - e.clientX;
    if (Math.abs(dx) > 60) {
      handleMove(dx > 0 ? 1 : -1);
    }
    dragStartRef.current = null;
  };

  const atStart = activeIdx === 0;
  const atEnd = total ? activeIdx === total - 1 : true;

  return (
    <section
      ref={ref}
      style={{
        background: C.creamDark,
        padding: "clamp(64px,9vw,110px) 0",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px,5vw,60px)" }}>
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 40,
            alignItems: "end",
            marginBottom: 48,
            opacity: vis ? 1 : 0,
            transform: vis ? "none" : "translateY(20px)",
            transition: "opacity 0.7s, transform 0.7s",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <GoldLine width={62} />
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.gold,
                }}
              >
                Our Spaces
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(28px,4vw,44px)",
                fontWeight: 600,
                color: C.ink,
                lineHeight: 1.15,
              }}
            >
              World-Class Venues
              <br />
              for Every Occasion
            </h2>
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#7A7060", lineHeight: 1.85 }}>
            From intimate gatherings to grand celebrations, The Bellevue Manila offers meticulously
            designed function rooms and ballrooms tailored to your vision. Every event is matched
            with dedicated service and a seamless reservation experience.
          </p>
        </div>

        {/* Carousel window */}
        <div
          ref={outerRef}
          style={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            padding: "8px 0 28px",
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div
            ref={trackRef}
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: GAP,
              transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
              willChange: "transform",
              transform: `translateX(${offset}px)`,
            }}
          >
            {venues.map((v, i) => (
              <VenueCard
                key={v.id}
                venue={v}
                isMobile={isMobile}
                active={i === activeIdx}
                style={{ opacity: vis ? 1 : 0, transition: `opacity 0.7s ${0.1 + i * 0.1}s` }}
                onReserve={() => onReserveVenue(v.routeId)}
                onCardClick={() => setActiveIdx(i)}
              />
            ))}
          </div>

          {/* Left arrow */}
          <div
            onClick={() => !atStart && handleMove(-1)}
            style={{
              position: "absolute",
              top: 0,
              bottom: 28,
              left: 0,
              width: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingLeft: 20,
              pointerEvents: atStart ? "none" : "auto",
            }}
          >
            <button
              type="button"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: atStart ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.92)",
                border: `1px solid rgba(201,168,76,0.3)`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: atStart ? C.muted : C.ink,
                cursor: atStart ? "default" : "pointer",
                transition: "all 0.2s",
                opacity: atStart ? 0 : 1,
              }}
              onMouseEnter={(e) => {
                if (atStart) return;
                e.currentTarget.style.background = C.gold;
                e.currentTarget.style.color = C.dark;
              }}
              onMouseLeave={(e) => {
                if (atStart) return;
                e.currentTarget.style.background = "rgba(255,255,255,0.92)";
                e.currentTarget.style.color = C.ink;
              }}
            >
              ←
            </button>
          </div>

          {/* Right arrow */}
          <div
            onClick={() => !atEnd && handleMove(1)}
            style={{
              position: "absolute",
              top: 0,
              bottom: 28,
              right: 0,
              width: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 20,
              pointerEvents: atEnd ? "none" : "auto",
            }}
          >
            <button
              type="button"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: atEnd ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.92)",
                border: `1px solid rgba(201,168,76,0.3)`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: atEnd ? C.muted : C.ink,
                cursor: atEnd ? "default" : "pointer",
                transition: "all 0.2s",
                opacity: atEnd ? 0 : 1,
              }}
              onMouseEnter={(e) => {
                if (atEnd) return;
                e.currentTarget.style.background = C.gold;
                e.currentTarget.style.color = C.dark;
              }}
              onMouseLeave={(e) => {
                if (atEnd) return;
                e.currentTarget.style.background = "rgba(255,255,255,0.92)";
                e.currentTarget.style.color = C.ink;
              }}
            >
              →
            </button>
          </div>

          {/* Dots + controls row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "0 60px",
              marginTop: 8,
            }}
          >
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: C.muted }}>
              {total ? `${activeIdx + 1} of ${total}` : "0 of 0"}
            </span>

            {/* Dots */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              {venues.map((v, i) => {
                const active = i === activeIdx;
                return (
                  <div
                    key={v.id}
                    onClick={() => setActiveIdx(i)}
                    style={{
                      width: active ? 20 : 8,
                      height: active ? 2 : 8,
                      borderRadius: active ? 1 : "50%",
                      background: active ? C.gold : "rgba(247,243,234,0.6)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VenueCard({ venue, style, onReserve, isMobile, active, onCardClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => {
        if (!active && onCardClick) onCardClick();
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...style,
        flexShrink: 0,
        width: 520,
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        boxShadow: active
          ? "0 12px 40px rgba(0,0,0,0.15)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        opacity: active ? 1 : 0.7,
        transform: active ? "scale(1)" : "scale(0.93)",
        filter: active ? "none" : "blur(3.5px)",
        transition: "filter 0.45s ease, transform 0.45s ease, box-shadow 0.45s ease, opacity 0.45s ease",
        cursor: active ? "default" : "pointer",
      }}
    >
      <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
        <img
          src={venue.img}
          alt={venue.name}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.55s",
            transform: hov && !active ? "scale(1.02)" : "scale(1)",
          }}
        />
        {/* Tables badge */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 14,
            background: "rgba(14,13,9,0.78)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            padding: "5px 12px",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: C.gold,
            letterSpacing: "0.05em",
          }}
        >
          {venue.tables} table{venue.tables > 1 ? "s" : ""} available
        </div>
      </div>
      <div
        style={{
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 20,
              fontWeight: 600,
              color: C.ink,
              lineHeight: 1.2,
            }}
          >
            {venue.name}
          </div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: C.muted, marginTop: 4 }}>
            {venue.seats} seat{venue.seats > 1 ? "s" : ""} available
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReserve();
          }}
          style={{
            padding: "9px 18px",
            flexShrink: 0,
            background: hov ? C.gold : "transparent",
            border: `1px solid ${hov ? C.gold : C.goldDark}`,
            color: hov ? C.dark : C.goldDark,
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            cursor: "pointer",
            borderRadius: 2,
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          Reserve a seat
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DINING SECTION
// ─────────────────────────────────────────────
function DiningSection({ onNavigate, initialRestaurantId }) {
  const [ref, vis] = useScrollReveal(0.1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("13:00");
  const [guests, setGuests] = useState(2);
  const [activeRestaurant, setActiveRestaurant] = useState(0);
  const [activeImg, setActiveImg] = useState(0);

  const restaurant = RESTAURANTS[activeRestaurant];
  const imgs = restaurant?.imgs ?? GALLERY_IMGS;
  const totalRestaurants = RESTAURANTS.length;

  useEffect(() => {
    if (!initialRestaurantId) return;
    const idx = RESTAURANTS.findIndex((r) => r.id === initialRestaurantId);
    if (idx >= 0) setActiveRestaurant(idx);
  }, [initialRestaurantId]);

  const selectedMinutes = useMemo(() => {
    const m = /^(\d{2}):(\d{2})$/.exec(time || "");
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    return hh * 60 + mm;
  }, [time]);

  const parseHoursRange = (hours) => {
    if (!hours || typeof hours !== "string") return null;
    const re = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i;
    const m = re.exec(hours);
    if (!m) return null;
    const toMinutes = (h, min, ap) => {
      let hh = Number(h);
      const mm = Number(min || 0);
      const upper = String(ap || "").toUpperCase();
      if (upper === "AM") {
        if (hh === 12) hh = 0;
      } else if (upper === "PM") {
        if (hh !== 12) hh += 12;
      }
      return hh * 60 + mm;
    };
    const start = toMinutes(m[1], m[2], m[3]);
    const end = toMinutes(m[4], m[5], m[6]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return { start, end };
  };

  const fallbackSlot = useMemo(() => {
    if (selectedMinutes == null) return null;
    if (selectedMinutes >= 6 * 60 && selectedMinutes < 10 * 60) return "Breakfast Buffet";
    if (selectedMinutes >= 11 * 60 && selectedMinutes < 13 * 60) return "Lunch";
    if (selectedMinutes >= 13 * 60 && selectedMinutes < 17 * 60) return "Light Lunch";
    if (selectedMinutes >= 17 * 60 && selectedMinutes < 20 * 60) return "Dinner";
    if (selectedMinutes >= 20 * 60 && selectedMinutes < 22 * 60) return "Dinner Buffet";
    return null;
  }, [selectedMinutes]);

  // Helpers usable by click handlers
  const getNextDateForWeekdays = (weekdays) => {
    if (!weekdays || !weekdays.length) return null;
    const names = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const today = new Date();
    for (let offset = 0; offset < 14; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const dow = names[d.getDay()];
      if (weekdays.includes(dow)) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
    }
    return null;
  };

  const representativeTimeForLabel = (label) => {
    const map = {
      "Breakfast Buffet": "08:00",
      Lunch: "12:00",
      "Light Lunch": "15:00",
      Dinner: "18:00",
      "Dinner Buffet": "20:00",
    };
    return map[label] || "12:00";
  };

  const selectDiningTime = (d) => {
    const range = parseHoursRange(d.hours);
    if (range) {
      const hh = Math.floor(range.start / 60);
      const mm = range.start % 60;
      const timeStr = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      setTime(timeStr);
    } else {
      setTime(representativeTimeForLabel(d.label));
    }

    const hh = String(d.hours || "").toLowerCase();
    const dayMatches = hh.match(/mon|tue|wed|thu|thur|fri|sat|sun/g);
    if (dayMatches && dayMatches.length) {
      const tokens = dayMatches.map((s) => s.replace("thur", "thu").slice(0, 3));
      const next = getNextDateForWeekdays(tokens);
      if (next) setDate(next);
    }
  };

  const highlightedLabel = useMemo(() => {
    const times = restaurant?.diningTimes ?? DINING_TIMES;
    if (!times?.length || selectedMinutes == null) return null;
    // 1) Prefer explicit time ranges in restaurant times
    for (const t of times) {
      const range = parseHoursRange(t.hours);
      if (!range) continue;
      const { start, end } = range;
      const match =
        start <= end
          ? selectedMinutes >= start && selectedMinutes <= end
          : selectedMinutes >= start || selectedMinutes <= end;
      if (match) return t.label;
    }

    // 2) If no explicit time range matched, try to match day-based entries combined with fallback time slot
    if (!fallbackSlot) return null;

    const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const candidates =
      fallbackSlot === "Light Lunch"
        ? ["Light Lunch", "Lunch"]
        : fallbackSlot === "Dinner Buffet"
          ? ["Dinner Buffet", "Dinner"]
          : [fallbackSlot];
    const normalizedCandidates = candidates.map(norm);

    // compute weekday abbreviation from selected date (e.g., 'mon', 'tue')
    let selectedDay = null;
    if (date) {
      const d = new Date(date + "T00:00:00");
      if (!Number.isNaN(d.getTime())) {
        // 0 = Sun, 1 = Mon ...
        const dow = d.getDay();
        const names = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        selectedDay = names[dow];
      }
    }

    // Check entries that list days (e.g. "MON · TUE") or have no hours but are labels
    for (const t of times) {
      const range = parseHoursRange(t.hours);
      if (range) continue; // already handled above

      // If t.hours contains day names, check selected day
      const hh = String(t.hours || "").toLowerCase();
      const hasDayTokens = /mon|tue|wed|thu|thur|fri|sat|sun/.test(hh);
      if (hasDayTokens) {
        if (!selectedDay) continue; // can't match day if no date selected
        const tokenMatches = hh.match(/mon|tue|wed|thu|thur|fri|sat|sun/g);
        const tokens = (tokenMatches || []).map((s) => s.replace("thur", "thu").slice(0, 3));
        if (!tokens.includes(selectedDay)) continue;

        // If day matches, also ensure the time slot aligns (using fallbackSlot candidates)
        if (normalizedCandidates.includes(norm(t.label))) return t.label;
      } else {
        // If no day tokens and no hours, treat label-only entries: match by fallbackSlot label
        if (!t.hours) {
          if (normalizedCandidates.includes(norm(t.label))) return t.label;
        }
      }
    }

    return null;
  }, [restaurant, selectedMinutes, fallbackSlot]);

  useEffect(() => {
    setActiveImg(0);
  }, [activeRestaurant]);

  useEffect(() => {
    const id = setInterval(() => setActiveImg((n) => (n + 1) % imgs.length), 4000);
    return () => clearInterval(id);
  }, [imgs.length]);

  return (
    <section
      ref={ref}
      style={{
        background: C.dark,
        padding: "clamp(64px,9vw,110px) clamp(20px,5vw,60px)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(40px,6vw,80px)",
            alignItems: "start",
          }}
        >
          {/* LEFT — restaurant widget over image */}
          <div
            style={{
              position: "relative",
              opacity: vis ? 1 : 0,
              transform: vis ? "none" : "translateX(-30px)",
              transition: "opacity 0.8s, transform 0.8s",
            }}
          >
            {/* Photo carousel */}
            <div style={{ borderRadius: 10, overflow: "hidden", height: 420, position: "relative" }}>
              {imgs.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: activeImg === i ? 1 : 0,
                    transition: "opacity 0.55s ease",
                  }}
                />
              ))}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,13,9,0.85) 0%, transparent 55%)" }} />

              {/* Dot indicators */}
              <div
                style={{
                  position: "absolute",
                  bottom: 110,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 6,
                }}
              >
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      border: "none",
                      background: i === activeImg ? C.gold : "rgba(255,255,255,0.35)",
                      cursor: "pointer",
                      padding: 0,
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Floating booking widget */}
            <div
              style={{
                position: "absolute",
                bottom: -28,
                left: 24,
                right: 24,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "22px 24px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: C.goldFaint,
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: C.gold, fontSize: 12 }}>⌖</span>
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: C.gold,
                  }}
                >
                  Find Restaurants
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <FieldInput type="date" value={date} onChange={setDate} placeholder="Date" />
                <FieldInput type="time" value={time} onChange={setTime} placeholder="Time" />
              </div>
              <GuestPicker value={guests} onChange={setGuests} style={{ marginBottom: 14 }} />

              <button
                type="button"
                onClick={() => onNavigate("venue")}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: C.gold,
                  border: "none",
                  borderRadius: 4,
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: C.dark,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.goldLight)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}
              >
                SUBMIT
              </button>
            </div>
          </div>

          {/* RIGHT — restaurant info */}
          <div
            style={{
              paddingTop: 10,
              opacity: vis ? 1 : 0,
              transform: vis ? "none" : "translateX(30px)",
              transition: "opacity 0.8s 0.15s, transform 0.8s 0.15s",
            }}
          >
            {/* prev/next */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                disabled={activeRestaurant === 0}
                onClick={() => setActiveRestaurant((n) => Math.max(0, n - 1))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `1px solid ${C.border}`,
                  background: "transparent",
                  color: activeRestaurant === 0 ? C.muted : C.gold,
                  cursor: activeRestaurant === 0 ? "not-allowed" : "pointer",
                  opacity: activeRestaurant === 0 ? 0.5 : 1,
                  fontFamily: "'DM Sans',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (activeRestaurant > 0) {
                    e.currentTarget.style.borderColor = C.gold;
                    e.currentTarget.style.color = C.gold;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color = activeRestaurant === 0 ? C.muted : C.gold;
                }}
              >
                ←
              </button>
              <button
                type="button"
                disabled={activeRestaurant === totalRestaurants - 1}
                onClick={() =>
                  setActiveRestaurant((n) => Math.min(totalRestaurants - 1, n + 1))
                }
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `1px solid ${C.border}`,
                  background: "transparent",
                  color: activeRestaurant === totalRestaurants - 1 ? C.muted : C.gold,
                  cursor: activeRestaurant === totalRestaurants - 1 ? "not-allowed" : "pointer",
                  opacity: activeRestaurant === totalRestaurants - 1 ? 0.5 : 1,
                  fontFamily: "'DM Sans',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (activeRestaurant < totalRestaurants - 1) {
                    e.currentTarget.style.borderColor = C.gold;
                    e.currentTarget.style.color = C.gold;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color =
                    activeRestaurant === totalRestaurants - 1 ? C.muted : C.gold;
                }}
              >
                →
              </button>
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(40px,5vw,64px)",
                fontWeight: 600,
                color: "#F7F3EA",
                marginBottom: 16,
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
              }}
            >
              {restaurant?.name ?? "Qsina"}
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 14,
                color: "#8A8070",
                lineHeight: 1.85,
                marginBottom: 32,
                maxWidth: 380,
              }}
            >
              {restaurant?.description ??
                "Qsina offers diverse culinary delights with both international buffets and à la carte options. From lavish breakfast spreads to intimate dinner experiences."}
            </p>

            {/* Dining time chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
              {(restaurant?.diningTimes ?? DINING_TIMES).map((d) => {
                const active = highlightedLabel ? d.label === highlightedLabel : false;
                return (
                  <button
                    key={d.label}
                    onClick={() => selectDiningTime(d)}
                    type="button"
                    style={{
                      padding: "7px 14px",
                      borderRadius: 3,
                      background: active ? C.gold : "rgba(255,255,255,0.05)",
                      border: `1px solid ${active ? C.gold : C.border}`,
                      cursor: "pointer",
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      position: 'relative',
                      zIndex: 30,
                      pointerEvents: 'auto',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: active ? C.dark : C.gold,
                      }}
                    >
                      {d.label}
                    </div>
                    {d.hours && (
                      <div
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: 10,
                          color: active ? "rgba(14,13,9,0.55)" : C.muted,
                          marginTop: 2,
                        }}
                      >
                        {d.hours}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Photo strip */}
            <div style={{ display: "flex", gap: 10 }}>
                {imgs.map((src, i) => (
                <div
                  key={src}
                  onClick={() => {
                    setActiveImg(i);
                    const pref = (restaurant?.diningTimes ?? DINING_TIMES)[0];
                    if (pref) selectDiningTime(pref);
                  }}
                  style={{
                    flex: 1,
                    height: 76,
                    borderRadius: 5,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: activeImg === i ? `2px solid ${C.gold}` : "2px solid transparent",
                    transition: "border 0.2s",
                    position: "relative",
                    zIndex: 40,
                    pointerEvents: "auto",
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s",
                      display: "block",
                      pointerEvents: "auto",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldInput({ type, value, onChange, placeholder, style }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "10px 13px",
        background: "rgba(255,255,255,0.07)",
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        color: "#F7F3EA",
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 13,
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

function GuestPicker({ value, onChange, min = 1, max = 20, style }) {
  const clamp = (n) => Math.max(min, Math.min(max, n));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 13px",
        background: "rgba(255,255,255,0.07)",
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: `1px solid ${C.border}`,
          background: "transparent",
          color: value <= min ? C.muted : C.gold,
          fontSize: 18,
          cursor: value <= min ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: value <= min ? 0.5 : 1,
        }}
      >
        −
      </button>
      <div style={{ flex: 1, display: "grid", gap: 4 }}>
        <div
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(247,243,234,0.55)",
            textAlign: "center",
          }}
        >
          Guests
        </div>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={String(value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            const next = raw === "" ? min : Number(raw);
            if (!Number.isFinite(next)) return;
            onChange(clamp(Math.round(next)));
          }}
          style={{
            width: "100%",
            height: 32,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            color: "#F7F3EA",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
            textAlign: "center",
            outline: "none",
            WebkitAppearance: "textfield",
            MozAppearance: "textfield",
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          border: `1px solid ${C.border}`,
          background: "transparent",
          color: value >= max ? C.muted : C.gold,
          fontSize: 18,
          cursor: value >= max ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: value >= max ? 0.5 : 1,
        }}
      >
        +
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// NEWSLETTER / EMAIL BANNER
// ─────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [ref, vis] = useScrollReveal(0.2);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        overflow: "hidden",
        background: C.darkMid,
        borderTop: `1px solid ${C.borderLight}`,
      }}
    >
      {/* Subtle grid bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            "linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(50px,7vw,80px) clamp(20px,5vw,60px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
          flexWrap: "wrap",
          opacity: vis ? 1 : 0,
          transition: "opacity 0.8s",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <GoldLine width={20} />
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C.gold,
              }}
            >
              Stay Connected
            </span>
          </div>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(26px,3.5vw,38px)",
              fontWeight: 600,
              color: "#F7F3EA",
              lineHeight: 1.2,
            }}
          >
            Via email
          </h3>
        </div>

        {/* Input + socials */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end" }}>
          <div style={{ display: "flex", overflow: "hidden", borderRadius: 3, border: `1px solid ${C.border}` }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{
                padding: "13px 20px",
                background: "rgba(255,255,255,0.05)",
                border: "none",
                color: "#F7F3EA",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
                outline: "none",
                width: 260,
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (!email) return;
                setSent(true);
                setTimeout(() => {
                  setSent(false);
                  setEmail("");
                }, 2500);
              }}
              style={{
                padding: "13px 18px",
                background: sent ? C.gold : C.dark,
                border: "none",
                cursor: "pointer",
                color: sent ? C.dark : C.gold,
                transition: "all 0.25s",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 16,
              }}
            >
              {sent ? "✓" : "→"}
            </button>
          </div>

          {/* Social icons */}
          <div style={{ display: "flex", gap: 10 }}>
            {[
              ["f", "Facebook", "https://www.facebook.com/thebellevuemanila/"],
              ["t", "X (Twitter)", "https://x.com/bellevuemanila"],
              ["i", "Instagram", "https://www.instagram.com/bellevuemanila/"],
              ["y", "YouTube", "https://www.youtube.com/channel/UC01W6kRH_R-T0ok6RDT3aGg"],
            ].map(([icon, label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                title={label}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: `1px solid ${C.border}`,
                  background: "transparent",
                  color: C.muted,
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.gold;
                  e.currentTarget.style.color = C.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color = C.muted;
                }}
              >
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
function Footer({ onNavigate }) {
  return (
    <footer style={{ background: C.dark, borderTop: `1px solid ${C.borderLight}` }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(50px,7vw,80px) clamp(20px,5vw,60px) clamp(30px,4vw,48px)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40, marginBottom: 56 }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 18 }}>
              <img
                src={bellevueLogo}
                alt="The Bellevue Manila"
                style={{ height: 42, width: "auto", display: "block" }}
              />
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#4A4438", lineHeight: 1.85 }}>
              Luxury event spaces and seamless reservations in the heart of Alabang.
            </p>
          </div>

          {/* Venues */}
          <div>
            <FooterHeading>Venues</FooterHeading>
            {[
              { label: "Main Wing", target: "spaces", payload: "Main Wing" },
              { label: "Tower Wing", target: "spaces", payload: "Tower Wing" },
              { label: "Dining – Qsina", target: "dining", payload: "qsina" },
              { label: "20/20 Function Room", target: "venue", payload: "20/20 Function Room" },
            ].map((item) => (
              <FooterLink
                key={item.label}
                onClick={() => onNavigate(item.target, item.payload)}
              >
                {item.label}
              </FooterLink>
            ))}
          </div>

          {/* Reservations */}
          <div>
            <FooterHeading>Reservations</FooterHeading>
            {["Book a Seat", "Book a Table", "Manage Booking", "Admin Portal"].map((v, i) => (
              <FooterLink key={v} onClick={() => onNavigate(i === 3 ? "admin" : "venue")}>
                {v}
              </FooterLink>
            ))}
          </div>

          {/* Contact */}
          <div>
            <FooterHeading>Contact</FooterHeading>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#4A4438", lineHeight: 2, marginBottom: 0 }}>
              02 871 8181 5139
              <br />
              North Bridgeway, Filinvest City
              <br />
              Alabang, Muntinlupa City
              <br />
              <a href="mailto:reservations@thebellevue.com" style={{ color: C.goldDark, textDecoration: "none" }}>
                reservations@thebellevue.com
              </a>
            </p>
          </div>
        </div>

        <Divider color={C.borderLight} mb={24} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#3A3428" }}>
            © {new Date().getFullYear()} The Bellevue Manila. All rights reserved.
          </span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#3A3428" }}>
            Seat & Table Management System
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }) {
  return (
    <div
      style={{
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function FooterLink({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 13,
        color: hov ? C.gold : "#4A4438",
        marginBottom: 10,
        cursor: "pointer",
        transition: "color 0.2s",
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT — HomePage
// ─────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeWing, setActiveWing] = useState(null);
  const [showVenues, setShowVenues] = useState(false);
  const [highlightVenueId, setHighlightVenueId] = useState(null);
  const [diningRestaurantId, setDiningRestaurantId] = useState(null);
  const venuesRef = useRef(null);

  // Dispatch homepage section active events so Navbar can highlight accordingly
  useEffect(() => {
    const headerH = 72;
    const markerY = headerH + 8;

    const inView = (id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top <= markerY && r.bottom > markerY;
    };

    const getActive = () => {
      if (inView("home-event")) return "event";
      if (inView("home-dining")) return "dining";
      return null;
    };

    const onScroll = () => {
      const active = getActive();
      window.dispatchEvent(new CustomEvent("homeActiveSection", { detail: active }));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // run once to initialize state
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      if (!location.state || !location.state.scrollTo) {
        window.scrollTo(0, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      if (location.state.scrollTo === "dining") {
        handleNavigate("dining");
      } else if (location.state.scrollTo === "event") {
        window.location.hash = "#event";
        requestAnimationFrame(() => {
          const el = document.getElementById("home-event");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      navigate(".", { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const venuesByWing = useMemo(() => {
    if (!activeWing) return [];
    if (activeWing === "Dining") return [];
    return VENUES.filter((v) => v.wing === activeWing);
  }, [activeWing]);

  const handleNavigate = (target, payload) => {
    if (target === "all-venues") {
      navigate("/venues");
      return;
    }
    if (target === "venue") {
      const q = typeof payload === "string" ? payload.trim().toLowerCase() : "";
      if (q) {
        const restaurantMatch = RESTAURANTS.find(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q)
        );
        if (restaurantMatch) {
          setDiningRestaurantId(restaurantMatch.id);
          window.location.hash = "#dining";
          requestAnimationFrame(() => {
            const el = document.getElementById("home-dining");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          return;
        }

        const venueMatch = VENUES.find(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.routeId.toLowerCase().includes(q)
        );
        if (venueMatch) {
          setActiveWing(venueMatch.wing);
          setShowVenues(true);
          setHighlightVenueId(venueMatch.id);
          window.location.hash = "#venues";
          requestAnimationFrame(() => {
            const el = venuesRef.current;
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          return;
        }

        if (q.includes("main") || q === "main wing") {
          setActiveWing("Main Wing");
          setShowVenues(true);
          setHighlightVenueId(null);
          window.location.hash = "#venues";
          requestAnimationFrame(() => {
            const el = venuesRef.current;
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          return;
        }
        if (q.includes("tower") || q === "tower wing") {
          setActiveWing("Tower Wing");
          setShowVenues(true);
          setHighlightVenueId(null);
          window.location.hash = "#venues";
          requestAnimationFrame(() => {
            const el = venuesRef.current;
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          return;
        }
        if (q.includes("dining") || q.includes("restaurant")) {
          window.location.hash = "#dining";
          requestAnimationFrame(() => {
            const el = document.getElementById("home-dining");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          return;
        }
      } else {
        setActiveWing("Main Wing");
        setShowVenues(true);
        setHighlightVenueId(null);
        window.location.hash = "#venues";
        requestAnimationFrame(() => {
          const el = venuesRef.current;
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return;
      }
      return;
    }
    if (target === "spaces") {
      setActiveWing(payload);
      setShowVenues(true);
      setHighlightVenueId(null);
      window.location.hash = "#venues";
      requestAnimationFrame(() => {
        const el = venuesRef.current;
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    if (target === "seatmap") {
      navigate(`/reserve/${payload}`);
      return;
    }
    if (target === "dining") {
      const q = typeof payload === "string" ? payload.trim().toLowerCase() : "";
      if (q) {
        const restaurantMatch = RESTAURANTS.find(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q)
        );
        if (restaurantMatch) {
          setDiningRestaurantId(restaurantMatch.id);
        }
      }
      window.location.hash = "#dining";
      requestAnimationFrame(() => {
        const el = document.getElementById("home-dining");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    if (target === "admin") {
      navigate("/admin");
    }
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <Hero onNavigate={handleNavigate} />
      <div id="home-event">
        <BrowseSection onNavigate={handleNavigate} />
      </div>
      <div id="home-venues" ref={venuesRef}>
        {showVenues && activeWing !== "Dining" ? (
          <>
            <VenuesSection
              venues={venuesByWing}
              onReserveVenue={(routeId) => handleNavigate("seatmap", routeId)}
              highlightVenueId={highlightVenueId}
            />
            <div style={{ maxWidth: 1100, margin: "-54px auto 0", padding: "0 clamp(20px,5vw,60px) 64px" }}>
              <div
                style={{
                  border: `1px solid ${C.borderLight}`,
                  background: "rgba(255,255,255,0.6)",
                  borderRadius: 10,
                  padding: "18px 18px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: C.goldDark,
                    marginBottom: 10,
                  }}
                >
                  {activeWing}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                  {venuesByWing.map((v) => (
                    <div key={v.id} style={{ padding: "10px 10px", borderRadius: 8, background: "rgba(255,255,255,0.75)", border: `1px solid ${C.borderLight}` }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: C.ink }}>
                        {v.name}
                      </div>
                      {v.rooms?.length ? (
                        <div style={{ marginTop: 6, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                          {v.rooms.map((r) => (
                            <div key={r}>{r}</div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
      <div id="home-dining">
        <DiningSection onNavigate={handleNavigate} initialRestaurantId={diningRestaurantId} />
      </div>
      <NewsletterSection />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}