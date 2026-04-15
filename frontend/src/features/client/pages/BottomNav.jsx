import * as React from "react";
import { ChevronDown } from "lucide-react";

const BottomNav = ({ active }) => {
  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "venues", label: "Venues", icon: "🏛️" },
    { id: "reserve", label: "Reserve", icon: "🪑" },
    { id: "manage", label: "Manage", icon: "📋" },
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#1C1B19",
      borderTop: "1px solid rgba(201,168,76,0.16)",
      padding: "8px 0",
      zIndex: 1000,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        maxWidth: "600px",
        margin: "0 auto",
      }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "8px 16px",
              background: active === item.id ? "#C9A84C" : "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              color: active === item.id ? "#111110" : "#F5F0E0",
            }}
            onMouseEnter={(e) => {
              if (active !== item.id) {
                e.currentTarget.style.background = "rgba(201,168,76,0.1)";
                e.currentTarget.style.color = "#C9A84C";
              }
            }}
            onMouseLeave={(e) => {
              if (active !== item.id) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#F5F0E0";
              }
            }}
          >
            <span style={{ fontSize: "20px" }}>{item.icon}</span>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.02em" }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export { BottomNav };
