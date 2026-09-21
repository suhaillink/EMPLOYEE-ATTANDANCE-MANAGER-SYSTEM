import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import EmployeeDetails from './components/EmployeeDetails';
import AttendanceControl from './components/AttendanceControl';
import AttendanceReport from './components/AttendanceReport';
import Holidays from './components/Holidays';
import Corrections from './components/Corrections';
import './App.css';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['ADMIN', 'EMPLOYEE'] },
  { to: '/employees', label: 'Employees', icon: '👥', roles: ['ADMIN'] },
  { to: '/employees', label: 'My Profile', icon: '👤', roles: ['EMPLOYEE'] },
  { to: '/attendance', label: 'Attendance', icon: '⏱️', roles: ['ADMIN', 'EMPLOYEE'] },
  { to: '/reports', label: 'Reports', icon: '📊', roles: ['ADMIN', 'EMPLOYEE'] },
  { to: '/holidays', label: 'Holidays', icon: '🏖️', roles: ['ADMIN', 'EMPLOYEE'] },
  { to: '/corrections', label: 'Corrections', icon: '🔧', roles: ['ADMIN', 'EMPLOYEE'] },
];

function AppLayout({ user, onLogout }) {
  const location = useLocation();
  const role = user?.role || 'EMPLOYEE';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter((l) => l.roles.includes(role));

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🏢</span>
          <span className="brand-name">TimeFlow</span>
        </div>

        <ul className="sidebar-nav">
          {visibleLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <Link
                to={to}
                className={`sidebar-link ${location.pathname.startsWith(to) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-icon">{icon}</span>
                <span className="sidebar-label">{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {(user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-email">{user?.email}</span>
              <span className={`role-badge ${role === 'ADMIN' ? 'role-admin' : 'role-employee'}`}>
                {role}
              </span>
            </div>
          </div>
          <button className="btn btn-danger btn-sm logout-btn" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className="main-area">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="topbar-title">
            {visibleLinks.find((l) => location.pathname.startsWith(l.to))?.label || 'Employee Attendance'}
          </div>
          <div className="topbar-right">
            <span className={`role-badge ${role === 'ADMIN' ? 'role-admin' : 'role-employee'}`}>
              {role}
            </span>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/attendance" element={<AttendanceControl />} />
            <Route path="/reports" element={<AttendanceReport />} />
            <Route path="/holidays" element={<Holidays />} />
            <Route path="/corrections" element={<Corrections />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const stored = {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    email: localStorage.getItem('email'),
  };

  const [user, setUser] = useState(stored.token ? stored : null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <Router>
      <AppLayout user={user} onLogout={handleLogout} />
    </Router>
  );
}

export default App;
