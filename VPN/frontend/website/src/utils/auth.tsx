import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from './api';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  tier: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.me();
      setUser(data);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const { data } = await authAPI.login(username, password);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    const me = await authAPI.me();
    setUser(me.data);
  };

  const register = async (regData: { email: string; username: string; password: string; full_name?: string }) => {
    const { data } = await authAPI.register(regData);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    const me = await authAPI.me();
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
