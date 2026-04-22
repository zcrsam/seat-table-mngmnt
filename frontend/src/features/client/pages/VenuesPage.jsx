// src/features/client/pages/VenuesPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SharedNavbar from "../../../components/SharedNavbar.jsx";

import alabangImg        from "../../../assets/afc.jpeg";
import lagunaImg         from "../../../assets/laguna.jpeg";
import twentyTwentyImg   from "../../../assets/20-20.jpeg";
import businessCenterImg from "../../../assets/bc.jpeg";
import towerBallroomImg  from "../../../assets/towerb.jpeg";
import grandBallroomImg  from "../../../assets/grandr.jpg";
import qsinaImg          from "../../../assets/qsina.jpeg";
import hanakazuImg       from "../../../assets/hanakazu.jpeg";
import phoenixCourtImg   from "../../../assets/phoenix-court.jpeg";

// ── THEME ─────────────────────────────────────────────────────────────────────
function useThemeMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const s = localStorage.getItem("bellevue-theme");
      if (s !== null) return s === "dark";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });
  const toggle = () => setIsDark(prev => {
    const next = !prev;
    try { localStorage.setItem("bellevue-theme", next ? "dark" : "light"); } catch {}
    return next;
  });
  return { isDark, toggle };
}

function getTokens(isDark) {
  return isDark ? {
    gold:            "#C9A84C",
    goldLight:       "#E2C96A",
    goldDim:         "#A07828",
    goldFaint:       "rgba(201,168,76,0.08)",
    goldBorder:      "rgba(201,168,76,0.20)",
    pageBg:          "#111009",
    cardBg:          "#1C1A14",
    cardBgHov:       "#221F17",
    text:            "#F0E8D0",
    textSub:         "#C8B880",
    textMuted:       "#7A6E58",
    border:          "rgba(201,168,76,0.14)",
    borderHov:       "rgba(201,168,76,0.42)",
    surface:         "#1C1A14",
    surfaceEl:       "#211F18",
    modalBg:         "#18160F",
    divider:         "rgba(201,168,76,0.10)",
    shadow:          "0 2px 20px rgba(0,0,0,0.45)",
    shadowHov:       "0 24px 64px rgba(0,0,0,0.65)",
    tagBg:           "rgba(201,168,76,0.10)",
    overlayBg:       "rgba(6,5,3,0.82)",
    dotsBg:          "#2A2720",
    dotsColor:       "#C9A84C",
    dotsBgHov:       "rgba(201,168,76,0.18)",
    inlineResBg:     "#16140D",
    inlineResBorder: "rgba(201,168,76,0.22)",
  } : {
    gold:            "#9A6E1C",
    goldLight:       "#C49A2C",
    goldDim:         "#7A5814",
    goldFaint:       "rgba(154,110,28,0.07)",
    goldBorder:      "rgba(154,110,28,0.18)",
    pageBg:          "#F4EFE4",
    cardBg:          "#FFFFFF",
    cardBgHov:       "#FDFAF4",
    text:            "#1A1510",
    textSub:         "#6A5830",
    textMuted:       "#9A8C6E",
    border:          "rgba(154,110,28,0.12)",
    borderHov:       "rgba(154,110,28,0.42)",
    surface:         "#FFFFFF",
    surfaceEl:       "#F9F6EF",
    modalBg:         "#FFFFFF",
    divider:         "rgba(154,110,28,0.10)",
    shadow:          "0 2px 20px rgba(100,80,30,0.10)",
    shadowHov:       "0 24px 64px rgba(100,80,30,0.20)",
    tagBg:           "rgba(154,110,28,0.08)",
    overlayBg:       "rgba(20,16,8,0.60)",
    dotsBg:          "#F0EBE0",
    dotsColor:       "#9A6E1C",
    dotsBgHov:       "rgba(154,110,28,0.14)",
    inlineResBg:     "#FAF6EE",
    inlineResBorder: "rgba(154,110,28,0.20)",
  };
}

const FONT    = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const DISPLAY = "'Playfair Display', 'Times New Roman', serif";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const SECTION_IDS = {
  "Main Wing":  "section-main-wing",
  "Tower Wing": "section-tower-wing",
  "Dining":     "section-dining",
};

const WING_FOR_ROOM = {};
Object.entries({
  "Main Wing":  ["Alabang Function Room","Laguna Ballroom","Laguna 1","Laguna 2","20/20 Function Room","20/20 Function Room A","20/20 Function Room B","20/20 Function Room C","Business Center"],
  "Tower Wing": ["Tower Ballroom","Tower 1","Tower 2","Tower 3","Grand Ballroom","Grand A","Grand B","Grand C"],
  "Dining":     ["Qsina","Hanakazu","Phoenix Court"],
}).forEach(([wing, rooms]) => rooms.forEach(r => { WING_FOR_ROOM[r] = wing; }));

