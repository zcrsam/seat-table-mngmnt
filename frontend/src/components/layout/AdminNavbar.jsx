// src/components/layout/AdminNavbar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bellevueLogo from "../../assets/bellevue-logo.png";

function AdminNavbar({ onLogout, pendingCount: pendingProp }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [pending, setPending] = useState(pendingProp ?? 0);

  // Keep badge in sync if parent passes pendingCount prop,
  // otherwise read from localStorage as a live fallback
  useEffect(() => {
    if (pendingProp !== undefined) { setPending(pendingProp); return; }
    const read = () => {
      try {
        const raw = localStorage.getItem("bellevue_pending_count");
        if (raw !== null) setPending(Number(raw));
      } catch {}
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, [pendingProp]);

  const isNotifActive = location.pathname === "/admin/notifications";

  return (
    <nav style={{
      height: 60,
      background: "#FFFFFF",
      borderBottom: "1px solid #E1E4E8",
      display: "flex",
      alignItems: "center",
      padding: "0 32px",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img
          src={bellevueLogo}
          alt="The Bellevue Manila"
          style={{ width: 40, height: "auto", objectFit: "contain" }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Logout */}
        <button
          onClick={onLogout}
          title="Sign Out"
          style={{
            padding: "8px 12px",
            border: "1px solid rgba(201,168,76,0.3)",
            background: "transparent",
            color: "#C9A84C",
            borderRadius: 6,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(201,168,76,0.10)";
            e.currentTarget.style.borderColor = "#C9A84C";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
          }}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ pointerEvents: "none" }}
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;