import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@zikii.com');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    navigate('/');
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#FFF" opacity="0.3"/>
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Lock size={16} className="input-right-icon" />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-submit-btn">
              Login
            </button>

            <div className="demo-credentials-note">
              <span>🔑 Seeded Demo Account: </span>
              <strong>admin@zikii.com</strong>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
