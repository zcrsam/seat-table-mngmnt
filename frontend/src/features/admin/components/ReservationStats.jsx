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
};

export default function ReservationStats({ stats }) {
  const statCards = [
    {
      title: "TOTAL RESERVATIONS",
      value: stats.total,
      subtitle: "PENDING RESERVATIONS",
      subtitleValue: stats.pending,
      color: C.warning,
    },
    {
      title: "APPROVED RESERVATIONS", 
      value: stats.approved,
      subtitle: "REJECTED RESERVATIONS",
      subtitleValue: stats.rejected,
      color: C.success,
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ 
        margin: "0 0 20px 0", 
        color: C.text, 
        fontFamily: F.heading,
        fontSize: "24px",
        fontWeight: 600,
      }}>
        QUICK STATS
      </h2>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "20px" 
      }}>
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "25px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
              borderLeft: `4px solid ${stat.color}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Colored accent on left */}
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              background: stat.color,
            }} />
            
            <div style={{ marginLeft: "20px" }}>
              <div style={{ 
                fontSize: "32px", 
                fontWeight: 700, 
                color: C.text,
                lineHeight: 1,
                marginBottom: "5px" 
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: C.muted, 
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
                marginBottom: "10px" 
              }}>
                {stat.title}
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                fontSize: "14px",
                color: C.textLight 
              }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  background: stat.color,
                  borderRadius: "50%",
                  display: "inline-block",
                }} />
                <span>{stat.subtitle}</span>
                <span style={{ color: C.muted }}>:</span>
                <span style={{ fontWeight: 600 }}>{stat.subtitleValue}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
