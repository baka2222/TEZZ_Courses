import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NavLink({ to, icon: Icon, label, collapsed, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
      onClick={onClick}
    >
      <Icon size={20} className="nav-icon" />
      {!collapsed && <span className="nav-label">{label}</span>}
      {isActive && <div className="nav-indicator"></div>}
    </Link>
  );
}