import React, { createContext, useContext, useState } from 'react';
import type { AdminUser } from '../types';
import { SEEDED_ADMIN } from '../data/mockAdminData';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo admin is logged in by default or stored in session
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('zikii_admin_session');
    return saved ? JSON.parse(saved) : SEEDED_ADMIN;
  });

  const login = (email: string, _pass: string) => {
    // For demo purposes, any valid login or seeded admin credentials grant access
    const adminUser = {
      ...SEEDED_ADMIN,
      email: email.trim() || SEEDED_ADMIN.email,
    };
    setUser(adminUser);
    localStorage.setItem('zikii_admin_session', JSON.stringify(adminUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zikii_admin_session');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
