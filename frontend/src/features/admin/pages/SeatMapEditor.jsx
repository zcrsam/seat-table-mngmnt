// src/features/admin/pages/SeatMapEditor.jsx
import { useState } from "react";
import AdminNavbar from "../../../components/layout/AdminNavbar";
import Sidebar from "../../../components/layout/Sidebar";
import SeatMap from "../../../components/seatmap/SeatMap";

// Design tokens matching ReservationDashboard
const C = {
  gold:          "#8C6B2A",
  goldFaint:     "rgba(140,107,42,0.08)",
  pageBg:        "#F7F4EE",
  surfaceBase:   "#FFFFFF",
  borderDefault: "rgba(0,0,0,0.08)",
  borderAccent:  "rgba(140,107,42,0.28)",
  textPrimary:   "#18140E",
  textSecondary: "#7A7060",
  textTertiary:  "rgba(24,20,14,0.35)",
  navBg:         "rgba(247,244,238,0.98)",
  navBorder:     "rgba(140,107,42,0.14)",
  divider:       "rgba(0,0,0,0.06)",
  canvasBg:      "#EDEAE2",
  canvasBorder:  "rgba(140,107,42,0.18)",
};

const F = {
  body: "'DM Sans', sans-serif",
  heading: "'Cormorant Garamond', Georgia, serif",
};

export default function SeatMapEditor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{minHeight:"100vh",fontFamily:F.body,background:C.pageBg,color:C.textPrimary}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <AdminNavbar/>

      <div style={{display:"flex",minHeight:"100vh"}}>
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={()=>setSidebarOpen(!sidebarOpen)}
          activeNav="seat-map"
        />

        {/* Main content area */}
        <div style={{flex:1,minWidth:0,height:"calc(100vh - 0px)",background:C.pageBg,overflow:"hidden"}}>
          
          {/* Top bar */}
          <div style={{
            position:"sticky",top:0,zIndex:100,
            background:C.navBg,
            backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
            borderBottom:`1px solid ${C.navBorder}`,
            padding:"28px 28px",
            height:52,
            display:"flex",alignItems:"center",
            justifyContent:"space-between",
            marginTop: "10px",
          }}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"8px"}}>
                <span style={{fontFamily:F.label,fontSize:9,letterSpacing:"0.20em",color:C.gold,fontWeight:700,textTransform:"uppercase"}}>SEAT MAP editor</span>
                <span style={{color:C.textTertiary,fontSize:11}}>·</span>
                <span style={{fontFamily:F.label,fontSize:9,letterSpacing:"0.14em",color:C.textSecondary,fontWeight:600,textTransform:"uppercase"}}> Design and manage venue layouts</span>
              </div>
            
            </div>
          </div>

          {/* Seat Map content */}
          <div style={{padding:"0",height:"calc(100vh - 320px)",width:"100%",maxWidth:"1400px",margin:"0 auto",overflow:"hidden"}}>
            <SeatMap 
              editMode={true} 
              wing="Main Wing" 
              room="Alabang Function Room" 
              virtualWidth={1200}
              virtualHeight={800}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
