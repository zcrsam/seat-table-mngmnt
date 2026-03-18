import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// API Services
import { authAPI } from "../../../services/authAPI";
import { reservationAPI } from "../../../services/reservationAPI";

// Styles
const C = {
  primary: "#1B2A4A",
  secondary: "#C9A74D", 
  accent: "#E74C3C",
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

export default function AdminDashboard() {
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    lastPage: 1,
  });

  // Fetch reservations and stats - moved outside useEffect
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from backend API with pagination
      const [reservationsResponse, statsData] = await Promise.all([
        reservationAPI.getAll(`?page=${pagination.currentPage}&per_page=${pagination.perPage}`),
        reservationAPI.getStats()
      ]);
      
      console.log('API Response:', reservationsResponse);
      
      // Handle both paginated and non-paginated responses
      const reservationsData = reservationsResponse.data || reservationsResponse;
      
      if (!Array.isArray(reservationsData)) {
        console.error('Expected array but got:', typeof reservationsData, reservationsData);
        setReservations([]);
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        });
        return;
      }
      
      // Update pagination state
      if (reservationsResponse.pagination) {
        setPagination(prev => ({
          ...prev,
          currentPage: reservationsResponse.pagination.current_page,
          lastPage: reservationsResponse.pagination.last_page,
        }));
      }
      
      // Simple data transformation
      const transformedReservations = reservationsData.map(reservation => ({
        id: reservation.id || 'unknown',
        guest: reservation.name || 'Unknown',
        email: reservation.email || '',
        venue: reservation.room || 'Unknown Venue',
        eventDate: reservation.eventDate || '',
        dateSubmitted: reservation.submittedAt ? reservation.submittedAt.split(' · ')[0] || '' : '',
        timeSubmitted: reservation.submittedAt ? reservation.submittedAt.split(' · ')[1] || '' : '',
        guests: reservation.guests || 0,
        type: reservation.type === 'whole' ? 'TABLE' : 'SEAT',
        seats: reservation.type === 'whole' 
          ? `${reservation.table || 'T?'} · ${reservation.guests || 0} seats`
          : `${reservation.table || 'T?'} · ${reservation.seat || 'Seat?'}`,
        status: reservation.status || 'pending',
      }));
      
      console.log('Transformed Reservations:', transformedReservations);
      
      setReservations(transformedReservations);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // Set empty state on error to prevent white screen
      setReservations([]);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch data when pagination changes
  useEffect(() => {
    if (pagination.currentPage > 0 && pagination.perPage > 0) {
      fetchData();
    }
  }, [pagination.currentPage, pagination.perPage]);

  // ── WebSocket Setup ───────────────────────────────────────────────────────
  useEffect(() => {
    // Check if Pusher credentials are available
    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
    
    // Only initialize WebSocket if credentials are properly set
    if (!echoRef.current && pusherKey && pusherKey !== 'your_key') {
      echoRef.current = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: pusherCluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
      });
    }

    const echo = echoRef.current;

    // Only proceed if WebSocket is initialized
    if (!echo) return;

    // Listen for reservation events
    const channel = echo.channel('reservations');
    
    // New reservation created
    channel.listen('ReservationCreated', (e) => {
      console.log('New reservation via WebSocket (Simple):', e.reservation);
      fetchData(); // Refresh dashboard data
    });

    // Reservation updated (approved/rejected)
    channel.listen('ReservationUpdated', (e) => {
      console.log('Reservation updated via WebSocket (Simple):', e.reservation);
      fetchData(); // Refresh dashboard data
    });

    // Reservation deleted
    channel.listen('ReservationDeleted', (e) => {
      console.log('Reservation deleted via WebSocket (Simple):', e.id);
      fetchData(); // Refresh dashboard data
    });

    // Seat/Table reservation events
    channel.listen('SeatReserved', (e) => {
      console.log('Seat reserved via WebSocket (Simple):', e);
      fetchData(); // Refresh dashboard data
    });

    channel.listen('TableReserved', (e) => {
      console.log('Table reserved via WebSocket (Simple):', e);
      fetchData(); // Refresh dashboard data
    });

    // Connection status
    echo.connector.pusher.connection.bind('connected', () => {
      console.log('Simple Dashboard WebSocket connected');
      setWsConnected(true);
    });

    echo.connector.pusher.connection.bind('disconnected', () => {
      console.log('Simple Dashboard WebSocket disconnected');
      setWsConnected(false);
    });

    echo.connector.pusher.connection.bind('error', (err) => {
      console.log('Simple Dashboard WebSocket error:', err);
      setWsConnected(false);
    });

    return () => {
      channel.stopListening('ReservationCreated');
      channel.stopListening('ReservationUpdated');
      channel.stopListening('ReservationDeleted');
      channel.stopListening('SeatReserved');
      channel.stopListening('TableReserved');
    };
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    // Redirect to login page
    window.location.href = '/admin/login';
  };

  // Handle loading state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px",
        color: C.primary
      }}>
        Loading admin dashboard...
      </div>
    );
  }

  // Error boundary fallback
  if (!reservations || !stats) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px",
        color: C.danger,
        flexDirection: "column",
        gap: "20px"
      }}>
        <div>Error loading dashboard</div>
        <div>Reservations: {JSON.stringify(reservations)}</div>
        <div>Stats: {JSON.stringify(stats)}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            background: C.primary,
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          color: "white",
          padding: "20px 30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ 
          margin: 0, 
          fontSize: "clamp(28px,4vw,42px)", 
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
          The Bellevue Manila
        </h1>
        <p style={{ 
          fontSize: "16px", 
          opacity: 0.9,
          margin: "10px 0 0 0", 
        }}>
          ADMIN PANEL
        </p>
      </motion.div>

      {/* Debug Info */}
      <div style={{ 
        background: "rgba(255,255,255,0.1)", 
        padding: "20px", 
        borderRadius: "8px", 
        margin: "20px 0" 
      }}>
        <h3>Debug Information</h3>
        <div>Total Reservations: {reservations.length}</div>
        <div>Stats: {JSON.stringify(stats)}</div>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Current Page: {pagination.currentPage}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            background: C.primary,
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
