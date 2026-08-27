import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Globe, Eye, Filter, Calendar } from 'lucide-react';
import { INITIAL_ARTIST_APPLICATIONS } from '../data/mockAdminData';
import type { ArtistApplication } from '../types';

export const ArtistApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications] = useState<ArtistApplication[]>(INITIAL_ARTIST_APPLICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.socials.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

        <div className="filter-right">
          {/* Status Dropdown */}
          <div className="select-wrap">
            <Filter size={14} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="select-wrap">
            <Calendar size={14} />
            <select defaultValue="All Time">
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
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" /></th>
              <th>Names</th>
              <th>Email Address</th>
              <th>Socials</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table">No applications found matching criteria.</td>
              </tr>
            ) : (
              filteredApps.map((app) => (
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
                  <td className="cell-text">{app.email}</td>
                  <td>
                    <div className="social-pill">
                      <Globe size={14} />
                      <span>_{app.socials.replace(/^_+/, '')}</span>
                    </div>
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

        {/* Pagination Footer */}
        <div className="table-pagination">
          <button className="btn-page-nav" disabled>← Previous</button>
          <div className="page-numbers">
            <span className="page-num active">1</span>
            <span className="page-num">2</span>
            <span className="page-num">3</span>
            <span className="page-num">...</span>
            <span className="page-num">8</span>
            <span className="page-num">9</span>
            <span className="page-num">10</span>
          </div>
          <button className="btn-page-nav">Next →</button>
        </div>
      </div>
    </div>
  );
};
