// src/components/admin/SeatMap.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import { dispatchSeatMapUpdate } from "../../utils/seatMapPersistence";

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
  mono:    "'Montserrat', sans-serif",
};

let _tableCounter = 1;
function makeTable(x = 120, y = 80) {
  const id = `T${_tableCounter++}`;
  return {
    id,
    label: `Table ${id}`,
    x, y,
    shape: "rect",
    width: 110,
    height: 54,
    seats: Array.from({ length: 6 }, (_, i) => ({
      id:     `${id}-S${i + 1}`,
      num:    i + 1,
      label:  `S${i + 1}`,
      status: "available",
    })),
  };
}

// ─── Seat Node ────────────────────────────────────────────────────────────────
function SeatNode({ seat, editMode, onSeatClick, isSelected }) {
  const color = STATUS_COLORS[seat.status] || STATUS_COLORS.available;
  const SIZE = 30;
  return (
    <div
      title={`${seat.label || seat.num} · ${seat.status}`}
      onClick={e => { e.stopPropagation(); onSeatClick && onSeatClick(seat); }}
      style={{
        width: SIZE, height: SIZE,
        borderRadius: "50%",
        background: color,
        border: isSelected ? "2.5px solid #1B2A4A" : "2.5px solid rgba(255,255,255,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: editMode ? "pointer" : "default",
        boxShadow: isSelected
          ? "0 0 0 3px #C9A84C, 0 2px 6px rgba(0,0,0,0.2)"
          : "0 2px 6px rgba(0,0,0,0.18)",
        transition: "transform 0.12s, box-shadow 0.12s",
        flexShrink: 0,
        userSelect: "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <span style={{ color: "#fff", fontSize: 9, fontWeight: 800, fontFamily: F.body, letterSpacing: 0.3, lineHeight: 1 }}>
        {seat.num}
      </span>
    </div>
  );
}

// ─── Draggable Label ──────────────────────────────────────────────────────────
function DraggableLabel({ item, editMode, onDragStart }) {
  return (
    <div
      style={{
        position: "absolute", left: item.x, top: item.y,
        background: item.type === "screen" ? "#1B2A4A" : "#fff",
        color: item.type === "screen" ? "#C9A84C" : "#1B2A4A",
        border: `2px solid ${item.type === "screen" ? "#C9A84C" : "#1B2A4A"}`,
        borderRadius: item.type === "screen" ? 4 : 20,
        padding: item.type === "screen" ? "5px 18px" : "3px 14px",
        fontFamily: F.body, fontWeight: 700,
        fontSize: item.type === "screen" ? 11 : 10,
        letterSpacing: 2, textTransform: "uppercase",
        cursor: editMode ? "move" : "default",
        userSelect: "none", zIndex: 5,
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)", whiteSpace: "nowrap",
      }}
      onMouseDown={editMode ? (e) => { e.stopPropagation(); onDragStart(e, item.id); } : undefined}
    >
      {item.label}
    </div>
  );
}

const DEFAULT_LABELS = [
  { id: "screen",   type: "screen",   label: "SCREEN",   x: 200, y: 16 },
  { id: "entrance", type: "entrance", label: "ENTRANCE", x: 16,  y: 16 },
  { id: "exit",     type: "exit",     label: "EXIT",     x: 16,  y: 280 },
];

// ─── Table Node ───────────────────────────────────────────────────────────────
function TableNode({ table, editMode, isTableSelected, selectedSeatId, onSelectTable, onDragStart, onSeatClick, onLabelEdit }) {
  const SEAT_GAP = 6;
  const half     = Math.ceil(table.seats.length / 2);
  const topSeats = table.seats.slice(0, half);
  const botSeats = table.seats.slice(half);

  const tableW   = table.width  || 110;
  const tableH   = table.height || 54;
  const isCircle = table.shape  === "circle";

  const rowW       = Math.max(half * (30 + SEAT_GAP) - SEAT_GAP, tableW);
  const containerW = rowW + 10;
  const offsetX    = (containerW - tableW) / 2;

  const [editingLabel, setEditingLabel] = useState(false);
  const [labelVal, setLabelVal]         = useState(table.label || table.id);

  useEffect(() => { setLabelVal(table.label || table.id); }, [table.label, table.id]);

  return (
    <div
      style={{
        position: "absolute", left: table.x, top: table.y,
        width: containerW,
        cursor: editMode ? "move" : "pointer",
        zIndex: isTableSelected ? 10 : 1,
      }}
      onMouseDown={editMode ? e => { e.stopPropagation(); onDragStart(e, table.id); } : undefined}
      onClick={!editMode ? e => { e.stopPropagation(); onSelectTable(table); } : undefined}
    >
      {/* Top seats */}
      {topSeats.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: SEAT_GAP, marginBottom: 6 }}>
          {topSeats.map(seat => (
            <SeatNode key={seat.id} seat={seat} editMode={editMode}
              isSelected={seat.id === selectedSeatId}
              onSeatClick={s => onSeatClick(s, table.id)} />
          ))}
        </div>
      )}

      {/* Table body */}
      <div
        style={{
          width: tableW, height: tableH, marginLeft: offsetX,
          background: isTableSelected ? "#162240" : "#2C3E6B",
          borderRadius: isCircle ? "50%" : 10,
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
          border: isTableSelected ? "2.5px solid #C9A84C" : "2.5px solid rgba(255,255,255,0.08)",
          boxShadow: isTableSelected
            ? "0 0 0 3px #C9A84C44, 0 4px 16px rgba(0,0,0,0.22)"
            : "0 3px 10px rgba(0,0,0,0.22)",
          transition: "border 0.15s, box-shadow 0.15s",
          cursor: editMode ? "move" : "pointer",
        }}
        onClick={editMode ? e => { e.stopPropagation(); onSelectTable(table); } : undefined}
        onDoubleClick={editMode ? e => { e.stopPropagation(); setEditingLabel(true); } : undefined}
      >
        {editingLabel ? (
          <input autoFocus value={labelVal}
            onChange={e => setLabelVal(e.target.value)}
            onBlur={() => { setEditingLabel(false); onLabelEdit && onLabelEdit(table.id, labelVal); }}
            onKeyDown={e => {
              if (e.key === "Enter") { setEditingLabel(false); onLabelEdit && onLabelEdit(table.id, labelVal); }
              e.stopPropagation();
            }}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textAlign: "center", width: "85%", textTransform: "uppercase" }}
          />
        ) : (
          <>
            <div style={{ color: "#fff", fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", lineHeight: 1.3, textAlign: "center", padding: "0 6px" }}>
              {table.label || table.id}
            </div>
            {table.seats.length > 0 && (
              <div style={{ color: "#A0AABB", fontFamily: F.body, fontSize: 9, letterSpacing: 1, marginTop: 2 }}>
                {table.seats.length} SEATS
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom seats */}
      {botSeats.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: SEAT_GAP, marginTop: 6 }}>
          {botSeats.map(seat => (
            <SeatNode key={seat.id} seat={seat} editMode={editMode}
              isSelected={seat.id === selectedSeatId}
              onSeatClick={s => onSeatClick(s, table.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Instructions Panel ───────────────────────────────────────────────────────
function InstructionsPanel() {
  const [open, setOpen] = useState(false);
  const tips = [
    ["🖱️", "Click + Table in the toolbar, then click anywhere on the canvas to place a new table."],
    ["✋", "Drag any table to reposition it freely on the canvas."],
    ["🖊️", "Double-click a table body to rename it inline. Or edit the label in the Inspector."],
    ["🪑", "Click a seat (circle) to select it. Edit its label, number, and status in the Inspector."],
    ["➕", "Use + Seat / − Seat in the toolbar or Inspector to add or remove seats from the selected table."],
    ["📐", "Adjust table Width, Height, and Shape (Rectangle or Circle) in the Inspector."],
    ["🏷️", "Drag the SCREEN, ENTRANCE, EXIT labels to any position on the canvas."],
    ["🗑️", "Deleting all seats from a table automatically removes the table."],
    ["💾", "Click Save Layout to sync your changes live to the client reservation view."],
  ];
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: open ? "#1B2A4A" : "#F7F3EA",
          color: open ? "#C9A84C" : "#1B2A4A",
          border: "2px solid #1B2A4A",
          borderRadius: 7, padding: "6px 14px",
          fontFamily: F.body, fontWeight: 700, fontSize: 10,
          letterSpacing: 1.5, cursor: "pointer", textTransform: "uppercase",
          transition: "all 0.15s",
        }}
      >
        <span style={{ fontSize: 12, lineHeight: 1 }}>?</span>
        How to Use
        <span style={{ fontSize: 9, marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{
          marginTop: 8, background: "#fff",
          border: "1.5px solid #E0DAD0", borderRadius: 10,
          padding: "14px 16px", boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          maxWidth: 560,
        }}>
          <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", textTransform: "uppercase", marginBottom: 10 }}>
            Editor Instructions
          </div>
          {tips.map(([icon, text], i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <span style={{ fontSize: 12, color: "#444", lineHeight: 1.55 }}>{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SeatMap({
  tableData,
  editMode = false,
  selectedSeat,
  onSeatClick,
  onTableClick,
  windowWidth,
  wing,
  room,
}) {
  const CANVAS_H = 420;

  const normalize = useCallback((td) => {
    if (!td) return [];
    if (Array.isArray(td)) return td.map(t => ({ shape: "rect", width: 110, height: 54, ...t }));
    return [{ shape: "rect", width: 110, height: 54, ...td }];
  }, []);

  // Admin: start empty, load from localStorage on mount.
  // Client: use tableData prop (synced via persistence subscription).
  const [tables, setTables]     = useState(() => editMode ? [] : normalize(tableData));
  const [labels, setLabels]     = useState(DEFAULT_LABELS);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved]       = useState(false);
  const [tool, setTool]         = useState("select");
  const dragging                = useRef(null);
  const canvasRef               = useRef(null);

  // Admin: load persisted layout from localStorage on mount
  useEffect(() => {
    if (!editMode || !wing || !room) return;
    const key = `seatmap:${wing}:${room}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const norm = normalize(parsed).filter(t => t.seats && t.seats.length > 0);
        setTables(norm);
        norm.forEach(t => {
          const n = parseInt(t.id?.replace(/\D/g, "")) || 0;
          if (n >= _tableCounter) _tableCounter = n + 1;
        });
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, wing, room]);

  // Client: sync when tableData prop changes (from persistence subscription)
  useEffect(() => {
    if (editMode) return;
    const norm = normalize(tableData).filter(t => t.seats && t.seats.length > 0);
    setTables(norm);
  }, [tableData, normalize, editMode]);

  const selectedTable   = selected?.type === "table" ? tables.find(t => t.id === selected.tableId) : null;
  const selectedSeatObj = selected?.type === "seat"
    ? tables.find(t => t.id === selected.tableId)?.seats.find(s => s.id === selected.seatId)
    : null;

  // ── Drag ──────────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e, id, isLabel = false) => {
    e.preventDefault();
    dragging.current = {
      id, isLabel,
      startX:  e.clientX, startY: e.clientY,
      originX: isLabel ? labels.find(l => l.id === id)?.x : tables.find(t => t.id === id)?.x,
      originY: isLabel ? labels.find(l => l.id === id)?.y : tables.find(t => t.id === id)?.y,
    };
  }, [labels, tables]);

  useEffect(() => {
    if (!editMode) return;
    const onMove = e => {
      if (!dragging.current) return;
      const nx = Math.max(0, dragging.current.originX + e.clientX - dragging.current.startX);
      const ny = Math.max(0, dragging.current.originY + e.clientY - dragging.current.startY);
      if (dragging.current.isLabel) {
        setLabels(prev => prev.map(l => l.id === dragging.current.id ? { ...l, x: nx, y: ny } : l));
      } else {
        setTables(prev => prev.map(t => t.id === dragging.current.id ? { ...t, x: nx, y: ny } : t));
      }
    };
    const onUp = () => { dragging.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [editMode]);

  // ── Add table ─────────────────────────────────────────────────────────────
  const handleCanvasClick = e => {
    if (!editMode || tool !== "addTable") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const t = makeTable(
      Math.max(0, e.clientX - rect.left - 55),
      Math.max(0, e.clientY - rect.top  - 27)
    );
    setTables(prev => [...prev, t]);
    setSelected({ type: "table", tableId: t.id });
    setTool("select");
  };

  // ── Delete table ──────────────────────────────────────────────────────────
  const deleteTable = (id) => {
    const tid = id || selected?.tableId;
    if (!tid) return;
    setTables(prev => prev.filter(t => t.id !== tid));
    if (!id || selected?.tableId === tid) setSelected(null);
  };

  // ── Add / delete seat — auto-delete table at 0 seats ─────────────────────
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
      const updated = prev.map(t =>
        t.id !== selected.tableId ? t : { ...t, seats: t.seats.slice(0, -1) }
      );
      // auto-remove tables with 0 seats
      const filtered = updated.filter(t => t.seats.length > 0);
      if (filtered.length < updated.length) setSelected(null);
      return filtered;
    });
  };

  const handleLabelEdit = (tableId, val) =>
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, label: val } : t));

  const handleSeatLabelEdit = val => {
    if (!selected?.seatId) return;
    setTables(prev => prev.map(t =>
      t.id !== selected.tableId ? t :
      { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, label: val } : s) }
    ));
  };

  const handleSeatStatus = status => {
    if (!selected?.seatId) return;
    setTables(prev => prev.map(t =>
      t.id !== selected.tableId ? t :
      { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, status } : s) }
    ));
  };

  const handleSeatClick = (seat, tableId) => {
    if (!editMode) { onSeatClick && onSeatClick(seat, tableId); return; }
    setSelected({ type: "seat", tableId, seatId: seat.id });
  };

  const handleTableSelect = table => {
    if (editMode) { setSelected({ type: "table", tableId: table.id }); return; }
    onTableClick && onTableClick(table);
  };

  const handleSave = () => {
    if (wing && room) {
      dispatchSeatMapUpdate(wing, room, tables.length === 1 ? tables[0] : tables);
      const labelKey = `seatmap_labels:${wing}:${room}`;
      try { localStorage.setItem(labelKey, JSON.stringify(labels)); } catch {}
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  useEffect(() => {
    if (!wing || !room) return;
    try {
      const raw = localStorage.getItem(`seatmap_labels:${wing}:${room}`);
      if (raw) setLabels(JSON.parse(raw));
    } catch {}
  }, [wing, room]);

  const updateTable = (key, val) => {
    if (!selected?.tableId) return;
    setTables(prev => prev.map(t => t.id === selected.tableId ? { ...t, [key]: val } : t));
  };

  // ── Toolbar button style ───────────────────────────────────────────────────
  const tbBtn = (active, danger) => ({
    padding: "7px 14px",
    border: `2px solid ${active ? "#C9A84C" : danger ? "#E0CACA" : "#D5CDBE"}`,
    background: active ? "#C9A84C" : "#fff",
    color: active ? "#1B2A4A" : danger ? "#CC4444" : "#555",
    borderRadius: 7, fontFamily: F.body, fontWeight: 700,
    fontSize: 10, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase",
    transition: "all 0.13s",
  });

  return (
    <div style={{ fontFamily: F.body, width: "100%" }}>

      {/* ── Toolbar (admin only) ────────────────────────────────────────────── */}
      {editMode && (
        <>
          <InstructionsPanel />
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button style={tbBtn(tool === "select")}   onClick={() => setTool("select")}>☰ Select</button>
            <button style={tbBtn(tool === "addTable")} onClick={() => setTool("addTable")}>＋ Table</button>
            <button
              style={{ ...tbBtn(false, true), opacity: selected?.tableId ? 1 : 0.4 }}
              disabled={!selected?.tableId}
              onClick={() => deleteTable()}
            >− Table</button>
            <button
              style={{ ...tbBtn(false), opacity: selected?.tableId ? 1 : 0.4 }}
              disabled={!selected?.tableId}
              onClick={addSeat}
            >＋ Seat</button>
            <button
              style={{ ...tbBtn(false, true), opacity: selected?.tableId ? 1 : 0.4 }}
              disabled={!selected?.tableId}
              onClick={deleteSeat}
            >− Seat</button>

            <button
              style={{ marginLeft: "auto", padding: "7px 22px", background: "#1B2A4A", color: "#fff", border: "none", borderRadius: 7, fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 1.5, cursor: "pointer", textTransform: "uppercase" }}
              onClick={handleSave}
            >
              💾 Save Layout
            </button>
            {saved && (
              <span style={{ padding: "4px 10px", background: "#E8F5EE", color: "#4CAF79", borderRadius: 4, fontFamily: F.body, fontWeight: 700, fontSize: 9, letterSpacing: 1 }}>
                ✓ Saved
              </span>
            )}
          </div>
        </>
      )}

      {/* ── Map + Inspector row ────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* Canvas */}
        <div style={{ flex: 1, minWidth: 0, background: "#EFEAD9", borderRadius: 12, position: "relative", overflow: "hidden", userSelect: "none" }}>
          {tool === "addTable" && editMode && (
            <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 20, background: "#C9A84C", color: "#1B2A4A", padding: "5px 16px", borderRadius: 20, fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 1.5, pointerEvents: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", whiteSpace: "nowrap" }}>
              CLICK ON MAP TO PLACE TABLE
            </div>
          )}
          <div
            ref={canvasRef}
            style={{ position: "relative", width: "100%", height: CANVAS_H, overflow: "hidden" }}
            onClick={handleCanvasClick}
            onMouseDown={e => {
              if (editMode && tool === "select" && e.target === canvasRef.current) setSelected(null);
            }}
          >
            {labels.map(lbl => (
              <DraggableLabel key={lbl.id} item={lbl} editMode={editMode}
                onDragStart={(e, id) => handleDragStart(e, id, true)} />
            ))}
            {tables.map(table => (
              <TableNode
                key={table.id}
                table={table}
                editMode={editMode}
                isTableSelected={selected?.tableId === table.id}
                selectedSeatId={selected?.type === "seat" && selected?.tableId === table.id ? selected.seatId : null}
                onSelectTable={handleTableSelect}
                onDragStart={handleDragStart}
                onSeatClick={handleSeatClick}
                onLabelEdit={editMode ? handleLabelEdit : undefined}
              />
            ))}
          </div>
        </div>

        {/* Right column: Inspector + Legend */}
        {editMode && (
          <div style={{ width: 252, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Inspector */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 14px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", textTransform: "uppercase" }}>Inspector</span>
                {selected && (
                  <span style={{ fontSize: 10, color: "#999", fontWeight: 500 }}>
                    {selected.type === "table" ? selectedTable?.label : `Seat ${selectedSeatObj?.num}`}
                  </span>
                )}
              </div>

              {!selected && (
                <div style={{ color: "#C0BAB0", fontSize: 12, lineHeight: 1.65, fontFamily: F.body }}>
                  Select a table or seat on the canvas to view and edit its properties here.
                </div>
              )}

              {/* ── Table inspector ────────────────────────────────────────── */}
              {selected?.type === "table" && selectedTable && (() => {
                const iLabel = (text) => (
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#999", textTransform: "uppercase", display: "block", marginBottom: 3, marginTop: 10 }}>{text}</label>
                );
                const iInput = (props) => (
                  <input style={{ width: "100%", padding: "7px 10px", border: "1px solid #E0DAD0", borderRadius: 5, fontFamily: F.body, fontSize: 13, color: "#1B2A4A", background: "#FAFAF7", boxSizing: "border-box", outline: "none" }} {...props} />
                );
                return (
                  <>
                    {iLabel("Table Label")}
                    {iInput({ value: selectedTable.label || selectedTable.id, onChange: e => updateTable("label", e.target.value) })}

                    {iLabel("Shape")}
                    <div style={{ display: "flex", gap: 6, marginTop: 4, marginBottom: 2 }}>
                      {["rect", "circle"].map(shape => (
                        <button key={shape} onClick={() => updateTable("shape", shape)} style={{
                          flex: 1, padding: "7px 0",
                          background: (selectedTable.shape || "rect") === shape ? "#1B2A4A" : "transparent",
                          color: (selectedTable.shape || "rect") === shape ? "#fff" : "#1B2A4A",
                          border: "2px solid #1B2A4A",
                          borderRadius: shape === "circle" ? 20 : 6,
                          fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 1,
                          cursor: "pointer", textTransform: "uppercase",
                        }}>
                          {shape === "rect" ? "▭ Rect" : "⬤ Round"}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <div style={{ flex: 1 }}>
                        {iLabel("Width")}
                        {iInput({ type: "number", min: 60, max: 320, value: selectedTable.width || 110, onChange: e => updateTable("width", Math.max(60, Number(e.target.value))) })}
                      </div>
                      <div style={{ flex: 1 }}>
                        {iLabel("Height")}
                        {iInput({ type: "number", min: 40, max: 220, value: selectedTable.height || 54, onChange: e => updateTable("height", Math.max(40, Number(e.target.value))) })}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <div style={{ flex: 1 }}>
                        {iLabel("X")}
                        {iInput({ type: "number", value: Math.round(selectedTable.x), onChange: e => updateTable("x", Number(e.target.value)) })}
                      </div>
                      <div style={{ flex: 1 }}>
                        {iLabel("Y")}
                        {iInput({ type: "number", value: Math.round(selectedTable.y), onChange: e => updateTable("y", Number(e.target.value)) })}
                      </div>
                    </div>

                    {iLabel(`Seats (${selectedTable.seats.length})`)}
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <button onClick={addSeat} style={{ flex: 1, padding: "8px 0", background: "transparent", color: "#4CAF79", border: "2px solid #4CAF79", borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase" }}>＋ Add</button>
                      <button onClick={deleteSeat} style={{ flex: 1, padding: "8px 0", background: "transparent", color: "#E05252", border: "2px solid #E05252", borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase" }}>− Remove</button>
                    </div>

                    <button
                      onClick={() => deleteTable()}
                      style={{ width: "100%", marginTop: 14, padding: "9px 0", background: "#E05252", color: "#fff", border: "none", borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 1.5, cursor: "pointer", textTransform: "uppercase" }}
                    >
                      🗑 Delete Table
                    </button>
                  </>
                );
              })()}

              {/* ── Seat inspector ──────────────────────────────────────────── */}
              {selected?.type === "seat" && selectedSeatObj && (() => {
                const iLabel = (text) => (
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#999", textTransform: "uppercase", display: "block", marginBottom: 3, marginTop: 10 }}>{text}</label>
                );
                const iInput = (props) => (
                  <input style={{ width: "100%", padding: "7px 10px", border: "1px solid #E0DAD0", borderRadius: 5, fontFamily: F.body, fontSize: 13, color: "#1B2A4A", background: "#FAFAF7", boxSizing: "border-box", outline: "none" }} {...props} />
                );
                return (
                  <>
                    {iLabel("Seat Label")}
                    {iInput({ value: selectedSeatObj.label || selectedSeatObj.num, onChange: e => handleSeatLabelEdit(e.target.value) })}
                    {iLabel("Seat Number")}
                    {iInput({
                      type: "number",
                      value: selectedSeatObj.num,
                      onChange: e => setTables(prev => prev.map(t =>
                        t.id !== selected.tableId ? t :
                        { ...t, seats: t.seats.map(s => s.id === selected.seatId ? { ...s, num: Number(e.target.value) } : s) }
                      ))
                    })}
                    {iLabel("Status")}
                    <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                      {SEAT_STATUS_CYCLE.map(status => (
                        <button key={status} onClick={() => handleSeatStatus(status)} style={{
                          flex: 1, padding: "7px 0",
                          background: selectedSeatObj.status === status ? STATUS_COLORS[status] : "transparent",
                          border: `2px solid ${STATUS_COLORS[status]}`,
                          borderRadius: 5, fontFamily: F.body, fontWeight: 700, fontSize: 9,
                          letterSpacing: 0.5,
                          color: selectedSeatObj.status === status ? "#fff" : STATUS_COLORS[status],
                          cursor: "pointer", textTransform: "uppercase",
                        }}>
                          {status === "available" ? "Avail" : status === "pending" ? "Pend" : "Res"}
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Legend */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 10, textTransform: "uppercase" }}>Status Legend</div>
              {Object.entries(STATUS_COLORS).map(([key, color]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: color, flexShrink: 0 }} />
                  <span style={{ fontFamily: F.body, fontSize: 12, color: "#333", fontWeight: 500 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}