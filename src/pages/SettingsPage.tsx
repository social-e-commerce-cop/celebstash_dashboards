import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Shield, Bell, User } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || 'Ange Nadette BATETE');
  const [email, setEmail] = useState(user?.email || 'admin@zikii.com');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Settings</h1>
          <p className="page-subtitle">Configure system preferences, admin credentials, and notification triggers.</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="card-box" style={{ marginBottom: 20 }}>
        <h3 className="card-title flex-align" style={{ gap: 8, marginBottom: 16 }}>
          <User size={18} />
          <span>Admin Profile</span>
        </h3>

        <form onSubmit={handleSave} className="settings-form">
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="detail-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="detail-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="card-box" style={{ marginBottom: 20 }}>
        <h3 className="card-title flex-align" style={{ gap: 8, marginBottom: 16 }}>
          <Bell size={18} />
          <span>Notifications & Approvals</span>
        </h3>

        <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <strong>Email Notifications for Submissions</strong>
            <p className="card-sub">Receive email alerts when creators submit new products or artist credentials.</p>
          </div>
          <input
            type="checkbox"
            checked={emailNotifs}
            onChange={(e) => setEmailNotifs(e.target.checked)}
          />
        </div>

        <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Auto-Flag Low Risk Accounts</strong>
            <p className="card-sub">Automatically flag verified social accounts for expedited review.</p>
          </div>
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
          />
        </div>
      </div>

      <div className="card-box">
        <h3 className="card-title flex-align" style={{ gap: 8, marginBottom: 16 }}>
          <Shield size={18} />
          <span>Security</span>
        </h3>
        <p className="card-sub" style={{ marginBottom: 16 }}>Two-Factor Authentication is currently active for this admin account.</p>
        <button className="btn-secondary" onClick={() => alert('Password reset email sent!')}>
          Reset Password
        </button>
      </div>
    </div>
  );
};
