import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Globe, Check, XCircle, ShieldAlert } from 'lucide-react';
import { INITIAL_ARTIST_APPLICATIONS } from '../data/mockAdminData';
import type { ApplicationStatus } from '../types';

export const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [applications, setApplications] = useState(INITIAL_ARTIST_APPLICATIONS);
  const application = applications.find((a) => a.id === id) || applications[0];

  const handleUpdateStatus = (newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === application.id ? { ...app, status: newStatus } : app))
    );
  };

  if (!application) {
    return (
      <div className="page-container">
        <button className="btn-secondary flex-align" style={{ gap: 8 }} onClick={() => navigate('/artist-applications')}>
          <ArrowLeft size={16} />
          <span>Back to Artist Applications</span>
        </button>
        <div className="empty-state">Application not found.</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Back Button & Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <button
            className="btn-clear flex-align"
            style={{ gap: 6, padding: 0, marginBottom: 8, color: 'var(--text-muted)' }}
            onClick={() => navigate('/artist-applications')}
          >
            <ArrowLeft size={16} />
            <span>Back to Artist Applications</span>
          </button>
          <h1 className="page-title">Application Details</h1>
          <p className="page-subtitle">Inspect credentials, artist statement, and external portfolios.</p>
        </div>

        <span className={`status-badge status-${application.status.toLowerCase()}`} style={{ fontSize: 13, padding: '6px 16px' }}>
          {application.status}
        </span>
      </div>

      {/* Main Details Card */}
      <div className="card-box" style={{ marginBottom: 24 }}>
        {/* Applicant Profile Header */}
        <div className="applicant-profile-row" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 20, marginBottom: 20 }}>
          <img src={application.avatarUrl} alt={application.name} className="applicant-avatar" style={{ width: 72, height: 72, borderRadius: 20 }} />
          <div className="applicant-info">
            <h2 className="applicant-name" style={{ fontSize: 20 }}>{application.name}</h2>
            <span className="applicant-role" style={{ fontSize: 14 }}>{application.title || 'Artist'}</span>
            <div className="cell-sub" style={{ marginTop: 4 }}>Applied on {application.appliedDate}</div>
          </div>
          <button
            className="visit-profile-btn"
            style={{ fontSize: 14 }}
            onClick={() => alert(`Visiting external profile of ${application.name}`)}
          >
            <ExternalLink size={16} />
            <span>Visit Profile</span>
          </button>
        </div>

        {/* Primary Email */}
        <div className="detail-section">
          <label className="detail-label">Primary Email</label>
          <div className="detail-value" style={{ fontSize: 15 }}>{application.email}</div>
        </div>

        {/* Artist Statement */}
        <div className="detail-section">
          <label className="detail-label">Artist Statement</label>
          <p className="detail-statement" style={{ fontSize: 14, padding: 16 }}>"{application.artistStatement}"</p>
        </div>

        {/* External Portfolios */}
        <div className="detail-section">
          <label className="detail-label">External Portfolios</label>
          <div className="portfolio-tags">
            {application.externalPortfolios.map((handle, idx) => (
              <a
                key={idx}
                href={`https://instagram.com/${handle}`}
                target="_blank"
                rel="noreferrer"
                className="social-tag"
                style={{ fontSize: 14, padding: '6px 12px', background: '#F8FAFC', borderRadius: 8 }}
              >
                <Globe size={16} />
                <span>_{handle.replace(/^_+/, '')}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Page Actions Card */}
      <div className="card-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 className="card-title">Application Status Review</h3>
          <p className="card-sub">Updating status immediately affects creator marketplace access.</p>
        </div>

        <div className="modal-actions" style={{ marginTop: 0 }}>
          {application.status === 'Pending' && (
            <>
              <button className="btn-approve" onClick={() => handleUpdateStatus('Approved')}>
                <Check size={16} />
                <span>Approve Artist</span>
              </button>
              <button className="btn-reject" onClick={() => handleUpdateStatus('Rejected')}>
                <XCircle size={16} />
                <span>Reject</span>
              </button>
            </>
          )}

          {application.status === 'Rejected' && (
            <button className="btn-approve" onClick={() => handleUpdateStatus('Approved')}>
              <Check size={16} />
              <span>Approve Artist</span>
            </button>
          )}

          {application.status === 'Approved' && (
            <button className="btn-reject" onClick={() => handleUpdateStatus('Blocked')}>
              <ShieldAlert size={16} />
              <span>Block Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
