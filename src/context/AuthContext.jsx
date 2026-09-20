import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, logout as appwriteLogout } from "../lib/authService";
import { getProfilePictureUrl } from "../lib/postService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // ── Helper: load user + avatar from Appwrite session ─────────────────
  async function loadUser() {
    try {
      const u = await getCurrentUser();
      setUser(u);
      // avatar stored in Appwrite prefs as avatarId
      const aid = u?.prefs?.avatarId;
      setAvatarUrl(aid ? getProfilePictureUrl(aid) : null);
    } catch {
      setUser(null);
      setAvatarUrl(null);
    } finally {
      setLoading(false);
    }
  }

  // On app load — check if user already has an active Appwrite session
  useEffect(() => { loadUser(); }, []);

  function login(userData) {
    setUser(userData);
    // re-fetch so prefs (including avatarId) are loaded
    loadUser();
  }

  async function logout() {
    try {
      await appwriteLogout();
    } catch {
      /* the session may already be invalid (e.g. account was blocked) */
    }
    setUser(null);
    setAvatarUrl(null);
  }

  // Call after any profile update (name, avatar) so navbar updates instantly
  async function refreshUser() {
    await loadUser();
  }

  const isLoggedIn = !!user;

  // Show spinner while checking session
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f7f4",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #f97316",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, avatarUrl, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}