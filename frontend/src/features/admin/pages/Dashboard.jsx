// src/features/admin/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { reservationAPI } from "../../../services/reservationAPI";
import { StatusPill, Toast, DetailModal } from "../components/AdminComponents";
import AdminNavbar from "../../../components/layout/AdminNavbar";
import Sidebar from "../../../components/layout/Sidebar";
import SeatMap, { STATUS_COLORS, STATUS_LABELS } from "../../../components/seatmap/SeatMap";
import { SEAT_MAP_DATA } from "../../../data/seatMapData";
import {
  saveSeatMapData,
  loadSeatMapData,
  subscribeToSeatMapChanges,
  dispatchSeatMapUpdate,
} from "../../../utils/seatMapPersistence.js";

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

// ── Sort helper ───────────────────────────────────────────────────────────────
function parseEventDate(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? Infinity : d.getTime();
}
function sortReservations(a, b) {
  const evA = parseEventDate(a.eventDate);
  const evB = parseEventDate(b.eventDate);
  if (evA !== evB) return evA - evB;
  const tsA = a.submittedTimestamp || 0;
  const tsB = b.submittedTimestamp || 0;
  return tsA - tsB;
}

const RESERVATIONS_KEY = "bellevue_reservations";

function Dashboard({ onLogout }) {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeNav,      setActiveNav]      = useState(() => localStorage.getItem("admin_active_nav") || "seat-map");
  const [reservations,   setReservations]   = useState([]);
  const [stats,          setStats]          = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filterStatus,   setFilterStatus]   = useState("ALL");
  const [filterWing,     setFilterWing]     = useState("All Wings");
  const [filterVenue,    setFilterVenue]    = useState("All Venues");
  const [filterSubVenue, setFilterSubVenue] = useState("All Venues");
  const [search,         setSearch]         = useState("");
  const [viewRes,        setViewRes]        = useState(null);
  const [toast,          setToast]          = useState(null);
  const [loading,        setLoading]        = useState(true);

  // ── Fetch reservations + stats from backend ───────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reservationsResponse, statsData] = await Promise.all([
          reservationAPI.getAll(),
          reservationAPI.getStats(),
        ]);
        const reservationsData = reservationsResponse.data || [];
        setReservations(reservationsData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        showToast("Failed to load data", "#E05252");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Seat Map state ────────────────────────────────────────────────────────
  const [selectedWing, setSelectedWing] = useState("Main Wing");
  const [selectedRoom, setSelectedRoom] = useState("Alabang Function Room");
  const [seatMapData,  setSeatMapData]  = useState(() => {
    const savedData = loadSeatMapData();
    return {
      "Main Wing":   { ...SEAT_MAP_DATA["Main Wing"],   ...(savedData?.["Main Wing"]   || {}) },
      "Tower Wing":  { ...SEAT_MAP_DATA["Tower Wing"],  ...(savedData?.["Tower Wing"]  || {}) },
      "Dining":      { ...SEAT_MAP_DATA["Dining"],      ...(savedData?.["Dining"]      || {}) },
    };
  });
  const [editMode, setEditMode] = useState(false);

  // ── Subscribe to seat map changes (client reservations + same-tab saves) ──
  useEffect(() => {
    const unsub = subscribeToSeatMapChanges(({ wing, room, data }) => {
      setSeatMapData(prev => ({
        ...prev,
        [wing]: { ...prev[wing], [room]: data },
      }));
    });
    return unsub;
  }, []);

  // ── Sync reservations from localStorage (cross-tab) ───────────────────────
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || "[]");
        setReservations(prev => {
          const storedMap = new Map(stored.map(r => [r.id, r]));
          const prevIds   = new Set(prev.map(r => r.id));
          const updated   = prev.map(r => storedMap.has(r.id) ? { ...r, ...storedMap.get(r.id) } : r);
          const incoming  = stored.filter(r => !prevIds.has(r.id));
          return [...updated, ...incoming].sort(sortReservations);
        });
      } catch {}
    };
    const onStorage = (e) => { if (e.key === RESERVATIONS_KEY) syncFromStorage(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── Persist active nav tab ────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("admin_active_nav", activeNav); }, [activeNav]);

  // ─────────────────────────────────────────────────────────────────────────
  // syncSeatToStorage — called after approve / reject / delete so the correct
  // seat color is immediately written to localStorage and broadcast to every
  // open tab (including the client-facing AlabangReserve page).
  //
  //   newStatus: "reserved" → seat turns red
  //              "rejected" → seat turns green (available)
  //              "pending"  → seat turns orange
  // ─────────────────────────────────────────────────────────────────────────
  const syncSeatToStorage = (reservationId, newStatus) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;

    const wing = findWingForRoom(res.room);
    if (!wing) return;

    const key = `seatmap:${wing}:${res.room}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const tables = Array.isArray(parsed) ? parsed : [parsed];

      // Map reservation status → seat color
      const seatStatus =
        newStatus === "reserved" ? "reserved"  :
        newStatus === "rejected" ? "available" :
        "pending";

      const updated = tables.map(t => {
        // Skip tables that don't match (when reservation has a table id)
        if (res.table && String(t.id) !== String(res.table)) return t;

        let newSeats;

        if (res.type === "whole") {
          // For whole-table reservations only update the first N seats that were
          // previously marked as pending/reserved by this reservation.
          let slotsLeft = seatStatus === "available"
            ? 0
            : (parseInt(res.guests) || t.seats.length);

          newSeats = t.seats.map(s => {
            if (
              slotsLeft > 0 &&
              (s.status === "pending" || s.status === "reserved")
            ) {
              slotsLeft--;
              return { ...s, status: seatStatus };
            }
            return s;
          });
        } else {
          // Individual seat — match by seat number
          const seatNum = parseInt(String(res.seat || "").replace(/\D/g, ""));
          newSeats = t.seats.map(s =>
            s.num === seatNum ? { ...s, status: seatStatus } : s
          );
        }

        return { ...t, seats: newSeats };
      });

      const payload = updated.length === 1 ? updated[0] : updated;

      // Update in-memory seatMapData so the admin seat map re-renders
      setSeatMapData(prev => ({
        ...prev,
        [wing]: { ...prev[wing], [res.room]: Array.isArray(payload) ? payload[0] : payload },
      }));

      // Write to localStorage and fire events so every tab (incl. client) reacts
      dispatchSeatMapUpdate(wing, res.room, payload);
    } catch (e) {
      console.error("[Dashboard] syncSeatToStorage failed:", e);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // syncSeatMapFromReservations — rebuilds every seatmap key in localStorage
  // from the full reservations list.  Called once on mount so the seat map
  // always reflects the current reservation states after a page reload.
  // ─────────────────────────────────────────────────────────────────────────
  const syncSeatMapFromReservations = (resList) => {
    // Group by seatmap key
    const byKey = {};
    for (const r of resList) {
      const wing = findWingForRoom(r.room);
      if (!wing) continue;
      const key = `seatmap:${wing}:${r.room}`;
      if (!byKey[key]) byKey[key] = { wing, room: r.room, reservations: [] };
      byKey[key].reservations.push(r);
    }

    for (const [key, { wing, room, reservations: rList }] of Object.entries(byKey)) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const tables = Array.isArray(parsed) ? parsed : [parsed];

        const updated = tables.map(t => {
          const seatOverrides = {};
          let wholeRes = null;

          for (const r of rList) {
            if (r.table && String(r.table) !== String(t.id)) continue;

            const seatStatus =
              r.status === "pending"  ? "pending"   :
              r.status === "reserved" ? "reserved"  :
              "available";

            if (r.type === "whole") {
              const priority = { reserved: 2, pending: 1, available: 0 };
              if (!wholeRes || priority[seatStatus] >= priority[wholeRes.status]) {
                wholeRes = { status: seatStatus, guests: r.guests || t.seats.length };
              }
            } else if (r.seat) {
              const num = parseInt(r.seat.replace(/\D/g, ""));
              if (!isNaN(num)) {
                const priority = { reserved: 2, pending: 1, available: 0 };
                if (seatOverrides[num] === undefined || priority[seatStatus] > priority[seatOverrides[num]]) {
                  seatOverrides[num] = seatStatus;
                }
              }
            }
          }

          let newSeats;
          if (wholeRes) {
            let slotsLeft = wholeRes.status === "available" ? 0 : (wholeRes.guests || t.seats.length);
            newSeats = t.seats.map(s => {
              if (slotsLeft > 0) { slotsLeft--; return { ...s, status: wholeRes.status }; }
              return { ...s, status: "available" };
            });
          } else {
            newSeats = t.seats.map(s => ({ ...s, status: seatOverrides[s.num] ?? "available" }));
          }

          const newTableStatus =
            newSeats.every(s => s.status === "reserved") ? "reserved" :
            newSeats.some(s => s.status === "pending")   ? "pending"  :
            newSeats.some(s => s.status === "reserved")  ? "reserved" :
            "available";

          return { ...t, tableStatus: newTableStatus, seats: newSeats };
        });

        const payload = updated.length === 1 ? updated[0] : updated;

        // Always write — reservation list is source of truth for seat status.
        // (Previously this was guarded by a hasManualEdits check that was
        //  almost always true, silently preventing any sync from happening.)
        localStorage.setItem(key, JSON.stringify(payload));
        window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(payload) }));

        setSeatMapData(prev => ({
          ...prev,
          [wing]: {
            ...prev[wing],
            [room]: Array.isArray(payload) ? payload[0] : payload,
          },
        }));
      } catch (e) {
        console.error("[Dashboard] syncSeatMapFromReservations error:", e);
      }
    }
  };

  // Run full sync on mount
  useEffect(() => {
    if (reservations.length > 0) syncSeatMapFromReservations(reservations);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const findWingForRoom = (room) => {
    for (const [w, venues] of Object.entries(ROOM_CATEGORIES["All Venues"])) {
      for (const [venue, subVenues] of Object.entries(venues)) {
        if (venue === room || subVenues.includes(room)) return w;
      }
    }
    return null;
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  // 1. Calls the API to persist the status change in MySQL
  // 2. syncSeatToStorage → writes seat color red to localStorage → fires
  //    BroadcastChannel so the client SeatMap turns the seat red in real time
  const handleApprove = async (id) => {
    try {
      await reservationAPI.approve(id);

      // Update local reservation state first (syncSeatToStorage reads from it)
      setReservations(rs => rs.map(r => r.id === id ? { ...r, status: "reserved" } : r));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));

      // Write reserved (red) seat color to localStorage + broadcast
      syncSeatToStorage(id, "reserved");

      showToast("Reservation approved — status set to Reserved.", "#4CAF79");
    } catch (error) {
      console.error("Failed to approve reservation:", error);
      showToast("Failed to approve reservation", "#E05252");
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  // Mirrors handleApprove but frees the seat (turns it green / available)
  const handleReject = async (id) => {
    try {
      await reservationAPI.reject(id);

      setReservations(rs => rs.map(r => r.id === id ? { ...r, status: "rejected" } : r));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));

      // Write available (green) seat color to localStorage + broadcast
      syncSeatToStorage(id, "rejected");

      showToast("Reservation rejected — seat returned to Available.", "#E05252");
    } catch (error) {
      console.error("Failed to reject reservation:", error);
      showToast("Failed to reject reservation", "#E05252");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reservation? This cannot be undone.")) return;
    try {
      await reservationAPI.delete(id);
      const res = reservations.find(r => r.id === id);

      setReservations(rs => rs.filter(r => r.id !== id));
      setStats(prev => ({
        ...prev,
        total:    prev.total    - 1,
        pending:  res?.status === "pending"  ? prev.pending  - 1 : prev.pending,
        approved: res?.status === "reserved" ? prev.approved - 1 : prev.approved,
        rejected: res?.status === "rejected" ? prev.rejected - 1 : prev.rejected,
      }));

      // Free the seat when a reservation is deleted
      syncSeatToStorage(id, "rejected");

      showToast("Reservation deleted.", "#6C757D");
    } catch (error) {
      console.error("Failed to delete reservation:", error);
      showToast("Failed to delete reservation", "#E05252");
    }
  };

  // ── Seat Map helpers ──────────────────────────────────────────────────────
  const getRoomStatusCounts = (roomData) => {
    const seats = Array.isArray(roomData)
      ? roomData.flatMap(t => t.seats || [])
      : (roomData?.seats || []);
    return {
      available: seats.filter(s => s.status === "available").length,
      pending:   seats.filter(s => s.status === "pending").length,
      reserved:  seats.filter(s => s.status === "reserved").length,
    };
  };

  const handleSeatClick = (seat) => {
    const currentRoom = seatMapData[selectedWing]?.[selectedRoom];
    if (!currentRoom) return;
    const CYCLE = { available: "pending", pending: "reserved", reserved: "available" };

    const applyToTable = (t) => ({
      ...t,
      seats: t.seats.map(s =>
        s.id === seat.id ? { ...s, status: CYCLE[s.status] || "available" } : s
      ),
    });

    const updated = Array.isArray(currentRoom)
      ? currentRoom.map(applyToTable)
      : applyToTable(currentRoom);

    setSeatMapData(prev => ({ ...prev, [selectedWing]: { ...prev[selectedWing], [selectedRoom]: updated } }));
    showToast(`Seat ${seat.num} status updated`, "#C9A84C");
  };

  const handleTableClick = () => {
    const currentRoom = seatMapData[selectedWing]?.[selectedRoom];
    if (!currentRoom) return;
    const newStatus = currentRoom.tableStatus === "available" ? "reserved" : "available";
    const updated   = { ...currentRoom, tableStatus: newStatus };
    setSeatMapData(prev => ({ ...prev, [selectedWing]: { ...prev[selectedWing], [selectedRoom]: updated } }));
    showToast(`${selectedRoom} table updated to ${newStatus}`, "#C9A84C");
  };

  const handleSeatMapUpdate = (updatedRoomData) => {
    setSeatMapData(prev => ({ ...prev, [selectedWing]: { ...prev[selectedWing], [selectedRoom]: updatedRoomData } }));
    const saved = saveSeatMapData(selectedWing, selectedRoom, updatedRoomData);
    showToast(saved ? "Seat map saved" : "Error saving seat map", saved ? "#4CAF79" : "#E05252");
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const { pending, approved, rejected } = stats;

  const filtered = reservations.filter(r => {
    const statusMap = { "PENDING": "pending", "APPROVED": "reserved", "REJECTED": "rejected" };
    const mS = filterStatus === "ALL" || r.status === (statusMap[filterStatus] || filterStatus.toLowerCase());
    
    // Fix room filtering - check if room matches the filter
    let mR = true;
    if (filterWing !== "All Wings") {
      if (filterVenue === "All Venues") {
        // Just filter by wing - check if room belongs to this wing
        const wingVenues = ROOM_CATEGORIES["All Venues"][filterWing] || {};
        mR = Object.keys(wingVenues).includes(r.room);
      } else {
        // Filter by specific venue
        mR = r.room === filterVenue;
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

        {/* SIDEBAR */}
        <Sidebar
          activeNav={activeNav}
          onNavChange={setActiveNav}
          pending={pending}
          approved={approved}
          rejected={rejected}
        />

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", background: "#FFFFFF" }}>

          {/* ══════════════════════════════════════════════════════════════
              RESERVATIONS TAB
          ══════════════════════════════════════════════════════════════ */}
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
                  ["TOTAL RESERVATIONS",    stats.total,    "#D3AD53"],
                  ["PENDING RESERVATIONS",  stats.pending,  "#F49E0C"],
                  ["APPROVED RESERVATIONS", stats.approved, "#0FBA81"],
                  ["REJECTED RESERVATIONS", stats.rejected, "#F43F5F"],
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
                      {["REFERENCE", "GUEST", "VENUES/EVENTS", "EVENT DATE", "DATE SUBMITTED", "GUESTS", "TYPE", "STATUS", "ACTIONS"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 9, letterSpacing: 2, fontWeight: 700, color: "#6C757D", borderBottom: "1px solid #E1E4E8", background: "#FFFFFF" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={9} style={{ padding: "40px 0", textAlign: "center", fontSize: 13, color: "#6C757D" }}>No reservations match the current filters.</td></tr>
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
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#333", verticalAlign: "middle" }}>{r.eventDate}</td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          {r.submittedAt ? (
                            (() => {
                              const parts = r.submittedAt.split(" · ");
                              return (
                                <>
                                  <div style={{ fontSize: 12, color: "#333", fontWeight: 500 }}>{parts[0]}</div>
                                  {parts[1] && <div style={{ fontSize: 10, color: "#6C757D", marginTop: 2 }}>{parts[1]}</div>}
                                </>
                              );
                            })()
                          ) : (
                            <span style={{ fontSize: 11, color: "#CCC" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#333", textAlign: "center", verticalAlign: "middle" }}>{r.guests}</td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          <span style={{ background: r.type === "whole" ? "rgba(201,168,76,0.12)" : "rgba(100,160,255,0.12)", color: r.type === "whole" ? "#C9A84C" : "#6AA0FF", padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
                            {r.type === "whole" ? "TABLE" : "SEAT"}
                          </span>
                          <div style={{ fontSize: 10, color: "#6C757D", marginTop: 4, fontWeight: 500 }}>
                            Table: {r.table || "—"}
                            {r.seat && ` · Seat: ${r.seat}`}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          {(() => {
                            const cfg = {
                              pending:   { bg: "rgba(244,158,12,0.12)",  color: "#F49E0C", label: "Pending"   },
                              reserved:  { bg: "rgba(15,186,129,0.12)",  color: "#0FBA81", label: "Approved"  },
                              rejected:  { bg: "rgba(244,63,95,0.12)",   color: "#F43F5F", label: "Rejected"  },
                              available: { bg: "rgba(100,116,139,0.12)", color: "#64748B", label: "Available" },
                            }[r.status] || { bg: "#f0f0f0", color: "#888", label: r.status };
                            return (
                              <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                                {cfg.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                          <button onClick={() => setViewRes(r)} style={{ padding: "5px 12px", border: "1px solid #E1E4E8", background: "transparent", color: "#6C757D", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>VIEW</button>
                          {r.status === "pending" && (
                            <>
                              <button onClick={() => handleApprove(r.id)} style={{ padding: "5px 12px", border: "1px solid #4CAF79", background: "transparent", color: "#4CAF79", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>✓</button>
                              <button onClick={() => handleReject(r.id)}  style={{ padding: "5px 12px", border: "1px solid #E05252", background: "transparent", color: "#E05252", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>✕</button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(r.id)}
                            title="Delete reservation"
                            style={{ padding: "5px 10px", border: "1px solid #E1E4E8", background: "transparent", color: "#B0B7C3", borderRadius: 4, fontSize: 11, cursor: "pointer", lineHeight: 1, transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#E05252"; e.currentTarget.style.color = "#E05252"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E1E4E8"; e.currentTarget.style.color = "#B0B7C3"; }}
                          >🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SEAT MAP TAB
          ══════════════════════════════════════════════════════════════ */}
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

      {/* Detail modal */}
      {viewRes && (
        <DetailModal
          res={{
            ...viewRes,
            seat: viewRes.type === "whole"
              ? `${viewRes.guests}${viewRes.tableCapacity ? ` / ${viewRes.tableCapacity}` : ""} seats reserved`
              : (viewRes.seat || "—"),
            typeLabel: viewRes.type === "whole"
              ? `Partial Table (${viewRes.guests} guest${viewRes.guests !== 1 ? "s" : ""})`
              : "Individual Seat",
          }}
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