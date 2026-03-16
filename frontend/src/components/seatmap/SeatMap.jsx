// src/components/seatmap/SeatMap.jsx
import { useState, useRef, useCallback, useEffect } from "react";

// ─── Persistence util ─────────────────────────────────────────────────────────
import { dispatchSeatMapUpdate } from "../../utils/seatMapPersistence.js";

// ─── Shared constants ─────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  available: "#4CAF79",
  pending:   "#E8A838",
  reserved:  "#E05252",
};
export const STATUS_LABELS = {
  available: "AVAILABLE",
  pending:   "PENDING",
  reserved:  "RESERVED",
};

const SEAT_STATUS_CYCLE = ["available", "pending", "reserved"];

const F = {
  display: "'Cormorant Garamond', Georgia, serif",
  body:    "'DM Sans', sans-serif",
};

const CANVAS_H = 760;

let _tableCounter = 1;
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
      id:     `${id}-S${i + 1}`,
      num:    i + 1,
      label:  `S${i + 1}`,
      status: "available",
    })),
  };
}

const DEFAULT_LABELS = [
  { id: "screen",   type: "screen",   label: "SCREEN",   x: 200, y: 16 },
  { id: "entrance", type: "entrance", label: "ENTRANCE", x: 16,  y: 16 },
  { id: "exit",     type: "exit",     label: "EXIT",     x: 16,  y: 630 },
];

// ─── StaticLabel ──────────────────────────────────────────────────────────────
function StaticLabel({ item }) {
  const isScreen = item.type === "screen";
  return (
    <div style={{
      position: "absolute",
      left: item.x,
      top: item.y,
      background: isScreen ? "#1B2A4A" : "#fff",
      color: isScreen ? "#C9A84C" : "#1B2A4A",
      border: `2.5px solid ${isScreen ? "#C9A84C" : "#1B2A4A"}`,
      borderRadius: isScreen ? 6 : 24,
      padding: isScreen ? "10px 28px" : "7px 22px",
      fontFamily: F.body,
      fontWeight: 700,
      fontSize: isScreen ? 18 : 16,
      letterSpacing: 3,
      textTransform: "uppercase",
      userSelect: "none",
      zIndex: 5,
      boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
      whiteSpace: "nowrap",
      pointerEvents: "none",
    }}>
      {item.label}
    </div>
  );
}

// ─── DraggableLabel ───────────────────────────────────────────────────────────
function DraggableLabel({ item, onDragStart, isDragging }) {
  const [hovered, setHovered] = useState(false);
  const isScreen = item.type === "screen";
  const color    = isScreen ? "#C9A84C" : "#1B2A4A";

  return (
    <div
      title={`Drag to move ${item.label}`}
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        background: isScreen ? "#1B2A4A" : "#fff",
        color,
        border: `2.5px solid ${isScreen ? "#C9A84C" : "#1B2A4A"}`,
        borderRadius: isScreen ? 6 : 24,
        padding: isScreen ? "10px 28px" : "7px 22px",
        fontFamily: F.body,
        fontWeight: 700,
        fontSize: isScreen ? 18 : 16,
        letterSpacing: 3,
        textTransform: "uppercase",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        zIndex: 5,
        boxShadow: hovered || isDragging
          ? `0 4px 16px rgba(0,0,0,0.22), 0 0 0 2px ${isScreen ? "#C9A84C" : "#1B2A4A"}44`
          : "0 2px 8px rgba(0,0,0,0.10)",
        whiteSpace: "nowrap",
        transform: isDragging ? "scale(1.06)" : hovered ? "scale(1.03)" : "scale(1)",
        transition: isDragging ? "box-shadow 0.1s" : "transform 0.13s, box-shadow 0.13s",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
      onMouseDown={e => { e.stopPropagation(); onDragStart(e, item.id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 2, opacity: 0.45, marginRight: 1 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ display: "flex", gap: 2 }}>
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: color, display: "block" }} />
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: color, display: "block" }} />
          </span>
        ))}
      </span>
      {item.label}
    </div>
  );
}

