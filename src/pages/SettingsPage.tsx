import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Shield, Bell, User } from 'lucide-react';
import { fetchWithAuth } from '../services/apiClient';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  // Seeded from the signed-in admin — never a hardcoded identity.
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetchWithAuth('/users/me', {
        method: 'PUT',
        // Only send what this form actually edits. Username is not shown here, and
        // deriving one from the email would silently rename the account on every save.
        body: JSON.stringify({
          fullName: fullName.trim(),
        }),
      });

      if (res.ok) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveMessage(`Failed to save: ${err.message || 'Server error'}`);
      }
    } catch (e) {
      setSaveMessage('Error connecting to backend server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetchWithAuth(`/auth/password-reset/initiate?identifier=${encodeURIComponent(email.trim())}`, {
        method: 'POST',
      });
      if (res.ok) {
        alert('Password reset instructions have been sent to your email!');
      } else {
        alert('Could not initiate password reset. Please try again.');
      }
    } catch (e) {
      alert('Error connecting to backend server.');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Settings</h1>
          <p className="page-subtitle">Configure system preferences, admin credentials, and notification triggers.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {saveMessage && (
        <div
          style={{
            backgroundColor: saveMessage.includes('Failed') || saveMessage.includes('Error') ? '#FEE2E2' : '#DCFCE7',
            color: saveMessage.includes('Failed') || saveMessage.includes('Error') ? '#DC2626' : '#15803D',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            border: '1px solid currentColor',
          }}
        >
          {saveMessage}
        </div>
      )}

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
        <button className="btn-secondary" onClick={handleResetPassword}>
          Reset Password
        </button>
      </div>
    </div>
  );
};
