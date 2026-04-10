// src/features/admin/pages/SeatMapEditor.jsx
import { useState, useEffect } from "react";
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

const CUSTOM_ROOMS_KEY = "bellevue_custom_rooms";

const ROOM_CATEGORIES = {
  "All Venues": {
    "Main Wing": ["Alabang Function Room", "Pavillion", "Garden Room"],
    "Tower Wing": ["Tower Ballroom", "Rooftop Deck", "Sky Lounge"],
    "Dining": ["Main Dining", "Bellevue Steakhouse", "Cafe Bellevue"],
  },
};

function findWingForRoom(room) {
  for (const [wing, rooms] of Object.entries(ROOM_CATEGORIES["All Venues"])) {
    if (rooms.includes(room)) return wing;
  }
  return null;
}

export default function SeatMapEditor() {
  const [selectedWing, setSelectedWing] = useState("Main Wing");
  const [selectedRoom, setSelectedRoom] = useState("Alabang Function Room");
  const [seatMapData, setSeatMapData] = useState(() => {
    const savedData = loadSeatMapData();
    return {
      "Main Wing": { ...SEAT_MAP_DATA["Main Wing"], ...(savedData?.["Main Wing"] || {}) },
      "Tower Wing": { ...SEAT_MAP_DATA["Tower Wing"], ...(savedData?.["Tower Wing"] || {}) },
      "Dining": { ...SEAT_MAP_DATA["Dining"], ...(savedData?.["Dining"] || {}) },
    };
  });
  const [editMode, setEditMode] = useState(true); // Always in edit mode

  useEffect(() => {
    const unsub = subscribeToSeatMapChanges(({ wing, room, data }) => {
      setSeatMapData(prev => ({ ...prev, [wing]: { ...prev[wing], [room]: data } }));
    });
    return unsub;
  }, []);

  const handleSeatMapUpdate = (updatedRoomData) => {
    setSeatMapData(prev => ({ ...prev, [selectedWing]: { ...prev[selectedWing], [selectedRoom]: updatedRoomData } }));
    const saved = saveSeatMapData(selectedWing, selectedRoom, updatedRoomData);
    console.log("Seat map saved:", saved ? "Success" : "Error");
  };

  const currentWingData = seatMapData[selectedWing] || {};
  const currentRoomData = currentWingData[selectedRoom] || { seats: [], tableStatus: "available" };
  const wings = Object.keys(ROOM_CATEGORIES["All Venues"]);

  return (
    <>
      <AdminNavbar />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar 
          isOpen={true} 
          onToggle={() => {}} 
          activeNav="seat-map"
        />
        
        <div style={{
          flex: 1,
          padding: window.innerWidth <= 768 ? "16px" : "24px",
          marginLeft: window.innerWidth <= 768 ? 0 : "220px",
          transition: "margin-left 0.25s ease",
          background: "#F8F9FA",
          minHeight: "100vh"
        }}>
          
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 24, color: "#333333", fontWeight: "bold", marginBottom: 8 }}>Seat Map Editor</div>
            <div style={{ fontSize: 14, color: "#666666", marginBottom: 24 }}>Edit venue layouts and table arrangements</div>
          </div>

          {/* Wing and Room Selection */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#333333", marginBottom: 8 }}>Select Wing:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {wings.map(wing => (
                  <button
                    key={wing}
                    onClick={() => {
                      setSelectedWing(wing);
                      const rooms = Object.keys(ROOM_CATEGORIES["All Venues"][wing] || {});
                      setSelectedRoom(rooms[0] || "");
                    }}
                    style={{
                      padding: "8px 16px",
                      border: selectedWing === wing ? "1px solid #C9A84C" : "1px solid #E1E4E8",
                      borderRadius: 6,
                      background: selectedWing === wing ? "#C9A84C" : "#FFFFFF",
                      color: selectedWing === wing ? "#FFFFFF" : "#333333",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 500,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {wing}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#333333", marginBottom: 8 }}>Select Room:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(ROOM_CATEGORIES["All Venues"][selectedWing] || []).map(room => (
                  <button
                    key={room}
                    onClick={() => setSelectedRoom(room)}
                    style={{
                      padding: "8px 16px",
                      border: selectedRoom === room ? "1px solid #C9A84C" : "1px solid #E1E4E8",
                      borderRadius: 6,
                      background: selectedRoom === room ? "#C9A84C" : "#FFFFFF",
                      color: selectedRoom === room ? "#FFFFFF" : "#333333",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 500,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seat Map */}
          <div style={{ 
            background: "#FFFFFF", 
            borderRadius: 12, 
            padding: 24, 
            border: "1px solid #D4C5A0", 
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
          }}>
            <div style={{ 
              fontSize: 16, 
              color: "#333333", 
              fontWeight: 600, 
              marginBottom: 16, 
              textAlign: "center" 
            }}>
              {selectedRoom}
            </div>
            <SeatMap
              tableData={currentRoomData}
              mode="edit"
              selectedSeat={null}
              onSeatClick={() => {}}
              onTableClick={() => {}}
              windowWidth={Math.max(window.innerWidth <= 768 ? window.innerWidth - 100 : 1000, 600)}
              virtualWidth={Math.max(window.innerWidth <= 768 ? window.innerWidth - 100 : 1200, 800)}
              virtualHeight={Math.max(window.innerWidth <= 768 ? 600 : 800, 600)}
              editMode={editMode}
              onUpdate={handleSeatMapUpdate}
              wing={selectedWing}
              room={selectedRoom}
            />
          </div>
        </div>
      </div>
    </>
  );
}
