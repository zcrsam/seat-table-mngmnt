// SeatMap.jsx
// View:  <SeatMap tables={tables} mode="whole|individual" selectedSeat={s} onSeatClick={fn} onTableClick={fn} windowWidth={w} />
// Edit:  <SeatMap tables={tables} editMode={true} onTablesChange={fn} windowWidth={w} wing="Main Wing" room="Alabang Function Room" />

import { useState, useRef, useEffect, useCallback } from "react";
import { dispatchSeatMapUpdate } from "../../utils/seatMapPersistence";

// ─── TOKENS ───────────────────────────────────────────────────────────────────
export const STATUS_COLORS  = { available:"#4CAF79", pending:"#E8A838", reserved:"#E05252" };
export const STATUS_LABELS  = { available:"OPEN",    pending:"WAITLIST", reserved:"SOLD"   };
const STATUS_CYCLE = { available:"pending", pending:"reserved", reserved:"available" };
const SEAT_W = 40, SEAT_H = 40;
const SNAP   = 8;
const MIN_TW = 60, MIN_TH = 48;

function uid() { return "u" + Math.random().toString(36).slice(2,9); }
function snap(v) { return Math.round(v / SNAP) * SNAP; }

// ─── FONT IMPORT (injected once) ─────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    if (document.getElementById("seatmap-fonts")) return;
    const l = document.createElement("link");
    l.id   = "seatmap-fonts";
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
  }, []);
}

// ─── HYDRATION ────────────────────────────────────────────────────────────────
function hydrateTable(t, tableIndex = 0) {
  const seats = t.seats || [];
  const left   = seats.filter(s => s.pos === "left")  .sort((a,b) => b.num - a.num);
  const right  = seats.filter(s => s.pos === "right") .sort((a,b) => b.num - a.num);
  const bottom = seats.filter(s => s.pos === "bottom").sort((a,b) => a.num - b.num);
  const top    = seats.filter(s => s.pos === "top")   .sort((a,b) => a.num - b.num);

  const rowCount = Math.max(left.length, right.length, 1);
  const tW = typeof t.width  === "number" ? t.width  : 80;
  const tH = typeof t.height === "number" ? t.height : rowCount * (SEAT_H + 6);

  const seats = t.seats.map(s => {
    if (typeof s.x === "number") return s;
    let x = 0, y = 0;
    const ROW_H = SEAT_H + 6;
    if (s.pos === "left") {
      const idx = left.findIndex(l => l.id === s.id);
      x = -(SEAT_W + 8);
      y = idx * ROW_H + Math.max(0, (tH - left.length * ROW_H) / 2);
    } else if (s.pos === "right") {
      const idx = right.findIndex(r => r.id === s.id);
      x = tW + 8;
      y = idx * ROW_H + Math.max(0, (tH - right.length * ROW_H) / 2);
    } else if (s.pos === "bottom") {
      const idx = bottom.findIndex(b => b.id === s.id);
      x = idx * (SEAT_W + 6) + Math.max(0, (tW - bottom.length * (SEAT_W + 6)) / 2);
      y = tH + 8;
    } else if (s.pos === "top") {
      const idx = top.findIndex(tp => tp.id === s.id);
      x = idx * (SEAT_W + 6) + Math.max(0, (tW - top.length * (SEAT_W + 6)) / 2);
      y = -(SEAT_H + 8);
    }
    return { ...s, x, y };
  });

  return {
    ...t,
    x:      typeof t.x === "number" ? t.x : 140 + tableIndex * 220,
    y:      typeof t.y === "number" ? t.y : 80,
    width:  tW,
    height: tH,
    seats,
  };
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
const F = { display:"'DM Serif Display', Georgia, serif", body:"'DM Sans', sans-serif" };

function Modal({ children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(27,42,74,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:4000, backdropFilter:"blur(3px)" }}>
      {children}
    </div>
  );
}

