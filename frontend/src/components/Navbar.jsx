import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import bellevueLogo from "../assets/bellevue-logo.png";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Read theme from localStorage (same key used by HomePage)
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("bellevue-theme");
      if (saved !== null) return saved === "dark";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  // Sync theme if HomePage changes it
  useEffect(() => {
    const onStorage = () => {
      try {
        const saved = localStorage.getItem("bellevue-theme");
        if (saved !== null) setIsDark(saved === "dark");
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    // Also poll on focus in case same-tab storage doesn't fire
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToId = (id) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    const handleHomeSection = (e) => {
      if (location.pathname !== "/") return;
      setActive(e?.detail ?? null);
    };
    window.addEventListener("homeActiveSection", handleHomeSection);
    return () => window.removeEventListener("homeActiveSection", handleHomeSection);
  }, [location.pathname]);

  const handleEventClick = (e) => {
    e.preventDefault();
    setActive("event");
    if (location.pathname === "/") {
      scrollToId("home-event");
    } else {
      navigate("/", { state: { scrollTo: "event" } });
    }
  };

  const handleDiningClick = (e) => {
    e.preventDefault();
    setActive("dining");
    if (location.pathname === "/") {
      scrollToId("home-dining");
    } else {
      navigate("/", { state: { scrollTo: "dining" } });
    }
  };

  // Don't render on homepage — TopNav inside HomePage handles it there
  if (location.pathname === "/") return null;

  // Theme-aware scrolled background — NO border-bottom
  const scrolledBg = isDark
    ? "rgba(14,13,9,0.92)"
    : "rgba(245,240,232,0.96)";

  const logoFilter = isDark
    ? "none"
    : "brightness(0) saturate(100%) invert(25%) sepia(40%) saturate(500%) hue-rotate(10deg)";

  return (
    <>
      <nav
        style={{
          background: scrolled ? scrolledBg : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          // KEY FIX: no border-bottom ever — no white line
          borderBottom: "none",
          boxShadow: "none",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 200,
          transition: "background 0.35s ease, backdrop-filter 0.35s ease",
          boxSizing: "border-box",
        }}
      >
        <a
          href="/"
          style={{ textDecoration: "none" }}
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <img
            src={bellevueLogo}
            alt="The Bellevue Manila"
            style={{
              height: 40,
              width: "auto",
              display: "block",
              filter: logoFilter,
              transition: "filter 0.35s",
            }}
          />
        </a>

        <div style={{ display: "flex", gap: 10 }}>
          {/* nav links go here if needed */}
        </div>
      </nav>
    </>
  );
}