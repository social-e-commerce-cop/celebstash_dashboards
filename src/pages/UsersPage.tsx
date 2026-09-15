import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Lock, Unlock } from 'lucide-react';
import type { UserDirectoryItem } from '../types';
import { fetchWithAuth } from '../services/apiClient';
import { formatImageUrl } from '../utils/imageUrl';

/**
 * Backend account statuses (AccountStatus enum) mapped to the directory's display values.
 * DISABLED is the admin-initiated block; LOCKED is a system lock. Both read as "Blocked".
 */
const toDisplayStatus = (status?: string): UserDirectoryItem['status'] => {
  switch (String(status || '').toUpperCase()) {
    case 'DISABLED':
    case 'LOCKED':
      return 'Blocked';
    case 'PENDING':
      return 'Pending';
    default:
      return 'Active';
  }
};

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDirectoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);

  const loadUsers = () => {
    setLoading(true);
    setError(null);
    fetchWithAuth('/users')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const apiUsers: UserDirectoryItem[] = data.map((u: any) => ({
            id: String(u.id),
            name: u.fullName || u.username || 'User',
            username: u.username || '',
            email: u.email || 'N/A',
            role: u.role || 'USER',
            joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '—',
            status: toDisplayStatus(u.status),
            avatarUrl: formatImageUrl(u.profilePicture),
            artistStatement: u.bio || '',
          }));
          setUsers(apiUsers);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not load live users:', err);
        setError('Could not connect to users service. Backend may be waking up.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /** Block (DISABLED) or restore (ACTIVE) an account against the backend. */
  const toggleUserBlocked = async (user: UserDirectoryItem) => {
    const nextStatus = user.status === 'Blocked' ? 'ACTIVE' : 'DISABLED';
    setPendingStatusId(user.id);
    try {
      const res = await fetchWithAuth(`/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || `Failed to update account status (HTTP ${res.status}).`);
        return;
      }

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, status: toDisplayStatus(updated.status) } : item
        )
      );
    } catch {
      alert('Could not reach the backend to update this account.');
    } finally {
      setPendingStatusId(null);
    }
  };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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

      {error && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            border: '1px solid #FCD34D',
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={loadUsers}
            style={{
              background: '#D97706',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '12px',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="stats-grid four-col" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Blocked</div>
          <div className="stat-value">{users.filter((u) => u.status === 'Blocked').length}</div>
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

      {/* Filter Bar */}
      <div className="table-filter-card" style={{ marginBottom: 20 }}>
        <div className="filter-left">
          <div className="filter-search" style={{ width: 360 }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name, username, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" /></th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  Loading database users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  No users found in database.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
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
                  <td className="cell-text" style={{ fontWeight: 500, color: '#6366f1' }}>
                    {u.username ? (u.username.startsWith('@') ? u.username : `@${u.username}`) : `@${u.name.toLowerCase().replace(/\s+/g, '_')}`}
                  </td>
                  <td className="cell-text">
                    {u.email}
                  </td>
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
                        title={u.status === 'Blocked' ? 'Unblock User' : 'Block User'}
                        disabled={pendingStatusId === u.id}
                        onClick={() => toggleUserBlocked(u)}
                      >
                        {u.status === 'Blocked' ? <Unlock size={14} /> : <Lock size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Dynamic Pagination Footer */}
        {filteredUsers.length > 0 && (
          <div className="table-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                className="btn-page-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <div className="page-numbers" style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`page-num ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #e5e7eb',
                      background: pageNum === currentPage ? '#7126D0' : '#fff',
                      color: pageNum === currentPage ? '#fff' : '#374151',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: pageNum === currentPage ? 600 : 400,
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                className="btn-page-nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
