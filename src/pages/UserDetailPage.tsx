import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, ThumbsUp, Share2, Mail, Calendar, Shield } from 'lucide-react';
import type { UserDirectoryItem } from '../types';
import { fetchWithAuth } from '../services/apiClient';
import { formatImageUrl } from '../utils/imageUrl';

/**
 * Backend account statuses (AccountStatus enum) mapped to display values.
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

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserDirectoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'Feed' | 'Stashes' | 'Music' | 'Events' | 'Auction'>('Feed');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusPending, setStatusPending] = useState(false);

  const loadUser = React.useCallback(() => {
    setLoading(true);
    setLoadError(null);

    fetchWithAuth(`/users/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 403) throw new Error("You don't have permission to view this user.");
          if (res.status === 404) throw new Error('This user account no longer exists.');
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Server returned ${res.status}.`);
        }
        return res.json();
      })
      .then(async (data) => {
        // Posts are supplementary: a failure here must not blank out the profile.
        let userPosts: any[] = [];
        try {
          const postsRes = await fetchWithAuth(`/api/posts/user/${id}`);
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            const items = Array.isArray(postsData) ? postsData : postsData.content || [];
            userPosts = items.map((p: any) => ({
              id: String(p.id),
              artistName: p.userFullName || data?.fullName || 'Artist',
              type: 'Image',
              caption: p.description || '',
              imageUrl: p.photoUrls && p.photoUrls.length > 0 ? formatImageUrl(p.photoUrls[0]) : formatImageUrl(p.videoUrl),
              likes: p.likesCount || 0,
              shares: p.sharesCount || 0,
            }));
          }
        } catch {
          // leave posts empty — the empty state is accurate
        }

        setUser({
          id: String(data.id || id),
          name: data.fullName || data.name || data.username || 'User',
          username: data.username || '',
          email: data.email || 'N/A',
          role: (data.role || 'USER') as any,
          joinedDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '—',
          status: toDisplayStatus(data.status),
          avatarUrl: formatImageUrl(data.profilePicture) || '/images/admin_avatar.png',
          artistStatement: data.bio || '',
          posts: userPosts,
        });
      })
      .catch((err: Error) => {
        setUser(null);
        setLoadError(err.message || 'Could not reach the backend server.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /** Block (DISABLED) or restore (ACTIVE) this account against the backend. */
  const toggleAccountLock = async () => {
    if (!user) return;
    const nextStatus = user.status === 'Blocked' ? 'ACTIVE' : 'DISABLED';
    setStatusPending(true);
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
      setUser((prev) => (prev ? { ...prev, status: toDisplayStatus(updated.status) } : prev));
    } catch {
      alert('Could not reach the backend to update this account.');
    } finally {
      setStatusPending(false);
    }
  };

  if (!user) {
    return (
      <div className="page-container">
        <button className="btn-clear flex-align" onClick={() => navigate('/users')}>
          <ArrowLeft size={16} />
          <span>Back to Users Directory</span>
        </button>

        {loading ? (
          <div className="empty-state">Loading user profile...</div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              padding: '14px 18px',
              borderRadius: 8,
              marginTop: 16,
              fontSize: 13,
              border: '1px solid #FCA5A5',
            }}
          >
            <span>⚠️ {loadError || 'User profile is unavailable.'}</span>
            <button
              onClick={loadUser}
              style={{
                background: '#DC2626',
                color: '#FFF',
                border: 'none',
                borderRadius: 6,
                padding: '4px 12px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 12,
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  const userStatus = String(user.status || 'Active');
  const userRole = String(user.role || 'USER');
  const userName = user.name || 'User';

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

        <span className={`status-badge status-${userStatus.toLowerCase()}`} style={{ fontSize: 13, padding: '6px 16px' }}>
          {userStatus}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
        {/* Left Side: Profile Sidebar */}
        <div className="card-box" style={{ height: 'fit-content' }}>
          <div className="profile-detail-header" style={{ flexDirection: 'column', textAlign: 'center' }}>
            <img src={user.avatarUrl || '/images/admin_avatar.png'} alt={userName} className="profile-detail-avatar" style={{ width: 80, height: 80 }} />
            <div className="profile-detail-meta" style={{ alignItems: 'center' }}>
              <h2 className="profile-detail-name" style={{ fontSize: 20 }}>{userName}</h2>
              <span className={`role-pill role-${userRole.toLowerCase()}`} style={{ marginTop: 6, fontSize: 12, padding: '4px 10px' }}>
                {userRole}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <label className="detail-label flex-align" style={{ gap: 4 }}>
              <span>Username</span>
            </label>
            <div className="detail-value" style={{ color: '#6366f1', fontWeight: 600 }}>
              {user.username ? (user.username.startsWith('@') ? user.username : `@${user.username}`) : `@${userName.toLowerCase().replace(/\s+/g, '_')}`}
            </div>
          </div>

          <div className="detail-section">
            <label className="detail-label flex-align" style={{ gap: 4 }}>
              <Mail size={12} />
              <span>Email Address</span>
            </label>
            <div className="detail-value">{user.email || 'N/A'}</div>
          </div>

          <div className="detail-section">
            <label className="detail-label flex-align" style={{ gap: 4 }}>
              <Calendar size={12} />
              <span>Joined Date</span>
            </label>
            <div className="detail-value">{user.joinedDate || '2026-01-01'}</div>
          </div>

          {user.artistStatement && (
            <div className="detail-section">
              <label className="detail-label">Bio / Statement</label>
              <p className="detail-statement">"{user.artistStatement}"</p>
            </div>
          )}

          {user.socials && typeof user.socials === 'string' && (
            <div className="detail-section">
              <label className="detail-label">Portfolios & Links</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {user.socials
                  .split(/,|\n/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((link, idx) => {
                    const href = link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
                    return (
                      <a
                        key={idx}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="social-tag"
                        style={{ fontSize: 13, padding: '6px 12px', background: '#F8FAFC', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6, wordBreak: 'break-all' }}
                      >
                        <Globe size={14} />
                        <span>{link}</span>
                      </a>
                    );
                  })}
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="btn-reject"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={statusPending}
              onClick={toggleAccountLock}
            >
              <Shield size={16} />
              <span>
                {statusPending
                  ? 'Updating...'
                  : user.status === 'Blocked'
                  ? 'Unblock Account'
                  : 'Block Account'}
              </span>
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
                    <img src={user.avatarUrl || '/images/admin_avatar.png'} alt={post.artistName} className="post-avatar" />
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
