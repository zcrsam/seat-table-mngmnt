import { useState } from "react";
import LoginScreen from "../../components/admin/LoginScreen";
import Dashboard from "../../components/admin/Dashboard";

export default function AdminReserve() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  return <Dashboard onLogout={() => setLoggedIn(false)} />;
}
