import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, logout as appwriteLogout } from "../lib/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — check if user already has an active Appwrite session
  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function login(userData) {
    setUser(userData);
  }

  async function logout() {
    await appwriteLogout();
    setUser(null);
  }

  // ── refreshUser ──────────────────────────────────────────────────────
  // Call this after any profile update (name, avatar, etc.)
  // so the navbar and all other components reflect the new data instantly
  async function refreshUser() {
    try {
      const updated = await getCurrentUser();
      setUser(updated);
    } catch {
      // session expired or error — don't crash
    }
  }

  const isLoggedIn = !!user;

  // Show spinner while checking session — prevents flash of login page on refresh
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0e0d",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #f97316",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    // refreshUser is now exposed so any page can trigger a user state refresh
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
