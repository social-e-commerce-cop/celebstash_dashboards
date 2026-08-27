import React, { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="admin-header">
      {/* Search Input */}
      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search, anything"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Right Controls */}
      <div className="header-actions">
        {/* Notifications Icon */}
        <button className="icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="dot-badge"></span>
        </button>

        {/* User Profile Menu */}
        <div className="profile-dropdown-container">
          <button
            className="profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src={user?.avatarUrl || '/images/admin_avatar.png'}
              alt={user?.fullName || 'Admin'}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{user?.fullName || 'Ange Nadette BATETE'}</span>
              <span className="user-role">{user?.role || 'Admin'}</span>
            </div>
            <ChevronDown size={14} className="chevron" />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="menu-header">
                <strong>{user?.email}</strong>
              </div>
              <button onClick={() => { setDropdownOpen(false); logout(); }} className="logout-btn">
                <LogOut size={14} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
