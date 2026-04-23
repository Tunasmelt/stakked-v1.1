import React, { createContext, useContext, useState, useEffect } from "react";
import api, { formatError } from "../utils/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not authed

  useEffect(() => {
    api.get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => setUser(null));
  }, []);

  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    setUser(r.data);
    return r.data;
  };

  const register = async (email, password, name, artist_type) => {
    const r = await api.post("/auth/register", { email, password, name, artist_type });
    setUser(r.data);
    return r.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, register, logout, formatError }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
