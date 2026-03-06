// src/components/admin/Dashboard.jsx
import { useState, useEffect } from "react";
import { StatusPill, Toast, DetailModal } from "./AdminComponents";
import AdminNavbar from "./AdminNavbar";
import Sidebar from "./Sidebar";
import SeatMap, { STATUS_COLORS, STATUS_LABELS } from "./SeatMap";
import { SEAT_MAP_DATA } from "../../data/seatMapData";
import { saveSeatMapData, loadSeatMapData, subscribeToSeatMapChanges } from "../../utils/seatMapPersistence";

const MOCK_RESERVATIONS = [
  { id: "BLV-2025-0042", name: "Sarah Kim",        email: "sarahkim@gmail.com",     phone: "09123456789", room: "20/20 Function Room A",  table: "T1", seat: null,     guests: 2, eventDate: "March 15, 2026", eventTime: "7:00 PM",  specialRequests: "None",                   status: "pending",   type: "whole",      submittedAt: "Mar 03, 2026 · 10:42 AM" },
  { id: "BLV-2025-0039", name: "Marco dela Cruz",  email: "marco@email.com",         phone: "09987654321", room: "Alabang Function Room",   table: "T1", seat: "Seat 9", guests: 1, eventDate: "March 20, 2026", eventTime: "6:00 PM",  specialRequests: "Wheelchair access needed", status: "pending",   type: "individual", submittedAt: "Mar 02, 2026 · 3:15 PM"  },
  { id: "BLV-2025-0031", name: "Lia Santos",       email: "lia.santos@gmail.com",    phone: "09111222333", room: "Laguna Ballroom",         table: "T3", seat: null,     guests: 5, eventDate: "March 10, 2026", eventTime: "5:30 PM",  specialRequests: "Birthday setup",           status: "reserved",  type: "whole",      submittedAt: "Feb 28, 2026 · 9:00 AM"  },
  { id: "BLV-2025-0028", name: "James Reyes",      email: "james@email.com",         phone: "09555666777", room: "Business Center",         table: "T2", seat: "Seat 4", guests: 1, eventDate: "March 8, 2026",  eventTime: "2:00 PM",  specialRequests: "None",                   status: "available", type: "individual", submittedAt: "Feb 25, 2026 · 11:30 AM" },
  { id: "BLV-2025-0019", name: "Anna Tan",         email: "anna.tan@email.com",      phone: "09222333444", room: "20/20 Function Room B",   table: "T2", seat: null,     guests: 3, eventDate: "April 1, 2026",  eventTime: "8:00 PM",  specialRequests: "Vegan menu",               status: "pending",   type: "whole",      submittedAt: "Mar 01, 2026 · 8:20 AM"  },
  { id: "BLV-2025-0015", name: "David Lee",        email: "david.lee@email.com",     phone: "09155566677", room: "20/20 Function Room C",   table: "T3", seat: null,     guests: 4, eventDate: "March 25, 2026", eventTime: "6:30 PM",  specialRequests: "Corporate event setup",    status: "reserved",  type: "whole",      submittedAt: "Feb 20, 2026 · 2:15 PM"  },
];

const ROOM_CATEGORIES = {
  "All Venues": {
    "Main Wing": {
      "Alabang Function Room": [],
      "Laguna Ballroom": ["Laguna 1", "Laguna 2"],
      "20/20 Function Room": ["20/20 Function Room A", "20/20 Function Room B", "20/20 Function Room C"],
      "Business Center": [],
    },
    "Tower Wing": {
      "Tower Ballroom": ["Tower 1", "Tower 2", "Tower 3"],
      "Grand Ballroom":  ["Grand A", "Grand B", "Grand C"],
    },
    "Dining": {
      "Qsina":         [],
      "Hanakazu":      [],
      "Phoenix Court": [],
    },
  },
};

