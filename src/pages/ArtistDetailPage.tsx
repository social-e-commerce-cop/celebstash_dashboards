import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Globe, Check, XCircle, ShieldAlert } from 'lucide-react';
import { INITIAL_ARTIST_APPLICATIONS } from '../data/mockAdminData';
import type { ArtistApplication } from '../types';
import { fetchWithAuth } from '../services/apiClient';
import { formatImageUrl } from '../utils/imageUrl';

export const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<ArtistApplication | null>(null);

  useEffect(() => {
    fetchWithAuth('/admin/artist-applications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((app: any) => String(app.id) === id);
          if (found) {
            setApplication({
              id: String(found.id),
              name: found.userFullName || found.user?.fullName || found.stageName || 'Artist Applicant',
              username: found.username || found.user?.username || '',
              title: found.category || found.genre || 'Artist',
              email: found.userEmail || found.user?.email || 'N/A',
              socials: found.socialProofLink || found.socialLinks || '@artist',
              appliedDate: found.createdAt ? new Date(found.createdAt).toISOString().split('T')[0] : '2026-01-01',
              status: found.status === 'APPROVED' ? 'Approved' : found.status === 'REJECTED' ? 'Rejected' : 'Pending',
              avatarUrl: formatImageUrl(found.userProfilePicture || found.user?.profilePicture),
              artistStatement: found.bio || 'Applicant bio statement.',
              externalPortfolios: found.socialProofLink
                ? found.socialProofLink.split(/,|\n/).map((s: string) => s.trim()).filter(Boolean)
                : ['instagram.com/artist'],
            });
            return;
          }
        }
        const mockFound = INITIAL_ARTIST_APPLICATIONS.find((a) => a.id === id);
        if (mockFound) setApplication(mockFound);
      })
      .catch(() => {
        const mockFound = INITIAL_ARTIST_APPLICATIONS.find((a) => a.id === id);
        if (mockFound) setApplication(mockFound);
      });
  }, [id]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!application) return;
    setIsSubmitting(true);

    try {
      const res = await fetchWithAuth(`/admin/artist-applications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ approve: true, status: 'APPROVED' }),
      });
      if (res.ok) {
        setApplication((prev) => (prev ? { ...prev, status: 'Approved' } : null));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to approve application: ${errData.message || 'Server error'}`);
      }
    } catch (e) {
      alert('Error connecting to backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      setRejectionError('Rejection reason is mandatory when declining an application.');
      return;
    }
    setRejectionError('');
    setIsSubmitting(true);

    fetchWithAuth(`/admin/artist-applications/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({
        approve: false,
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        reviewNotes: rejectionReason.trim(),
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          setApplication((prev) => (prev ? { ...prev, status: 'Rejected' } : null));
          setShowRejectModal(false);
          setRejectionReason('');
        } else {
          const errData = await res.json().catch(() => ({}));
          setRejectionError(errData.message || 'Failed to decline application.');
        }
      })
      .catch(() => {
        setRejectionError('Error connecting to backend server');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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

        {/* Username */}
        <div className="detail-section">
          <label className="detail-label">Username</label>
          <div className="detail-value" style={{ fontSize: 15 }}>
            {application.username ? `@${application.username}` : `@${application.name.toLowerCase().replace(/\s+/g, '_')}`}
          </div>
        </div>

        {/* Artist Statement */}
        <div className="detail-section">
          <label className="detail-label">Artist Statement</label>
          <p className="detail-statement" style={{ fontSize: 14, padding: 16 }}>"{application.artistStatement}"</p>
        </div>

        {/* External Portfolios */}
        <div className="detail-section">
          <label className="detail-label">External Portfolios & Links</label>
          <div className="portfolio-tags" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {application.externalPortfolios.map((link, idx) => {
              const href = link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
              return (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="social-tag"
                  style={{ fontSize: 13, padding: '8px 14px', background: '#F8FAFC', borderRadius: 8, display: 'inline-flex', alignItems: 'center', width: 'fit-content', wordBreak: 'break-all' }}
                >
                  <Globe size={16} />
                  <span>{link}</span>
                </a>
              );
            })}
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
              <button className="btn-approve" onClick={handleApprove}>
                <Check size={16} />
                <span>Approve Artist</span>
              </button>
              <button className="btn-reject" onClick={() => setShowRejectModal(true)}>
                <XCircle size={16} />
                <span>Reject</span>
              </button>
            </>
          )}

          {application.status === 'Rejected' && (
            <button className="btn-approve" onClick={handleApprove}>
              <Check size={16} />
              <span>Approve Artist</span>
            </button>
          )}

          {application.status === 'Approved' && (
            <button className="btn-reject" onClick={() => setShowRejectModal(true)}>
              <ShieldAlert size={16} />
              <span>Block Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card-box" style={{ width: 460, padding: 24, borderRadius: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Decline Artist Application
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Specify the reason for rejecting <strong>{application.name}</strong>'s application. This explanation will be sent to the applicant via in-app notification and email.
            </p>

            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Rejection Reason <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              style={{ width: '100%', height: 100, padding: 10, borderRadius: 8, border: '1px solid var(--border-subtle)', fontFamily: 'inherit', fontSize: 13, resize: 'none' }}
              placeholder="e.g. Follower count threshold not met or invalid social proof provided."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (e.target.value.trim()) setRejectionError('');
              }}
            />

            {rejectionError && (
              <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                {rejectionError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                className="btn-clear"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionError('');
                  setRejectionReason('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn-reject"
                onClick={handleConfirmReject}
                disabled={isSubmitting}
                style={{ padding: '8px 16px' }}
              >
                {isSubmitting ? 'Declining...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