// ─── Seat Node ────────────────────────────────────────────────────────────────
function SeatNode({ seat, isSelected, editMode, isDragging, onSeatClick, onSeatDragStart }) {
  const color   = STATUS_COLORS[seat.status] || STATUS_COLORS.available;
  const [hovered, setHovered] = useState(false);
  const blocked = !editMode && (seat.status === "reserved" || seat.status === "pending");
  const canHover = !editMode && !blocked;

  return (
    <div
      onClick={e => { e.stopPropagation(); if (!isDragging && !blocked) onSeatClick && onSeatClick(seat); }}
      onMouseDown={editMode ? e => { e.stopPropagation(); onSeatDragStart && onSeatDragStart(e, seat.id); } : undefined}
      onMouseEnter={() => canHover && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={blocked ? (seat.status === "reserved" ? "This seat is already reserved" : "This seat is pending approval") : undefined}
      style={{
        width: 44, height: 44, borderRadius: "50%",
        background: isSelected ? "#1B2A4A" : color,
        border: isSelected
          ? "2.5px solid #C9A84C"
          : hovered
          ? "2.5px solid #1B2A4A"
          : "2.5px solid rgba(255,255,255,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: editMode ? "grab" : blocked ? "not-allowed" : "pointer",
        boxShadow: isSelected
          ? "0 0 0 3px #C9A84C, 0 2px 8px rgba(0,0,0,0.3)"
          : hovered
          ? "0 0 0 2px rgba(201,168,76,0.5), 0 2px 8px rgba(0,0,0,0.2)"
          : "0 2px 6px rgba(0,0,0,0.18)",
        transform: isSelected ? "scale(1.12)" : hovered ? "scale(1.08)" : "scale(1)",
        opacity: blocked ? 0.75 : 1,
        flexShrink: 0, userSelect: "none",
        transition: "all 0.15s ease",
      }}
    >
      <span style={{ color: isSelected ? "#C9A84C" : "#fff", fontSize: 14, fontWeight: 800, fontFamily: F.body, lineHeight: 1, pointerEvents: "none" }}>
        {seat.num}
      </span>
    </div>
  );
}

// ─── Table Node ───────────────────────────────────────────────────────────────
function TableNode({
  table, editMode, isTableSelected, selectedSeatId,
  onSelectTable, onDragStart, onResizeStart, onSeatClick, onLabelEdit,
  isDragging, onSeatMove,
}) {
  const [hovered, setHovered]               = useState(false);
  const [editingLabel, setEditingLabel]     = useState(false);
  const [labelVal, setLabelVal]             = useState(table.label || table.id);
  const [draggingSeatId, setDraggingSeatId] = useState(null);
  const [dropSide, setDropSide]             = useState(null);
  const [ghostXY, setGhostXY]               = useState(null);
  const tableBodyRef = useRef(null);
  const seatDragRef  = useRef(null);

  useEffect(() => { setLabelVal(table.label || table.id); }, [table.label, table.id]);

  const SEAT_D = 44, SEAT_GAP = 8, SEAT_OFF = 10;
  const tableW = Math.max(table.width  || 140, 80);
  const tableH = Math.max(table.height || 70,  50);
  const isCircle = table.shape === "circle";

  const maxH = Math.max(1, Math.floor((tableW + SEAT_GAP) / (SEAT_D + SEAT_GAP)));
  const maxV = Math.max(1, Math.floor((tableH + SEAT_GAP) / (SEAT_D + SEAT_GAP)));
  const byPos = { top: [], bottom: [], left: [], right: [] };
  const free  = [];
  table.seats.forEach((s, i) => s.position ? byPos[s.position].push(s) : free.push(s));
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
      const r  = tableBodyRef.current.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      const dists = { top: cy, bottom: r.height - cy, left: cx, right: r.width - cx };
      const side  = Object.entries(dists).sort((a,b) => a[1] - b[1])[0][0];
      setDropSide(side);
    };
    const onUp = () => {
      if (seatDragRef.current?.seatId && dropSide)
        onSeatMove && onSeatMove(table.id, seatDragRef.current.seatId, dropSide);
      seatDragRef.current = null;
      setDraggingSeatId(null); setDropSide(null); setGhostXY(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [draggingSeatId, dropSide, onSeatMove, table.id]);

  const renderSide = (seats, side) => {
    if (!seats.length) return null;
    const horiz = side === "top" || side === "bottom";
    const rowPx = seats.length * (SEAT_D + SEAT_GAP) - SEAT_GAP;
    const pos   = {
      top:    { top: 0,                          left: tOffX + tableW / 2 - rowPx / 2 },
      bottom: { top: tOffY + tableH + SEAT_OFF,  left: tOffX + tableW / 2 - rowPx / 2 },
      left:   { left: 0,                         top:  tOffY + tableH / 2 - rowPx / 2 },
      right:  { left: tOffX + tableW + SEAT_OFF, top:  tOffY + tableH / 2 - rowPx / 2 },
    }[side];
    return (
      <div key={side} style={{ position: "absolute", display: "flex", flexDirection: horiz ? "row" : "column", gap: SEAT_GAP, ...pos }}>
        {seats.map(seat => (
          <SeatNode key={seat.id} seat={seat} editMode={editMode}
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
        const seat = table.seats.find(s => s.id === draggingSeatId);
        if (!seat) return null;
        return (
          <div style={{
            position: "fixed", left: ghostXY.x - 22, top: ghostXY.y - 22,
            width: 44, height: 44, borderRadius: "50%",
            background: STATUS_COLORS[seat.status] || STATUS_COLORS.available,
            border: "2.5px solid rgba(255,255,255,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none", zIndex: 9999,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35), 0 0 0 3px #C9A84C",
            transform: "scale(1.2)", opacity: 0.93,
          }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: F.body }}>{seat.num}</span>
          </div>
        );
      })()}

      <div
        style={{ position: "absolute", left: table.x, top: table.y, width: contW, height: contH, overflow: "visible", zIndex: isTableSelected ? 10 : 1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {["top", "bottom", "left", "right"].map(side => renderSide(byPos[side], side))}

        <div ref={tableBodyRef} style={{
            position: "absolute", left: tOffX, top: tOffY, width: tableW, height: tableH,
            background: isTableSelected ? "#162240" : "#2C3E6B",
            borderRadius: isCircle ? "50%" : 12,
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            border: isTableSelected ? "2.5px solid #C9A84C"
                  : hovered          ? "2.5px solid rgba(201,168,76,0.6)"
                  : "2.5px solid rgba(255,255,255,0.08)",
            boxShadow: isTableSelected ? "0 0 0 3px #C9A84C66, 0 4px 16px rgba(0,0,0,0.22)"
                     : hovered         ? "0 0 0 2px rgba(201,168,76,0.35), 0 4px 16px rgba(0,0,0,0.22)"
                     : isDragging      ? "0 8px 24px rgba(0,0,0,0.30)"
                     : "0 3px 10px rgba(0,0,0,0.22)",
            transition: "border 0.15s, box-shadow 0.15s",
            cursor: editMode ? (isDragging ? "grabbing" : "grab") : "pointer",
            zIndex: 2, overflow: "visible",
          }}
          onMouseDown={editMode ? e => { if (!draggingSeatId) { e.stopPropagation(); onDragStart(e, table.id); } } : undefined}
          onClick={e => { e.stopPropagation(); onSelectTable(table); }}
          onDoubleClick={editMode ? e => { e.stopPropagation(); setEditingLabel(true); } : undefined}
        >
          {editMode && draggingSeatId && ["top", "bottom", "left", "right"].map(side => {
            const active = dropSide === side;
            const sStyle = { position: "absolute", zIndex: 10, pointerEvents: "none", borderRadius: 6, transition: "all 0.1s",
              background: active ? "rgba(201,168,76,0.25)" : "rgba(201,168,76,0.07)",
              border:     active ? "2px dashed #C9A84C"    : "2px dashed rgba(201,168,76,0.3)" };
            const P = 5;
            if (side === "top")    return <div key={side} style={{ ...sStyle, top: P,    left: P,  right: P,  height: 30 }} />;
            if (side === "bottom") return <div key={side} style={{ ...sStyle, bottom: P, left: P,  right: P,  height: 30 }} />;
            if (side === "left")   return <div key={side} style={{ ...sStyle, left: P,   top: P,   bottom: P, width: 30  }} />;
            if (side === "right")  return <div key={side} style={{ ...sStyle, right: P,  top: P,   bottom: P, width: 30  }} />;
            return null;
          })}

          {editingLabel ? (
            <input autoFocus value={labelVal}
              onChange={e => setLabelVal(e.target.value)}
              onBlur={() => { setEditingLabel(false); onLabelEdit && onLabelEdit(table.id, labelVal); }}
              onKeyDown={e => { if (e.key === "Enter") { setEditingLabel(false); onLabelEdit && onLabelEdit(table.id, labelVal); } e.stopPropagation(); }}
              onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
              style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontFamily: F.body, fontWeight: 700, fontSize: 16, letterSpacing: 1.5, textAlign: "center", width: "85%", textTransform: "uppercase" }}
            />
          ) : (
            <>
              <div style={{ color: "#fff", fontFamily: F.body, fontWeight: 700, fontSize: 16, letterSpacing: 1.5, textTransform: "uppercase", lineHeight: 1.3, textAlign: "center", padding: "0 8px" }}>
                {table.label || table.id}
              </div>
              {table.seats.length > 0 && (
                <div style={{ color: "#A0AABB", fontFamily: F.body, fontSize: 13, letterSpacing: 1, marginTop: 3 }}>
                  {table.seats.length} SEATS
                </div>
              )}
            </>
          )}

          {editMode && isTableSelected && (
            <>
              <div style={{ position: "absolute", width: 10, height: 10, background: "#C9A84C", borderRadius: 2, cursor: "ew-resize",   zIndex: 20, border: "1.5px solid #fff", right: -5,  top: "50%",   transform: "translateY(-50%)" }} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, table.id, "e");  }} />
              <div style={{ position: "absolute", width: 10, height: 10, background: "#C9A84C", borderRadius: 2, cursor: "ns-resize",   zIndex: 20, border: "1.5px solid #fff", bottom: -5, left: "50%",  transform: "translateX(-50%)" }} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, table.id, "s");  }} />
              <div style={{ position: "absolute", width: 10, height: 10, background: "#C9A84C", borderRadius: 2, cursor: "nwse-resize", zIndex: 20, border: "1.5px solid #fff", right: -5,  bottom: -5 }}                               onMouseDown={e => { e.stopPropagation(); onResizeStart(e, table.id, "se"); }} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── HowToUse ─────────────────────────────────────────────────────────────────
