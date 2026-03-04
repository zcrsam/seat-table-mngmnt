import { useState, useEffect } from "react";
import { StatusPill, Toast, DetailModal } from "./AdminComponents";
import AdminNavbar from "./AdminNavbar";
import Sidebar from "./Sidebar";
import SeatMap, { STATUS_COLORS, STATUS_LABELS } from "./SeatMap";
import { SEAT_MAP_DATA } from "../../data/seatMapData";
import { saveSeatMapData, loadSeatMapData, subscribeToSeatMapChanges } from "../../utils/seatMapPersistence";

const MOCK_RESERVATIONS = [
  { id: "BLV-2025-0042", name: "Sarah Kim", email: "sarahkim@gmail.com", phone: "09123456789", room: "20/20 Function Room", table: "T1", seat: null, guests: 2, eventDate: "March 15, 2026", eventTime: "7:00 PM", specialRequests: "None", status: "pending", type: "whole", submittedAt: "Mar 03, 2026 · 10:42 AM" },
  { id: "BLV-2025-0039", name: "Marco dela Cruz", email: "marco@email.com", phone: "09987654321", room: "Alabang Function Room", table: "T1", seat: "Seat 9", guests: 1, eventDate: "March 20, 2026", eventTime: "6:00 PM", specialRequests: "Wheelchair access needed", status: "pending", type: "individual", submittedAt: "Mar 02, 2026 · 3:15 PM" },
  { id: "BLV-2025-0031", name: "Lia Santos", email: "lia.santos@gmail.com", phone: "09111222333", room: "Laguna Ballroom", table: "T3", seat: null, guests: 5, eventDate: "March 10, 2026", eventTime: "5:30 PM", specialRequests: "Birthday setup", status: "reserved", type: "whole", submittedAt: "Feb 28, 2026 · 9:00 AM" },
  { id: "BLV-2025-0028", name: "James Reyes", email: "james@email.com", phone: "09555666777", room: "Business Center", table: "T2", seat: "Seat 4", guests: 1, eventDate: "March 8, 2026", eventTime: "2:00 PM", specialRequests: "None", status: "available", type: "individual", submittedAt: "Feb 25, 2026 · 11:30 AM" },
  { id: "BLV-2025-0019", name: "Anna Tan", email: "anna.tan@email.com", phone: "09222333444", room: "20/20 Function Room", table: "T2", seat: null, guests: 3, eventDate: "April 1, 2026", eventTime: "8:00 PM", specialRequests: "Vegan menu", status: "pending", type: "whole", submittedAt: "Mar 01, 2026 · 8:20 AM" },
];

const ROOM_CATEGORIES = {
  "All Venues": {
    "Main Wing": {
      "Alabang Function Room": ["Alabang Function Room"],
      "Laguna Ballroom": ["Laguna 1", "Laguna 2"],
      "20/20 Function Room": ["20/20 Function Room A", "20/20 Function Room B", "20/20 Function Room C"],
      "Business Center": ["Business Center"]
    },
    "Tower Wing": {
      "Tower Ballroom": ["Tower 1", "Tower 2", "Tower 3"],
      "Grand Ballroom": ["Grand A", "Grand B", "Grand C"]
    },
    "Dining": {
      "Qsina": ["Qsina"],
      "Hanakazu": ["Hanakazu"],
      "Phoenix Court": ["Phoenix Court"]
    }
  }
};

