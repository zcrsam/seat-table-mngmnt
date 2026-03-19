// src/features/admin/pages/Dashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { reservationAPI } from "../../../services/reservationAPI";
import Echo from 'laravel-echo';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const POLL_MS  = 3_000; // refresh every 3 seconds

const directAPI = {
  approve: (id) => fetch(`${API_BASE}/reservations/${id}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  }).then(async r => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.message || `HTTP ${r.status}`);
    return data;
  }),
  reject: (id) => fetch(`${API_BASE}/reservations/${id}/reject`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  }).then(async r => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.message || `HTTP ${r.status}`);
    return data;
  }),
  delete: (id) => fetch(`${API_BASE}/reservations/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  }).then(async r => {
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      throw new Error(data?.message || `HTTP ${r.status}`);
    }
    return true;
  }),
};

function getNumericId(res) {
  const raw = res?.db_id ?? res?.numeric_id ?? res?.reservation_id;
  const n = Number(raw);
  if (!isNaN(n) && n > 0 && Number.isInteger(n)) return n;
  throw new Error(
    `No numeric DB id on reservation — db_id="${res?.db_id}" id="${res?.id}". ` +
    `Check that the API returns a numeric "id" or "reference_code" field.`
  );
}

async function callAPI(method, numericId) {
  try {
    if (typeof reservationAPI[method] === "function") {
      return await reservationAPI[method](numericId);
    }
  } catch (err) {
    if (!err.message?.includes("not a function")) throw err;
  }
  return await directAPI[method](numericId);
}

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

function parseEventDate(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? Infinity : d.getTime();
}
function sortReservations(a, b) {
  const evA = parseEventDate(a.eventDate);
  const evB = parseEventDate(b.eventDate);
  if (evA !== evB) return evA - evB;
  return (a.submittedTimestamp || 0) - (b.submittedTimestamp || 0);
}

const RESERVATIONS_KEY = "bellevue_reservations";

// ── Shared fetch helper — normalises raw API rows ──────────────────────────
function normaliseRow(r) {
  return {
    ...r,
    db_id: Number(r.db_id ?? r.id),
    id:    r.reference_code ?? String(r.id),
  };
}

