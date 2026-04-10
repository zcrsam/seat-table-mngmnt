// src/features/admin/pages/ReservationDashboard.jsx
import { useState, useEffect } from "react";
import AdminNavbar from "../../../components/layout/AdminNavbar";
import Sidebar from "../../../components/layout/Sidebar";
import { fetchReservations, approveReservation, rejectReservation, getReservationStats } from "../../../utils/api";
import { subscribeToReservationUpdates } from "../../../utils/websocket";

const RESERVATIONS_KEY = "bellevue_reservations";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ─── Design Tokens (light only) ───────────────────────────────────────────────
const C = {
  gold: "#8C6B2A",
  goldLight: "#A07D38",
  goldFaint: "rgba(140,107,42,0.07)",
  goldFaintest: "rgba(140,107,42,0.04)",
  pageBg: "#F7F4EE",
  surfaceBase: "#FFFFFF",
  surfaceInput: "#FFFFFF",
  borderDefault: "rgba(0,0,0,0.08)",
  borderStrong: "rgba(0,0,0,0.13)",
  borderAccent: "rgba(140,107,42,0.28)",
  textPrimary: "#18140E",
  textSecondary: "#7A7060",
  textTertiary: "rgba(24,20,14,0.35)",
  textOnAccent: "#FFFFFF",
  red: "#A03838",
  redFaint: "rgba(160,56,56,0.07)",
  redBorder: "rgba(160,56,56,0.18)",
  green: "#2E7A5A",
  greenFaint: "rgba(46,122,90,0.07)",
  greenBorder: "rgba(46,122,90,0.18)",
  badgePending:  { bg: "rgba(140,107,42,0.09)",  color: "#8C6B2A",  dot: "#8C6B2A"  },
  badgeApproved: { bg: "rgba(46,122,90,0.09)",   color: "#2E7A5A",  dot: "#2E7A5A"  },
  badgeRejected: { bg: "rgba(160,56,56,0.09)",   color: "#A03838",  dot: "#A03838"  },
  navBg: "rgba(247,244,238,0.97)",
  navBorder: "rgba(140,107,42,0.14)",
  divider: "rgba(0,0,0,0.05)",
  inputFocusShadow: "0 0 0 3px rgba(140,107,42,0.10)",
  modalOverlay: "rgba(0,0,0,0.42)",
  statusNote:       { pending: "rgba(140,107,42,0.05)", approved: "rgba(46,122,90,0.05)", rejected: "rgba(160,56,56,0.05)" },
  statusNoteBorder: { pending: "rgba(140,107,42,0.18)", approved: "rgba(46,122,90,0.18)", rejected: "rgba(160,56,56,0.18)" },
  headerGradient: "linear-gradient(160deg,#FAF8F4 0%,#F2EFE8 100%)",
  spinnerBorder: "rgba(0,0,0,0.12)",
  spinnerTop: "#8C6B2A",
  cardBg: "#FFFFFF",
  cardBorder: "rgba(0,0,0,0.07)",
};

const F = {
  display: "'Inter','Helvetica Neue',Arial,sans-serif",
  body:    "'Inter','Helvetica Neue',Arial,sans-serif",
  label:   "'Inter','Helvetica Neue',Arial,sans-serif",
  mono:    "'Inter','Helvetica Neue',Arial,sans-serif",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spinner({ size = 13 }) {
  return (
    <span style={{
      display:"inline-block",width:size,height:size,
      border:`1.5px solid ${C.spinnerBorder}`,
      borderTopColor:C.spinnerTop,
      borderRadius:"50%",animation:"spin 0.65s linear infinite",flexShrink:0,
    }}/>
  );
}

function SectionLabel({ children, style={} }) {
  return (
    <div style={{
      fontFamily:F.label,fontSize:9,letterSpacing:"0.20em",
      color:C.gold,fontWeight:700,textTransform:"uppercase",
      marginBottom:14,paddingBottom:8,
      borderBottom:`1px solid ${C.divider}`,...style,
    }}>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const s=(status||"pending").toLowerCase();
  const map={pending:C.badgePending,approved:C.badgeApproved,rejected:C.badgeRejected};
  const badge=map[s]||C.badgePending;
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:5,
      padding:"3px 10px 3px 7px",
      background:badge.bg,
      border:`1px solid ${badge.color}33`,
      borderRadius:20,
      fontFamily:F.label,fontSize:9,fontWeight:700,
      letterSpacing:"0.12em",textTransform:"uppercase",
      color:badge.color,flexShrink:0,
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:badge.dot,flexShrink:0}}/>
      {s.charAt(0).toUpperCase()+s.slice(1)}
    </span>
  );
}