function Dashboard({ onLogout }) {
  const [reservations, setReservations] = useState(MOCK_RESERVATIONS);
  const [activeNav, setActiveNav] = useState("reservations");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterWing, setFilterWing] = useState("All Wings");
  const [filterVenue, setFilterVenue] = useState("All Venues");
  const [filterSubVenue, setFilterSubVenue] = useState("All Venues");
  const [search, setSearch] = useState("");
  const [viewRes, setViewRes] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Seat Map State
  const [selectedWing, setSelectedWing] = useState("Main Wing");
  const [selectedRoom, setSelectedRoom] = useState("Alabang Function Room");
  const [seatMapData, setSeatMapData] = useState(() => {
    const persistedData = loadSeatMapData();
    return {
      ...SEAT_MAP_DATA,
      ...persistedData,
    };
  });
  const [editMode, setEditMode] = useState(false);

  // Subscribe to seat map changes from other components
  useEffect(() => {
    const unsubscribe = subscribeToSeatMapChanges(({ wing, room, data }) => {
      setSeatMapData(prev => ({
        ...prev,
        [wing]: {
          ...prev[wing],
          [room]: data,
        },
      }));
    });
    return unsubscribe;
  }, []);

  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id) => {
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: "reserved" } : r));
    showToast("Reservation approved — status set to Reserved.", "#4CAF79");
  };

  const handleReject = (id) => {
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: "available" } : r));
    showToast("Reservation rejected — seat returned to Available.", "#E05252");
  };

  // Seat Map Handlers
  const handleSeatClick = (seat) => {
    const currentRoom = seatMapData[selectedWing]?.[selectedRoom];
    if (!currentRoom) return;

    const STATUS_CYCLE = { available: "pending", pending: "reserved", reserved: "available" };
    const updatedSeats = currentRoom.seats.map(s =>
      s.id === seat.id ? { ...s, status: STATUS_CYCLE[s.status] || "available" } : s
    );

    const updatedRoom = { ...currentRoom, seats: updatedSeats };
    setSeatMapData(prev => ({
      ...prev,
      [selectedWing]: {
        ...prev[selectedWing],
        [selectedRoom]: updatedRoom,
      },
    }));
    showToast(`Seat ${seat.num} status updated`, "#C9A84C");
  };

  const handleTableClick = () => {
    const currentRoom = seatMapData[selectedWing]?.[selectedRoom];
    if (!currentRoom) return;

    const newStatus = currentRoom.tableStatus === "available" ? "reserved" : "available";
    const updatedRoom = { ...currentRoom, tableStatus: newStatus };
    setSeatMapData(prev => ({
      ...prev,
      [selectedWing]: {
        ...prev[selectedWing],
        [selectedRoom]: updatedRoom,
      },
    }));
    showToast(`${selectedRoom} table status updated to ${newStatus}`, "#C9A84C");
  };

  const getRoomStatusCounts = (roomData) => {
    if (!roomData?.seats) return { available: 0, pending: 0, reserved: 0 };
    return {
      available: roomData.seats.filter(s => s.status === "available").length,
      pending:   roomData.seats.filter(s => s.status === "pending").length,
      reserved:  roomData.seats.filter(s => s.status === "reserved").length,
    };
  };

  const handleSeatMapUpdate = (updatedRoomData) => {
    setSeatMapData(prev => ({
      ...prev,
      [selectedWing]: {
        ...prev[selectedWing],
        [selectedRoom]: updatedRoomData,
      },
    }));
    const saved = saveSeatMapData(selectedWing, selectedRoom, updatedRoomData);
    if (saved) {
      showToast("Seat map updated and saved", "#4CAF79");
    } else {
      showToast("Error saving seat map", "#E05252");
    }
  };

  const handleStatClick = (label) => {
    if (label.includes("TOTAL"))    setFilterStatus("ALL");
    else if (label.includes("PENDING"))  setFilterStatus("PENDING");
    else if (label.includes("APPROVED")) setFilterStatus("APPROVED");
    else if (label.includes("REJECTED")) setFilterStatus("REJECTED");
  };

  // FIX: corrected the broken filter function (misplaced closing brace + logic)
  const filtered = reservations.filter(r => {
    const mS = filterStatus === "ALL" || r.status === filterStatus.toLowerCase();

    let mR = true; // default: show all
    if (filterWing !== "All Wings" && filterVenue !== "All Venues" && filterSubVenue !== "All Venues") {
      const wingVenues = ROOM_CATEGORIES["All Venues"][filterWing];
      if (wingVenues && wingVenues[filterVenue]) {
        mR = wingVenues[filterVenue].includes(r.room);
      }
    }

    const mQ = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());

    return mS && mR && mQ;
  });

  const pending  = reservations.filter(r => r.status === "pending").length;
  const approved = reservations.filter(r => r.status === "reserved").length;
  const rejected = reservations.filter(r => r.status === "available").length;

  // FIX: removed duplicate "Rooms" nav item
  const navItems = [
    { id: "reservations", label: "Reservations", icon: "📋" },
    { id: "seat-map",     label: "Seat Map",      icon: "🗺️" },
    { id: "rooms",        label: "Rooms",         icon: "🏛️" },
    { id: "settings",     label: "Settings",      icon: "⚙️" },
  ];

  // Guard: ensure selectedWing/Room are valid after seatMapData loads
  const currentWingData = seatMapData[selectedWing] || {};
  const currentRoomData = currentWingData[selectedRoom] || { seats: [], tableStatus: "available" };

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif", background: "#FFFFFF", minHeight: "100vh", color: "#1B2A4A" }}>
      <AdminNavbar onLogout={onLogout} />

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>

        {/* SIDEBAR */}
        <aside style={{
          width: isSidebarOpen ? 240 : 50,
          background: "#0F1825",
          borderRight: "1px solid rgba(201,168,76,0.15)",
          padding: isSidebarOpen ? "28px 0" : "16px 0",
          flexShrink: 0,
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            display: "flex",
            justifyContent: isSidebarOpen ? "flex-start" : "center",
            paddingLeft: isSidebarOpen ? "20px" : "0",
            marginBottom: isSidebarOpen ? "20px" : "0",
          }}>
            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>

          {isSidebarOpen && (
            <>
              <div style={{ padding: "0 20px", marginBottom: 14, fontSize: 9, letterSpacing: 2, color: "#E8E2D4", fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>NAVIGATION</div>
              {navItems.map(item => (
                <div
                  key={item.id + item.label}
                  onClick={() => setActiveNav(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 20px",
                    fontFamily: "Montserrat, sans-serif", fontSize: 12,
                    color: activeNav === item.id ? "#C9A84C" : "#E8E2D4",
                    background: activeNav === item.id ? "rgba(201,168,76,0.08)" : "transparent",
                    borderLeft: activeNav === item.id ? "2px solid #C9A84C" : "2px solid transparent",
                    cursor: "pointer",
                    fontWeight: activeNav === item.id ? 700 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  <span>{item.icon}</span>{item.label}
                </div>
              ))}

              <div style={{ margin: "28px 0 14px", padding: "0 20px", fontSize: 9, letterSpacing: 2, color: "#E8E2D4", fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>QUICK STATS</div>
              {[["Pending", pending, "#E8A838"], ["Approved", approved, "#4CAF79"], ["Rejected", rejected, "#E05252"]].map(([lbl, val, col]) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", padding: "7px 20px", fontFamily: "Montserrat, sans-serif", fontSize: 11 }}>
                  <span style={{ color: "#E8E2D4" }}>{lbl}</span>
                  <span style={{ color: col, fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </>
          )}
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", background: "#FFFFFF" }}>

          {/* ── RESERVATIONS TAB ── */}
          {activeNav === "reservations" && (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>ADMIN · RESERVATION MANAGEMENT</div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 24, color: "#1B2A4A", fontWeight: "bold" }}>Reservation Dashboard</div>
                </div>
                <input
                  style={{ padding: "9px 14px", background: "#F8F9FA", border: "1px solid #E1E4E8", borderRadius: 6, color: "#1B2A4A", fontFamily: "Montserrat, sans-serif", fontSize: 12, width: 220, outline: "none" }}
                  placeholder="Search name or ref code..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  ["TOTAL RESERVATIONS",    reservations.length, "#D3AD53"],
                  ["PENDING RESERVATIONS",  pending,             "#F49E0C"],
                  ["APPROVED RESERVATIONS", approved,            "#0FBA81"],
                  ["REJECTED RESERVATIONS", rejected,            "#F43F5F"],
                ].map(([lbl, num, acc]) => (
                  <div
                    key={lbl}
                    onClick={() => handleStatClick(lbl)}
                    style={{
                      background: lbl.includes("TOTAL")    ? "rgba(211,173,83,0.4)"  :
                                  lbl.includes("PENDING")  ? "rgba(255,173,34,0.5)"  :
                                  lbl.includes("APPROVED") ? "rgba(15,186,129,0.4)"  :
                                                             "rgba(244,63,95,0.4)",
                      border: `1px solid ${acc}`,
                      borderRadius: 8, padding: "20px 22px",
                      position: "relative", overflow: "hidden",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      textAlign: "center", cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.filter = "brightness(0.9)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0px)";  e.currentTarget.style.filter = "brightness(1)"; }}
                  >
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 45, fontWeight: "600", color: acc, lineHeight: 1, marginBottom: 12 }}>{num}</div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9, color: "#6B7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 9, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 12 }}>EVENTS/VENUES</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

                  {/* Wing */}
                  <div style={{ background: "#FFFFFF", border: "1px solid #E1E4E8", borderRadius: 12, padding: 16, minWidth: 200, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 8, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>WING</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["All Wings", "Main Wing", "Tower Wing", "Dining"].map(wing => (
                        <button
                          key={wing}
                          onClick={() => { setFilterWing(wing); setFilterVenue("All Venues"); setFilterSubVenue("All Venues"); }}
                          style={{ padding: "6px 12px", border: filterWing === wing ? "1px solid #C9A84C" : "1px solid #E5E7EB", borderRadius: 8, background: filterWing === wing ? "rgba(201,168,76,0.1)" : "#FFFFFF", color: filterWing === wing ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: filterWing === wing ? 600 : 400, cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" }}
                          onMouseEnter={e => { if (filterWing !== wing) { e.target.style.background = "rgba(201,168,76,0.05)"; e.target.style.borderColor = "#C9A84C"; } }}
                          onMouseLeave={e => { if (filterWing !== wing) { e.target.style.background = "#FFFFFF"; e.target.style.borderColor = "#E5E7EB"; } }}
                        >{wing}</button>
                      ))}
                    </div>
                  </div>

                  {/* Venue */}
                  {filterWing !== "All Wings" && (
                    <div style={{ background: "#FFFFFF", border: "1px solid #E1E4E8", borderRadius: 12, padding: 16, minWidth: 250, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 8, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>VENUE</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Object.keys(ROOM_CATEGORIES["All Venues"][filterWing] || {}).map(venue => (
                          <button
                            key={venue}
                            onClick={() => { setFilterVenue(venue); setFilterSubVenue("All Venues"); }}
                            style={{ padding: "6px 12px", border: filterVenue === venue ? "1px solid #C9A84C" : "1px solid #E5E7EB", borderRadius: 8, background: filterVenue === venue ? "rgba(201,168,76,0.1)" : "#FFFFFF", color: filterVenue === venue ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: filterVenue === venue ? 600 : 400, cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" }}
                            onMouseEnter={e => { if (filterVenue !== venue) { e.target.style.background = "rgba(201,168,76,0.05)"; e.target.style.borderColor = "#C9A84C"; } }}
                            onMouseLeave={e => { if (filterVenue !== venue) { e.target.style.background = "#FFFFFF"; e.target.style.borderColor = "#E5E7EB"; } }}
                          >{venue}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-venue */}
                  {filterWing !== "All Wings" && filterVenue !== "All Venues" && ROOM_CATEGORIES["All Venues"][filterWing]?.[filterVenue] && (
                    <div style={{ background: "#FFFFFF", border: "1px solid #E1E4E8", borderRadius: 12, padding: 16, minWidth: 200, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 8, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>SUB-VENUE</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {ROOM_CATEGORIES["All Venues"][filterWing][filterVenue].map(subVenue => (
                          <button
                            key={subVenue}
                            onClick={() => setFilterSubVenue(subVenue)}
                            style={{ padding: "6px 12px", border: filterSubVenue === subVenue ? "1px solid #C9A84C" : "1px solid #E5E7EB", borderRadius: 8, background: filterSubVenue === subVenue ? "rgba(201,168,76,0.1)" : "#FFFFFF", color: filterSubVenue === subVenue ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: filterSubVenue === subVenue ? 600 : 400, cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" }}
                            onMouseEnter={e => { if (filterSubVenue !== subVenue) { e.target.style.background = "rgba(201,168,76,0.05)"; e.target.style.borderColor = "#C9A84C"; } }}
                            onMouseLeave={e => { if (filterSubVenue !== subVenue) { e.target.style.background = "#FFFFFF"; e.target.style.borderColor = "#E5E7EB"; } }}
                          >{subVenue}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div style={{ background: "#F8F9FA", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["REFERENCE", "GUEST", "VENUES/EVENTS", "EVENT DATE", "GUESTS", "TYPE", "STATUS", "ACTIONS"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Montserrat, sans-serif", fontSize: 9, letterSpacing: 2, fontWeight: 700, color: "#6C757D", borderBottom: "1px solid #E1E4E8", background: "#FFFFFF" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: "40px 0", textAlign: "center", fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#6C757D" }}>No reservations match the current filters.</td></tr>
                    )}
                    {filtered.map((r, i) => (
                      <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}>
                        <td style={{ padding: "14px 16px", fontFamily: "Montserrat, sans-serif", color: "#C9A84C", fontSize: 11, letterSpacing: 1, verticalAlign: "middle" }}>{r.id}</td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          <div style={{ color: "#1B2A4A", fontWeight: 600, fontFamily: "Montserrat, sans-serif", fontSize: 12 }}>{r.name}</div>
                          <div style={{ color: "#6C757D", fontSize: 10, marginTop: 2, fontFamily: "Montserrat, sans-serif" }}>{r.email}</div>
                        </td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          <div style={{ color: "#1B2A4A", fontFamily: "Montserrat, sans-serif", fontSize: 12 }}>{r.room}</div>
                          <div style={{ color: "#6C757D", fontSize: 10, marginTop: 2, fontFamily: "Montserrat, sans-serif" }}>{r.table} · {r.seat || "Whole"}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#1B2A4A", verticalAlign: "middle" }}>{r.eventDate}</td>
                        <td style={{ padding: "14px 16px", fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#1B2A4A", textAlign: "center", verticalAlign: "middle" }}>{r.guests}</td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          <span style={{ background: r.type === "whole" ? "rgba(201,168,76,0.12)" : "rgba(100,160,255,0.12)", color: r.type === "whole" ? "#C9A84C" : "#6AA0FF", padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "Montserrat, sans-serif" }}>
                            {r.type === "whole" ? "WHOLE" : "SEAT"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}><StatusPill status={r.status} /></td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                          <button onClick={() => setViewRes(r)} style={{ padding: "5px 12px", border: "1px solid #E1E4E8", background: "transparent", color: "#6C757D", borderRadius: 4, fontFamily: "Montserrat, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>VIEW</button>
                          {r.status === "pending" && <>
                            <button onClick={() => handleApprove(r.id)} style={{ padding: "5px 12px", border: "1px solid #4CAF79", background: "transparent", color: "#4CAF79", borderRadius: 4, fontFamily: "Montserrat, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>✓</button>
                            <button onClick={() => handleReject(r.id)}  style={{ padding: "5px 12px", border: "1px solid #E05252", background: "transparent", color: "#E05252", borderRadius: 4, fontFamily: "Montserrat, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer" }}>✕</button>
                          </>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SEAT MAP TAB ── */}
          {activeNav === "seat-map" && (
            <div>
              <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>ADMIN · SEAT MAP</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 24, color: "#1B2A4A", fontWeight: "bold" }}>Live Seat Map</div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{ padding: "8px 16px", background: editMode ? "#C9A84C" : "transparent", color: editMode ? "#fff" : "#C9A84C", border: "1px solid #C9A84C", borderRadius: 6, cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, transition: "all 0.2s ease" }}
                >
                  {editMode ? "✓ Editing" : "✏️ Edit Layout"}
                </button>
              </div>

              {/* Wing Tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {Object.keys(seatMapData).map(wing => (
                  <button
                    key={wing}
                    onClick={() => {
                      setSelectedWing(wing);
                      setSelectedRoom(Object.keys(seatMapData[wing])[0]);
                    }}
                    style={{ padding: "8px 16px", border: selectedWing === wing ? "1px solid #C9A84C" : "1px solid #E1E4E8", borderRadius: 8, background: selectedWing === wing ? "rgba(201,168,76,0.1)" : "#FFFFFF", color: selectedWing === wing ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: selectedWing === wing ? 600 : 400, cursor: "pointer", transition: "all 0.2s ease" }}
                  >
                    {wing}
                  </button>
                ))}
              </div>

              {/* Status Counts Bar */}
              {(() => {
                const counts = getRoomStatusCounts(currentRoomData);
                return (
                  <div style={{ display: "flex", gap: 24, marginBottom: 24, padding: "12px 16px", background: "#F8F9FA", borderRadius: 8, border: "1px solid #E1E4E8" }}>
                    {[["available", counts.available], ["pending", counts.pending], ["reserved", counts.reserved]].map(([key, count]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: STATUS_COLORS[key] }} />
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#374151", textTransform: "capitalize" }}>
                          {key}: {count}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Main Layout: Room List | Seat Map | Recent Reservations */}
              <div style={{ display: "flex", gap: 24 }}>

                {/* Left: Room List */}
                <div style={{ minWidth: 200, flexShrink: 0 }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>
                    Rooms in {selectedWing}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.keys(currentWingData).map(room => {
                      const roomData = currentWingData[room];
                      const counts   = getRoomStatusCounts(roomData);
                      const isSelected = selectedRoom === room;
                      return (
                        <div
                          key={room}
                          onClick={() => setSelectedRoom(room)}
                          style={{ padding: "12px 16px", border: isSelected ? "1px solid #C9A84C" : "1px solid #E1E4E8", borderRadius: 8, background: isSelected ? "rgba(201,168,76,0.1)" : "#FFFFFF", cursor: "pointer", transition: "all 0.2s ease" }}
                        >
                          <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: isSelected ? 600 : 400, color: isSelected ? "#C9A84C" : "#374151", marginBottom: 4 }}>{room}</div>
                          <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
                            {counts.pending  > 0 && <span style={{ background: STATUS_COLORS.pending,  color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 9 }}>{counts.pending} pending</span>}
                            {counts.reserved > 0 && <span style={{ background: STATUS_COLORS.reserved, color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 9 }}>{counts.reserved} reserved</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Center: Seat Map */}
                <div style={{ flex: 1, minWidth: 400 }}>
                  <div style={{ background: "#EFEAD9", borderRadius: 12, padding: 24, border: "1px solid #D4C5A0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#1B2A4A", fontWeight: 600, marginBottom: 16, textAlign: "center" }}>
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

                {/* Right: Recent Reservations */}
                <div style={{ minWidth: 250, flexShrink: 0 }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>
                    Recent Reservations
                  </div>
                  <div style={{ background: "#F8F9FA", borderRadius: 8, padding: 16, border: "1px solid #E1E4E8", maxHeight: 400, overflowY: "auto" }}>
                    {reservations
                      .filter(r => r.room.includes(selectedRoom.split(" ")[0]))
                      .slice(0, 5)
                      .map(reservation => (
                        <div key={reservation.id} style={{ padding: "8px 0", borderBottom: "1px solid #E1E4E8", fontSize: 11 }}>
                          <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, color: "#1B2A4A", marginBottom: 2 }}>{reservation.name}</div>
                          <div style={{ color: "#6B7280", fontSize: 10 }}>{reservation.id} • {reservation.eventDate}</div>
                          <div style={{ marginTop: 2 }}><StatusPill status={reservation.status} /></div>
                        </div>
                      ))
                    }
                    {reservations.filter(r => r.room.includes(selectedRoom.split(" ")[0])).length === 0 && (
                      <div style={{ textAlign: "center", color: "#6B7280", fontSize: 11, padding: 20 }}>No recent reservations</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ROOMS / SETTINGS PLACEHOLDER ── */}
          {(activeNav === "rooms" || activeNav === "settings") && (
            <div style={{ marginTop: 60, textAlign: "center", color: "#6C757D", fontFamily: "Montserrat, sans-serif", fontSize: 20 }}>
              {activeNav === "rooms" ? "🏛️  Rooms management — coming soon." : "⚙️  Settings panel — coming soon."}
            </div>
          )}

        </main>
      </div>

      {viewRes && <DetailModal res={viewRes} onClose={() => setViewRes(null)} onApprove={id => { handleApprove(id); setViewRes(null); }} onReject={id => { handleReject(id); setViewRes(null); }} />}
      {toast && <Toast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
    </div>
  );
}

export default Dashboard;