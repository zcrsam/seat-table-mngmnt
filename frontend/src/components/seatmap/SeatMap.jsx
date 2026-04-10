// src/components/seatmap/SeatMap.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { dispatchSeatMapUpdate } from "../../utils/seatMapPersistence.js";

// ─── Status Colors ────────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  available: "#4A9E7E",
  pending:   "#C4A35A",
  reserved:  "#B85C5C",
};
export const STATUS_LABELS = {
  available: "AVAILABLE",
  pending:   "PENDING",
  reserved:  "RESERVED",
};

const SEAT_STATUS_CYCLE = ["available", "pending", "reserved"];

const F = {
  display: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  body:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
  label:   "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function getTokens(isDark) {
  return isDark ? {
    gold: "#C4A35A",
    goldLight: "#D9BC7A",
    goldDim: "#8C7240",
    goldFaint: "rgba(196,163,90,0.10)",
    goldFaintest: "rgba(196,163,90,0.05)",
    pageBg: "#0A0908",
    surfaceBase: "#111009",
    surfaceRaised: "#161410",
    surfaceInput: "rgba(255,255,255,0.06)",
    borderFaint: "rgba(255,255,255,0.04)",
    borderDefault: "rgba(255,255,255,0.10)",
    borderStrong: "rgba(255,255,255,0.16)",
    borderAccent: "rgba(196,163,90,0.35)",
    textPrimary: "#EDE8DF",
    textSecondary: "#8A8278",
    textTertiary: "rgba(237,232,223,0.35)",
    textOnAccent: "#0A0908",
    red: "#B85C5C",
    green: "#4A9E7E",
    divider: "rgba(255,255,255,0.06)",
    canvasBg: "#0D0C0A",
    canvasBorder: "rgba(196,163,90,0.15)",
    tableBg: "#1C1A14",
    tableSelected: "#241F14",
    cardBg: "#111009",
    cardBorder: "rgba(255,255,255,0.08)",
    seatBorder: "rgba(255,255,255,0.22)",
    colorScheme: "dark",
    navBg: "rgba(10,9,8,0.97)",
    navBorder: "rgba(196,163,90,0.12)",
    inputFocusShadow: "0 0 0 3px rgba(196,163,90,0.12)",
    spinnerBorder: "rgba(255,255,255,0.15)",
    spinnerTop: "#C4A35A",
    headerGradient: "linear-gradient(160deg,#111009 0%,#161410 100%)",
    statusNoteGold: "rgba(196,163,90,0.05)",
    statusNoteBorderGold: "rgba(196,163,90,0.15)",
    greenFaint: "rgba(74,158,126,0.08)",
    greenBorder: "rgba(74,158,126,0.20)",
    redFaint: "rgba(184,92,92,0.08)",
    redBorder: "rgba(184,92,92,0.20)",
  } : {
    gold: "#8C6B2A",
    goldLight: "#A07D38",
    goldDim: "#6B5020",
    goldFaint: "rgba(140,107,42,0.09)",
    goldFaintest: "rgba(140,107,42,0.04)",
    pageBg: "#F7F4EE",
    surfaceBase: "#FFFFFF",
    surfaceRaised: "#FAF8F4",
    surfaceInput: "#FFFFFF",
    borderFaint: "rgba(0,0,0,0.04)",
    borderDefault: "rgba(0,0,0,0.10)",
    borderStrong: "rgba(0,0,0,0.16)",
    borderAccent: "rgba(140,107,42,0.30)",
    textPrimary: "#18140E",
    textSecondary: "#7A7060",
    textTertiary: "rgba(24,20,14,0.38)",
    textOnAccent: "#FFFFFF",
    red: "#A03838",
    green: "#2E7A5A",
    divider: "rgba(0,0,0,0.06)",
    canvasBg: "#EEE8D5",
    canvasBorder: "rgba(140,107,42,0.20)",
    tableBg: "#FFFFFF",
    tableSelected: "#FDF8EE",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.08)",
    seatBorder: "rgba(0,0,0,0.15)",
    colorScheme: "light",
    navBg: "rgba(247,244,238,0.97)",
    navBorder: "rgba(140,107,42,0.14)",
    inputFocusShadow: "0 0 0 3px rgba(140,107,42,0.10)",
    spinnerBorder: "rgba(0,0,0,0.12)",
    spinnerTop: "#8C6B2A",
    headerGradient: "linear-gradient(160deg,#FAF8F4 0%,#F2EDE0 100%)",
    statusNoteGold: "rgba(140,107,42,0.05)",
    statusNoteBorderGold: "rgba(140,107,42,0.18)",
    greenFaint: "rgba(46,122,90,0.07)",
    greenBorder: "rgba(46,122,90,0.18)",
    redFaint: "rgba(160,56,56,0.07)",
    redBorder: "rgba(160,56,56,0.18)",
  };
}

// Edit mode always uses the same token set as the admin (light-based, matches ManageBooking)
function getEditTokens() {
  return {
    gold: "#C4A35A",
    goldLight: "#D9BC7A",
    goldDim: "#8C7240",
    goldFaint: "rgba(196,163,90,0.10)",
    goldFaintest: "rgba(196,163,90,0.05)",
    pageBg: "#0A0908",
    surfaceBase: "#0F0E0C",
    surfaceRaised: "#161410",
    surfaceInput: "rgba(255,255,255,0.06)",
    borderFaint: "rgba(255,255,255,0.04)",
    borderDefault: "rgba(255,255,255,0.10)",
    borderStrong: "rgba(255,255,255,0.16)",
    borderAccent: "rgba(196,163,90,0.35)",
    textPrimary: "#EDE8DF",
    textSecondary: "#8A8278",
    textTertiary: "rgba(237,232,223,0.35)",
    textOnAccent: "#0A0908",
    red: "#B85C5C",
    green: "#4A9E7E",
    divider: "rgba(255,255,255,0.06)",
    canvasBg: "#EEE8D5",
    canvasBorder: "rgba(196,163,90,0.20)",
    tableBg: "#FFFFFF",
    tableSelected: "#FDF8EE",
    cardBg: "#111009",
    cardBorder: "rgba(255,255,255,0.08)",
    seatBorder: "rgba(255,255,255,0.22)",
    colorScheme: "dark",
    navBg: "rgba(10,9,8,0.97)",
    navBorder: "rgba(196,163,90,0.12)",
    inputFocusShadow: "0 0 0 3px rgba(196,163,90,0.12)",
    spinnerBorder: "rgba(255,255,255,0.15)",
    spinnerTop: "#C4A35A",
    headerGradient: "linear-gradient(160deg,#111009 0%,#161410 100%)",
    statusNoteGold: "rgba(196,163,90,0.05)",
    statusNoteBorderGold: "rgba(196,163,90,0.15)",
    greenFaint: "rgba(74,158,126,0.08)",
    greenBorder: "rgba(74,158,126,0.20)",
    redFaint: "rgba(184,92,92,0.08)",
    redBorder: "rgba(184,92,92,0.20)",
  };
}

// ─── Venue zone presets ───────────────────────────────────────────────────────
const VENUE_ZONE_PRESETS = [
  { type: "stage",      label: "Stage",       color: "#1B2A4A", textColor: "#C4A35A", defaultW: 300, defaultH: 80  },
  { type: "dancefloor", label: "Dance Floor",  color: "#0F1D35", textColor: "#7EB8F7", defaultW: 220, defaultH: 180 },
  { type: "vip",        label: "VIP Area",     color: "#2C1A0E", textColor: "#C4A35A", defaultW: 160, defaultH: 120 },
  { type: "bar",        label: "Bar",          color: "#0E2016", textColor: "#4A9E7E", defaultW: 200, defaultH: 60  },
  { type: "custom",     label: "Custom Zone",  color: "#D6CEB8", textColor: "#18140E", defaultW: 180, defaultH: 100 },
];

let _zoneCounter = 1;
let _standaloneCounter = 1;

function makeVenueZone(type, x = 100, y = 100) {
  const preset = VENUE_ZONE_PRESETS.find(p => p.type === type) || VENUE_ZONE_PRESETS[4];
  return {
    id: `Z${_zoneCounter++}`,
    type, label: preset.label, x, y,
    width: preset.defaultW, height: preset.defaultH,
    color: preset.color, textColor: preset.textColor,
    shape: "rect", opacity: 0.90,
  };
}

function makeStandaloneSeat(x = 100, y = 100) {
  const id = `SS${_standaloneCounter++}`;
  return { id, num: _standaloneCounter - 1, label: `S${_standaloneCounter - 1}`, status: "available", x, y };
}

