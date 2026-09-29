import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User { id: number; name: string; email: string; role: string; }
interface AuthCtx { user: User | null; token: string | null; login: (u: User, t: string) => void; logout: () => void; }

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  function login(u: User, t: string) {
    setUser(u); setToken(t);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
  }

  function logout() {
    setUser(null); setToken(null);
    localStorage.removeItem('user'); localStorage.removeItem('token');
  }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
