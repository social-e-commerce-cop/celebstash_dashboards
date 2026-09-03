import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Globe, Eye, Filter, Calendar } from 'lucide-react';
import { fetchWithAuth } from '../services/apiClient';
import type { ArtistApplication } from '../types';

export const ArtistApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    fetchWithAuth('/admin/artist-applications')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const apiApps: ArtistApplication[] = data.map((app: any) => ({
            id: String(app.id),
            name: app.userFullName || app.user?.fullName || app.stageName || 'Artist Applicant',
            username: app.username || app.user?.username || '',
            title: app.category || app.genre || 'Artist',
            email: app.userEmail || app.user?.email || 'N/A',
            socials: app.socialProofLink || app.socialLinks || '@artist',
            appliedDate: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : '2026-01-01',
            status: app.status === 'APPROVED' ? 'Approved' : app.status === 'REJECTED' ? 'Rejected' : 'Pending',
            avatarUrl: app.userProfilePicture || app.user?.profilePicture || '/images/admin_avatar.png',
            artistStatement: app.bio || 'Applicant bio statement.',
            externalPortfolios: app.socialProofLink ? app.socialProofLink.split(/,|\n/).map((s: string) => s.trim()).filter(Boolean) : ['instagram.com/artist'],
          }));
          setApplications(apiApps);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.username && app.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE) || 1;
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-container">
      {/* Header Row */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Artist Credentials Review</h1>
          <p className="page-subtitle">Inspect credentials, socials, and creative portfolios of applicants.</p>
        </div>
        <button className="btn-primary">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="table-filter-card">
        <div className="filter-left">
          <div className="filter-search" style={{ width: 320 }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-right">
          <div className="select-wrap">
            <Filter size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="select-wrap">
            <Calendar size={14} />
            <select>
              <option>Joined: All Time</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>

          <button className="btn-clear" onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" /></th>
              <th>Names</th>
              <th>Username</th>
              <th>Socials</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="empty-table" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  Loading artist applications from database...
                </td>
              </tr>
            ) : filteredApps.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  No artist applications found in database.
                </td>
              </tr>
            ) : (
              paginatedApps.map((app) => (
                <tr key={app.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="user-cell">
                      <img src={app.avatarUrl} alt={app.name} className="cell-avatar" />
                      <div>
                        <div className="cell-name">{app.name}</div>
                        <div className="cell-sub">{app.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-text">
                    {app.username ? `@${app.username}` : `@${app.name.toLowerCase().replace(/\s+/g, '_')}`}
                  </td>
                  <td>
                    <button
                      className="portfolio-link-btn"
                      onClick={() => navigate(`/artist-applications/${app.id}`)}
                      title={app.socials}
                    >
                      <Globe size={13} />
                      <span>View Portfolio</span>
                    </button>
                  </td>
                  <td className="cell-text">{app.appliedDate}</td>
                  <td>
                    <span className={`status-badge status-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-view-details" onClick={() => navigate(`/artist-applications/${app.id}`)}>
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Dynamic Pagination Footer */}
        {filteredApps.length > 0 && (
          <div className="table-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredApps.length)} of {filteredApps.length} applications
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
