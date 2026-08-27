import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Lock } from 'lucide-react';
import { INITIAL_USERS_DIRECTORY } from '../data/mockAdminData';
import type { UserDirectoryItem } from '../types';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDirectoryItem[]>(INITIAL_USERS_DIRECTORY);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiUsers: UserDirectoryItem[] = data.map((u: any) => ({
            id: String(u.id),
            name: u.fullName || u.username || 'User',
            email: u.email || 'N/A',
            role: u.role || 'USER',
            joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01',
            status: u.status === 'ACTIVE' ? 'Active' : u.status === 'BLOCKED' ? 'Blocked' : 'Pending',
            avatarUrl: u.profilePicture || '/images/admin_avatar.png',
            artistStatement: u.bio || '',
          }));
          setUsers(apiUsers);
        }
      })
      .catch(() => {
        // Fallback to initial mock data
      });
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Users Directory</h1>
          <p className="page-subtitle">Manage user accounts, permissions, roles, and creative feeds.</p>
        </div>
        <button className="btn-primary">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-grid four-col" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">New This Month</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active</div>
          <div className="stat-value">{users.filter((u) => u.status === 'Active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Artists</div>
          <div className="stat-value">{users.filter((u) => String(u.role).toUpperCase() === 'ARTIST').length}</div>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="table-filter-card">
        <div className="filter-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}><input type="checkbox" /></th>
              <th>Names</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="user-table-row">
                <td><input type="checkbox" /></td>
                <td>
                  <div className="user-cell">
                    <img src={u.avatarUrl} alt={u.name} className="cell-avatar" />
                    <div>
                      <div className="cell-name">{u.name}</div>
                    </div>
                  </div>
                </td>
                <td className="cell-text">{u.email}</td>
                <td>
                  <span className={`role-pill role-${u.role.toLowerCase()}`}>{u.role}</span>
                </td>
                <td className="cell-text">{u.joinedDate}</td>
                <td>
                  <span className={`status-badge status-${u.status.toLowerCase()}`}>
                    {u.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="row-actions">
                    <button
                      className="icon-action-btn"
                      title="View Details"
                      onClick={() => navigate(`/users/${u.id}`)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="icon-action-btn danger"
                      title="Block User"
                      onClick={() => {
                        setUsers((prev) =>
                          prev.map((item) => (item.id === u.id ? { ...item, status: 'Blocked' } : item))
                        );
                      }}
                    >
                      <Lock size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
