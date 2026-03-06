// src/utils/seatMapPersistence.js
// Shared persistence layer between admin SeatMap (editMode) and client AlabangReserve.
// Uses localStorage for persistence + BroadcastChannel/custom events for live sync.

const STORAGE_PREFIX = "seatmap";
const CHANNEL_NAME   = "seatmap_updates";
const LEGACY_KEY     = "seatMapData";

function buildKey(wing, room) {
  return `${STORAGE_PREFIX}:${wing}:${room}`;
}

// ─── Per-room save ────────────────────────────────────────────────────────────
export function saveRoomData(wing, room, tableData) {
  const key = buildKey(wing, room);
  try {
    localStorage.setItem(key, JSON.stringify(tableData));
  } catch (e) {
    console.warn("[seatMapPersistence] saveRoomData failed:", e);
  }
  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage({ wing, room, data: tableData });
    bc.close();
  } catch {}
}

// ─── Per-room load ────────────────────────────────────────────────────────────
export function getRoomData(wing, room, defaultData) {
  const key = buildKey(wing, room);
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("[seatMapPersistence] getRoomData failed:", e);
  }
  return defaultData;
}

// ─── Whole-map save ───────────────────────────────────────────────────────────
export function saveSeatMapData(wing, room, data) {
  try {
    saveRoomData(wing, room, data);
    const existing = loadSeatMapData() || {};
    const updated  = {
      ...existing,
      [wing]: { ...(existing[wing] || {}), [room]: data },
    };
    localStorage.setItem(LEGACY_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.warn("[seatMapPersistence] saveSeatMapData failed:", e);
    return false;
  }
}

// ─── Whole-map load ───────────────────────────────────────────────────────────
export function loadSeatMapData() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("[seatMapPersistence] loadSeatMapData failed:", e);
  }
  return null;
}

// ─── Subscribe to live changes ────────────────────────────────────────────────
export function subscribeToSeatMapChanges(callback) {
  let bc = null;
  try {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (e) => {
      if (e.data?.wing && e.data?.room && e.data?.data) callback(e.data);
    };
  } catch { bc = null; }

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

// ─── Dispatch same-tab event ──────────────────────────────────────────────────
export function dispatchSeatMapUpdate(wing, room, data) {
  saveRoomData(wing, room, data);
  window.dispatchEvent(
    new CustomEvent("seatmap:update", { detail: { wing, room, data } })
  );
}