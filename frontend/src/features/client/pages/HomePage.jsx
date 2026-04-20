// src/features/client/pages/HomePage.jsx
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import heroBanner      from "../../../assets/banner-grandroom.jpg";
import mainWingImg     from "../../../assets/main-wing.jpeg";
import towerWingImg    from "../../../assets/tower-wing.jpeg";
import SharedNavbar    from "../../../components/SharedNavbar.jsx";
import qsinaImg        from "../../../assets/qsina.jpeg";
import qsinaImg2       from "../../../assets/qsina2.jpeg";
import qsinaImg3       from "../../../assets/qsina3.jpeg";
import hanakazuImg     from "../../../assets/hanakazu.jpeg";
import hanakazuImg2    from "../../../assets/hanakazu2.jpeg";
import hanakazuImg3    from "../../../assets/hanakazu3.jpeg";
import phoenixCourtImg from "../../../assets/phoenix-court.jpeg";
import bellevueLogo    from "../../../assets/bellevue-logo.png";

// ── THEME CONTEXT ──────────────────────────────────────────────────────────────
const ThemeContext = createContext({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeContext);

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
function getTokens(isDark) {
  return isDark ? {
    gold:        "#C9A84C",
    goldLight:   "#E2C96A",
    goldFaint:   "rgba(201,168,76,0.10)",
    pageBg:      "#0E0D09",
    cream:       "#F0E8D0",
    dark:        "#18140E",
    darkMid:     "#1E1B13",
    textPrimary: "#F0E8D0",
    textMuted:   "#7A6E58",
    textFaint:   "#4A4438",
    textDeep:    "#3A3428",
    border:      "rgba(201,168,76,0.18)",
    borderLight: "rgba(201,168,76,0.10)",
    nlBg:        "#1E1B13",
    footerBg:    "#0E0D09",
    diningBg:    "#111009",
    footerLink:  "#4A4438",
    heroSub:     "rgba(240,232,208,0.50)",
    heroBg:      "#18140E",
  } : {
    gold:        "#9A6E1C",
    goldLight:   "#C49A2C",
    goldFaint:   "rgba(154,110,28,0.08)",
    pageBg:      "#EDE5D0",
    cream:       "#1A1510",
    dark:        "#1A1510",
    darkMid:     "#E4DAC4",
    textPrimary: "#1A1510",
    textMuted:   "#6A5830",
    textFaint:   "#8A7A60",
    textDeep:    "#9A8A70",
    border:      "rgba(154,110,28,0.18)",
    borderLight: "rgba(154,110,28,0.12)",
    nlBg:        "#E4DAC4",
    footerBg:    "#EDE5D0",
    diningBg:    "#E8DEC8",
    footerLink:  "#6A5830",
    heroSub:     "rgba(26,21,16,0.52)",
    heroBg:      "#EDE5D0",
  };
}

const DISPLAY = `'Playfair Display', 'Times New Roman', serif`;
const BODY    = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const MONO    = `'JetBrains Mono', monospace`;
const NAV_H   = 64;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes loader-exit {
    0%   { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-100%); }
  }
  @keyframes counter-in     { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes bar-grow       { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes partners-scroll{ from { transform:translateX(0); } to { transform:translateX(-50%); } }

  @keyframes logo-breathe {
    0%, 100% { transform: scale(1);    opacity: 0.9; }
    50%       { transform: scale(1.08); opacity: 1;   }
  }
  @keyframes logo-zoom-in {
    from { transform: scale(0.55); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
  @keyframes dot-bounce {
    0%, 80%, 100% { transform: scale(0.85) translateY(0);   opacity: 0.55; }
    40%            { transform: scale(1.18) translateY(-6px); opacity: 1;   }
  }
  @keyframes shimmer-line {
    0%   { transform: translateX(-100%); opacity: 0; }
    20%  { opacity: 1; }
    100% { transform: translateX(300%);  opacity: 0; }
  }
  @keyframes progress-fill {
    from { width: 0%; }
    to   { width: 100%; }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dining-reserve-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 32px;
    background: #C9A84C;
    border: 2px solid #C9A84C;
    color: #18140E;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    transition: background 0.32s cubic-bezier(0.4,0,0.2,1),
                color 0.32s cubic-bezier(0.4,0,0.2,1),
                border-color 0.32s cubic-bezier(0.4,0,0.2,1),
                box-shadow 0.32s cubic-bezier(0.4,0,0.2,1),
                transform 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  .dining-reserve-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: translateX(-100%);
    transition: transform 0s;
  }
  .dining-reserve-btn:hover {
    background: transparent;
    border-color: #C9A84C;
    color: #C9A84C;
    box-shadow: 0 0 0 3px rgba(201,168,76,0.15);
    transform: translateY(-2px);
  }
  .dining-reserve-btn:hover::before {
    transform: translateX(300%);
    transition: transform 0.6s ease;
  }
  .dining-reserve-btn-light {
    background: #9A6E1C;
    border-color: #9A6E1C;
    color: #F4EFE4;
  }
  .dining-reserve-btn-light:hover {
    background: transparent;
    border-color: #9A6E1C;
    color: #9A6E1C;
  }

  @media (max-width:767px) { * { -webkit-tap-highlight-color: transparent; } body { overflow-x:hidden; } }
`;

// ── DATA ───────────────────────────────────────────────────────────────────────
const RESTAURANTS = [
  { id:"qsina", name:"Qsina", tag:"All-Day Dining",
    description:"Qsina offers diverse culinary delights with both international buffets and à la carte options. From lavish breakfast spreads to intimate candlelit dinner experiences.",
    imgs:[qsinaImg,qsinaImg2,qsinaImg3],
    diningTimes:[{label:"Breakfast Buffet",hours:"6:00 – 10:00 AM"},{label:"Lunch",hours:"MON · TUE · SAT · SUN"},{label:"Light Lunch",hours:"WED · FRI"},{label:"Dinner",hours:"MON · THURS"},{label:"Dinner Buffet",hours:null}],
  },
  { id:"hanakazu", name:"Hanakazu", tag:"Japanese Specialty",
    description:"Hanakazu brings authentic Japanese cuisine to The Bellevue Manila. Savor fresh sushi, sashimi, and teppanyaki in an elegant zen-inspired setting.",
    imgs:[hanakazuImg,hanakazuImg2,hanakazuImg3],
    diningTimes:[{label:"Lunch",hours:"11:30 AM – 2:30 PM"},{label:"Dinner",hours:"6:00 PM – 10:00 PM"},{label:"Omakase",hours:"By reservation"}],
  },
  { id:"phoenix-court", name:"Phoenix Court", tag:"Cantonese Fine Dining",
    description:"Phoenix Court presents refined Cantonese cuisine — masterful dim sum, Peking duck, and classic dishes elevated to perfection in a sophisticated atmosphere.",
    imgs:[phoenixCourtImg,qsinaImg2,qsinaImg3],
    diningTimes:[{label:"Dim Sum",hours:"5:00 AM – 11:29 PM"},{label:"Lunch",hours:"11:30 AM – 2:30 PM"},{label:"Dinner",hours:"6:00 PM – 10:00 PM"}],
  },
];

const PARTNERS = ["Johnny's Steak & Grill at Cellar XXII","Pastry Corner","Vue Bar","Azurea Spa","Jing Monis Salon","Pretty Looks"];

// ── HOOKS ──────────────────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" ? window.innerWidth < bp : false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${bp-1}px)`);
    const h = (e) => setM(e.matches);
    mq.addEventListener("change", h); setM(mq.matches);
    return () => mq.removeEventListener("change", h);
  }, [bp]);
  return m;
}

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

