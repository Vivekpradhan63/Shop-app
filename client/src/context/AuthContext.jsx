import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

const AuthContext = createContext(null);

const STORAGE_USER = "user";
const STORAGE_TOKEN = "token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((nextUser, nextToken) => {
    if (nextToken) localStorage.setItem(STORAGE_TOKEN, nextToken);
    else localStorage.removeItem(STORAGE_TOKEN);
    if (nextUser) localStorage.setItem(STORAGE_USER, JSON.stringify(nextUser));
    else localStorage.removeItem(STORAGE_USER);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_USER);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORAGE_USER);
        localStorage.removeItem(STORAGE_TOKEN);
      }
    }
    setLoading(false);
  }, []);

  const refreshMe = useCallback(async () => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    if (!storedToken) return;
    const { data } = await axiosInstance.get("/auth/me");
    localStorage.setItem(STORAGE_USER, JSON.stringify(data));
    setUser(data);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await axiosInstance.post("/auth/login", { email, password });
      persistSession(data.user, data.token);
      return data;
    },
    [persistSession]
  );

  const register = useCallback(async (payload) => {
    const { data } = await axiosInstance.post("/auth/register", payload);
    return data;
  }, []);

  const logout = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      register,
      refreshMe,
      setUser: (u) => {
        if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u));
        else localStorage.removeItem(STORAGE_USER);
        setUser(u);
      },
    }),
    [user, token, loading, login, logout, register, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
