import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import HomePage from "../features/client/pages/HomePage";
import VenuesPage from "../features/client/pages/VenuesPage";
import ManageBooking from "../features/client/pages/ManageBooking";
import AlabangReserve from "../features/client/pages/AlabangReserve";
import LagunaReserv1e from "../features/client/pages/LagunaReserv1e";
import LagunaReserve2 from "../features/client/pages/LagunaReserve2";
import TwentyTwentyReserveA from "../features/client/pages/TwentyTwentyReserveA";
import TwentyTwentyReserveB from "../features/client/pages/TwentyTwentyReserveB";
import TwentyTwentyReserveC from "../features/client/pages/TwentyTwentyReserveC";
import BusinessCenterReserve from "../features/client/pages/BusinessCenterReserve";
import FunctionRoom2020 from "../features/client/pages/FunctionRoom2020";
import BusinessCenter from "../features/client/pages/BusinessCenter";
import ReservationDashboard from "../features/admin/pages/ReservationDashboard";
import SeatMapEditor from "../features/admin/pages/SeatMapEditor";
import NotificationDashboard from "../features/admin/pages/Notifications";
import CancelledDashboard from "../features/admin/pages/CancelledDashboard";
import ForgotCode from "../features/client/pages/ForgotCode";
import LoginPage from "../features/auth/pages/LoginPage";
import { authAPI } from "../services/authAPI";

function RequireAdminAuth({ children }) {
  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminEntry() {
  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/venues" element={<><Navbar /><VenuesPage /></>} />
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/venues" element={<><Navbar /><VenuesPage /></>} />
        <Route path="/manage-booking" element={<ManageBooking />} />
        <Route path="/alabang-reserve" element={<AlabangReserve />} />
        <Route path="/laguna-reserv1e" element={<LagunaReserv1e />} />
        <Route path="/laguna-reserv2e" element={<LagunaReserve2 />} />
        <Route path="/twenty-twenty-a" element={<TwentyTwentyReserveA />} />
        <Route path="/twenty-twenty-b" element={<TwentyTwentyReserveB />} />
        <Route path="/twenty-twenty-c" element={<TwentyTwentyReserveC />} />
        <Route path="/business-center-reserve" element={<BusinessCenterReserve />} />
        <Route path="/reserve/:routeId" element={<><Navbar /><div>Reserve Page - Coming Soon</div></>} />
        <Route path="/function-room-2020" element={<FunctionRoom2020 />} />
        <Route path="/business-center" element={<BusinessCenter />} />
        <Route path="/admin" element={<AdminEntry />} />
        <Route
          path="/admin/reservations"
          element={
            <RequireAdminAuth>
              <ReservationDashboard />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/cancelled"
          element={
            <RequireAdminAuth>
              <CancelledDashboard />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/seatmap"
          element={
            <RequireAdminAuth>
              <SeatMapEditor />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <RequireAdminAuth>
              <NotificationDashboard />
            </RequireAdminAuth>
          }
        />
        <Route path="/forgot-code" element={<ForgotCode />} />  
        <Route path="/login" element={<LoginPage />} />  

      </Routes>
    </BrowserRouter>
  );
}