const STATIC_VENUES = {
  "Main Wing": [
    { id:"alabang",         name:"Alabang Function Room", img:alabangImg,        seats:150, tables:14, rooms:[],                                          description:"The Alabang Function Room is an elegantly appointed venue ideal for intimate corporate events, private dinners, and social gatherings.", seatMapKeys:["Alabang Function Room"] },
    { id:"laguna",          name:"Laguna Ballroom",       img:lagunaImg,         seats:250, tables:11, rooms:["Laguna 1","Laguna 2"],                      description:"The Laguna Ballroom combines timeless elegance with modern functionality — a favored choice for weddings, gala evenings, and corporate celebrations.", seatMapKeys:["Laguna Ballroom","Laguna 1","Laguna 2"] },
    { id:"20-20",           name:"20/20 Function Room",   img:twentyTwentyImg,   seats:120, tables:12, rooms:["20/20 A","20/20 B","20/20 C"],              description:"A versatile multi-use function room with a contemporary aesthetic, the 20/20 offers three configurable sub-sections suited to seminars and board meetings.", seatMapKeys:["20/20 Function Room","20/20 Function Room A","20/20 Function Room B","20/20 Function Room C"] },
    { id:"business-center", name:"Business Center",       img:businessCenterImg, seats:80,  tables:10, rooms:[],                                          description:"A purpose-built executive venue designed for high-level conferences, board meetings, and corporate workshops.", seatMapKeys:["Business Center"] },
  ],
  "Tower Wing": [
    { id:"tower-ballroom",  name:"Tower Ballroom",        img:towerBallroomImg,  seats:300, tables:15, rooms:["Tower 1","Tower 2","Tower 3"],              description:"Rising above the city, the Tower Ballroom is a signature event destination offering sweeping panoramic views and refined grandeur.", seatMapKeys:["Tower Ballroom","Tower 1","Tower 2","Tower 3"] },
    { id:"grand-ballroom",  name:"Grand Ballroom",        img:grandBallroomImg,  seats:400, tables:20, rooms:["Grand A","Grand B","Grand C"],              description:"The Grand Ballroom is Bellevue Manila's most prestigious event space — a sweeping venue of exceptional scale and elegance.", seatMapKeys:["Grand Ballroom","Grand A","Grand B","Grand C"] },
  ],
  "Dining": [
    { id:"qsina",           name:"Qsina",                 img:qsinaImg,          seats:120, tables:12, rooms:[],                                          description:"Qsina is Bellevue Manila's celebrated all-day dining restaurant, offering an elevated international buffet experience with live cooking stations.", seatMapKeys:["Qsina"] },
    { id:"hanakazu",        name:"Hanakazu",              img:hanakazuImg,       seats:80,  tables:10, rooms:[],                                          description:"Hanakazu is Bellevue Manila's Japanese specialty restaurant, offering an authentic izakaya and kaiseki dining experience.", seatMapKeys:["Hanakazu"] },
    { id:"phoenix-court",   name:"Phoenix Court",         img:phoenixCourtImg,   seats:140, tables:16, rooms:[],                                          description:"Phoenix Court is Bellevue Manila's distinguished Chinese restaurant, renowned for masterfully prepared Cantonese dishes and traditional dim sum.", seatMapKeys:["Phoenix Court"] },
  ],
  
};

// ── GSAP LOADER ───────────────────────────────────────────────────────────────
async function loadGsap() {
  if (!window.gsap) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  if (!window.ScrollTrigger) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    window.gsap.registerPlugin(window.ScrollTrigger);
  }
}

function useGsapScroll(opts = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const run = async () => {
      await loadGsap();
      if (!ref.current) return;
      const { y = 40, opacity = 0, duration = 0.85, ease = "power3.out", delay = 0, stagger = 0, selector = null } = opts;
      const targets = selector ? ref.current.querySelectorAll(selector) : [ref.current];
      window.gsap.fromTo(targets,
        { y, opacity },
        { y: 0, opacity: 1, duration, ease, delay, stagger,
          scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } }
      );
    };
    run().catch(console.error);
  }, []);
  return ref;
}

// ── DATA UTILS ────────────────────────────────────────────────────────────────
function readSeatMapCounts(wing, room) {
  try {
    const raw = localStorage.getItem(`seatmap_layout:${wing}:${room}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    let tableArr = [], standaloneArr = [];
    if (parsed?.v === 2 && Array.isArray(parsed.tables)) { tableArr = parsed.tables; standaloneArr = parsed.standaloneSeats || []; }
    else if (Array.isArray(parsed)) { tableArr = parsed; }
    else if (parsed?.tables) { tableArr = parsed.tables; standaloneArr = parsed.standaloneSeats || []; }
    else return null;
    const valid = tableArr.filter(t => t && Array.isArray(t.seats) && t.seats.length > 0);
    return { seats: valid.reduce((s, t) => s + t.seats.length, 0) + standaloneArr.length, tables: valid.length };
  } catch { return null; }
}

function aggregateCounts(venue) {
  const keys = venue.seatMapKeys || [];
  if (!keys.length) return null;
  const primary = readSeatMapCounts(WING_FOR_ROOM[keys[0]], keys[0]);
  if (primary && primary.seats > 0) return primary;
  let seats = 0, tables = 0, found = false;
  for (let i = 1; i < keys.length; i++) {
    const c = readSeatMapCounts(WING_FOR_ROOM[keys[i]], keys[i]);
    if (c) { seats += c.seats; tables += c.tables; found = true; }
  }
  return found ? { seats, tables } : null;
}

async function fetchVenueStats() {
  try {
    const res = await fetch(`${API_BASE}/reservations?per_page=500&page=1`, { headers: { Accept: "application/json" } });
    if (!res.ok) return {};
    const json = await res.json();
    const list = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : Array.isArray(json.reservations) ? json.reservations : [];
    const stats = {};
    list.forEach(r => {
      const room = (r.room || r.venue || ""); const status = (r.status || "").toLowerCase();
      if (!room) return;
      if (!stats[room]) stats[room] = { reserved: 0, pending: 0, total: 0 };
      stats[room].total++;
      if (status === "reserved" || status === "approved") stats[room].reserved++;
      if (status === "pending") stats[room].pending++;
    });
    return stats;
  } catch { return {}; }
}

// ── RESPONSIVE ───────────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" ? window.innerWidth < bp : false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${bp - 1}px)`);
    const h = (e) => setM(e.matches);
    mq.addEventListener("change", h); setM(mq.matches);
    return () => mq.removeEventListener("change", h);
  }, [bp]);
  return m;
}

