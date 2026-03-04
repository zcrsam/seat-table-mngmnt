import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainWingNavbar from "../../components/client/MainWingNavbar";
import SeatMap, { STATUS_COLORS, STATUS_LABELS } from "../../components/client/SeatMap";
import { TABLE_T1 } from "../../utils/seatMapData";
import { getRoomData, subscribeToSeatMapChanges } from "../../utils/seatMapPersistence";

// ─── Constants ────────────────────────────────────────────────────────────────
const WING = "Main Wing";
const ROOM = "Alabang Function Room";

function generateRef() {
  return "BLV-2025-" + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  root: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: "#F5F0E8",
    minHeight: "100vh",
    width: "100%",
    color: "#1B2A4A",
  },
  page: {
    padding: "32px 40px",
    maxWidth: 1100,
    margin: "0 auto",
  },
  pageTitle: {
    fontSize: 38,
    fontWeight: "bold",
    fontFamily: "Georgia, serif",
    color: "#1B2A4A",
    margin: 0,
    lineHeight: 1.15,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    letterSpacing: 2.5,
    color: "#888",
    fontFamily: "Arial, sans-serif",
    marginTop: 10,
    marginBottom: 22,
    fontWeight: 400,
  },
  toggleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 100,
    gap: 70,
  },
  toggleLabel: {
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#888",
  },
  togglePillGroup: {
    display: "flex",
    alignItems: "center",
  },
  togglePillBtn: (active) => ({
    padding: "10px 28px",
    border: "none",
    background: active ? "#1B2A4A" : "transparent",
    color: active ? "#FFFFFF" : "#C9A84C",
    cursor: "pointer",
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: 700,
    fontFamily: "Arial, sans-serif",
    borderRadius: "20px 20px 0 0",
    transition: "all 0.15s",
    outline: "none",
  }),
  layout: {
    display: "flex",
    gap: 28,
    alignItems: "flex-start",
  },
  mapCard: {
    background: "#EFEAD9",
    borderRadius: 10,
    padding: 24,
    flex: 1,
    minWidth: 320,
  },
  mapTitle: {
    textAlign: "center",
    fontFamily: "Georgia, serif",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 2,
    color: "#C9A84C",
    marginBottom: 16,
  },
  rightPanel: {
    width: 280,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  legendCard: {
    background: "#fff",
    borderRadius: 8,
    padding: "8px 12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  legendTitle: {
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: 2,
    color: "#1B2A4A",
    marginBottom: 6,
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  legendLeft: { display: "flex", alignItems: "center", gap: 8 },
  legendDot: (color) => ({
    width: 14,
    height: 14,
    borderRadius: 3,
    background: color,
  }),
  legendText: {
    fontFamily: "Arial, sans-serif",
    fontSize: 10,
    color: "#333",
  },
  legendBadge: (color) => ({
    fontFamily: "Arial, sans-serif",
    fontSize: 5,
    fontWeight: 700,
    letterSpacing: 1,
    color: color,
  }),
  selCard: {
    background: "#fff",
    borderRadius: 8,
    padding: "6px 10px",
    color: "#1B2A4A",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: 0,
  },
  selTitle: {
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 8,
    letterSpacing: 2,
    color: "#1B2A4A",
    marginBottom: 4,
  },
  selRow: { marginBottom: 2 },
  selLabel: {
    fontFamily: "Arial, sans-serif",
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#666",
    fontWeight: 700,
  },
  selVal: {
    fontFamily: "Arial, sans-serif",
    fontSize: 10,
    color: "#1B2A4A",
    marginLeft: 6,
  },
  ctaBtn: (enabled) => ({
    marginTop: 6,
    width: "100%",
    padding: "6px 0",
    background: enabled ? "#C9A84C" : "#3A4A6A",
    color: enabled ? "#1B2A4A" : "#5A6A8A",
    border: "none",
    borderRadius: 4,
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 8,
    letterSpacing: 1.5,
    cursor: enabled ? "pointer" : "default",
    transition: "all 0.2s",
  }),
  policyCard: {
    background: "#fff",
    borderRadius: 8,
    padding: "6px 12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  policyTitle: {
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: 2,
    color: "#1B2A4A",
    marginBottom: 4,
  },
  policyText: {
    fontFamily: "Arial, sans-serif",
    fontSize: 10,
    color: "#666",
    lineHeight: 1.4,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(27,42,74,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalNavy: {
    background: "#1B2A4A",
    borderRadius: 12,
    padding: "36px 40px",
    width: 420,
    maxWidth: "90vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    color: "#fff",
    position: "relative",
  },
  modalTag: {
    fontFamily: "Arial, sans-serif",
    fontSize: 9,
    letterSpacing: 2,
    color: "#C9A84C",
    fontWeight: 700,
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
    marginTop: 6,
  },
  stepItem: (active, done) => ({
    fontFamily: "Arial, sans-serif",
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: 700,
    color: done ? "#C9A84C" : active ? "#fff" : "#5A6A8A",
    display: "flex",
    alignItems: "center",
    gap: 4,
  }),
  stepDot: (active, done) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: done ? "#C9A84C" : active ? "#fff" : "#3A4A6A",
  }),
  stepDivider: { flex: 1, height: 1, background: "#3A4A6A", maxWidth: 20 },
  counterWrap: { textAlign: "center", margin: "24px 0 8px" },
  counterRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 6,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "2px solid #C9A84C",
    background: "transparent",
    color: "#C9A84C",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  counterNum: {
    fontFamily: "Georgia, serif",
    fontSize: 52,
    fontWeight: "bold",
    color: "#fff",
    lineHeight: 1,
  },
  counterLabel: {
    fontFamily: "Arial, sans-serif",
    fontSize: 9,
    letterSpacing: 2,
    color: "#A0AABB",
    fontWeight: 700,
  },
  counterNote: {
    fontFamily: "Arial, sans-serif",
    fontSize: 11,
    color: "#A0AABB",
    marginBottom: 24,
    lineHeight: 1.5,
    textAlign: "center",
  },
  continueBtn: {
    width: "100%",
    padding: "14px 0",
    background: "#1B2A4A",
    color: "#fff",
    border: "2px solid #fff",
    borderRadius: 4,
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 2,
    cursor: "pointer",
    marginBottom: 10,
  },
  cancelBtn: {
    width: "100%",
    padding: "10px 0",
    background: "transparent",
    color: "#A0AABB",
    border: "none",
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 2,
    cursor: "pointer",
  },
  formLabel: {
    fontFamily: "Arial, sans-serif",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    color: "#A0AABB",
    marginBottom: 4,
    display: "block",
  },
  formInput: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 4,
    border: "1px solid #3A4A6A",
    background: "#0F1E38",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    fontSize: 12,
    marginBottom: 12,
    boxSizing: "border-box",
    outline: "none",
  },
  formRow: { display: "flex", gap: 10 },
  timerBar: {
    background: "#0F1E38",
    borderRadius: 6,
    padding: "8px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    fontSize: 10,
    fontFamily: "Arial, sans-serif",
    color: "#A0AABB",
    letterSpacing: 1,
  },
  timerNum: { color: "#C9A84C", fontWeight: 700, fontSize: 14 },
  infoBadge: {
    background: "#0F1E38",
    borderRadius: 6,
    padding: "7px 12px",
    display: "flex",
    gap: 12,
    marginBottom: 16,
    fontSize: 11,
    fontFamily: "Arial, sans-serif",
    color: "#A0AABB",
  },
  infoBadgeItem: { display: "flex", flexDirection: "column" },
  infoBadgeLabel: { fontSize: 8, letterSpacing: 1.5, color: "#5A6A8A", fontWeight: 700 },
  infoBadgeVal: { color: "#fff", fontWeight: 700, fontSize: 11 },
  reviewBtn: {
    width: "100%",
    padding: "13px 0",
    background: "#1B2A4A",
    color: "#fff",
    border: "2px solid #fff",
    borderRadius: 4,
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 2,
    cursor: "pointer",
    marginTop: 6,
  },
  reviewModal: {
    background: "#fff",
    borderRadius: 12,
    padding: "36px 40px",
    width: 440,
    maxWidth: "90vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  reviewTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B2A4A",
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: "Arial, sans-serif",
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: 700,
    color: "#C9A84C",
    marginBottom: 10,
    marginTop: 16,
  },
  reviewRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #F0EDE4",
    padding: "8px 0",
    fontFamily: "Arial, sans-serif",
    fontSize: 12,
  },
  reviewKey: { color: "#888" },
  reviewVal: { color: "#1B2A4A", fontWeight: 600, textAlign: "right" },
  pendingBadge: {
    background: "#FFF3E0",
    color: "#E8A838",
    borderRadius: 3,
    padding: "2px 8px",
    fontFamily: "Arial, sans-serif",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
  },
  editBtn: {
    flex: 1,
    padding: "12px 0",
    border: "2px solid #1B2A4A",
    background: "transparent",
    color: "#1B2A4A",
    borderRadius: 4,
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 2,
    cursor: "pointer",
  },
  submitBtn: {
    flex: 1,
    padding: "12px 0",
    border: "none",
    background: "#1B2A4A",
    color: "#fff",
    borderRadius: 4,
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 2,
    cursor: "pointer",
  },
  successModal: {
    background: "#fff",
    borderRadius: 12,
    padding: "48px 40px",
    width: 380,
    maxWidth: "90vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#E8F5EE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontSize: 28,
    color: "#4CAF79",
  },
  successTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B2A4A",
    marginBottom: 10,
  },
  successNote: {
    fontFamily: "Arial, sans-serif",
    fontSize: 12,
    color: "#777",
    lineHeight: 1.6,
    marginBottom: 20,
  },
  refCode: {
    background: "#1B2A4A",
    color: "#fff",
    borderRadius: 4,
    padding: "13px 20px",
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: 3,
    marginBottom: 8,
    display: "block",
    textAlign: "center",
  },
  refNote: {
    fontFamily: "Arial, sans-serif",
    fontSize: 10,
    color: "#AAA",
    marginBottom: 20,
    letterSpacing: 1,
  },
  backMapBtn: {
    width: "100%",
    padding: "11px 0",
    border: "2px solid #1B2A4A",
    background: "transparent",
    color: "#1B2A4A",
    borderRadius: 4,
    fontFamily: "Arial, sans-serif",
    fontWeight: 700,
    fontSize: 11,
    cursor: "pointer",
  },
};

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ["GUEST COUNT", "DETAILS", "CONFIRM"];
  return (
    <div style={s.stepRow}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
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
      <div style={s.modalNavy}>
        <div style={s.modalTag}>
          {mode === "individual" ? "INDIVIDUAL SEAT RESERVATION" : "WHOLE TABLE RESERVATION"}
        </div>
        <div style={s.modalTitle}>Reserve this table?</div>
        <StepIndicator step={1} />
        <div style={s.counterWrap}>
          <div style={s.counterRow}>
            <button style={s.counterBtn} onClick={() => setGuests((g) => Math.max(1, g - 1))}>−</button>
            <div style={s.counterNum}>{guests}</div>
            <button style={s.counterBtn} onClick={() => setGuests((g) => Math.min(capacity, g + 1))}>+</button>
          </div>
          <div style={s.counterLabel}>NUMBER OF GUESTS</div>
        </div>
        <div style={s.counterNote}>
          Table {tableData?.id} seats up to <strong style={{ color: "#fff" }}>{capacity} guests</strong>.<br />
          Each occupied seat will be marked <span style={{ color: "#E8A838", fontWeight: 700 }}>Pending</span> under your booking.
        </div>
        <button style={s.continueBtn} onClick={() => onContinue(guests)}>CONTINUE</button>
        <button style={s.cancelBtn} onClick={onCancel}>CANCEL</button>
      </div>
    </div>
  );
}

