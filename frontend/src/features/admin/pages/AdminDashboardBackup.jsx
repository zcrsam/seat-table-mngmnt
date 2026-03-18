import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Components
import AdminNavbar from "../components/AdminNavbar";
import ReservationStats from "../components/ReservationStats";
import ReservationTable from "../components/ReservationTable";
import SeatMapViewer from "../components/SeatMapViewer";

// API Services
import { authAPI } from "../../../services/authAPI";
import { reservationAPI } from "../../../services/reservationAPI";
import Echo from 'laravel-echo';

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

const F = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'DM Sans', sans-serif",
  mono: "'Fira Code', monospace",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("reservations");
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    lastPage: 1,
  });

  const echoRef = useRef(null);

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
      
      // Transform API data to match component structure
      const transformedReservations = reservationsData.map(reservation => {
        let dateSubmitted = '';
        let timeSubmitted = '';
        
        if (reservation.submittedAt) {
          // Handle newline characters in submittedAt - extract date and time more robustly
          const cleanSubmittedAt = reservation.submittedAt.replace(/\s+/g, ' ').trim();
          if (cleanSubmittedAt.includes(' · ')) {
            const parts = cleanSubmittedAt.split(' · ');
            dateSubmitted = parts[0]?.trim() || '';
            timeSubmitted = parts[1]?.trim() || '';
          } else {
            dateSubmitted = cleanSubmittedAt;
          }
        }
        
        return {
          id: reservation.id || 'unknown',
          guest: reservation.name || 'Unknown',
          email: reservation.email || '',
          venue: reservation.room || 'Unknown Venue',
          eventDate: reservation.eventDate || '',
          dateSubmitted,
          timeSubmitted,
          guests: reservation.guests || 0,
          type: reservation.type === 'whole' ? 'TABLE' : 'SEAT',
          seats: reservation.type === 'whole' 
            ? `${reservation.table || 'T?'} · ${reservation.guests || 0} seats`
            : `${reservation.table || 'T?'} · ${reservation.seat || 'Seat?'}`,
          status: reservation.status || 'pending',
        };
      });
      
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
      console.log('New reservation via WebSocket (Backup):', e.reservation);
      fetchData(); // Refresh dashboard data
    });

    // Reservation updated (approved/rejected)
    channel.listen('ReservationUpdated', (e) => {
      console.log('Reservation updated via WebSocket (Backup):', e.reservation);
      fetchData(); // Refresh dashboard data
    });

    // Reservation deleted
    channel.listen('ReservationDeleted', (e) => {
      console.log('Reservation deleted via WebSocket (Backup):', e.id);
      fetchData(); // Refresh dashboard data
    });

    // Seat/Table reservation events
    channel.listen('SeatReserved', (e) => {
      console.log('Seat reserved via WebSocket (Backup):', e);
      fetchData(); // Refresh dashboard data
    });

    channel.listen('TableReserved', (e) => {
      console.log('Table reserved via WebSocket (Backup):', e);
      fetchData(); // Refresh dashboard data
    });

    // Connection status
    echo.connector.pusher.connection.bind('connected', () => {
      console.log('Backup Dashboard WebSocket connected');
      setWsConnected(true);
    });

    echo.connector.pusher.connection.bind('disconnected', () => {
      console.log('Backup Dashboard WebSocket disconnected');
      setWsConnected(false);
    });

    echo.connector.pusher.connection.bind('error', (err) => {
      console.log('Backup Dashboard WebSocket error:', err);
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

  // Debug info
  console.log('Rendering AdminDashboard:', {
    reservations: reservations?.length,
    stats,
    loading,
    pagination
  });

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handlePerPageChange = (newPerPage) => {
    setPagination(prev => ({ ...prev, perPage: newPerPage, currentPage: 1 }));
  };

  const handleLogout = () => {
    authAPI.logout();
    // Redirect to login page
    window.location.href = '/admin/login';
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [reservationsResponse, statsData] = await Promise.all([
        reservationAPI.getAll(`?page=${pagination.currentPage}&per_page=${pagination.perPage}`),
        reservationAPI.getStats()
      ]);
      
      // Handle both paginated and non-paginated responses
      const reservationsData = reservationsResponse.data || reservationsResponse;
      
      // Update pagination state
      if (reservationsResponse.pagination) {
        setPagination(prev => ({
          ...prev,
          currentPage: reservationsResponse.pagination.current_page,
          lastPage: reservationsResponse.pagination.last_page,
        }));
      }
      
      // Transform API data to match component structure
      const transformedReservations = reservationsData.map(reservation => {
        let dateSubmitted = '';
        let timeSubmitted = '';
        
        if (reservation.submittedAt) {
          // Handle newline characters in submittedAt - extract date and time more robustly
          const cleanSubmittedAt = reservation.submittedAt.replace(/\s+/g, ' ').trim();
          if (cleanSubmittedAt.includes(' · ')) {
            const parts = cleanSubmittedAt.split(' · ');
            dateSubmitted = parts[0]?.trim() || '';
            timeSubmitted = parts[1]?.trim() || '';
          } else {
            dateSubmitted = cleanSubmittedAt;
          }
        }

        return {
          id: reservation.id || 'unknown',
          guest: reservation.name || 'Unknown',
          email: reservation.email || '',
          venue: reservation.room || 'Unknown Venue',
          eventDate: reservation.eventDate || '',
          dateSubmitted,
          timeSubmitted,
          guests: reservation.guests || 0,
          type: reservation.type === 'whole' ? 'TABLE' : 'SEAT',
          seats: reservation.type === 'whole' 
            ? `${reservation.table || 'T?'} · ${reservation.guests || 0} seats`
            : `${reservation.table || 'T?'} · ${reservation.seat || 'Seat?'}`,
          status: reservation.status || 'pending',
        };
      });
      
      setReservations(transformedReservations);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservationId) => {
    try {
      console.log('Approving reservation:', reservationId);
      
      // Call real API
      const response = await reservationAPI.approve(reservationId);
      console.log('API response:', response);
      
      if (response.success) {
        // Refresh data to get latest stats
        await refreshData();
        alert('Reservation approved successfully!');
      } else {
        console.error('API returned error:', response);
        alert('Failed to approve reservation. Please try again.');
      }
    } catch (error) {
      console.error('Failed to approve reservation:', error);
      alert(`Failed to approve reservation: ${error.message || 'Unknown error'}`);
    }
  };

  const handleReject = async (reservationId) => {
    try {
      // Call real API
      const response = await reservationAPI.reject(reservationId);
      
      if (response.success) {
        // Refresh data to get latest stats
        await refreshData();
        alert('Reservation rejected successfully!');
      } else {
        alert('Failed to reject reservation. Please try again.');
      }
    } catch (error) {
      console.error('Failed to reject reservation:', error);
      alert('Failed to reject reservation. Please try again.');
    }
  };

  const handleDelete = async (reservationId) => {
    if (!window.confirm('Are you sure you want to delete this reservation? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Call real API
      const response = await reservationAPI.delete(reservationId);
      
      if (response.success) {
        // Refresh data to get latest stats
        await refreshData();
        alert('Reservation deleted successfully!');
      } else {
        alert('Failed to delete reservation. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete reservation:', error);
      alert('Failed to delete reservation. Please try again.');
    }
  };

  const tabs = [
    { id: "reservations", label: "📋 Reservations", icon: "📋" },
    { id: "seatMap", label: "🗺️ Seat Map", icon: "🗺️" },
    { id: "stats", label: "📊 Quick Stats", icon: "📊" },
  ];

  const filterReservations = (status) => {
    return reservations.filter(r => status === 'all' ? r : r.status === status);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.body,
      }}>
        <div style={{ textAlign: "center", color: C.textLight }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            border: `3px solid ${C.secondary}`,
            borderTop: `3px solid ${C.accent}`,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }}></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.light, fontFamily: F.body }}>
      {/* Header */}
      <AdminNavbar onLogout={handleLogout} />

      {/* Main Content */}
      <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ 
            marginBottom: "30px", 
            textAlign: "center",
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
            padding: "30px",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <h1 style={{ 
            margin: 0, 
            fontSize: "clamp(28px,4vw,42px)", 
            fontFamily: F.heading,
            fontWeight: 700,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}>
            The Bellevue Manila
          </h1>
          <p style={{ 
            margin: "10px 0 0 0", 
            fontSize: "16px", 
            opacity: 0.9,
            maxWidth: "600px",
          }}>
            ADMIN PANEL
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          marginBottom: "30px",
          borderBottom: `2px solid ${C.border}`,
          paddingBottom: "2px",
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "15px 20px",
                background: activeTab === tab.id ? C.primary : "transparent",
                color: activeTab === tab.id ? "white" : C.text,
                border: "none",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.3s ease",
                fontFamily: F.body,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.dark;
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = activeTab === tab.id ? C.primary : "transparent";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <span style={{ marginRight: "8px" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            minHeight: "500px",
          }}
        >
          {activeTab === "reservations" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, color: C.text, fontFamily: F.heading }}>
                  Reservation Management
                </h2>
                <div style={{ display: "flex", gap: "15px" }}>
                  <button
                    onClick={refreshData}
                    style={{
                      padding: "8px 16px",
                      background: C.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                    title="Refresh data"
                  >
                    🔄 Refresh
                  </button>
                  <button
                    style={{
                      padding: "8px 16px",
                      background: C.success,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                    onClick={() => setSelectedReservation(null)}
                  >
                    + New Reservation
                  </button>
                </div>
              </div>
              <ReservationTable 
                reservations={reservations}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onSelect={setSelectedReservation}
              />
              
              {/* Pagination Controls */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginTop: "20px",
                padding: "0 25px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "14px", color: C.muted }}>
                    Page {pagination.currentPage} of {pagination.lastPage}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    style={{
                      padding: "6px 12px",
                      background: pagination.currentPage <= 1 ? C.muted : C.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: pagination.currentPage <= 1 ? "not-allowed" : "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.lastPage}
                    style={{
                      padding: "6px 12px",
                      background: pagination.currentPage >= pagination.lastPage ? C.muted : C.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: pagination.currentPage >= pagination.lastPage ? "not-allowed" : "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Next
                  </button>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "14px", color: C.muted }}>
                    Show:
                  </span>
                  <select
                    value={pagination.perPage}
                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                    style={{
                      padding: "4px 8px",
                      border: `1px solid ${C.border}`,
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "seatMap" && (
            <div>
              <h2 style={{ margin: "0 0 20px 0", color: C.text, fontFamily: F.heading }}>
                Seat Map Viewer
              </h2>
              <SeatMapViewer venueId={1} />
            </div>
          )}

          {activeTab === "stats" && (
            <ReservationStats stats={stats} />
          )}
        </motion.div>
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: C.text, fontFamily: F.heading }}>
                Reservation Details
              </h2>
              <button
                onClick={() => setSelectedReservation(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: C.muted,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <strong style={{ color: C.text }}>Reference Code:</strong>
                <div style={{ color: C.muted }}>{selectedReservation.id}</div>
              </div>
              <div>
                <strong style={{ color: C.text }}>Guest:</strong>
                <div style={{ color: C.muted }}>{selectedReservation.guest}</div>
              </div>
              <div>
                <strong style={{ color: C.text }}>Email:</strong>
                <div style={{ color: C.muted }}>{selectedReservation.email}</div>
              </div>
              <div>
                <strong style={{ color: C.text }}>Venue:</strong>
                <div style={{ color: C.muted }}>{selectedReservation.venue}</div>
              </div>
              <div>
                <strong style={{ color: C.text }}>Event Date:</strong>
                <div style={{ color: C.muted }}>{selectedReservation.eventDate}</div>
              </div>
              <div>
                <strong style={{ color: C.text }}>Guests:</strong>
                <div style={{ color: C.muted }}>{selectedReservation.guests}</div>
              </div>
              <div>
                <strong style={{ color: C.text }}>Type:</strong>
                <div style={{ color: C.muted }}>{selectedReservation.type}</div>
              </div>
              <div>
                <strong style={{ color: C.text }}>Status:</strong>
                <div style={{ 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: selectedReservation.status === 'pending' ? C.warning :
                              selectedReservation.status === 'approved' ? C.success :
                              selectedReservation.status === 'rejected' ? C.danger : C.muted,
                  color: 'white'
                }}>
                  {selectedReservation.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
