import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  title?: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (u: User, t: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem('user');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed && typeof parsed === 'object' && parsed.email) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  function login(u: User, t: string) {
    const validUser: User = {
      id: u?.id || 1,
      name: u?.name || 'Dr. Rajesh Sharma',
      email: u?.email || 'admin@aiia.gov.in',
      role: u?.role || 'ADMIN',
      title: u?.title || 'Administrator',
    };
    const validToken = t || 'token_' + Date.now();
    setUser(validUser);
    setToken(validToken);
    localStorage.setItem('user', JSON.stringify(validUser));
    localStorage.setItem('token', validToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