// ── SVG ICONS ─────────────────────────────────────────────────────────────────
const ChevLeft = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevRight = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ── ROOM DROPDOWN ─────────────────────────────────────────────────────────────
function RoomDropdown({ rooms, onRoomClick, C }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const valid = rooms.filter(r => r && r.trim());
  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 10px", background: open ? C.goldFaint : "transparent", border: `1px solid ${open ? C.gold : C.goldBorder}`, fontSize: 11, fontWeight: 600, color: open ? C.gold : C.textMuted, cursor: "pointer", transition: "all 0.18s", fontFamily: FONT, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", outline: "none" }}
        onMouseEnter={e => { e.currentTarget.style.background = C.goldFaint; e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.gold; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.goldBorder; } }}>
        <span>Sub-rooms ({valid.length})</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 120, background: C.surface, border: `1px solid ${C.goldBorder}`, boxShadow: "0 12px 40px rgba(0,0,0,0.22)", minWidth: "100%", overflow: "hidden" }}>
          {valid.map((r, i) => (
            <button key={r} type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); onRoomClick(r); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: "transparent", border: "none", borderTop: i === 0 ? "none" : `1px solid ${C.divider}`, textAlign: "left", fontSize: 13, color: C.text, cursor: "pointer", fontFamily: FONT, fontWeight: 400, transition: "background 0.12s,color 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.goldFaint; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.text; }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.goldDim, flexShrink: 0 }} />
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── VENUE MODAL ───────────────────────────────────────────────────────────────
function VenueModal({ venue, onClose, onReserve, C, isDark }) {
  const isMobile = useIsMobile();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  
  // Handle subroom selection - find the correct venue object
  const getVenueForReservation = () => {
    // If this venue has subrooms, find the matching subroom
    if (venue.rooms && venue.rooms.length > 0) {
      // This is a parent venue with subrooms - need to find the specific subroom
      const allVenues = Object.values(STATIC_VENUES).flat();
      return allVenues.find(v => v.id === venue.id);
    }
    // This is already a specific venue (no subrooms)
    return venue;
  };
  
  const reservationVenue = getVenueForReservation();
  const live    = aggregateCounts(reservationVenue);
  const dSeats  = live?.seats  ?? reservationVenue.seats;
  const dTables = live?.tables ?? reservationVenue.tables;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 10000, background: C.overlayBg, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "32px" }}>
      <style>{`@keyframes bvFadeIn{from{opacity:0}to{opacity:1}}@keyframes bvSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div onClick={e => e.stopPropagation()}
        style={{ background: C.modalBg, border: `1px solid ${C.goldBorder}`, width: "100%", maxWidth: 680, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.72)" : "0 32px 80px rgba(80,60,10,0.24)", animation: "bvSlideUp 0.30s cubic-bezier(0.25,0.46,0.45,0.94)" }}>
        <div style={{ height: isMobile ? 200 : 260, position: "relative", flexShrink: 0, overflow: "hidden" }}>
          <img src={venue.img} alt={venue.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0.10)0%,rgba(0,0,0,0.72)100%)" }} />
          <button onClick={onClose}
            style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.44)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, transition: "background 0.18s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.72)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.44)"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div style={{ position: "absolute", bottom: 20, left: 24, right: 60 }}>
            <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.20em", textTransform: "uppercase", margin: "0 0 6px" }}>Venue Details</p>
            <h2 style={{ fontFamily: FONT, fontSize: isMobile ? 20 : 26, fontWeight: 700, color: "#FFFFFF", margin: 0, lineHeight: 1.15, letterSpacing: "-0.3px" }}>{venue.name}</h2>
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: isMobile ? "22px 20px 28px" : "28px 32px 36px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", gap: 0, border: `1px solid ${C.divider}`, overflow: "hidden" }}>
            {[
              { label: "Capacity", value: `${dSeats > 0 ? dSeats : venue.seats} guests` },
              { label: "Tables",   value: `${dTables > 0 ? dTables : venue.tables} tables` },
              { label: "Sub-rooms", value: venue.rooms.length > 0 ? `${venue.rooms.length} available` : "Open hall" },
            ].map((stat, i) => (
              <div key={stat.label} style={{ flex: 1, padding: "14px 16px", borderLeft: i === 0 ? "none" : `1px solid ${C.divider}`, background: C.surfaceEl }}>
                <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 4px" }}>{stat.label}</p>
                <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>
          {venue._stats && (venue._stats.reserved > 0 || venue._stats.pending > 0) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {venue._stats.reserved > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(184,92,92,0.10)", border: "1px solid rgba(184,92,92,0.25)", fontFamily: FONT, fontSize: 11, fontWeight: 600, color: "#C07070" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C07070" }}/>{venue._stats.reserved} seats reserved</span>}
              {venue._stats.pending  > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: C.tagBg, border: `1px solid ${C.goldBorder}`, fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.gold }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }}/>{venue._stats.pending} pending approval</span>}
            </div>
          )}
          <div>
            <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 10px" }}>About this space</p>
            <p style={{ fontFamily: FONT, fontSize: 14, color: C.textSub, lineHeight: 1.82, margin: 0 }}>{venue.description}</p>
          </div>
          {venue.rooms && venue.rooms.length > 0 && (
            <div>
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 12px" }}>Available Sub-rooms</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {venue.rooms.map(r => (
                  <span key={r} style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${C.goldBorder}`, fontFamily: FONT, fontSize: 12, fontWeight: 500, color: C.textMuted }}>{r}</span>
                ))}
              </div>
            </div>
          )}
          <div style={{ height: 1, background: C.divider }} />
          <button type="button" onClick={() => { onClose(); onReserve(reservationVenue.id); }}
            style={{ width: "100%", padding: "14px 20px", background: C.gold, color: "#FFFFFF", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: FONT, letterSpacing: "0.14em", textTransform: "uppercase", transition: "background 0.18s,transform 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.transform = "scale(1)"; }}>
            Reserve Venue
          </button>
        </div>
      </div>
    </div>
  );
}

