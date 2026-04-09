import { useState } from "react";

const STATUS_CONFIG = {
  pending:   { label: "Pending",  bg: "#FFF3E0", color: "#E8A838" },
  reserved:  { label: "Approved", bg: "#E8F5EE", color: "#2E8B57" },
  available: { label: "Rejected", bg: "#FEE8E8", color: "#C0392B" },
  rejected:  { label: "Rejected", bg: "#FEE8E8", color: "#C0392B" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "#EEE", color: "#333" };
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:12, background:cfg.bg, color:cfg.color, fontFamily:"Montserrat, sans-serif", fontSize:9, fontWeight:700, letterSpacing:1.2 }}>
      {cfg.label}
    </span>
  );
}

function Toast({ msg, color, onDismiss }) {
  return (
    <div onClick={onDismiss} style={{ position:"fixed", bottom:28, right:28, background:"#141F30", border:`1px solid ${color}`, borderRadius:8, padding:"14px 20px", fontFamily:"Montserrat, sans-serif", fontSize:12, color:"#E8E2D4", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", display:"flex", alignItems:"center", gap:10, zIndex:999, cursor:"pointer" }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />
      {msg}
    </div>
  );
}

const MIN_REASON_LENGTH = 5;

function DetailModal({ res, onClose, onApprove, onReject }) {
  const [confirm, setConfirm] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [reasonError, setReasonError] = useState("");
  const rejectionReason = res.rejectionReason || res.rejection_reason || "";
  const isWhole = res.type === "whole";

  const seatDisplay = isWhole
    ? `${res.guests}${res.tableCapacity ? ` / ${res.tableCapacity}` : ""} seats reserved`
    : (res.seat || "—");

  const typeDisplay = isWhole
    ? `Table reservation · ${res.guests} guest${res.guests !== 1 ? "s" : ""}${res.tableCapacity ? ` (${res.tableCapacity}-seat table)` : ""}`
    : "Individual Seat";

  const handleReasonChange = (e) => {
    const val = e.target.value;
    setRejectionReasonInput(val);
    if (reasonError && val.trim().length >= MIN_REASON_LENGTH) {
      setReasonError("");
    }
  };

  const handleRejectConfirm = () => {
    const reason = rejectionReasonInput.trim();

    if (!reason) {
      setReasonError("A rejection reason is required.");
      return;
    }
    if (reason.length < MIN_REASON_LENGTH) {
      setReasonError(`Reason must be at least ${MIN_REASON_LENGTH} characters.`);
      return;
    }

    onReject(res.id, reason);
    onClose();
  };

  const reasonTrimmed    = rejectionReasonInput.trim();
  const reasonIsValid    = reasonTrimmed.length >= MIN_REASON_LENGTH;
  const charsRemaining   = MIN_REASON_LENGTH - reasonTrimmed.length;

  if (confirm) {
    const isApprove = confirm === "approve";
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300 }}>
        <div style={{ background:"#FFFFFF", border:"1px solid rgba(201,168,76,0.3)", borderRadius:12, padding:"36px 40px", width:420, maxWidth:"90vw", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:`${isApprove?"#4CAF79":"#E05252"}22`, border:`2px solid ${isApprove?"#4CAF79":"#E05252"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 16px", color:isApprove?"#4CAF79":"#E05252" }}>{isApprove?"✓":"✕"}</div>
          <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:22, color:"#1B2A4A", fontWeight:"bold", marginBottom:8 }}>{isApprove?"Confirm Reservation?":"Reject Reservation?"}</div>
          <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:12, color:"#666666", lineHeight:1.6, marginBottom:18 }}>{isApprove?`This will mark table as Reserved and notify ${res.name}.`:`This will release seat back to Available and notify ${res.name}.`}</div>
          {!isApprove && (
            <div style={{ textAlign:"left", marginBottom:18 }}>
              <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:10, letterSpacing:1.5, color:"#6C757D", fontWeight:700, marginBottom:8, textTransform:"uppercase" }}>Reason for rejection</div>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                rows={4}
                placeholder="Describe why this reservation is being rejected"
                style={{ width:"100%", resize:"vertical", padding:"12px 14px", borderRadius:8, border:"1px solid #D1D5DB", fontFamily:"Montserrat, sans-serif", fontSize:12, color:"#1B2A4A", outline:"none", boxSizing:"border-box" }}
              />
            </div>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ flex:1, padding:"12px 0", border:"1.5px solid #CCCCCC", background:"transparent", color:"#666666", borderRadius:6, fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:11, letterSpacing:2, cursor:"pointer" }} onClick={()=>setConfirm(null)}>CANCEL</button>
            <button
              style={{ flex:1, padding:"12px 0", border:"none", background:isApprove?"#4CAF79":"#E05252", color:"#fff", borderRadius:6, fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:11, letterSpacing:2, cursor:"pointer" }}
              onClick={()=>{
                if (isApprove) {
                  onApprove(res.id);
                  onClose();
                  return;
                }

                const reason = rejectionReasonInput.trim();
                if (!reason) return;

                onReject(res.id, reason);
                onClose();
              }}
              disabled={!isApprove && !rejectionReasonInput.trim()}
            >
              {isApprove?"APPROVE":"REJECT"}
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:"#FFFFFF", border:"1px solid rgba(201,168,76,0.3)", borderRadius:14, padding:"40px 44px", width:500, maxWidth:"90vw", boxShadow:"0 24px 80px rgba(0,0,0,0.6)", maxHeight:"90vh", overflowY:"auto", position:"relative" }}>

        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"rgba(0,0,0,0.08)", border:"none", color:"#666666", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:15 }}>✕</button>

        <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:9, letterSpacing:2, color:"#C9A84C", fontWeight:700, marginBottom:6 }}>RESERVATION DETAILS</div>
        <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:24, color:"#1B2A4A", fontWeight:"bold", marginBottom:4 }}>{res.name}</div>
        <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:11, color:"#666666", marginBottom:16, letterSpacing:1 }}>
          Ref: {res.id} · Submitted {res.submittedAt}
        </div>
        <StatusPill status={res.status} />

        {[
          ["BOOKING INFORMATION", [
            ["Room",        res.room],
            ["Table",       res.table],
            ["Seat(s)",     seatDisplay],
            ["Guests",      `${res.guests} guest${res.guests > 1 ? "s" : ""}`],
            ["Event Date",  res.eventDate],
            ["Event Time",  res.eventTime
              ? (() => {
                  const [hours, minutes] = res.eventTime.split(":");
                  const hour24 = parseInt(hours) || 0;
                  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                  const period = hour24 < 12 ? "am" : "pm";
                  return `${hour12}:${minutes || "00"}${period}`;
                })()
              : "Pending"],
            ["Type",        typeDisplay],
          ]],
          ["GUEST INFORMATION", [
            ["Email",            res.email],
            ["Phone",            res.phone],
            ["Special Requests", res.specialRequests],
          ]],
        ].map(([section, rows]) => (
          <div key={section}>
            <div style={{ fontFamily:"Montserrat, sans-serif", fontSize:9, letterSpacing:2, color:"#C9A84C", fontWeight:700, margin:"20px 0 10px" }}>{section}</div>
            {rows.map(([k, v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(0,0,0,0.08)", fontFamily:"Montserrat, sans-serif", fontSize:12 }}>
                <span style={{ color:"#666666" }}>{k}</span>
                <span style={{ color:"#1B2A4A", fontWeight:600, textAlign:"right", maxWidth:"60%" }}>{v}</span>
              </div>
            ))}
          </div>
        ))}

        {res.status === "rejected" && rejectionReason && (
          <div style={{ marginTop:18, padding:"14px 16px", borderRadius:10, background:"#FEF2F2", border:"1px solid rgba(224,82,82,0.2)", fontFamily:"Montserrat, sans-serif", fontSize:12, color:"#9B1C1C", lineHeight:1.6 }}>
            <div style={{ fontSize:9, letterSpacing:2, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Rejection Reason</div>
            <div>{rejectionReason}</div>
          </div>
        )}

        {res.status === "pending" && (
          <div style={{ display:"flex", gap:10, marginTop:28 }}>
            <button
              style={{ flex:1, padding:"13px 0", border:"1.5px solid #E05252", background:"transparent", color:"#E05252", borderRadius:6, fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:11, letterSpacing:2, cursor:"pointer" }}
              onClick={() => { setConfirm("reject"); setReasonError(""); setRejectionReasonInput(""); }}
            >
              REJECT
            </button>
            <button
              style={{ flex:1, padding:"13px 0", border:"none", background:"#2E8B57", color:"#fff", borderRadius:6, fontFamily:"Montserrat, sans-serif", fontWeight:700, fontSize:11, letterSpacing:2, cursor:"pointer" }}
              onClick={() => setConfirm("approve")}
            >
              APPROVE
            </button>
          </div>
        )}

        {res.status !== "pending" && (
          <div style={{ marginTop:24, textAlign:"center", fontFamily:"Montserrat, sans-serif", fontSize:11, color:"#3A4A6A", letterSpacing:1 }}>
            This reservation has already been {res.status === "reserved" ? "approved" : "rejected"}.
          </div>
        )}

      </div>
    </div>
  );
}

export { StatusPill, Toast, DetailModal };