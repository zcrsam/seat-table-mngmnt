import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import bellevueLogo from "../../../assets/bellevue-logo.png";
import heroBanner from "../../../assets/banner-grandroom.jpg";

// Local images
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

// ─────────────────────────────────────────────
// DESIGN TOKENS
// Fonts  : Inter (body) + Georgia/serif (display)
// Colors : gold + slate — no pure black
// Min font: 14px
// ─────────────────────────────────────────────
const C = {
  gold:        "#C9A84C",
  goldLight:   "#E2C96A",
  goldDark:    "#9A7A2E",
  goldFaint:   "rgba(201,168,76,0.12)",
  dark:        "#0E0D09",
  darkCard:    "#1A1812",
  darkMid:     "#242018",
  cream:       "#F7F3EA",
  creamDark:   "#EDE7D9",
  creamDeep:   "#E0D8C8",
  slate:       "#3D3629",
  muted:       "#8A8070",
  border:      "rgba(201,168,76,0.18)",
  borderLight: "rgba(201,168,76,0.10)",
};

const F = {
  display: "Georgia, 'Times New Roman', serif",
  body:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

// ─────────────────────────────────────────────
// DATA
// Each category maps to a ?section= URL param
// ─────────────────────────────────────────────
const EVENT_CATEGORIES = [
  {
    id: 1,
    label: "MAIN WING",
    subtitle: "An elegant night at Bellevue",
    img: mainWingImg,
    section: "main-wing",
  },
  {
    id: 2,
    label: "TOWER WING",
    subtitle: "An elegant night at Bellevue",
    img: towerWingImg,
    section: "tower-wing",
  },
  {
    id: 3,
    label: "DINING",
    subtitle: "An elegant night at Bellevue",
    img: diningImg,
    section: "dining",
  },
];

const DINING_TIMES = [
  { label: "Breakfast Buffet", hours: "6:00 – 10:00 AM" },
  { label: "Lunch", hours: "MON · TUE · SAT · SUN" },
  { label: "Light Lunch", hours: "WED · FRI" },
  { label: "Dinner", hours: "MON · THURS" },
  { label: "Dinner Buffet", hours: null },
];

const GALLERY_IMGS = [qsinaImg, qsinaImg2, qsinaImg3];

const RESTAURANTS = [
  {
    id: "qsina",
    name: "Qsina",
    description: "Qsina offers diverse culinary delights with both international buffets and à la carte options. From lavish breakfast spreads to intimate dinner experiences.",
    imgs: [qsinaImg, qsinaImg2, qsinaImg3],
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
    description: "Hanakazu brings authentic Japanese cuisine to The Bellevue Manila. Savor fresh sushi, sashimi, and teppanyaki in an elegant setting.",
    imgs: [hanakazuImg, hanakazuImg2, hanakazuImg3],
    diningTimes: [
      { label: "Lunch", hours: "11:30 AM – 2:30 PM" },
      { label: "Dinner", hours: "6:00 PM – 10:00 PM" },
      { label: "Omakase", hours: "By reservation" },
    ],
  },
  {
    id: "phoenix-court",
    name: "Phoenix Court",
    description: "Phoenix Court presents refined Cantonese and Chinese cuisine. Experience dim sum, Peking duck, and classic dishes in a sophisticated atmosphere.",
    imgs: [phoenixCourtImg, qsinaImg2, qsinaImg3],
    diningTimes: [
      { label: "Dim Sum", hours: "5:00 AM – 11:29 PM" },
      { label: "Lunch", hours: "11:30 AM – 2:30 PM" },
      { label: "Dinner", hours: "6:00 PM – 10:00 PM" },
    ],
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function Divider({ color = C.border, mb = 0, mt = 0 }) {
  return <div style={{ height: 1, background: color, margin: `${mt}px 0 ${mb}px` }} />;
}

function GoldLine({ width = 32 }) {
  return (
    <span style={{ display: "inline-block", width, height: 1, background: C.gold, verticalAlign: "middle" }} />
  );
}

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
// HERO — no search, no wing pills
// ─────────────────────────────────────────────
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fade = (delay = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.8s ${delay}s ease, transform 0.8s ${delay}s ease`,
  });

  return (
    <section style={{ position: "relative", height: "100vh", minHeight: 680, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Background image — blurred + dark tint */}
      <img src={heroBanner} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(6px) brightness(0.32)", transform: "scale(1.06)", pointerEvents: "none" }} />
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,9,6,0.55)" }} />
      {/* Radial gold glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%, rgba(201,168,76,0.07) 0%, transparent 65%)" }} />
      {/* Decorative lines */}
      <div style={{ position: "absolute", top: 90, left: 40, right: 40, height: 1, background: `linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)` }} />
      <div style={{ position: "absolute", bottom: 80, left: 40, right: 40, height: 1, background: `linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)` }} />

      <div style={{ position: "relative", textAlign: "center", maxWidth: 740, padding: "0 24px" }}>
        {/* Eyebrow */}
        <div style={{ ...fade(0), marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <GoldLine width={36} />
          <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: C.gold }}>
            Seat & Table Reservation
          </span>
          <GoldLine width={36} />
        </div>

        {/* H1 */}
        <h1 style={{ ...fade(0.12), fontFamily: F.display, fontSize: "clamp(46px,7.5vw,88px)", fontWeight: 600, color: "#F7F3EA", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 22 }}>
          Reserve Your
          <br />
          <em style={{ color: C.gold, fontStyle: "italic" }}>Perfect Seat</em>
        </h1>

        {/* Subtitle */}
        <p style={{ ...fade(0.22), fontFamily: F.body, fontSize: 16, color: "rgba(247,243,234,0.60)", lineHeight: 1.75, maxWidth: 500, margin: "0 auto" }}>
          Experience unparalleled luxury and seamless event booking at The Bellevue Manila.
          Select an upcoming event below to secure your placement.
        </p>
      </div>

      {/* Scroll hint */}
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.45 }}>
        <span style={{ fontFamily: F.body, fontSize: 14, letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold }}>Scroll</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// BROWSE SECTION
// Each card navigates to /venues?section=<section>
// ─────────────────────────────────────────────
function BrowseSection({ onNavigateToVenues }) {
  const [ref, vis] = useScrollReveal();

  return (
    <section ref={ref} style={{ background: C.cream, padding: "clamp(64px,9vw,110px) clamp(20px,5vw,60px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: 44, flexWrap: "wrap", gap: 16,
          opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
          transition: "opacity 0.7s, transform 0.7s",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <GoldLine width={24} />
              <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold }}>
                Browse by event type
              </span>
            </div>
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(30px,4vw,46px)", fontWeight: 600, color: C.slate, lineHeight: 1.1, margin: 0 }}>
              Select an event to view
              <br />
              the layout and reserve.
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToVenues()}
            style={{ padding: "11px 26px", border: `1px solid ${C.gold}`, background: "transparent", color: C.goldDark, fontFamily: F.body, fontSize: 14, fontWeight: 600, letterSpacing: "0.10em", cursor: "pointer", borderRadius: 2, transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = C.dark; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.goldDark; }}
          >
            VIEW ALL VENUES →
          </button>
        </div>

        {/* Cards — each navigates to its own section */}
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
              onClick={() => onNavigateToVenues(cat.section)}
            />
          ))}
        </div>
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
        transform: hov ? "translateY(-6px)" : (style.transform || "none"),
        transition: "transform 0.3s, box-shadow 0.3s, opacity 0.7s",
      }}
    >
      <div style={{ height: 188, overflow: "hidden", position: "relative" }}>
        <img
          src={cat.img} alt={cat.label} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s", transform: hov ? "scale(1.06)" : "scale(1)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 55%)", opacity: hov ? 1 : 0.4, transition: "opacity 0.3s" }} />
      </div>
      <div style={{ padding: "16px 18px", borderTop: `1px solid ${C.creamDeep}` }}>
        <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", color: C.slate, marginBottom: 4 }}>{cat.label}</div>
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.muted }}>{cat.subtitle}</div>
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
  const [forcedHighlightedLabel, setForcedHighlightedLabel] = useState(null);
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
    if (!time) return null;
    const s = String(time).trim();
    let m = /^(\d{1,2}):(\d{2})$/.exec(s);
    if (m) { let hh = Number(m[1]); const mm = Number(m[2]); if (Number.isFinite(hh) && Number.isFinite(mm)) { if (hh === 24) hh = 0; return hh * 60 + mm; } }
    m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(s.replace(/\s+/g, " ")) || /^(\d{1,2})\s*(AM|PM)$/i.exec(s);
    if (m) { const hh = Number(m[1]); const mm = Number(m[2] || 0); const ap = (m[3] || m[2] || "").toUpperCase(); if (Number.isFinite(hh) && Number.isFinite(mm)) { let h = hh % 12; if (ap === "PM") h += 12; return h * 60 + mm; } }
    return null;
  }, [time]);

  const parseHoursRange = (hours) => {
    if (!hours || typeof hours !== "string") return null;
    const re = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i;
    const m = re.exec(hours); if (!m) return null;
    const toMin = (h, min, ap) => { let hh = Number(h); const mm = Number(min || 0); const u = String(ap || "").toUpperCase(); if (u === "AM") { if (hh === 12) hh = 0; } else if (u === "PM") { if (hh !== 12) hh += 12; } return hh * 60 + mm; };
    const start = toMin(m[1], m[2], m[3]); const end = toMin(m[4], m[5], m[6]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return { start, end };
  };

  const fallbackSlot = useMemo(() => {
    if (selectedMinutes == null) return null;
    if (selectedMinutes >= 360 && selectedMinutes < 600) return "Breakfast Buffet";
    if (selectedMinutes >= 660 && selectedMinutes < 780) return "Lunch";
    if (selectedMinutes >= 780 && selectedMinutes < 1020) return "Light Lunch";
    if (selectedMinutes >= 1020 && selectedMinutes < 1200) return "Dinner";
    if (selectedMinutes >= 1200 && selectedMinutes < 1320) return "Dinner Buffet";
    return null;
  }, [selectedMinutes]);

  const getNextDateForWeekdays = (weekdays) => {
    if (!weekdays?.length) return null;
    const names = ["sun","mon","tue","wed","thu","fri","sat"];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const dow = names[d.getDay()];
      if (weekdays.includes(dow)) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    }
    return null;
  };

  const repTime = (label) => ({ "Breakfast Buffet":"08:00", Lunch:"12:00", "Light Lunch":"15:00", Dinner:"18:00", "Dinner Buffet":"20:00" })[label] || "12:00";

  const selectDiningTime = (d) => {
    const range = parseHoursRange(d.hours);
    if (range) { const hh = Math.floor(range.start/60); const mm = range.start%60; setTime(`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`); }
    else setTime(repTime(d.label));
    const hh = String(d.hours || "").toLowerCase();
    const dayMatches = hh.match(/mon|tue|wed|thu|thur|fri|sat|sun/g);
    if (dayMatches?.length) { const tokens = dayMatches.map((s) => s.replace("thur","thu").slice(0,3)); const next = getNextDateForWeekdays(tokens); if (next) setDate(next); }
    setForcedHighlightedLabel(d.label);
  };

  const highlightedLabel = useMemo(() => {
    const times = restaurant?.diningTimes ?? DINING_TIMES;
    if (forcedHighlightedLabel && times.some((t) => t.label === forcedHighlightedLabel)) return forcedHighlightedLabel;
    if (!times?.length || selectedMinutes == null) return null;
    for (const t of times) {
      const range = parseHoursRange(t.hours); if (!range) continue;
      const { start, end } = range;
      if (start <= end ? selectedMinutes >= start && selectedMinutes <= end : selectedMinutes >= start || selectedMinutes <= end) return t.label;
    }
    if (!fallbackSlot) return null;
    const norm = (s) => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    const candidates = fallbackSlot === "Light Lunch" ? ["Light Lunch","Lunch"] : fallbackSlot === "Dinner Buffet" ? ["Dinner Buffet","Dinner"] : [fallbackSlot];
    const nCands = candidates.map(norm);
    let selectedDay = null;
    if (date) { const d = new Date(date+"T00:00:00"); if (!Number.isNaN(d.getTime())) selectedDay = ["sun","mon","tue","wed","thu","fri","sat"][d.getDay()]; }
    for (const t of times) {
      const range = parseHoursRange(t.hours); if (range) continue;
      const hh = String(t.hours||"").toLowerCase();
      const hasDays = /mon|tue|wed|thu|thur|fri|sat|sun/.test(hh);
      if (hasDays) {
        if (!selectedDay) continue;
        const tokens = (hh.match(/mon|tue|wed|thu|thur|fri|sat|sun/g)||[]).map((s)=>s.replace("thur","thu").slice(0,3));
        if (!tokens.includes(selectedDay)) continue;
        if (nCands.includes(norm(t.label))) return t.label;
      } else { if (!t.hours && nCands.includes(norm(t.label))) return t.label; }
    }
    return null;
  }, [restaurant, selectedMinutes, fallbackSlot, date, forcedHighlightedLabel]);

  useEffect(() => { setActiveImg(0); }, [activeRestaurant]);
  useEffect(() => { setForcedHighlightedLabel(null); }, [activeRestaurant]);
  useEffect(() => {
    const id = setInterval(() => setActiveImg((n) => (n+1) % imgs.length), 4000);
    return () => clearInterval(id);
  }, [imgs.length]);

  return (
    <section ref={ref} style={{ background: C.dark, padding: "clamp(64px,9vw,110px) clamp(20px,5vw,60px)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,80px)", alignItems: "start" }}>

          {/* LEFT */}
          <div style={{ position: "relative", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(-30px)", transition: "opacity 0.8s, transform 0.8s" }}>
            <div style={{ borderRadius: 10, overflow: "hidden", height: 420, position: "relative" }}>
              {imgs.map((src, i) => (
                <img key={src} src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: activeImg === i ? 1 : 0, transition: "opacity 0.55s ease" }} />
              ))}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(14,13,9,0.85) 0%,transparent 55%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 110, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                {imgs.map((_, i) => (
                  <button key={i} type="button" onClick={() => setActiveImg(i)} style={{ width: 6, height: 6, borderRadius: "50%", border: "none", background: i === activeImg ? C.gold : "rgba(255,255,255,0.35)", cursor: "pointer", padding: 0, transition: "background 0.2s" }} />
                ))}
              </div>
            </div>

            {/* Floating widget */}
            <div style={{ position: "absolute", bottom: -28, left: 24, right: 24, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "22px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.goldFaint, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: C.gold, fontSize: 14 }}>⌖</span>
                </div>
                <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold }}>Find Restaurants</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <FieldInput type="date" value={date} onChange={(v) => { setForcedHighlightedLabel(null); setDate(v); }} />
                <FieldInput type="time" value={time} onChange={(v) => { setForcedHighlightedLabel(null); setTime(v); }} />
              </div>
              <GuestPicker value={guests} onChange={setGuests} style={{ marginBottom: 14 }} />
              <button type="button" onClick={() => onNavigate("venue")}
                style={{ width: "100%", padding: "12px", background: C.gold, border: "none", borderRadius: 4, fontFamily: F.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.dark, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.goldLight)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}>
                SUBMIT
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ paddingTop: 10, opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(30px)", transition: "opacity 0.8s 0.15s, transform 0.8s 0.15s", position: "relative", zIndex: 10005 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[{d:-1,disabled:activeRestaurant===0,lbl:"←"},{d:1,disabled:activeRestaurant===totalRestaurants-1,lbl:"→"}].map(({d,disabled,lbl}) => (
                <button key={lbl} type="button" disabled={disabled}
                  onClick={() => setActiveRestaurant((n) => Math.max(0, Math.min(totalRestaurants-1, n+d)))}
                  style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.border}`, background: "transparent", color: disabled ? C.muted : C.gold, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: F.body, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", fontSize: 16 }}
                  onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = disabled ? C.muted : C.gold; }}>
                  {lbl}
                </button>
              ))}
            </div>

            <h2 style={{ fontFamily: F.display, fontSize: "clamp(40px,5vw,64px)", fontWeight: 600, color: "#F7F3EA", marginBottom: 16, lineHeight: 0.95, letterSpacing: "-0.01em" }}>
              {restaurant?.name ?? "Qsina"}
            </h2>
            <p style={{ fontFamily: F.body, fontSize: 14, color: "#8A8070", lineHeight: 1.85, marginBottom: 32, maxWidth: 380 }}>
              {restaurant?.description ?? "Qsina offers diverse culinary delights with both international buffets and à la carte options."}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
              {(restaurant?.diningTimes ?? DINING_TIMES).map((d) => {
                const active = highlightedLabel ? d.label === highlightedLabel : false;
                return (
                  <button key={d.label} type="button" onClick={() => selectDiningTime(d)}
                    style={{ padding: "7px 14px", borderRadius: 3, background: active ? C.gold : "rgba(255,255,255,0.05)", border: `1px solid ${active ? C.gold : C.border}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", position: "relative", zIndex: 10006 }}>
                    <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", color: active ? C.dark : C.gold }}>{d.label}</div>
                    {d.hours && <div style={{ fontFamily: F.body, fontSize: 14, color: active ? "rgba(14,13,9,0.55)" : C.muted, marginTop: 2 }}>{d.hours}</div>}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {imgs.map((src, i) => (
                <div key={src}
                  onClick={() => { setActiveImg(i); const pref = (restaurant?.diningTimes ?? DINING_TIMES)[0]; if (pref) selectDiningTime(pref); }}
                  style={{ flex: 1, height: 76, borderRadius: 5, overflow: "hidden", cursor: "pointer", border: activeImg === i ? `2px solid ${C.gold}` : "2px solid transparent", transition: "border 0.2s", position: "relative", zIndex: 40 }}>
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
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "10px 13px", background: "rgba(255,255,255,0.07)", border: `1px solid ${C.border}`, borderRadius: 4, color: "#F7F3EA", fontFamily: F.body, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
  );
}

function GuestPicker({ value, onChange, min = 1, max = 20, style }) {
  const clamp = (n) => Math.max(min, Math.min(max, n));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", background: "rgba(255,255,255,0.07)", border: `1px solid ${C.border}`, borderRadius: 4, ...style }}>
      <button type="button" onClick={() => onChange(clamp(value-1))} disabled={value<=min} style={{ width: 32, height: 32, borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: value<=min ? C.muted : C.gold, fontSize: 18, cursor: value<=min ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: value<=min ? 0.5 : 1 }}>−</button>
      <div style={{ flex: 1, display: "grid", gap: 4 }}>
        <div style={{ fontFamily: F.body, fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(247,243,234,0.55)", textAlign: "center" }}>Guests</div>
        <input type="text" inputMode="numeric" pattern="[0-9]*" value={String(value)}
          onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g,""); const next = raw===""?min:Number(raw); if(!Number.isFinite(next))return; onChange(clamp(Math.round(next))); }}
          style={{ width: "100%", height: 32, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 6, color: "#F7F3EA", fontFamily: F.body, fontSize: 14, textAlign: "center", outline: "none", WebkitAppearance: "textfield", MozAppearance: "textfield" }} />
      </div>
      <button type="button" onClick={() => onChange(clamp(value+1))} disabled={value>=max} style={{ width: 32, height: 32, borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: value>=max ? C.muted : C.gold, fontSize: 18, cursor: value>=max ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: value>=max ? 0.5 : 1 }}>+</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [ref, vis] = useScrollReveal(0.2);
  return (
    <section ref={ref} style={{ position: "relative", overflow: "hidden", background: C.darkMid, borderTop: `1px solid ${C.borderLight}` }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "clamp(50px,7vw,80px) clamp(20px,5vw,60px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap", opacity: vis ? 1 : 0, transition: "opacity 0.8s" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <GoldLine width={20} />
            <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold }}>Stay Connected</span>
          </div>
          <h3 style={{ fontFamily: F.display, fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 600, color: "#F7F3EA", lineHeight: 1.2, margin: 0 }}>Via email</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end" }}>
          <div style={{ display: "flex", overflow: "hidden", borderRadius: 3, border: `1px solid ${C.border}` }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ padding: "13px 20px", background: "rgba(255,255,255,0.05)", border: "none", color: "#F7F3EA", fontFamily: F.body, fontSize: 14, outline: "none", width: 260 }} />
            <button type="button" onClick={() => { if (!email) return; setSent(true); setTimeout(() => { setSent(false); setEmail(""); }, 2500); }} style={{ padding: "13px 18px", background: sent ? C.gold : C.dark, border: "none", cursor: "pointer", color: sent ? C.dark : C.gold, transition: "all 0.25s", fontFamily: F.body, fontSize: 16 }}>
              {sent ? "✓" : "→"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[["f","Facebook","https://www.facebook.com/thebellevuemanila/"],["t","X","https://x.com/bellevuemanila"],["i","Instagram","https://www.instagram.com/bellevuemanila/"],["y","YouTube","https://www.youtube.com/channel/UC01W6kRH_R-T0ok6RDT3aGg"]].map(([icon,label,href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" title={label} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.border}`, color: C.muted, fontFamily: F.body, fontSize: 14, fontWeight: 700, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
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
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(50px,7vw,80px) clamp(20px,5vw,60px) clamp(30px,4vw,48px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40, marginBottom: 56 }}>
          <div>
            <div style={{ marginBottom: 18 }}>
              <img src={bellevueLogo} alt="The Bellevue Manila" style={{ height: 42, width: "auto", display: "block" }} />
            </div>
            <p style={{ fontFamily: F.body, fontSize: 14, color: "#4A4438", lineHeight: 1.85, margin: 0 }}>Luxury event spaces and seamless reservations in the heart of Alabang.</p>
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
          </div>
          <div>
            <FooterHeading>Contact</FooterHeading>
            <p style={{ fontFamily: F.body, fontSize: 14, color: "#4A4438", lineHeight: 2, margin: 0 }}>
              02 871 8181 5139<br />
              North Bridgeway, Filinvest City<br />
              Alabang, Muntinlupa City<br />
              <a href="mailto:reservations@thebellevue.com" style={{ color: C.goldDark, textDecoration: "none" }}>reservations@thebellevue.com</a>
            </p>
          </div>
        </div>
        <Divider color={C.borderLight} mb={24} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: F.body, fontSize: 14, color: "#3A3428" }}>© {new Date().getFullYear()} The Bellevue Manila. All rights reserved.</span>
          <span style={{ fontFamily: F.body, fontSize: 14, color: "#3A3428" }}>Seat & Table Management System</span>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }) {
  return <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>{children}</div>;
}

function FooterLink({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ fontFamily: F.body, fontSize: 14, color: hov ? C.gold : "#4A4438", marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}>
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

  // Navigate to /venues with an optional ?section= param
  const goToVenues = (section) => {
    if (section) navigate(`/venues?section=${section}`);
    else navigate("/venues");
  };

  useEffect(() => {
    const headerH = 72; const markerY = headerH + 8;
    const inView = (id) => { const el = document.getElementById(id); if (!el) return false; const r = el.getBoundingClientRect(); return r.top <= markerY && r.bottom > markerY; };
    const onScroll = () => window.dispatchEvent(new CustomEvent("homeActiveSection", { detail: inView("home-event") ? "event" : inView("home-dining") ? "dining" : null }));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && (!location.state || !location.state.scrollTo)) window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      if (location.state.scrollTo === "dining") {
        requestAnimationFrame(() => { const el = document.getElementById("home-dining"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); });
      } else if (location.state.scrollTo === "event") {
        requestAnimationFrame(() => { const el = document.getElementById("home-event"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); });
      }
      navigate(".", { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleNavigate = (target, payload) => {
    if (target === "venue") { navigate("/venues"); return; }
    if (target === "dining") {
      const q = typeof payload === "string" ? payload.trim().toLowerCase() : "";
      if (q) {
        const m = RESTAURANTS.find((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
        if (m) setDiningRestaurantId(m.id);
      }
      requestAnimationFrame(() => { const el = document.getElementById("home-dining"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); });
      return;
    }
    if (target === "admin") navigate("/admin");
  };

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <Hero />
      <div id="home-event">
        <BrowseSection onNavigateToVenues={goToVenues} />
      </div>
      <div id="home-dining">
        <DiningSection onNavigate={handleNavigate} initialRestaurantId={diningRestaurantId} />
      </div>
      <NewsletterSection />
      <Footer onNavigate={goToVenues} />
    </div>
  );
}