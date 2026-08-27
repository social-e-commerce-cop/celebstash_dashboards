import React from 'react';
import { X, ExternalLink, Globe } from 'lucide-react';
import type { ArtistApplication, ApplicationStatus } from '../../types';

interface ArtistDetailModalProps {
  application: ArtistApplication | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
}

export const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({
  application,
  onClose,
  onUpdateStatus,
}) => {
  if (!application) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">Application Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="applicant-profile-row">
          <img src={application.avatarUrl} alt={application.name} className="applicant-avatar" />
          <div className="applicant-info">
            <h3 className="applicant-name">{application.name}</h3>
            <span className="applicant-role">{application.title || 'Artist'}</span>
          </div>
          <button className="visit-profile-btn" onClick={() => alert(`Visiting profile of ${application.name}`)}>
            <ExternalLink size={14} />
            <span>Visit Profile</span>
          </button>
        </div>

        {/* Primary Email */}
        <div className="detail-section">
          <label className="detail-label">Primary Email</label>
          <div className="detail-value">{application.email}</div>
        </div>

        {/* Artist Statement */}
        <div className="detail-section">
          <label className="detail-label">Artist Statement</label>
          <p className="detail-statement">{application.artistStatement}</p>
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
              >
                <Globe size={14} />
                <span>_{handle.replace(/^_+/, '')}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="modal-actions">
          {application.status === 'Pending' && (
            <>
              <button
                className="btn-approve"
                onClick={() => {
                  onUpdateStatus(application.id, 'Approved');
                  onClose();
                }}
              >
                Approve Artist
              </button>
              <button
                className="btn-reject"
                onClick={() => {
                  onUpdateStatus(application.id, 'Rejected');
                  onClose();
                }}
              >
                Reject
              </button>
            </>
          )}

          {application.status === 'Rejected' && (
            <button
              className="btn-approve"
              onClick={() => {
                onUpdateStatus(application.id, 'Approved');
                onClose();
              }}
            >
              Approve Artist
            </button>
          )}

          {application.status === 'Approved' && (
            <button
              className="btn-reject"
              onClick={() => {
                onUpdateStatus(application.id, 'Blocked');
                onClose();
              }}
            >
              Block
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
