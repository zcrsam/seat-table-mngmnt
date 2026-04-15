import { useState } from "react";
import { motion } from "framer-motion";

const C = {
  primary: "#1B2A4A",
  secondary: "#C9A74D", 
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  light: "#F8FAFC",
  dark: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
  text: "#374151",
  textLight: "#9CA3AF",
};

const F = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'DM Sans', sans-serif",
  mono: "'Fira Code', monospace",
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return C.warning;
    case 'approved':
      return C.success;
    case 'rejected':
      return C.danger;
    default:
      return C.muted;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'approved':
      return '✅';
    case 'rejected':
      return '❌';
    default:
      return '📋';
  }
};

export default function ReservationTable({ reservations, onApprove, onReject, onDelete, onSelect }) {
  const [filter, setFilter] = useState("all");

  const filteredReservations = filter === "all" 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: C.text, fontFamily: F.heading }}>
          Reservation Management
        </h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "14px", color: C.muted }}>
            Filter:
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
              fontSize: "14px",
              color: C.text,
              background: "white",
            }}
          >
            <option value="all">All ({reservations.length})</option>
            <option value="pending">Pending ({reservations.filter(r => r.status === 'pending').length})</option>
            <option value="approved">Approved ({reservations.filter(r => r.status === 'approved').length})</option>
            <option value="rejected">Rejected ({reservations.filter(r => r.status === 'rejected').length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse",
          fontSize: "14px",
        }}>
          <thead>
            <tr style={{ background: C.light, borderBottom: `2px solid ${C.border}` }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: C.text }}>REFERENCE</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: C.text }}>GUEST</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: C.text }}>VENUES/EVENTS</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: C.text }}>EVENT DATE</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: C.text }}>DATE SUBMITTED</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: C.text }}>GUESTS</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: C.text }}>TYPE</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: C.text }}>STATUS</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: C.text }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((reservation, index) => (
              <motion.tr
                key={reservation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{ 
                  borderBottom: `1px solid ${C.border}`,
                  "&:hover": {
                    background: C.light,
                  }
                }}
              >
                <td style={{ padding: "12px", fontFamily: F.mono, fontSize: "12px", color: C.muted }}>
                  {reservation.id}
                </td>
                <td style={{ padding: "12px" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: C.text }}>{reservation.guest}</div>
                    <div style={{ fontSize: "12px", color: C.muted }}>{reservation.email}</div>
                  </div>
                </td>
                <td style={{ padding: "12px" }}>{reservation.room || reservation.venue?.name || reservation.venue || "—"}</td>
                <td style={{ padding: "12px" }}>{reservation.eventDate}</td>
                <td style={{ padding: "12px" }}>
                  <div>{reservation.dateSubmitted}</div>
                  <div style={{ fontSize: "12px", color: C.muted }}>{reservation.timeSubmitted}</div>
                </td>
                <td style={{ padding: "12px" }}>{reservation.guests}</td>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span>{reservation.type}</span>
                    <span style={{ fontSize: "12px", color: C.muted }}>{reservation.seats}</span>
                  </div>
                </td>
                <td style={{ padding: "12px" }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 500,
                    background: getStatusColor(reservation.status),
                    color: "white",
                  }}>
                    <span>{getStatusIcon(reservation.status)}</span>
                    <span>{reservation.status}</span>
                  </div>
                </td>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {reservation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(reservation.id)}
                          style={{
                            padding: "6px 12px",
                            background: C.success,
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => onReject(reservation.id)}
                          style={{
                            padding: "6px 12px",
                            background: C.danger,
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(reservation.id)}
                      style={{
                        padding: "6px 12px",
                        background: C.muted,
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                      title="Delete reservation"
                    >
                      🗑 Delete
                    </button>
                    {reservation.status !== 'pending' && (
                      <button
                        onClick={() => onSelect(reservation)}
                        style={{
                          padding: "6px 12px",
                          background: C.primary,
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        👁 View
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
