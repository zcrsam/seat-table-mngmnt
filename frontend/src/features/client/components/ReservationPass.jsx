import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Design tokens matching the dashboard
const C = {
  gold: "#8C6B2A",
  goldFaint: "rgba(140,107,42,0.08)",
  goldFaintest: "rgba(140,107,42,0.03)",
  borderAccent: "rgba(140,107,42,0.25)",
  borderDefault: "rgba(0,0,0,0.07)",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  surfaceBase: "#FFFFFF",
  pageBg: "#F9FAFB",
  pending: "#F59E0B",
  pendingBg: "#FEF3C7",
  pendingBorder: "#FCD34D",
};

const F = {
  display: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  label: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

export default function ReservationPass({ reservation, onClose }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleSavePass = async () => {
    setSaving(true);
    try {
      // Simulate save functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      // You could add actual save logic here (e.g., download as PDF, save to localStorage, etc.)
      alert("Pass saved successfully!");
    } catch (error) {
      alert("Failed to save pass");
    } finally {
      setSaving(false);
    }
  };

  const isStandalone = 
    String(reservation?.table_number || "").toUpperCase() === "STANDALONE" ||
    reservation?.type === "standalone" ||
    reservation?.is_standalone === 1 ||
    reservation?.is_standalone === true;

  return (
    <div style={{
      minHeight: "100vh",
      background: C.pageBg,
      fontFamily: F.body,
      color: C.textPrimary,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        background: C.surfaceBase,
        borderBottom: `1px solid ${C.borderDefault}`,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: 8,
            fontFamily: F.body,
            fontSize: 14,
            color: C.textSecondary,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.05)";
            e.currentTarget.style.color = C.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = C.textSecondary;
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          BACK TO MAP
        </button>

        <button
          onClick={handleSavePass}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: C.gold,
            border: "none",
            borderRadius: 8,
            fontFamily: F.label,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            cursor: saving ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            opacity: saving ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!saving) e.currentTarget.style.background = "#6B5521";
          }}
          onMouseLeave={(e) => {
            if (!saving) e.currentTarget.style.background = C.gold;
          }}
        >
          {saving ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              SAVING...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              SAVE PASS
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{
          background: C.surfaceBase,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: `1px solid ${C.borderDefault}`,
          width: "100%",
          maxWidth: 400,
          overflow: "hidden",
        }}>
          {/* Header Section */}
          <div style={{
            background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold}DD 100%)`,
            padding: "32px 24px",
            textAlign: "center",
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M0 20h40v20H0z\"/%3E%3C/g%3E%3C/svg%3E')",
            }} />
            
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                fontFamily: F.label,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.8)",
                marginBottom: 8,
              }}>
                RESERVATION SUBMITTED
              </div>
              
              <div style={{
                fontFamily: F.display,
                fontSize: 24,
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: 12,
              }}>
                Pending Approval
              </div>

              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 20,
                backdropFilter: "blur(10px)",
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  animation: "pulse 2s infinite",
                }} />
                <span style={{
                  fontFamily: F.label,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#FFFFFF",
                }}>
                  Pending Review
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div style={{ padding: "32px 24px" }}>
            {/* Reference Code */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: F.label,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.textTertiary,
                marginBottom: 6,
              }}>
                REFERENCE CODE
              </div>
              <div style={{
                fontFamily: F.display,
                fontSize: 20,
                fontWeight: 700,
                color: C.gold,
                letterSpacing: "0.02em",
              }}>
                {reservation?.reference_code || "2026-5230"}
              </div>
            </div>

            {/* Table Type */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: F.label,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.textTertiary,
                marginBottom: 6,
              }}>
                TABLE
              </div>
              <div style={{
                fontFamily: F.body,
                fontSize: 16,
                fontWeight: 600,
                color: C.textPrimary,
              }}>
                {isStandalone ? "Standalone Seat" : formatTableNumber(reservation?.table_number)}
              </div>
            </div>

            {/* Date */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontFamily: F.label,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.textTertiary,
                marginBottom: 6,
              }}>
                DATE
              </div>
              <div style={{
                fontFamily: F.body,
                fontSize: 16,
                fontWeight: 600,
                color: C.textPrimary,
              }}>
                {formatDate(reservation?.event_date) || "April 29, 2026"}
              </div>
            </div>

            {/* Status Message */}
            <div style={{
              padding: "16px",
              background: C.pendingBg,
              border: `1px solid ${C.pendingBorder}`,
              borderRadius: 12,
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: F.label,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.pending,
                marginBottom: 8,
              }}>
                STATUS
              </div>
              <div style={{
                fontFamily: F.body,
                fontSize: 14,
                lineHeight: 1.5,
                color: C.textSecondary,
              }}>
                Your booking is awaiting confirmation. You'll be notified once an admin reviews your reservation.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Helper function
function formatTableNumber(tableNumber) {
  if (!tableNumber) return "—";
  const num = String(tableNumber).trim();
  if (num.toUpperCase() === "STANDALONE") return "Standalone";
  return num.startsWith("T") ? num : `T${num}`;
}