function AddSeatModal({ existingNums, onConfirm, onCancel }) {
  const [num, setNum]       = useState("");
  const [status, setStatus] = useState("available");
  const taken = existingNums.includes(parseInt(num));
  const ok    = num && !isNaN(num) && parseInt(num) > 0 && !taken;

  return (
    <Modal>
      <div style={{ background:"#FDFAF5", borderRadius:16, padding:"36px 40px", width:340, maxWidth:"92vw", boxShadow:"0 32px 80px rgba(27,42,74,0.22)", fontFamily:F.body }}>
        <p style={{ fontFamily:F.display, fontSize:22, color:"#1B2A4A", margin:"0 0 4px" }}>Add New Seat</p>
        <p style={{ fontSize:11, letterSpacing:2, color:"#C9A84C", fontWeight:700, margin:"0 0 24px", textTransform:"uppercase", fontFamily:F.body }}>Edit Mode</p>

        <label style={{ display:"block", fontSize:10, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:6, textTransform:"uppercase", fontFamily:F.body }}>Seat Number</label>
        <input type="number" value={num} onChange={e=>setNum(e.target.value)} min="1" autoFocus
          style={{ width:"100%", padding:"10px 14px", border:`1.5px solid ${taken?"#E05252":"#DDD"}`, borderRadius:8, fontFamily:F.body, fontSize:15, marginBottom:taken?4:18, boxSizing:"border-box", outline:"none", background:"#fff" }} />
        {taken && <p style={{ color:"#E05252", fontSize:11, margin:"0 0 14px", fontFamily:F.body }}>Number already used.</p>}

        <label style={{ display:"block", fontSize:10, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:8, textTransform:"uppercase", fontFamily:F.body }}>Initial Status</label>
        <div style={{ display:"flex", gap:8, marginBottom:28 }}>
          {Object.entries(STATUS_COLORS).map(([st,col]) => (
            <button key={st} onClick={()=>setStatus(st)} style={{ flex:1, padding:"8px 0", border:`2px solid ${status===st?col:"#E8E3DC"}`, background:status===st?col:"#fff", color:status===st?"#fff":"#AAA", borderRadius:8, fontFamily:F.body, fontSize:10, fontWeight:700, cursor:"pointer", textTransform:"capitalize", transition:"all 0.15s" }}>{st}</button>
          ))}
        </div>
        <p style={{ fontFamily:F.body, fontSize:10, color:"#BBB", margin:"0 0 20px", lineHeight:1.5 }}>Seat will appear at center of selected table. Drag it into position.</p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"12px 0", border:"1.5px solid #DDD", background:"#fff", color:"#888", borderRadius:8, fontFamily:F.body, fontWeight:700, fontSize:12, cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>ok&&onConfirm({id:uid(),num:parseInt(num),status,x:0,y:0})} disabled={!ok}
            style={{ flex:1, padding:"12px 0", border:"none", background:ok?"#1B2A4A":"#E0D9CC", color:ok?"#fff":"#AAA", borderRadius:8, fontFamily:F.body, fontWeight:700, fontSize:12, cursor:ok?"pointer":"default" }}>Add Seat</button>
        </div>
      </div>
    </Modal>
  );
}

