import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/utils";
import {
  FaUser, FaLock, FaCog, FaFileAlt,
  FaEdit, FaSignOutAlt, FaTachometerAlt, FaTimes, FaBars,
} from "react-icons/fa";

// Avatar: photo if the user has one, initials otherwise.
// Defined at module level so it is not re-created on every Navbar render.
function Avatar({ size = "sm", avatarUrl, initials }) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold`}>
      {avatarUrl
        ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        : initials}
    </div>
  );
}

export default function Navbar({ onLogout }) {
  const { isLoggedIn, user, avatarUrl } = useAuth();
  const [menuOpen,      setMenuOpen]     = useState(false);
  const [profileOpen,   setProfileOpen]  = useState(false);
  const [activeSection, setActiveSection]= useState("home");
  const [scrolled,      setScrolled]     = useState(false);
  const profileRef = useRef(null);
  const location   = useLocation();
  const navigate   = useNavigate();

  const initials = getInitials(user?.name || "", user?.email || "");

  // ── Shadow on scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close profile dropdown on outside click ───────────────────────────
  useEffect(() => {
    function handleOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Close everything on route change ─────────────────────────────────
  useEffect(() => {
    // Intentional: reset the menus whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // ── Lock body scroll when mobile menu open ────────────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // ── Scrollspy ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "feedback", "contact"];
      let current = "home";
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) current = id;
        }
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function goTo(path) {
    navigate(path);
    setMenuOpen(false);
    setProfileOpen(false);
  }

  function scrollOrRedirect(id) {
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleLogout() {
    setMenuOpen(false);
    setProfileOpen(false);
    onLogout();
  }

  const navBtn = (id, label) => (
    <button onClick={() => scrollOrRedirect(id)}
      className={`text-sm px-3 py-2 rounded-lg transition-all cursor-pointer font-medium
        ${activeSection === id
          ? "bg-orange-500 text-white"
          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"}`}>
      {label}
    </button>
  );

  const dropItem = (path, icon, label) => (
    <button key={path} onClick={() => goTo(path)}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all text-left">
      <span className="text-gray-400 text-xs w-3">{icon}</span>
      {label}
    </button>
  );

  const drawerItem = (path, emoji, label) => (
    <button key={path} onClick={() => goTo(path)}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all text-left">
      <span className="w-5 text-center">{emoji}</span>
      {label}
    </button>
  );

  return (
    <>
      {/* ── Navbar bar ──────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 w-full z-50 bg-white transition-shadow duration-300
        ${scrolled ? "shadow-md" : "border-b border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="font-serif text-xl font-bold text-gray-900 cursor-pointer flex-shrink-0"
              onClick={() => scrollOrRedirect("home")}>
              Blog<span className="text-orange-600">Space</span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navBtn("home",     "Home")}
              {navBtn("about",    "About Us")}
              {navBtn("feedback", "Feedback")}
              {navBtn("contact",  "Contact Us")}
            </div>

            {/* Desktop right side */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn && (
                <button onClick={() => goTo("/write-post")}
                  className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  + Write Post
                </button>
              )}

              {!isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => goTo("/login")}
                    className="text-sm px-4 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 font-medium transition-all">
                    Login
                  </button>
                  <button onClick={() => goTo("/signup")}
                    className="text-sm px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors shadow-sm shadow-orange-500/20">
                    Sign Up
                  </button>
                </div>
              ) : (
                // Desktop profile dropdown
                <div ref={profileRef} className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                    <Avatar size="sm" avatarUrl={avatarUrl} initials={initials} />
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user?.name?.split(" ")[0] || "Account"}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  <div className={`absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 origin-top-right
                    ${profileOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>

                    {/* User info */}
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                    </div>

                    {/* Links */}
                    <div className="p-1.5">
                      {dropItem("/profile",         <FaUser />,          "View Profile")}
                      {dropItem("/myposts",          <FaFileAlt />,       "My Posts")}
                      {dropItem("/drafts",           <FaEdit />,          "Drafts")}
                      {dropItem("/explore-posts",    "🔍",                "Explore Posts")}
                      {dropItem("/settings",         <FaCog />,           "Settings")}
                      {dropItem("/edit-profile",     <FaUser />,          "Edit Profile")}
                      {dropItem("/change-password",  <FaLock />,          "Change Password")}
                      {dropItem("/admin",            <FaTachometerAlt />, "Admin Dashboard")}
                    </div>

                    {/* Logout */}
                    <div className="p-1.5 border-t border-gray-100">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <FaSignOutAlt className="text-xs" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile right side */}
            <div className="flex md:hidden items-center gap-2">
              {isLoggedIn && (
                <button onClick={() => goTo("/write-post")}
                  className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                  + Write
                </button>
              )}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all">
                {menuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Dark backdrop ────────────────────────────────────────────────── */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300
          ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* ── Mobile slide-in drawer ───────────────────────────────────────── */}
      <div className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 md:hidden shadow-2xl
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-serif text-lg font-bold text-gray-900">
            Blog<span className="text-orange-600">Space</span>
          </span>
          <button onClick={() => setMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <FaTimes size={14} />
          </button>
        </div>

        {/* User info (logged in) */}
        {isLoggedIn && (
          <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
            <div className="flex items-center gap-3">
              <Avatar size="lg" avatarUrl={avatarUrl} initials={initials} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
              </div>
            </div>
          </div>
        )}

        {/* Drawer scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Navigation */}
          <div className="px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">Navigation</p>
            <button onClick={() => scrollOrRedirect("home")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all mb-0.5 text-left
                ${activeSection === "home" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}`}>
              🏠 Home
            </button>
            <button onClick={() => scrollOrRedirect("about")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all mb-0.5 text-left">
              ℹ️ About Us
            </button>
            <button onClick={() => scrollOrRedirect("feedback")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all mb-0.5 text-left">
              💬 Feedback
            </button>
            <button onClick={() => scrollOrRedirect("contact")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all mb-0.5 text-left">
              📞 Contact Us
            </button>
          </div>

          {isLoggedIn ? (
            <>
              {/* Content */}
              <div className="px-3 py-2 border-t border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">Content</p>
                {drawerItem("/explore-posts", "🔍", "Explore Posts")}
                {drawerItem("/write-post",    "✏️", "Write Post")}
                {drawerItem("/myposts",       "📝", "My Posts")}
                {drawerItem("/drafts",        "📋", "Drafts")}
              </div>

              {/* Account */}
              <div className="px-3 py-2 border-t border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">Account</p>
                {drawerItem("/profile",         "👤", "View Profile")}
                {drawerItem("/edit-profile",    "✏️", "Edit Profile")}
                {drawerItem("/change-password", "🔒", "Change Password")}
                {drawerItem("/settings",        "⚙️", "Settings")}
                {drawerItem("/admin",           "🛡️", "Admin Dashboard")}
              </div>

              {/* Logout */}
              <div className="px-3 py-2 border-t border-gray-100">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all text-left">
                  <FaSignOutAlt className="text-xs" /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="px-3 py-3 border-t border-gray-100 space-y-2">
              <button onClick={() => goTo("/login")}
                className="w-full flex items-center justify-center py-3 text-sm font-semibold text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-600 rounded-xl transition-all">
                Login
              </button>
              <button onClick={() => goTo("/signup")}
                className="w-full flex items-center justify-center py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-md shadow-orange-500/20">
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}