import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('karabogretta@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      alert("Invalid credentials.");
    }
  };

  return (
    <div className="login-split-page">
      {/* Left Column: Dark Purple Market Photo Banner */}
      <div className="login-banner-col">
        <img
          src="/images/login_banner.png"
          alt="Market fashion apparel"
          className="login-banner-img"
        />
        <div className="banner-overlay"></div>
      </div>

      {/* Right Column: Clean White Form */}
      <div className="login-form-col">
        <div className="login-card-inner">
          {/* Logo */}
          <div className="login-logo-wrap">
            <div className="login-logo-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8-8 8z" fill="#FFF" opacity="0.3"/>
                <path d="M7 10c0 2.76 2.24 5 5 5s5-2.24 5-5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <h2 className="login-welcome-title">Welcome Back!</h2>
          <p className="login-welcome-sub">Please Login or Signup to your account here</p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label>Email</label>
              <div className="input-icon-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                <CheckCircle2 size={16} className="input-right-icon success" />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-right-icon-btn"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8E8EA9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-submit-btn">
              Login
            </button>

            <div className="demo-credentials-note">
              <span>🔑 Seeded Admin Account: </span>
              <strong>karabogretta@gmail.com</strong>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
