import { useState } from "react";
import bellevueLogo from "../../assets/bellevue-logo.png";

function AdminNavbar({ onLogout }) {
  return (
    <nav style={{ 
      height:60, 
      background:"#FFFFFF", 
      borderBottom:"1px solid #E1E4E8", 
      display:"flex", 
      alignItems:"center", 
      padding:"0 32px", 
      justifyContent:"space-between", 
      position:"sticky", 
      top:0, 
      zIndex:100 
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <img 
          src={bellevueLogo} 
          alt="The Bellevue Manila" 
          style={{ 
            width:"40px", 
            height:"auto", 
            objectFit:"contain"
          }} 
        />
        
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        
        <button 
          onClick={onLogout} 
          style={{ 
            padding:"8px 12px", 
            border:"1px solid rgba(201,168,76,0.3)", 
            background:"transparent", 
            color:"#C9A84C", 
            borderRadius:6, 
            fontFamily:"Montserrat, sans-serif", 
            fontSize:14, 
            cursor:"pointer",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            transition:"all 0.2s ease"
          }}
          onMouseEnter={e => {
            e.target.style.background = "rgba(201, 168, 76, 0.1)";
            e.target.style.borderColor = "#C9A84C";
          }}
          onMouseLeave={e => {
            e.target.style.background = "transparent";
            e.target.style.borderColor = "rgba(201,168,76,0.3)";
          }}
          title="Sign Out"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16,17 21,12 16,7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