function useGsapScroll(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const run = async () => {
      await loadGsap();
      if (!ref.current) return;
      const { y=48, opacity=0, duration=0.9, ease="power3.out", delay=0, stagger=0, selector=null } = options;
      const targets = selector ? ref.current.querySelectorAll(selector) : [ref.current];
      window.gsap.fromTo(targets,
        { y, opacity },
        { y:0, opacity:1, duration, ease, delay, stagger,
          scrollTrigger:{ trigger:ref.current, start:"top 88%", once:true } }
      );
    };
    run().catch(console.error);
  }, []);
  return ref;
}

// ── NAV DOT ────────────────────────────────────────────────────────────────────
function NavDot({ disabled, icon, C, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      onMouseEnter={() => { if (!disabled) setHov(true); }}
      onMouseLeave={() => setHov(false)}
      style={{ width:38, height:38, borderRadius:"50%", border:`1.5px solid ${disabled?"rgba(201,168,76,0.20)":C.gold}`, background:hov&&!disabled?C.gold:"transparent", cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.28:1, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)", flexShrink:0, outline:"none" }}>
      {icon === "left"
        ? <ChevLeft  size={16} color={hov&&!disabled?"#18140E":C.gold} strokeWidth={2.5} />
        : <ChevRight size={16} color={hov&&!disabled?"#18140E":C.gold} strokeWidth={2.5} />
      }
    </button>
  );
}

// ─────────────────────────────────────────────
// THEME TOGGLE — "DARK ◐ LIGHT" pill matching screenshot
// ─────────────────────────────────────────────
function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  const C = getTokens(isDark);
  return (
    <button type="button" onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px 6px 6px",
        background: "transparent",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"}`,
        borderRadius: 20,
        cursor: "pointer", flexShrink: 0,
        transition: "all 0.22s",
      }}>
      {/* Track */}
      <span style={{
        position: "relative", width: 34, height: 18, borderRadius: 10,
        background: isDark ? "rgba(201,168,76,0.25)" : "rgba(0,0,0,0.10)",
        display: "inline-flex", alignItems: "center", flexShrink: 0,
        transition: "background 0.28s",
      }}>
        <span style={{
          position: "absolute",
          left: isDark ? 2 : "calc(100% - 16px)",
          width: 14, height: 14, borderRadius: "50%",
          background: isDark ? C.gold : "#8C6E2A",
          transition: "left 0.24s cubic-bezier(.4,0,.2,1)",
        }} />
      </span>
          </button>
  );
}