function Dashboard({ onLogout }) {
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
  const [wsConnected,    setWsConnected]    = useState(false);

  const echoRef    = useRef(null);
  const pollRef    = useRef(null);
  const isFetching = useRef(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    lastPage: 1,
  });

  // ── Ref always holds the latest page/perPage — no stale closure possible ──
  const paginationRef = useRef({ currentPage: 1, perPage: 10 });

  // Keep ref in sync whenever state changes
  useEffect(() => {
    paginationRef.current = {
      currentPage: pagination.currentPage,
      perPage:     pagination.perPage,
    };
  }, [pagination.currentPage, pagination.perPage]);

  // fetchData reads from the ref so it ALWAYS gets the latest values
  const fetchData = useCallback(async (page, perPage, isInit = false) => {
    // Fall back to ref values if caller doesn't pass explicit args
    const p  = page    ?? paginationRef.current.currentPage;
    const pp = perPage ?? paginationRef.current.perPage;

    if (isFetching.current) return;
    isFetching.current = true;
    try {
      if (isInit) setLoading(true);
      console.log(`[Dashboard] fetchData page=${p} perPage=${pp}`);
      const [reservationsResponse, statsData] = await Promise.all([
        reservationAPI.getAll(`?page=${p}&per_page=${pp}`),
        reservationAPI.getStats(),
      ]);
      const raw = reservationsResponse.data || [];
      if (isInit && raw.length > 0) console.log("[Dashboard] Raw reservation fields:", Object.keys(raw[0]), raw[0]);
      const reservationsData = raw.map(normaliseRow);
      setReservations(reservationsData);
      setStats(statsData);

      if (reservationsResponse.pagination) {
        const newPag = {
          currentPage: reservationsResponse.pagination.current_page,
          perPage:     reservationsResponse.pagination.per_page ?? pp,
          lastPage:    reservationsResponse.pagination.last_page,
        };
        setPagination(newPag);
        paginationRef.current = { currentPage: newPag.currentPage, perPage: newPag.perPage };
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      if (isInit) showToast("Failed to load data", "#E05252");
    } finally {
      if (isInit) setLoading(false);
      isFetching.current = false;
    }
  }, []);

  const handlePageChange = (newPage) => {
    // Update ref immediately so fetchData reads the right page
    paginationRef.current = { ...paginationRef.current, currentPage: newPage };
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchData(newPage, paginationRef.current.perPage);
  };

  const handlePerPageChange = (newPerPage) => {
    paginationRef.current = { currentPage: 1, perPage: newPerPage };
    setPagination(prev => ({ ...prev, perPage: newPerPage, currentPage: 1 }));
    fetchData(1, newPerPage);
  };

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData(1, 10, true);
  }, [fetchData]);

  // ── Polling every POLL_MS ─────────────────────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchData(paginationRef.current.currentPage, paginationRef.current.perPage);
    }, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchData]);

  // ── WebSocket Setup ───────────────────────────────────────────────────────
  useEffect(() => {
    const pusherKey     = import.meta.env.VITE_PUSHER_APP_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

    if (!echoRef.current && pusherKey && pusherKey !== 'your_key') {
      try {
        echoRef.current = new Echo({
          broadcaster:       'pusher',
          key:               pusherKey,
          cluster:           pusherCluster,
          forceTLS:          true,
          enabledTransports: ['ws', 'wss'],
        });
      } catch (error) {
        console.log('WebSocket initialization failed:', error);
        return;
      }
    }

    const echo = echoRef.current;
    if (!echo) return;

    try {
      const channel = echo.channel('reservations');

      const handleAny = (label) => (e) => {
        console.log(`[Dashboard WS] ${label}`, e);
        setPagination(prev => { fetchData(paginationRef.current.currentPage, paginationRef.current.perPage); return prev; });
        if (label === 'ReservationCreated')  showToast('New reservation received!',   '#10B981');
        if (label === 'ReservationUpdated') {
          const st = e?.reservation?.status?.toLowerCase();
          if (st === 'approved' || st === 'reserved') showToast('Reservation approved!', '#10B981');
          else if (st === 'rejected')                 showToast('Reservation rejected',  '#EF4444');
        }
        if (label === 'ReservationDeleted')  showToast('Reservation cancelled',        '#F59E0B');
        if (label === 'SeatReserved')        showToast(`Seat ${e?.seat_number} reserved!`, '#3B82F6');
        if (label === 'TableReserved')       showToast(`Table ${e?.table_number} reserved!`, '#3B82F6');
      };

      channel.listen('ReservationCreated', handleAny('ReservationCreated'));
      channel.listen('ReservationUpdated', handleAny('ReservationUpdated'));
      channel.listen('ReservationDeleted', handleAny('ReservationDeleted'));
      channel.listen('SeatReserved',       handleAny('SeatReserved'));
      channel.listen('TableReserved',      handleAny('TableReserved'));

      echo.connector.pusher.connection.bind('connected',    () => { console.log('Dashboard WS connected');    setWsConnected(true);  });
      echo.connector.pusher.connection.bind('disconnected', () => { console.log('Dashboard WS disconnected'); setWsConnected(false); });
      echo.connector.pusher.connection.bind('error',        () => {                                            setWsConnected(false); });

      return () => {
        try {
          channel.stopListening('ReservationCreated');
          channel.stopListening('ReservationUpdated');
          channel.stopListening('ReservationDeleted');
          channel.stopListening('SeatReserved');
          channel.stopListening('TableReserved');
        } catch (e) { console.log('Error cleaning up WS listeners:', e); }
      };
    } catch (error) {
      console.log('WebSocket channel setup failed:', error);
    }
  }, [fetchData]);

  // ── Seat Map state ────────────────────────────────────────────────────────
  const [selectedWing, setSelectedWing] = useState("Main Wing");
  const [selectedRoom, setSelectedRoom] = useState("Alabang Function Room");
  const [seatMapData,  setSeatMapData]  = useState(() => {
    const savedData = loadSeatMapData();
    return {
      "Main Wing":  { ...SEAT_MAP_DATA["Main Wing"],  ...(savedData?.["Main Wing"]  || {}) },
      "Tower Wing": { ...SEAT_MAP_DATA["Tower Wing"], ...(savedData?.["Tower Wing"] || {}) },
      "Dining":     { ...SEAT_MAP_DATA["Dining"],     ...(savedData?.["Dining"]     || {}) },
    };
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSeatMapChanges(({ wing, room, data }) => {
      setSeatMapData(prev => ({ ...prev, [wing]: { ...prev[wing], [room]: data } }));
    });
    return unsub;
  }, []);

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

  useEffect(() => { localStorage.setItem("admin_active_nav", activeNav); }, [activeNav]);

  const findWingForRoom = (room) => {
    for (const [w, venues] of Object.entries(ROOM_CATEGORIES["All Venues"])) {
      for (const [venue, subVenues] of Object.entries(venues)) {
        if (venue === room || subVenues.includes(room)) return w;
      }
    }
    return null;
  };

  const syncSeatToStorage = (res, newStatus) => {
    if (!res) return;
    const wing = findWingForRoom(res.room);
    if (!wing) return;
    const key = `seatmap:${wing}:${res.room}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const tables = Array.isArray(parsed) ? parsed : [parsed];
      const seatStatus = newStatus === "reserved" ? "reserved" : newStatus === "rejected" ? "available" : "pending";
      const updated = tables.map(t => {
        if (res.table && String(t.id) !== String(res.table)) return t;
        let newSeats;
        if (res.type === "whole") {
          if (seatStatus === "available") {
            newSeats = t.seats.map(s => (s.status === "pending" || s.status === "reserved") ? { ...s, status: "available" } : s);
          } else {
            let slotsLeft = parseInt(res.guests) || t.seats.length;
            newSeats = t.seats.map(s => {
              if (slotsLeft > 0 && (s.status === "pending" || s.status === "available")) { slotsLeft--; return { ...s, status: seatStatus }; }
              return s;
            });
          }
        } else {
          const seatNum = parseInt(String(res.seat || "").replace(/\D/g, ""));
          newSeats = isNaN(seatNum) ? t.seats : t.seats.map(s => s.num === seatNum ? { ...s, status: seatStatus } : s);
        }
        return { ...t, seats: newSeats };
      });
      const payload = updated.length === 1 ? updated[0] : updated;
      setSeatMapData(prev => ({ ...prev, [wing]: { ...prev[wing], [res.room]: Array.isArray(payload) ? payload[0] : payload } }));
      dispatchSeatMapUpdate(wing, res.room, payload);
    } catch (e) { console.error("[Dashboard] syncSeatToStorage failed:", e); }
  };

  const syncSeatMapFromReservations = (resList) => {
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
            if (r.table) {
              const rTable = String(r.table).replace(/^T/i, "");
              const tTable = String(t.id).replace(/^T/i, "");
              if (rTable !== tTable) continue;
            }
            const seatStatus = r.status === "pending" ? "pending" : r.status === "reserved" ? "reserved" : "available";
            if (r.type === "whole") {
              const priority = { reserved: 2, pending: 1, available: 0 };
              if (!wholeRes || priority[seatStatus] >= priority[wholeRes.status]) {
                wholeRes = { status: seatStatus, guests: parseInt(r.guests) || t.seats.length };
              }
            } else if (r.seat) {
              const num = parseInt(String(r.seat).replace(/\D/g, ""));
              if (!isNaN(num)) {
                const priority = { reserved: 2, pending: 1, available: 0 };
                if (seatOverrides[num] === undefined || priority[seatStatus] > priority[seatOverrides[num]]) {
                  seatOverrides[num] = seatStatus;
                }
              }
            }
          }
          let newSeats;
          if (wholeRes && wholeRes.status !== "available") {
            let slotsLeft = wholeRes.guests || t.seats.length;
            newSeats = t.seats.map(s => {
              if (slotsLeft > 0 && (s.status === "pending" || s.status === "available")) { slotsLeft--; return { ...s, status: wholeRes.status }; }
              return s;
            });
          } else if (wholeRes && wholeRes.status === "available") {
            newSeats = t.seats.map(s => ({ ...s, status: "available" }));
          } else {
            newSeats = t.seats.map(s => ({ ...s, status: seatOverrides[s.num] !== undefined ? seatOverrides[s.num] : s.status }));
          }
          const newTableStatus =
            newSeats.every(s => s.status === "reserved") ? "reserved" :
            newSeats.some(s => s.status === "pending")   ? "pending"  :
            newSeats.some(s => s.status === "reserved")  ? "reserved" : "available";
          return { ...t, tableStatus: newTableStatus, seats: newSeats };
        });
        const payload = Array.isArray(parsed) ? updated : updated[0];
        localStorage.setItem(key, JSON.stringify(payload));
        window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(payload) }));
        setSeatMapData(prev => ({ ...prev, [wing]: { ...prev[wing], [room]: payload } }));
      } catch (e) { console.error("[Dashboard] syncSeatMapFromReservations error:", e); }
    }
  };

  const hasSyncedRef = React.useRef(false);
  useEffect(() => {
    if (reservations.length > 0 && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      syncSeatMapFromReservations(reservations);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations]);

  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id) => {
    const res = reservations.find(r => r.id === id);
    if (!res) { showToast("Reservation not found", "#E05252"); return; }
    let numericId;
    try { numericId = getNumericId(res); } catch (e) { showToast(`Cannot approve: ${e.message}`, "#E05252"); return; }
    try { await callAPI("approve", numericId); } catch (error) {
      showToast(`Failed to approve: ${error?.response?.data?.message || error?.message || "Unknown error"}`, "#E05252"); return;
    }
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: "reserved" } : r));
    setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - (res.status === "pending" ? 1 : 0)), approved: prev.approved + 1 }));
    syncSeatToStorage(res, "reserved");
    showToast("Reservation approved — seats reserved (red).", "#4CAF79");
  };

  const handleReject = async (id) => {
    const res = reservations.find(r => r.id === id);
    if (!res) { showToast("Reservation not found", "#E05252"); return; }
    let numericId;
    try { numericId = getNumericId(res); } catch (e) { showToast(`Cannot reject: ${e.message}`, "#E05252"); return; }
    try { await callAPI("reject", numericId); } catch (error) {
      showToast(`Failed to reject: ${error?.response?.data?.message || error?.message || "Unknown error"}`, "#E05252"); return;
    }
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: "rejected" } : r));
    setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - (res.status === "pending" ? 1 : 0)), rejected: prev.rejected + 1 }));
    syncSeatToStorage(res, "rejected");
    showToast("Reservation rejected — seats freed (green).", "#E05252");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reservation? This cannot be undone.")) return;
    const res = reservations.find(r => r.id === id);
    let numericId;
    try { numericId = getNumericId(res); } catch (e) { showToast(`Cannot delete: ${e.message}`, "#E05252"); return; }
    try { await callAPI("delete", numericId); } catch (error) {
      showToast(`Failed to delete: ${error?.response?.data?.message || error?.message || "Unknown error"}`, "#E05252"); return;
    }
    setReservations(rs => rs.filter(r => r.id !== id));
    setStats(prev => ({
      ...prev,
      total:    Math.max(0, prev.total - 1),
      pending:  res?.status === "pending"  ? Math.max(0, prev.pending  - 1) : prev.pending,
      approved: res?.status === "reserved" ? Math.max(0, prev.approved - 1) : prev.approved,
      rejected: res?.status === "rejected" ? Math.max(0, prev.rejected - 1) : prev.rejected,
    }));
    if (res) syncSeatToStorage(res, "rejected");
    showToast("Reservation deleted.", "#6C757D");
  };

  const getRoomStatusCounts = (roomData) => {
    const seats = Array.isArray(roomData) ? roomData.flatMap(t => t.seats || []) : (roomData?.seats || []);
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
    const applyToTable = (t) => ({ ...t, seats: t.seats.map(s => s.id === seat.id ? { ...s, status: CYCLE[s.status] || "available" } : s) });
    const updated = Array.isArray(currentRoom) ? currentRoom.map(applyToTable) : applyToTable(currentRoom);
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

  const { pending, approved, rejected } = stats;

  const filtered = reservations.filter(r => {
    const statusMap = { "PENDING": "pending", "APPROVED": "reserved", "REJECTED": "rejected" };
    const mS = filterStatus === "ALL" || r.status === (statusMap[filterStatus] || filterStatus.toLowerCase());
    let mR = true;
    if (filterWing !== "All Wings" && filterVenue !== "All Venues") {
      const wingVenues = ROOM_CATEGORIES["All Venues"][filterWing];
      if (wingVenues?.[filterVenue]) {
        const subVenues = wingVenues[filterVenue];
        mR = subVenues.length === 0 ? r.room === filterVenue : subVenues.includes(r.room);
        if (subVenues.length > 0 && filterSubVenue !== "All Venues") mR = r.room === filterSubVenue;
      }
    }
    const mQ = !search
      || String(r.name  || "").toLowerCase().includes(search.toLowerCase())
      || String(r.id    || "").toLowerCase().includes(search.toLowerCase())
      || String(r.db_id || "").includes(search);
    return mS && mR && mQ;
  });

  const currentWingData = seatMapData[selectedWing] || {};
  const currentRoomData = currentWingData[selectedRoom] || { seats: [], tableStatus: "available" };

  // ── Pagination page number helpers ────────────────────────────────────────
  const getPageNumbers = () => {
    const total = pagination.lastPage;
    const current = pagination.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif", background: "#FFFFFF", minHeight: "100vh", color: "#333333" }}>
      <AdminNavbar onLogout={onLogout}/>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} pending={pending} approved={approved} rejected={rejected}/>

        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", background: "#FFFFFF" }}>

          {/* ═══════ RESERVATIONS TAB ═══════ */}
          {activeNav === "reservations" && (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>ADMIN · RESERVATION MANAGEMENT</div>
                    <div style={{ fontSize: 24, color: "#333333", fontWeight: "bold" }}>Reservation Dashboard</div>
                  </div>
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
                  <div key={lbl}
                    onClick={() => {
                      if (lbl.includes("TOTAL"))    setFilterStatus("ALL");
                      else if (lbl.includes("PENDING"))  setFilterStatus("PENDING");
                      else if (lbl.includes("APPROVED")) setFilterStatus("APPROVED");
                      else if (lbl.includes("REJECTED")) setFilterStatus("REJECTED");
                    }}
                    style={{ background: lbl.includes("TOTAL") ? "rgba(211,173,83,0.4)" : lbl.includes("PENDING") ? "rgba(255,173,34,0.5)" : lbl.includes("APPROVED") ? "rgba(15,186,129,0.4)" : "rgba(244,63,95,0.4)", border: `1px solid ${acc}`, borderRadius: 8, padding: "20px 22px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", transition: "all 0.2s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.filter = "brightness(0.9)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.filter = "brightness(1)"; }}>
                    <div style={{ fontSize: 45, fontWeight: 600, color: acc, lineHeight: 1, marginBottom: 12 }}>{num}</div>
                    <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 12 }}>EVENTS/VENUES</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ background: "#fff", border: "1px solid #E1E4E8", borderRadius: 12, padding: 16, minWidth: 200, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["All Wings", "Main Wing", "Tower Wing", "Dining"].map(wing => (
                        <button key={wing} onClick={() => { setFilterWing(wing); setFilterVenue("All Venues"); setFilterSubVenue("All Venues"); }}
                          style={{ padding: "6px 12px", border: filterWing === wing ? "1px solid #C9A84C" : "1px solid #E5E7EB", borderRadius: 8, background: filterWing === wing ? "rgba(201,168,76,0.1)" : "#fff", color: filterWing === wing ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: filterWing === wing ? 600 : 400, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                          {wing}
                        </button>
                      ))}
                    </div>
                  </div>
                  {filterWing !== "All Wings" && (
                    <div style={{ background: "#fff", border: "1px solid #E1E4E8", borderRadius: 12, padding: 16, minWidth: 250, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: 8, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>VENUE</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Object.keys(ROOM_CATEGORIES["All Venues"][filterWing] || {}).map(venue => (
                          <button key={venue} onClick={() => { setFilterVenue(venue); setFilterSubVenue("All Venues"); }}
                            style={{ padding: "6px 12px", border: filterVenue === venue ? "1px solid #C9A84C" : "1px solid #E5E7EB", borderRadius: 8, background: filterVenue === venue ? "rgba(201,168,76,0.1)" : "#fff", color: filterVenue === venue ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: filterVenue === venue ? 600 : 400, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                            {venue}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {filterWing !== "All Wings" && filterVenue !== "All Venues" && ROOM_CATEGORIES["All Venues"][filterWing]?.[filterVenue]?.length > 0 && (
                    <div style={{ background: "#fff", border: "1px solid #E1E4E8", borderRadius: 12, padding: 16, minWidth: 200, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: 8, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>SUB-VENUE</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {ROOM_CATEGORIES["All Venues"][filterWing][filterVenue].map(subVenue => (
                          <button key={subVenue} onClick={() => setFilterSubVenue(subVenue)}
                            style={{ padding: "6px 12px", border: filterSubVenue === subVenue ? "1px solid #C9A84C" : "1px solid #E5E7EB", borderRadius: 8, background: filterSubVenue === subVenue ? "rgba(201,168,76,0.1)" : "#fff", color: filterSubVenue === subVenue ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: filterSubVenue === subVenue ? 600 : 400, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                            {subVenue}
                          </button>
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
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}><div style={{ color: "#333", fontSize: 12 }}>{r.room}</div></td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#333", verticalAlign: "middle" }}>
                          <div style={{ color: "#333", fontWeight: 500 }}>{r.eventDate}</div>
                          <div style={{ color: "#6C757D", fontSize: 10, marginTop: 2 }}>
                            {r.eventTime ? (() => {
                              const [hours, minutes] = r.eventTime.split(':');
                              const hour24 = parseInt(hours) || 0;
                              const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                              const period = hour24 < 12 ? 'am' : 'pm';
                              return `${hour12}:${minutes || '00'}${period}`;
                            })() : 'All day'}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          {r.submittedTimestamp ? (() => {
                            const date = new Date(r.submittedTimestamp * 1000);
                            return (
                              <>
                                <div style={{ fontSize: 12, color: "#333", fontWeight: 500 }}>
                                  {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Manila' })}
                                </div>
                                <div style={{ fontSize: 10, color: "#6C757D", marginTop: 2 }}>
                                  {(() => {
                                    const hours = date.getHours();
                                    const minutes = date.getMinutes();
                                    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                                    const period = hours < 12 ? 'am' : 'pm';
                                    return `${hour12}:${minutes.toString().padStart(2, '0')}${period}`;
                                  })()}
                                </div>
                              </>
                            );
                          })() : r.submittedAt ? (() => {
                            const parts = r.submittedAt.split(" · ");
                            return (<><div style={{ fontSize: 12, color: "#333", fontWeight: 500 }}>{parts[0]}</div>{parts[1] && <div style={{ fontSize: 10, color: "#6C757D", marginTop: 2 }}>{parts[1]}</div>}</>);
                          })() : <span style={{ fontSize: 11, color: "#CCC" }}>—</span>}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#333", textAlign: "center", verticalAlign: "middle" }}>{r.guests}</td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                          <span style={{ background: r.type === "whole" ? "rgba(201,168,76,0.12)" : "rgba(100,160,255,0.12)", color: r.type === "whole" ? "#C9A84C" : "#6AA0FF", padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
                            {r.type === "whole" ? "TABLE" : "SEAT"}
                          </span>
                          <div style={{ fontSize: 10, color: "#6C757D", marginTop: 4, fontWeight: 500 }}>
                            Table: {r.table || "—"}{r.seat && ` · Seat: ${r.seat}`}
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
                            return <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{cfg.label}</span>;
                          })()}
                        </td>
                        <td style={{ padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                          <button onClick={() => setViewRes(r)} style={{ padding: "5px 12px", border: "1px solid #E1E4E8", background: "transparent", color: "#6C757D", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>VIEW</button>
                          {r.status !== "reserved" && (
                            <button onClick={() => handleApprove(r.id)} style={{ padding: "5px 12px", border: "1px solid #4CAF79", background: "transparent", color: "#4CAF79", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>✓ Approve</button>
                          )}
                          {r.status !== "rejected" && (
                            <button onClick={() => handleReject(r.id)} style={{ padding: "5px 12px", border: "1px solid #E05252", background: "transparent", color: "#E05252", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer", marginRight: 6 }}>✕ Reject</button>
                          )}
                          <button onClick={() => handleDelete(r.id)}
                            style={{ padding: "5px 10px", border: "1px solid #E1E4E8", background: "transparent", color: "#B0B7C3", borderRadius: 4, fontSize: 11, cursor: "pointer", lineHeight: 1, transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#E05252"; e.currentTarget.style.color = "#E05252"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E1E4E8"; e.currentTarget.style.color = "#B0B7C3"; }}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination Controls (redesigned) ── */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 16,
                padding: "14px 20px",
                background: "#fff",
                borderRadius: 10,
                border: "1px solid #E1E4E8",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                {/* Left: page info + per-page */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 11, color: "#6C757D", fontWeight: 500, letterSpacing: 0.3 }}>
                    Page <strong style={{ color: "#333" }}>{pagination.currentPage}</strong> of <strong style={{ color: "#333" }}>{pagination.lastPage}</strong>
                  </span>

                  <div style={{ width: 1, height: 16, background: "#E1E4E8" }} />

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#6C757D" }}>Rows:</span>
                    <select
                      value={pagination.perPage}
                      onChange={e => handlePerPageChange(Number(e.target.value))}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #E1E4E8",
                        borderRadius: 6,
                        fontSize: 11,
                        color: "#333",
                        fontFamily: "Montserrat, sans-serif",
                        background: "#F8F9FA",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                {/* Right: page number buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {/* Prev arrow */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    style={{
                      width: 32, height: 32,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid #E1E4E8",
                      borderRadius: 6,
                      background: pagination.currentPage <= 1 ? "#F8F9FA" : "#fff",
                      color: pagination.currentPage <= 1 ? "#C0C7D0" : "#333",
                      cursor: pagination.currentPage <= 1 ? "not-allowed" : "pointer",
                      fontSize: 14,
                      transition: "all 0.15s",
                      fontFamily: "Montserrat, sans-serif",
                    }}
                    onMouseEnter={e => { if (pagination.currentPage > 1) { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E1E4E8"; e.currentTarget.style.color = pagination.currentPage <= 1 ? "#C0C7D0" : "#333"; }}
                  >
                    ‹
                  </button>

                  {/* Page number pills */}
                  {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9CA3AF" }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        style={{
                          width: 32, height: 32,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: pagination.currentPage === p ? "1px solid #C9A84C" : "1px solid #E1E4E8",
                          borderRadius: 6,
                          background: pagination.currentPage === p ? "#C9A84C" : "#fff",
                          color: pagination.currentPage === p ? "#fff" : "#374151",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: pagination.currentPage === p ? 700 : 400,
                          fontFamily: "Montserrat, sans-serif",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { if (pagination.currentPage !== p) { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }}}
                        onMouseLeave={e => { if (pagination.currentPage !== p) { e.currentTarget.style.borderColor = "#E1E4E8"; e.currentTarget.style.color = "#374151"; }}}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next arrow */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.lastPage}
                    style={{
                      width: 32, height: 32,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid #E1E4E8",
                      borderRadius: 6,
                      background: pagination.currentPage >= pagination.lastPage ? "#F8F9FA" : "#fff",
                      color: pagination.currentPage >= pagination.lastPage ? "#C0C7D0" : "#333",
                      cursor: pagination.currentPage >= pagination.lastPage ? "not-allowed" : "pointer",
                      fontSize: 14,
                      transition: "all 0.15s",
                      fontFamily: "Montserrat, sans-serif",
                    }}
                    onMouseEnter={e => { if (pagination.currentPage < pagination.lastPage) { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E1E4E8"; e.currentTarget.style.color = pagination.currentPage >= pagination.lastPage ? "#C0C7D0" : "#333"; }}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ═══════ SEAT MAP TAB ═══════ */}
          {activeNav === "seat-map" && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>ADMIN · SEAT MAP</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 24, color: "#333333", fontWeight: "bold" }}>Live Seat Map</div>
                <button onClick={() => setEditMode(!editMode)}
                  style={{ padding: "8px 16px", background: editMode ? "#C9A84C" : "transparent", color: editMode ? "#fff" : "#C9A84C", border: "1px solid #C9A84C", borderRadius: 6, cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
                  {editMode ? "✓ Editing" : "✏️ Edit Layout"}
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {Object.keys(seatMapData).map(wing => (
                  <button key={wing} onClick={() => { setSelectedWing(wing); setSelectedRoom(Object.keys(seatMapData[wing])[0]); }}
                    style={{ padding: "8px 16px", border: selectedWing === wing ? "1px solid #C9A84C" : "1px solid #E1E4E8", borderRadius: 8, background: selectedWing === wing ? "rgba(201,168,76,0.1)" : "#fff", color: selectedWing === wing ? "#C9A84C" : "#374151", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: selectedWing === wing ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
                    {wing}
                  </button>
                ))}
              </div>
              {(() => {
                const counts = getRoomStatusCounts(currentRoomData);
                return (
                  <div style={{ display: "flex", gap: 24, marginBottom: 24, padding: "12px 16px", background: "#F8F9FA", borderRadius: 8, border: "1px solid #E1E4E8" }}>
                    {[["available", counts.available], ["pending", counts.pending], ["reserved", counts.reserved]].map(([key, count]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: STATUS_COLORS[key] }}/>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#374151", textTransform: "capitalize" }}>{key}: {count}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ minWidth: 200, flexShrink: 0 }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, letterSpacing: 1.5, color: "#6B7280", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>Rooms in {selectedWing}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.keys(currentWingData).map(room => {
                      const counts = getRoomStatusCounts(currentWingData[room]);
                      const isSel  = selectedRoom === room;
                      return (
                        <div key={room} onClick={() => setSelectedRoom(room)}
                          style={{ padding: "12px 16px", border: isSel ? "1px solid #C9A84C" : "1px solid #E1E4E8", borderRadius: 8, background: isSel ? "rgba(201,168,76,0.1)" : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
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
                <div style={{ flex: 1, minWidth: 400 }}>
                  <div style={{ background: "#EFEAD9", borderRadius: 12, padding: 24, border: "1px solid #D4C5A0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#333", fontWeight: 600, marginBottom: 16, textAlign: "center" }}>{selectedRoom}</div>
                    <SeatMap tableData={currentRoomData} mode="individual" selectedSeat={null}
                      onSeatClick={handleSeatClick} onTableClick={handleTableClick}
                      windowWidth={800} editMode={editMode} onUpdate={handleSeatMapUpdate}
                      wing={selectedWing} room={selectedRoom}/>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {viewRes && (
        <DetailModal
          res={{ ...viewRes, seat: viewRes.type === "whole" ? `${viewRes.guests}${viewRes.tableCapacity ? ` / ${viewRes.tableCapacity}` : ""} seats reserved` : (viewRes.seat || "—"), typeLabel: viewRes.type === "whole" ? `Partial Table (${viewRes.guests} guest${viewRes.guests !== 1 ? "s" : ""})` : "Individual Seat" }}
          onClose={() => setViewRes(null)}
          onApprove={id => { handleApprove(id); setViewRes(null); }}
          onReject={id  => { handleReject(id);  setViewRes(null); }}
        />
      )}

      {toast && <Toast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)}/>}
    </div>
  );
}

export default Dashboard;