let _tableCounter = 1;
function makeTable(x = 120, y = 80) {
  const id = `T${_tableCounter++}`;
  return {
    id, label: `Table ${id}`, x, y,
    shape: "rect", width: 110, height: 70,
    seats: Array.from({ length: 6 }, (_, i) => ({
      id: `${id}-S${i + 1}`, num: i + 1, label: `S${i + 1}`, status: "available",
    })),
  };
}

const DEFAULT_LABELS = [
  { id: "screen",   type: "screen",   label: "SCREEN",   x: 200, y: 16 },
  { id: "entrance", type: "entrance", label: "ENTRANCE", x: 16,  y: 16 },
  { id: "exit",     type: "exit",     label: "EXIT",     x: 16,  y: 630 },
];

// ─── StaticLabel ──────────────────────────────────────────────────────────────
function StaticLabel({ item, C }) {
  const isScreen = item.type === "screen";
  return (
    <div style={{
      position: "absolute", left: item.x, top: item.y,
      background: isScreen ? C.gold : "transparent",
      color: isScreen ? C.textOnAccent : C.textSecondary,
      border: isScreen ? "none" : `1px solid ${C.borderDefault}`,
      borderRadius: isScreen ? 4 : 20,
      padding: isScreen ? "6px 18px" : "5px 14px",
      fontFamily: F.body, fontWeight: 700,
      fontSize: isScreen ? 11 : 10,
      letterSpacing: "0.18em", textTransform: "uppercase",
      userSelect: "none", zIndex: 5, whiteSpace: "nowrap", pointerEvents: "none",
    }}>
      {item.label}
    </div>
  );
}

// ─── DraggableLabel ───────────────────────────────────────────────────────────
function DraggableLabel({ item, onDragStart, isDragging, C }) {
  const [hovered, setHovered] = useState(false);
  const isScreen = item.type === "screen";
  return (
    <div
      title={`Drag to move ${item.label}`}
      style={{
        position: "absolute", left: item.x, top: item.y,
        background: isScreen ? C.gold : "transparent",
        color: isScreen ? C.textOnAccent : C.textSecondary,
        border: isScreen ? "none" : `1px solid ${hovered || isDragging ? C.borderAccent : C.borderDefault}`,
        borderRadius: isScreen ? 4 : 20,
        padding: isScreen ? "6px 18px" : "5px 14px",
        fontFamily: F.body, fontWeight: 700,
        fontSize: isScreen ? 11 : 10,
        letterSpacing: "0.18em", textTransform: "uppercase",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none", zIndex: 5, whiteSpace: "nowrap",
        transform: isDragging ? "scale(1.04)" : hovered ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.13s, border-color 0.13s",
        display: "flex", alignItems: "center", gap: 6,
        opacity: isDragging ? 0.85 : 1,
      }}
      onMouseDown={e => { e.stopPropagation(); onDragStart(e, item.id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 2, opacity: 0.40 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ display: "flex", gap: 2 }}>
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: "currentColor", display: "block" }} />
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: "currentColor", display: "block" }} />
          </span>
        ))}
      </span>
      {item.label}
    </div>
  );
}

// ─── VenueZone ────────────────────────────────────────────────────────────────
function VenueZone({ zone, editMode, isSelected, isDragging, onDragStart, onResizeStart, onSelect, onLabelEdit, C }) {
  const [hovered, setHovered] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelVal, setLabelVal] = useState(zone.label);
  const isEllipse = zone.shape === "ellipse";

  useEffect(() => setLabelVal(zone.label), [zone.label]);

  return (
    <div
      style={{ position: "absolute", left: zone.x, top: zone.y, width: zone.width, height: zone.height, zIndex: isSelected ? 3 : 1, pointerEvents: "auto" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "absolute", inset: 0,
          background: zone.color || "#1B2A4A",
          borderRadius: isEllipse ? "50%" : 8,
          opacity: zone.opacity ?? 0.90,
          border: isSelected
            ? `1.5px solid ${C.gold}`
            : hovered ? `1.5px solid ${C.borderAccent}`
            : `1px dashed rgba(255,255,255,0.14)`,
          boxShadow: isSelected ? `0 0 0 2px ${C.gold}33` : "none",
          cursor: editMode ? (isDragging ? "grabbing" : "grab") : "default",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
          transition: "border 0.15s, box-shadow 0.15s",
          userSelect: "none",
        }}
        onMouseDown={editMode ? e => { e.stopPropagation(); onDragStart(e, zone.id); } : undefined}
        onClick={e => { e.stopPropagation(); if (editMode) onSelect(zone); }}
        onDoubleClick={editMode ? e => { e.stopPropagation(); setEditingLabel(true); } : undefined}
      >
        {editingLabel ? (
          <input autoFocus value={labelVal}
            onChange={e => setLabelVal(e.target.value)}
            onBlur={() => { setEditingLabel(false); onLabelEdit && onLabelEdit(zone.id, labelVal); }}
            onKeyDown={e => { if (e.key === "Enter") { setEditingLabel(false); onLabelEdit && onLabelEdit(zone.id, labelVal); } e.stopPropagation(); }}
            onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
            style={{ background: "transparent", border: "none", outline: "none", color: zone.textColor || "#fff", fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textAlign: "center", width: "80%", textTransform: "uppercase" }}
          />
        ) : (
          <div style={{ color: zone.textColor || "#fff", fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", textAlign: "center", padding: "0 12px", textShadow: "0 1px 6px rgba(0,0,0,0.5)", pointerEvents: "none" }}>
            {zone.label}
          </div>
        )}
        {editMode && isSelected && (
          <>
            <div style={{ position: "absolute", width: 8, height: 8, background: C.gold, borderRadius: 2, cursor: "ew-resize", zIndex: 20, right: -4, top: "50%", transform: "translateY(-50%)" }} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, zone.id, "e", "zone"); }} />
            <div style={{ position: "absolute", width: 8, height: 8, background: C.gold, borderRadius: 2, cursor: "ns-resize", zIndex: 20, bottom: -4, left: "50%", transform: "translateX(-50%)" }} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, zone.id, "s", "zone"); }} />
            <div style={{ position: "absolute", width: 8, height: 8, background: C.gold, borderRadius: 2, cursor: "nwse-resize", zIndex: 20, right: -4, bottom: -4 }} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, zone.id, "se", "zone"); }} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── StandaloneSeat ───────────────────────────────────────────────────────────
function StandaloneSeat({ seat, editMode, isSelected, isDragging, onDragStart, onSelect, onSeatClick, C }) {
  const [hovered, setHovered] = useState(false);
  const color = STATUS_COLORS[seat.status] || STATUS_COLORS.available;
  const blocked = !editMode && (seat.status === "reserved" || seat.status === "pending");

  return (
    <div
      style={{ position: "absolute", left: seat.x, top: seat.y, width: 40, height: 40, zIndex: isSelected ? 15 : 6 }}
      onMouseEnter={() => !blocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={editMode ? e => { e.stopPropagation(); onDragStart(e, seat.id); } : undefined}
      onClick={e => { e.stopPropagation(); if (editMode) { onSelect(seat); return; } if (!blocked) onSeatClick && onSeatClick(seat, null); }}
      title={blocked ? (seat.status === "reserved" ? "Already reserved" : "Pending approval") : `Seat ${seat.num}`}
    >
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: isSelected ? "transparent" : color,
        border: isSelected ? `2px solid ${C.gold}` : `1.5px solid rgba(0,0,0,0.10)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: editMode ? (isDragging ? "grabbing" : "grab") : blocked ? "not-allowed" : "pointer",
        boxShadow: isSelected ? `0 0 0 3px ${C.gold}40` : hovered ? "0 2px 8px rgba(0,0,0,0.18)" : "0 1px 4px rgba(0,0,0,0.12)",
        transform: isSelected ? "scale(1.12)" : hovered ? "scale(1.06)" : "scale(1)",
        opacity: blocked ? 0.55 : 1, userSelect: "none", transition: "all 0.15s ease",
      }}>
        <span style={{ color: isSelected ? C.gold : "#fff", fontSize: 11, fontWeight: 700, fontFamily: F.body, lineHeight: 1, pointerEvents: "none" }}>
          {seat.num}
        </span>
      </div>
    </div>
  );
}

// ─── Seat Node ────────────────────────────────────────────────────────────────
function SeatNode({ seat, isSelected, editMode, isDragging, onSeatClick, onSeatDragStart, C }) {
  const color = STATUS_COLORS[seat.status] || STATUS_COLORS.available;
  const [hovered, setHovered] = useState(false);
  const blocked = !editMode && (seat.status === "reserved" || seat.status === "pending");
  const canHover = !editMode && !blocked;

  return (
    <div
      onClick={e => { e.stopPropagation(); if (!isDragging && !blocked) onSeatClick && onSeatClick(seat); }}
      onMouseDown={editMode ? e => { e.stopPropagation(); onSeatDragStart && onSeatDragStart(e, seat.id); } : undefined}
      onMouseEnter={() => canHover && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={blocked ? (seat.status === "reserved" ? "Reserved" : "Pending") : undefined}
      style={{
        width: 40, height: 40, borderRadius: "50%",
        background: isSelected ? "transparent" : color,
        border: isSelected ? `2px solid ${C.gold}` : `1.5px solid rgba(0,0,0,0.10)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: editMode ? "grab" : blocked ? "not-allowed" : "pointer",
        boxShadow: isSelected ? `0 0 0 3px ${C.gold}40` : hovered ? "0 2px 8px rgba(0,0,0,0.18)" : "0 1px 4px rgba(0,0,0,0.12)",
        transform: isSelected ? "scale(1.12)" : hovered ? "scale(1.06)" : "scale(1)",
        opacity: blocked ? 0.55 : 1, flexShrink: 0, userSelect: "none", transition: "all 0.15s ease",
      }}
    >
      <span style={{ color: isSelected ? C.gold : "#fff", fontSize: 12, fontWeight: 700, fontFamily: F.body, lineHeight: 1, pointerEvents: "none" }}>
        {seat.num}
      </span>
    </div>
  );
}

