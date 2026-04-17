// src/components/seatmap/SeatMap.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import { dispatchSeatMapUpdate } from "../../utils/seatMapPersistence.js";

// Status Colors
export const STATUS_COLORS = {
  available: "#2E7A5A",
  pending:   "#8C6B2A", 
  reserved:  "#A03838",
};
export const STATUS_LABELS = {
  available: "AVAILABLE",
  pending:   "PENDING",
  reserved:  "RESERVED",
};
const SEAT_STATUS_CYCLE = ["available", "pending", "reserved"];

// Typography
const F = "'Inter', 'Helvetica Neue', Arial, sans-serif";

// Design tokens
const C = {
  gold:          "#8C6B2A",
  goldLight:     "#A07D38",
  goldFaint:     "rgba(140,107,42,0.08)",
  goldFaintest:  "rgba(140,107,42,0.04)",
  pageBg:        "#F7F4EE",
  surfaceBase:   "#FFFFFF",
  surfaceRaised: "#FAF8F4",
  surfaceInput:  "#FFFFFF",
  borderDefault: "rgba(0,0,0,0.08)",
  borderStrong:  "rgba(0,0,0,0.13)",
  borderAccent:  "rgba(140,107,42,0.28)",
  textPrimary:   "#18140E",
  textSecondary: "#7A7060",
  textTertiary:  "rgba(24,20,14,0.35)",
  textOnAccent:  "#FFFFFF",
  red:           "#A03838",
  redFaint:      "rgba(160,56,56,0.07)",
  redBorder:     "rgba(160,56,56,0.18)",
  green:         "#2E7A5A",
  greenFaint:    "rgba(46,122,90,0.07)",
  greenBorder:   "rgba(46,122,90,0.18)",
  navBg:         "rgba(247,244,238,0.98)",
  navBorder:     "rgba(140,107,42,0.14)",
  divider:       "rgba(0,0,0,0.06)",
  canvasBg:      "#EDEAE2",
  canvasBorder:  "rgba(140,107,42,0.18)",
  tableBg:       "#FFFFFF",
  tableSelected: "#FFFBF2",
  sidebarBg:     "#FAF8F4",
  sidebarBorder: "rgba(0,0,0,0.06)",
  inputFocus:    "0 0 0 3px rgba(140,107,42,0.10)",
  cardShadow:    "0 1px 4px rgba(0,0,0,0.06)",
};

let _tableCounter = 1, _standaloneCounter = 1;

function makeTable(x = 120, y = 80) {
  const id = `T${_tableCounter++}`;
  return { 
    id, 
    label: `Table ${id}`, 
    x, y, 
    shape: "rect", 
    width: 110, 
    height: 70, 
    seats: Array.from({ length: 6 }, (_, i) => ({ 
      id: `${id}-S${i + 1}`, 
      num: i + 1, 
      label: `S${i + 1}`, 
      status: "available" 
    })) 
  };
}

function makeStandaloneSeat(x = 100, y = 100) {
  const n = _standaloneCounter++;
  return { id: `SS${n}`, num: n, label: `S${n}`, status: "available", x, y };
}

const DEFAULT_LABELS = [
  { id: "screen",   type: "screen",   label: "SCREEN",   x: 200, y: 16 },
  { id: "entrance", type: "entrance", label: "ENTRANCE", x: 16,  y: 16 },
  { id: "exit",     type: "exit",     label: "EXIT",     x: 16,  y: 630 },
];

// ─── Persistence helpers ───────────────────────────────────────────────
function layoutKey(wing, room) {
  return `seatmap_layout:${wing}:${room}`;
}

function saveLayout(wing, room, { tables, labels, standaloneSeats }) {
  if (!wing || !room) return;
  const payload = JSON.stringify({ v: 2, tables, labels, standaloneSeats });
  try {
    localStorage.setItem(layoutKey(wing, room), payload);
    window.dispatchEvent(new StorageEvent("storage", {
      key: layoutKey(wing, room),
      newValue: payload,
    }));
  } catch (err) {
    console.warn("SeatMap: could not save to localStorage", err);
  }
}

function loadLayout(wing, room) {
  try {
    const raw = localStorage.getItem(layoutKey(wing, room));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.v === 2) return parsed;
    if (Array.isArray(parsed)) return { tables: parsed, labels: DEFAULT_LABELS, standaloneSeats: [] };
    return null;
  } catch {
    return null;
  }
}

// Global CSS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes sm-spin    { to { transform: rotate(360deg); } }
  @keyframes sm-fadeIn  { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
  @keyframes sm-fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .sm-scroll::-webkit-scrollbar { width: 4px; }
  .sm-scroll::-webkit-scrollbar-track { background: transparent; }
  .sm-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.10); border-radius: 4px; }