// ── INLINE RESERVATION PANEL ─────────────────────────────────────────────────
function InlineReservationPanel({ venue, onClose, onNavigate, C, isDark }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", date: "", time: "", guests: "", notes: "",
    selectedSubRoom: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 80);
    }
  }, []);

  const subRooms = venue.rooms || [];
  const handleChange  = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const handleSubmit  = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div ref={panelRef} style={{ background: C.inlineResBg, border: `1px solid ${C.gold}`, borderTop: "none", padding: "32px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.goldFaint, border: `1px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>Request Received</p>
        <p style={{ fontFamily: FONT, fontSize: 13, color: C.textMuted, lineHeight: 1.75, margin: 0, maxWidth: 320 }}>
          Your reservation request for <strong style={{ color: C.text }}>{venue.name}</strong> has been submitted. Our events team will contact you within 24 hours.
        </p>
        <button type="button" onClick={onClose}
          style={{ marginTop: 8, padding: "10px 28px", background: "transparent", border: `1px solid ${C.goldBorder}`, color: C.gold, cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.background = C.goldFaint; e.currentTarget.style.borderColor = C.gold; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.goldBorder; }}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div ref={panelRef} style={{ background: C.inlineResBg, border: `1px solid ${C.inlineResBorder}`, borderTop: "none", overflow: "hidden" }}>
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: `1px solid ${C.divider}` }}>
        <div>
          <p style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: C.gold, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 4px" }}>Reservation Request</p>
          <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{venue.name}</p>
        </div>
        <button type="button" onClick={onClose}
          style={{ width: 32, height: 32, borderRadius: "50%", background: "transparent", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.18s", padding: 0, flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.goldFaint; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "transparent"; }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Sub-room selector */}
        {subRooms.length > 0 && (
          <div>
            <label style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Select Sub-room</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {subRooms.map(r => {
                const sel = form.selectedSubRoom === r;
                return (
                  <button key={r} type="button" onClick={() => handleChange("selectedSubRoom", sel ? "" : r)}
                    style={{ padding: "6px 14px", background: sel ? C.goldFaint : "transparent", border: `1px solid ${sel ? C.gold : C.goldBorder}`, fontFamily: FONT, fontSize: 12, fontWeight: sel ? 600 : 400, color: sel ? C.gold : C.textMuted, cursor: "pointer", transition: "all 0.16s", letterSpacing: "0.04em" }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = C.goldBorder; e.currentTarget.style.color = C.textMuted; } }}>
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Name + email */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["name","Full Name","text",true],["email","Email Address","email",true]].map(([field, placeholder, type, required]) => (
            <div key={field}>
              <label style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{placeholder}</label>
              <input type={type} placeholder={placeholder} required={required} value={form[field]}
                onChange={e => handleChange(field, e.target.value)}
                style={{ width: "100%", padding: "9px 12px", background: C.cardBg, border: `1px solid ${C.border}`, fontFamily: FONT, fontSize: 13, color: C.text, outline: "none", transition: "border-color 0.18s" }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e  => e.target.style.borderColor = C.border}
              />
            </div>
          ))}
        </div>

        {/* Phone + date */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["phone","Phone Number","tel",false],["date","Preferred Date","date",true]].map(([field, placeholder, type, required]) => (
            <div key={field}>
              <label style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{placeholder}</label>
              <input type={type} placeholder={placeholder} required={required} value={form[field]}
                onChange={e => handleChange(field, e.target.value)}
                style={{ width: "100%", padding: "9px 12px", background: C.cardBg, border: `1px solid ${C.border}`, fontFamily: FONT, fontSize: 13, color: C.text, outline: "none", transition: "border-color 0.18s", colorScheme: isDark ? "dark" : "light" }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e  => e.target.style.borderColor = C.border}
              />
            </div>
          ))}
        </div>

        {/* Time + guests */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["time","Preferred Time","time",false],["guests","Number of Guests","number",true]].map(([field, placeholder, type, required]) => (
            <div key={field}>
              <label style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{placeholder}</label>
              <input type={type} placeholder={placeholder} required={required} value={form[field]}
                onChange={e => handleChange(field, e.target.value)} min={type === "number" ? 1 : undefined}
                style={{ width: "100%", padding: "9px 12px", background: C.cardBg, border: `1px solid ${C.border}`, fontFamily: FONT, fontSize: 13, color: C.text, outline: "none", transition: "border-color 0.18s", colorScheme: isDark ? "dark" : "light" }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e  => e.target.style.borderColor = C.border}
              />
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Special Requirements (optional)</label>
          <textarea placeholder="Any special setup, dietary needs, or additional notes..." rows={3} value={form.notes}
            onChange={e => handleChange("notes", e.target.value)}
            style={{ width: "100%", padding: "9px 12px", background: C.cardBg, border: `1px solid ${C.border}`, fontFamily: FONT, fontSize: 13, color: C.text, outline: "none", transition: "border-color 0.18s", resize: "vertical", minHeight: 72 }}
            onFocus={e => e.target.style.borderColor = C.gold}
            onBlur={e  => e.target.style.borderColor = C.border}
          />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", paddingTop: 4 }}>
          <button type="submit" disabled={loading}
            style={{ flex: 1, padding: "11px 20px", background: loading ? C.goldDim : C.gold, color: "#FFFFFF", border: "none", cursor: loading ? "wait" : "pointer", fontWeight: 700, fontSize: 12, fontFamily: FONT, letterSpacing: "0.14em", textTransform: "uppercase", transition: "background 0.18s,transform 0.18s" }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "scale(1.01)"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = loading ? C.goldDim : C.gold; e.currentTarget.style.transform = "scale(1)"; }}>
            {loading ? "Submitting…" : "Submit Request"}
          </button>
          <button type="button" onClick={() => onNavigate(venue.id)}
            style={{ padding: "11px 18px", background: "transparent", border: `1px solid ${C.goldBorder}`, color: C.gold, cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", transition: "all 0.18s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldFaint; e.currentTarget.style.borderColor = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.goldBorder; }}>
            Full Page
          </button>
        </div>
      </form>
    </div>
  );
}

// ── VENUE CARD ────────────────────────────────────────────────────────────────
function VenueCard({ venue, onClick, onDetails, C, isDark, hideSpacer, showInlineReserve, onToggleInlineReserve, onNavigateToReserve }) {
  const [hov,      setHov]      = useState(false);
  const [dotsHov,  setDotsHov]  = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const hasSubRooms    = venue.rooms?.length > 0;
  const reserveEnabled = !hasSubRooms || selectedRoom !== null;
  const live    = aggregateCounts(venue);
  const dSeats  = live?.seats  ?? venue.seats;
  const dTables = live?.tables ?? venue.tables;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ background: C.cardBg, borderTop: `1px solid ${showInlineReserve ? C.gold : (hov ? C.borderHov : C.border)}`, borderLeft: `1px solid ${showInlineReserve ? C.gold : (hov ? C.borderHov : C.border)}`, borderRight: `1px solid ${showInlineReserve ? C.gold : (hov ? C.borderHov : C.border)}`, borderBottom: showInlineReserve ? "none" : `1px solid ${showInlineReserve ? C.gold : (hov ? C.borderHov : C.border)}`, boxShadow: hov ? C.shadowHov : C.shadow, transition: "box-shadow 0.32s,border-color 0.32s,transform 0.32s", transform: hov && !showInlineReserve ? "translateY(-5px)" : "translateY(0)", display: "flex", flexDirection: "column", overflow: "visible" }}>

        {/* Image */}
        <div onClick={() => onDetails(venue)} style={{ height: 220, position: "relative", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}>
          <img src={venue.img} alt={venue.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)", transform: hov ? "scale(1.06)" : "scale(1)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0)35%,rgba(0,0,0,0.72)100%)" }} />
          {/* Seats badge */}
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.58)", backdropFilter: "blur(6px)", border: "1px solid rgba(201,168,76,0.35)", padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: "#E8D898", letterSpacing: "0.06em" }}>{dSeats > 0 ? dSeats : venue.seats}</span>
          </div>
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
            <p style={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, color: "#FFFFFF", margin: 0, lineHeight: 1.25, letterSpacing: "-0.2px" }}>{venue.name}</p>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 14, flex: 1, background: C.cardBg }}>

          {/* Stats */}
          <div style={{ display: "flex", gap: 0, border: `1px solid ${C.divider}`, overflow: "hidden" }}>
            {[
              { label: "Seats",  value: dSeats  > 0 ? dSeats  : venue.seats  },
              { label: "Tables", value: dTables > 0 ? dTables : venue.tables },
              ...(hasSubRooms ? [{ label: "Rooms", value: venue.rooms.length }] : []),
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, padding: "8px 10px", borderLeft: i === 0 ? "none" : `1px solid ${C.divider}`, background: C.surfaceEl, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Sub-room area */}
          <div style={{ minHeight: hasSubRooms || !hideSpacer ? 52 : 0 }}>
            {hasSubRooms ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <RoomDropdown rooms={venue.rooms} onRoomClick={setSelectedRoom} C={C} />
                  {selectedRoom && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: C.goldFaint, border: `1px solid ${C.gold}`, fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: "0.04em" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
                      {selectedRoom}
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedRoom(null); }}
                        style={{ background: "none", border: "none", padding: 0, marginLeft: 2, cursor: "pointer", display: "flex", alignItems: "center", color: C.goldDim, lineHeight: 1 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
                {!selectedRoom && <p style={{ fontFamily: FONT, fontSize: 11, color: C.textMuted, margin: 0, fontStyle: "italic" }}>Select a sub-room above to continue.</p>}
              </div>
            ) : (
              !hideSpacer && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: C.goldFaint, border: `1px solid ${C.goldBorder}` }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT, fontSize: 11, color: C.textSub, fontWeight: 500 }}>Full hall — no sub-rooms</span>
                </div>
              )
            )}
          </div>

          <div style={{ height: 1, background: C.divider }} />

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onToggleInlineReserve ? (
              <button type="button" onClick={(e) => { e.stopPropagation(); onToggleInlineReserve(venue.id); }}
                style={{ flex: 1, padding: "10px 14px", background: showInlineReserve ? C.goldLight : C.gold, color: "#FFFFFF", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: FONT, letterSpacing: "0.10em", textTransform: "uppercase", transition: "background 0.18s,transform 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = showInlineReserve ? C.goldLight : C.gold; e.currentTarget.style.transform = "scale(1)"; }}>
                {showInlineReserve ? "Hide Details" : "Reserve"}
              </button>
            ) : (
              <button type="button" onClick={(e) => { e.stopPropagation(); if (reserveEnabled) onClick(venue.id, selectedRoom ? { subRoom: selectedRoom } : {}); }} disabled={!reserveEnabled}
                style={{ flex: 1, padding: "10px 14px", background: reserveEnabled ? C.gold : C.goldDim, color: "#FFFFFF", border: "none", cursor: reserveEnabled ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 12, fontFamily: FONT, letterSpacing: "0.10em", textTransform: "uppercase", transition: "background 0.18s,transform 0.18s", opacity: reserveEnabled ? 1 : 0.55 }}
                onMouseEnter={e => { if (reserveEnabled) { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.transform = "scale(1.02)"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = reserveEnabled ? C.gold : C.goldDim; e.currentTarget.style.transform = "scale(1)"; }}>
                View & Reserve
              </button>
            )}
            <button type="button" onClick={(e) => { e.stopPropagation(); onDetails(venue); }}
              onMouseEnter={() => setDotsHov(true)} onMouseLeave={() => setDotsHov(false)}
              style={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: dotsHov ? C.dotsBgHov : C.dotsBg, border: "none", cursor: "pointer", transition: "all 0.20s" }}>
              <svg width="18" height="4" viewBox="0 0 18 4" fill="none">
                <circle cx="2"    cy="2" r="2" fill={C.dotsColor}/>
                <circle cx="9"    cy="2" r="2" fill={C.dotsColor}/>
                <circle cx="16"   cy="2" r="2" fill={C.dotsColor}/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Inline reservation panel */}
      {showInlineReserve && (
        <InlineReservationPanel
          venue={venue}
          onClose={() => onToggleInlineReserve(venue.id)}
          onNavigate={onNavigateToReserve}
          C={C}
          isDark={isDark}
        />
      )}
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, index, C }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.22em", textTransform: "uppercase" }}>{String(index).padStart(2, "0")}</span>
        <div style={{ flex: 1, height: 1, background: C.divider }} />
      </div>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(22px,2.4vw,32px)", fontWeight: 700, color: C.text, margin: "0 0 6px", lineHeight: 1.1, letterSpacing: "-0.5px" }}>{title}</h2>
      <p style={{ fontFamily: FONT, color: C.textMuted, fontSize: 13, margin: 0, lineHeight: 1.7 }}>{subtitle}</p>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function VenuesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isDark, toggle } = useThemeMode();
  const C = getTokens(isDark);

  const [modalVenue,    setModalVenue]    = useState(null);
  const [subcategories, setSubcategories] = useState(STATIC_VENUES);

  // ✅ Proper scroll state — wired to window scroll event
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP reveal refs
  const headerRef = useGsapScroll({ y: 30, opacity: 0, duration: 0.85, selector: ".page-anim", stagger: 0.09 });
  const sec1Ref   = useGsapScroll({ y: 40, opacity: 0, duration: 0.85, selector: ".card-anim", stagger: 0.07 });
  const sec2Ref   = useGsapScroll({ y: 40, opacity: 0, duration: 0.85, selector: ".card-anim", stagger: 0.07 });
  const sec3Ref   = useGsapScroll({ y: 40, opacity: 0, duration: 0.85, selector: ".card-anim", stagger: 0.07 });

  useEffect(() => {
    const merge = () => {
      setSubcategories(prev => {
        const next = {};
        for (const [wing, venues] of Object.entries(prev)) {
          next[wing] = venues.map(v => {
            const live = aggregateCounts(v);
            if (!live) return v;
            return { ...v, seats: live.seats > 0 ? live.seats : v.seats, tables: live.tables > 0 ? live.tables : v.tables };
          });
        }
        return next;
      });
    };
    merge();
    window.addEventListener("storage", merge);
    return () => window.removeEventListener("storage", merge);
  }, []);

  useEffect(() => {
    fetchVenueStats().then(stats => {
      setSubcategories(prev => {
        const next = {};
        for (const [wing, venues] of Object.entries(prev)) {
          next[wing] = venues.map(v => {
            const combined = { reserved: 0, pending: 0, total: 0 };
            v.seatMapKeys.forEach(key => {
              if (stats[key]) { combined.reserved += stats[key].reserved; combined.pending += stats[key].pending; combined.total += stats[key].total; }
            });
            if (stats[v.name]) { combined.reserved += stats[v.name].reserved; combined.pending += stats[v.name].pending; combined.total += stats[v.name].total; }
            return { ...v, _stats: combined };
          });
        }
        return next;
      });
    });
  }, []);

  useEffect(() => {
    const params  = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section) {
      const idMap = { "main-wing": SECTION_IDS["Main Wing"], "tower-wing": SECTION_IDS["Tower Wing"], "dining": SECTION_IDS["Dining"] };
      const tid   = idMap[section];
      if (tid) {
        setTimeout(() => {
          const el = document.getElementById(tid);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.search]);

  const handleVenueClick = (id, options = {}) => {
    const subRoom = options?.subRoom ?? "";

    // ── Laguna subroom routing ────────────────────────────────────────────────
    // When the Laguna Ballroom card is clicked with a subroom selected,
    // map the subroom label to the correct dedicated page.
    if (id === "laguna") {
      if (subRoom === "Laguna 1") {
        navigate("/laguna-reserv1e", { state: { openRoomId: "laguna-ballroom-1" } });
        return;
      }
      if (subRoom === "Laguna 2") {
        navigate("/laguna-reserv2e", { state: { openRoomId: "laguna-ballroom-2" } });
        return;
      }
      // No subroom selected — fall through to default
    }

    // Tower Ballroom sub-room routing
    if (id === "tower-ballroom") {
      if (subRoom === "Tower 1") {
        navigate("/tower1", { state: { openRoomId: "tower1" } });
        return;
      }
      if (subRoom === "Tower 2") {
        navigate("/tower2", { state: { openRoomId: "tower2" } });
        return;
      }
      if (subRoom === "Tower 3") {
        navigate("/tower3", { state: { openRoomId: "tower3" } });
        return;
      }
      // No subroom selected — fall through to default
    }

    // Direct Tower venue object IDs (used from modal / section cards)
    if (id === "tower1") {
      navigate("/tower1", { state: { openRoomId: id } });
      return;
    }
    if (id === "tower2") {
      navigate("/tower2", { state: { openRoomId: id } });
      return;
    }
    if (id === "tower3") {
      navigate("/tower3", { state: { openRoomId: id } });
      return;
    }

    // 20/20 Function Room sub-room routing ──────────────────────────────────
    if (id === "20-20") {
      if (subRoom === "20/20 A") {
        navigate("/twenty-twenty-a", { state: { openRoomId: "20-20-function-room-a" } });
        return;
      }
      if (subRoom === "20/20 B") {
        navigate("/twenty-twenty-b", { state: { openRoomId: "20-20-function-room-b" } });
        return;
      }
      if (subRoom === "20/20 C") {
        navigate("/twenty-twenty-c", { state: { openRoomId: "20-20-function-room-c" } });
        return;
      }
      // No subroom selected — fall through to default
    }

    // Grand Ballroom sub-room routing
    if (id === "grand-ballroom") {
      if (subRoom === "Grand A") {
        navigate("/grand-ballroom-a", { state: { openRoomId: "grand-ballroom-a" } });
        return;
      }
      if (subRoom === "Grand B") {
        navigate("/grand-ballroom-b", { state: { openRoomId: "grand-ballroom-b" } });
        return;
      }
      if (subRoom === "Grand C") {
        navigate("/grand-ballroom-c", { state: { openRoomId: "grand-ballroom-c" } });
        return;
      }
      // No subroom selected — fall through to default
    }

    // Direct Grand Ballroom venue object IDs (used from modal / section cards)
    if (id === "grand-ballroom-a") {
      navigate("/grand-ballroom-a", { state: { openRoomId: id } });
      return;
    }
    if (id === "grand-ballroom-b") {
      navigate("/grand-ballroom-b", { state: { openRoomId: id } });
      return;
    }
    if (id === "grand-ballroom-c") {
      navigate("/grand-ballroom-c", { state: { openRoomId: id } });
      return;
    }

    // Direct 20/20 venue object IDs (used from modal / section cards)
    if (id === "20-20-function-room-a") {
      navigate("/twenty-twenty-a", { state: { openRoomId: id } });
      return;
    }
    if (id === "20-20-function-room-b") {
      navigate("/twenty-twenty-b", { state: { openRoomId: id } });
      return;
    }
    if (id === "20-20-function-room-c") {
      navigate("/twenty-twenty-c", { state: { openRoomId: id } });
      return;
    }

    // ── Direct Laguna venue object IDs (used from modal / section cards)
    if (id === "laguna-ballroom-1") {
      navigate("/laguna-reserv1e", { state: { openRoomId: id } });
      return;
    }
    if (id === "laguna-ballroom-2") {
      navigate("/laguna-reserv2e", { state: { openRoomId: id } });
      return;
    }

    // ── Everything else ───────────────────────────────────────────────────────
    const roomState = subRoom ? { selectedSubRoom: subRoom } : {};
    const routes = {
      "alabang":        "/alabang-reserve",
      "laguna":         "/alabang-reserve",
      "20-20":          "/alabang-reserve",
      "business-center":"/business-center-reserve",
      "tower-ballroom": "/tower-ballroom",
      "tower1":         "/tower1",
      "tower2":         "/tower2",
      "tower3":         "/tower3",
      "grand-ballroom": "/grand-ballroom",
      "grand-ballroom-a": "/grand-ballroom-a",
      "grand-ballroom-b": "/grand-ballroom-b",
      "grand-ballroom-c": "/grand-ballroom-c",
      "qsina":          "/qsina",
      "hanakazu":       "/hanakazu",
      "phoenix-court":  "/phoenix-court",
    };
    navigate(routes[id] ?? `/reserve/${id}`, { state: { openRoomId: id, ...roomState } });
  };

  const NAV_H = 58;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes bvFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bvSlideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        ::-webkit-scrollbar       { width: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3) }
      `}</style>

      <div style={{ background: C.pageBg, minHeight: "100vh", fontFamily: FONT }}>

      {/* ✅ scrolled is now a real live value from window.scrollY */}
      <SharedNavbar
        isDark={isDark}
        toggle={toggle}
        showNavigation={false}
        scrolled={scrolled}
        height={NAV_H}
      />

      {modalVenue && (
        <VenueModal venue={modalVenue} isDark={isDark} C={C} onClose={() => setModalVenue(null)} onReserve={handleVenueClick} />
      )}
      <div style={{ paddingTop: NAV_H, marginTop: -1, background: C.pageBg }}></div>

        {/* PAGE HEADER */}
        <div ref={headerRef} style={{ padding: isMobile ? "36px 20px 28px" : `52px clamp(32px,5vw,72px) 36px`, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Back + breadcrumb */}
          <div className="page-anim" style={{ display: "flex", alignItems: "center", gap: 16, opacity: 0 }}>
            <button onClick={() => navigate("/", { state: { scrollTo: "event" } })}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.goldFaint; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surfaceEl; }}
              style={{ width: 40, height: 40, borderRadius: "50%", background: C.surfaceEl, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.22s", flexShrink: 0, padding: 0 }}>
              <ChevLeft size={16} color={C.gold} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: FONT, fontSize: 12, color: C.textMuted, fontWeight: 400 }}>Home</span>
              <ChevRight size={12} color={C.textMuted} />
              <span style={{ fontFamily: FONT, fontSize: 12, color: C.gold, fontWeight: 500 }}>Venues</span>
            </div>
          </div>

          {/* Title block */}
          <div className="page-anim" style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "flex-end", justifyContent: "space-between", gap: 16, opacity: 0 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 24, height: 1, background: C.gold }} />
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.22em", textTransform: "uppercase" }}>All Venues</span>
              </div>
              <h1 style={{ margin: 0, fontFamily: FONT, fontSize: "clamp(26px,3.4vw,44px)", color: C.text, lineHeight: 1.08, fontWeight: 700, letterSpacing: "-0.8px" }}>
                Browse venues and<br />reserve your space.
              </h1>
            </div>
            <p style={{ margin: 0, fontFamily: FONT, color: C.textMuted, fontSize: 13, lineHeight: 1.75, maxWidth: 320, flexShrink: 0 }}>
              Explore our spaces below — click a card to view layouts and reserve. Tap the{" "}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, verticalAlign: "middle" }}>
                <svg width="14" height="3" viewBox="0 0 14 3" fill="none">
                  <circle cx="1.5"  cy="1.5" r="1.5" fill={C.gold}/>
                  <circle cx="7"    cy="1.5" r="1.5" fill={C.gold}/>
                  <circle cx="12.5" cy="1.5" r="1.5" fill={C.gold}/>
                </svg>
              </span>{" "}
              button to view venue details.
            </p>
          </div>

          <div className="page-anim" style={{ height: 1, background: `linear-gradient(90deg,${C.gold}0%,${C.divider}60%,transparent 100%)`, opacity: 0.55 }} />
        </div>

        {/* SECTIONS */}
        <div style={{ padding: isMobile ? "8px 20px 80px" : `8px clamp(32px,5vw,72px) 100px`, maxWidth: 1280, margin: "0 auto" }}>

          {/* MAIN WING */}
          <div ref={sec1Ref} id={SECTION_IDS["Main Wing"]} style={{ paddingTop: 52, marginBottom: 72, scrollMarginTop: 80 }}>
            <SectionHeader C={C} index={1} title="Main Wing" subtitle="Function rooms and ballrooms suitable for conferences and weddings." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 20, alignItems: "start" }}>
              {subcategories["Main Wing"].map(v => (
                <div key={v.id} className="card-anim" style={{ opacity: 0 }}>
                  <VenueCard venue={v} onClick={handleVenueClick} onDetails={setModalVenue} C={C} isDark={isDark} />
                </div>
              ))}
            </div>
          </div>

          {/* TOWER WING */}
          <div ref={sec2Ref} id={SECTION_IDS["Tower Wing"]} style={{ paddingTop: 52, marginBottom: 72, scrollMarginTop: 80 }}>
            <SectionHeader C={C} index={2} title="Tower Wing" subtitle="Larger ballrooms and divisible halls — perfect for galas and large events." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 20, alignItems: "start" }}>
              {subcategories["Tower Wing"].map(v => (
                <div key={v.id} className="card-anim" style={{ opacity: 0 }}>
                  <VenueCard venue={v} onClick={handleVenueClick} onDetails={setModalVenue} C={C} isDark={isDark} />
                </div>
              ))}
            </div>
          </div>

          {/* DINING */}
          <div ref={sec3Ref} id={SECTION_IDS["Dining"]} style={{ paddingTop: 52, marginBottom: 32, scrollMarginTop: 80 }}>
            <SectionHeader C={C} index={3} title="Dining" subtitle="Restaurants and dining spaces — select a venue to reserve a table." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 20, alignItems: "start" }}>
              {subcategories["Dining"].map(v => (
                <div key={v.id} className="card-anim" style={{ opacity: 0 }}>
                  <VenueCard venue={v} onClick={handleVenueClick} onDetails={setModalVenue} C={C} isDark={isDark} hideSpacer />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
  );
}