import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h2>Chhaperia Cables</h2>
          <p>Production Control Center</p>
        </div>

        <nav className="nav-list">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Dashboard</NavLink>
          <NavLink to="/logs" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Production Log</NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Products</NavLink>
          <NavLink to="/companies" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Companies</NavLink>
          {user?.role === "SUPER_ADMIN" && <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Users</NavLink>}
        </nav>

        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>

      <main className="main-content">
        <header className="top-header card">
          <div>
            <h1>Operations Dashboard</h1>
            <p>Internal production visibility and entry tracking</p>
          </div>
          <div className="user-pill">{user?.name} ({user?.role})</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
