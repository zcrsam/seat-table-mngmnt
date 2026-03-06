// src/pages/AlabangReserve.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainWingNavbar from "../components/client/MainWingNavbar";
import SeatMap, { STATUS_COLORS } from "../components/admin/SeatMap";
import { TABLE_T1 } from "../data/seatMapData";
import { getRoomData, subscribeToSeatMapChanges } from "../utils/seatMapPersistence";

// ─── Constants ────────────────────────────────────────────────────────────────
const WING = "Main Wing";
const ROOM = "Alabang Function Room";

const F = {
  display: "'Cormorant Garamond', Georgia, serif",
  body:    "'DM Sans', sans-serif",
};

function generateRef() {
  return "BLV-2025-" + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  root: {
    fontFamily: F.body,
    background: "#F7F3EA",
    minHeight: "100vh",
    width: "100%",
    color: "#1B2A4A",
  },
  page: {
    padding: "32px 40px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  pageTitle: {
    fontSize: 42,
    fontWeight: 700,
    fontFamily: F.display,
    color: "#1B2A4A",
    margin: 0,
    lineHeight: 1.1,
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6b6256",
    fontFamily: F.body,
    marginTop: 6,
    marginBottom: 28,
    fontWeight: 400,
    maxWidth: 560,
    lineHeight: 1.5,
  },
  toggleBar: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  toggleLabel: {
    fontFamily: F.body,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#888",
    textTransform: "uppercase",
  },
  togglePillGroup: {
    display: "flex",
    alignItems: "center",
    background: "#E8E3DC",
    borderRadius: 24,
    padding: 3,
    gap: 2,
  },
  togglePillBtn: (active) => ({
    padding: "8px 22px",
    border: "none",
    background: active ? "#1B2A4A" : "transparent",
    color: active ? "#FFFFFF" : "#888",
    cursor: "pointer",
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: 700,
    fontFamily: F.body,
    borderRadius: 20,
    transition: "all 0.18s",
    outline: "none",
    textTransform: "uppercase",
  }),
  layout: {
    display: "flex",
    gap: 28,
    alignItems: "flex-start",
  },
  mapCard: {
    flex: 1,
    minWidth: 320,
  },
  rightPanel: {
    width: 260,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    flexShrink: 0,
  },
  legendCard: {
    background: "#fff",
    borderRadius: 10,
    padding: "16px 18px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  legendTitle: {
    fontFamily: F.body,
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: 2,
    color: "#1B2A4A",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  legendDot: (color) => ({
    width: 13,
    height: 13,
    borderRadius: 3,
    background: color,
    flexShrink: 0,
  }),
  legendText: { fontFamily: F.body, fontSize: 13, color: "#333", fontWeight: 500 },
  selCard: {
    background: "#fff",
    borderRadius: 10,
    padding: "16px 18px",
    color: "#1B2A4A",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  selTitle: { fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 10, textTransform: "uppercase" },
  selRow: { marginBottom: 6, display: "flex", alignItems: "baseline", gap: 4 },
  selLabel: { fontFamily: F.body, fontSize: 10, letterSpacing: 1.5, color: "#999", fontWeight: 700, textTransform: "uppercase", flexShrink: 0 },
  selVal: { fontFamily: F.body, fontSize: 13, color: "#1B2A4A", fontWeight: 600 },
  ctaBtn: (enabled) => ({
    marginTop: 10, width: "100%", padding: "11px 0",
    background: enabled ? "#C9A84C" : "#E8E3DC",
    color: enabled ? "#1B2A4A" : "#AAA",
    border: "none", borderRadius: 6,
    fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 1.5,
    cursor: enabled ? "pointer" : "default", transition: "all 0.2s",
    textTransform: "uppercase",
  }),
  policyCard: { background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  policyTitle: { fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#1B2A4A", marginBottom: 8, textTransform: "uppercase" },
  policyText: { fontFamily: F.body, fontSize: 12, color: "#666", lineHeight: 1.6 },

  // ── Modal shared (white) ──────────────────────────────────────────────────
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(27,42,74,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, backdropFilter: "blur(3px)",
  },
  // White modal card — used for all 3 steps
  modalWhite: {
    background: "#fff",
    borderRadius: 14,
    padding: "36px 40px",
    width: 440,
    maxWidth: "90vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    color: "#1B2A4A",
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTag: {
    fontFamily: F.body,
    fontSize: 9,
    letterSpacing: 2,
    color: "#C9A84C",
    fontWeight: 700,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  modalTitle: {
    fontFamily: F.display,
    fontSize: 28,
    fontWeight: 700,
    color: "#1B2A4A",
    marginBottom: 4,
  },

  // Step indicator
  stepRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 24, marginTop: 6 },
  stepItem: (active, done) => ({
    fontFamily: F.body, fontSize: 9, letterSpacing: 1.5, fontWeight: 700,
    color: done ? "#C9A84C" : active ? "#1B2A4A" : "#BBBBBB",
    display: "flex", alignItems: "center", gap: 4,
  }),
  stepDot: (active, done) => ({
    width: 6, height: 6, borderRadius: "50%",
    background: done ? "#C9A84C" : active ? "#1B2A4A" : "#DDDDDD",
  }),
  stepDivider: { flex: 1, height: 1, background: "#E0E0E0", maxWidth: 20 },

  // Counter (guest count step)
  counterWrap: { textAlign: "center", margin: "24px 0 8px" },
  counterRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 6 },
  counterBtn: {
    width: 32, height: 32, borderRadius: "50%",
    border: "2px solid #C9A84C", background: "transparent",
    color: "#C9A84C", fontSize: 18, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold",
  },
  counterNum: { fontFamily: F.display, fontSize: 52, fontWeight: 700, color: "#1B2A4A", lineHeight: 1 },
  counterLabel: { fontFamily: F.body, fontSize: 9, letterSpacing: 2, color: "#999", fontWeight: 700, textTransform: "uppercase" },
  counterNote: { fontFamily: F.body, fontSize: 12, color: "#666", marginBottom: 24, lineHeight: 1.6, textAlign: "center" },

  // Buttons inside modals
  continueBtn: {
    width: "100%", padding: "14px 0",
    background: "#1B2A4A", color: "#fff",
    border: "none", borderRadius: 6,
    fontFamily: F.body, fontWeight: 700, fontSize: 12, letterSpacing: 2,
    cursor: "pointer", marginBottom: 10, textTransform: "uppercase",
  },
  cancelBtn: {
    width: "100%", padding: "10px 0",
    background: "transparent", color: "#999",
    border: "none",
    fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: 2,
    cursor: "pointer",
  },

  // Timer + info badge (details step)
  timerBar: {
    background: "#F7F3EA", borderRadius: 8,
    padding: "10px 14px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 14, fontSize: 11, fontFamily: F.body, color: "#666", letterSpacing: 1,
    border: "1px solid #E8E3DC",
  },
  timerNum: { color: "#C9A84C", fontWeight: 700, fontSize: 16 },
  infoBadge: {
    background: "#F7F3EA", borderRadius: 8,
    padding: "10px 14px",
    display: "flex", gap: 16, marginBottom: 16,
    fontSize: 12, fontFamily: F.body, color: "#666",
    border: "1px solid #E8E3DC",
  },
  infoBadgeItem: { display: "flex", flexDirection: "column" },
  infoBadgeLabel: { fontSize: 8, letterSpacing: 1.5, color: "#999", fontWeight: 700, textTransform: "uppercase" },
  infoBadgeVal: { color: "#1B2A4A", fontWeight: 700, fontSize: 12 },

  // Form fields (details step)
  formLabel: {
    fontFamily: F.body, fontSize: 10, fontWeight: 700,
    letterSpacing: 1, color: "#888",
    marginBottom: 4, display: "block", textTransform: "uppercase",
  },
  formInput: {
    width: "100%", padding: "10px 12px", borderRadius: 6,
    border: "1.5px solid #E0DAD0",
    background: "#FAFAF7", color: "#1B2A4A",
    fontFamily: F.body, fontSize: 13,
    marginBottom: 14, boxSizing: "border-box", outline: "none",
  },
  formRow: { display: "flex", gap: 10 },
  reviewBtn: {
    width: "100%", padding: "13px 0",
    background: "#1B2A4A", color: "#fff",
    border: "none", borderRadius: 6,
    fontFamily: F.body, fontWeight: 700, fontSize: 12, letterSpacing: 2,
    cursor: "pointer", marginTop: 6, textTransform: "uppercase",
  },

  // Review modal
  sectionLabel: {
    fontFamily: F.body, fontSize: 9, letterSpacing: 2, fontWeight: 700,
    color: "#C9A84C", marginBottom: 10, marginTop: 16, textTransform: "uppercase",
  },
  reviewRow: {
    display: "flex", justifyContent: "space-between",
    borderBottom: "1px solid #F0EDE4",
    padding: "9px 0", fontFamily: F.body, fontSize: 13,
  },
  reviewKey: { color: "#888" },
  reviewVal: { color: "#1B2A4A", fontWeight: 600, textAlign: "right" },
  pendingBadge: {
    background: "#FFF3E0", color: "#E8A838",
    borderRadius: 4, padding: "2px 8px",
    fontFamily: F.body, fontSize: 10, fontWeight: 700, letterSpacing: 1,
  },
  editBtn: {
    flex: 1, padding: "12px 0",
    border: "2px solid #1B2A4A", background: "transparent", color: "#1B2A4A",
    borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 11,
    letterSpacing: 2, cursor: "pointer", textTransform: "uppercase",
  },
  submitBtn: {
    flex: 1, padding: "12px 0",
    border: "none", background: "#1B2A4A", color: "#fff",
    borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 11,
    letterSpacing: 2, cursor: "pointer", textTransform: "uppercase",
  },

  // Success modal
  successModal: {
    background: "#fff", borderRadius: 14, padding: "48px 40px",
    width: 380, maxWidth: "90vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.14)", textAlign: "center",
    position: "relative",
  },
  checkCircle: {
    width: 60, height: 60, borderRadius: "50%",
    background: "#E8F5EE",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 18px", fontSize: 30, color: "#4CAF79",
  },
  successTitle: { fontFamily: F.display, fontSize: 30, fontWeight: 700, color: "#1B2A4A", marginBottom: 12 },
  successNote: { fontFamily: F.body, fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 22 },
  refCode: {
    background: "#1B2A4A", color: "#C9A84C",
    borderRadius: 6, padding: "14px 20px",
    fontFamily: F.body, fontWeight: 700, fontSize: 16, letterSpacing: 3,
    marginBottom: 8, display: "block", textAlign: "center",
  },
  refNote: { fontFamily: F.body, fontSize: 11, color: "#AAA", marginBottom: 22, letterSpacing: 1 },
  closeBtn: {
    position: "absolute", top: 14, right: 16,
    width: 32, height: 32, borderRadius: "50%",
    background: "transparent", border: "1.5px solid #E0DAD0",
    color: "#888", fontSize: 16, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: F.body, fontWeight: 400, lineHeight: 1,
    transition: "all 0.15s",
  },
  backMapBtn: {
    width: "100%", padding: "12px 0",
    border: "2px solid #1B2A4A", background: "transparent", color: "#1B2A4A",
    borderRadius: 6, fontFamily: F.body, fontWeight: 700, fontSize: 12,
    cursor: "pointer", letterSpacing: 1, textTransform: "uppercase",
  },
};

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ["GUEST COUNT", "DETAILS", "CONFIRM"];
  return (
    <div style={s.stepRow}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx, active = step === idx;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={s.stepItem(active, done)}>
              <div style={s.stepDot(active, done)} />
              {label}
            </div>
            {i < steps.length - 1 && <div style={s.stepDivider} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function ModalGuestCount({ tableData, mode, onContinue, onCancel }) {
  const [guests, setGuests] = useState(2);
  const capacity = tableData?.capacity || 8;
  return (
    <div style={s.overlay}>
      <div style={s.modalWhite}>
        <button style={s.closeBtn} onClick={onCancel}
          onMouseEnter={e => { e.currentTarget.style.background = "#F0EDE4"; e.currentTarget.style.color = "#1B2A4A"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; }}>
          ✕
        </button>
        <div style={s.modalTag}>{mode === "individual" ? "INDIVIDUAL SEAT RESERVATION" : "WHOLE TABLE RESERVATION"}</div>
        <div style={s.modalTitle}>Reserve this table?</div>
        <StepIndicator step={1} />

        <div style={s.counterWrap}>
          <div style={s.counterRow}>
            <button style={s.counterBtn} onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
            <div style={s.counterNum}>{guests}</div>
            <button style={s.counterBtn} onClick={() => setGuests(g => Math.min(capacity, g + 1))}>+</button>
          </div>
          <div style={s.counterLabel}>NUMBER OF GUESTS</div>
        </div>

        <div style={s.counterNote}>
          Table {tableData?.id} seats up to <strong style={{ color: "#1B2A4A" }}>{capacity} guests</strong>.<br />
          Each occupied seat will be marked <span style={{ color: "#E8A838", fontWeight: 700 }}>Pending</span> under your booking.
        </div>

        <button style={s.continueBtn} onClick={() => onContinue(guests)}>CONTINUE</button>
        <button style={s.cancelBtn} onClick={onCancel}>CANCEL</button>
      </div>
    </div>
  );
}

function ModalDetails({ tableData, mode, guests, onReview, onCancel }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", eventDate: "", eventTime: "", specialRequests: "" });
  const [secondsLeft, setSecondsLeft] = useState(24 * 60);

  useEffect(() => {
    if (secondsLeft <= 0) { onCancel(); return; }
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const timer = `${mins}:${secs}`;
  const isUrgent = secondsLeft <= 60;
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const allFilled = form.firstName && form.lastName && form.email && form.phone && form.eventDate;
  return (
    <div style={s.overlay}>
      <div style={s.modalWhite}>
        <button style={s.closeBtn} onClick={onCancel}
          onMouseEnter={e => { e.currentTarget.style.background = "#F0EDE4"; e.currentTarget.style.color = "#1B2A4A"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; }}>
          ✕
        </button>
        <div style={s.modalTag}>STEP 2 OF 3 · TABLE RESERVATION</div>
        <div style={s.modalTitle}>Your Information</div>
        <StepIndicator step={2} />

        <div style={{ ...s.timerBar, border: isUrgent ? "1px solid #E0524433" : "1px solid #E8E3DC", background: isUrgent ? "#FFF5F5" : "#F7F3EA" }}>
          <span style={{ color: "#555" }}>
            Seat is being held for you<br />
            <span style={{ fontSize: 10, color: isUrgent ? "#E05252" : "#888" }}>
              {isUrgent ? "⚠ Hurry! Your hold is about to expire." : "Complete this form before the timer expires"}
            </span>
          </span>
          <span style={{ ...s.timerNum, color: isUrgent ? "#E05252" : "#C9A84C" }}>
            {timer}<span style={{ fontSize: 9, color: "#AAA", marginLeft: 2 }}>min</span>
          </span>
        </div>

        <div style={s.infoBadge}>
          <div style={s.infoBadgeItem}><span style={s.infoBadgeLabel}>ROOM</span><span style={s.infoBadgeVal}>{ROOM}</span></div>
          <div style={s.infoBadgeItem}><span style={s.infoBadgeLabel}>TABLE</span><span style={s.infoBadgeVal}>{tableData?.id || "T1"}</span></div>
          <div style={s.infoBadgeItem}><span style={s.infoBadgeLabel}>GUESTS</span><span style={s.infoBadgeVal}>{guests}</span></div>
        </div>

        <div style={s.formRow}>
          <div style={{ flex: 1 }}><label style={s.formLabel}>FIRST NAME *</label><input style={s.formInput} value={form.firstName} onChange={set("firstName")} /></div>
          <div style={{ flex: 1 }}><label style={s.formLabel}>LAST NAME *</label><input style={s.formInput} value={form.lastName} onChange={set("lastName")} /></div>
        </div>
        <label style={s.formLabel}>EMAIL ADDRESS *</label>
        <input style={s.formInput} value={form.email} onChange={set("email")} type="email" />
        <label style={s.formLabel}>PHONE NUMBER *</label>
        <input style={s.formInput} value={form.phone} onChange={set("phone")} type="tel" />
        <div style={s.formRow}>
          <div style={{ flex: 1 }}><label style={s.formLabel}>EVENT DATE *</label><input style={s.formInput} value={form.eventDate} onChange={set("eventDate")} type="date" /></div>
          <div style={{ flex: 1 }}><label style={s.formLabel}>EVENT TIME</label><input style={s.formInput} value={form.eventTime} onChange={set("eventTime")} type="time" /></div>
        </div>
        <label style={s.formLabel}>SPECIAL REQUESTS</label>
        <textarea style={{ ...s.formInput, resize: "vertical", minHeight: 56 }} value={form.specialRequests} onChange={set("specialRequests")} />

        <button style={{ ...s.reviewBtn, opacity: allFilled ? 1 : 0.45 }} disabled={!allFilled} onClick={() => onReview(form)}>
          REVIEW BOOKING
        </button>
      </div>
    </div>
  );
}

function ModalReview({ form, guests, tableData, onSubmit, onEdit }) {
  const formatTime = t => {
    if (!t) return "Pending";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };
  return (
    <div style={s.overlay}>
      <div style={s.modalWhite}>
        <button style={s.closeBtn} onClick={onEdit}
          onMouseEnter={e => { e.currentTarget.style.background = "#F0EDE4"; e.currentTarget.style.color = "#1B2A4A"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; }}>
          ✕
        </button>
        <div style={s.modalTag}>STEP 3 OF 3 · TABLE RESERVATION</div>
        <div style={s.modalTitle}>Review Your Booking</div>
        <StepIndicator step={3} />

        <div style={s.sectionLabel}>RESERVATION DETAILS</div>
        {[
          ["Venue",            "The Bellevue Manila"],
          ["Room",             `${WING} — ${ROOM}`],
          ["Table",            `Table ${tableData?.id || "T1"}`],
          ["Number of Guests", `${guests} guests`],
          ["Event Date",       form.eventDate || "—"],
          ["Event Time",       form.eventTime ? formatTime(form.eventTime) : null],
        ].map(([k, v]) => (
          <div key={k} style={s.reviewRow}>
            <span style={s.reviewKey}>{k}</span>
            {k === "Event Time" && !form.eventTime
              ? <span style={s.pendingBadge}>Pending</span>
              : <span style={s.reviewVal}>{v}</span>}
          </div>
        ))}

        <div style={s.sectionLabel}>GUEST INFORMATION</div>
        {[
          ["Full Name",        `${form.firstName} ${form.lastName}`],
          ["Email",            form.email],
          ["Phone",            form.phone],
          ["Special Requests", form.specialRequests || "None"],
        ].map(([k, v]) => (
          <div key={k} style={s.reviewRow}>
            <span style={s.reviewKey}>{k}</span>
            <span style={s.reviewVal}>{v}</span>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button style={s.editBtn}   onClick={onEdit}>EDIT DETAILS</button>
          <button style={s.submitBtn} onClick={onSubmit}>SUBMIT</button>
        </div>
      </div>
    </div>
  );
}

function ModalSuccess({ refCode, onBack }) {
  return (
    <div style={s.overlay}>
      <div style={s.successModal}>
        <button style={{ ...s.closeBtn, position: "absolute", top: 14, right: 16 }} onClick={onBack}
          onMouseEnter={e => { e.currentTarget.style.background = "#F0EDE4"; e.currentTarget.style.color = "#1B2A4A"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; }}>
          ✕
        </button>
        <div style={s.checkCircle}>✓</div>
        <div style={s.successTitle}>Reservation<br />Submitted!</div>
        <div style={s.successNote}>
          Your reservation request has been received. You will get an email confirmation once the admin approves your booking.
        </div>
        <div style={s.refCode}>{refCode}</div>
        <div style={s.refNote}>Screenshot or copy this reference code for your records.</div>
        <button style={s.backMapBtn} onClick={onBack}>BACK TO SEAT MAP</button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AlabangReserve() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("whole");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [modal, setModal] = useState(null);
  const [guests, setGuests] = useState(1);
  const [formData, setFormData] = useState(null);
  const [refCode] = useState(generateRef);

  const [tableData, setTableData] = useState(() => {
    const raw = getRoomData(WING, ROOM, null);
    if (!raw) return null;
    if (Array.isArray(raw)) return raw.filter(t => t.seats && t.seats.length > 0);
    if (raw.seats && raw.seats.length > 0) return raw;
    return null;
  });

  useEffect(() => {
    const unsubscribe = subscribeToSeatMapChanges(({ wing, room, data }) => {
      if (wing === WING && room === ROOM) {
        if (Array.isArray(data)) {
          setTableData(data.filter(t => t.seats && t.seats.length > 0));
        } else if (data?.seats?.length > 0) {
          setTableData(data);
        } else {
          setTableData(null);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      const key = `seatmap:${WING}:${ROOM}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const tbls = Array.isArray(parsed) ? parsed : [parsed];
        const valid = tbls.filter(t => t.seats && t.seats.length > 0);
        if (valid.length === 0) {
          localStorage.removeItem(key);
          setTableData(null);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTableClick    = (table) => { setSelectedTable(table); setModal("guestCount"); };
  const handleSeatClick     = (seat) => setSelectedSeat(seat);
  const handleGuestContinue = (g) => { setGuests(g); setModal("details"); };
  const handleReview        = (form) => { setFormData(form); setModal("review"); };
  const handleSubmit        = () => setModal("success");
  const handleBack          = () => { setModal(null); setSelectedSeat(null); setSelectedTable(null); };

  const isMobile = windowSize.width < 480;
  const isTablet = windowSize.width < 768;

  const selSeat    = mode === "individual" ? (selectedSeat ? `Seat ${selectedSeat.num}` : "—") : "—";
  const selTable   = selectedTable ? selectedTable.id : "—";
  const canProceed = mode === "individual" ? !!selectedSeat : false;

  const responsivePage   = isMobile ? { padding: "16px 14px" } : isTablet ? { padding: "24px 20px" } : {};
  const responsiveTitle  = isMobile ? { fontSize: 26 } : isTablet ? { fontSize: 32 } : {};
  const responsiveLayout = isMobile || isTablet ? { flexDirection: "column" } : {};
  const responsivePanel  = isMobile ? { width: "100%" } : isTablet ? { width: "100%" } : {};

  return (
    <div style={s.root}>
      <MainWingNavbar active="ALABANG FUNCTION ROOM" />

      <div style={{ ...s.page, ...responsivePage }}>
        {/* Back button + breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, marginTop: 8 }}>
          <button
            onClick={() => navigate("/venues")}
            title="Back to home" aria-label="Back to home"
            style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: 999, border: "2px solid #C9A84C", color: "#C9A84C", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", fontSize: 16, flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#9B7A35"; e.currentTarget.style.color = "#9B7A35"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }}
          >←</button>
          <div style={{ width: 32, height: 2, background: "#C9A84C", borderRadius: 2 }} />
          <div style={{ color: "#C9A84C", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: F.body }}>ALL VENUES</div>
        </div>

        <h1 style={{ ...s.pageTitle, ...responsiveTitle }}>Alabang Function Room</h1>
        <p style={s.pageSubtitle}>Book your preferred table in the Main Wing of Alabang Function Room</p>

        {/* Mode toggle */}
        <div style={{ ...s.toggleBar, marginBottom: 24 }}>
          <span style={s.toggleLabel}>I WANT TO RESERVE A:</span>
          <div style={s.togglePillGroup}>
            <button style={s.togglePillBtn(mode === "whole")}
              onClick={() => { setMode("whole"); setSelectedSeat(null); }}>Whole Table</button>
            <button style={s.togglePillBtn(mode === "individual")}
              onClick={() => { setMode("individual"); setSelectedTable(null); }}>Individual Seat</button>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ ...s.layout, ...responsiveLayout }}>

          {/* Seat Map */}
          <div style={{ ...s.mapCard }}>
            <SeatMap
              tableData={tableData}
              editMode={false}
              selectedSeat={selectedSeat}
              onSeatClick={handleSeatClick}
              onTableClick={handleTableClick}
              windowWidth={windowSize.width}
              wing={WING}
              room={ROOM}
            />
          </div>

          {/* Right panel */}
          <div style={{ ...s.rightPanel, ...responsivePanel }}>
            {/* Legend */}
            <div style={s.legendCard}>
              <div style={s.legendTitle}>Status Legend</div>
              {Object.entries(STATUS_COLORS).map(([key, color]) => (
                <div key={key} style={s.legendRow}>
                  <div style={s.legendDot(color)} />
                  <span style={s.legendText}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              ))}
            </div>

            {/* Selection */}
            <div style={s.selCard}>
              <div style={s.selTitle}>Your Selection</div>
              <div style={s.selRow}>
                <span style={s.selLabel}>SEAT:</span>
                <span style={s.selVal}>{selSeat}</span>
              </div>
              <div style={s.selRow}>
                <span style={s.selLabel}>TABLE:</span>
                <span style={s.selVal}>{selTable}</span>
              </div>
              {mode === "whole" && (
                <button style={s.ctaBtn(true)} onClick={() => setModal("guestCount")}
                  onMouseEnter={e => { e.target.style.background = "#B89635"; }}
                  onMouseLeave={e => { e.target.style.background = "#C9A84C"; }}>
                  Reserve This Table
                </button>
              )}
              {mode === "individual" && (
                <button style={s.ctaBtn(canProceed)} onClick={canProceed ? () => setModal("guestCount") : undefined}>
                  Reserve This Seat
                </button>
              )}
            </div>

            {/* Policy */}
            <div style={s.policyCard}>
              <div style={s.policyTitle}>Hotel Policy</div>
              <div style={s.policyText}>
                Pending tables are held for one (1) day. After the expiry the table returns to available.<br /><br />
                Reservations are confirmed only after admin approval.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {modal === "guestCount" && (
        <ModalGuestCount
          tableData={selectedTable || (Array.isArray(tableData) ? tableData[0] : tableData)}
          mode={mode} onContinue={handleGuestContinue} onCancel={() => setModal(null)}
        />
      )}
      {modal === "details" && (
        <ModalDetails
          tableData={selectedTable || (Array.isArray(tableData) ? tableData[0] : tableData)}
          mode={mode} guests={guests} onReview={handleReview} onCancel={() => setModal(null)}
        />
      )}
      {modal === "review" && formData && (
        <ModalReview
          form={formData} guests={guests}
          tableData={selectedTable || (Array.isArray(tableData) ? tableData[0] : tableData)}
          onSubmit={handleSubmit} onEdit={() => setModal("details")}
        />
      )}
      {modal === "success" && <ModalSuccess refCode={refCode} onBack={handleBack} />}
    </div>
  );
}