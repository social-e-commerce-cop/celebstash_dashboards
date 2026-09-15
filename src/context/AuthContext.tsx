import React, { createContext, useContext, useState } from 'react';
import type { AdminUser } from '../types';
import { API_BASE_URL, isAdminRole, onAdminLogout } from '../services/apiClient';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readStoredAdmin = (): AdminUser | null => {
  const saved = localStorage.getItem('zikii_admin_session');
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    if (parsed && parsed.token && isAdminRole(parsed.role)) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse admin session', e);
  }
  localStorage.removeItem('zikii_admin_session');
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(() => readStoredAdmin());

  React.useEffect(() => {
    return onAdminLogout(() => {
      setUser(null);
      setAuthError(null);
    });
  }, []);

  React.useEffect(() => {
    if (!user?.token) return;

    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    })
      .then((res) => {
        if (res.status === 401) {
          logout();
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (!data) return;
        if (!isAdminRole(data.role)) {
          setAuthError('This dashboard is restricted to administrators.');
          logout();
          return;
        }
        setUser((prev) => {
          if (!prev?.token) return prev;
          const updated: AdminUser = {
            id: String(data.id || prev.id),
            email: data.email || prev.email || '',
            fullName: data.fullName || data.name || prev.fullName || 'Admin',
            name: data.fullName || data.name || prev.name || 'Admin',
            role: data.role,
            avatarUrl: data.profilePicture || prev.avatarUrl || '/images/admin_avatar.png',
            token: prev.token,
          };
          localStorage.setItem('zikii_admin_session', JSON.stringify(updated));
          return updated;
        });
      })
      .catch(() => {});

    return () => controller.abort();
  }, [user?.token]);

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

      if (!isAdminRole(data.role)) {
        setAuthError('This dashboard is restricted to administrators.');
        return false;
      }

      const adminUser: AdminUser = {
        id: String(data.userId || data.id || ''),
        email: data.email || email.trim(),
        fullName: data.fullName || data.full_name || email.split('@')[0],
        name: data.fullName || data.full_name || email.split('@')[0],
        role: data.role,
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

  const isAuthenticated = Boolean(user && user.token && isAdminRole(user.role));

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
