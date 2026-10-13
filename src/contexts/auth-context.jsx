/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStorage } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(() => Boolean(tokenStorage.get()));

  useEffect(() => {
    if (!tokenStorage.get()) return;
    let active = true;
    api
      .get("/me")
      .then((res) => {
        if (!active) return;
        const userData = res.data ?? res;
        setUser(userData);
        setRole(userData.roles?.[0] ?? "user");
      })
      .catch(() => tokenStorage.clear())
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Handle token expiry while app is open
  useEffect(() => {
    const onUnauth = () => {
      setUser(null);
      setRole("user");
    };
    window.addEventListener("auth:unauthorized", onUnauth);
    return () => window.removeEventListener("auth:unauthorized", onUnauth);
  }, []);

  async function login({ email, password }) {
    const res = await api.post("/login", { email, password });
    tokenStorage.set(res.token);
    setUser(res.user);
    setRole(res.user?.roles?.[0] ?? "user");
    return res;
  }

  async function register({
    name,
    email,
    password,
    password_confirmation,
    department,
  }) {
    const res = await api.post("/register", {
      name,
      email,
      password,
      password_confirmation,
      department,
    });
    tokenStorage.set(res.token);
    setUser(res.user);
    setRole("user");
    return res;
  }

  async function logout() {
    try {
      await api.post("/logout");
    } catch {
      /* known bug — clear locally anyway */
    }
    tokenStorage.clear();
    setUser(null);
    setRole("user");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isAdmin: role === "admin",
        isModerator: role === "admin" || role === "moderator",
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
