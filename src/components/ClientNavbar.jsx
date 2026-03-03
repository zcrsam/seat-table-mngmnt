import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import bellevueLogo from "../assets/bellevue-logo.png";

const TOKENS = {
  gold: "#C9A84C",
  dark: "#0E0D09",
  ink: "#1E1A10",
  border: "rgba(201,168,76,0.18)",
};

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  const y = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top: y, behavior: "smooth" });
  return true;
}

export default function ClientNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const headerH = 72;
    const getActive = () => {
      if (!isHome) return null;
      const markerY = headerH + 8;

      const inView = (id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= markerY && r.bottom > markerY;
      };

      if (inView("home-event")) return "event";
      if (inView("home-dining")) return "dining";
      return null;
    };

    const fn = () => {
      setScrolled(window.scrollY > 50);
      setActiveSection(getActive());
    };

    window.addEventListener("scroll", fn);
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // If we navigated to "/#event" or "/#dining", scroll after render.
  useEffect(() => {
    if (!isHome) return;
    if (location.hash === "#event") {
      // Let layout paint first.
      requestAnimationFrame(() => scrollToId("home-event"));
    }
    if (location.hash === "#dining") {
      requestAnimationFrame(() => scrollToId("home-dining"));
    }
  }, [isHome, location.hash]);

  const headerBg = useMemo(() => {
    if (!isHome) return "rgba(255,255,255,0.96)";
    return scrolled ? "rgba(255,255,255,0.96)" : "transparent";
  }, [isHome, scrolled]);

  const headerBorder = useMemo(() => {
    if (!isHome) return `1px solid ${TOKENS.border}`;
    return scrolled ? `1px solid ${TOKENS.border}` : "none";
  }, [isHome, scrolled]);

  const navText = useMemo(() => {
    if (!isHome) return TOKENS.ink;
    return scrolled ? TOKENS.ink : "rgba(247,243,234,0.8)";
  }, [isHome, scrolled]);

  const handleClickEvent = () => {
    if (isHome) {
      window.location.hash = "#event";
      if (!scrollToId("home-event")) window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/#event");
  };

  const handleClickVenue = () => {
    if (isHome) {
      window.location.hash = "#dining";
      if (!scrollToId("home-dining")) window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/#dining");
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 72,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${TOKENS.border}`,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src={bellevueLogo}
            alt="The Bellevue Manila"
            style={{
              height: 40,
              marginRight: "1rem",
            }}
          />
          <div style={{ color: TOKENS.ink }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              The Bellevue
            </div>
            <div style={{ fontSize: "0.875rem", fontWeight: 400 }}>
              Manila
            </div>
          </div>
        </Link>

        <nav style={{ display: "flex", gap: "2rem" }}>
          <Link
            to="/#event"
            onClick={handleClickEvent}
            style={{
              color: TOKENS.gold,
              textDecoration: "none",
              fontWeight: activeSection === "event" ? 600 : 500,
              padding: "0.5rem 1rem",
              borderRadius: 20,
              background: activeSection === "event" ? "rgba(201,168,76,0.1)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            EVENTS
          </Link>
          <Link
            to="/#dining"
            onClick={handleClickVenue}
            style={{
              color: TOKENS.gold,
              textDecoration: "none",
              fontWeight: activeSection === "dining" ? 600 : 500,
              padding: "0.5rem 1rem",
              borderRadius: 20,
              background: activeSection === "dining" ? "rgba(201,168,76,0.1)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            DINING
          </Link>
          <Link
            to="/venues"
            style={{
              color: TOKENS.gold,
              textDecoration: "none",
              fontWeight: 600,
              padding: "0.5rem 1rem",
              borderRadius: 20,
              background: TOKENS.gold,
              transition: "all 0.2s ease",
            }}
          >
            VENUES
          </Link>
        </nav>
      </div>
    </header>
  );
}
