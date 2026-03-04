// src/utils/seatMapPersistence.js
//
// Shared persistence layer between SeatMap (admin edit) and AlabangReserve (client view).
// Uses localStorage for persistence across page reloads, and a BroadcastChannel
// (with storage event fallback) so the client page updates live when admin saves.

const STORAGE_PREFIX = "seatmap";
const CHANNEL_NAME   = "seatmap_updates";

// ─── Build a storage key ───────────────────────────────────────────────────────
function buildKey(wing, room) {
  return `${STORAGE_PREFIX}:${wing}:${room}`;
}

// ─── Save room data (called from admin / SeatMap editMode) ────────────────────
export function saveRoomData(wing, room, tableData) {
  const key = buildKey(wing, room);
  const payload = JSON.stringify(tableData);

  try {
    localStorage.setItem(key, payload);
  } catch (e) {
    console.warn("[seatMapPersistence] localStorage write failed:", e);
  }

  // Broadcast to other tabs / windows
  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage({ wing, room, data: tableData });
    bc.close();
  } catch {
    // BroadcastChannel not supported — fall back to storage event (cross-tab only)
    // The storage event fires automatically when localStorage changes in another tab.
  }
}

// ─── Load room data (called on mount, falls back to defaultData) ───────────────
export function getRoomData(wing, room, defaultData) {
  const key = buildKey(wing, room);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.warn("[seatMapPersistence] localStorage read failed:", e);
  }
  return defaultData;
}

// ─── Load room data (legacy function for compatibility) ───────────────
export function loadSeatMapData(wing, room, defaultData) {
  return getRoomData(wing, room, defaultData);
}

// ─── Subscribe to live changes ─────────────────────────────────────────────────
// callback: ({ wing, room, data }) => void
// Returns an unsubscribe function.
export function subscribeToSeatMapChanges(callback) {
  const listeners = [];

  // 1. BroadcastChannel (same-origin, cross-tab)
  let bc = null;
  try {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (e) => {
      if (e.data?.wing && e.data?.room && e.data?.data) {
        callback(e.data);
      }
    };
  } catch {
    bc = null;
  }

  // 2. storage event fallback (fires in OTHER tabs when localStorage changes)
  const onStorage = (e) => {
    if (!e.key?.startsWith(STORAGE_PREFIX + ":")) return;
    try {
      const parts = e.key.split(":");
      const wing  = parts[1];
      const room  = parts.slice(2).join(":");
      const data  = JSON.parse(e.newValue);
      callback({ wing, room, data });
    } catch {}
  };
  window.addEventListener("storage", onStorage);

  // 3. Custom DOM event for same-tab updates (admin panel inside same React app)
  const onCustom = (e) => {
    const { wing, room, data } = e.detail || {};
    if (wing && room && data) callback({ wing, room, data });
  };
  window.addEventListener("seatmap:update", onCustom);

  return () => {
    bc?.close();
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("seatmap:update", onCustom);
  };
}

// ─── Dispatch same-tab event (call this after saveRoomData for same-tab sync) ──
export function dispatchSeatMapUpdate(wing, room, data) {
  saveRoomData(wing, room, data);
  window.dispatchEvent(new CustomEvent("seatmap:update", { detail: { wing, room, data } }));
}