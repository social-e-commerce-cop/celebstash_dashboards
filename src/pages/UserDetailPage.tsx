import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, ThumbsUp, Share2, Mail, Calendar, Shield } from 'lucide-react';
import { INITIAL_USERS_DIRECTORY } from '../data/mockAdminData';
import type { UserDirectoryItem } from '../types';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserDirectoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'Feed' | 'Stashes' | 'Music' | 'Events' | 'Auction'>('Feed');

  useEffect(() => {
    // Attempt fetching real user from Spring Boot API or fallback to mock
    fetch(`http://localhost:8080/api/v1/users/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser({
            id: String(data.id),
            name: data.fullName || data.username || 'User',
            email: data.email || 'N/A',
            role: data.role || 'USER',
            joinedDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '2026-01-01',
            status: data.status || 'Active',
            avatarUrl: data.profilePicture || '/images/admin_avatar.png',
            artistStatement: data.bio || '',
          });
        } else {
          const found = INITIAL_USERS_DIRECTORY.find((u) => u.id === id) || INITIAL_USERS_DIRECTORY[0];
          setUser(found);
        }
      })
      .catch(() => {
        const found = INITIAL_USERS_DIRECTORY.find((u) => u.id === id) || INITIAL_USERS_DIRECTORY[0];
        setUser(found);
      });
  }, [id]);

  if (!user) {
    return (
      <div className="page-container">
        <button className="btn-clear flex-align" onClick={() => navigate('/users')}>
          <ArrowLeft size={16} />
          <span>Back to Users Directory</span>
        </button>
        <div className="empty-state">User profile not found.</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <button
            className="btn-clear flex-align"
            style={{ gap: 6, padding: 0, marginBottom: 8, color: 'var(--text-muted)' }}
            onClick={() => navigate('/users')}
          >
            <ArrowLeft size={16} />
            <span>Back to Users Directory</span>
          </button>
          <h1 className="page-title">User Account Details</h1>
          <p className="page-subtitle">Inspect user metadata, role permissions, activity history, and creative feeds.</p>
        </div>

        <span className={`status-badge status-${user.status.toLowerCase()}`} style={{ fontSize: 13, padding: '6px 16px' }}>
          {user.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
        {/* Left Side: Profile Sidebar */}
        <div className="card-box" style={{ height: 'fit-content' }}>
          <div className="profile-detail-header" style={{ flexDirection: 'column', textAlign: 'center' }}>
            <img src={user.avatarUrl} alt={user.name} className="profile-detail-avatar" style={{ width: 80, height: 80 }} />
            <div className="profile-detail-meta" style={{ alignItems: 'center' }}>
              <h2 className="profile-detail-name" style={{ fontSize: 20 }}>{user.name}</h2>
              <span className={`role-pill role-${user.role.toLowerCase()}`} style={{ marginTop: 6, fontSize: 12, padding: '4px 10px' }}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <label className="detail-label flex-align" style={{ gap: 4 }}>
              <Mail size={12} />
              <span>Primary Email</span>
            </label>
            <div className="detail-value">{user.email}</div>
          </div>

          <div className="detail-section">
            <label className="detail-label flex-align" style={{ gap: 4 }}>
              <Calendar size={12} />
              <span>Joined Date</span>
            </label>
            <div className="detail-value">{user.joinedDate}</div>
          </div>

          {user.artistStatement && (
            <div className="detail-section">
              <label className="detail-label">Bio / Statement</label>
              <p className="detail-statement">"{user.artistStatement}"</p>
            </div>
          )}

          {user.socials && (
            <div className="detail-section">
              <label className="detail-label">Portfolios & Links</label>
              <div className="social-pill">
                <Globe size={14} />
                <span>_{user.socials.replace(/^_+/, '')}</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="btn-reject"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => alert(`Account status updated for ${user.name}`)}
            >
              <Shield size={16} />
              <span>Toggle Account Lock</span>
            </button>
          </div>
        </div>

        {/* Right Side: Creative Activity Feed */}
        <div className="card-box">
          <div className="profile-tabs">
            {(['Feed', 'Stashes', 'Music', 'Events', 'Auction'] as const).map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="tab-feed-content">
            {user.posts && user.posts.length > 0 ? (
              user.posts.map((post) => (
                <div key={post.id} className="feed-post-card">
                  <div className="post-header">
                    <img src={user.avatarUrl} alt={post.artistName} className="post-avatar" />
                    <div>
                      <strong className="post-artist-name">{post.artistName}</strong>
                      <span className="post-type-badge">{post.type}</span>
                    </div>
                  </div>
                  <p className="post-caption">{post.caption}</p>
                  {post.imageUrl && (
                    <div className="post-media-wrap" style={{ height: 220 }}>
                      <img src={post.imageUrl} alt="Post content" className="post-media-img" />
                    </div>
                  )}
                  <div className="post-footer">
                    <button className="post-action-btn">
                      <ThumbsUp size={14} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="post-action-btn">
                      <Share2 size={14} />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No items found in {activeTab}.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
