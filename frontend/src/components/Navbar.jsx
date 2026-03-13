import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import bellevueLogo from "../assets/bellevue-logo.png";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // ─────────────────────────────────────────
  // Detect scroll for navbar background
  // ─────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─────────────────────────────────────────
  // Scroll helper
  // ─────────────────────────────────────────
  const scrollToId = (id) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Listen for homepage section changes (dispatched from HomePage)
  useEffect(() => {
    const handleHomeSection = (e) => {
      if (location.pathname !== "/") return;
      setActive(e?.detail ?? null);
    };

    window.addEventListener("homeActiveSection", handleHomeSection);
    return () => window.removeEventListener("homeActiveSection", handleHomeSection);
  }, [location.pathname]);

  // ─────────────────────────────────────────
  // EVENT click
  // ─────────────────────────────────────────
  const handleEventClick = (e) => {
    e.preventDefault();
    setActive("event");

    if (location.pathname === "/") {
      scrollToId("home-event");
    } else {
      navigate("/", { state: { scrollTo: "event" } });
    }
  };

  // ─────────────────────────────────────────
  // DINING click
  // ─────────────────────────────────────────
  const handleDiningClick = (e) => {
    e.preventDefault();
    setActive("dining");

    if (location.pathname === "/") {
      scrollToId("home-dining");
    } else {
      navigate("/", { state: { scrollTo: "dining" } });
    }
  };

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        {/* Logo only */}
        <a
          href="/"
          className="nav-brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <img src={bellevueLogo} alt="The Bellevue Manila" className="nav-logo" />
        </a>

        <div className="nav-links">
          <a
            href="#event"
            className={`nav-link ${active === "event" ? "active" : ""}`}
            onClick={handleEventClick}
          >
            EVENT
          </a>

          <a
            href="#dining"
            className={`nav-link ${active === "dining" ? "active" : ""}`}
            onClick={handleDiningClick}
          >
            DINING
          </a>
        </div>
      </nav>

      <style>{`
        .nav {
          background: transparent;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 200;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .nav.scrolled {
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .nav-brand {
          text-decoration: none;
        }

        .nav-logo {
          height: 40px;
          width: auto;
          display: block;
        }

        .nav-links {
          display: flex;
          gap: 10px;
        }

        .nav-link {
          padding: 0.6rem 1.5rem;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          color: #c4ad72ff;
          background: transparent;
          border: none;
          transition: background 0.2s ease, color 0.2s ease;
        }

        /* Rectangle highlight */
        .nav-link.active {
          background: #C9A84C;
          color: white;
        }

        .nav-link:hover {
          background: rgba(0,0,0,0.05);
        }

        .nav-link.active:hover {
          background: #b8984a;
        }

        .nav-link:visited,
        .nav-link:active,
        .nav-link:focus {
          outline: none;
        }
      `}</style>
    </>
  );
}