// ─── Table Node ───────────────────────────────────────────────────────────────
function TableNode({
  table, editMode, isTableSelected, selectedSeatId,
  onSelectTable, onDragStart, onResizeStart, onSeatClick, onLabelEdit,
  isDragging, onSeatMove, C,
}) {
  const [hovered, setHovered] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelVal, setLabelVal] = useState(table.label || table.id);
  const [draggingSeatId, setDraggingSeatId] = useState(null);
  const [dropSide, setDropSide] = useState(null);
  const [ghostXY, setGhostXY] = useState(null);
  const tableBodyRef = useRef(null);
  const seatDragRef = useRef(null);

  useEffect(() => { setLabelVal(table.label || table.id); }, [table.label, table.id]);

  const SEAT_D = 40, SEAT_GAP = 7, SEAT_OFF = 9;
  const tableW = Math.max(table.width || 140, 80);
  const tableH = Math.max(table.height || 70, 50);
  const isCircle = table.shape === "circle";

  const maxH = Math.max(1, Math.floor((tableW + SEAT_GAP) / (SEAT_D + SEAT_GAP)));
  const maxV = Math.max(1, Math.floor((tableH + SEAT_GAP) / (SEAT_D + SEAT_GAP)));
  const byPos = { top: [], bottom: [], left: [], right: [] };
  const free = [];
  table.seats.forEach((s) => s.position ? byPos[s.position].push(s) : free.push(s));
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
  const contH = topPad + tableH + botPad;
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
      const dists = { top: cy, bottom: r.height - cy, left: cx, right: r.width - cx };
      const side = Object.entries(dists).sort((a, b) => a[1] - b[1])[0][0];
      setDropSide(side);
    };
    const onUp = () => {
      if (seatDragRef.current?.seatId && dropSide) onSeatMove && onSeatMove(table.id, seatDragRef.current.seatId, dropSide);
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
      top:    { top: 0,                         left: tOffX + tableW / 2 - rowPx / 2 },
      bottom: { top: tOffY + tableH + SEAT_OFF, left: tOffX + tableW / 2 - rowPx / 2 },
      left:   { left: 0,                        top:  tOffY + tableH / 2 - rowPx / 2 },
      right:  { left: tOffX + tableW + SEAT_OFF,top:  tOffY + tableH / 2 - rowPx / 2 },
    }[side];
    return (
      <div key={side} style={{ position: "absolute", display: "flex", flexDirection: horiz ? "row" : "column", gap: SEAT_GAP, ...pos }}>
        {seats.map(seat => (
          <SeatNode key={seat.id} seat={seat} editMode={editMode}
            isSelected={seat.id === selectedSeatId}
            isDragging={draggingSeatId === seat.id}
            onSeatDragStart={startSeatDrag}
            onSeatClick={s => { if (!draggingSeatId) onSeatClick(s, table.id); }}
            C={C}
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
            position: "fixed", left: ghostXY.x - 20, top: ghostXY.y - 20,
            width: 40, height: 40, borderRadius: "50%",
            background: STATUS_COLORS[seat.status] || STATUS_COLORS.available,
            border: `2px solid ${C.gold}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none", zIndex: 9999,
            boxShadow: `0 8px 24px rgba(0,0,0,0.25), 0 0 0 3px ${C.gold}50`,
            transform: "scale(1.18)", opacity: 0.93,
          }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: F.body }}>{seat.num}</span>
          </div>
        );
      })()}

      <div
        style={{ position: "absolute", left: table.x, top: table.y, width: contW, height: contH, overflow: "visible", zIndex: isTableSelected ? 10 : 4 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {["top", "bottom", "left", "right"].map(side => renderSide(byPos[side], side))}

        <div ref={tableBodyRef} style={{
          position: "absolute", left: tOffX, top: tOffY, width: tableW, height: tableH,
          background: isTableSelected ? C.tableSelected : C.tableBg,
          borderRadius: isCircle ? "50%" : 10,
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
          border: isTableSelected
            ? `1.5px solid ${C.gold}`
            : hovered ? `1.5px solid ${C.borderAccent}`
            : `1px solid ${C.borderDefault}`,
          boxShadow: isTableSelected
            ? `0 0 0 3px ${C.gold}18, 0 4px 20px rgba(0,0,0,0.10)`
            : hovered ? `0 4px 14px rgba(0,0,0,0.09)` : `0 2px 8px rgba(0,0,0,0.07)`,
          transition: "border 0.15s, box-shadow 0.15s, background 0.15s",
          cursor: editMode ? (isDragging ? "grabbing" : "grab") : "pointer",
          zIndex: 2, overflow: "visible",
        }}
          onMouseDown={editMode ? e => { if (!draggingSeatId) { e.stopPropagation(); onDragStart(e, table.id); } } : undefined}
          onClick={e => { e.stopPropagation(); onSelectTable(table); }}
          onDoubleClick={editMode ? e => { e.stopPropagation(); setEditingLabel(true); } : undefined}
        >
          {editMode && draggingSeatId && ["top", "bottom", "left", "right"].map(side => {
            const active = dropSide === side;
            const sStyle = {
              position: "absolute", zIndex: 10, pointerEvents: "none", borderRadius: 4,
              background: active ? `${C.gold}18` : `${C.gold}06`,
              border: active ? `1.5px dashed ${C.gold}` : `1.5px dashed ${C.gold}40`,
              transition: "all 0.1s",
            };
            const P = 4;
            if (side === "top")    return <div key={side} style={{ ...sStyle, top: P,    left: P,  right: P,  height: 28 }} />;
            if (side === "bottom") return <div key={side} style={{ ...sStyle, bottom: P, left: P,  right: P,  height: 28 }} />;
            if (side === "left")   return <div key={side} style={{ ...sStyle, left: P,   top: P,   bottom: P, width: 28  }} />;
            if (side === "right")  return <div key={side} style={{ ...sStyle, right: P,  top: P,   bottom: P, width: 28  }} />;
            return null;
          })}

          {editingLabel ? (
            <input autoFocus value={labelVal}
              onChange={e => setLabelVal(e.target.value)}
              onBlur={() => { setEditingLabel(false); onLabelEdit && onLabelEdit(table.id, labelVal); }}
              onKeyDown={e => { if (e.key === "Enter") { setEditingLabel(false); onLabelEdit && onLabelEdit(table.id, labelVal); } e.stopPropagation(); }}
              onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
              style={{ background: "transparent", border: "none", outline: "none", color: C.textPrimary, fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.10em", textAlign: "center", width: "85%", textTransform: "uppercase" }}
            />
          ) : (
            <>
              <div style={{ color: C.textPrimary, fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.10em", textTransform: "uppercase", lineHeight: 1.3, textAlign: "center", padding: "0 8px" }}>
                {table.label || table.id}
              </div>
              {table.seats.length > 0 && (
                <div style={{ color: C.textTertiary, fontFamily: F.body, fontSize: 10, letterSpacing: "0.06em", marginTop: 2 }}>
                  {table.seats.length} seats
                </div>
              )}
            </>
          )}

          {editMode && isTableSelected && (
            <>
              <div style={{ position: "absolute", width: 8, height: 8, background: C.gold, borderRadius: 2, cursor: "ew-resize", zIndex: 20, right: -4, top: "50%", transform: "translateY(-50%)" }} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, table.id, "e"); }} />
              <div style={{ position: "absolute", width: 8, height: 8, background: C.gold, borderRadius: 2, cursor: "ns-resize", zIndex: 20, bottom: -4, left: "50%", transform: "translateX(-50%)" }} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, table.id, "s"); }} />
              <div style={{ position: "absolute", width: 8, height: 8, background: C.gold, borderRadius: 2, cursor: "nwse-resize", zIndex: 20, right: -4, bottom: -4 }} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, table.id, "se"); }} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── HowToUse ─────────────────────────────────────────────────────────────────
function HowToUse({ C }) {
  const [open, setOpen] = useState(false);
  const tips = [
    ["＋", "Click + Table, then click on canvas to place a table."],
    ["🪑", "Click + Seat to place individual standalone seats."],
    ["⬛", "Click + Zone to add venue areas (Stage, VIP, etc.)."],
    ["✋", "Drag any table, seat, or zone to reposition."],
    ["↔", "Drag gold handles on selected items to resize."],
    ["✎", "Double-click a table or zone label to rename it."],
    ["🪑", "Click a seat to select, then edit via Inspector."],
    ["💾", "Click Save Layout to push changes live."],
  ];
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "10px 14px",
        background: C.surfaceInput, color: C.textSecondary,
        border: `1px solid ${open ? C.borderAccent : C.borderDefault}`,
        borderRadius: 8, fontFamily: F.body, fontWeight: 600, fontSize: 11,
        letterSpacing: "0.06em", cursor: "pointer",
        transition: "all 0.15s", boxSizing: "border-box",
      }}>
        <span>How to Use</span>
        <span style={{ color: C.gold, fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 6, background: C.surfaceInput, border: `1px solid ${C.borderDefault}`, borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.10em", color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>
            Editor Guide
          </div>
          {tips.map(([icon, text], i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
              <span style={{ fontSize: 12, flexShrink: 0, width: 16 }}>{icon}</span>
              <span style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.55, fontFamily: F.body }}>{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inspector ────────────────────────────────────────────────────────────────
function Inspector({
  selected, selectedTable, selectedSeatObj, selectedZone, selectedStandaloneSeat,
  tables, setTables, venueZones, setVenueZones, standaloneSeats, setStandaloneSeats,
  addSeat, deleteSeat, deleteTable, updateTable,
  handleSeatLabelEdit, handleSeatStatus, handleSeatPosition, C,
}) {
  const iLabel = t => (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.gold, textTransform: "uppercase", marginBottom: 6, marginTop: 14 }}>{t}</div>
  );
  const iInput = (props) => (
    <input style={{
      width: "100%", padding: "9px 11px",
      border: `1.5px solid ${C.borderDefault}`,
      borderRadius: 6, fontFamily: F.body, fontSize: 12,
      color: C.textPrimary, background: C.surfaceInput,
      boxSizing: "border-box", outline: "none",
      colorScheme: C.colorScheme,
      transition: "border-color 0.18s",
    }} {...props} />
  );

  const updateZone = (key, val) => {
    if (!selected?.zoneId) return;
    setVenueZones(prev => prev.map(z => z.id === selected.zoneId ? { ...z, [key]: val } : z));
  };
  const updateStandaloneSeat = (key, val) => {
    if (!selected?.standaloneSeatId) return;
    setStandaloneSeats(prev => prev.map(s => s.id === selected.standaloneSeatId ? { ...s, [key]: val } : s));
  };

  return (
    <div style={{ background: C.cardBg, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.cardBorder}`, fontFamily: F.body }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", color: C.gold, textTransform: "uppercase" }}>Inspector</span>
        {selected && (
          <span style={{ fontSize: 10, color: C.textTertiary }}>
            {selected.type === "table" && selectedTable?.label}
            {selected.type === "seat" && `Seat ${selectedSeatObj?.num}`}
            {selected.type === "zone" && selectedZone?.label}
            {selected.type === "standaloneSeat" && `Seat ${selectedStandaloneSeat?.num}`}
          </span>
        )}
      </div>

      {!selected && <div style={{ color: C.textTertiary, fontSize: 11, lineHeight: 1.65 }}>Click a table, seat, or zone to edit its properties.</div>}

      {/* Table */}
      {selected?.type === "table" && selectedTable && (
        <>
          {iLabel("Table Label")}
          {iInput({ value: selectedTable.label || selectedTable.id, onChange: e => updateTable("label", e.target.value) })}
          {iLabel("Shape")}
          <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
            {["rect", "circle"].map(shape => (
              <button key={shape} onClick={() => updateTable("shape", shape)} style={{
                flex: 1, padding: "7px 0",
                background: (selectedTable.shape || "rect") === shape ? C.gold : "transparent",
                color: (selectedTable.shape || "rect") === shape ? C.textOnAccent : C.textSecondary,
                border: `1px solid ${(selectedTable.shape || "rect") === shape ? C.gold : C.borderDefault}`,
                borderRadius: shape === "circle" ? 20 : 6, fontFamily: F.body, fontWeight: 600,
                fontSize: 11, letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.15s",
              }}>
                {shape === "rect" ? "Rectangle" : "Round"}
              </button>
            ))}
          </div>
          {iLabel(`Seats · ${selectedTable.seats.length}`)}
          <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
            <button onClick={addSeat} style={{ flex: 1, padding: "7px 0", background: "transparent", color: C.green, border: `1px solid ${C.green}55`, borderRadius: 6, fontFamily: F.body, fontWeight: 600, fontSize: 11, cursor: "pointer", transition: "all 0.15s" }}>+ Add Seat</button>
            <button onClick={deleteSeat} style={{ flex: 1, padding: "7px 0", background: "transparent", color: C.red, border: `1px solid ${C.red}55`, borderRadius: 6, fontFamily: F.body, fontWeight: 600, fontSize: 11, cursor: "pointer", transition: "all 0.15s" }}>− Remove</button>
          </div>
          <div style={{ marginTop: 8, padding: "7px 10px", background: C.goldFaintest, border: `1px solid ${C.borderAccent}`, borderRadius: 6, fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>
            Drag the gold handles to resize.
          </div>
          <button onClick={() => deleteTable()} style={{ width: "100%", marginTop: 12, padding: "9px 0", background: "transparent", color: C.red, border: `1px solid ${C.red}50`, borderRadius: 6, fontFamily: F.body, fontWeight: 600, fontSize: 11, letterSpacing: "0.04em", cursor: "pointer", transition: "all 0.15s" }}>
            Delete Table
          </button>
        </>
      )}

      {/* Seat */}
      {selected?.type === "seat" && selectedSeatObj && (
        <>
          {iLabel("Seat Label")}
          {iInput({ value: selectedSeatObj.label || selectedSeatObj.num, onChange: e => handleSeatLabelEdit(e.target.value) })}
          {iLabel("Seat Number")}
          {iInput({ type: "number", value: selectedSeatObj.num, onChange: e => setTables(prev => prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, num: Number(e.target.value) } : s) })) })}
          {iLabel("Status")}
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {SEAT_STATUS_CYCLE.map(status => (
              <button key={status} onClick={() => handleSeatStatus(status)} style={{
                flex: 1, padding: "7px 0",
                background: selectedSeatObj.status === status ? STATUS_COLORS[status] : "transparent",
                border: `1px solid ${STATUS_COLORS[status]}80`,
                borderRadius: 6, fontFamily: F.body, fontWeight: 600, fontSize: 10,
                color: selectedSeatObj.status === status ? "#fff" : STATUS_COLORS[status],
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {status === "available" ? "Available" : status === "pending" ? "Pending" : "Reserved"}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8, padding: "7px 10px", background: C.surfaceInput, border: `1px solid ${C.borderDefault}`, borderRadius: 6, fontSize: 11, color: C.textTertiary, textAlign: "center" }}>
            Drag seat on canvas to move it
          </div>
        </>
      )}

      {/* Standalone Seat */}
      {selected?.type === "standaloneSeat" && selectedStandaloneSeat && (
        <>
          <div style={{ padding: "5px 10px", background: C.goldFaintest, border: `1px solid ${C.borderAccent}`, borderRadius: 6, fontSize: 11, color: C.gold, marginBottom: 8 }}>
            Standalone seat (no table)
          </div>
          {iLabel("Seat Label")}
          {iInput({ value: selectedStandaloneSeat.label, onChange: e => updateStandaloneSeat("label", e.target.value) })}
          {iLabel("Seat Number")}
          {iInput({ type: "number", value: selectedStandaloneSeat.num, onChange: e => updateStandaloneSeat("num", Number(e.target.value)) })}
          {iLabel("Status")}
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {SEAT_STATUS_CYCLE.map(status => (
              <button key={status} onClick={() => updateStandaloneSeat("status", status)} style={{
                flex: 1, padding: "7px 0",
                background: selectedStandaloneSeat.status === status ? STATUS_COLORS[status] : "transparent",
                border: `1px solid ${STATUS_COLORS[status]}80`,
                borderRadius: 6, fontFamily: F.body, fontWeight: 600, fontSize: 10,
                color: selectedStandaloneSeat.status === status ? "#fff" : STATUS_COLORS[status],
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {status === "available" ? "Available" : status === "pending" ? "Pending" : "Reserved"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStandaloneSeats(prev => prev.filter(s => s.id !== selected.standaloneSeatId))}
            style={{ width: "100%", marginTop: 12, padding: "9px 0", background: "transparent", color: C.red, border: `1px solid ${C.red}50`, borderRadius: 6, fontFamily: F.body, fontWeight: 600, fontSize: 11, letterSpacing: "0.04em", cursor: "pointer" }}>
            Delete Seat
          </button>
        </>
      )}

      {/* Zone */}
      {selected?.type === "zone" && selectedZone && (
        <>
          {iLabel("Zone Label")}
          {iInput({ value: selectedZone.label, onChange: e => updateZone("label", e.target.value) })}
          {iLabel("Shape")}
          <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
            {["rect", "ellipse"].map(shape => (
              <button key={shape} onClick={() => updateZone("shape", shape)} style={{
                flex: 1, padding: "7px 0",
                background: (selectedZone.shape || "rect") === shape ? C.gold : "transparent",
                color: (selectedZone.shape || "rect") === shape ? C.textOnAccent : C.textSecondary,
                border: `1px solid ${(selectedZone.shape || "rect") === shape ? C.gold : C.borderDefault}`,
                borderRadius: shape === "ellipse" ? 20 : 6, fontFamily: F.body, fontWeight: 600,
                fontSize: 11, cursor: "pointer", transition: "all 0.15s",
              }}>
                {shape === "rect" ? "Rectangle" : "Oval"}
              </button>
            ))}
          </div>
          {iLabel("Background Color")}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
            <input type="color" value={selectedZone.color || "#1B2A4A"} onChange={e => updateZone("color", e.target.value)} style={{ width: 32, height: 32, border: `1px solid ${C.borderDefault}`, borderRadius: 6, cursor: "pointer", padding: 2, background: "transparent" }} />
            <span style={{ fontSize: 11, color: C.textTertiary, fontFamily: F.body }}>{selectedZone.color || "#1B2A4A"}</span>
          </div>
          {iLabel("Text Color")}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
            <input type="color" value={selectedZone.textColor || "#fff"} onChange={e => updateZone("textColor", e.target.value)} style={{ width: 32, height: 32, border: `1px solid ${C.borderDefault}`, borderRadius: 6, cursor: "pointer", padding: 2, background: "transparent" }} />
            <span style={{ fontSize: 11, color: C.textTertiary, fontFamily: F.body }}>{selectedZone.textColor || "#fff"}</span>
          </div>
          {iLabel("Opacity")}
          <input type="range" min={0.1} max={1} step={0.05} value={selectedZone.opacity ?? 0.90}
            onChange={e => updateZone("opacity", parseFloat(e.target.value))}
            style={{ width: "100%", marginTop: 4, accentColor: C.gold }} />
          <div style={{ textAlign: "right", fontSize: 11, color: C.textTertiary, marginTop: 2 }}>
            {Math.round((selectedZone.opacity ?? 0.90) * 100)}%
          </div>
          <button
            onClick={() => setVenueZones(prev => prev.filter(z => z.id !== selected.zoneId))}
            style={{ width: "100%", marginTop: 12, padding: "9px 0", background: "transparent", color: C.red, border: `1px solid ${C.red}50`, borderRadius: 6, fontFamily: F.body, fontWeight: 600, fontSize: 11, letterSpacing: "0.04em", cursor: "pointer" }}>
            Delete Zone
          </button>
        </>
      )}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend({ C }) {
  return (
    <div style={{ background: C.cardBg, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.cardBorder}` }}>
      <div style={{ fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", color: C.gold, marginBottom: 10, textTransform: "uppercase" }}>
        Status Legend
      </div>
      {Object.entries(STATUS_COLORS).map(([key, color]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, fontWeight: 500 }}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── ScaledCanvas ─────────────────────────────────────────────────────────────
// "Contain" scaling: fits the virtual canvas into the available container width.
// Height is always derived from the scale so nothing is ever clipped.
function ScaledCanvas({ virtualW, virtualH, children, onScale, remountKey, sidebarWidth = 0 }) {
  const sizerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!sizerRef.current) return;

    const measure = () => {
      if (!sizerRef.current) return;
      const availW = sizerRef.current.offsetWidth;
      if (availW === 0) return;
      // Scale to fit available width; never upscale beyond 1.
      const s = Math.min(availW / virtualW, 1);
      setScale(s);
      onScale && onScale(s);
    };

    measure();
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(sizerRef.current);
    const onWinResize = () => { setTimeout(measure, 60); };
    window.addEventListener("resize", onWinResize);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onWinResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [virtualW, virtualH, onScale, remountKey, sidebarWidth]);

  const scaledH = Math.round(virtualH * scale);

  return (
    <div ref={sizerRef} style={{ width: "100%", position: "relative" }}>
      <div style={{ width: "100%", height: scaledH, position: "relative", overflow: "hidden" }}>
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SeatMap({
  tableData,
  editMode = false,
  selectedSeat,
  highlightedTable,
  onSeatClick,
  onTableClick,
  windowWidth,
  virtualWidth,
  virtualHeight,
  wing,
  room,
  isDark = true,
  // NEW: optional callback to go back, used in edit mode
  onBack,
  // NEW: sidebar width so canvas can compensate
  sidebarWidth = 0,
}) {
  const C = editMode ? getEditTokens() : getTokens(isDark);

  const normalize = useCallback((td) => {
    if (!td) return [];
    if (Array.isArray(td)) return td.map(t => ({ shape: "rect", width: 110, height: 70, ...t }));
    return [{ shape: "rect", width: 110, height: 70, ...td }];
  }, []);

  const [tables, setTables]                   = useState(() => editMode ? [] : normalize(tableData));
  const [labels, setLabels]                   = useState(DEFAULT_LABELS);
  const [venueZones, setVenueZones]           = useState([]);
  const [standaloneSeats, setStandaloneSeats] = useState([]);
  const [selected, setSelected]               = useState(null);
  const [saved, setSaved]                     = useState(false);
  const [tool, setTool]                       = useState("select");
  const [addZoneType, setAddZoneType]         = useState(null);
  const [activeDragId, setActiveDragId]       = useState(null);
  const [showZoneMenu, setShowZoneMenu]       = useState(false);

  const [clientCanvasKey, setClientCanvasKey] = useState(0);
  const prevEditMode = useRef(editMode);
  useEffect(() => {
    if (prevEditMode.current === true && editMode === false) {
      setClientCanvasKey(k => k + 1);
    }
    prevEditMode.current = editMode;
  }, [editMode]);

  const dragging      = useRef(null);
  const canvasRef     = useRef(null);
  const adminScaleRef = useRef(1);

  // Load saved layout (admin)
  useEffect(() => {
    if (!editMode || !wing || !room) return;
    try {
      const raw = localStorage.getItem(`seatmap:${wing}:${room}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        let norm = normalize(parsed).filter(t => t.seats && t.seats.length > 0);
        if (norm.length > 0) {
          const PAD = 60;
          const VIRT_W = virtualWidth || 1400;
          const VIRT_H = virtualHeight || 780;
          const allX = norm.flatMap(t => [t.x, t.x + (t.width || 110) + 60]);
          const allY = norm.flatMap(t => [t.y - 60, t.y + (t.height || 54) + 60]);
          const minX = Math.min(...allX), minY = Math.min(...allY);
          const maxX = Math.max(...allX), maxY = Math.max(...allY);
          const shiftX = minX < PAD ? PAD - minX : 0;
          const shiftY = minY < PAD ? PAD - minY : 0;
          if (shiftX !== 0 || shiftY !== 0) norm = norm.map(t => ({ ...t, x: t.x + shiftX, y: t.y + shiftY }));
        }
        setTables(norm);
        norm.forEach(t => { const n = parseInt(t.id?.replace(/\D/g, "")) || 0; if (n >= _tableCounter) _tableCounter = n + 1; });
      }
    } catch {}
    try { const r = localStorage.getItem(`seatmap_labels:${wing}:${room}`); if (r) setLabels(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem(`seatmap_zones:${wing}:${room}`); if (r) setVenueZones(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem(`seatmap_standalone:${wing}:${room}`); if (r) setStandaloneSeats(JSON.parse(r)); } catch {}
  }, [editMode, wing, room]);

  // Client: sync tables from prop
  useEffect(() => {
    if (editMode) return;
    const norm = normalize(tableData).filter(t => t.seats && t.seats.length > 0);
    setTables(norm);
  }, [tableData, normalize, editMode]);

  // Client: load labels / listen for admin saves
  useEffect(() => {
    if (editMode || !wing || !room) return;
    const LABEL_KEY = `seatmap_labels:${wing}:${room}`;
    const ZONE_KEY  = `seatmap_zones:${wing}:${room}`;
    const SS_KEY    = `seatmap_standalone:${wing}:${room}`;
    const loadLabels = () => { try { const r = localStorage.getItem(LABEL_KEY); if (r) setLabels(JSON.parse(r)); } catch {} };
    const loadZones  = () => { try { const r = localStorage.getItem(ZONE_KEY);  if (r) setVenueZones(JSON.parse(r)); } catch {} };
    const loadSS     = () => { try { const r = localStorage.getItem(SS_KEY);    if (r) setStandaloneSeats(JSON.parse(r)); } catch {} };
    loadLabels(); loadZones(); loadSS();
    const onStorage = (e) => {
      if (e.key === LABEL_KEY) loadLabels();
      if (e.key === ZONE_KEY)  loadZones();
      if (e.key === SS_KEY)    loadSS();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [editMode, wing, room]);

  const selectedTable          = selected?.type === "table"          ? tables.find(t => t.id === selected.tableId) : null;
  const selectedSeatObj        = selected?.type === "seat"           ? tables.find(t => t.id === selected.tableId)?.seats.find(s => s.id === selected.seatId) : null;
  const selectedZone           = selected?.type === "zone"           ? venueZones.find(z => z.id === selected.zoneId) : null;
  const selectedStandaloneSeat = selected?.type === "standaloneSeat" ? standaloneSeats.find(s => s.id === selected.standaloneSeatId) : null;

  // Global mouse move/up
  useEffect(() => {
    if (!editMode) return;
    const onMove = (e) => {
      const d = dragging.current; if (!d) return;
      const s = adminScaleRef.current || 1;
      if (d.type === "label")               setLabels(prev => prev.map(l => l.id === d.id ? { ...l, x: Math.max(0, d.originX + (e.clientX - d.startX) / s), y: Math.max(0, d.originY + (e.clientY - d.startY) / s) } : l));
      else if (d.type === "table")          setTables(prev => prev.map(t => t.id === d.id ? { ...t, x: Math.max(0, d.originX + (e.clientX - d.startX) / s), y: Math.max(0, d.originY + (e.clientY - d.startY) / s) } : t));
      else if (d.type === "zone")           setVenueZones(prev => prev.map(z => z.id === d.id ? { ...z, x: Math.max(0, d.originX + (e.clientX - d.startX) / s), y: Math.max(0, d.originY + (e.clientY - d.startY) / s) } : z));
      else if (d.type === "standaloneSeat") setStandaloneSeats(prev => prev.map(ss => ss.id === d.id ? { ...ss, x: Math.max(0, d.originX + (e.clientX - d.startX) / s), y: Math.max(0, d.originY + (e.clientY - d.startY) / s) } : ss));
      else if (d.type === "resize") {
        const dx = (e.clientX - d.startX) / s, dy = (e.clientY - d.startY) / s;
        if (d.resizeTarget === "zone") {
          setVenueZones(prev => prev.map(z => z.id !== d.id ? z : { ...z, width: (d.dir === "e" || d.dir === "se") ? Math.max(60, d.originW + dx) : z.width, height: (d.dir === "s" || d.dir === "se") ? Math.max(40, d.originH + dy) : z.height }));
        } else {
          setTables(prev => prev.map(t => t.id !== d.id ? t : { ...t, width: (d.dir === "e" || d.dir === "se") ? Math.max(60, d.originW + dx) : t.width, height: (d.dir === "s" || d.dir === "se") ? Math.max(40, d.originH + dy) : t.height }));
        }
      }
    };
    const onUp = () => { dragging.current = null; setActiveDragId(null); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [editMode]);

  const startTableDrag          = useCallback((e, id) => { e.preventDefault(); const t = tables.find(t => t.id === id); dragging.current = { type: "table", id, startX: e.clientX, startY: e.clientY, originX: t?.x || 0, originY: t?.y || 0 }; setActiveDragId(id); }, [tables]);
  const startLabelDrag          = useCallback((e, id) => { e.preventDefault(); const l = labels.find(l => l.id === id); dragging.current = { type: "label", id, startX: e.clientX, startY: e.clientY, originX: l?.x || 0, originY: l?.y || 0 }; setActiveDragId(id); }, [labels]);
  const startZoneDrag           = useCallback((e, id) => { e.preventDefault(); const z = venueZones.find(z => z.id === id); dragging.current = { type: "zone", id, startX: e.clientX, startY: e.clientY, originX: z?.x || 0, originY: z?.y || 0 }; setActiveDragId(id); }, [venueZones]);
  const startStandaloneSeatDrag = useCallback((e, id) => { e.preventDefault(); const ss = standaloneSeats.find(s => s.id === id); dragging.current = { type: "standaloneSeat", id, startX: e.clientX, startY: e.clientY, originX: ss?.x || 0, originY: ss?.y || 0 }; setActiveDragId(id); }, [standaloneSeats]);
  const startResize             = useCallback((e, id, dir, resizeTarget = "table") => {
    e.preventDefault();
    if (resizeTarget === "zone") { const z = venueZones.find(z => z.id === id); dragging.current = { type: "resize", resizeTarget: "zone", id, dir, startX: e.clientX, startY: e.clientY, originW: z?.width || 180, originH: z?.height || 100 }; }
    else { const t = tables.find(t => t.id === id); dragging.current = { type: "resize", resizeTarget: "table", id, dir, startX: e.clientX, startY: e.clientY, originW: t?.width || 110, originH: t?.height || 54 }; }
  }, [tables, venueZones]);

  const handleCanvasClick = (e) => {
    if (!editMode) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const s = adminScaleRef.current || 1;
    const cx = Math.max(0, (e.clientX - rect.left) / s);
    const cy = Math.max(0, (e.clientY - rect.top) / s);
    if (tool === "addTable") {
      const t = makeTable(cx - 55, cy - 27);
      setTables(prev => [...prev, t]); setSelected({ type: "table", tableId: t.id }); setTool("select");
    } else if (tool === "addSeat") {
      const ss = makeStandaloneSeat(cx - 20, cy - 20);
      setStandaloneSeats(prev => [...prev, ss]); setSelected({ type: "standaloneSeat", standaloneSeatId: ss.id }); setTool("select");
    } else if (tool === "addZone" && addZoneType) {
      const z = makeVenueZone(addZoneType, cx - 90, cy - 50);
      setVenueZones(prev => [...prev, z]); setSelected({ type: "zone", zoneId: z.id }); setTool("select"); setAddZoneType(null);
    }
  };

  const deleteTable = (id) => {
    const tid = id || selected?.tableId; if (!tid) return;
    setTables(prev => prev.filter(t => t.id !== tid));
    if (!id || selected?.tableId === tid) setSelected(null);
  };
  const addSeat = () => {
    if (!selected?.tableId) return;
    setTables(prev => prev.map(t => { if (t.id !== selected.tableId) return t; const num = (t.seats.length || 0) + 1; return { ...t, seats: [...t.seats, { id: `${t.id}-S${num}`, num, label: `S${num}`, status: "available" }] }; }));
  };
  const deleteSeat = () => {
    if (!selected?.tableId) return;
    setTables(prev => { const updated = prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.slice(0, -1) }); const filtered = updated.filter(t => t.seats.length > 0); if (filtered.length < updated.length) setSelected(null); return filtered; });
  };

  const updateTable         = (key, val) => { if (!selected?.tableId) return; setTables(prev => prev.map(t => t.id === selected.tableId ? { ...t, [key]: val } : t)); };
  const handleLabelEdit     = (tableId, val) => setTables(prev => prev.map(t => t.id === tableId ? { ...t, label: val } : t));
  const handleZoneLabelEdit = (zoneId, val) => setVenueZones(prev => prev.map(z => z.id === zoneId ? { ...z, label: val } : z));
  const handleSeatLabelEdit = (val) => { if (!selected?.seatId) return; setTables(prev => prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, label: val } : s) })); };
  const handleSeatStatus    = (status) => { if (!selected?.seatId) return; setTables(prev => prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, status } : s) })); };
  const handleSeatPosition  = (position) => { if (!selected?.seatId) return; setTables(prev => prev.map(t => t.id !== selected.tableId ? t : { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, position } : s) })); };
  const handleSeatMove      = (tableId, seatId, newPosition) => { setTables(prev => prev.map(t => t.id !== tableId ? t : { ...t, seats: t.seats.map(s => s.id === seatId ? { ...s, position: newPosition } : s) })); };
  const handleSeatClick     = (seat, tableId) => { if (!editMode) { onSeatClick && onSeatClick(seat, tableId); return; } setSelected({ type: "seat", tableId, seatId: seat.id }); };
  const handleTableSelect   = (table) => { if (editMode) { setSelected({ type: "table", tableId: table.id }); return; } onTableClick && onTableClick(table); };

  const handleSave = () => {
    if (wing && room) {
      dispatchSeatMapUpdate(wing, room, tables);
      try { const k = `seatmap_labels:${wing}:${room}`; localStorage.setItem(k, JSON.stringify(labels)); window.dispatchEvent(new StorageEvent("storage", { key: k, newValue: JSON.stringify(labels) })); } catch {}
      try { const k = `seatmap_zones:${wing}:${room}`; localStorage.setItem(k, JSON.stringify(venueZones)); window.dispatchEvent(new StorageEvent("storage", { key: k, newValue: JSON.stringify(venueZones) })); } catch {}
      try { const k = `seatmap_standalone:${wing}:${room}`; localStorage.setItem(k, JSON.stringify(standaloneSeats)); window.dispatchEvent(new StorageEvent("storage", { key: k, newValue: JSON.stringify(standaloneSeats) })); } catch {}
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── CLIENT VIEW ──────────────────────────────────────────────────────────────
  if (!editMode) {
    // Compute tight bounding box from actual content so the map is never bigger
    // than it needs to be, and never clips T7 or ENTRANCE/EXIT labels.
    const SEAT_D = 40, SEAT_OFF = 49; // seat diameter + offset from table edge
    const PAD = 32; // padding around the whole map

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Tables (include seat overflow on all sides)
    tables.forEach(t => {
      const tw = t.width || 110, th = t.height || 70;
      const x0 = t.x - SEAT_OFF;
      const y0 = t.y - SEAT_OFF;
      const x1 = t.x + tw + SEAT_OFF;
      const y1 = t.y + th + SEAT_OFF;
      if (x0 < minX) minX = x0;
      if (y0 < minY) minY = y0;
      if (x1 > maxX) maxX = x1;
      if (y1 > maxY) maxY = y1;
    });

    // Standalone seats
    standaloneSeats.forEach(s => {
      if (s.x < minX) minX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.x + SEAT_D > maxX) maxX = s.x + SEAT_D;
      if (s.y + SEAT_D > maxY) maxY = s.y + SEAT_D;
    });

    // Labels (SCREEN / ENTRANCE / EXIT) — approx 120px wide, 28px tall
    labels.forEach(l => {
      if (l.x < minX) minX = l.x;
      if (l.y < minY) minY = l.y;
      if (l.x + 120 > maxX) maxX = l.x + 120;
      if (l.y + 28  > maxY) maxY = l.y + 28;
    });

    // Fallback if no content yet
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 1400; maxY = 780; }

    const contentW = maxX - minX + PAD * 2;
    const contentH = maxY - minY + PAD * 2;
    // Shift origin so content starts at PAD,PAD
    const offsetX = -(minX - PAD);
    const offsetY = -(minY - PAD);

    const VIRTUAL_W = virtualWidth  || Math.max(contentW, 400);
    const VIRTUAL_H = virtualHeight || Math.max(contentH, 300);

    return (
      <div style={{ width: "100%" }}>
        <ScaledCanvas virtualW={VIRTUAL_W} virtualH={VIRTUAL_H} remountKey={clientCanvasKey} sidebarWidth={sidebarWidth}>
          {/* Offset wrapper so we render within the tight bounding box */}
          <div style={{ position: "absolute", top: offsetY, left: offsetX, width: VIRTUAL_W, height: VIRTUAL_H }}>
          {venueZones.map(zone => (
            <VenueZone key={zone.id} zone={zone} editMode={false} isSelected={false} isDragging={false}
              onDragStart={() => {}} onResizeStart={() => {}} onSelect={() => {}} onLabelEdit={() => {}} C={C} />
          ))}
          {labels.map(lbl => <StaticLabel key={lbl.id} item={lbl} C={C} />)}
          {standaloneSeats.map(seat => (
            <StandaloneSeat key={seat.id} seat={seat} editMode={false}
              isSelected={selectedSeat ? selectedSeat.id === seat.id : false}
              isDragging={false} onDragStart={() => {}} onSelect={() => {}}
              onSeatClick={onSeatClick} C={C} />
          ))}
          {tables.map(table => (
            <TableNode key={table.id} table={table} editMode={false}
              isTableSelected={highlightedTable ? highlightedTable.id === table.id : false}
              selectedSeatId={selectedSeat ? selectedSeat.id : null}
              onSelectTable={handleTableSelect} onDragStart={() => {}}
              onResizeStart={() => {}} onSeatClick={handleSeatClick}
              onLabelEdit={undefined} isDragging={false} C={C} />
          ))}
          </div>
        </ScaledCanvas>
      </div>
    );
  }

  // ── ADMIN / EDIT VIEW ────────────────────────────────────────────────────────
  const VIRTUAL_W = virtualWidth  || 1400;
  const VIRTUAL_H = virtualHeight || 780;

  const toolHints = {
    addTable: "Click anywhere on the canvas to place a table",
    addSeat:  "Click anywhere on the canvas to place a standalone seat",
    addZone:  addZoneType ? `Click to place a ${addZoneType} zone` : "Select a zone type",
  };

  const editorUI = (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: C.pageBg,
      fontFamily: F.body,
      color: C.textPrimary,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8,
        padding: "0 20px",
        height: 56,
        background: C.navBg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${C.navBorder}`,
        boxShadow: "0 1px 0 rgba(255,255,255,0.03)",
      }}>

        {/* Back button — matches AlabangReserve style exactly */}
        {onBack && (
          <>
            <button
              onClick={onBack}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px",
                background: "transparent",
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 8,
                fontFamily: F.label, fontSize: 9, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: C.textSecondary, cursor: "pointer",
                transition: "all 0.18s", flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <div style={{ width: 1, height: 22, background: C.borderDefault, flexShrink: 0 }} />
          </>
        )}

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.gold, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: F.label }}>
            Layout Editor
          </span>
          {wing && room && (
            <>
              <span style={{ color: C.textTertiary, fontSize: 12 }}>·</span>
              <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: F.body }}>{wing}</span>
              <span style={{ color: C.textTertiary, fontSize: 12 }}>·</span>
              <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: F.body }}>{room}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: C.borderDefault, flexShrink: 0 }} />

        {/* Tool buttons */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap" }}>
          {[
            { key: "select",   label: "Select",  icon: "↖" },
            { key: "addTable", label: "+ Table",  icon: "⬛" },
            { key: "addSeat",  label: "+ Seat",   icon: "●" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { setTool(key); setAddZoneType(null); setShowZoneMenu(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 12px",
                border: `1px solid ${tool === key ? C.gold : C.borderDefault}`,
                background: tool === key ? C.goldFaint : "transparent",
                color: tool === key ? C.gold : C.textSecondary,
                borderRadius: 7, fontFamily: F.label, fontWeight: 700, fontSize: 9,
                letterSpacing: "0.14em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (tool !== key) { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.textPrimary; } }}
              onMouseLeave={e => { if (tool !== key) { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; } }}
            >
              <span style={{ fontSize: 12 }}>{icon}</span>
              {label}
            </button>
          ))}

          {/* Zone dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowZoneMenu(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 12px",
                border: `1px solid ${tool === "addZone" ? "rgba(123,97,214,0.70)" : C.borderDefault}`,
                background: tool === "addZone" ? "rgba(123,97,214,0.10)" : "transparent",
                color: tool === "addZone" ? "#9B7EE8" : C.textSecondary,
                borderRadius: 7, fontFamily: F.label, fontWeight: 700, fontSize: 9,
                letterSpacing: "0.14em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (tool !== "addZone") { e.currentTarget.style.borderColor = C.borderAccent; e.currentTarget.style.color = C.textPrimary; } }}
              onMouseLeave={e => { if (tool !== "addZone") { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; } }}
            >
              <span style={{ fontSize: 12 }}>⬡</span>
              + Zone
            </button>
            {showZoneMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0,
                background: C.surfaceRaised, border: `1px solid ${C.borderDefault}`,
                borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
                zIndex: 200, minWidth: 168, padding: "6px 0",
                animation: "fadeIn 0.15s ease",
              }}>
                <div style={{ padding: "6px 14px", fontSize: 9, fontWeight: 700, color: C.textTertiary, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: F.label }}>
                  Zone Type
                </div>
                {VENUE_ZONE_PRESETS.map(preset => (
                  <button key={preset.type} onClick={() => { setTool("addZone"); setAddZoneType(preset.type); setShowZoneMenu(false); }} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "9px 14px",
                    background: addZoneType === preset.type ? C.goldFaint : "transparent",
                    border: "none", cursor: "pointer",
                    fontFamily: F.body, fontWeight: 500, fontSize: 13, color: C.textPrimary, textAlign: "left",
                    transition: "background 0.12s",
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: preset.color, border: `1px solid ${C.borderDefault}`, flexShrink: 0 }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active tool hint */}
        {toolHints[tool] && (tool !== "addZone" || addZoneType) && (
          <div style={{
            padding: "5px 11px",
            background: tool === "addSeat" ? C.greenFaint : tool === "addZone" ? "rgba(123,97,214,0.07)" : C.goldFaintest,
            color: tool === "addSeat" ? C.green : tool === "addZone" ? "#9B7EE8" : C.gold,
            fontFamily: F.label, fontWeight: 600, fontSize: 10,
            border: `1px solid ${tool === "addSeat" ? C.greenBorder : tool === "addZone" ? "rgba(123,97,214,0.20)" : C.borderAccent}`,
            borderRadius: 6, whiteSpace: "nowrap", letterSpacing: "0.02em",
            animation: "fadeIn 0.18s ease",
          }}>
            {toolHints[tool]}
          </div>
        )}

        {/* Save to right */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {saved && (
            <span style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", background: C.greenFaint,
              color: C.green, borderRadius: 7, fontFamily: F.label,
              fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
              border: `1px solid ${C.greenBorder}`,
              animation: "fadeIn 0.18s ease",
            }}>
              ✓ Saved
            </span>
          )}
          <button onClick={handleSave} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 18px", background: C.gold, color: "#0A0908",
            border: "none", borderRadius: 8, fontFamily: F.label, fontWeight: 700,
            fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.18s",
            boxShadow: "0 2px 12px rgba(196,163,90,0.28)",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldLight; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.gold; }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V2z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
              <rect x="4" y="8" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
              <rect x="4.5" y="2" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
            </svg>
            Save Layout
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        flex: "1 1 0",
        display: "flex",
        overflow: "hidden",
        minHeight: 0,
      }}>
        {/* Canvas area — flex:1 so it always fills the remaining space after sidebar */}
        <div style={{
          flex: "1 1 0",
          minWidth: 0,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{
            flex: "1 1 0",
            minHeight: 0,
            background: C.canvasBg,
            border: `1.5px solid ${(tool === "addTable" || tool === "addSeat" || (tool === "addZone" && addZoneType)) ? C.gold : C.canvasBorder}`,
            borderRadius: 12,
            overflow: "hidden",
            transition: "border-color 0.2s",
            boxShadow: "0 2px 16px rgba(0,0,0,0.20)",
            position: "relative",
          }} onClick={() => showZoneMenu && setShowZoneMenu(false)}>
            <ScaledCanvas
              virtualW={VIRTUAL_W}
              virtualH={VIRTUAL_H}
              onScale={s => { adminScaleRef.current = s; }}
            >
              <div
                ref={canvasRef}
                style={{
                  position: "absolute", inset: 0,
                  cursor: (tool === "addTable" || tool === "addSeat" || (tool === "addZone" && addZoneType)) ? "crosshair" : "default",
                }}
                onClick={handleCanvasClick}
                onMouseDown={e => { if (tool === "select" && e.target === canvasRef.current) setSelected(null); }}
              />

              {venueZones.map(zone => (
                <VenueZone key={zone.id} zone={zone} editMode={true}
                  isSelected={selected?.type === "zone" && selected.zoneId === zone.id}
                  isDragging={activeDragId === zone.id}
                  onDragStart={startZoneDrag} onResizeStart={startResize}
                  onSelect={z => setSelected({ type: "zone", zoneId: z.id })}
                  onLabelEdit={handleZoneLabelEdit} C={C} />
              ))}

              {labels.map(lbl => (
                <DraggableLabel key={lbl.id} item={lbl}
                  onDragStart={(e, id) => startLabelDrag(e, id)}
                  isDragging={activeDragId === lbl.id} C={C} />
              ))}

              {standaloneSeats.map(seat => (
                <StandaloneSeat key={seat.id} seat={seat} editMode={true}
                  isSelected={selected?.type === "standaloneSeat" && selected.standaloneSeatId === seat.id}
                  isDragging={activeDragId === seat.id}
                  onDragStart={startStandaloneSeatDrag}
                  onSelect={ss => setSelected({ type: "standaloneSeat", standaloneSeatId: ss.id })}
                  C={C} />
              ))}

              {tables.map(table => (
                <TableNode key={table.id} table={table} editMode={true}
                  isTableSelected={selected?.tableId === table.id}
                  selectedSeatId={selected?.type === "seat" && selected?.tableId === table.id ? selected.seatId : null}
                  onSelectTable={handleTableSelect}
                  onDragStart={startTableDrag} onResizeStart={startResize}
                  onSeatClick={handleSeatClick} onLabelEdit={handleLabelEdit}
                  isDragging={activeDragId === table.id}
                  onSeatMove={handleSeatMove} C={C} />
              ))}

              {tables.length === 0 && standaloneSeats.length === 0 && venueZones.length === 0 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", gap: 10 }}>
                  <div style={{ fontSize: 32, opacity: 0.10 }}>⬛</div>
                  <div style={{ fontFamily: F.body, fontSize: 13, color: C.textTertiary, fontWeight: 500, textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>
                    Empty canvas — use the toolbar to add tables, seats, or venue zones
                  </div>
                </div>
              )}
            </ScaledCanvas>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{
          flexShrink: 0,
          width: 272,
          borderLeft: `1px solid ${C.borderDefault}`,
          background: C.surfaceBase,
          overflowY: "auto",
          padding: "14px 14px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <HowToUse C={C} />

          <Inspector
            selected={selected} selectedTable={selectedTable}
            selectedSeatObj={selectedSeatObj} selectedZone={selectedZone}
            selectedStandaloneSeat={selectedStandaloneSeat}
            tables={tables} setTables={setTables}
            venueZones={venueZones} setVenueZones={setVenueZones}
            standaloneSeats={standaloneSeats} setStandaloneSeats={setStandaloneSeats}
            addSeat={addSeat} deleteSeat={deleteSeat} deleteTable={deleteTable}
            updateTable={updateTable} handleSeatLabelEdit={handleSeatLabelEdit}
            handleSeatStatus={handleSeatStatus} handleSeatPosition={handleSeatPosition}
            C={C}
          />

          <Legend C={C} />

          {/* Zone palette */}
          <div style={{ background: C.cardBg, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.cardBorder}` }}>
            <div style={{ fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", color: C.gold, marginBottom: 10, textTransform: "uppercase", fontFamily: F.label }}>
              Venue Zones
            </div>
            {VENUE_ZONE_PRESETS.map(preset => (
              <div key={preset.type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: preset.color, border: `1px solid ${C.borderDefault}`, flexShrink: 0 }} />
                <span style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, fontWeight: 500 }}>{preset.label}</span>
              </div>
            ))}
          </div>

          {/* Labels */}
          <div style={{ background: C.cardBg, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.cardBorder}` }}>
            <div style={{ fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", color: C.gold, marginBottom: 10, textTransform: "uppercase", fontFamily: F.label }}>
              Draggable Labels
            </div>
            {labels.map(lbl => (
              <div key={lbl.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: 1, background: lbl.type === "screen" ? C.gold : C.borderStrong, flexShrink: 0 }} />
                <span style={{ fontFamily: F.body, fontSize: 12, color: C.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{lbl.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: C.textTertiary }}>drag</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(editorUI, document.body);
}