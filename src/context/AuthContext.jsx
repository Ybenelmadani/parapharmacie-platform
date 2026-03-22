import React, { createContext, useContext, useEffect, useState } from "react";
import { http } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function fetchMe() {
    try {
      const res = await http.get("/me");
      setUser(res.data);
      return res.data;
    } catch (e) {
      localStorage.removeItem("token");
      setUser(null);
      return null;
    } finally {
      setBooting(false);
    }
  }

  useEffect(() => {
    if (token) fetchMe();
    else setBooting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const res = await http.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data;
  }

  async function register(payload) {
    const res = await http.post("/auth/register", payload);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data;
  }

  async function logout() {
    try {
      await http.post("/auth/logout");
    } catch (e) {
      // Front logout should still continue if the API call fails.
    }
    localStorage.removeItem("token");
    setUser(null);
  }

  async function refreshUser() {
    return fetchMe();
  }

  function updateUser(partialUser) {
    setUser((current) => ({ ...(current || {}), ...(partialUser || {}) }));
  }

  const value = { user, booting, login, register, logout, refreshUser, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
