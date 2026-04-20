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

// ── SVG ICONS ──────────────────────────────────────────────────────────────────
const ChevLeft = ({ size = 16, color = "currentColor", strokeWidth = 2.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display:"block", flexShrink:0 }}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevRight = ({ size = 16, color = "currentColor", strokeWidth = 2.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display:"block", flexShrink:0 }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ── LOADER ─────────────────────────────────────────────────────────────────────
function Loader({ onDone }) {
  const [phase, setPhase]       = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 120);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1300);
    const t4 = setTimeout(() => {
      let val = 0;
      intervalRef.current = setInterval(() => {
        val += Math.random() * 12 + 4;
        if (val >= 100) { val = 100; clearInterval(intervalRef.current); }
        setProgress(Math.min(Math.round(val), 100));
      }, 80);
    }, 1400);
    const t5 = setTimeout(() => setPhase(4), 2800);
    const t6 = setTimeout(() => onDone(), 3500);
    return () => {
      [t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onDone]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"#0E0D09", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:0, animation:phase===4?"loader-exit 0.65s cubic-bezier(0.76,0,0.24,1) forwards":"none", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />

      <div style={{ marginBottom:40, opacity:phase>=1?1:0, animation:phase>=1?"logo-zoom-in 0.65s cubic-bezier(0.22,1,0.36,1) forwards, logo-breathe 3s 0.7s ease-in-out infinite":"none", transformOrigin:"center" }}>
        <div style={{ display:"grid", gridTemplateColumns:"20px 20px", gap:14 }}>
          {[0,1,2,3].map(i => (
            <span key={i} style={{ width:20, height:20, borderRadius:"50%", background:i%2===0?"linear-gradient(135deg,#E2C96A,#C9A84C)":"linear-gradient(135deg,#C9A84C,#9A7830)", display:"block", boxShadow:"0 2px 12px rgba(201,168,76,0.30)", animation:phase>=1?`dot-bounce 1.6s ${0.12*i}s ease-in-out infinite`:"none" }} />
          ))}
        </div>
      </div>

      <div style={{ fontFamily:BODY, fontSize:10, fontWeight:700, letterSpacing:"0.42em", textTransform:"uppercase", color:"rgba(201,168,76,0.55)", marginBottom:16, opacity:phase>=1?1:0, animationName:phase>=1?"fade-up":"none", animationDuration:phase>=1?"0.5s":"0s", animationDelay:phase>=1?"0.3s":"0s", animationTimingFunction:phase>=1?"ease":"linear", animationFillMode:"both" }}>
        The Bellevue Manila
      </div>

      <div style={{ textAlign:"center", marginBottom:56, opacity:phase>=2?1:0, animationName:phase>=2?"fade-up":"none", animationDuration:phase>=2?"0.55s":"0s", animationTimingFunction:phase>=2?"ease":"linear", animationFillMode:"both" }}>
        <div style={{ fontFamily:DISPLAY, fontSize:"clamp(20px,3vw,30px)", fontWeight:600, color:"#F0E8D0", lineHeight:1.3, letterSpacing:"-0.01em" }}>Reservations &amp; Event Management</div>
        <div style={{ fontFamily:BODY, fontSize:12, color:"rgba(240,232,208,0.35)", marginTop:10, letterSpacing:"0.08em" }}>Seats · Tables · Event Spaces</div>
      </div>

      <div style={{ width:240, opacity:phase>=3?1:0, transition:"opacity 0.4s ease" }}>
        <div style={{ width:"100%", height:1, background:"rgba(201,168,76,0.14)", borderRadius:2, overflow:"hidden", position:"relative" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#9A7830,#E2C96A,#C9A84C)", borderRadius:2, transition:"width 0.12s ease", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, height:"100%", width:40, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)", animation:phase>=3?"shimmer-line 1.2s 0.2s ease-in-out infinite":"none" }} />
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
          <span style={{ fontFamily:BODY, fontSize:10, color:"rgba(240,232,208,0.28)", letterSpacing:"0.12em", textTransform:"uppercase" }}>Loading</span>
          <span style={{ fontFamily:MONO, fontSize:11, color:"rgba(201,168,76,0.70)", letterSpacing:"0.04em" }}>{progress}%</span>
        </div>
      </div>
    </div>
  );
}

// ── HERO ───────────────────────────────────────────────────────────────────────
function HeroSection({ loaded, onNavigateToVenues, onManageBooking }) {
  const { isDark } = useTheme();
  const C = getTokens(isDark);
  const isMobile = useIsMobile();
  const [imgHov, setImgHov] = useState(null);
  const [wingHov, setWingHov] = useState({});
  const leftRef = useRef(null);

  useEffect(() => {
    if (!loaded) return;
    const run = async () => {
      await loadGsap();
      if (!leftRef.current) return;
      const els = leftRef.current.querySelectorAll(".ha");
      window.gsap.fromTo(els, { y:52, opacity:0 }, { y:0, opacity:1, duration:0.95, ease:"power3.out", stagger:0.10, delay:0.18 });
    };
    run().catch(console.error);
  }, [loaded]);

  const WINGS = [
    { img:mainWingImg,  label:"Main Wing",  sub:"Corporate & Social Events",  num:"01", action: () => onNavigateToVenues("main-wing")  },
    { img:towerWingImg, label:"Tower Wing", sub:"Grand Galas & Celebrations", num:"02", action: () => onNavigateToVenues("tower-wing") },
  ];

  if (isMobile) {
    return (
      <section style={{ background:C.heroBg, paddingTop:NAV_H, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <div ref={leftRef} style={{ flex:1, padding:"32px 24px 48px", background:C.heroBg }}>
          <div className="ha" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22, opacity:0 }}>
            <div style={{ width:32, height:1, background:C.gold }} />
            <span style={{ fontFamily:BODY, fontSize:9, fontWeight:700, letterSpacing:"0.44em", textTransform:"uppercase", color:C.gold }}>Est. Alabang, Manila</span>
          </div>
          <h1 className="ha" style={{ fontFamily:DISPLAY, fontSize:"clamp(44px,12vw,68px)", fontWeight:600, color:C.textPrimary, lineHeight:0.90, letterSpacing:"-0.03em", margin:"0 0 3px", opacity:0 }}>Reserve</h1>
          <h1 className="ha" style={{ fontFamily:DISPLAY, fontSize:"clamp(44px,12vw,68px)", fontWeight:600, fontStyle:"italic", color:C.gold, lineHeight:0.90, letterSpacing:"-0.03em", margin:"0 0 3px", opacity:0 }}>Your Perfect</h1>
          <h1 className="ha" style={{ fontFamily:DISPLAY, fontSize:"clamp(44px,12vw,68px)", fontWeight:600, color:C.textPrimary, lineHeight:0.96, letterSpacing:"-0.018em", margin:"0 0 22px", opacity:0 }}>Setting.</h1>
          <p className="ha" style={{ fontFamily:BODY, fontSize:14, color:C.heroSub, lineHeight:1.85, marginBottom:28, opacity:0 }}>Two wings of premium event spaces and dining — from intimate boardrooms to grand ballrooms.</p>
          <div className="ha" style={{ display:"flex", gap:14, alignItems:"center", flexWrap:"wrap", marginBottom:28, opacity:0 }}>
            <button onClick={() => onNavigateToVenues()}
              style={{ padding:"14px 32px", background:isDark?C.textPrimary:C.dark, color:isDark?C.dark:"#F0E8D0", border:"none", fontFamily:BODY, fontSize:11, fontWeight:700, letterSpacing:"0.20em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.3s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.gold;e.currentTarget.style.color="#18140E";}}
              onMouseLeave={e=>{e.currentTarget.style.background=isDark?C.textPrimary:C.dark;e.currentTarget.style.color=isDark?C.dark:"#F0E8D0";}}>
              Browse Venues
            </button>
            <span onClick={onManageBooking} style={{ display:"flex", alignItems:"center", gap:8, fontFamily:BODY, fontSize:12, fontWeight:500, color:C.textMuted, cursor:"pointer" }}>
              Manage Booking <ChevRight size={14} color={C.gold} strokeWidth={2.5} />
            </span>
          </div>
          <div className="ha" style={{ display:"flex", border:`1px solid ${C.border}`, opacity:0 }}>
            {[{n:"2",l:"Wings"},{n:"9",l:"Venues"}].map((s,i) => (
              <div key={s.l} style={{ flex:1, padding:"8px 0", borderLeft:i===0?"none":`1px solid ${C.border}`, textAlign:"center" }}>
                <div style={{ fontFamily:MONO, fontSize:14, fontWeight:300, color:C.textPrimary }}>{s.n}</div>
                <div style={{ fontFamily:BODY, fontSize:6, fontWeight:600, color:C.textMuted, letterSpacing:"0.18em", textTransform:"uppercase", marginTop:1 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width:"100%", height:340, overflow:"hidden", position:"relative", flexShrink:0, display:"flex", flexDirection:"column", marginTop:0 }}>
          {WINGS.map((w) => {
            const hov = wingHov[w.num] || false;
            return (
              <div key={w.num} onClick={w.action} onMouseEnter={() => setWingHov(prev => ({...prev, [w.num]: true}))} onMouseLeave={() => setWingHov(prev => ({...prev, [w.num]: false}))}
                style={{ flex:1, position:"relative", overflow:"hidden", cursor:"pointer" }}>
                <img src={w.img} alt="" style={{ position:"absolute", inset:"-10%", width:"120%", height:"120%", objectFit:"cover", filter:"blur(16px) brightness(0.22)", transform:hov?"scale(1.1)":"scale(1.05)", transition:"transform 0.3s ease", pointerEvents:"none" }} />
                <img src={w.img} alt={w.label} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:hov?"brightness(0.48)":"brightness(0.42)", transition:"filter 0.3s ease" }} />
                <div style={{ position:"absolute", inset:0, background:hov?"linear-gradient(to top,rgba(201,168,76,0.15)0%,transparent 55%)":"linear-gradient(to top,rgba(14,13,9,0.82)0%,transparent 55%)", transition:"background 0.3s ease" }} />
                <div style={{ position:"absolute", bottom:10, left:14, right:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontFamily:DISPLAY, fontSize:13, fontWeight:600, color:hov?"#C9A84C":"#F0E8D0", transition:"color 0.3s ease" }}>{w.label}</div>
                    <div style={{ fontFamily:BODY, fontSize:10, color:hov?"rgba(201,168,76,0.60)":"rgba(240,232,208,0.50)", transition:"color 0.3s ease" }}>{w.sub}</div>
                  </div>
                  <ChevRight size={16} color={hov?"#C9A84C":"#F0E8D0"} strokeWidth={2.5} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section style={{ position:"relative", minHeight:"100vh", display:"flex", paddingTop:NAV_H, background:C.heroBg, overflow:"hidden" }}>
      <div ref={leftRef} style={{ flex:"0 0 52%", display:"flex", flexDirection:"column", justifyContent:"center", padding:"80px 64px 80px 56px", position:"relative", zIndex:2 }}>
        <div className="ha" style={{ display:"flex", alignItems:"center", gap:16, marginBottom:42, opacity:0 }}>
          <div style={{ width:40, height:1, background:C.gold }} />
          <span style={{ fontFamily:BODY, fontSize:9, fontWeight:700, letterSpacing:"0.44em", textTransform:"uppercase", color:C.gold }}>Est. Alabang, Manila</span>
        </div>
        <div style={{ overflow:"hidden", marginBottom:2 }}>
          <h1 className="ha" style={{ fontFamily:DISPLAY, fontSize:"clamp(54px,6.5vw,102px)", fontWeight:600, color:C.textPrimary, lineHeight:0.88, letterSpacing:"-0.03em", margin:0, opacity:0 }}>Reserve</h1>
        </div>
        <div style={{ overflow:"hidden", marginBottom:2 }}>
          <h1 className="ha" style={{ fontFamily:DISPLAY, fontSize:"clamp(54px,6.5vw,102px)", fontWeight:600, fontStyle:"italic", color:C.gold, lineHeight:0.88, letterSpacing:"-0.03em", margin:0, opacity:0 }}>Your Perfect</h1>
        </div>
        <div style={{ overflow:"hidden", marginBottom:44 }}>
          <h1 className="ha" style={{ fontFamily:DISPLAY, fontSize:"clamp(54px,6.5vw,102px)", fontWeight:600, color:C.textPrimary, lineHeight:0.96, letterSpacing:"-0.018em", margin:0, opacity:0 }}>Setting.</h1>
        </div>
        <p className="ha" style={{ fontFamily:BODY, fontSize:15, color:C.heroSub, lineHeight:1.9, maxWidth:380, marginBottom:48, fontWeight:400, opacity:0 }}>Two wings of premium event spaces and dining — from intimate boardrooms to grand ballrooms.</p>
        <div className="ha" style={{ display:"flex", gap:16, alignItems:"center", opacity:0 }}>
          <button onClick={() => onNavigateToVenues()}
            style={{ padding:"15px 44px", background:isDark?C.textPrimary:C.dark, color:isDark?C.dark:"#F0E8D0", border:"none", fontFamily:BODY, fontSize:11, fontWeight:700, letterSpacing:"0.20em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.32s cubic-bezier(0.4,0,0.2,1)" }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.gold;e.currentTarget.style.color="#18140E";e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=isDark?C.textPrimary:C.dark;e.currentTarget.style.color=isDark?C.dark:"#F0E8D0";e.currentTarget.style.transform="translateY(0)";}}>
            Browse Venues
          </button>
          <span onClick={onManageBooking}
            style={{ display:"flex", alignItems:"center", gap:10, fontFamily:BODY, fontSize:12, fontWeight:500, color:C.textMuted, cursor:"pointer", transition:"color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.color=C.gold}
            onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}>
            Manage Booking
            <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:22, height:22, borderRadius:"50%", border:`1.5px solid ${C.gold}`, flexShrink:0 }}>
              <ChevRight size={12} color={C.gold} strokeWidth={2.5} />
            </span>
          </span>
        </div>
        <div style={{ position:"absolute", bottom:40, left:56, display:"flex", alignItems:"center", gap:12, opacity:loaded?0.30:0, transition:"opacity 1.2s 1.8s" }}>
          <div style={{ width:1, height:48, background:C.border }} />
          <span style={{ fontFamily:BODY, fontSize:9, letterSpacing:"0.32em", textTransform:"uppercase", color:C.textMuted, writingMode:"vertical-lr" }}>Scroll</span>
        </div>
        <div className="ha" style={{ position:"absolute", bottom:40, right:0, display:"flex", background:isDark?C.darkMid:"#DED4BC", border:`1px solid ${C.border}`, borderRight:"none", opacity:0 }}>
          {[{n:"2",l:"Wings"},{n:"9",l:"Venues"}].map((s,i) => (
            <div key={s.l} style={{ padding:"18px 32px", borderLeft:i===0?"none":`1px solid ${C.border}`, textAlign:"center" }}>
              <div style={{ fontFamily:MONO, fontSize:22, fontWeight:300, color:C.textPrimary, lineHeight:1 }}>{s.n}</div>
              <div style={{ fontFamily:BODY, fontSize:9, fontWeight:600, color:C.textMuted, letterSpacing:"0.18em", textTransform:"uppercase", marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex:"0 0 48%", display:"flex", flexDirection:"column", overflow:"hidden", opacity:loaded?1:0, transform:loaded?"none":"translateX(30px)", transition:"opacity 0.9s 0.3s, transform 0.9s 0.3s" }}>
        {WINGS.map((wing) => {
          const hov = imgHov === wing.num;
          return (
            <div key={wing.num} onMouseEnter={() => setImgHov(wing.num)} onMouseLeave={() => setImgHov(null)} onClick={wing.action}
              style={{ flex:"1 1 50%", position:"relative", overflow:"hidden", cursor:"pointer" }}>
              <img src={wing.img} alt="" style={{ position:"absolute", inset:"-10%", width:"120%", height:"120%", objectFit:"cover", filter:"blur(20px) brightness(0.22)", transform:"scale(1.05)", pointerEvents:"none" }} />
              <img src={wing.img} alt={wing.label} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transform:hov?"scale(1.06)":"scale(1.00)", transition:"transform 0.75s cubic-bezier(0.22,1,0.36,1)", filter:hov?"brightness(0.48)":"brightness(0.38)" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(14,13,9,0.90)0%,rgba(14,13,9,0.10)60%,transparent 100%)" }} />
              <div style={{ position:"absolute", top:20, right:24, fontFamily:MONO, fontSize:52, fontWeight:300, color:"rgba(240,232,208,0.06)", lineHeight:1, userSelect:"none", pointerEvents:"none" }}>{wing.num}</div>
              <div style={{ position:"absolute", top:20, left:20, width:40, height:40, background:C.gold, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", opacity:hov?1:0, transform:hov?"scale(1)":"scale(0.65)", transition:"all 0.32s cubic-bezier(0.22,1,0.36,1)" }}>
                <ChevRight size={18} color="#18140E" strokeWidth={2.8} />
              </div>
              <div style={{ position:"absolute", bottom:24, left:28, background:hov?"rgba(14,13,9,0.95)":"rgba(14,13,9,0.72)", backdropFilter:"blur(8px)", padding:"12px 18px", borderLeft:`3px solid ${C.gold}`, transition:"background 0.3s" }}>
                <div style={{ fontFamily:BODY, fontSize:9, fontWeight:700, color:C.gold, letterSpacing:"0.24em", textTransform:"uppercase", marginBottom:5 }}>Wing {wing.num}</div>
                <div style={{ fontFamily:DISPLAY, fontSize:16, fontWeight:600, color:"#F0E8D0", lineHeight:1.2 }}>{wing.label}</div>
                <div style={{ fontFamily:BODY, fontSize:11, color:"rgba(240,232,208,0.48)", marginTop:3 }}>{wing.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
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
    </div>
  );
}

// ── NEWSLETTER ─────────────────────────────────────────────────────────────────
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
      </div>
    </ThemeContext.Provider>
  );
}