function HowToUse() {
  const [open, setOpen] = useState(false);
  const tips = [
    ["🖱️", "Click the + Table button, then click anywhere on the canvas to place a new table."],
    ["✋",  "Drag any table to reposition it on the canvas."],
    ["↔️",  "Drag the gold handles on a selected table to resize it (right, bottom, corner)."],
    ["🖊️",  "Double-click a table to rename it inline."],
    ["🪑",  "Click a seat to select it, then edit its label, number, and status in the Inspector."],
    ["🏷️",  "Drag SCREEN, ENTRANCE, EXIT labels anywhere on the canvas."],
    ["🗑️",  "Removing all seats from a table auto-deletes it."],
    ["💾",  "Click Save Layout to push changes live to the client view."],
  ];
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: open ? "#1B2A4A" : "#fff", color: open ? "#C9A84C" : "#1B2A4A",
        border: "2px solid #1B2A4A", borderRadius: 8, padding: "7px 16px",
        fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 1.2,
        cursor: "pointer", textTransform: "uppercase", transition: "all 0.15s",
        width: "100%", justifyContent: "space-between",
      }}>
        <span>? How to Use</span>
        <span style={{ fontSize: 9 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 8, background: "#fff", border: "1.5px solid #E8E3DC", borderRadius: 10, padding: "14px 18px", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", textTransform: "uppercase", marginBottom: 10 }}>Editor Instructions</div>
          {tips.map(([icon, text], i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 12, color: "#555", lineHeight: 1.55, fontFamily: F.body }}>{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inspector ────────────────────────────────────────────────────────────────
function Inspector({ selected, selectedTable, selectedSeatObj, tables, setTables, addSeat, deleteSeat, deleteTable, updateTable, handleSeatLabelEdit, handleSeatStatus, handleSeatPosition }) {
  const iLabel = t => <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#999", textTransform: "uppercase", marginBottom: 4, marginTop: 12 }}>{t}</div>;
  const iInput = props => <input style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #E8E3DC", borderRadius: 6, fontFamily: F.body, fontSize: 13, color: "#1B2A4A", background: "#FAFAF7", boxSizing: "border-box", outline: "none" }} {...props} />;
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 14px rgba(0,0,0,0.07)", fontFamily: F.body }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", textTransform: "uppercase" }}>Inspector</span>
        {selected && <span style={{ fontSize: 11, color: "#999" }}>{selected.type === "table" ? selectedTable?.label : `Seat ${selectedSeatObj?.num}`}</span>}
      </div>
      {!selected && <div style={{ color: "#C8C2BA", fontSize: 12, lineHeight: 1.65 }}>Click a table or seat on the canvas to edit its properties.</div>}
      {selected?.type === "table" && selectedTable && (
        <>
          {iLabel("Table Label")}
          {iInput({ value: selectedTable.label || selectedTable.id, onChange: e => updateTable("label", e.target.value) })}
          {iLabel("Shape")}
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {["rect", "circle"].map(shape => (
              <button key={shape} onClick={() => updateTable("shape", shape)} style={{ flex: 1, padding: "8px 0", background: (selectedTable.shape || "rect") === shape ? "#1B2A4A" : "transparent", color: (selectedTable.shape || "rect") === shape ? "#fff" : "#1B2A4A", border: "2px solid #1B2A4A", borderRadius: shape === "circle" ? 20 : 6, fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase" }}>
                {shape === "rect" ? "▭ Rect" : "⬤ Round"}
              </button>
            ))}
          </div>
          {iLabel(`Seats · ${selectedTable.seats.length}`)}
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <button onClick={addSeat}   style={{ flex: 1, padding: "8px 0", background: "transparent", color: "#4CAF79", border: "2px solid #4CAF79", borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>＋ Add</button>
            <button onClick={deleteSeat} style={{ flex: 1, padding: "8px 0", background: "transparent", color: "#E05252", border: "2px solid #E05252", borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>− Remove</button>
          </div>
          <div style={{ marginTop: 8, padding: "8px 10px", background: "#F7F3EA", borderRadius: 6, fontSize: 11, color: "#888", fontFamily: F.body, lineHeight: 1.5 }}>
            💡 Drag the <strong style={{ color: "#C9A84C" }}>gold handles</strong> to resize.
          </div>
          <button onClick={() => deleteTable()} style={{ width: "100%", marginTop: 12, padding: "10px 0", background: "#E05252", color: "#fff", border: "none", borderRadius: 7, fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 1.2, cursor: "pointer", textTransform: "uppercase" }}>🗑 Delete Table</button>
        </>
      )}
      {selected?.type === "seat" && selectedSeatObj && (
        <>
          {iLabel("Seat Label")}
          {iInput({ value: selectedSeatObj.label || selectedSeatObj.num, onChange: e => handleSeatLabelEdit(e.target.value) })}
          {iLabel("Seat Number")}
          {iInput({ type: "number", value: selectedSeatObj.num, onChange: e => setTables(prev => prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, num: Number(e.target.value) } : s) })) })}
          {iLabel("Status")}
          <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
            {SEAT_STATUS_CYCLE.map(status => (
              <button key={status} onClick={() => handleSeatStatus(status)} style={{ flex: 1, padding: "8px 0", background: selectedSeatObj.status === status ? STATUS_COLORS[status] : "transparent", border: `2px solid ${STATUS_COLORS[status]}`, borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 10, color: selectedSeatObj.status === status ? "#fff" : STATUS_COLORS[status], cursor: "pointer", textTransform: "uppercase" }}>
                {status === "available" ? "Avail" : status === "pending" ? "Pend" : "Res"}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8, padding: "7px 10px", background: "#F0F4FF", borderRadius: 6, fontSize: 11, color: "#5A6A8A", fontFamily: F.body, lineHeight: 1.5, textAlign: "center" }}>🪑 Drag this seat on the canvas to move it to any side of the table</div>
        </>
      )}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 10, textTransform: "uppercase" }}>Status Legend</div>
      {Object.entries(STATUS_COLORS).map(([key, color]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: color, flexShrink: 0 }} />
          <span style={{ fontFamily: F.body, fontSize: 12, color: "#333", fontWeight: 500 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ScaledCanvas ─────────────────────────────────────────────────────────────
function ScaledCanvas({ virtualW, virtualH, children, onScale }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      const w = containerRef.current?.offsetWidth || virtualW;
      const s = w / virtualW;
      setScale(s);
      onScale && onScale(s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [virtualW, onScale]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: virtualH * scale, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: virtualW, height: virtualH, transformOrigin: "top left", transform: `scale(${scale})`, overflow: "visible" }}>
        {children}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SeatMap({
  tableData,
  editMode = false,
  selectedSeat,
  highlightedTable,
  onSeatClick,
  onTableClick,
  windowWidth,
  wing,
  room,
}) {
  const normalize = useCallback((td) => {
    if (!td) return [];
    if (Array.isArray(td)) return td.map(t => ({ shape: "rect", width: 110, height: 70, ...t }));
    return [{ shape: "rect", width: 110, height: 70, ...td }];
  }, []);

  const [tables, setTables]             = useState(() => editMode ? [] : normalize(tableData));
  const [labels, setLabels]             = useState(DEFAULT_LABELS);
  const [selected, setSelected]         = useState(null);
  const [saved, setSaved]               = useState(false);
  const [tool, setTool]                 = useState("select");
  const [activeDragId, setActiveDragId] = useState(null);

  const dragging      = useRef(null);
  const canvasRef     = useRef(null);
  const adminScaleRef = useRef(1);

  // ── ADMIN: load saved layout ──────────────────────────────────────────────
  useEffect(() => {
    if (!editMode || !wing || !room) return;
    try {
      const raw = localStorage.getItem(`seatmap:${wing}:${room}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        let norm = normalize(parsed).filter(t => t.seats && t.seats.length > 0);

        if (norm.length > 0) {
          const SEAT_APPROX_W = 32, SEAT_GAP_PX = 6, PAD = 40;
          const allX = norm.flatMap(t => {
            const half = Math.ceil((t.seats?.length || 0) / 2);
            const rowW = Math.max(half * (SEAT_APPROX_W + SEAT_GAP_PX) - SEAT_GAP_PX, t.width || 110);
            return [t.x, t.x + rowW + 10];
          });
          const allY = norm.flatMap(t => [t.y - 44, t.y + (t.height || 54) + 44]);
          const minX = Math.min(...allX);
          const minY = Math.min(...allY);
          const shiftX = minX < PAD ? PAD - minX : 0;
          const shiftY = minY < PAD ? PAD - minY : 0;
          if (shiftX !== 0 || shiftY !== 0) {
            norm = norm.map(t => ({ ...t, x: t.x + shiftX, y: t.y + shiftY }));
          }
        }

        setTables(norm);
        norm.forEach(t => {
          const n = parseInt(t.id?.replace(/\D/g, "")) || 0;
          if (n >= _tableCounter) _tableCounter = n + 1;
        });
      }
    } catch {}
    try {
      const lRaw = localStorage.getItem(`seatmap_labels:${wing}:${room}`);
      if (lRaw) setLabels(JSON.parse(lRaw));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, wing, room]);

  // ── CLIENT: sync tables from prop ────────────────────────────────────────
  useEffect(() => {
    if (editMode) return;
    const norm = normalize(tableData).filter(t => t.seats && t.seats.length > 0);
    setTables(norm);
  }, [tableData, normalize, editMode]);

  // ── CLIENT: load label positions & listen for admin saves ─────────────────
  useEffect(() => {
    if (editMode || !wing || !room) return;
    const LABEL_KEY = `seatmap_labels:${wing}:${room}`;
    const loadLabels = () => {
      try {
        const lRaw = localStorage.getItem(LABEL_KEY);
        if (lRaw) setLabels(JSON.parse(lRaw));
      } catch {}
    };
    loadLabels();
    const onStorage = (e) => { if (e.key === LABEL_KEY) loadLabels(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [editMode, wing, room]);

  const selectedTable   = selected?.type === "table" ? tables.find(t => t.id === selected.tableId) : null;
  const selectedSeatObj = selected?.type === "seat"
    ? tables.find(t => t.id === selected.tableId)?.seats.find(s => s.id === selected.seatId)
    : null;

  // ── Global mouse move/up ──────────────────────────────────────────────────
  useEffect(() => {
    if (!editMode) return;
    const onMove = (e) => {
      const d = dragging.current;
      if (!d) return;
      const s = adminScaleRef.current || 1;
      if (d.type === "label") {
        setLabels(prev => prev.map(l => l.id === d.id ? { ...l, x: Math.max(0, d.originX + (e.clientX - d.startX) / s), y: Math.max(0, d.originY + (e.clientY - d.startY) / s) } : l));
      } else if (d.type === "table") {
        setTables(prev => prev.map(t => t.id === d.id ? { ...t, x: Math.max(0, d.originX + (e.clientX - d.startX) / s), y: Math.max(0, d.originY + (e.clientY - d.startY) / s) } : t));
      } else if (d.type === "resize") {
        const dx = (e.clientX - d.startX) / s, dy = (e.clientY - d.startY) / s;
        setTables(prev => prev.map(t => {
          if (t.id !== d.id) return t;
          return {
            ...t,
            width:  (d.dir === "e" || d.dir === "se") ? Math.max(60, d.originW + dx) : t.width,
            height: (d.dir === "s" || d.dir === "se") ? Math.max(40, d.originH + dy) : t.height,
          };
        }));
      }
    };
    const onUp = () => { dragging.current = null; setActiveDragId(null); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [editMode]);

  const startTableDrag = useCallback((e, id) => {
    e.preventDefault();
    const t = tables.find(t => t.id === id);
    dragging.current = { type: "table", id, startX: e.clientX, startY: e.clientY, originX: t?.x || 0, originY: t?.y || 0 };
    setActiveDragId(id);
  }, [tables]);

  const startLabelDrag = useCallback((e, id) => {
    e.preventDefault();
    const l = labels.find(l => l.id === id);
    dragging.current = { type: "label", id, startX: e.clientX, startY: e.clientY, originX: l?.x || 0, originY: l?.y || 0 };
    setActiveDragId(id);
  }, [labels]);

  const startResize = useCallback((e, id, dir) => {
    e.preventDefault();
    const t = tables.find(t => t.id === id);
    dragging.current = { type: "resize", id, dir, startX: e.clientX, startY: e.clientY, originW: t?.width || 110, originH: t?.height || 54 };
  }, [tables]);

  const handleCanvasClick = (e) => {
    if (!editMode || tool !== "addTable") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const s = adminScaleRef.current || 1;
    const t = makeTable(
      Math.max(0, (e.clientX - rect.left) / s - 55),
      Math.max(0, (e.clientY - rect.top)  / s - 27)
    );
    setTables(prev => [...prev, t]);
    setSelected({ type: "table", tableId: t.id });
    setTool("select");
  };

  const deleteTable = (id) => {
    const tid = id || selected?.tableId;
    if (!tid) return;
    setTables(prev => prev.filter(t => t.id !== tid));
    if (!id || selected?.tableId === tid) setSelected(null);
  };

  const addSeat = () => {
    if (!selected?.tableId) return;
    setTables(prev => prev.map(t => {
      if (t.id !== selected.tableId) return t;
      const num = (t.seats.length || 0) + 1;
      return { ...t, seats: [...t.seats, { id: `${t.id}-S${num}`, num, label: `S${num}`, status: "available" }] };
    }));
  };

  const deleteSeat = () => {
    if (!selected?.tableId) return;
    setTables(prev => {
      const updated  = prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.slice(0, -1) });
      const filtered = updated.filter(t => t.seats.length > 0);
      if (filtered.length < updated.length) setSelected(null);
      return filtered;
    });
  };

  const updateTable         = (key, val)       => { if (!selected?.tableId) return; setTables(prev => prev.map(t => t.id === selected.tableId ? { ...t, [key]: val } : t)); };
  const handleLabelEdit     = (tableId, val)   => setTables(prev => prev.map(t => t.id === tableId ? { ...t, label: val } : t));
  const handleSeatLabelEdit = (val)            => { if (!selected?.seatId) return; setTables(prev => prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, label: val } : s) })); };
  const handleSeatStatus    = (status)         => { if (!selected?.seatId) return; setTables(prev => prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, status } : s) })); };
  const handleSeatPosition  = (position)       => { if (!selected?.seatId) return; setTables(prev => prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, position } : s) })); };
  const handleSeatMove = (tableId, seatId, newPosition) => {
    setTables(prev => prev.map(t => t.id !== tableId ? t : {
      ...t,
      seats: t.seats.map(s => s.id === seatId ? { ...s, position: newPosition } : s),
    }));
  };
  const handleSeatClick   = (seat, tableId) => { if (!editMode) { onSeatClick && onSeatClick(seat, tableId); return; } setSelected({ type: "seat", tableId, seatId: seat.id }); };
  const handleTableSelect = (table)         => { if (editMode) { setSelected({ type: "table", tableId: table.id }); return; } onTableClick && onTableClick(table); };

  // ── Save layout (admin) ───────────────────────────────────────────────────
  // Uses dispatchSeatMapUpdate so the client view reacts immediately in the
  // same tab without needing to reload.
  const handleSave = () => {
    if (wing && room) {
      const payload = tables.length === 1 ? tables[0] : tables;
      dispatchSeatMapUpdate(wing, room, payload);
      try {
        const labelKey = `seatmap_labels:${wing}:${room}`;
        localStorage.setItem(labelKey, JSON.stringify(labels));
        window.dispatchEvent(new StorageEvent("storage", { key: labelKey, newValue: JSON.stringify(labels) }));
      } catch {}
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TBtn = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{ padding: "8px 16px", border: `2px solid ${active ? "#C9A84C" : "#D8D2C8"}`, background: active ? "#C9A84C" : "#fff", color: active ? "#1B2A4A" : "#555", borderRadius: 8, fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase", transition: "all 0.13s", whiteSpace: "nowrap" }}>{label}</button>
  );

  const canvasStyle = {
    background: "#EFEAD9",
    borderRadius: 12,
    overflow: "hidden",
    userSelect: "none",
    boxShadow: "0 4px 20px rgba(27,42,74,0.06)",
    width: "100%",
  };

  // ══════════════════════════════════════════════════════════════════════════
  // CLIENT VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (!editMode) {
    const VIRTUAL_W = 1200;
    const VIRTUAL_H = 700;

    return (
      <div style={{ fontFamily: F.body, width: "100%" }}>
        <div style={{ ...canvasStyle, overflow: "hidden" }}>
          <ScaledCanvas virtualW={VIRTUAL_W} virtualH={VIRTUAL_H}>
            {labels.map(lbl => <StaticLabel key={lbl.id} item={lbl} />)}
            {tables.map(table => (
              <TableNode
                key={table.id} table={table} editMode={false}
                isTableSelected={highlightedTable ? highlightedTable.id === table.id : false}
                selectedSeatId={selectedSeat ? selectedSeat.id : null}
                onSelectTable={handleTableSelect} onDragStart={() => {}}
                onResizeStart={() => {}} onSeatClick={handleSeatClick}
                onLabelEdit={undefined} isDragging={false}
              />
            ))}
          </ScaledCanvas>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN / EDIT VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: F.body, width: "100%" }}>

      <h2 style={{ margin: "0 0 16px 0", fontFamily: F.display, fontSize: 26, fontWeight: 700, color: "#1B2A4A", letterSpacing: 0.5 }}>
        Layout Editor
        {wing && room && <span style={{ fontSize: 14, fontFamily: F.body, fontWeight: 400, color: "#8A7F6E", marginLeft: 12 }}>{wing} — {room}</span>}
      </h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <TBtn label="☰ Select"  active={tool === "select"}   onClick={() => setTool("select")} />
        <TBtn label="＋ Table"  active={tool === "addTable"} onClick={() => setTool("addTable")} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {saved && (
            <span style={{ padding: "5px 12px", background: "#E8F5EE", color: "#4CAF79", borderRadius: 5, fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 1 }}>
              ✓ Saved
            </span>
          )}
          <button onClick={handleSave} style={{ padding: "8px 22px", background: "#1B2A4A", color: "#fff", border: "none", borderRadius: 8, fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, cursor: "pointer", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            💾 Save Layout
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* LEFT — canvas */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <div style={{
            ...canvasStyle,
            border: tool === "addTable" ? "2px dashed #C9A84C" : "2px solid transparent",
            transition: "border 0.2s",
            overflow: "hidden",
          }}>
            {tool === "addTable" && (
              <div style={{ background: "#C9A84C", color: "#1B2A4A", padding: "6px 0", textAlign: "center", fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 1.5 }}>
                CLICK ANYWHERE BELOW TO PLACE A TABLE
              </div>
            )}
            <ScaledCanvas virtualW={1200} virtualH={700} onScale={s => { adminScaleRef.current = s; }}>
              <div
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, cursor: tool === "addTable" ? "crosshair" : "default" }}
                onClick={handleCanvasClick}
                onMouseDown={e => { if (tool === "select" && e.target === canvasRef.current) setSelected(null); }}
              />

              {labels.map(lbl => (
                <DraggableLabel key={lbl.id} item={lbl}
                  onDragStart={(e, id) => startLabelDrag(e, id)}
                  isDragging={activeDragId === lbl.id} />
              ))}

              {tables.map(table => (
                <TableNode
                  key={table.id} table={table} editMode={true}
                  isTableSelected={selected?.tableId === table.id}
                  selectedSeatId={selected?.type === "seat" && selected?.tableId === table.id ? selected.seatId : null}
                  onSelectTable={handleTableSelect}
                  onDragStart={startTableDrag} onResizeStart={startResize}
                  onSeatClick={handleSeatClick} onLabelEdit={handleLabelEdit}
                  isDragging={activeDragId === table.id}
                  onSeatMove={handleSeatMove}
                />
              ))}

              {tables.length === 0 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>🪑</div>
                  <div style={{ fontFamily: F.body, fontSize: 12, color: "#A09890", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>No tables yet — click + Table to add one</div>
                </div>
              )}
            </ScaledCanvas>
          </div>
        </div>

        {/* RIGHT — panels */}
        <div style={{ flex: "0 0 280px", width: 280, display: "flex", flexDirection: "column", gap: 14 }}>
          <HowToUse />
          <Inspector
            selected={selected} selectedTable={selectedTable} selectedSeatObj={selectedSeatObj}
            tables={tables} setTables={setTables}
            addSeat={addSeat} deleteSeat={deleteSeat} deleteTable={deleteTable}
            updateTable={updateTable} handleSeatLabelEdit={handleSeatLabelEdit}
            handleSeatStatus={handleSeatStatus} handleSeatPosition={handleSeatPosition}
          />
          <Legend />
          <div style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 8, textTransform: "uppercase" }}>Draggable Labels</div>
            <div style={{ fontSize: 11, color: "#888", fontFamily: F.body, marginBottom: 8, lineHeight: 1.5 }}>Drag these on the canvas:</div>
            {labels.map(lbl => (
              <div key={lbl.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: lbl.type === "screen" ? "#1B2A4A" : "#D8D2C8", flexShrink: 0 }} />
                <span style={{ fontFamily: F.body, fontSize: 12, color: "#555", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>{lbl.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#bbb" }}>⠿ drag</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}