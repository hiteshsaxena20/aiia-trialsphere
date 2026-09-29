import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  LayoutDashboard, FlaskConical, MapPin, Users, ShieldAlert,
  FileCheck, Bell, ClipboardList, Link2, LogOut, Activity,
  ChevronRight, Settings, Database
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  badgeType?: 'danger' | 'warn';
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard size={16} />, path: '/' },
  { id: 'studies', label: 'Study Portfolio', icon: <FlaskConical size={16} />, path: '/studies' },
  { id: 'sites', label: 'Site Management', icon: <MapPin size={16} />, path: '/sites' },
  { id: 'participants', label: 'Participants', icon: <Users size={16} />, path: '/participants' },
  { id: 'safety', label: 'Pharmacovigilance', icon: <ShieldAlert size={16} />, path: '/safety' },
  { id: 'compliance', label: 'Compliance & Ethics', icon: <FileCheck size={16} />, path: '/compliance' },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={16} />, path: '/alerts' },
  { id: 'audit', label: 'Audit Ledger', icon: <ClipboardList size={16} />, path: '/audit' },
  { id: 'fhir', label: 'Interoperability', icon: <Link2 size={16} />, path: '/fhir' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function getRoleDisplay(role: string) {
    const map: Record<string, string> = {
      ADMIN: 'Administrator',
      PI: 'Principal Investigator',
      STUDY_COORDINATOR: 'Study Coordinator',
      MONITOR: 'Monitor',
      PHARMACOVIGILANCE: 'PV Officer',
      ETHICS_COMMITTEE: 'Ethics Committee',
      MANAGEMENT: 'Management',
      REGULATOR: 'Regulator',
    };
    return map[role] || role;
  }

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-icon">⚗</div>
          <div className="brand-text">
            <span className="brand-name">AIIA TrialSphere</span>
            <span className="brand-sub">CTMS Platform v1.0</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              id={`nav-${item.id}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className={`nav-badge ${item.badgeType || ''}`}>{item.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-label">System</div>
          <button className="nav-item" onClick={() => {}} id="nav-settings">
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button className="nav-item" onClick={() => {}} id="nav-database">
            <Database size={16} />
            <span>Data Quality</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-card">
            <div className="user-avatar">{getInitials(user.name)}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{getRoleDisplay(user.role)}</div>
            </div>
            <button
              className="btn btn-secondary btn-icon"
              onClick={() => { logout(); navigate('/login'); }}
              title="Logout"
              id="btn-logout"
              style={{ padding: '6px', borderRadius: '6px' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
