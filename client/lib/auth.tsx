"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearTokens, saveTokens } from "./api";
import type { RegisterPayload, User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await api.me();
      setUser(currentUser);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("access_token");

    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    saveTokens(response.tokens);
    setUser(response.user);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await api.register(payload);
    saveTokens(response.tokens);
    setUser(response.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {!mounted || loading ? <div className="bootScreen">Загрузка...</div> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
