import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import VenuesPage from "../pages/VenuesPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/reserve/:routeId" element={<div>Reserve Page - Coming Soon</div>} />
      </Routes>
    </BrowserRouter>
  );
}
