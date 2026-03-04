import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import VenuesPage from "../pages/client/VenuesPage";
import AlabangReserve from "../pages/AlabangReserve";
import AdminReserve from "../pages/admin/AdminReserve";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/venues" element={<><Navbar /><VenuesPage /></>} />
        <Route path="/reserve/:routeId" element={<><Navbar /><div>Reserve Page - Coming Soon</div></>} />
        <Route path="/alabang-reserve" element={<AlabangReserve />} />
        <Route path="/admin" element={<AdminReserve />} />
      </Routes>
    </BrowserRouter>
  );
}
