import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, ThumbsUp, Share2, Mail, Calendar, Shield } from 'lucide-react';
import { INITIAL_USERS_DIRECTORY } from '../data/mockAdminData';
import type { UserDirectoryItem } from '../types';
import { fetchWithAuth } from '../services/apiClient';
import { formatImageUrl } from '../utils/imageUrl';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserDirectoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'Feed' | 'Stashes' | 'Music' | 'Events' | 'Auction'>('Feed');

  useEffect(() => {
    fetchWithAuth(`/users/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        const foundMock = INITIAL_USERS_DIRECTORY.find((u) => u.id === id);
        let userPosts: any[] = foundMock ? foundMock.posts || [] : [];

        // Attempt to fetch user's live posts from backend
        try {
          const postsRes = await fetchWithAuth(`/api/posts/user/${id}`);
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            const items = Array.isArray(postsData) ? postsData : postsData.content || [];
            if (items.length > 0) {
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
          }
        } catch (e) {}

        if (data) {
          setUser({
            id: String(data.id || id),
            name: data.fullName || data.name || data.username || (foundMock ? foundMock.name : 'User'),
            username: data.username || (foundMock ? foundMock.username : ''),
            email: data.email || (foundMock ? foundMock.email : 'N/A'),
            role: (data.role || (foundMock ? foundMock.role : 'USER')) as any,
            joinedDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : (foundMock ? foundMock.joinedDate : '2026-01-01'),
            status: (data.status || (foundMock ? foundMock.status : 'Active')) as any,
            avatarUrl: formatImageUrl(data.profilePicture) || (foundMock ? foundMock.avatarUrl : '/images/admin_avatar.png'),
            artistStatement: data.bio || (foundMock ? foundMock.artistStatement : ''),
            posts: userPosts,
            socials: foundMock ? foundMock.socials : undefined,
          });
        } else {
          const found = foundMock || INITIAL_USERS_DIRECTORY[0];
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
              onClick={() => alert(`Account status updated for ${userName}`)}
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