function ModalDetails({ tableData, mode, guests, onReview, onCancel }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    eventDate: "", eventTime: "", specialRequests: "",
  });
  const [timer] = useState("24:00");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const allFilled = form.firstName && form.lastName && form.email && form.phone && form.eventDate;

  return (
    <div style={s.overlay}>
      <div style={s.modalNavy}>
        <div style={s.modalTag}>STEP 2 OF 3 · TABLE RESERVATION</div>
        <div style={s.modalTitle}>Your Information</div>
        <StepIndicator step={2} />
        <div style={s.timerBar}>
          <span>Seat is being held for you<br /><span style={{ fontSize: 9 }}>Complete this form before the timer expires</span></span>
          <span style={s.timerNum}>{timer}<span style={{ fontSize: 9, color: "#A0AABB" }}>min</span></span>
        </div>
        <div style={s.infoBadge}>
          <div style={s.infoBadgeItem}>
            <span style={s.infoBadgeLabel}>ROOM</span>
            <span style={s.infoBadgeVal}>{ROOM}</span>
          </div>
          <div style={s.infoBadgeItem}>
            <span style={s.infoBadgeLabel}>TABLE</span>
            <span style={s.infoBadgeVal}>{tableData?.id || "T1"}</span>
          </div>
          <div style={s.infoBadgeItem}>
            <span style={s.infoBadgeLabel}>GUESTS</span>
            <span style={s.infoBadgeVal}>{guests}</span>
          </div>
        </div>
        <div style={s.formRow}>
          <div style={{ flex: 1 }}>
            <label style={s.formLabel}>FIRST NAME *</label>
            <input style={s.formInput} value={form.firstName} onChange={set("firstName")} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.formLabel}>LAST NAME *</label>
            <input style={s.formInput} value={form.lastName} onChange={set("lastName")} />
          </div>
        </div>
        <label style={s.formLabel}>EMAIL ADDRESS *</label>
        <input style={s.formInput} value={form.email} onChange={set("email")} type="email" />
        <label style={s.formLabel}>PHONE NUMBER *</label>
        <input style={s.formInput} value={form.phone} onChange={set("phone")} type="tel" />
        <div style={s.formRow}>
          <div style={{ flex: 1 }}>
            <label style={s.formLabel}>EVENT DATE *</label>
            <input style={s.formInput} value={form.eventDate} onChange={set("eventDate")} type="date" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.formLabel}>EVENT TIME *</label>
            <input style={s.formInput} value={form.eventTime} onChange={set("eventTime")} type="time" />
          </div>
        </div>
        <label style={s.formLabel}>SPECIAL REQUESTS</label>
        <textarea style={{ ...s.formInput, resize: "vertical", minHeight: 56 }} value={form.specialRequests} onChange={set("specialRequests")} />
        <button style={{ ...s.reviewBtn, opacity: allFilled ? 1 : 0.5 }} disabled={!allFilled} onClick={() => onReview(form)}>
          REVIEW BOOKING
        </button>
      </div>
    </div>
  );
}

