import React, { createContext, useContext, useState } from 'react';
import type { AdminUser } from '../types';
import { fetchWithAuth, API_BASE_URL } from '../services/apiClient';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('zikii_admin_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.token) return parsed;
      } catch (e) {
        console.error('Failed to parse admin session', e);
      }
    }
    return null;
  });

  React.useEffect(() => {
    fetchWithAuth('/users/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser((prev) => {
            const updated: AdminUser = {
              id: String(data.id || prev?.id || 'admin_user'),
              email: data.email || prev?.email || '',
              fullName: data.fullName || data.name || prev?.fullName || 'Admin',
              name: data.fullName || data.name || prev?.name || 'Admin',
              role: data.role || prev?.role || 'ADMIN',
              avatarUrl: data.profilePicture || prev?.avatarUrl || '/images/admin_avatar.png',
              token: prev?.token || '',
            };
            localStorage.setItem('zikii_admin_session', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch(() => {});
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 30000) : null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller?.signal,
        body: JSON.stringify({
          identifier: email.trim(),
          email: email.trim(),
          password: pass,
        }),
      });

      if (timeoutId) clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        const msg = data.message || (data.errors ? Object.values(data.errors).join('. ') : 'Invalid email or password');
        setAuthError(msg);
        return false;
      }

      const token = data.accessToken || data.token;
      if (!token) {
        setAuthError('No authentication token returned by server.');
        return false;
      }

      const adminUser: AdminUser = {
        id: String(data.userId || data.id || 'admin_user'),
        email: data.email || email.trim(),
        fullName: data.fullName || data.full_name || email.split('@')[0],
        name: data.fullName || data.full_name || email.split('@')[0],
        role: data.role || 'ADMIN',
        avatarUrl: data.profilePicture || '/images/admin_avatar.png',
        token: token,
      };

      setUser(adminUser);
      localStorage.setItem('zikii_admin_session', JSON.stringify(adminUser));
      return true;
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('Login error:', error);
      if (error.name === 'AbortError') {
        setAuthError('Connection timed out. Render backend may be waking up from cold start, please retry.');
      } else {
        setAuthError(error.message || 'Unable to connect to backend server. Please check connection.');
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthError(null);
    localStorage.removeItem('zikii_admin_session');
  };

  const clearAuthError = () => setAuthError(null);

  const isAuthenticated = Boolean(user && user.token);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, authError, login, logout, clearAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