`;

// ─── ScaledCanvas ──────────────────────────────────────────────────────────────
function ScaledCanvas({ virtualW, virtualH, children, onScale, remountKey, fitMode = "width" }) {
  const sizerRef = useRef(null);
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    if (!sizerRef.current) return;
    const measure = () => {
      if (!sizerRef.current) return;
      const availW = sizerRef.current.offsetWidth;
      const availH = sizerRef.current.offsetHeight;
      if (!availW) return;
      let s;
      if (fitMode === "contain" && availH) {
        s = Math.min(availW / virtualW, availH / virtualH, 1);
      } else {
        s = Math.min(availW / virtualW, 1);
      }
      setScale(s);
      onScale?.(s);
    };
    measure();
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(sizerRef.current);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [virtualW, virtualH, remountKey, fitMode]);

  const renderedH = Math.round(virtualH * scale);

  return (
    <div ref={sizerRef} style={{ width: "100%", position: "relative" }}>
      <div style={{ width: "100%", height: renderedH, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: virtualW, height: virtualH,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          overflow: "visible",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── StaticLabel ───────────────────────────────────────────────────────────────
function StaticLabel({ item }) {
  const isScreen = item.type === "screen";
  return (
    <div style={{ 
      position: "absolute",
      left: item.x,
      top: item.y,
      background: isScreen ? C.gold : "transparent", 
      color: isScreen ? "#fff" : C.textSecondary, 
      border: isScreen ? "none" : `1px solid ${C.borderDefault}`, 
      borderRadius: isScreen ? 6 : 18, 
      padding: isScreen ? "6px 16px" : "5px 12px", 
      fontFamily: F,
      fontWeight: 700, 
      fontSize: isScreen ? 14 : 12, 
      letterSpacing: "0.18em",
      textTransform: "uppercase", 
      userSelect: "none",
      zIndex: 5,
      whiteSpace: "nowrap",
      pointerEvents: "none",
    }}>
      {item.label}
    </div>
  );
}

// ─── DraggableLabel ────────────────────────────────────────────────────────────
function DraggableLabel({ item, onDragStart, isDragging }) {
  const [hov, setHov] = useState(false);
  const isScreen = item.type === "screen";
  return (
    <div
      title={`Drag ${item.label}`}
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        background: isScreen ? C.gold : "transparent",
        color: isScreen ? "#fff" : C.textSecondary,
        border: isScreen ? "none" : `1px solid ${hov || isDragging ? C.borderAccent : C.borderDefault}`,
        borderRadius: isScreen ? 6 : 18,
        padding: isScreen ? "6px 16px" : "5px 12px",
        fontFamily: F,
        fontWeight: 700,
        fontSize: isScreen ? 14 : 12,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        zIndex: 5,
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transform: isDragging ? "scale(1.04)" : hov ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.13s, border-color 0.13s",
        opacity: isDragging ? 0.80 : 1,
      }}
      onMouseDown={e => { e.stopPropagation(); onDragStart(e, item.id); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 2, opacity: 0.4 }}>
        {[0, 1, 2].map((i) => (
          <span key={`dots-${i}`} style={{ display: "flex", gap: 2 }}>
            <span key={`${i}-1`} style={{ width: 2, height: 2, borderRadius: "50%", background: "currentColor", display: "block" }} />
            <span key={`${i}-2`} style={{ width: 2, height: 2, borderRadius: "50%", background: "currentColor", display: "block" }} />
          </span>
        ))}
      </span>
      {item.label}
    </div>
  );
}

// StandaloneSeat
function StandaloneSeat({ seat, editMode, isSelected, isDragging, onDragStart, onSelect, onSeatClick }) {
  const [hov, setHov] = useState(false);
  const color = STATUS_COLORS[seat.status] || STATUS_COLORS.available;
  const blocked = !editMode && (seat.status === "reserved" || seat.status === "pending");
  const SIZE = 38;
  
  return (
    <div
      style={{ position: "absolute", left: seat.x, top: seat.y, width: SIZE, height: SIZE, zIndex: isSelected ? 15 : 6 }}
      onMouseEnter={() => !blocked && setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseDown={editMode ? e => { e.stopPropagation(); onDragStart(e, seat.id); } : undefined}
      onClick={e => { e.stopPropagation(); if (editMode) { onSelect(seat); return; } if (!blocked) onSeatClick?.(seat, null); }}
      title={blocked ? (seat.status === "reserved" ? "Already reserved" : "Pending") : `Seat ${seat.num}`}
    >
      <div style={{
        width: SIZE, height: SIZE, borderRadius: "50%",
        background: isSelected ? "transparent" : color,
        border: isSelected ? `2px solid ${C.gold}` : `1.5px solid rgba(0,0,0,0.08)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: editMode ? (isDragging ? "grabbing" : "grab") : blocked ? "not-allowed" : "pointer",
        boxShadow: isSelected ? `0 0 0 3px ${C.gold}28` : hov ? "0 2px 8px rgba(0,0,0,0.12)" : C.cardShadow,
        transform: isSelected ? "scale(1.12)" : hov ? "scale(1.06)" : "scale(1)",
        opacity: blocked ? 0.48 : 1,
        userSelect: "none",
        transition: "all 0.15s ease",
      }}>
        <span style={{ color: isSelected ? C.gold : "#fff", fontSize: 10, fontWeight: 700, fontFamily: F, lineHeight: 1, pointerEvents: "none" }}>
          {seat.num}
        </span>
      </div>
    </div>
  );
}

