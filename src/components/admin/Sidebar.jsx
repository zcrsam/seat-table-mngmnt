import { useState } from "react";

function Sidebar({ isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "32px",
        height: "32px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "4px",
        padding: "6px",
        borderRadius: "4px",
        transition: "all 0.2s ease"
      }}
      onMouseEnter={e => e.target.style.background = "rgba(201, 168, 76, 0.1)"}
      onMouseLeave={e => e.target.style.background = "transparent"}
    >
      <span
        style={{
          width: "20px",
          height: "2px",
          background: "#E6D5A8",
          transition: "all 0.2s ease"
        }}
      />
      <span
        style={{
          width: "20px",
          height: "2px",
          background: "#E6D5A8",
          transition: "all 0.2s ease"
        }}
      />
      <span
        style={{
          width: "20px",
          height: "2px",
          background: "#E6D5A8",
          transition: "all 0.2s ease"
        }}
      />
    </button>
  );
}

export default Sidebar;
