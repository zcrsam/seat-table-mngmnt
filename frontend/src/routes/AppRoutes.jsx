import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import HomePage from "../features/client/pages/HomePage";
import VenuesPage from "../features/client/pages/VenuesPage";
import AlabangReserve from "../features/client/pages/AlabangReserve";
import LagunaBallroom from "../features/client/pages/LagunaBallroom";
import FunctionRoom2020 from "../features/client/pages/FunctionRoom2020";
import BusinessCenter from "../features/client/pages/BusinessCenter";
import AdminReserve from "../features/admin/pages/AdminReserve";
import AdminDashboard from "../features/admin/pages/Dashboard";       
import NotificationDashboard from "../features/admin/pages/Notifications";   

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/venues" element={<><Navbar /><VenuesPage /></>} />
        <Route path="/reserve/:routeId" element={<><Navbar /><div>Reserve Page - Coming Soon</div></>} />
        <Route path="/alabang-reserve" element={<AlabangReserve />} />
        <Route path="/laguna-ballroom" element={<LagunaBallroom />} />
        <Route path="/function-room-2020" element={<FunctionRoom2020 />} />
        <Route path="/business-center" element={<BusinessCenter />} />
        <Route path="/admin" element={<AdminReserve />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />     
        <Route path="/admin/notifications" element={<NotificationDashboard />} />   
      </Routes>
    </BrowserRouter>
  );
}