function AddTableModal({ onConfirm, onCancel }) {
  const [tid,   setTid]   = useState("");
  const [label, setLabel] = useState("");
  const [rows,  setRows]  = useState(4);
  const ok = tid.trim() && label.trim();

  return (
    <Modal>
      <div style={{ background:"#FDFAF5", borderRadius:16, padding:"36px 40px", width:360, maxWidth:"92vw", boxShadow:"0 32px 80px rgba(27,42,74,0.22)", fontFamily:F.body }}>
        <p style={{ fontFamily:F.display, fontSize:22, color:"#1B2A4A", margin:"0 0 4px" }}>Add New Table</p>
        <p style={{ fontSize:11, letterSpacing:2, color:"#C9A84C", fontWeight:700, margin:"0 0 24px", textTransform:"uppercase", fontFamily:F.body }}>Edit Mode</p>

        <label style={{ display:"block", fontSize:10, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:6, textTransform:"uppercase", fontFamily:F.body }}>Table ID</label>
        <input value={tid} onChange={e=>setTid(e.target.value.toUpperCase())} placeholder="T2" autoFocus
          style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #DDD", borderRadius:8, fontFamily:F.body, fontSize:15, marginBottom:16, boxSizing:"border-box", outline:"none", background:"#fff" }} />

        <label style={{ display:"block", fontSize:10, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:6, textTransform:"uppercase", fontFamily:F.body }}>Label</label>
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Table 2"
          style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #DDD", borderRadius:8, fontFamily:F.body, fontSize:15, marginBottom:16, boxSizing:"border-box", outline:"none", background:"#fff" }} />

        <label style={{ display:"block", fontSize:10, letterSpacing:1.5, color:"#999", fontWeight:700, marginBottom:10, textTransform:"uppercase", fontFamily:F.body }}>Seat Rows</label>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
          <button onClick={()=>setRows(r=>Math.max(1,r-1))} style={{ width:34,height:34,borderRadius:"50%",border:"2px solid #C9A84C",background:"#fff",color:"#C9A84C",fontSize:18,cursor:"pointer",fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.body }}>−</button>
          <span style={{ fontFamily:F.display, fontSize:32, color:"#1B2A4A", minWidth:32, textAlign:"center", lineHeight:1 }}>{rows}</span>
          <button onClick={()=>setRows(r=>Math.min(12,r+1))} style={{ width:34,height:34,borderRadius:"50%",border:"2px solid #C9A84C",background:"#fff",color:"#C9A84C",fontSize:18,cursor:"pointer",fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.body }}>+</button>
          <span style={{ fontSize:11, color:"#AAA", fontFamily:F.body }}>{rows*2} seats total</span>
        </div>
        <p style={{ fontSize:10, color:"#BBB", margin:"0 0 24px", lineHeight:1.6, fontFamily:F.body }}>Creates {rows*2} seats (left & right). Drag into any position after.</p>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"12px 0", border:"1.5px solid #DDD", background:"#fff", color:"#888", borderRadius:8, fontFamily:F.body, fontWeight:700, fontSize:12, cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>{
            if(!ok) return;
            const tW=80, ROW_H=SEAT_H+6;
            const tH=rows*ROW_H;
            const seats=[];
            for(let i=0;i<rows;i++){
              seats.push({id:uid(),num:i*2+1,pos:"left", status:"available",x:-(SEAT_W+8),y:i*ROW_H});
              seats.push({id:uid(),num:i*2+2,pos:"right",status:"available",x:tW+8,       y:i*ROW_H});
            }
            onConfirm({id:tid.trim(),label:label.trim(),tableStatus:"available",capacity:rows*2,x:100,y:80,width:tW,height:tH,seats});
          }} disabled={!ok}
            style={{ flex:1, padding:"12px 0", border:"none", background:ok?"#1B2A4A":"#E0D9CC", color:ok?"#fff":"#AAA", borderRadius:8, fontFamily:F.body, fontWeight:700, fontSize:12, cursor:ok?"pointer":"default" }}>Create Table</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── CONTROL BAR (below the map) ─────────────────────────────────────────────
function ControlBar({ onAddTable, onAddSeat, selTableId, selSeatId, tables, onDeleteSeat, onDeleteTable, onStatusChange, onDeselect, onSave, saved }) {
  const selTable = tables.find(t=>t.id===selTableId);
  const selSeat  = selTable?.seats.find(s=>s.id===selSeatId);
  const hasSelT  = !!selTableId;
  const hasSelS  = !!selSeatId;

  const Btn = ({label, icon, onClick, disabled, variant="dark"}) => {
    const bgs = { dark:"#1B2A4A", gold:"#C9A84C", green:"#3D9E6A", danger:"#D94040" };
    const bg  = bgs[variant] || bgs.dark;
    return (
      <button onClick={onClick} disabled={disabled} style={{
        display:"flex", alignItems:"center", gap:7,
        padding:"9px 18px",
        background: disabled ? "#E8E3DC" : bg,
        color: disabled ? "#B8B0A6" : "#fff",
        border:"none", borderRadius:10,
        fontFamily:F.body, fontWeight:600, fontSize:12,
        cursor: disabled ? "default" : "pointer",
        transition:"all 0.15s",
        whiteSpace:"nowrap", letterSpacing:0.2,
        boxShadow: disabled ? "none" : `0 3px 10px ${bg}55`,
      }}>
        {icon && <span style={{fontSize:15, lineHeight:1}}>{icon}</span>}
        {label}
      </button>
    );
  };

  return (
    <div style={{ background:"#1B2A4A", borderRadius:"0 0 14px 14px", padding:"16px 20px 18px", fontFamily:F.body }}>

      {/* Action buttons row */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <Btn icon="＋" label="Add Table" variant="green"  onClick={onAddTable} />
        <Btn icon="＋" label="Add Seat"  variant="gold"   onClick={onAddSeat}  disabled={!hasSelT} />
        <div style={{ width:1, height:26, background:"rgba(255,255,255,0.08)", margin:"0 2px" }} />
        <Btn icon="✕" label="Delete Seat"  variant="danger" onClick={onDeleteSeat}  disabled={!hasSelS} />
        <Btn icon="✕" label="Delete Table" variant="danger" onClick={onDeleteTable} disabled={!hasSelT} />
        <div style={{ flex:1 }} />
        {/* ── SAVE BUTTON ── */}
        <button onClick={onSave} style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"9px 22px",
          background:"#C9A84C", color:"#1B2A4A",
          border:"none", borderRadius:10,
          fontFamily:F.body, fontWeight:700, fontSize:12,
          cursor:"pointer", letterSpacing:0.5,
          boxShadow:"0 3px 10px rgba(201,168,76,0.4)",
          transition:"all 0.15s",
        }}>
          <span style={{fontSize:14}}>💾</span> Save & Publish
        </button>
        {(hasSelT||hasSelS) && (
          <button onClick={onDeselect} style={{ padding:"8px 14px", background:"transparent", color:"rgba(255,255,255,0.35)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, fontFamily:F.body, fontSize:11, cursor:"pointer", letterSpacing:0.3 }}>
            Deselect
          </button>
        )}
      </div>

      {/* Save status */}
      <div style={{ marginTop:8, minHeight:18 }}>
        {saved && (
          <div style={{ display:"flex", alignItems:"center", gap:6, color:"#4CAF79", fontFamily:F.body, fontSize:11, fontWeight:600, letterSpacing:0.5 }}>
            <span style={{ fontSize:14 }}>✓</span> Saved & published
          </div>
        )}
      </div>

      {/* Context status panel */}
      {(hasSelT || hasSelS) && (
        <div style={{ marginTop:14, padding:"13px 16px", background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <span style={{ fontFamily:F.display, fontSize:16, color:"#C9A84C" }}>
              {selSeat ? `Seat ${selSeat.num}` : selTable?.label}
            </span>
            {selTable && !selSeat && (
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)", fontFamily:F.body }}>
                {selTable.width}×{selTable.height}px · {selTable.seats.length} seats
              </span>
            )}
            <div style={{ display:"flex", gap:7, alignItems:"center" }}>
              <span style={{ fontSize:9, letterSpacing:1.5, color:"rgba(255,255,255,0.3)", fontWeight:700, textTransform:"uppercase", fontFamily:F.body }}>Status</span>
              {Object.entries(STATUS_COLORS).map(([st,col]) => {
                const active = selSeat ? selSeat.status===st : selTable?.tableStatus===st;
                return (
                  <button key={st} onClick={()=>onStatusChange(selSeat?"seat":"table", st)}
                    style={{ padding:"5px 13px", border:`2px solid ${active?col:"rgba(255,255,255,0.1)"}`, background:active?col:"transparent", color:active?"#fff":"rgba(255,255,255,0.4)", borderRadius:20, fontFamily:F.body, fontSize:10, fontWeight:700, cursor:"pointer", textTransform:"capitalize", transition:"all 0.15s" }}>{st}</button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      <p style={{ margin:"12px 0 0", fontFamily:F.body, fontSize:10, color:"rgba(255,255,255,0.2)", lineHeight:1.6, letterSpacing:0.2 }}>
        {hasSelS
          ? "Drag seat freely to reposition · Click it again to cycle status"
          : hasSelT
          ? "Drag table to move · Drag edge handles ◢ to resize width/height · Press Save & Publish when done"
          : "Click a table or seat to select it · Then drag to move or resize · Press Save & Publish when done"
        }
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SeatMap({
  tableData,
  tables: tablesProp,
  mode = "whole",
  selectedSeat: selectedSeatProp,
  onSeatClick,
  onTableClick,
  windowWidth = 1024,
  editMode = false,
  onTablesChange,
  onUpdate,
  wing = "Main Wing",
  room = "Alabang Function Room",
}) {
  useFonts();

  const rawTables = tablesProp ? tablesProp : tableData ? [tableData] : [];
  
  // Add debugging and fallback for empty data
  if (!rawTables || rawTables.length === 0) {
    console.warn('SeatMap: No table data provided, showing empty state');
    return (
      <div style={{ display:"flex", flexDirection:"column", fontFamily:F.body }}>
        <div style={{ background:"linear-gradient(to bottom,#F5E6D3,#E8D5B7)", borderRadius:"10px 10px 0 0", height:40, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, letterSpacing:4, color:"#8B7355", fontFamily:F.body, fontWeight:700, textTransform:"uppercase", opacity:0.55 }}>
          SCREEN
        </div>
        <div style={{ background:"#EFEAD9", borderRadius:"0 0 10px 10px", width:"100%", height:400, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
          <span style={{ fontFamily:F.display, fontSize:22, color:"rgba(201,168,76,0.3)" }}>No table data available</span>
          <span style={{ fontFamily:F.body, fontSize:11, color:"rgba(139,115,85,0.35)" }}>Please check your data source</span>
        </div>
        <div style={{ padding:"8px 4px 0", fontFamily:F.body, fontSize:9, letterSpacing:2, color:"#C9A84C", fontWeight:600, opacity:0.45, textTransform:"uppercase" }}>
          Entrance / Exit
        </div>
      </div>
    );
  }
  
  const [tables, setTables] = useState(() => {
    try {
      return rawTables.map((t,i) => {
        console.log('Processing table:', t);
        return hydrateTable(t,i);
      });
    } catch (error) {
      console.error('Error hydrating tables:', error);
      return [];
    }
  });
  const [selTableId, setSelTableId] = useState(null);
  const [selSeatId,  setSelSeatId]  = useState(null);
  const [showAddSeat,  setShowAddSeat]  = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [saved,        setSaved]        = useState(false);

  const dragRef  = useRef(null);
  const canvasRef = useRef(null);

  // ── Save & Publish ────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    // Save each table separately (or the first table if single-table mode)
    const dataToSave = tables.length === 1 ? tables[0] : tables;
    dispatchSeatMapUpdate(wing, room, dataToSave);
    setSaved(true);
    // Auto-hide the "saved" badge after 3s
    setTimeout(() => setSaved(false), 3000);
  }, [tables, wing, room]);

  const push = useCallback((next) => {
    setTables(next);
    onTablesChange?.(next);
    if (onUpdate) onUpdate(next[0]);
    setSaved(false); // mark as unsaved when changes made
  }, [onTablesChange, onUpdate]);

  // ── Global mouse move / up for drag + resize ──────────────────────────────
  useEffect(() => {
    if (!editMode) return;
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      setTables(prev => prev.map(t => {
        if (t.id !== d.tableId) return t;
        if (d.type === "table") {
          return { ...t, x: snap(d.ox+dx), y: snap(Math.max(0, d.oy+dy)) };
        }
        if (d.type === "seat") {
          return { ...t, seats: t.seats.map(s =>
            s.id !== d.seatId ? s : { ...s, x: snap(d.ox+dx), y: snap(d.oy+dy) }
          )};
        }
        if (d.type === "resize") {
          const { edge } = d;
          let nx=t.x, nw=t.width, nh=t.height;
          if (edge.includes("e")) nw = Math.max(MIN_TW, snap(d.ow+dx));
          if (edge.includes("s")) nh = Math.max(MIN_TH, snap(d.oh+dy));
          if (edge.includes("w")) {
            const w2 = Math.max(MIN_TW, snap(d.ow-dx));
            nx = snap(d.ox+(d.ow-w2));
            nw = w2;
          }
          return { ...t, x:nx, width:nw, height:nh };
        }
        return t;
      }));
    };
    const onUp = () => {
      if (dragRef.current) {
        setTables(prev => { onTablesChange?.(prev); return prev; });
        dragRef.current = null;
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [editMode, onTablesChange]);

  const startDrag = (e, type, tableId, seatId=null, edge=null) => {
    if (!editMode) return;
    e.stopPropagation(); e.preventDefault();
    const t = tables.find(t=>t.id===tableId);
    const s = seatId ? t?.seats.find(s=>s.id===seatId) : null;
    dragRef.current = {
      type, tableId, seatId, edge,
      startX: e.clientX, startY: e.clientY,
      ox: type==="seat" ? (s?.x||0) : t.x,
      oy: type==="seat" ? (s?.y||0) : t.y,
      ow: t.width, oh: t.height,
    };
    if (type==="table") { setSelTableId(tableId); setSelSeatId(null); }
    if (type==="seat")  { setSelTableId(tableId); setSelSeatId(seatId); }
  };

  // ── Seat click: select first, second click cycles status ──────────────────
  const handleSeatClick = useCallback((e, tableId, seatId) => {
    e.stopPropagation();
    if (editMode) {
      if (selTableId===tableId && selSeatId===seatId) {
        push(tables.map(t => t.id!==tableId ? t : {
          ...t, seats: t.seats.map(s => s.id!==seatId ? s : { ...s, status:STATUS_CYCLE[s.status] })
        }));
      } else { setSelTableId(tableId); setSelSeatId(seatId); }
    } else if (mode==="individual") {
      const seat = tables.find(t=>t.id===tableId)?.seats.find(s=>s.id===seatId);
      if (seat?.status==="available") onSeatClick?.(seat);
    }
  }, [editMode, selTableId, selSeatId, tables, push, mode, onSeatClick]);

  const handleStatusChange = (type, st) => {
    if (type==="seat")  push(tables.map(t => t.id!==selTableId?t:{ ...t, seats:t.seats.map(s=>s.id!==selSeatId?s:{...s,status:st}) }));
    else                push(tables.map(t => t.id!==selTableId?t:{ ...t, tableStatus:st }));
  };

  const addSeat  = (sd) => {
    const t = tables.find(t=>t.id===selTableId); if (!t) return;
    const cx=t.width/2-SEAT_W/2, cy=t.height/2-SEAT_H/2;
    push(tables.map(tbl => tbl.id!==selTableId?tbl:{ ...tbl, seats:[...tbl.seats,{...sd,x:cx,y:cy}] }));
    setShowAddSeat(false);
  };
  const addTable = (td) => {
    push([...tables, td]);
    setSelTableId(td.id); setSelSeatId(null);
    setShowAddTable(false);
  };
  const deleteSeat  = () => { if(!selSeatId) return; push(tables.map(t=>t.id!==selTableId?t:{...t,seats:t.seats.filter(s=>s.id!==selSeatId)})); setSelSeatId(null); };
  const deleteTable = () => { if(!selTableId) return; push(tables.filter(t=>t.id!==selTableId)); setSelTableId(null); setSelSeatId(null); };

  // ── Shared seat dot ────────────────────────────────────────────────────────
  const SeatDot = ({ seat, tableId }) => {
    const isSel   = editMode && selTableId===tableId && selSeatId===seat.id;
    const viewSel = !editMode && selectedSeatProp?.id===seat.id;
    const clickable = !editMode && mode==="individual" && seat.status==="available";
    return (
      <div
        onMouseDown={editMode ? (e)=>startDrag(e,"seat",tableId,seat.id) : undefined}
        onClick={(e)=>handleSeatClick(e,tableId,seat.id)}
        style={{
          position:"absolute", left:seat.x, top:seat.y,
          width:SEAT_W, height:SEAT_H, borderRadius:8,
          background:(isSel||viewSel)?"#1B2A4A":STATUS_COLORS[seat.status],
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:F.body, fontWeight:700, fontSize:13, color:"#fff",
          cursor: editMode?"grab":(clickable?"pointer":"default"),
          border:(isSel||viewSel)?"2px solid #C9A84C":"2px solid rgba(255,255,255,0.22)",
          boxShadow:(isSel||viewSel)
            ?"0 0 0 3px rgba(201,168,76,0.35), 0 4px 14px rgba(0,0,0,0.18)"
            :"0 2px 7px rgba(0,0,0,0.14)",
          zIndex:isSel?30:20, userSelect:"none",
          transition:"box-shadow 0.12s, border 0.12s",
        }}
      >
        {seat.num}
        {editMode && <div style={{ position:"absolute", top:-3, right:-3, width:8, height:8, borderRadius:"50%", background:isSel?"#C9A84C":"rgba(255,255,255,0.55)", border:"1.5px solid rgba(0,0,0,0.08)" }} />}
      </div>
    );
  };

  // ── Resize handle ─────────────────────────────────────────────────────────
  const RHandle = ({ tableId, edge, style: s }) => (
    <div
      onMouseDown={(e)=>{ e.stopPropagation(); startDrag(e,"resize",tableId,null,edge); }}
      title={`Resize (${edge})`}
      style={{
        position:"absolute", background:"rgba(201,168,76,0.85)", borderRadius:edge==="se"?4:3,
        cursor:edge==="se"?"nwse-resize":edge==="e"||edge==="w"?"ew-resize":"ns-resize",
        zIndex:40, transition:"opacity 0.15s", ...s,
      }}
    />
  );

  // ── Auto canvas height for view mode ──────────────────────────────────────
  const canvasH = editMode ? 520 : (() => {
    let h = 260;
    tables.forEach(t => {
      t.seats.forEach(s => { h = Math.max(h, t.y + s.y + SEAT_H + 56); });
      h = Math.max(h, t.y + t.height + 56);
    });
    return h;
  })();

  // Fallback for empty tables after processing
  if (!tables || tables.length === 0) {
    return (
      <div style={{ display:"flex", flexDirection:"column", fontFamily:F.body }}>
        <div style={{ background:"linear-gradient(to bottom,#F5E6D3,#E8D5B7)", borderRadius:"10px 10px 0 0", height:40, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, letterSpacing:4, color:"#8B7355", fontFamily:F.body, fontWeight:700, textTransform:"uppercase", opacity:0.55 }}>
          SCREEN
        </div>
        <div style={{ background:"#EFEAD9", borderRadius:"0 0 10px 10px", width:"100%", height:400, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
          <span style={{ fontFamily:F.display, fontSize:22, color:"rgba(201,168,76,0.3)" }}>No tables to display</span>
          <span style={{ fontFamily:F.body, fontSize:11, color:"rgba(139,115,85,0.35)" }}>Try adding a table or check data format</span>
        </div>
        <div style={{ padding:"8px 4px 0", fontFamily:F.body, fontSize:9, letterSpacing:2, color:"#C9A84C", fontWeight:600, opacity:0.45, textTransform:"uppercase" }}>
          Entrance / Exit
        </div>
      </div>
    );
  }

  // ── Shared canvas content ─────────────────────────────────────────────────
  const canvasContent = tables.map(table => {
    const isSelT = editMode && selTableId===table.id;
    const tableColor = isSelT
      ? "#B8932C"
      : table.tableStatus==="available"?"#C9A84C"
      : table.tableStatus==="reserved"?"#E05252"
      : "#E8A838";

    return (
      <div key={table.id} style={{ position:"absolute", left:table.x, top:table.y, userSelect:"none" }}>
        {table.seats.map(seat => <SeatDot key={seat.id} seat={seat} tableId={table.id} />)}
        <div
          onMouseDown={editMode?(e)=>startDrag(e,"table",table.id):undefined}
          onClick={(e)=>{
            e.stopPropagation();
            if (editMode) { setSelTableId(id=>id===table.id?null:table.id); setSelSeatId(null); }
            else if (mode==="whole") onTableClick?.(table.id);
          }}
          style={{
            position:"absolute", left:0, top:0,
            width:table.width, height:table.height,
            background:tableColor, borderRadius:10,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            cursor:editMode?"grab":(mode==="whole"?"pointer":"default"),
            border:isSelT?"2px solid #C9A84C":"2px solid rgba(255,255,255,0.28)",
            boxShadow:isSelT
              ?"0 0 0 4px rgba(201,168,76,0.22), 0 6px 24px rgba(0,0,0,0.17)"
              :(mode==="whole"?"0 4px 20px rgba(201,168,76,0.3)":"0 2px 10px rgba(0,0,0,0.1)"),
            zIndex:15, userSelect:"none",
            transition:"box-shadow 0.14s, border 0.14s",
          }}
        >
          <span style={{ fontFamily:F.display, fontSize:18, color:"#1B2A4A", pointerEvents:"none" }}>{table.id}</span>
          <span style={{ fontFamily:F.body, fontSize:10, color:"rgba(27,42,74,0.7)", letterSpacing:1, marginTop:2, pointerEvents:"none" }}>{table.label}</span>

          {isSelT && <>
            <RHandle tableId={table.id} edge="e"  style={{ right:-5,  top:14, bottom:14, width:10 }} />
            <RHandle tableId={table.id} edge="w"  style={{ left:-5,   top:14, bottom:14, width:10 }} />
            <RHandle tableId={table.id} edge="s"  style={{ bottom:-5, left:14, right:14, height:10 }} />
            <RHandle tableId={table.id} edge="se" style={{ right:-6,  bottom:-6, width:14, height:14 }} />
          </>}
        </div>
      </div>
    );
  });

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", fontFamily:F.body }}>

      {/* SCREEN BAR — identical in both modes */}
      <div style={{ background:"linear-gradient(to bottom,#F5E6D3,#E8D5B7)", borderRadius:"10px 10px 0 0", height:40, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, letterSpacing:4, color:"#8B7355", fontFamily:F.body, fontWeight:700, textTransform:"uppercase", opacity:0.55, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
        SCREEN
      </div>

      {/* CANVAS — identical background in both modes */}
      <div
        ref={editMode ? canvasRef : undefined}
        onClick={editMode ? (e)=>{ if(e.target===canvasRef.current){setSelTableId(null);setSelSeatId(null);} } : undefined}
        style={{
          position:"relative",
          background:"#EFEAD9",
          // subtle dot grid only in edit mode
          ...(editMode ? {
            backgroundImage:"radial-gradient(circle, rgba(139,115,85,0.15) 1px, transparent 1px)",
            backgroundSize:"16px 16px",
          } : {}),
          borderRadius: editMode ? 0 : "0 0 10px 10px",
          width:"100%",
          height:canvasH,
          overflow:"hidden",
          cursor:"default",
        }}
      >
        {canvasContent}

        {editMode && tables.length===0 && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8, pointerEvents:"none" }}>
            <span style={{ fontFamily:F.display, fontSize:22, color:"rgba(201,168,76,0.3)" }}>Empty canvas</span>
            <span style={{ fontFamily:F.body, fontSize:11, color:"rgba(139,115,85,0.35)" }}>Click "Add Table" below to start</span>
          </div>
        )}
      </div>

      {/* ENTRANCE label */}
      <div style={{ padding:"8px 4px 0", fontFamily:F.body, fontSize:9, letterSpacing:2, color:"#C9A84C", fontWeight:600, opacity:0.45, textTransform:"uppercase" }}>
        Entrance / Exit
      </div>

      {/* CONTROL BAR — only in edit mode, seamlessly attached below canvas */}
      {editMode && (
        <ControlBar
          onAddTable={()=>setShowAddTable(true)}
          onAddSeat={()=>{ if(!selTableId){alert("Select a table first.");return;} setShowAddSeat(true); }}
          selTableId={selTableId}
          selSeatId={selSeatId}
          tables={tables}
          onDeleteSeat={deleteSeat}
          onDeleteTable={deleteTable}
          onStatusChange={handleStatusChange}
          onDeselect={()=>{setSelTableId(null);setSelSeatId(null);}}
          onSave={handleSave}
          saved={saved}
        />
      )}

      {/* MODALS */}
      {showAddSeat && (
        <AddSeatModal
          existingNums={(tables.find(t=>t.id===selTableId)?.seats||[]).map(s=>s.num)}
          onConfirm={addSeat}
          onCancel={()=>setShowAddSeat(false)}
        />
      )}
      {showAddTable && (
        <AddTableModal onConfirm={addTable} onCancel={()=>setShowAddTable(false)} />
      )}
    </div>
  );
}