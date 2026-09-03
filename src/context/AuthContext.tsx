import React, { createContext, useContext, useState } from 'react';
import type { AdminUser } from '../types';
import { fetchWithAuth } from '../services/apiClient';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email.trim(),
          email: email.trim(),
          password: pass
        })
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Login failed');
      }

      const token = data.accessToken || data.token;
      if (!token) {
        throw new Error('No token returned from server');
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
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zikii_admin_session');
  };

  const isAuthenticated = Boolean(user && user.token);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