function ModalReview({ form, guests, tableData, onSubmit, onEdit }) {
  const formatTime = (t) => {
    if (!t) return "Pending";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };
  return (
    <div style={s.overlay}>
      <div style={s.reviewModal}>
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: 9, letterSpacing: 2, color: "#C9A84C", fontWeight: 700, marginBottom: 6 }}>
          STEP 3 OF 3 · TABLE RESERVATION
        </div>
        <div style={s.reviewTitle}>Review Your Booking</div>
        <StepIndicator step={3} />
        <div style={s.sectionLabel}>RESERVATION DETAILS</div>
        {[
          ["Venue", "The Bellevue Manila"],
          ["Room", `${WING} — ${ROOM}`],
          ["Table", `Table ${tableData?.id || "T1"}`],
          ["Number of Guests", `${guests} guests`],
          ["Event Date", form.eventDate || "—"],
          ["Event Time", form.eventTime ? formatTime(form.eventTime) : null],
        ].map(([k, v]) => (
          <div key={k} style={s.reviewRow}>
            <span style={s.reviewKey}>{k}</span>
            {k === "Event Time" && !form.eventTime
              ? <span style={s.pendingBadge}>Pending</span>
              : <span style={s.reviewVal}>{v}</span>
            }
          </div>
        ))}
        <div style={s.sectionLabel}>GUEST INFORMATION</div>
        {[
          ["Full Name", `${form.firstName} ${form.lastName}`],
          ["Email", form.email],
          ["Phone", form.phone],
          ["Special Requests", form.specialRequests || "None"],
        ].map(([k, v]) => (
          <div key={k} style={s.reviewRow}>
            <span style={s.reviewKey}>{k}</span>
            <span style={s.reviewVal}>{v}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button style={s.editBtn} onClick={onEdit}>EDIT DETAILS</button>
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
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [modal, setModal] = useState(null);
  const [guests, setGuests] = useState(1);
  const [formData, setFormData] = useState(null);
  const [refCode] = useState(generateRef());

  // ── Load persistent seat map data (falls back to default TABLE_T1) ──────────
  const [tableData, setTableData] = useState(() => {
    return getRoomData(WING, ROOM, TABLE_T1);
  });

  // ── Subscribe to live changes pushed by admin (SeatMap in editMode) ─────────
  useEffect(() => {
    const unsubscribe = subscribeToSeatMapChanges(({ wing, room, data }) => {
      if (wing === WING && room === ROOM) {
        // data may be a single table object or an array
        const normalized = Array.isArray(data) ? data[0] : data;
        setTableData(normalized);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTableClick = () => { setSelectedTable(tableData); setModal("guestCount"); };
  const handleSeatClick  = (seat) => setSelectedSeat(seat);
  const handleGuestContinue = (g) => { setGuests(g); setModal("details"); };
  const handleReview = (form) => { setFormData(form); setModal("review"); };

  const handleSubmit = () => {
    // TODO: send reservation to backend / Firebase
    setModal("success");
  };

  const handleBack = () => {
    setModal(null);
    setSelectedSeat(null);
    setSelectedTable(null);
  };

  const getResponsiveStyles = () => {
    const width = windowSize.width;
    if (width < 480) {
      return {
        page: { padding: "16px 12px", maxWidth: "100%" },
        layout: { flexDirection: "row", gap: 12 },
        mapCard: { padding: 16, minWidth: "auto", flex: 1 },
        rightPanel: { width: "200px", gap: 12, flexShrink: 0 },
        pageTitle: { fontSize: 22 },
      };
    } else if (width < 768) {
      return {
        page: { padding: "24px 20px", maxWidth: "100%" },
        layout: { flexDirection: "row", gap: 16 },
        mapCard: { padding: 20, minWidth: "auto", flex: 1 },
        rightPanel: { width: "240px", gap: 14, flexShrink: 0 },
        pageTitle: { fontSize: 26 },
      };
    } else {
      return {
        page: { padding: "32px 40px", maxWidth: 1100 },
        layout: { flexDirection: "row", gap: 28 },
        mapCard: { padding: 24, minWidth: 320, flex: 1 },
        rightPanel: { width: "280px", gap: 14, flexShrink: 0 },
        pageTitle: { fontSize: 30 },
      };
    }
  };

  const responsive = getResponsiveStyles();
  const isMobile = windowSize.width < 480;

  const selSeat  = mode === "individual" ? (selectedSeat ? `Seat ${selectedSeat.num}` : "—") : "—";
  const selTable = selectedTable ? tableData.id : "—";
  const canProceed = mode === "individual" ? !!selectedSeat : false;

  return (
    <div style={s.root}>
      <MainWingNavbar active="ALABANG FUNCTION ROOM" />

      <div style={{ ...s.page, ...responsive.page }}>
        {/* Header / back button */}
        <button
          onClick={() => navigate("/", { state: { scrollTo: "event" } })}
          title="Back to home"
          aria-label="Back to home"
          style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#ffffff", borderRadius: 999, border: "2px solid #C9A84C", color: "#C9A84C", cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", fontSize: 16, marginRight: 6, marginBottom: 20 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B89635"; e.currentTarget.style.color = "#B89635"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }}
        >
          ←
        </button>
        <div style={{ color: "#C9A84C", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>
          ALL VENUES
        </div>

        {/* Title */}
        <h1 style={{ ...s.pageTitle, fontSize: 26 }}>Alabang Function Room</h1>
        <div style={{ ...s.pageSubtitle, fontSize: 10, marginTop: 5 }}>
          Book your preferred table in the Main Wing of Alabang Function Room
        </div>

        {/* Toggle bar */}
        <div style={{ ...s.toggleBar, flexDirection: "row", alignItems: "center", marginBottom: 0, flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <span style={{ ...s.toggleLabel, fontSize: isMobile ? 8 : 10, whiteSpace: "nowrap" }}>
            I WANT TO RESERVE A:
          </span>
          <div style={s.togglePillGroup}>
            <button
              style={{ ...s.togglePillBtn(mode === "whole"), padding: isMobile ? "6px 14px" : "10px 28px", fontSize: isMobile ? 8 : 10, marginLeft: isMobile ? 8 : 180 }}
              onClick={() => { setMode("whole"); setSelectedSeat(null); }}
            >
              WHOLE TABLE
            </button>
            <button
              style={{ ...s.togglePillBtn(mode === "individual"), padding: isMobile ? "6px 14px" : "10px 28px", fontSize: isMobile ? 8 : 10 }}
              onClick={() => { setMode("individual"); setSelectedTable(null); }}
            >
              INDIVIDUAL SEAT
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ ...s.layout, ...responsive.layout, overflowX: "auto" }}>
          {/* Seat Map card */}
          <div style={{ ...s.mapCard, ...responsive.mapCard, minWidth: "300px" }}>
            <div style={{ ...s.mapTitle, fontSize: isMobile ? 11 : 13 }}>ALABANG FUNCTION ROOM</div>
            <SeatMap
              tableData={tableData}
              mode={mode}
              selectedSeat={selectedSeat}
              onSeatClick={handleSeatClick}
              onTableClick={handleTableClick}
              windowWidth={windowSize.width}
              wing={WING}
              room={ROOM}
            />
          </div>

          {/* Right panel */}
          <div style={{ ...s.rightPanel, ...responsive.rightPanel, minWidth: "200px" }}>
            {/* Legend */}
            <div style={{ ...s.legendCard, padding: isMobile ? "12px 16px" : "16px 20px" }}>
              <div style={{ ...s.legendTitle, fontSize: isMobile ? 9 : 10 }}>STATUS LEGEND</div>
              {Object.entries(STATUS_COLORS).map(([key, color]) => (
                <div key={key} style={{ ...s.legendRow, marginBottom: isMobile ? 6 : 8 }}>
                  <div style={s.legendLeft}>
                    <div style={{ ...s.legendDot(color), width: isMobile ? 12 : 14, height: isMobile ? 12 : 14 }} />
                    <span style={{ ...s.legendText, fontSize: isMobile ? 11 : 12 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </div>
                  <span style={{ ...s.legendBadge(color), fontSize: isMobile ? 8 : 9 }}>{STATUS_LABELS[key]}</span>
                </div>
              ))}
            </div>

            {/* Selection */}
            <div style={{ ...s.selCard, padding: isMobile ? "12px 16px" : "16px 20px" }}>
              <div style={{ ...s.selTitle, fontSize: isMobile ? 8 : 9 }}>YOUR SELECTION</div>
              <div style={s.selRow}>
                <span style={{ ...s.selLabel, fontSize: isMobile ? 8 : 9 }}>SEAT:</span>
                <span style={{ ...s.selVal, fontSize: isMobile ? 11 : 12 }}>{selSeat}</span>
              </div>
              <div style={s.selRow}>
                <span style={{ ...s.selLabel, fontSize: isMobile ? 8 : 9 }}>TABLE:</span>
                <span style={{ ...s.selVal, fontSize: isMobile ? 11 : 12 }}>{selTable}</span>
              </div>
              {mode === "whole" && (
                <div style={{ marginTop: 6 }}>
                  <button
                    style={{ ...s.ctaBtn(true), fontSize: isMobile ? 7 : 8 }}
                    onClick={() => setModal("guestCount")}
                    onMouseEnter={(e) => { e.target.style.background = "#B89635"; }}
                    onMouseLeave={(e) => { e.target.style.background = "#C9A84C"; }}
                  >
                    RESERVE THIS TABLE
                  </button>
                </div>
              )}
              {mode === "individual" && (
                <button
                  style={{ ...s.ctaBtn(canProceed), fontSize: isMobile ? 7 : 8 }}
                  onClick={canProceed ? () => setModal("guestCount") : undefined}
                >
                  RESERVE THIS SEAT
                </button>
              )}
            </div>

            {/* Policy */}
            <div style={{ ...s.policyCard, padding: isMobile ? "12px 16px" : "14px 18px" }}>
              <div style={{ ...s.policyTitle, fontSize: isMobile ? 8 : 9 }}>HOTEL POLICY</div>
              <div style={{ ...s.policyText, fontSize: isMobile ? 9 : 10, lineHeight: isMobile ? 1.5 : 1.6 }}>
                Pending tables are held for one (1) day. After the expiry the table returns to available.<br /><br />
                Reservations are confirmed only after approval.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {modal === "guestCount" && (
        <ModalGuestCount
          tableData={tableData}
          mode={mode}
          onContinue={handleGuestContinue}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === "details" && (
        <ModalDetails
          tableData={tableData}
          mode={mode}
          guests={guests}
          onReview={handleReview}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === "review" && formData && (
        <ModalReview
          form={formData}
          guests={guests}
          tableData={tableData}
          onSubmit={handleSubmit}
          onEdit={() => setModal("details")}
        />
      )}
      {modal === "success" && (
        <ModalSuccess refCode={refCode} onBack={handleBack} />
      )}
    </div>
  );
}