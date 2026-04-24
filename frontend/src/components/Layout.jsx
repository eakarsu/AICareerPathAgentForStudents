import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/career-paths', label: 'Career Paths', icon: '🎯' },
  { path: '/skills', label: 'Skills Gap Analysis', icon: '⚡' },
  { path: '/courses', label: 'Course Recommendations', icon: '📚' },
  { path: '/job-trends', label: 'Job Market Trends', icon: '📊' },
  { path: '/interview-prep', label: 'Interview Prep', icon: '🎤' },
  { path: '/mentors', label: 'Mentorship', icon: '🤝' },
  { path: '/scholarships', label: 'Scholarships', icon: '🎓' },
  { path: '/networking-events', label: 'Networking Events', icon: '🌐' },
  { path: '/resumes', label: 'Resume Builder', icon: '📄' },
  { path: '/portfolios', label: 'Portfolio Builder', icon: '💼' },
  { path: '/learning-roadmaps', label: 'Learning Roadmaps', icon: '🗺️' },
  { path: '/industry-insights', label: 'Industry Insights', icon: '🏭' },
  { path: '/salary-insights', label: 'Salary Insights', icon: '💰' },
  { path: '/assessments', label: 'Career Assessment', icon: '📋' },
  { path: '/career-chat', label: 'AI Career Chat', icon: '🤖' },
];

export default function Layout({ children, user, onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            {sidebarOpen && <span className="logo-text">CareerPath AI</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={onLogout}>
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
