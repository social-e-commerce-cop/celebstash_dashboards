import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCheck, PackageCheck, Users, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Artist Applications', path: '/artist-applications', icon: UserCheck },
    { label: 'Product Approvals', path: '/product-approvals', icon: PackageCheck },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="brand-header">
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#FFF" opacity="0.3"/>
            <path d="M7 10c0 2.76 2.24 5 5 5s5-2.24 5-5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="brand-text">ZIKII.</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