function Dashboard({ onLogout }) {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeNav,      setActiveNav]      = useState("reservations");
  const [reservations,   setReservations]   = useState(MOCK_RESERVATIONS);
  const [filterStatus,   setFilterStatus]   = useState("ALL");
  const [filterWing,     setFilterWing]     = useState("All Wings");
  const [filterVenue,    setFilterVenue]    = useState("All Venues");
  const [filterSubVenue, setFilterSubVenue] = useState("All Venues");
  const [search,         setSearch]         = useState("");
  const [viewRes,        setViewRes]        = useState(null);
  const [toast,          setToast]          = useState(null);

  // ── Seat Map state ────────────────────────────────────────────────────────
  const [selectedWing, setSelectedWing] = useState("Main Wing");
  const [selectedRoom, setSelectedRoom] = useState("Alabang Function Room");
  const [seatMapData,  setSeatMapData]  = useState(() => ({
    ...SEAT_MAP_DATA,
    ...loadSeatMapData(),
  }));
  const [editMode, setEditMode] = useState(false);

  // Subscribe to seat map changes from other components/tabs
  useEffect(() => {
    const unsub = subscribeToSeatMapChanges(({ wing, room, data }) => {
      setSeatMapData(prev => ({
        ...prev,
        [wing]: { ...prev[wing], [room]: data },
      }));
    });
    return unsub;
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id) => {
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: "reserved"  } : r));
    showToast("Reservation approved — status set to Reserved.", "#4CAF79");
  };

  const handleReject = (id) => {
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: "available" } : r));
    showToast("Reservation rejected — seat returned to Available.", "#E05252");
  };

  const getRoomStatusCounts = (roomData) => {
    if (!roomData?.seats) return { available: 0, pending: 0, reserved: 0 };
    return {
      available: roomData.seats.filter(s => s.status === "available").length,
      pending:   roomData.seats.filter(s => s.status === "pending").length,
      reserved:  roomData.seats.filter(s => s.status === "reserved").length,
    };
  };

  // ── Seat Map handlers ─────────────────────────────────────────────────────
  const handleSeatClick = (seat) => {
    const currentRoom = seatMapData[selectedWing]?.[selectedRoom];
    if (!currentRoom) return;
    const CYCLE = { available: "pending", pending: "reserved", reserved: "available" };
    const updated = { ...currentRoom, seats: currentRoom.seats.map(s => s.id === seat.id ? { ...s, status: CYCLE[s.status] || "available" } : s) };
    setSeatMapData(prev => ({ ...prev, [selectedWing]: { ...prev[selectedWing], [selectedRoom]: updated } }));
    showToast(`Seat ${seat.num} status updated`, "#C9A84C");
  };

  const handleTableClick = () => {
    const currentRoom = seatMapData[selectedWing]?.[selectedRoom];
    if (!currentRoom) return;
    const newStatus = currentRoom.tableStatus === "available" ? "reserved" : "available";
    const updated = { ...currentRoom, tableStatus: newStatus };
    setSeatMapData(prev => ({ ...prev, [selectedWing]: { ...prev[selectedWing], [selectedRoom]: updated } }));
    showToast(`${selectedRoom} table updated to ${newStatus}`, "#C9A84C");
  };

  const handleSeatMapUpdate = (updatedRoomData) => {
    setSeatMapData(prev => ({ ...prev, [selectedWing]: { ...prev[selectedWing], [selectedRoom]: updatedRoomData } }));
    const saved = saveSeatMapData(selectedWing, selectedRoom, updatedRoomData);
    showToast(saved ? "Seat map saved" : "Error saving seat map", saved ? "#4CAF79" : "#E05252");
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const pending  = reservations.filter(r => r.status === "pending").length;
  const approved = reservations.filter(r => r.status === "reserved").length;
  const rejected = reservations.filter(r => r.status === "available").length;

  const filtered = reservations.filter(r => {
    const mS = filterStatus === "ALL" || r.status === filterStatus.toLowerCase();
    let mR = true;
    if (filterWing !== "All Wings" && filterVenue !== "All Venues") {
      const wingVenues = ROOM_CATEGORIES["All Venues"][filterWing];
      if (wingVenues?.[filterVenue]) {
        const subVenues = wingVenues[filterVenue];
        mR = subVenues.length === 0 ? r.room === filterVenue : subVenues.includes(r.room);
        if (subVenues.length > 0 && filterSubVenue !== "All Venues") mR = r.room === filterSubVenue;
      }
    }
    const mQ = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    return mS && mR && mQ;
  });

  const currentWingData = seatMapData[selectedWing] || {};
  const currentRoomData = currentWingData[selectedRoom] || { seats: [], tableStatus: "available" };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "Montserrat, sans-serif", background: "#FFFFFF", minHeight: "100vh", color: "#333333" }}>
      <AdminNavbar onLogout={onLogout} />

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>

        {/* ── SIDEBAR ── */}
        <Sidebar
          activeNav={activeNav}
          onNavChange={setActiveNav}
          pending={pending}
          approved={approved}
          rejected={rejected}
        />

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", background: "#FFFFFF" }}>

          {/* ════════════════════════════════════════════════════════════════
              RESERVATIONS TAB
          ════════════════════════════════════════════════════════════════ */}
          {activeNav === "reservations" && (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>ADMIN · RESERVATION MANAGEMENT</div>
                  <div style={{ fontSize: 24, color: "#333333", fontWeight: "bold" }}>Reservation Dashboard</div>
                </div>
                <input
                  style={{ padding: "9px 14px", background: "#F8F9FA", border: "1px solid #E1E4E8", borderRadius: 6, color: "#333333", fontFamily: "Montserrat, sans-serif", fontSize: 12, width: 220, outline: "none" }}
                  placeholder="Search name or ref code..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  ["TOTAL RESERVATIONS",    reservations.length, "#D3AD53"],
                  ["PENDING RESERVATIONS",  pending,             "#F49E0C"],
                  ["APPROVED RESERVATIONS", approved,            "#0FBA81"],
                  ["REJECTED RESERVATIONS", rejected,            "#F43F5F"],
                ].map(([lbl, num, acc]) => (
                  <div
                    key={lbl}
                    onClick={() => {
                      if (lbl.includes("TOTAL"))    setFilterStatus("ALL");
                      else if (lbl.includes("PENDING"))  setFilterStatus("PENDING");
                      else if (lbl.includes("APPROVED")) setFilterStatus("APPROVED");
                      else if (lbl.includes("REJECTED")) setFilterStatus("REJECTED");
                    }}
                    style={{
                      background: lbl.includes("TOTAL")    ? "rgba(211,173,83,0.4)"  :
                                  lbl.includes("PENDING")  ? "rgba(255,173,34,0.5)"  :
                                  lbl.includes("APPROVED") ? "rgba(15,186,129,0.4)"  :
                                                             "rgba(244,63,95,0.4)",
                      border: `1px solid ${acc}`, borderRadius: 8, padding: "20px 22px",
                      textAlign: "center", cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.filter = "brightness(0.9)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.filter = "brightness(1)"; }}
                  >
                    <div style={{ fontSize: 45, fontWeight: 600, color: acc, lineHeight: 1, marginBottom: 12 }}>{num}</div>
                    <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 12 }}>EVENTS/VENUES</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

                  {/* Wing filter */}
                  <div style={{ background: "#fff", border: "1px solid #E1E4E8", borderRadius: 12, padding: 16, minWidth: 200, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["All Wings", "Main Wing", "Tower Wing", "Dining"].map(wing => (
                        <button
                          key={wing}
                          onClick={() => { setFilterWing(wing); setFilterVenue("All Venues"); setFilterSubVenue("All Venues"); }}
                          style={{ padding: "6px 12px", border: filterWing === wing ? "1px solid #C9A84C" : "1px solid #E5E7EB", borderRadius: 8, background: filterWing === wing ? "rgba(201,168,76,0.1)" : "#fff", color: filterWing === wing ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: filterWing === wing ? 600 : 400, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
                        >{wing}</button>
                      ))}
                    </div>
                  </div>

                  {/* Venue filter */}
                  {filterWing !== "All Wings" && (
                    <div style={{ background: "#fff", border: "1px solid #E1E4E8", borderRadius: 12, padding: 16, minWidth: 250, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: 8, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>VENUE</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Object.keys(ROOM_CATEGORIES["All Venues"][filterWing] || {}).map(venue => (
                          <button
                            key={venue}
                            onClick={() => { setFilterVenue(venue); setFilterSubVenue("All Venues"); }}
                            style={{ padding: "6px 12px", border: filterVenue === venue ? "1px solid #C9A84C" : "1px solid #E5E7EB", borderRadius: 8, background: filterVenue === venue ? "rgba(201,168,76,0.1)" : "#fff", color: filterVenue === venue ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: filterVenue === venue ? 600 : 400, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
                          >{venue}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-venue filter */}
                  {filterWing !== "All Wings" && filterVenue !== "All Venues" && ROOM_CATEGORIES["All Venues"][filterWing]?.[filterVenue]?.length > 0 && (
                    <div style={{ background: "#fff", border: "1px solid #E1E4E8", borderRadius: 12, padding: 16, minWidth: 200, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: 8, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>SUB-VENUE</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {ROOM_CATEGORIES["All Venues"][filterWing][filterVenue].map(subVenue => (
                          <button
                            key={subVenue}
                            onClick={() => setFilterSubVenue(subVenue)}
                            style={{ padding: "6px 12px", border: filterSubVenue === subVenue ? "1px solid #C9A84C" : "1px solid #E5E7EB", borderRadius: 8, background: filterSubVenue === subVenue ? "rgba(201,168,76,0.1)" : "#fff", color: filterSubVenue === subVenue ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: filterSubVenue === subVenue ? 600 : 400, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
                          >{subVenue}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reservations table */}
              <div style={{ background: "#F8F9FA", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["REFERENCE", "GUEST", "VENUES/EVENTS", "EVENT DATE", "GUESTS", "TYPE", "STATUS", "ACTIONS"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 9, letterSpacing: 2, fontWeight: 700, color: "#6C757D", borderBottom: "1px solid #E1E4E8", background: "#FFFFFF" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: "40px 0", textAlign: "center", fontSize: 13, color: "#6C757D" }}>No reservations match the current filters.</td></tr>
                    )}
                    {filtered.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}>
                        <td style={{ padding: "14px 16px", color: "#C9A84C", fontSize: 11, letterSpacing: 1, verticalAlign: "middle" }}>{r.id}</td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          <div style={{ color: "#333", fontWeight: 600, fontSize: 12 }}>{r.name}</div>
                          <div style={{ color: "#6C757D", fontSize: 10, marginTop: 2 }}>{r.email}</div>
                        </td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          <div style={{ color: "#333", fontSize: 12 }}>{r.room}</div>
                          <div style={{ color: "#6C757D", fontSize: 10, marginTop: 2 }}>{r.table} · {r.seat || "Whole"}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#333", verticalAlign: "middle" }}>{r.eventDate}</td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#333", textAlign: "center", verticalAlign: "middle" }}>{r.guests}</td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          <span style={{ background: r.type === "whole" ? "rgba(201,168,76,0.12)" : "rgba(100,160,255,0.12)", color: r.type === "whole" ? "#C9A84C" : "#6AA0FF", padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
                            {r.type === "whole" ? "WHOLE" : "SEAT"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}><StatusPill status={r.status} /></td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                          <button onClick={() => setViewRes(r)} style={{ padding: "5px 12px", border: "1px solid #E1E4E8", background: "transparent", color: "#6C757D", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>VIEW</button>
                          {r.status === "pending" && <>
                            <button onClick={() => handleApprove(r.id)} style={{ padding: "5px 12px", border: "1px solid #4CAF79", background: "transparent", color: "#4CAF79", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>✓</button>
                            <button onClick={() => handleReject(r.id)}  style={{ padding: "5px 12px", border: "1px solid #E05252", background: "transparent", color: "#E05252", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer" }}>✕</button>
                          </>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              SEAT MAP TAB
          ════════════════════════════════════════════════════════════════ */}
          {activeNav === "seat-map" && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>ADMIN · SEAT MAP</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 24, color: "#333333", fontWeight: "bold" }}>Live Seat Map</div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{ padding: "8px 16px", background: editMode ? "#C9A84C" : "transparent", color: editMode ? "#fff" : "#C9A84C", border: "1px solid #C9A84C", borderRadius: 6, cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}
                >
                  {editMode ? "✓ Editing" : "✏️ Edit Layout"}
                </button>
              </div>

              {/* Wing tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {Object.keys(seatMapData).map(wing => (
                  <button
                    key={wing}
                    onClick={() => { setSelectedWing(wing); setSelectedRoom(Object.keys(seatMapData[wing])[0]); }}
                    style={{ padding: "8px 16px", border: selectedWing === wing ? "1px solid #C9A84C" : "1px solid #E1E4E8", borderRadius: 8, background: selectedWing === wing ? "rgba(201,168,76,0.1)" : "#fff", color: selectedWing === wing ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: selectedWing === wing ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}
                  >{wing}</button>
                ))}
              </div>

              {/* Status counts bar */}
              {(() => {
                const counts = getRoomStatusCounts(currentRoomData);
                return (
                  <div style={{ display: "flex", gap: 24, marginBottom: 24, padding: "12px 16px", background: "#F8F9FA", borderRadius: 8, border: "1px solid #E1E4E8" }}>
                    {[["available", counts.available], ["pending", counts.pending], ["reserved", counts.reserved]].map(([key, count]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: STATUS_COLORS[key] }} />
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#374151", textTransform: "capitalize" }}>{key}: {count}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Room list + seat map */}
              <div style={{ display: "flex", gap: 24 }}>

                {/* Room list */}
                <div style={{ minWidth: 200, flexShrink: 0 }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>
                    Rooms in {selectedWing}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.keys(currentWingData).map(room => {
                      const counts = getRoomStatusCounts(currentWingData[room]);
                      const isSel  = selectedRoom === room;
                      return (
                        <div
                          key={room}
                          onClick={() => setSelectedRoom(room)}
                          style={{ padding: "12px 16px", border: isSel ? "1px solid #C9A84C" : "1px solid #E1E4E8", borderRadius: 8, background: isSel ? "rgba(201,168,76,0.1)" : "#fff", cursor: "pointer", transition: "all 0.2s" }}
                        >
                          <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: isSel ? 600 : 400, color: isSel ? "#C9A84C" : "#374151", marginBottom: 4 }}>{room}</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            {counts.pending  > 0 && <span style={{ background: STATUS_COLORS.pending,  color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 9 }}>{counts.pending} pending</span>}
                            {counts.reserved > 0 && <span style={{ background: STATUS_COLORS.reserved, color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 9 }}>{counts.reserved} reserved</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Seat map canvas */}
                <div style={{ flex: 1, minWidth: 400 }}>
                  <div style={{ background: "#EFEAD9", borderRadius: 12, padding: 24, border: "1px solid #D4C5A0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#333", fontWeight: 600, marginBottom: 16, textAlign: "center" }}>
                      {selectedRoom}
                    </div>
                    <SeatMap
                      tableData={currentRoomData}
                      mode="individual"
                      selectedSeat={null}
                      onSeatClick={handleSeatClick}
                      onTableClick={handleTableClick}
                      windowWidth={800}
                      editMode={editMode}
                      onUpdate={handleSeatMapUpdate}
                      wing={selectedWing}
                      room={selectedRoom}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {viewRes && (
        <DetailModal
          res={viewRes}
          onClose={() => setViewRes(null)}
          onApprove={id => { handleApprove(id); setViewRes(null); }}
          onReject={id  => { handleReject(id);  setViewRes(null); }}
        />
      )}
      {toast && <Toast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
    </div>
  );
}

export default Dashboard;