// ─── Email notification API call ──────────────────────────────────────────────
async function sendStatusEmail(reservationId, status, rejectionReason="") {
  try {
    console.log(`[Email] Sending ${status} email for reservation ${reservationId}`);
    const res=await fetch(`${API_BASE_URL}/reservations/${reservationId}/notify`,{
      method:"POST",
      headers:{"Content-Type":"application/json",Accept:"application/json"},
      body:JSON.stringify({status,rejection_reason:rejectionReason}),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Email] Failed to send email: ${res.status} - ${errorText}`);
      return false;
    }
    
    const result = await res.json();
    console.log(`[Email] Email sent successfully:`, result);
    return result.success || true;
  } catch (error) {
    console.error(`[Email] Error sending email:`, error);
    return false;
  }
}

// ─── Reject Reason Modal ──────────────────────────────────────────────────────
function RejectReasonModal({ reservation, onConfirm, onCancel, loading }) {
  const [reason,setReason]=useState("");
  const [focused,setFocused]=useState(false);
  const canSubmit=reason.trim().length>0&&!loading;

  return (
    <div
      style={{
        position:"fixed",inset:0,
        background:"rgba(0,0,0,0.55)",
        zIndex:5000,
        display:"flex",alignItems:"center",justifyContent:"center",
        padding:20,
        backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",
      }}
      onClick={(e)=>{if(e.target===e.currentTarget&&!loading)onCancel();}}
    >
      <div style={{
        background:C.surfaceBase,borderRadius:14,
        width:"100%",maxWidth:440,
        boxShadow:"0 20px 60px rgba(0,0,0,0.18)",
        border:`1px solid ${C.borderDefault}`,
        fontFamily:F.body,
        animation:"modalIn 0.20s cubic-bezier(0.16,1,0.3,1)",
        overflow:"hidden",
      }}>
        <div style={{height:2,background:`linear-gradient(90deg,transparent 0%,${C.red}90 30%,${C.red}90 70%,transparent 100%)`}}/>

        {/* Header */}
        <div style={{
          background:C.headerGradient,
          padding:"18px 22px 16px",
          borderBottom:`1px solid ${C.divider}`,
          display:"flex",alignItems:"flex-start",justifyContent:"space-between",
        }}>
          <div>
            <div style={{fontFamily:F.label,fontSize:9,letterSpacing:"0.22em",color:C.red,fontWeight:700,textTransform:"uppercase",marginBottom:5,opacity:0.85}}>
              Reject Reservation
            </div>
            <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.textPrimary,lineHeight:1.2}}>
              {reservation.name||"—"}
            </div>
          </div>
          <button onClick={onCancel} disabled={loading}
            style={{
              width:30,height:30,borderRadius:"50%",background:"transparent",
              border:`1px solid ${C.borderDefault}`,cursor:loading?"not-allowed":"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0,transition:"border-color 0.18s",padding:0,
            }}
            onMouseEnter={(e)=>{if(!loading)e.currentTarget.style.borderColor=C.red;}}
            onMouseLeave={(e)=>{e.currentTarget.style.borderColor=C.borderDefault;}}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke={C.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{padding:"20px 22px 24px"}}>
          <div style={{
            padding:"10px 14px",borderRadius:8,marginBottom:18,
            background:C.statusNote.rejected,border:`1px solid ${C.statusNoteBorder.rejected}`,
            fontFamily:F.body,fontSize:12,color:C.textSecondary,lineHeight:1.65,
          }}>
            A rejection email will be sent to{" "}
            <strong style={{color:C.textPrimary}}>{reservation.email}</strong>{" "}
            with your reason included.
          </div>

          <label style={{
            display:"block",fontFamily:F.label,fontSize:9,letterSpacing:"0.18em",
            color:focused?C.gold:C.textSecondary,fontWeight:700,
            textTransform:"uppercase",marginBottom:7,transition:"color 0.18s",
          }}>
            Reason for Rejection <span style={{color:C.red,marginLeft:3}}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e)=>setReason(e.target.value)}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setFocused(false)}
            placeholder="e.g. Venue fully booked for the requested date, capacity exceeded…"
            rows={4}
            style={{
              width:"100%",boxSizing:"border-box",
              padding:"11px 14px",
              border:`1.5px solid ${focused?C.borderAccent:C.borderDefault}`,
              borderRadius:8,background:C.surfaceInput,
              fontFamily:F.body,fontSize:13,color:C.textPrimary,
              outline:"none",transition:"border-color 0.18s,box-shadow 0.18s",
              boxShadow:focused?C.inputFocusShadow:"none",
              resize:"vertical",minHeight:90,
            }}
          />

          <div style={{display:"flex",gap:8,marginTop:16}}>
            <button onClick={onCancel} disabled={loading}
              style={{
                flex:1,padding:"11px",
                background:"transparent",border:`1px solid ${C.borderDefault}`,
                borderRadius:8,fontFamily:F.label,fontSize:10,fontWeight:700,
                letterSpacing:"0.14em",textTransform:"uppercase",
                color:C.textSecondary,cursor:loading?"not-allowed":"pointer",transition:"all 0.18s",
              }}
              onMouseEnter={(e)=>{if(!loading){e.currentTarget.style.borderColor=C.borderAccent;e.currentTarget.style.color=C.gold;}}}
              onMouseLeave={(e)=>{e.currentTarget.style.borderColor=C.borderDefault;e.currentTarget.style.color=C.textSecondary;}}
            >Cancel</button>
            <button
              onClick={()=>canSubmit&&onConfirm(reason.trim())}
              disabled={!canSubmit}
              style={{
                flex:2,padding:"11px",
                background:canSubmit?C.red:"rgba(160,56,56,0.35)",
                border:"none",borderRadius:8,
                fontFamily:F.label,fontSize:10,fontWeight:700,
                letterSpacing:"0.14em",textTransform:"uppercase",
                color:"#fff",cursor:canSubmit?"pointer":"not-allowed",
                transition:"all 0.18s",
                display:"flex",alignItems:"center",justifyContent:"center",gap:7,
              }}
              onMouseEnter={(e)=>{if(canSubmit)e.currentTarget.style.background="#8a2e2e";}}
              onMouseLeave={(e)=>{if(canSubmit)e.currentTarget.style.background=C.red;}}
            >
              {loading?<><Spinner/>Rejecting…</>:"Confirm Rejection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ reservation, onClose, onApprove, onReject }) {
  const [actionLoading,setActionLoading]=useState(null);
  const [showRejectModal,setShowRejectModal]=useState(false);

  const fmtDate=(d)=>{
    if(!d)return"—";
    try{return new Date(d+"T00:00:00").toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});}
    catch{return d;}
  };
  const fmtTime=(t)=>{
    if(!t)return"—";
    const[h,m]=t.split(":");const hr=parseInt(h);
    return`${hr%12||12}:${m} ${hr>=12?"PM":"AM"}`;
  };

  const handleApprove=async()=>{
    setActionLoading("approve");
    await onApprove(reservation);
    setActionLoading(null);
    onClose();
  };

  const handleRejectConfirm=async(reason)=>{
    setActionLoading("reject");
    await onReject(reservation,reason);
    setActionLoading(null);
    setShowRejectModal(false);
    onClose();
  };

  const isPending=(reservation.status||"").toLowerCase()==="pending";

  const resRows=[
    ["Reference",  reservation.reference_code||"—"],
    ["Room",       reservation.room||"—"],
    ["Table",      reservation.table_number?`Table ${reservation.table_number}`:"—"],
    ["Seat",       (reservation.seat||reservation.seat_number)?`Seat ${reservation.seat||reservation.seat_number}`:"—"],
    ["Guests",     (reservation.guests_count || reservation.guests) ? `${reservation.guests_count || reservation.guests} guest${(reservation.guests_count || reservation.guests) !== 1 ? "s" : ""}` : "--"],
    ["Event Date", fmtDate(reservation.event_date)],
    ["Event Time", fmtTime(reservation.event_time)],
  ];

  const guestRows=[
    ["Full Name",        reservation.name||"—"],
    ["Email",            reservation.email||"—"],
    ["Phone",            reservation.phone||"—"],
    ["Special Requests", reservation.special_requests||"None"],
  ];

  return (
    <>
      <div
        style={{
          position:"fixed",inset:0,
          background:C.modalOverlay,
          zIndex:4000,
          display:"flex",alignItems:"center",justifyContent:"center",
          padding:20,
          backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",
        }}
        onClick={(e)=>{if(e.target===e.currentTarget&&!actionLoading)onClose();}}
      >
        <div style={{
          background:C.surfaceBase,borderRadius:14,
          width:"100%",maxWidth:520,
          maxHeight:"92vh",
          boxShadow:"0 24px 80px rgba(0,0,0,0.16)",
          border:`1px solid ${C.borderDefault}`,
          fontFamily:F.body,
          animation:"modalIn 0.20s cubic-bezier(0.16,1,0.3,1)",
          overflow:"hidden",
          display:"flex",flexDirection:"column",
        }}>
          <div style={{height:2,background:`linear-gradient(90deg,transparent 0%,${C.gold}80 30%,${C.gold}80 70%,transparent 100%)`,flexShrink:0}}/>

          {/* Header */}
          <div style={{
            background:C.headerGradient,
            padding:"18px 22px 16px",
            borderBottom:`1px solid ${C.divider}`,
            display:"flex",alignItems:"flex-start",justifyContent:"space-between",
            flexShrink:0,
          }}>
            <div style={{flex:1,paddingRight:14}}>
              <div style={{fontFamily:F.label,fontSize:9,letterSpacing:"0.22em",color:C.gold,fontWeight:700,textTransform:"uppercase",marginBottom:5,opacity:0.80}}>
                Reservation Detail
              </div>
              <div style={{fontFamily:F.display,fontSize:19,fontWeight:600,color:C.textPrimary,lineHeight:1.2,marginBottom:8}}>
                {reservation.name||"—"}
              </div>
              <StatusBadge status={reservation.status}/>
            </div>
            <button onClick={onClose} disabled={!!actionLoading}
              style={{
                width:30,height:30,borderRadius:"50%",background:"transparent",
                border:`1px solid ${C.borderDefault}`,cursor:actionLoading?"not-allowed":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,transition:"border-color 0.18s",padding:0,
              }}
              onMouseEnter={(e)=>{if(!actionLoading)e.currentTarget.style.borderColor=C.gold;}}
              onMouseLeave={(e)=>{e.currentTarget.style.borderColor=C.borderDefault;}}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke={C.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{padding:"18px 22px 24px",overflowY:"auto",flex:1}}>
            <SectionLabel>Reservation Details</SectionLabel>
            {resRows.map(([label,value],i,arr)=>(
              <div key={label} style={{
                display:"flex",justifyContent:"space-between",alignItems:"flex-start",
                padding:"8px 0",
                borderBottom:i<arr.length-1?`1px solid ${C.divider}`:"none",
              }}>
                <span style={{fontFamily:F.label,fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:C.textTertiary,minWidth:100,flexShrink:0}}>{label}</span>
                <span style={{fontFamily:F.body,fontSize:12.5,color:label==="Reference"?C.gold:C.textPrimary,fontWeight:label==="Reference"?700:500,textAlign:"right",maxWidth:280,lineHeight:1.5,letterSpacing:label==="Reference"?"0.06em":"normal"}}>{value}</span>
              </div>
            ))}

            <SectionLabel style={{marginTop:18}}>Guest Information</SectionLabel>
            {guestRows.map(([label,value],i,arr)=>(
              <div key={label} style={{
                display:"flex",justifyContent:"space-between",alignItems:"flex-start",
                padding:"8px 0",
                borderBottom:i<arr.length-1?`1px solid ${C.divider}`:"none",
              }}>
                <span style={{fontFamily:F.label,fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:C.textTertiary,minWidth:100,flexShrink:0}}>{label}</span>
                <span style={{fontFamily:F.body,fontSize:12.5,color:C.textPrimary,fontWeight:500,textAlign:"right",maxWidth:280,lineHeight:1.5}}>{value}</span>
              </div>
            ))}

            {isPending?(
              <div style={{display:"flex",gap:8,marginTop:22}}>
                <button
                  onClick={()=>setShowRejectModal(true)}
                  disabled={!!actionLoading}
                  style={{
                    flex:1,padding:"11px",
                    background:"transparent",border:`1px solid ${C.redBorder}`,
                    borderRadius:8,fontFamily:F.label,fontSize:10,fontWeight:700,
                    letterSpacing:"0.14em",textTransform:"uppercase",
                    color:C.red,cursor:actionLoading?"not-allowed":"pointer",
                    transition:"all 0.18s",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                    opacity:actionLoading==="approve"?0.5:1,
                  }}
                  onMouseEnter={(e)=>{if(!actionLoading)e.currentTarget.style.background=C.redFaint;}}
                  onMouseLeave={(e)=>{e.currentTarget.style.background="transparent";}}
                >
                  {actionLoading==="reject"?<><Spinner/>Rejecting…</>:"Reject"}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={!!actionLoading}
                  style={{
                    flex:2,padding:"11px",border:"none",borderRadius:8,
                    background:actionLoading?"rgba(46,122,90,0.45)":C.green,
                    color:"#fff",fontFamily:F.label,fontSize:10,fontWeight:700,
                    letterSpacing:"0.14em",textTransform:"uppercase",
                    cursor:actionLoading?"not-allowed":"pointer",transition:"all 0.18s",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                  }}
                  onMouseEnter={(e)=>{if(!actionLoading)e.currentTarget.style.background="#256648";}}
                  onMouseLeave={(e)=>{if(!actionLoading)e.currentTarget.style.background=C.green;}}
                >
                  {actionLoading==="approve"?<><Spinner/>Approving…</>:"Approve & Notify"}
                </button>
              </div>
            ):(
              <div style={{
                marginTop:18,padding:"10px 14px",borderRadius:8,
                background:C.statusNote[(reservation.status||"pending").toLowerCase()]||C.goldFaintest,
                border:`1px solid ${C.statusNoteBorder[(reservation.status||"pending").toLowerCase()]||C.borderAccent}`,
                fontFamily:F.body,fontSize:12,color:C.textSecondary,lineHeight:1.6,
              }}>
                This reservation has been <strong style={{color:C.textPrimary}}>{(reservation.status||"").toLowerCase()}</strong> and cannot be modified.
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal&&(
        <RejectReasonModal
          reservation={reservation}
          onConfirm={handleRejectConfirm}
          onCancel={()=>setShowRejectModal(false)}
          loading={actionLoading==="reject"}
        />
      )}
    </>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(()=>{const t=setTimeout(onClose,4500);return()=>clearTimeout(t);},[onClose]);
  const isSuccess=type==="success";
  return (
    <div style={{
      position:"fixed",bottom:24,right:24,zIndex:9999,
      display:"flex",alignItems:"center",gap:10,
      padding:"12px 18px",
      background:C.surfaceBase,
      border:`1px solid ${isSuccess?C.greenBorder:C.redBorder}`,
      borderRadius:10,
      boxShadow:"0 8px 28px rgba(0,0,0,0.12)",
      fontFamily:F.body,fontSize:13,
      animation:"fadeUp 0.22s ease",
      maxWidth:400,
    }}>
      <span style={{width:7,height:7,borderRadius:"50%",background:isSuccess?C.green:C.red,flexShrink:0}}/>
      <span style={{color:C.textPrimary,flex:1,lineHeight:1.5}}>{message}</span>
      <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",padding:0,color:C.textSecondary,display:"flex",alignItems:"center"}}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ReservationDashboard() {
  const [reservations,setReservations]=useState([]);
  const [filteredReservations,setFilteredReservations]=useState([]);
  const [filterStatus,setFilterStatus]=useState("ALL");
  const [search,setSearch]=useState("");
  const [selectedReservation,setSelectedReservation]=useState(null);
  const [showModal,setShowModal]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [stats,setStats]=useState({total:0,pending:0,approved:0,rejected:0});
  const [toast,setToast]=useState(null);
  const [pagination,setPagination]=useState({currentPage:1,lastPage:1,totalItems:0});
  const [loading,setLoading]=useState(true);
  const [searchFocused,setSearchFocused]=useState(false);

  const [windowWidth,setWindowWidth]=useState(window.innerWidth);
  useEffect(()=>{
    const h=()=>setWindowWidth(window.innerWidth);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);

  const isMobile=windowWidth<640;
  const isTablet=windowWidth<960;

  // Load
  useEffect(()=>{
    const load=async()=>{
      setLoading(true);
      try{
        const [reservationsResult, statsResult] = await Promise.all([
          fetchReservations(1,100,filterStatus,search),
          getReservationStats()
        ]);
        
        if(reservationsResult.data){
          console.log('[Dashboard] Loaded reservations:', reservationsResult.data);
          setReservations(reservationsResult.data);
        }
        else{
          const stored=localStorage.getItem(RESERVATIONS_KEY);
          if(stored)setReservations(JSON.parse(stored));
        }
        
        if(statsResult){
          console.log('[Dashboard] Loaded stats:', statsResult);
          setStats(statsResult);
        }
      }catch{
        try{const stored=localStorage.getItem(RESERVATIONS_KEY);if(stored)setReservations(JSON.parse(stored));}catch{}
      }finally{setLoading(false);}
    };
    load();
  },[]);

  // WS
  useEffect(()=>{
    const unsub=subscribeToReservationUpdates((updated)=>{
      setReservations((prev)=>{
        const idx=prev.findIndex((r)=>r.id===updated.id);
        if(idx>=0){const arr=[...prev];arr[idx]=updated;return arr;}
        return[...prev,updated];
      });
    });
    return unsub;
  },[]);

  // Filter
  useEffect(()=>{
    let filtered=reservations;
    if(filterStatus!=="ALL"){
      filtered=filtered.filter((r)=>{
        const status=r.status?.toLowerCase();
        if(filterStatus.toLowerCase()==="approved"){
          return status==="approved"||status==="reserved";
        }
        return status===filterStatus.toLowerCase();
      });
    }
    if(search.trim()){
      const q=search.toLowerCase();
      filtered=filtered.filter((r)=>r.name?.toLowerCase().includes(q)||r.email?.toLowerCase().includes(q)||r.reference_code?.toLowerCase().includes(q));
    }
    setFilteredReservations(filtered);
    setPagination((p)=>({...p,lastPage:Math.ceil(filtered.length/10)||1,totalItems:filtered.length,currentPage:1}));
  },[reservations,filterStatus,search]);

  const handlePageChange=(page)=>{
    if(page<1||page>pagination.lastPage)return;
    setPagination((p)=>({...p,currentPage:page}));
  };

  const getPageNumbers=()=>{
    const{currentPage,lastPage}=pagination;
    if(lastPage<=5)return Array.from({length:lastPage},(_,i)=>i+1);
    const start=Math.max(1,currentPage-1);
    const end=Math.min(lastPage,currentPage+1);
    const pages=[];
    if(start>1){pages.push(1);if(start>2)pages.push("...");}
    for(let i=start;i<=end;i++)pages.push(i);
    if(end<lastPage){if(end<lastPage-1)pages.push("...");pages.push(lastPage);}
    return pages;
  };

  // Approve
  const handleApprove=async(reservation)=>{
    try{
      const result=await approveReservation(reservation.db_id);
      if(result.success){
        setReservations((prev)=>prev.map((r)=>r.id===reservation.id?{...r,status:"approved"}:r));
        setToast({
          message:`Approved! Confirmation email sent to ${reservation.email}.`,
          type:"success",
        });
      }else{
        setToast({message:result.message||"Failed to approve",type:"error"});
      }
    }catch{
      setToast({message:"Error approving reservation",type:"error"});
    }
  };

  // Reject
  const handleReject=async(reservation,reason)=>{
    try{
      const result=await rejectReservation(reservation.db_id,reason);
      if(result.success){
        setReservations((prev)=>prev.map((r)=>r.id===reservation.id?{...r,status:"rejected"}:r));
        setToast({
          message:`Rejected. Notification email sent to ${reservation.email}.`,
          type:"success",
        });
      }else{
        setToast({message:result.message||"Failed to reject",type:"error"});
      }
    }catch{
      setToast({message:"Error rejecting reservation",type:"error"});
    }
  };

  const statCards=[
    {label:"Total",    count:stats.total,    filter:"ALL",      color:C.gold,               bg:C.goldFaint,           border:C.borderAccent                  },
    {label:"Pending",  count:stats.pending,  filter:"PENDING",  color:C.badgePending.color,  bg:C.statusNote.pending,  border:C.statusNoteBorder.pending  },
    {label:"Approved", count:stats.approved, filter:"APPROVED", color:C.badgeApproved.color, bg:C.statusNote.approved, border:C.statusNoteBorder.approved },
    {label:"Rejected", count:stats.rejected, filter:"REJECTED", color:C.badgeRejected.color, bg:C.statusNote.rejected, border:C.statusNoteBorder.rejected },
  ];

  const pagedReservations=filteredReservations.slice(
    (pagination.currentPage-1)*10,
    pagination.currentPage*10
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin    {to{transform:rotate(360deg);}}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes modalIn {from{opacity:0;transform:scale(0.96) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes shimmer {0%{background-position:-200% 0}100%{background-position:200% 0}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:4px;}
      `}</style>

      <div style={{minHeight:"100vh",fontFamily:F.body,background:C.pageBg,color:C.textPrimary}}>
        <AdminNavbar/>

        <div style={{display:"flex",minHeight:"100vh"}}>
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={()=>setSidebarOpen(!sidebarOpen)}
            activeNav="reservations"
          />

          {/* Main — flex:1, no hardcoded marginLeft */}
          <div style={{flex:1,minWidth:0,height:"calc(100vh - 60px)",background:C.pageBg,overflow:"auto"}}>

            {/* Top bar */}
            <div style={{
              position:"sticky",top:0,zIndex:100,
              background:C.navBg,
              backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
              borderBottom:`1px solid ${C.navBorder}`,
              padding:isMobile?"10px 16px":"0 28px",
              height:isMobile?"auto":52,
              display:"flex",alignItems:"center",
              justifyContent:"space-between",
              gap:10,flexWrap:isMobile?"wrap":"nowrap",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:F.label,fontSize:9,letterSpacing:"0.20em",color:C.gold,fontWeight:700,textTransform:"uppercase"}}>Admin</span>
                <span style={{color:C.textTertiary,fontSize:11}}>·</span>
                <span style={{fontFamily:F.label,fontSize:9,letterSpacing:"0.14em",color:C.textSecondary,fontWeight:600,textTransform:"uppercase"}}>Reservation Management</span>
              </div>
              <div style={{position:"relative"}}>
                <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke={searchFocused?C.gold:C.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  style={{
                    padding:"7px 12px 7px 28px",
                    background:C.surfaceInput,
                    border:`1.5px solid ${searchFocused?C.borderAccent:C.borderDefault}`,
                    borderRadius:8,color:C.textPrimary,
                    fontFamily:F.body,fontSize:12,
                    width:isMobile?"100%":220,outline:"none",
                    transition:"border-color 0.18s,box-shadow 0.18s",
                    boxShadow:searchFocused?C.inputFocusShadow:"none",
                  }}
                  placeholder="Search name, email or ref…"
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  onFocus={()=>setSearchFocused(true)}
                  onBlur={()=>setSearchFocused(false)}
                />
              </div>
            </div>

            {/* Content */}
            <div style={{
              padding:isMobile?"20px 16px":isTablet?"24px 20px":"28px 32px",
              animation:"fadeUp 0.28s ease",
            }}>

              {/* Heading */}
              <div style={{marginBottom:isMobile?18:22}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{display:"inline-block",width:22,height:"1px",background:C.gold,opacity:0.6}}/>
                  <span style={{fontFamily:F.label,fontSize:9,letterSpacing:"0.26em",color:C.gold,fontWeight:700,textTransform:"uppercase"}}>Dashboard</span>
                </div>
                <h1 style={{fontFamily:F.display,fontSize:isMobile?22:isTablet?28:34,fontWeight:700,color:C.textPrimary,lineHeight:1.15,margin:"0 0 6px",letterSpacing:"0.01em"}}>
                  Reservation Dashboard
                </h1>
                <p style={{fontFamily:F.body,fontSize:13,color:C.textSecondary,margin:0,lineHeight:1.65}}>
                  Manage and review all reservation requests
                </p>
              </div>

              {/* Stat cards */}
              <div style={{
                display:"grid",
                gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",
                gap:isMobile?10:12,
                marginBottom:isMobile?18:22,
              }}>
                {statCards.map(({label,count,filter,color,bg,border})=>{
                  const active=filterStatus===filter;
                  return(
                    <button key={filter} onClick={()=>setFilterStatus(filter)}
                      style={{
                        background:active?bg:C.cardBg,
                        border:`1px solid ${active?border:C.cardBorder}`,
                        borderRadius:10,
                        padding:isMobile?"14px 12px":"18px 20px",
                        textAlign:"left",cursor:"pointer",
                        transition:"all 0.18s ease",outline:"none",
                        boxShadow:active?`0 4px 18px ${color}1A`:"0 1px 4px rgba(0,0,0,0.05)",
                        transform:active?"translateY(-1px)":"translateY(0)",
                      }}
                      onMouseEnter={(e)=>{
                        if(!active){e.currentTarget.style.borderColor=border;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 18px ${color}14`;}
                      }}
                      onMouseLeave={(e)=>{
                        if(!active){e.currentTarget.style.borderColor=C.cardBorder;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.05)";}
                      }}
                    >
                      <div style={{fontFamily:F.display,fontSize:isMobile?28:36,fontWeight:700,color:color,lineHeight:1,marginBottom:isMobile?6:8,letterSpacing:"-0.02em"}}>
                        {loading?"—":count}
                      </div>
                      <div style={{fontFamily:F.label,fontSize:9,color:active?color:C.textTertiary,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",transition:"color 0.18s"}}>
                        {label}
                      </div>
                      {active&&(
                        <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:6,fontFamily:F.label,fontSize:8,fontWeight:700,color:color,letterSpacing:"0.10em",textTransform:"uppercase"}}>
                          <span style={{width:4,height:4,borderRadius:"50%",background:color}}/>
                          Active Filter
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Table card */}
              <div style={{background:C.cardBg,borderRadius:12,border:`1px solid ${C.cardBorder}`,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                {/* Card header */}
                <div style={{
                  padding:isMobile?"12px 14px":"14px 22px",
                  borderBottom:`1px solid ${C.divider}`,
                  display:"flex",alignItems:"center",
                  justifyContent:"space-between",
                  flexWrap:isMobile?"wrap":"nowrap",
                  gap:10,
                  background:C.headerGradient,
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{fontFamily:F.label,fontSize:9,letterSpacing:"0.20em",color:C.gold,fontWeight:700,textTransform:"uppercase"}}>Reservations</div>
                    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"2px 8px",background:C.goldFaint,border:`1px solid ${C.borderAccent}`,borderRadius:20,fontFamily:F.label,fontSize:9,fontWeight:700,color:C.gold,letterSpacing:"0.10em"}}>
                      {loading?"—":filteredReservations.length}
                    </span>
                    {filterStatus!=="ALL"&&(
                      <button onClick={()=>setFilterStatus("ALL")}
                        style={{background:"transparent",border:`1px solid ${C.borderDefault}`,borderRadius:6,padding:"3px 9px",fontFamily:F.label,fontSize:9,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:C.textSecondary,cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",gap:5}}
                        onMouseEnter={(e)=>{e.currentTarget.style.borderColor=C.borderAccent;e.currentTarget.style.color=C.gold;}}
                        onMouseLeave={(e)=>{e.currentTarget.style.borderColor=C.borderDefault;e.currentTarget.style.color=C.textSecondary;}}
                      >
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Clear
                      </button>
                    )}
                  </div>

                  {pagination.lastPage>1&&(
                    <div style={{display:"flex",alignItems:"center",gap:3,flexWrap:"wrap"}}>
                      <button onClick={()=>handlePageChange(pagination.currentPage-1)} disabled={pagination.currentPage<=1}
                        style={{width:29,height:29,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.borderDefault}`,borderRadius:6,background:"transparent",color:pagination.currentPage<=1?C.textTertiary:C.textSecondary,cursor:pagination.currentPage<=1?"not-allowed":"pointer",fontSize:14,transition:"all 0.15s",fontFamily:F.body}}
                        onMouseEnter={(e)=>{if(pagination.currentPage>1){e.currentTarget.style.borderColor=C.borderAccent;e.currentTarget.style.color=C.gold;}}}
                        onMouseLeave={(e)=>{e.currentTarget.style.borderColor=C.borderDefault;e.currentTarget.style.color=pagination.currentPage<=1?C.textTertiary:C.textSecondary;}}
                      >‹</button>

                      {getPageNumbers().map((p,idx)=>
                        p==="..."?(
                          <span key={`e-${idx}`} style={{width:29,height:29,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.textTertiary}}>…</span>
                        ):(
                          <button key={p} onClick={()=>handlePageChange(p)}
                            style={{width:29,height:29,display:"flex",alignItems:"center",justifyContent:"center",border:pagination.currentPage===p?`1px solid ${C.gold}`:`1px solid ${C.borderDefault}`,borderRadius:6,background:pagination.currentPage===p?C.gold:"transparent",color:pagination.currentPage===p?C.textOnAccent:C.textSecondary,cursor:"pointer",fontSize:11,fontWeight:pagination.currentPage===p?700:400,fontFamily:F.label,transition:"all 0.15s"}}
                            onMouseEnter={(e)=>{if(pagination.currentPage!==p){e.currentTarget.style.borderColor=C.borderAccent;e.currentTarget.style.color=C.gold;}}}
                            onMouseLeave={(e)=>{if(pagination.currentPage!==p){e.currentTarget.style.borderColor=C.borderDefault;e.currentTarget.style.color=C.textSecondary;}}}
                          >{p}</button>
                        )
                      )}

                      <button onClick={()=>handlePageChange(pagination.currentPage+1)} disabled={pagination.currentPage>=pagination.lastPage}
                        style={{width:29,height:29,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.borderDefault}`,borderRadius:6,background:"transparent",color:pagination.currentPage>=pagination.lastPage?C.textTertiary:C.textSecondary,cursor:pagination.currentPage>=pagination.lastPage?"not-allowed":"pointer",fontSize:14,transition:"all 0.15s",fontFamily:F.body}}
                        onMouseEnter={(e)=>{if(pagination.currentPage<pagination.lastPage){e.currentTarget.style.borderColor=C.borderAccent;e.currentTarget.style.color=C.gold;}}}
                        onMouseLeave={(e)=>{e.currentTarget.style.borderColor=C.borderDefault;e.currentTarget.style.color=pagination.currentPage>=pagination.lastPage?C.textTertiary:C.textSecondary;}}
                      >›</button>
                    </div>
                  )}
                </div>

                {/* List */}
                <div style={{padding:isMobile?"10px":"12px 18px",display:"flex",flexDirection:"column",gap:8}}>
                  {loading?(
                    Array.from({length:5}).map((_,i)=>(
                      <div key={i} style={{height:74,borderRadius:8,background:"linear-gradient(90deg,#F0EDE6 25%,#E8E4DC 50%,#F0EDE6 75%)",backgroundSize:"200% 100%",animation:`shimmer 1.4s ease infinite`,animationDelay:`${i*0.08}s`,border:`1px solid rgba(0,0,0,0.04)`}}/>
                    ))
                  ):pagedReservations.length===0?(
                    <div style={{padding:"44px 24px",textAlign:"center"}}>
                      <div style={{fontFamily:F.label,fontSize:11,fontWeight:700,letterSpacing:"0.16em",color:C.textSecondary,textTransform:"uppercase"}}>No Reservations Found</div>
                      <div style={{fontFamily:F.body,fontSize:12,color:C.textTertiary,marginTop:6}}>{search?"Try adjusting your search":"No reservations match the current filter"}</div>
                    </div>
                  ):(
                    pagedReservations.map((reservation,idx)=>(
                      <div
                        key={reservation.id}
                        onClick={()=>{setSelectedReservation(reservation);setShowModal(true);}}
                        style={{
                          background:C.surfaceBase,
                          border:`1px solid ${C.borderDefault}`,
                          borderRadius:8,
                          padding:isMobile?"12px":"14px 18px",
                          cursor:"pointer",
                          transition:"all 0.16s ease",
                          animation:`fadeUp 0.22s ease both`,
                          animationDelay:`${idx*0.025}s`,
                        }}
                        onMouseEnter={(e)=>{e.currentTarget.style.borderColor=C.borderAccent;e.currentTarget.style.boxShadow=`0 3px 12px rgba(140,107,42,0.10)`;e.currentTarget.style.transform="translateY(-1px)";}}
                        onMouseLeave={(e)=>{e.currentTarget.style.borderColor=C.borderDefault;e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}
                      >
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:isMobile?"wrap":"nowrap"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                              <div style={{fontFamily:F.body,fontSize:14,fontWeight:600,color:C.textPrimary}}>{reservation.name||"—"}</div>
                              {reservation.event_date&&(
                                <span style={{fontFamily:F.label,fontSize:9,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:C.textTertiary,padding:"2px 6px",background:"rgba(0,0,0,0.04)",border:`1px solid rgba(0,0,0,0.06)`,borderRadius:4,flexShrink:0}}>
                                  {new Date(reservation.event_date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                                </span>
                              )}
                            </div>
                            <div style={{fontFamily:F.body,fontSize:12,color:C.textSecondary,marginBottom:5,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                              <span>{reservation.email||"—"}</span>
                              {reservation.phone&&<><span style={{color:C.textTertiary}}>·</span><span>{reservation.phone}</span></>}
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                              {reservation.room&&<span style={{fontFamily:F.body,fontSize:11,color:C.textTertiary}}>{reservation.room}</span>}
                              {reservation.table_number&&<><span style={{color:C.textTertiary,fontSize:11}}>·</span><span style={{fontFamily:F.body,fontSize:11,color:C.textTertiary}}>Table {reservation.table_number}</span></>}
                            </div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:7,flexShrink:0}}>
                            <StatusBadge status={reservation.status}/>
                            <div style={{display:"flex",alignItems:"center",gap:3,fontFamily:F.label,fontSize:9,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:C.textTertiary}}>
                              View
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {!loading&&filteredReservations.length>0&&(
                  <div style={{padding:"10px 18px",borderTop:`1px solid ${C.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                    <div style={{fontFamily:F.body,fontSize:11,color:C.textTertiary}}>
                      Showing <strong style={{color:C.textSecondary}}>{(pagination.currentPage-1)*10+1}–{Math.min(pagination.currentPage*10,filteredReservations.length)}</strong> of <strong style={{color:C.textSecondary}}>{filteredReservations.length}</strong>
                    </div>
                    {filterStatus!=="ALL"&&(
                      <div style={{fontFamily:F.label,fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.textTertiary}}>
                        Filter: <span style={{color:C.gold}}>{filterStatus}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {toast&&<Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}

        {showModal&&selectedReservation&&(
          <DetailModal
            reservation={selectedReservation}
            onClose={()=>{setShowModal(false);setSelectedReservation(null);}}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </>
  );
}