// SeatNode
function SeatNode({ seat, isSelected, editMode, isDragging, onSeatClick, onSeatDragStart }) {
  const [hov, setHov] = useState(false);
  const color = STATUS_COLORS[seat.status] || STATUS_COLORS.available;
  const blocked = !editMode && (seat.status === "reserved" || seat.status === "pending");
  const SIZE = 38;
  
  return (
    <div
      onClick={e => { e.stopPropagation(); if (!isDragging && !blocked) onSeatClick?.(seat); }}
      onMouseDown={editMode ? e => { e.stopPropagation(); onSeatDragStart?.(e, seat.id); } : undefined}
      onMouseEnter={() => !blocked && !editMode && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: SIZE, height: SIZE, borderRadius: "50%",
        background: isSelected ? "transparent" : color,
        border: isSelected ? `2px solid ${C.gold}` : `1.5px solid rgba(0,0,0,0.08)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: editMode ? "grab" : blocked ? "not-allowed" : "pointer",
        boxShadow: isSelected ? `0 0 0 3px ${C.gold}28` : hov ? "0 2px 8px rgba(0,0,0,0.12)" : C.cardShadow,
        transform: isSelected ? "scale(1.12)" : hov ? "scale(1.06)" : "scale(1)",
        opacity: blocked ? 0.48 : 1,
        flexShrink: 0,
        userSelect: "none",
        transition: "all 0.15s ease",
      }}
    >
      <span style={{ color: isSelected ? C.gold : "#fff", fontSize: 11, fontWeight: 700, fontFamily: F, lineHeight: 1, pointerEvents: "none" }}>
        {seat.num}
      </span>
    </div>
  );
}

// TableNode
function TableNode({ table, editMode, isTableSelected, selectedSeatId, onSelectTable, onDragStart, onResizeStart, onSeatClick, onLabelEdit, isDragging, onSeatMove }) {
  const [hov, setHov] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelVal, setLabelVal] = useState(table.label || table.id);
  const [draggingSeatId, setDraggingSeatId] = useState(null);
  const [dropSide, setDropSide] = useState(null);
  const [ghostXY, setGhostXY] = useState(null);
  const tableBodyRef = useRef(null);
  const seatDragRef = useRef(null);
  useEffect(() => setLabelVal(table.label || table.id), [table.label, table.id]);

  const SEAT_D = 38, SEAT_GAP = 6, SEAT_OFF = 8;
  const tableW = Math.max(table.width || 110, 80);
  const tableH = Math.max(table.height || 70, 50);
  const maxH = Math.max(1, Math.floor((tableW + SEAT_GAP) / (SEAT_D + SEAT_GAP)));
  const maxV = Math.max(1, Math.floor((tableH + SEAT_GAP) / (SEAT_D + SEAT_GAP)));
  const byPos = { top: [], bottom: [], left: [], right: [] };
  const free = [];
  (table.seats || []).forEach(s => s.position ? byPos[s.position].push(s) : free.push(s));
  free.forEach(s => {
    if      (byPos.top.length    < maxH) byPos.top.push(s);
    else if (byPos.bottom.length < maxH) byPos.bottom.push(s);
    else if (byPos.left.length   < maxV) byPos.left.push(s);
    else                                  byPos.right.push(s);
  });
  const topPad   = byPos.top.length    ? SEAT_D + SEAT_OFF : 0;
  const botPad   = byPos.bottom.length ? SEAT_D + SEAT_OFF : 0;
  const leftPad  = byPos.left.length   ? SEAT_D + SEAT_OFF : 0;
  const rightPad = byPos.right.length  ? SEAT_D + SEAT_OFF : 0;
  const contW = leftPad + tableW + rightPad;
  const contH = topPad  + tableH + botPad;
  const tOffX = leftPad, tOffY = topPad;

  const startSeatDrag = useCallback((e, seatId) => {
    e.preventDefault(); e.stopPropagation();
    seatDragRef.current = { seatId };
    setDraggingSeatId(seatId);
    setGhostXY({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!draggingSeatId) return;
    const onMove = e => {
      setGhostXY({ x: e.clientX, y: e.clientY });
      if (!tableBodyRef.current) return;
      const r = tableBodyRef.current.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      const d = { top: cy, bottom: r.height - cy, left: cx, right: r.width - cx };
      setDropSide(Object.entries(d).sort((a, b) => a[1] - b[1])[0][0]);
    };
    const onUp = () => {
      if (seatDragRef.current?.seatId && dropSide) onSeatMove?.(table.id, seatDragRef.current.seatId, dropSide);
      seatDragRef.current = null;
      setDraggingSeatId(null); setDropSide(null); setGhostXY(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [draggingSeatId, dropSide, onSeatMove, table.id]);

  const renderSide = (seats, side) => {
    if (!seats.length) return null;
    const horiz = side === "top" || side === "bottom";
    const rowPx = seats.length * (SEAT_D + SEAT_GAP) - SEAT_GAP;
    const pos = {
      top:    { top: 0,                           left: tOffX + tableW / 2 - rowPx / 2 },
      bottom: { top: tOffY + tableH + SEAT_OFF,   left: tOffX + tableW / 2 - rowPx / 2 },
      left:   { left: 0,                          top:  tOffY + tableH / 2 - rowPx / 2 },
      right:  { left: tOffX + tableW + SEAT_OFF,  top:  tOffY + tableH / 2 - rowPx / 2 },
    }[side];
    return (
      <div key={side} style={{ position: "absolute", display: "flex", flexDirection: horiz ? "row" : "column", gap: SEAT_GAP, ...pos }}>
        {seats.map((seat, index) => (
          <SeatNode
            key={`${table.id}-${seat.id ?? seat.num ?? index}`} seat={seat} editMode={editMode}
            isSelected={seat.id === selectedSeatId}
            isDragging={draggingSeatId === seat.id}
            onSeatDragStart={startSeatDrag}
            onSeatClick={s => { if (!draggingSeatId) onSeatClick(s, table.id); }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {editMode && draggingSeatId && ghostXY && (() => {
        const seat = (table.seats || []).find(s => s.id === draggingSeatId);
        if (!seat) return null;
        return (
          <div style={{ position: "fixed", left: ghostXY.x - 19, top: ghostXY.y - 19, width: 38, height: 38, borderRadius: "50%", background: STATUS_COLORS[seat.status] || STATUS_COLORS.available, border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 9999, boxShadow: `0 6px 20px rgba(0,0,0,0.15), 0 0 0 3px ${C.gold}35`, transform: "scale(1.15)", opacity: 0.92 }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: F }}>{seat.num}</span>
          </div>
        );
      })()}
      <div
        style={{ position: "absolute", left: table.x, top: table.y, width: contW, height: contH, overflow: "visible", zIndex: isTableSelected ? 10 : 4 }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {["top", "bottom", "left", "right"].map(side => renderSide(byPos[side], side))}
        <div
          ref={tableBodyRef}
          style={{
            position: "absolute", left: tOffX, top: tOffY, width: tableW, height: tableH,
            background: isTableSelected ? C.tableSelected : C.tableBg,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            border: isTableSelected ? `1.5px solid ${C.gold}` : hov ? `1.5px solid ${C.borderAccent}` : `1px solid ${C.borderDefault}`,
            boxShadow: isTableSelected ? `0 0 0 3px ${C.gold}10, 0 4px 16px rgba(0,0,0,0.08)` : hov ? "0 4px 12px rgba(0,0,0,0.07)" : C.cardShadow,
            transition: "border 0.15s, box-shadow 0.15s",
            cursor: editMode ? (isDragging ? "grabbing" : "grab") : "pointer",
            zIndex: 2, overflow: "visible",
          }}
          onMouseDown={editMode ? e => { if (!draggingSeatId) { e.stopPropagation(); onDragStart(e, table.id); } } : undefined}
          onClick={e => { e.stopPropagation(); onSelectTable(table); }}
          onDoubleClick={editMode ? e => { e.stopPropagation(); setEditingLabel(true); } : undefined}
        >
          {editingLabel
            ? <input
                autoFocus value={labelVal}
                onChange={e => setLabelVal(e.target.value)}
                onBlur={() => { setEditingLabel(false); onLabelEdit?.(table.id, labelVal); }}
                onKeyDown={e => { if (e.key === "Enter") { setEditingLabel(false); onLabelEdit?.(table.id, labelVal); } e.stopPropagation(); }}
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
                style={{ background: "transparent", border: "none", outline: "none", color: C.textPrimary, fontFamily: F, fontWeight: 700, fontSize: 10, letterSpacing: "0.10em", textAlign: "center", width: "85%", textTransform: "uppercase" }}
              />
            : <>
                <div style={{ color: C.textPrimary, fontFamily: F, fontWeight: 700, fontSize: 10, letterSpacing: "0.10em", textTransform: "uppercase", lineHeight: 1.3, textAlign: "center", padding: "0 8px" }}>
                  {table.label || table.id}
                </div>
                {(table.seats?.length || 0) > 0 && (
                  <div style={{ color: C.textTertiary, fontFamily: F, fontSize: 9, marginTop: 2 }}>
                    {table.seats.length} seats
                  </div>
                )}
              </>
          }
        </div>
      </div>
    </>
  );
}

// ToolBtn
function ToolBtn({ active, onClick, label, accentColor }) {
  const [hov, setHov] = useState(false);
  const acc = accentColor || C.gold;
  const bg = active ? `${acc}12` : hov ? `${acc}06` : "transparent";
  const border = active ? acc : hov ? C.borderAccent : C.borderDefault;
  const color = active ? acc : hov ? C.textPrimary : C.textSecondary;
  return (
    <button
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", border: `1px solid ${border}`, background: bg, color, borderRadius: 6, fontFamily: F, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.14s", whiteSpace: "nowrap" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </button>
  );
}


// Wing/Room Sidebar
function WingRoomSidebar({ activeWing, activeRoom, onSelect }) {
  const DEFAULT_WINGS = [
    { id: "main-wing",  label: "Main Wing",  rooms: ["Alabang Function Room", "Laguna Ballroom", "20/20 Function Room", "Business Center"] },
    { id: "tower-wing", label: "Tower Wing", rooms: ["Tower Ballroom", "Grand Ballroom"] },
    { id: "dining",     label: "Dining",     rooms: ["Qsina", "Hanakazu", "Phoenix Court"] },
  ];

  const [expanded, setExpanded] = useState(() => Object.fromEntries(DEFAULT_WINGS.map(w => [w.id, true])));
  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const rowStyle = (active) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "6px 13px 6px 28px", cursor: "pointer",
    background: active ? C.goldFaint : "transparent",
    borderRight: `2px solid ${active ? C.gold : "transparent"}`,
    transition: "all 0.14s",
  });

  return (
    <div className="sm-scroll" style={{ width: 220, flexShrink: 0, background: C.sidebarBg, borderRight: `1px solid ${C.sidebarBorder}`, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
      <div style={{ padding: "14px 15px 10px", borderBottom: `1px solid ${C.divider}`, flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", color: C.gold, textTransform: "uppercase", fontFamily: F, marginBottom: 1 }}>Venue</div>
        <div style={{ fontSize: 11, color: C.textSecondary, fontFamily: F }}>Wings &amp; Rooms</div>
      </div>

      <div style={{ flex: 1, paddingBottom: 8 }}>
        {DEFAULT_WINGS.map((wing, wingIndex) => (
          <div key={`${wing.id}-${wingIndex}`}>
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px 7px 11px", cursor: "pointer", userSelect: "none", transition: "background 0.14s" }}
              onClick={() => toggle(wing.id)}
              onMouseEnter={e => e.currentTarget.style.background = C.goldFaintest}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded[wing.id] ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.18s", flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", color: C.textPrimary, textTransform: "uppercase", fontFamily: F }}>{wing.label}</span>
              </div>
            </div>
            {expanded[wing.id] && (
              <div>
                {wing.rooms.map((room, roomIndex) => {
                  const active = activeWing === wing.label && activeRoom === room;
                  return (
                    <div
                      key={`${wing.id}-${roomIndex}-${room}`}
                      onClick={() => onSelect(wing.label, room)}
                      style={rowStyle(active)}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.goldFaintest; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? C.goldFaint : "transparent"; }}
                    >
                      <span style={{ fontSize: 11, color: active ? C.gold : C.textSecondary, fontFamily: F, fontWeight: active ? 600 : 400, lineHeight: 1.4, flex: 1, transition: "color 0.14s" }}>{room}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Inspector Panel
function InspectorPanel({ selected, selectedTable, selectedSeatObj, tables, setTables, addSeat, deleteSeat, deleteTable, deleteStandaloneSeat, updateTable, handleSeatLabelEdit, handleSeatStatus }) {

  const iLabel = t => <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: C.gold, textTransform: "uppercase", marginBottom: 5, marginTop: 13 }}>{t}</div>;

  const iInput = props => (
    <input
      style={{ width: "100%", padding: "8px 10px", border: `1px solid ${C.borderDefault}`, borderRadius: 6, fontFamily: F, fontSize: 12, color: C.textPrimary, background: C.surfaceInput, boxSizing: "border-box", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" }}
      onFocus={e => { e.target.style.borderColor = C.borderAccent; e.target.style.boxShadow = C.inputFocus; }}
      onBlur={e => { e.target.style.borderColor = C.borderDefault; e.target.style.boxShadow = "none"; }}
      {...props}
    />
  );

  const StatusRow = ({ current, onSet }) => (
    <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
      {SEAT_STATUS_CYCLE.map((s, index) => (
        <button key={`${s}-${index}`} onClick={() => onSet(s)} style={{ flex: 1, padding: "6px 0", background: current === s ? STATUS_COLORS[s] : "transparent", border: `1px solid ${STATUS_COLORS[s]}80`, borderRadius: 5, fontFamily: F, fontWeight: 600, fontSize: 9, color: current === s ? "#fff" : STATUS_COLORS[s], cursor: "pointer", transition: "all 0.14s" }}>
          {s === "available" ? "Avail." : s === "pending" ? "Pending" : "Reserved"}
        </button>
      ))}
    </div>
  );

  const DeleteBtn = ({ label, onClick }) => (
    <button
      onClick={onClick}
      style={{ width: "100%", marginTop: 10, padding: "8px 0", background: "transparent", color: C.red, border: `1px solid ${C.redBorder}`, borderRadius: 6, fontFamily: F, fontWeight: 600, fontSize: 10, cursor: "pointer", transition: "background 0.14s" }}
      onMouseEnter={e => e.currentTarget.style.background = C.redFaint}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.20em", color: C.gold, textTransform: "uppercase", marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${C.divider}` }}>Inspector</div>

      {!selected && <div style={{ color: C.textTertiary, fontSize: 11, lineHeight: 1.65 }}>Select a table or seat to edit its properties.</div>}

      {selected?.type === "table" && selectedTable && (<>
        {iLabel("Table Label")}
        {iInput({ value: selectedTable.label || selectedTable.id, onChange: e => updateTable("label", e.target.value) })}
        {iLabel(`Seats · ${selectedTable.seats?.length || 0}`)}
        <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
          <button onClick={addSeat} style={{ flex: 1, padding: "6px 0", background: "transparent", color: C.green, border: `1px solid ${C.greenBorder}`, borderRadius: 5, fontFamily: F, fontWeight: 600, fontSize: 10, cursor: "pointer", transition: "background 0.14s" }} onMouseEnter={e => e.currentTarget.style.background = C.greenFaint} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>+ Add Seat</button>
          <button onClick={deleteSeat} style={{ flex: 1, padding: "6px 0", background: "transparent", color: C.red, border: `1px solid ${C.redBorder}`, borderRadius: 5, fontFamily: F, fontWeight: 600, fontSize: 10, cursor: "pointer", transition: "background 0.14s" }} onMouseEnter={e => e.currentTarget.style.background = C.redFaint} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>− Remove Last</button>
        </div>
        <div style={{ marginTop: 8, padding: "7px 10px", background: C.goldFaintest, border: `1px solid ${C.borderAccent}`, borderRadius: 5, fontSize: 10, color: C.textSecondary }}>Drag table to move, double-click to rename</div>
        <DeleteBtn label="🗑 Delete Table" onClick={() => deleteTable()} />
      </>)}

      {selected?.type === "seat" && selectedSeatObj && (<>
        {iLabel("Seat Label")}
        {iInput({ value: selectedSeatObj.label || selectedSeatObj.num, onChange: e => handleSeatLabelEdit(e.target.value) })}
        {iLabel("Seat Number")}
        {iInput({ type: "number", value: selectedSeatObj.num, onChange: e => setTables(p => p.map(t => t.id !== selected.tableId ? t : { ...t, seats: (t.seats || []).map(s => s.id === selected.seatId ? { ...s, num: Number(e.target.value) } : s) })) })}
        {iLabel("Status")}
        <StatusRow current={selectedSeatObj.status} onSet={handleSeatStatus} />
        <DeleteBtn label="🗑 Delete Seat" onClick={() => {
          setTables(p => p.map(t => t.id !== selected.tableId ? t : { ...t, seats: (t.seats || []).filter(s => s.id !== selected.seatId) }));
        }} />
      </>)}

      {selected?.type === "standaloneSeat" && (<>
        {iLabel("Standalone Seat")}
        <div style={{ marginTop: 4, padding: "7px 10px", background: C.goldFaintest, border: `1px solid ${C.borderAccent}`, borderRadius: 5, fontSize: 10, color: C.textSecondary }}>Drag to reposition this seat on the canvas.</div>
        <DeleteBtn label="🗑 Delete Seat" onClick={() => deleteStandaloneSeat()} />
      </>)}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SeatMap({
  tableData, editMode = false, selectedSeat, highlightedTable,
  onSeatClick, onTableClick, windowWidth, virtualWidth, virtualHeight,
  wing, room, mode = "whole", isDark = false, onBack, sidebarWidth = 0,
}) {
  const normalize = useCallback(td => {
    if (!td) return [];
    if (Array.isArray(td)) return td.map(t => ({ shape: "rect", width: 110, height: 70, ...t }));
    return [{ shape: "rect", width: 110, height: 70, ...td }];
  }, []);

  const [tables, setTables]               = useState(() => editMode ? [] : normalize(tableData));
  const [labels, setLabels]               = useState(() => {
    if (!editMode && tableData) {
      if (tableData.labels) return tableData.labels;
    }
    return DEFAULT_LABELS;
  });
  const [standaloneSeats, setStandaloneSeats] = useState([]);
  const [selected, setSelected]           = useState(null);
  const [saved, setSaved]                 = useState(false);
  const [tool, setTool]                   = useState("select");
  const [activeDragId, setActiveDragId]   = useState(null);

  const [activeWing, setActiveWing] = useState(wing || "Main Wing");
  const [activeRoom, setActiveRoom] = useState(room || "Alabang Function Room");

  const loadedRef = useRef(false);

  const dragging      = useRef(null);
  const canvasRef     = useRef(null);
  const adminScaleRef = useRef(1);

  // ─── LOAD from localStorage whenever wing/room changes (editor) ───────────────
  useEffect(() => {
    if (!editMode) return;

    loadedRef.current = false;

    const stored = loadLayout(activeWing, activeRoom);

    if (stored) {
      const norm = normalize(stored.tables).filter(t => t.seats?.length > 0);
      setTables(norm);
      norm.forEach(t => {
        const n = parseInt(t.id?.replace(/\D/g, "")) || 0;
        if (n >= _tableCounter) _tableCounter = n + 1;
      });
      setLabels(stored.labels?.length ? stored.labels : DEFAULT_LABELS);
      const ss = stored.standaloneSeats || [];
      setStandaloneSeats(ss);
      ss.forEach(s => {
        const n = parseInt(s.id?.replace(/\D/g, "")) || 0;
        if (n >= _standaloneCounter) _standaloneCounter = n + 1;
      });
    } else {
      setTables([]);
      setLabels(DEFAULT_LABELS);
      setStandaloneSeats([]);
    }

    setSelected(null);

    const t = setTimeout(() => { loadedRef.current = true; }, 100);
    return () => clearTimeout(t);
  }, [editMode, activeWing, activeRoom, normalize]);

  // ─── AUTO-SAVE ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editMode) return;
    if (!activeWing || !activeRoom) return;
    if (!loadedRef.current) return;

    const completeData = { tables, labels, standaloneSeats };
    saveLayout(activeWing, activeRoom, completeData);
    dispatchSeatMapUpdate(activeWing, activeRoom, completeData);
  }, [tables, labels, standaloneSeats, editMode, activeWing, activeRoom]);

  // Client: sync from prop
  useEffect(() => {
    if (editMode) return;
    if (!tableData) return;

    if (tableData.tables) {
      setTables(normalize(tableData.tables).filter(t => t.seats?.length > 0));
      setLabels(tableData.labels?.length ? tableData.labels : DEFAULT_LABELS);
      setStandaloneSeats(tableData.standaloneSeats || []);
    } else {
      setTables(normalize(tableData).filter(t => t.seats?.length > 0));
      setLabels(DEFAULT_LABELS);
      setStandaloneSeats([]);
    }
  }, [tableData, normalize, editMode]);

  const selectedTable   = selected?.type === "table" ? tables.find(t => t.id === selected.tableId) : null;
  const selectedSeatObj = selected?.type === "seat"  ? tables.find(t => t.id === selected.tableId)?.seats.find(s => s.id === selected.seatId) : null;

  // Global drag
  useEffect(() => {
    if (!editMode) return;
    const onMove = e => {
      const d = dragging.current; if (!d) return;
      const s = adminScaleRef.current || 1;
      const dx = (e.clientX - d.startX) / s, dy = (e.clientY - d.startY) / s;
      if      (d.type === "table")          setTables(p => p.map(t => t.id === d.id ? { ...t, x: Math.max(0, d.originX + dx), y: Math.max(0, d.originY + dy) } : t));
      else if (d.type === "label")          setLabels(p => p.map(l => l.id === d.id ? { ...l, x: Math.max(0, d.originX + dx), y: Math.max(0, d.originY + dy) } : l));
      else if (d.type === "standaloneSeat") setStandaloneSeats(p => p.map(ss => ss.id === d.id ? { ...ss, x: Math.max(0, d.originX + dx), y: Math.max(0, d.originY + dy) } : ss));
    };
    const onUp = () => { dragging.current = null; setActiveDragId(null); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [editMode, labels]);

  const startTableDrag          = useCallback((e, id) => { e.preventDefault(); const t = tables.find(t => t.id === id); dragging.current = { type: "table", id, startX: e.clientX, startY: e.clientY, originX: t?.x || 0, originY: t?.y || 0 }; setActiveDragId(id); }, [tables]);
  const startTableResize        = useCallback((e, id) => { e.preventDefault(); setActiveDragId(id); }, []);
  const startLabelDrag          = useCallback((e, id) => { e.preventDefault(); const l = labels.find(l => l.id === id); dragging.current = { type: "label", id, startX: e.clientX, startY: e.clientY, originX: l?.x || 0, originY: l?.y || 0 }; setActiveDragId(id); }, [labels]);
  const startStandaloneSeatDrag = useCallback((e, id) => { e.preventDefault(); const ss = standaloneSeats.find(s => s.id === id); dragging.current = { type: "standaloneSeat", id, startX: e.clientX, startY: e.clientY, originX: ss?.x || 0, originY: ss?.y || 0 }; setActiveDragId(id); }, [standaloneSeats]);

  const handleCanvasClick = e => {
    if (!editMode) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const s = adminScaleRef.current || 1;
    const cx = Math.max(0, (e.clientX - rect.left) / s), cy = Math.max(0, (e.clientY - rect.top) / s);
    if      (tool === "addTable") { const t = makeTable(cx - 55, cy - 27);           setTables(p => [...p, t]);           setSelected({ type: "table", tableId: t.id });                   setTool("select"); }
    else if (tool === "addSeat")  { const ss = makeStandaloneSeat(cx - 19, cy - 19); setStandaloneSeats(p => [...p, ss]); setSelected({ type: "standaloneSeat", standaloneSeatId: ss.id }); setTool("select"); }
  };

  const deleteTable          = (id) => { const tid = id || selected?.tableId; if (!tid) return; setTables(p => p.filter(t => t.id !== tid)); if (!id || selected?.tableId === tid) setSelected(null); };
  const deleteStandaloneSeat = (id) => { const sid = id || selected?.standaloneSeatId; if (!sid) return; setStandaloneSeats(p => p.filter(s => s.id !== sid)); if (!id || selected?.standaloneSeatId === sid) setSelected(null); };
  const addSeat              = ()    => {
    if (!selected?.tableId) return;
    setTables(p => p.map(t => {
      if (t.id !== selected.tableId) return t;
      const currentSeats = t.seats || [];
      const num = currentSeats.length + 1;
      return { ...t, seats: [...currentSeats, { id: `${t.id}-S${num}`, num, label: `S${num}`, status: "available" }] };
    }));
  };
  const deleteSeat          = ()        => { if (!selected?.tableId) return; setTables(p => { const u = p.map(t => t.id !== selected.tableId ? t : { ...t, seats: (t.seats || []).slice(0, -1) }); const f = u.filter(t => (t.seats || []).length > 0); if (f.length < u.length) setSelected(null); return f; }); };
  const updateTable         = (k, v)    => { if (!selected?.tableId) return; setTables(p => p.map(t => t.id === selected.tableId ? { ...t, [k]: v } : t)); };
  const handleLabelEdit     = (id, val) => { setTables(p => p.map(t => t.id === id ? { ...t, label: val } : t)); };
  const handleSeatLabelEdit = val       => { if (!selected?.seatId) return; setTables(p => p.map(t => t.id !== selected.tableId ? t : { ...t, seats: (t.seats || []).map(s => s.id === selected.seatId ? { ...s, label: val } : s) })); };
  const handleSeatStatus    = status    => { if (!selected?.seatId) return; setTables(p => p.map(t => t.id !== selected.tableId ? t : { ...t, seats: (t.seats || []).map(s => s.id === selected.seatId ? { ...s, status } : s) })); };
  const handleSeatMove      = (tableId, seatId, pos) => { setTables(p => p.map(t => t.id !== tableId ? t : { ...t, seats: (t.seats || []).map(s => s.id === seatId ? { ...s, position: pos } : s) })); };
  const handleSeatClick     = (seat, tableId) => { if (!editMode) { onSeatClick?.(seat, tableId); return; } setSelected({ type: "seat", tableId, seatId: seat.id }); };
  const handleTableSelect   = table => { if (editMode) { setSelected({ type: "table", tableId: table.id }); return; } onTableClick?.(table); };
  const handleSelectRoom    = (w, r) => { setActiveWing(w); setActiveRoom(r); };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ─── CLIENT VIEW ─────────────────────────────────────────────────────────────
  if (!editMode) {
    const SEAT_D = 38, SEAT_OFF = 46, PAD = 32;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    tables.forEach(t => {
      const tw = t.width || 110, th = t.height || 70;
      minX = Math.min(minX, t.x - SEAT_OFF);
      minY = Math.min(minY, t.y - SEAT_OFF);
      maxX = Math.max(maxX, t.x + tw + SEAT_OFF);
      maxY = Math.max(maxY, t.y + th + SEAT_OFF);
    });

    standaloneSeats.forEach(s => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + SEAT_D);
      maxY = Math.max(maxY, s.y + SEAT_D);
    });

    labels.forEach(l => {
      const lw = l.type === "screen" ? 120 : 100;
      const lh = l.type === "screen" ? 32  : 26;
      minX = Math.min(minX, l.x);
      minY = Math.min(minY, l.y);
      maxX = Math.max(maxX, l.x + lw);
      maxY = Math.max(maxY, l.y + lh);
    });

    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 1400; maxY = 780; }

    const VIRTUAL_W = virtualWidth  || Math.max(maxX - minX + PAD * 2, 400);
    const VIRTUAL_H = virtualHeight || Math.max(maxY - minY + PAD * 2, 300);
    const ox = -(minX - PAD);
    const oy = -(minY - PAD);

    return (
      <div style={{ width: "100%" }}>
        <ScaledCanvas virtualW={VIRTUAL_W} virtualH={VIRTUAL_H} fitMode="contain" remountKey={0}>
          <div style={{ position: "absolute", top: oy, left: ox, width: VIRTUAL_W, height: VIRTUAL_H }}>
            {labels.map((l, index) => <StaticLabel key={`${l.id}-${index}`} item={l} />)}
            {mode === "individual" && standaloneSeats.map((s, index) => (
              <StandaloneSeat key={`${s.id}-${s.num ?? index}`} seat={s} editMode={false}
                isSelected={selectedSeat ? selectedSeat.id === s.id : false}
                isDragging={false} onDragStart={() => {}} onSelect={() => {}} onSeatClick={onSeatClick} />
            ))}
            {tables.map((t, index) => (
              <TableNode key={`${t.id}-${index}`} table={t} editMode={false}
                isTableSelected={highlightedTable ? highlightedTable.id === t.id : false}
                selectedSeatId={selectedSeat ? selectedSeat.id : null}
                onSelectTable={handleTableSelect} onDragStart={() => {}} onResizeStart={() => {}}
                onSeatClick={handleSeatClick} isDragging={false} />
            ))}
          </div>
        </ScaledCanvas>
      </div>
    );
  }

  // ─── ADMIN / EDIT VIEW ────────────────────────────────────────────────────────
  const VIRTUAL_W = virtualWidth  || 1400;
  const VIRTUAL_H = virtualHeight || 780;
  const isAddMode = tool === "addTable" || tool === "addSeat";
  const toolHint  = { addTable: "Click on canvas to place a table", addSeat: "Click on canvas to place a seat" }[tool] || "";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: F, color: C.textPrimary, overflow: "hidden" }}>
      <style>{GLOBAL_CSS}</style>
      <style>{`
        html, body { overflow: hidden !important; height: 100vh !important; max-height: 100vh !important; }
        #root { overflow: hidden !important; height: 100vh !important; max-height: 100vh !important; }
      `}</style>

      {/* Toolbar */}
      <div style={{ flexShrink: 0, padding: "12px 16px", background: C.surfaceBase, borderBottom: `1px solid ${C.borderDefault}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.14em", textTransform: "uppercase" }}>{activeWing}</span>
          <span style={{ color: C.textTertiary, fontSize: 12 }}>·</span>
          <span style={{ fontSize: 12, color: C.textPrimary, fontWeight: 500 }}>{activeRoom}</span>
        </div>
        <div style={{ width: 1, height: 20, background: C.borderDefault, flexShrink: 0 }} />
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <ToolBtn active={tool === "select"}   onClick={() => setTool("select")}   label="Select" />
          <ToolBtn active={tool === "addTable"} onClick={() => setTool("addTable")} label="+ Table" />
          <ToolBtn active={tool === "addSeat"}  onClick={() => setTool("addSeat")}  label="+ Seat" />
        </div>
        {isAddMode && toolHint && (
          <div style={{ padding: "4px 10px", background: C.goldFaintest, color: C.gold, fontFamily: F, fontWeight: 600, fontSize: 9, border: `1px solid ${C.borderAccent}`, borderRadius: 5, whiteSpace: "nowrap", animation: "sm-fadeIn 0.16s ease" }}>
            {toolHint}
          </div>
        )}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {saved && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: C.greenFaint, color: C.green, borderRadius: 5, fontFamily: F, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${C.greenBorder}`, animation: "sm-fadeIn 0.16s ease" }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Saved
            </span>
          )}
          <button onClick={handleSave}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", background: C.gold, color: "#fff", border: "none", borderRadius: 7, fontFamily: F, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", transition: "background 0.14s", boxShadow: "0 2px 8px rgba(140,107,42,0.20)" }}
            onMouseEnter={e => e.currentTarget.style.background = C.goldLight}
            onMouseLeave={e => e.currentTarget.style.background = C.gold}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V2z" stroke="currentColor" strokeWidth="1.3" fill="none" /><rect x="4" y="8" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" fill="none" /><rect x="4.5" y="2" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>
            Save Layout
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div style={{ flex: "1 1 0", display: "flex", overflow: "hidden", minHeight: 0 }}>
        <WingRoomSidebar activeWing={activeWing} activeRoom={activeRoom} onSelect={handleSelectRoom} />

        {/* CENTER: Canvas */}
        <div style={{ flex: "1 1 0", minWidth: 0, padding: 14, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: "1 1 0", minHeight: 0, background: C.canvasBg, border: `1.5px solid ${isAddMode ? C.gold : C.canvasBorder}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", position: "relative" }}>
            <ScaledCanvas virtualW={VIRTUAL_W} virtualH={VIRTUAL_H} fitMode="contain" onScale={s => { adminScaleRef.current = s; }}>
              <div
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, cursor: isAddMode ? "crosshair" : "default" }}
                onClick={handleCanvasClick}
                onMouseDown={e => { if (tool === "select" && e.target === canvasRef.current) setSelected(null); }}
              />
              {labels.map((l, index) => (
                <DraggableLabel key={`${l.id}-${index}`} item={l}
                  onDragStart={(e, id) => startLabelDrag(e, id)}
                  isDragging={activeDragId === l.id} />
              ))}
              {standaloneSeats.map((s, index) => (
                <StandaloneSeat key={`${s.id}-${index}`} seat={s} editMode={true}
                  isSelected={selected?.type === "standaloneSeat" && selected.standaloneSeatId === s.id}
                  isDragging={activeDragId === s.id}
                  onDragStart={startStandaloneSeatDrag}
                  onSelect={ss => setSelected({ type: "standaloneSeat", standaloneSeatId: ss.id })} />
              ))}
              {tables.map((t, index) => (
                <TableNode key={`${t.id}-${index}`} table={t} editMode={true}
                  isTableSelected={selected?.tableId === t.id}
                  selectedSeatId={selected?.type === "seat" && selected?.tableId === t.id ? selected.seatId : null}
                  onDragStart={startTableDrag} onResizeStart={startTableResize}
                  onSeatClick={handleSeatClick} onLabelEdit={handleLabelEdit} isDragging={activeDragId === t.id} onSeatMove={handleSeatMove} />
              ))}
              {tables.length === 0 && standaloneSeats.length === 0 && (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", gap: 10, animation: "sm-fadeUp 0.3s ease" }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, border: `1.5px dashed ${C.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.35 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    </div>
    <p style={{ color: C.textSecondary, fontSize: 12, fontFamily: F, margin: 0 }}>
      Empty canvas — use the toolbar to add tables or seats
    </p>
  </div>
)}
            </ScaledCanvas>
          </div>
        </div>

        {/* RIGHT: Inspector Sidebar */}
        <div className="sm-scroll" style={{ flexShrink: 0, width: 252, borderLeft: `1px solid ${C.borderDefault}`, background: C.surfaceBase, overflowY: "hidden", padding: "14px 13px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
          <InspectorPanel
            selected={selected} selectedTable={selectedTable} selectedSeatObj={selectedSeatObj}
            tables={tables} setTables={setTables}
            addSeat={addSeat} deleteSeat={deleteSeat} deleteTable={deleteTable}
            deleteStandaloneSeat={deleteStandaloneSeat}
            updateTable={updateTable} handleSeatLabelEdit={handleSeatLabelEdit} handleSeatStatus={handleSeatStatus}
          />

          {/* Status Legend */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.20em", color: C.gold, textTransform: "uppercase", marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${C.divider}` }}>Status Legend</div>
            {Object.entries(STATUS_COLORS).map(([key, color], index) => (
              <div key={`${key}-${index}`} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontFamily: F, fontSize: 11, color: C.textSecondary, fontWeight: 500 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}