// ── DINING ─────────────────────────────────────────────────────────────────────
function DiningSection({ initialRestaurantId, onNavigateToDining }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const isMobile = useIsMobile();
  const ref = useGsapScroll({ y:40, opacity:0, duration:0.9, selector:".da", stagger:0.10 });
  const [activeR,   setActiveR]   = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [hovLabel,  setHovLabel]  = useState(null);

  const r    = RESTAURANTS[activeR];
  const imgs = r?.imgs ?? [];

  useEffect(() => {
    if (!initialRestaurantId) return;
    const idx = RESTAURANTS.findIndex(x => x.id === initialRestaurantId);
    if (idx >= 0) setActiveR(idx);
  }, [initialRestaurantId]);

  useEffect(() => { setActiveImg(0); }, [activeR]);
  useEffect(() => {
    const id = setInterval(() => setActiveImg(n => (n + 1) % imgs.length), 4000);
    return () => clearInterval(id);
  }, [imgs.length]);

  const diningBgStyle = isDark ? {
    background: C.diningBg,
    backgroundImage: `radial-gradient(ellipse 60% 40% at 30% 60%, rgba(201,168,76,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 75% 30%, rgba(201,168,76,0.04) 0%, transparent 70%)`,
  } : {
    background: C.diningBg,
    backgroundImage: `radial-gradient(ellipse 60% 40% at 20% 70%, rgba(154,110,28,0.08) 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 80% 25%, rgba(154,110,28,0.06) 0%, transparent 65%)`,
  };

  const imgBlock = (h) => (
    <div style={{ height:h, position:"relative", overflow:"hidden", borderRadius:2 }}>
      {imgs.map((src, i) => (
        <img key={i} src={src} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:activeImg===i?1:0, transition:"opacity 0.6s ease" }} />
      ))}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(14,13,9,0.75)0%,transparent 50%)" }} />
      <div style={{ position:"absolute", top:16, left:16, background:isDark?"rgba(0,0,0,0.56)":"rgba(255,255,255,0.90)", backdropFilter:"blur(12px)", padding:"6px 14px 6px 10px", display:"flex", alignItems:"center", gap:8, borderRadius:2 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:C.gold }} />
        <span style={{ fontFamily:BODY, fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:C.gold }}>{r?.tag}</span>
      </div>
      <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6 }}>
        {imgs.map((_, i) => (
          <button key={i} type="button" onClick={() => setActiveImg(i)}
            style={{ width:i===activeImg?18:6, height:6, borderRadius:3, border:"none", padding:0, cursor:"pointer", background:i===activeImg?C.gold:"rgba(255,255,255,0.35)", transition:"all 0.3s ease" }} />
        ))}
      </div>
    </div>
  );

  const chips = () => (
    <div style={{ display:"flex", flexWrap:"wrap", gap:isMobile?6:8, marginBottom:isMobile?18:28 }}>
      {(r?.diningTimes ?? []).map(d => {
        const hov = hovLabel === d.label;
        return (
          <div key={d.label} onMouseEnter={() => setHovLabel(d.label)} onMouseLeave={() => setHovLabel(null)}
            style={{ padding:isMobile?"5px 10px":"7px 14px", background:hov?C.goldFaint:"transparent", border:`1px solid ${hov?C.gold:C.border}`, display:"flex", flexDirection:"column", transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)", userSelect:"none", cursor:"default", borderRadius:2 }}>
            <div style={{ fontFamily:BODY, fontSize:isMobile?11:12, fontWeight:700, letterSpacing:"0.06em", color:C.gold }}>{d.label}</div>
            {d.hours && <div style={{ fontFamily:BODY, fontSize:isMobile?10:11, color:C.textMuted, marginTop:2 }}>{d.hours}</div>}
          </div>
        );
      })}
    </div>
  );

  const thumbs = () => (
    <div style={{ display:"flex", gap:isMobile?6:8 }}>
      {imgs.map((src, i) => (
        <div key={i} onClick={() => setActiveImg(i)}
          style={{ flex:1, height:isMobile?50:60, overflow:"hidden", cursor:"pointer", border:activeImg===i?`2px solid ${C.gold}`:"2px solid transparent", transition:"border 0.22s", borderRadius:2 }}>
          <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s" }}
            onMouseEnter={e => e.currentTarget.style.transform="scale(1.08)"}
            onMouseLeave={e => e.currentTarget.style.transform="scale(1)"} />
        </div>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <section ref={ref} style={{ ...diningBgStyle, padding:"36px 16px 48px", overflow:"hidden", transition:"background 0.35s" }}>
        <div style={{ maxWidth:520, margin:"0 auto" }}>
          <div className="da" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16, marginTop:20, opacity:0 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <div style={{ width:24, height:1, background:C.gold }} />
                <span style={{ fontFamily:BODY, fontSize:9, fontWeight:700, letterSpacing:"0.36em", textTransform:"uppercase", color:C.gold }}>Fine Dining</span>
              </div>
              <h2 style={{ fontFamily:DISPLAY, fontSize:28, fontWeight:600, color:C.textPrimary, lineHeight:1, letterSpacing:"-0.01em", margin:0 }}>{r?.name}</h2>
            </div>
            <div style={{ display:"flex", gap:6, paddingTop:4 }}>
              <NavDot disabled={activeR===0}                    icon="left"  C={C} onClick={() => setActiveR(n => Math.max(0,n-1))} />
              <NavDot disabled={activeR===RESTAURANTS.length-1} icon="right" C={C} onClick={() => setActiveR(n => Math.min(RESTAURANTS.length-1,n+1))} />
            </div>
          </div>
          <div className="da" style={{ marginBottom:12, opacity:0 }}>{imgBlock(220)}</div>
          <div className="da" style={{ marginBottom:14, opacity:0 }}>{thumbs()}</div>
          <div className="da" style={{ opacity:0 }}>
            <p style={{ fontFamily:BODY, fontSize:13, color:C.textMuted, lineHeight:1.78, marginBottom:16 }}>{r?.description}</p>
            {chips()}
            <button type="button" onClick={onNavigateToDining}
              className={`dining-reserve-btn${isDark?"":" dining-reserve-btn-light"}`}
              style={{ width:"100%", justifyContent:"center", marginTop:8 }}>
              Reserve a Dining Venue
              <ChevRight size={14} color="currentColor" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} style={{ ...diningBgStyle, padding:"clamp(80px,10vw,120px) clamp(20px,5vw,56px)", overflow:"hidden", transition:"background 0.35s" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div className="da" style={{ display:"flex", alignItems:"center", gap:14, marginBottom:60, opacity:0 }}>
          <div style={{ width:32, height:1, background:C.gold }} />
          <span style={{ fontFamily:BODY, fontSize:9, fontWeight:700, letterSpacing:"0.44em", textTransform:"uppercase", color:C.gold }}>Fine Dining</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"clamp(52px,6vw,88px)", alignItems:"start" }}>
          <div className="da" style={{ opacity:0 }}>
            {imgBlock(440)}
            <div style={{ marginTop:10 }}>{thumbs()}</div>
          </div>
          <div className="da" style={{ paddingTop:8, opacity:0 }}>
            <div style={{ display:"flex", gap:8, marginBottom:24 }}>
              <NavDot disabled={activeR===0}                    icon="left"  C={C} onClick={() => setActiveR(n => Math.max(0,n-1))} />
              <NavDot disabled={activeR===RESTAURANTS.length-1} icon="right" C={C} onClick={() => setActiveR(n => Math.min(RESTAURANTS.length-1,n+1))} />
              <span style={{ fontFamily:MONO, fontSize:11, color:C.textFaint, alignSelf:"center", marginLeft:4 }}>
                {String(activeR+1).padStart(2,"0")} / {String(RESTAURANTS.length).padStart(2,"0")}
              </span>
            </div>
            <h2 style={{ fontFamily:DISPLAY, fontSize:"clamp(32px,4vw,56px)", fontWeight:600, color:C.textPrimary, marginBottom:14, lineHeight:0.95, letterSpacing:"-0.01em" }}>{r?.name}</h2>
            <p style={{ fontFamily:BODY, fontSize:14, color:C.textMuted, lineHeight:1.88, marginBottom:28, maxWidth:380 }}>{r?.description}</p>
            {chips()}
            <button type="button" onClick={onNavigateToDining}
              className={`dining-reserve-btn${isDark?"":" dining-reserve-btn-light"}`}>
              Reserve a Dining Venue
              <ChevRight size={14} color="currentColor" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── MARQUEE ────────────────────────────────────────────────────────────────────
function Marquee() {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const bg = isDark ? "#0E0D09" : "#18140E";
  return (
    // ✅ borderTop removed — was causing the visible line on scroll
    <div style={{ background:bg, padding:"28px 0", overflow:"hidden" }}>
      <div style={{ maxWidth:1100, margin:"0 auto clamp(10px,1.5vw,16px)", padding:"0 24px", display:"flex", alignItems:"center", gap:1 }}>
        <div style={{ flex:1, height:1, background:"rgba(201,168,76,0.15)" }} />
        <span style={{ fontFamily:BODY, fontSize:9, fontWeight:700, letterSpacing:"0.32em", textTransform:"uppercase", color:C.gold, flexShrink:0, whiteSpace:"nowrap", padding:"0 16px" }}>Official Partners &amp; Sponsors</span>
        <div style={{ flex:1, height:1, background:"rgba(201,168,76,0.15)" }} />
      </div>
<<<<<<< HEAD
      <div style={{ position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:80, background:`linear-gradient(to right,${bg},transparent)`, zIndex:2, pointerEvents:"none" }} />
        <div style={{ position:"absolute", right:0, top:0, bottom:0, width:80, background:`linear-gradient(to left,${bg},transparent)`, zIndex:2, pointerEvents:"none" }} />
        <div style={{ display:"flex", animation:"partners-scroll 28s linear infinite", whiteSpace:"nowrap" }}
          onMouseEnter={e => e.currentTarget.style.animationPlayState="paused"}
          onMouseLeave={e => e.currentTarget.style.animationPlayState="running"}>
          {[...PARTNERS,...PARTNERS].map((name, i) => (
            <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:10, marginRight:"clamp(40px,6vw,72px)", fontFamily:BODY, fontSize:11, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(240,232,208,0.22)" }}>
              <span style={{ width:4, height:4, borderRadius:"50%", background:C.gold, display:"inline-block", flexShrink:0 }} />
              {name}
            </span>
          ))}
        </div>
      </div>
=======
      <button type="button" onClick={() => onChange(clamp(value+1))} disabled={value>=max} style={{ width: 28, height: 28, borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: value>=max ? C.textMuted : C.gold, fontSize: 17, cursor: value>=max ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: value>=max ? 0.5 : 1 }}>+</button>
>>>>>>> 4b504ec8bad2d0cca724238cddf5a22acb79a73a
    </div>
  );
}

<<<<<<< HEAD
// ── NEWSLETTER ─────────────────────────────────────────────────────────────────
=======
// ─────────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────────
>>>>>>> 4b504ec8bad2d0cca724238cddf5a22acb79a73a
function NewsletterSection() {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const isMobile = useIsMobile();
  const ref = useGsapScroll({ y:30, opacity:0, duration:0.9, delay:0.05 });
  return (
    // ✅ borderTop removed — was causing the visible line on scroll
    <section ref={ref} style={{ position:"relative", overflow:"hidden", background:C.nlBg, transition:"background 0.35s" }}>
      <div style={{ position:"absolute", inset:0, opacity:isDark?0.03:0.04, backgroundImage:`linear-gradient(${C.gold} 1px,transparent 1px),linear-gradient(90deg,${C.gold} 1px,transparent 1px)`, backgroundSize:"60px 60px", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }} />
      <div style={{ position:"relative", maxWidth:1100, margin:"0 auto", padding:"clamp(36px,6vw,72px) clamp(20px,5vw,60px)", display:"flex", alignItems:isMobile?"flex-start":"center", justifyContent:"space-between", flexDirection:isMobile?"column":"row", gap:isMobile?24:36, flexWrap:"wrap" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <div style={{ width:24, height:1, background:C.gold }} />
            <span style={{ fontFamily:BODY, fontSize:12, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:C.gold }}>Stay Connected</span>
          </div>
          <h3 style={{ fontFamily:DISPLAY, fontSize:"clamp(22px,3.5vw,42px)", fontWeight:600, color:C.textPrimary, lineHeight:1.1, margin:0 }}>
            Let's plan your<br /><em style={{ color:C.gold }}>event together.</em>
          </h3>
          <p style={{ fontFamily:BODY, fontSize:13, color:C.textMuted, lineHeight:1.85, maxWidth:400, marginTop:12 }}>Our events team is available to help you find the perfect space and ensure a flawless occasion.</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14, alignItems:isMobile?"flex-start":"flex-end", flexShrink:0 }}>
          <a href="mailto:reservations@thebellevue.com"
            style={{ fontFamily:DISPLAY, fontSize:"clamp(14px,1.6vw,19px)", fontStyle:"italic", color:C.gold, textDecoration:"none", borderBottom:`1px solid ${C.border}`, paddingBottom:3, letterSpacing:"0.02em", transition:"color 0.2s,border-color 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.goldLight;e.currentTarget.style.borderBottomColor=C.gold;}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.gold;e.currentTarget.style.borderBottomColor=C.border;}}>
            reservations@thebellevue.com
          </a>
          <div style={{ display:"flex", gap:8 }}>
            {[["f","Facebook","https://www.facebook.com/thebellevuemanila/"],["t","X","https://x.com/bellevuemanila"],["i","Instagram","https://www.instagram.com/bellevuemanila/"],["y","YouTube","https://www.youtube.com/channel/UC01W6kRH_R-T0ok6RDT3aGg"]].map(([icon,label,href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" title={label}
                style={{ width:36, height:36, borderRadius:"50%", border:`1px solid ${C.border}`, color:C.textMuted, fontFamily:BODY, fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.color=C.gold;e.currentTarget.style.transform="translateY(-3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMuted;e.currentTarget.style.transform="translateY(0)";}}>
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ─────────────────────────────────────────────────────────────────────
function FooterLink({ children, onClick }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontFamily:BODY, fontSize:13, color:hov?C.gold:C.footerLink, marginBottom:9, cursor:"pointer", transition:"color 0.2s" }}>
      {children}
    </div>
  );
}

function Footer({ onNavigate, onManageBooking }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const ref = useGsapScroll({ y:24, opacity:0, duration:0.85, selector:".fc", stagger:0.08 });
  return (
    <footer ref={ref} style={{ background:C.footerBg, borderTop:`1px solid ${C.borderLight}`, transition:"background 0.35s" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"clamp(44px,6vw,72px) clamp(20px,5vw,60px) clamp(28px,4vw,44px)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:"clamp(24px,4vw,40px)", marginBottom:44 }}>
          <div className="fc">
            <div style={{ marginBottom:16 }}>
              <img src={bellevueLogo} alt="The Bellevue Manila" style={{ height:36, width:"auto", display:"block", filter:isDark?"none":"brightness(0) saturate(100%) invert(30%) sepia(50%) saturate(400%) hue-rotate(5deg)", transition:"filter 0.35s" }} />
            </div>
            <p style={{ fontFamily:BODY, fontSize:13, color:C.textFaint, lineHeight:1.85, margin:"0 0 14px" }}>Luxury event spaces and seamless reservations in the heart of Alabang.</p>
          </div>
          <div className="fc">
            <div style={{ fontFamily:BODY, fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.gold, marginBottom:13 }}>Venues</div>
            <FooterLink onClick={() => onNavigate("main-wing")}>Main Wing</FooterLink>
            <FooterLink onClick={() => onNavigate("tower-wing")}>Tower Wing</FooterLink>
            <FooterLink onClick={() => onNavigate("dining")}>Dining</FooterLink>
          </div>
          <div className="fc">
            <div style={{ fontFamily:BODY, fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.gold, marginBottom:13 }}>Reservations</div>
            <FooterLink onClick={() => onNavigate("main-wing")}>Book a Seat</FooterLink>
            <FooterLink onClick={() => onNavigate("dining")}>Book a Table</FooterLink>
            <FooterLink onClick={onManageBooking}>Manage Booking</FooterLink>
          </div>
          <div className="fc">
            <div style={{ fontFamily:BODY, fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.gold, marginBottom:13 }}>Contact</div>
            <p style={{ fontFamily:BODY, fontSize:13, color:C.textFaint, lineHeight:2, margin:0 }}>
              02 871 8181 5139<br />
              North Bridgeway, Filinvest City<br />
              Alabang, Muntinlupa City
            </p>
          </div>
        </div>
        <div style={{ height:1, background:C.borderLight, margin:"0 0 24px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontFamily:BODY, fontSize:12, color:C.textDeep }}>© {new Date().getFullYear()} The Bellevue Manila. All rights reserved.</span>
          <span style={{ fontFamily:BODY, fontSize:12, color:C.textDeep }}>Seat &amp; Table Management System</span>
        </div>
      </div>
    </footer>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loaded, setLoaded]   = useState(false);
  const [diningRestaurantId]  = useState(null);

  // ✅ Scroll state wired up — used by SharedNavbar
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("bellevue-theme");
      if (saved !== null) return saved === "dark";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  const toggleTheme = () => setIsDark(prev => {
    const next = !prev;
    try { localStorage.setItem("bellevue-theme", next?"dark":"light"); } catch {}
    return next;
  });

  const C = getTokens(isDark);

  const goToVenues        = (section) => section ? navigate(`/venues?section=${section}`) : navigate("/venues");
  const goToDining        = () => navigate("/venues?section=dining");
  const goToManageBooking = () => navigate("/manage-booking");

  useEffect(() => {
    const state = location.state;
    if (!state) return;
    if (state.scrollTo === "dining") {
      requestAnimationFrame(() => {
        const el = document.getElementById("home-dining");
        if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
      });
    }
    if (state.scrollTo === "event") {
      window.scrollTo({ top:0, behavior:"smooth" });
    }
    navigate(".", { replace:true, state:null });
  }, [location.state, navigate]);

  useEffect(() => {
    const markerY = NAV_H + 8;
    const inView = (id) => {
      const el = document.getElementById(id); if (!el) return false;
      const r = el.getBoundingClientRect(); return r.top <= markerY && r.bottom > markerY;
    };
    const onScroll = () => window.dispatchEvent(new CustomEvent("homeActiveSection", { detail: inView("home-dining") ? "dining" : null }));
    window.addEventListener("scroll", onScroll, { passive:true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggle:toggleTheme }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div style={{ background:C.pageBg, minHeight:"100vh", transition:"background 0.35s" }}>
        {!loaded && <Loader onDone={() => setLoaded(true)} />}
        <div style={{ opacity:loaded?1:0, transition:"opacity 0.7s" }}>
          {/* ✅ scrolled is now live — but SharedNavbar ignores border when showNavigation=false anyway */}
          <SharedNavbar isDark={isDark} toggle={toggleTheme} showNavigation={true} scrolled={scrolled} height={NAV_H} />
          <HeroSection loaded={loaded} onNavigateToVenues={goToVenues} onManageBooking={goToManageBooking} />
          <div id="home-dining">
            <DiningSection initialRestaurantId={diningRestaurantId} onNavigateToDining={goToDining} />
          </div>
          <Marquee />
          <NewsletterSection />
          <Footer onNavigate={goToVenues} onManageBooking={goToManageBooking} />
        </div>
<<<<<<< HEAD
=======
        <NewsletterSection />
        <Footer onNavigate={goToVenues} onManageBooking={goToManageBooking} />
>>>>>>> 4b504ec8bad2d0cca724238cddf5a22acb79a73a
      </div>
    </ThemeContext.Provider>
  );
}