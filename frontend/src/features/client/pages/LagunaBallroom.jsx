// src/features/client/pages/LagunaBallroom.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainWingNavbar from "../components/MainWingNavbar";
// ── FIX: import SeatMap (the actual file), not the non-existent ClientSeatMap ──
import SeatMap, { STATUS_COLORS } from "../../../components/seatmap/SeatMap";
import { getRoomData, subscribeToSeatMapChanges, saveSeatMapData } from "../../../utils/seatMapPersistence.js";
import { SEAT_MAP_DATA } from "../../../data/seatMapData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const WING = "Main Wing";
const ROOM = "Laguna Ballroom";

const F = {
  display: "'Cormorant Garamond', Georgia, serif",
  body:    "'DM Sans', sans-serif",
};

// ─── Inline ChevronLeft SVG ───────────────────────────────────────────────────
function ChevronLeftIcon({ size = 18 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-chevron-left-icon lucide-chevron-left"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

// ─── API helper ───────────────────────────────────────────────────────────────
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) {
    let msg = data?.message || `HTTP ${response.status}`;
    if (data?.errors) msg += "\n" + Object.values(data.errors).flat().join("\n");
    throw new Error(msg);
  }
  return data;
};

// ─── Resolve initial table data ───────────────────────────────────────────────
// 1. localStorage  2. bundled SEAT_MAP_DATA  3. null (shows placeholder)
function resolveInitialTableData() {
  try {
    const raw = getRoomData(WING, ROOM, null);
    if (raw) {
      if (Array.isArray(raw) && raw.some(t => t.seats?.length > 0))
        return raw.filter(t => t.seats?.length > 0);
      if (!Array.isArray(raw) && raw.seats?.length > 0)
        return raw;
    }
  } catch (e) {
    console.warn("[LagunaBallroom] getRoomData error:", e);
  }
  try {
    const fallback = SEAT_MAP_DATA?.[WING]?.[ROOM];
    if (fallback?.seats?.length > 0) return fallback;
  } catch (e) {
    console.warn("[LagunaBallroom] SEAT_MAP_DATA fallback error:", e);
  }
  return null;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  root:        { fontFamily: F.body, background: "#F7F3EA", minHeight: "100vh", width: "100%", color: "#1B2A4A" },
  page:        { padding: "32px 40px", maxWidth: 1200, margin: "0 auto" },
  pageTitle:   { fontSize: 42, fontWeight: 700, fontFamily: F.display, color: "#1B2A4A", margin: 0, lineHeight: 1.1, letterSpacing: 0.3 },
  pageSubtitle:{ fontSize: 14, color: "#6b6256", fontFamily: F.body, marginTop: 6, marginBottom: 28, fontWeight: 400, maxWidth: 560, lineHeight: 1.5 },
  toggleBar:   { display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" },
  toggleLabel: { fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, color: "#888", textTransform: "uppercase" },
  togglePillGroup: { display: "flex", alignItems: "center", background: "#E8E3DC", borderRadius: 24, padding: 3, gap: 2 },
  togglePillBtn: (active) => ({ padding: "8px 22px", border: "none", background: active ? "#1B2A4A" : "transparent", color: active ? "#FFFFFF" : "#888", cursor: "pointer", fontSize: 11, letterSpacing: 1.5, fontWeight: 700, fontFamily: F.body, borderRadius: 20, transition: "all 0.18s", outline: "none", textTransform: "uppercase" }),
  layout:      { display: "flex", gap: 28, alignItems: "flex-start" },
  mapCard:     { flex: 1, minWidth: 320 },
  rightPanel:  { width: 260, display: "flex", flexDirection: "column", gap: 14, flexShrink: 0 },
  legendCard:  { background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  legendTitle: { fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 10, textTransform: "uppercase" },
  legendRow:   { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  legendDot:   (color) => ({ width: 13, height: 13, borderRadius: 3, background: color, flexShrink: 0 }),
  legendText:  { fontFamily: F.body, fontSize: 13, color: "#333", fontWeight: 500 },
  selCard:     { background: "#fff", borderRadius: 10, padding: "16px 18px", color: "#1B2A4A", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  selTitle:    { fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 10, textTransform: "uppercase" },
  selRow:      { marginBottom: 6, display: "flex", alignItems: "baseline", gap: 4 },
  selLabel:    { fontFamily: F.body, fontSize: 10, letterSpacing: 1.5, color: "#999", fontWeight: 700, textTransform: "uppercase", flexShrink: 0 },
  selVal:      { fontFamily: F.body, fontSize: 13, color: "#1B2A4A", fontWeight: 600 },
  ctaBtn:      (enabled) => ({ marginTop: 10, width: "100%", padding: "11px 0", background: enabled ? "#C9A84C" : "#E8E3DC", color: enabled ? "#1B2A4A" : "#AAA", border: "none", borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, cursor: enabled ? "pointer" : "default", transition: "all 0.2s", textTransform: "uppercase" }),
  policyCard:  { background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  policyTitle: { fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 8, textTransform: "uppercase" },
  policyText:  { fontFamily: F.body, fontSize: 12, color: "#666", lineHeight: 1.6 },
};

const getWholeSeatLabel = (guests) => {
  if (!guests || guests < 1) return "Seat 1";
  return `Seat ${Array.from({ length: guests }, (_, i) => i + 1).join(", ")}`;
};

const getSeatRatio = (table) => {
  if (!table?.seats?.length) return null;
  const available = table.seats.filter(s => s.status === "available").length;
  return `${available}/${table.seats.length}`;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LagunaBallroom() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRoom = location.state?.selectedSubRoom || ROOM;
  const [mode,          setMode]          = useState("whole");
  const [selectedSeat,  setSelectedSeat]  = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [windowSize,    setWindowSize]    = useState({ width: window.innerWidth, height: window.innerHeight });
  const [modal,         setModal]         = useState(null);
  const [guests,        setGuests]        = useState(2);
  const [formData,      setFormData]      = useState(null);
  const [refCode,       setRefCode]       = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [tableData,     setTableData]     = useState(resolveInitialTableData);

  useEffect(() => {
    const unsub = subscribeToSeatMapChanges(({ wing, room, data }) => {
      if (wing !== WING || room !== ROOM) return;
      if (Array.isArray(data))      setTableData(data.filter(t => t.seats?.length > 0));
      else if (data?.seats?.length) setTableData(data);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const SEAT_KEY = `seatmap:${WING}:${ROOM}`;
    const onStorage = (e) => {
      if (e.key !== SEAT_KEY) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (!parsed) return;
        if (Array.isArray(parsed))      setTableData(parsed.filter(t => t.seats?.length > 0));
        else if (parsed.seats?.length)  setTableData(parsed);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const hasSynced = useRef(false);
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;
    const syncWithDatabase = async () => {
      try {
        const res = await apiCall(`/seat-status/${encodeURIComponent(ROOM)}`);
        if (!res.success || !res.data?.length) return;
        setTableData(prev => {
          if (!prev) return prev;
          const applyToTable = (tbl) => ({
            ...tbl,
            seats: (tbl.seats || []).map(seat => {
              const match = res.data.find(r => {
                if (r.table !== String(tbl.id)) return false;
                const nums = String(r.seat || "").replace(/Seat\s*/gi, "").split(",").map(s => parseInt(s.trim())).filter(Boolean);
                return nums.includes(seat.num);
              });
              return match ? { ...seat, status: match.status } : seat;
            }),
          });
          return Array.isArray(prev) ? prev.map(applyToTable) : applyToTable(prev);
        });
      } catch (err) {
        console.warn("[LagunaBallroom] Seat sync failed:", err.message);
      }
    };
    syncWithDatabase();
    const interval = setInterval(syncWithDatabase, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const h = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const resolveTableForSeat = (seat) => {
    if (!seat || !tableData) return null;
    if (Array.isArray(tableData))
      return tableData.find(t => t.seats?.some(s => s.id === seat.id)) || tableData[0] || null;
    return tableData;
  };

  const getActiveTable = () =>
    selectedTable || (Array.isArray(tableData) ? tableData[0] : tableData) || null;

  const handleTableClick = (tableId) => {
    // SeatMap passes tableId (string), find the actual table object
    const t = Array.isArray(tableData)
      ? tableData.find(t => String(t.id) === String(tableId))
      : tableData;
    setSelectedTable(t || null);
    setModal("guestCount");
  };

  const handleSeatClick = (seat) => {
    if (seat.status === "reserved" || seat.status === "pending") {
      alert(`This seat is already ${seat.status}. Please choose an available seat.`);
      return;
    }
    setSelectedSeat(seat);
    setSelectedTable(resolveTableForSeat(seat));
  };

  const handleGuestContinue = (g) => { setGuests(g); setModal("details"); };
  const handleReview        = (form) => { setFormData(form); setModal("review"); };

  const handleSubmit = async () => {
    if (!formData || submitting) return;
    setSubmitting(true);
    try {
      const activeTable = getActiveTable();
      const payload = {
        name:             `${formData.firstName} ${formData.lastName}`,
        email:            formData.email,
        phone:            formData.phone,
        venue_id:         2,
        room:             selectedRoom,
        table_number:     String(activeTable?.id ?? "T1"),
        seat_number:      mode === "individual"
                            ? String(selectedSeat?.num ?? selectedSeat?.id ?? "")
                            : Array.from({ length: guests }, (_, i) => i + 1).join(","),
        guests_count:     guests,
        event_date:       formData.eventDate,
        event_time:       formData.eventTime ? formData.eventTime.substring(0, 5) : null,
        special_requests: formData.specialRequests || "",
        type:             mode,
      };

      const response = await apiCall("/reservations", { method: "POST", body: JSON.stringify(payload) });
      setRefCode(response.reference_code || "—");

      if (activeTable) {
        const markPending = (tbl) => {
          if (mode === "individual") {
            return { ...tbl, seats: tbl.seats.map(s => s.id === selectedSeat?.id ? { ...s, status: "pending" } : s) };
          } else {
            let marked = 0;
            return { ...tbl, seats: tbl.seats.map(s => { if (marked < guests && s.status === "available") { marked++; return { ...s, status: "pending" }; } return s; }) };
          }
        };
        const updated = Array.isArray(tableData)
          ? tableData.map(t => t.id === activeTable.id ? markPending(t) : t)
          : markPending(tableData);
        setTableData(updated);
        saveSeatMapData(WING, ROOM, updated);
      }
      setModal("success");
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setModal(null); setSelectedSeat(null); setSelectedTable(null);
    setRefCode(null); setFormData(null); setGuests(2);
  };

  const isMobile    = windowSize.width < 480;
  const isTablet    = windowSize.width < 768;
  const activeTable = getActiveTable();
  const canProceed  = mode === "individual" && selectedSeat?.status === "available";

  const displayTable = mode === "whole"
    ? (activeTable ? `Table ${activeTable.id}` : "—")
    : (selectedTable ? `Table ${selectedTable.id}` : "—");

  const displaySeat = mode === "individual"
    ? (selectedSeat ? `Seat ${selectedSeat.num ?? selectedSeat.id}` : "Select a seat")
    : getWholeSeatLabel(guests);

  const seatRatio = activeTable ? getSeatRatio(activeTable) : null;

  return (
    <div style={s.root}>
      <MainWingNavbar active="LAGUNA BALLROOM" />

      <div style={{ ...s.page, ...(isMobile ? { padding: "16px 14px" } : isTablet ? { padding: "24px 20px" } : {}) }}>

        {/* Back button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, marginTop: 8 }}>
          <button
            onClick={() => navigate("/venues")}
            aria-label="Back to venues"
            style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: "50%", border: "2px solid #C9A84C", color: "#C9A84C", cursor: "pointer", flexShrink: 0, transition: "background 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#C9A84C"; }}
          >
            <ChevronLeftIcon size={18} />
          </button>
          <div style={{ width: 32, height: 2, background: "#C9A84C", borderRadius: 2 }} />
          <div style={{ color: "#C9A84C", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: F.body }}>
            ALL VENUES
          </div>
        </div>

        <h1 style={{ ...s.pageTitle, ...(isMobile ? { fontSize: 26 } : isTablet ? { fontSize: 32 } : {}) }}>
          Laguna Ballroom
        </h1>
        <p style={s.pageSubtitle}>Book your preferred table in the Main Wing of Laguna Ballroom</p>

        {/* Mode toggle */}
        <div style={s.toggleBar}>
          <span style={s.toggleLabel}>I WANT TO RESERVE A:</span>
          <div style={s.togglePillGroup}>
            <button style={s.togglePillBtn(mode === "whole")}      onClick={() => { setMode("whole");      setSelectedSeat(null); }}>Whole Table</button>
            <button style={s.togglePillBtn(mode === "individual")} onClick={() => { setMode("individual"); setSelectedTable(null); }}>Individual Seat</button>
          </div>
        </div>

        <div style={{ ...s.layout, ...(isMobile || isTablet ? { flexDirection: "column" } : {}) }}>

          {/* Seat map */}
          <div style={s.mapCard}>
            {tableData ? (
              <SeatMap
                tableData={tableData}
                mode={mode}
                editMode={false}
                selectedSeat={selectedSeat}
                onSeatClick={handleSeatClick}
                onTableClick={handleTableClick}
                windowWidth={windowSize.width}
                wing={WING}
                room={ROOM}
              />
            ) : (
              <div style={{ background: "#EFEAD9", borderRadius: 12, padding: 48, border: "1px solid #D4C5A0", textAlign: "center", color: "#9B8A6A", fontFamily: F.body }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🪑</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>No seat data found</div>
                <div style={{ fontSize: 12, color: "#B0A080" }}>Please check back shortly or contact the front desk.</div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={{ ...s.rightPanel, ...(isMobile || isTablet ? { width: "100%" } : {}) }}>

            <div style={s.legendCard}>
              <div style={s.legendTitle}>Status Legend</div>
              {Object.entries(STATUS_COLORS).map(([key, color]) => (
                <div key={key} style={s.legendRow}>
                  <div style={s.legendDot(color)} />
                  <span style={s.legendText}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              ))}
            </div>

            <div style={s.selCard}>
              <div style={s.selTitle}>Your Selection</div>
              <div style={s.selRow}>
                <span style={s.selLabel}>TABLE:</span>
                <span style={s.selVal}>
                  {displayTable}
                  {seatRatio && (
                    <span style={{ marginLeft: 6, background: "#F7F3EA", border: "1px solid #E8E3DC", borderRadius: 4, padding: "1px 6px", fontSize: 10, color: "#C9A84C", fontWeight: 700 }}>
                      {seatRatio}
                    </span>
                  )}
                </span>
              </div>
              <div style={s.selRow}>
                <span style={s.selLabel}>SEAT{mode === "whole" && guests > 1 ? "S" : ""}:</span>
                <span style={{ ...s.selVal, color: "#C9A84C", fontSize: mode === "whole" ? 11 : 13 }}>{displaySeat}</span>
              </div>
              <div style={s.selRow}>
                <span style={{ ...s.selLabel, fontSize: 9 }}>ROOM:</span>
                <span style={{ ...s.selVal, fontSize: 11, color: "#666" }}>{selectedRoom}</span>
              </div>

              {mode === "whole" && (
                <button style={s.ctaBtn(true)} onClick={() => setModal("guestCount")}
                  onMouseEnter={e => { e.currentTarget.style.background = "#B89635"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#C9A84C"; }}>
                  Reserve This Table
                </button>
              )}
              {mode === "individual" && (
                <button style={s.ctaBtn(canProceed)} onClick={canProceed ? () => setModal("guestCount") : undefined}>
                  {selectedSeat ? "Reserve This Seat" : "Select a Seat First"}
                </button>
              )}
            </div>

            <div style={s.policyCard}>
              <div style={s.policyTitle}>Hotel Policy</div>
              <div style={s.policyText}>
                Pending seats are held for one (1) day. After expiry the seat returns to available.<br /><br />
                Reservations are confirmed only after admin approval.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === "guestCount" && (
        <ModalGuestCount mode={mode} guests={guests} onContinue={handleGuestContinue} onCancel={() => setModal(null)} />
      )}
      {modal === "details" && (
        <ModalDetails mode={mode} guests={guests} table={displayTable} seat={displaySeat} room={selectedRoom}
          onBack={() => setModal("guestCount")} onSubmit={handleReview} />
      )}
      {modal === "review" && formData && (
        <ModalReview mode={mode} guests={guests} table={displayTable} seat={displaySeat} room={selectedRoom}
          form={formData} submitting={submitting} onEdit={() => setModal("details")} onSubmit={handleSubmit} />
      )}
      {modal === "success" && (
        <ModalSuccess refCode={refCode} onBack={handleBack} />
      )}
    </div>
  );
}

// ─── MODAL: Guest Count ───────────────────────────────────────────────────────
function ModalGuestCount({ mode, guests, onContinue, onCancel }) {
  const [localGuests, setLocalGuests] = useState(guests);
  const min = 1;
  const max = mode === "whole" ? 12 : 1;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,74,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 420, width: "100%" }}>
        <h3 style={{ color: "#1B2A4A", marginBottom: 20, fontSize: 18, fontWeight: 700 }}>How many guests?</h3>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <button onClick={() => setLocalGuests(Math.max(min, localGuests - 1))}
              style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #C9A84C", background: "#fff", color: "#C9A84C", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1B2A4A", minWidth: 60, textAlign: "center" }}>{localGuests}</div>
            <button onClick={() => setLocalGuests(Math.min(max, localGuests + 1))}
              style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #C9A84C", background: "#fff", color: "#C9A84C", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          <div style={{ textAlign: "center", color: "#666", fontSize: 12, marginTop: 8 }}>
            {mode === "whole" ? `Maximum ${max} guests per table` : "Individual seat reservation"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
          <button onClick={() => onContinue(localGuests)} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 8, background: "#C9A84C", color: "#fff", cursor: "pointer", fontSize: 14 }}>Continue</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: Details ───────────────────────────────────────────────────────────
function ModalDetails({ mode, guests, table, seat, room, onBack, onSubmit }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", eventDate: "", eventTime: "", specialRequests: "" });
  const inputStyle = { width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.eventDate) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(form);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,74,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 500, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <h3 style={{ color: "#1B2A4A", marginBottom: 20, fontSize: 18, fontWeight: 700 }}>Reservation Details</h3>
        <div style={{ background: "#F7F3EA", padding: 16, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>RESERVATION SUMMARY</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1B2A4A" }}>
            {mode === "whole" ? `Table ${table}` : `Seat ${seat}`} • {guests} guest{guests > 1 ? "s" : ""} • {room}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4 }}>First Name *</label>
              <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} style={inputStyle} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4 }}>Last Name *</label>
              <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} style={inputStyle} required />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4 }}>Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4 }}>Phone *</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4 }}>Event Date *</label>
              <input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} style={inputStyle} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4 }}>Event Time</label>
              <input type="time" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4 }}>Special Requests</label>
            <textarea value={form.specialRequests} onChange={e => setForm({ ...form, specialRequests: e.target.value })}
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="Any special requirements..." />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={onBack} style={{ flex: 1, padding: "12px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>Back</button>
            <button type="submit" style={{ flex: 1, padding: "12px", border: "none", borderRadius: 8, background: "#C9A84C", color: "#fff", cursor: "pointer", fontSize: 14 }}>Continue</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MODAL: Review ────────────────────────────────────────────────────────────
function ModalReview({ mode, guests, table, seat, room, form, submitting, onEdit, onSubmit }) {
  const rows = [["Room", room], ["Table", table], ["Seat(s)", seat], ["Guests", guests], ["Event Date", form.eventDate || "—"], ["Event Time", form.eventTime || "—"]];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,74,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 500, width: "100%" }}>
        <h3 style={{ color: "#1B2A4A", marginBottom: 20, fontSize: 18, fontWeight: 700 }}>Review Your Booking</h3>
        <div style={{ background: "#F7F3EA", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>RESERVATION DETAILS</div>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
              <span style={{ color: "#666" }}>{k}:</span>
              <span style={{ color: "#1B2A4A", fontWeight: k === "Seat(s)" ? 700 : 400 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#F7F3EA", padding: 16, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>GUEST INFORMATION</div>
          {[["Name", `${form.firstName} ${form.lastName}`], ["Email", form.email], ["Phone", form.phone], ["Special Requests", form.specialRequests || "None"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
              <span style={{ color: "#666" }}>{k}:</span>
              <span style={{ color: "#1B2A4A" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onEdit} disabled={submitting} style={{ flex: 1, padding: "12px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>Edit</button>
          <button onClick={onSubmit} disabled={submitting} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 8, background: "#C9A84C", color: "#fff", cursor: "pointer", fontSize: 14, opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Submitting..." : "Submit Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: Success ───────────────────────────────────────────────────────────
function ModalSuccess({ refCode, onBack }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,74,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#4CAF79", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>✓</div>
        <h3 style={{ color: "#1B2A4A", marginBottom: 16, fontSize: 18, fontWeight: 700 }}>Reservation Submitted!</h3>
        <p style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>
          Your reservation has been received and is pending admin approval. You will be notified once approved.
        </p>
        <div style={{ background: "#F7F3EA", padding: 12, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Reference Code</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#C9A84C" }}>{refCode || "—"}</div>
        </div>
        <button onClick={onBack} style={{ width: "100%", padding: "12px", border: "none", borderRadius: 8, background: "#C9A84C", color: "#fff", cursor: "pointer", fontSize: 14 }}>
          Back to Seat Map
        </button>
      </div>
    </div>
  );
}