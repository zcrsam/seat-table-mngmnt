import { useState, useEffect } from "react";
import LoginScreen from "../../auth/pages/LoginPage";
import Dashboard from "../pages/Dashboard";

export default function AdminReserve() {
  // Check localStorage for existing login state on component mount
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });

  // Update localStorage when login state changes
  useEffect(() => {
    localStorage.setItem('admin_logged_in', loggedIn.toString());
  }, [loggedIn]);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    // Clear all admin-related data from localStorage
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
