import { useState } from "react";

const STATUS_CONFIG = {
  pending:   { label: "Pending",  bg: "#FFF3E0", color: "#E8A838" },
  reserved:  { label: "Approved", bg: "#E8F5EE", color: "#2E8B57" },
  available: { label: "Rejected", bg: "#FEE8E8", color: "#C0392B" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "#EEE", color: "#333" };
  return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:12, background:cfg.bg, color:cfg.color, fontFamily:"Montserrat, sans-serif", fontSize:9, fontWeight:700, letterSpacing:1.2 }}>{cfg.label}</span>;
}

function Toast({ msg, color, onDismiss }) {
  return (
    <div onClick={onDismiss} style={{ position:"fixed", bottom:28, right:28, background:"#141F30", border:`1px solid ${color}`, borderRadius:8, padding:"14px 20px", fontFamily:"Montserrat, sans-serif", fontSize:12, color:"#E8E2D4", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", display:"flex", alignItems:"center", gap:10, zIndex:999, cursor:"pointer" }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />
      {msg}
    </div>
  );
}

function DetailModal({ res, onClose, onApprove, onReject }) {
  const [confirm, setConfirm] = useState(null);

  if (confirm) {
    const isApprove = confirm === "approve";
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300 }}>
        <div style={{ background:"#FFFFFF", border:"1px solid #E1E4E8", borderRadius:12, padding:"36px 40px", width:360, maxWidth:"90vw", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:`${isApprove?"#4CAF79":"#E05252"}22`, border:`2px solid ${isApprove?"#4CAF79":"#E05252"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 16px", color:isApprove?"#4CAF79":"#E05252" }}>{isApprove?"✓":"✕"}</div>
          <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:22, color:"#1B2A4A", fontWeight:"bold", marginBottom:8 }}>{isApprove?"Confirm Reservation?":"Reject Reservation?"}</div>
          <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:12, color:"#6B7280", lineHeight:1.6, marginBottom:24 }}>{isApprove?`This will mark table as Reserved and notify ${res.name}.`:`This will release seat back to Available and notify ${res.name}.`}</div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ flex:1, padding:"12px 0", border:"1.5px solid #E1E4E8", background:"transparent", color:"#6B7280", borderRadius:6, fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:11, letterSpacing:2, cursor:"pointer" }} onClick={()=>setConfirm(null)}>CANCEL</button>
            <button style={{ flex:1, padding:"12px 0", border:"none", background:isApprove?"#4CAF79":"#E05252", color:"#fff", borderRadius:6, fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:11, letterSpacing:2, cursor:"pointer" }} onClick={()=>{isApprove?onApprove(res.id):onReject(res.id);onClose();}}>{isApprove?"APPROVE":"REJECT"}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:"#FFFFFF", border:"1px solid #E1E4E8", borderRadius:14, padding:"40px 44px", width:500, maxWidth:"90vw", boxShadow:"0 24px 80px rgba(0,0,0,0.15)", maxHeight:"90vh", overflowY:"auto", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"rgba(0,0,0,0.05)", border:"none", color:"#6B7280", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:15 }}>✕</button>
        <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:9, letterSpacing:2, color:"#1B2A4A", fontWeight:700, marginBottom:6 }}>RESERVATION DETAILS</div>
        <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:24, color:"#1B2A4A", fontWeight:"bold", marginBottom:4 }}>{res.name}</div>
        <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:11, color:"#6B7280", marginBottom:16, letterSpacing:1 }}>Ref: {res.id} · Submitted {res.submittedAt}</div>
        <StatusPill status={res.status} />

        {[["BOOKING INFORMATION",[["Room",res.room],["Table",res.table],["Seat",res.seat||"Whole Table"],["Guests",`${res.guests} guest${res.guests>1?"s":""}`],["Event Date",res.eventDate],["Event Time",res.eventTime||"Pending"],["Type",res.type==="whole"?"Whole Table":"Individual Seat"]]],["GUEST INFORMATION",[["Email",res.email],["Phone",res.phone],["Special Requests",res.specialRequests]]]].map(([section,rows])=>(
          <div key={section}>
            <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:9, letterSpacing:2, color:"#1B2A4A", fontWeight:700, margin:"20px 0 10px" }}>{section}</div>
            {rows.map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #F3F4F6", fontFamily:"Montserrat, sans-serif", fontSize:12 }}>
                <span style={{ color:"#6B7280" }}>{k}</span>
                <span style={{ color:"#1B2A4A", fontWeight:600, textAlign:"right", maxWidth:"60%" }}>{v}</span>
              </div>
            ))}
          </div>
        ))}

        {res.status === "pending" && (
          <div style={{ display:"flex", gap:10, marginTop:28 }}>
            <button style={{ flex:1, padding:"13px 0", border:"1.5px solid #E05252", background:"transparent", color:"#E05252", borderRadius:6, fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:11, letterSpacing:2, cursor:"pointer" }} onClick={()=>setConfirm("reject")}>REJECT</button>
            <button style={{ flex:1, padding:"13px 0", border:"none", background:"#2E8B57", color:"#fff", borderRadius:6, fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:11, letterSpacing:2, cursor:"pointer" }} onClick={()=>setConfirm("approve")}>APPROVE</button>
          </div>
        )}
        {res.status !== "pending" && (
          <div style={{ marginTop:24, textAlign:"center", fontFamily:"Montserrat, sans-serif", fontSize:11, color:"#3A4A6A", letterSpacing:1 }}>This reservation has already been {res.status==="reserved"?"approved":"rejected"}.</div>
        )}
      </div>
    </div>
  );
}

export { StatusPill, Toast, DetailModal };
