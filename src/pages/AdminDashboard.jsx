import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { wordCount, formatDate } from "../utils/utils";
import { CATEGORY_COLORS } from "../utils/theme";
import {
  getAllPosts, deletePost,
  getAllDrafts, deleteDraft,   // ← getAllDrafts instead of getUserDrafts
  getImageUrl,
} from "../lib/postService";
import { databases, DATABASE_ID, MESSAGES_ID, PROFILES_ID } from "../lib/appwrite";
import { Query } from "appwrite";

const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || "admin@blogspace.com";
const ADMIN_PIN_HASH = import.meta.env.VITE_ADMIN_PIN_HASH || "";

async function hashPin(pin) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminDashboard() {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  // Auth state
  const [verified,     setVerified]     = useState(() => sessionStorage.getItem("adminVerified") === "true");
  const [emailInput,   setEmailInput]   = useState("");
  const [pinInput,     setPinInput]     = useState("");
  const [loginError,   setError]        = useState("");
  const [showPin,      setShowPin]      = useState(false);
  const [shake,        setShake]        = useState(false);
  const [attempts,     setAttempts]     = useState(0);
  const [locked,       setLocked]       = useState(false);
  const [lockTimer,    setLockTimer]    = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);

  // Data state
  const [posts,           setPosts]           = useState([]);
  const [drafts,          setDrafts]          = useState([]);
  const [users,           setUsers]           = useState([]);
  const [messages,        setMessages]        = useState([]);
  const [dataLoading,     setDataLoading]     = useState(false);
  const [activeTab,       setActiveTab]       = useState("overview");
  const [deletingId,      setDeletingId]      = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [expandedMsg,     setExpandedMsg]     = useState(null);

  useEffect(() => {
    document.title = verified ? "Admin Dashboard | BlogSpace" : "Admin Login | BlogSpace";
  }, [verified]);

  useEffect(() => {
    if (!verified) return;
    async function fetchAll() {
      setDataLoading(true);
      try {
        const [allPosts, allDrafts, allUsers, allMessages] = await Promise.all([
          getAllPosts(),
         getAllDrafts(),
          databases.listDocuments(DATABASE_ID, PROFILES_ID, [Query.orderDesc("$createdAt")]).then(r => r.documents),
          databases.listDocuments(DATABASE_ID, MESSAGES_ID, [Query.orderDesc("$createdAt")]).then(r => r.documents),
        ]);
        setPosts(allPosts);
        setDrafts(allDrafts);
        setUsers(allUsers);
        setMessages(allMessages);
      } catch (e) {
        console.log("Admin fetch error:", e.message);
      }
      setDataLoading(false);
    }
    fetchAll();
  }, [verified, user]);

  useEffect(() => {
    if (!locked) return;
    if (lockTimer <= 0) { setLocked(false); setAttempts(0); return; }
    const t = setTimeout(() => setLockTimer((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [locked, lockTimer]);

  async function handleLogin() {
    if (locked || loginLoading) return;
    setLoginLoading(true);
    if (emailInput.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      recordFail(); setLoginLoading(false); return;
    }
    const enteredHash = await hashPin(pinInput);
    if (enteredHash === ADMIN_PIN_HASH) {
      sessionStorage.setItem("adminVerified", "true");
      setVerified(true); setError("");
    } else { recordFail(); }
    setLoginLoading(false);
  }

  function recordFail() {
    const n = attempts + 1; setAttempts(n);
    setShake(true); setTimeout(() => setShake(false), 600);
    if (n >= 3) { setLocked(true); setLockTimer(30); setError("Too many failed attempts. Locked for 30 seconds."); }
    else { setError(`Incorrect credentials. ${3 - n} attempt${3 - n !== 1 ? "s" : ""} remaining.`); }
    setPinInput("");
  }

  function handleLogout() {
    sessionStorage.removeItem("adminVerified");
    setVerified(false); setEmailInput(""); setPinInput("");
  }

  async function handleDeletePost(id) {
    setDeletingId(id);
    try { await deletePost(id); setPosts((p) => p.filter((x) => x.$id !== id)); }
    catch (e) { console.log(e.message); }
    setDeletingId(null); setConfirmDeleteId(null);
  }

  async function handleDeleteDraft(id) {
    try { await deleteDraft(id); setDrafts((d) => d.filter((x) => x.$id !== id)); }
    catch (e) { console.log(e.message); }
    setConfirmDeleteId(null);
  }

  async function handleDeleteMessage(id) {
    try {
      await databases.deleteDocument(DATABASE_ID, MESSAGES_ID, id);
      setMessages((m) => m.filter((x) => x.$id !== id));
    } catch (e) { console.log(e.message); }
    setConfirmDeleteId(null);
  }

  // ── Login Gate ──────────────────────────────────────────────────────────────
  if (!verified) {
    return (
      <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center px-4 pt-16">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-[120px]" />
        </div>
        <div className={`w-full max-w-md relative z-10 transition-all duration-300 ${shake ? "animate-shake" : ""}`}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white font-serif">Admin Access</h1>
              <p className="text-orange-100 text-sm mt-1">Restricted area — authorised users only</p>
            </div>
            <div className="px-8 py-7 space-y-4">
              {locked && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold px-4 py-3 rounded-xl">🔒 Locked — wait {lockTimer}s</div>}
              {loginError && !locked && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{loginError}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Admin Email</label>
                <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} disabled={locked} placeholder="admin@blogspace.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Admin PIN</label>
                <div className="relative">
                  <input type={showPin ? "text" : "password"} value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    disabled={locked} placeholder="Enter PIN" maxLength={16}
                    className="w-full bg-white/5 border border-white/10 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl px-4 py-3 pr-16 text-sm text-white placeholder-gray-600 outline-none transition-all disabled:opacity-50" />
                  <button type="button" onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200 font-medium">
                    {showPin ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                {[1,2,3].map((n) => <div key={n} className={`w-2 h-2 rounded-full transition-colors ${attempts >= n ? "bg-red-400" : "bg-white/10"}`} />)}
                <span className="text-xs text-gray-600 ml-1">failed attempts</span>
              </div>
              <button onClick={handleLogin} disabled={locked || !emailInput || !pinInput || loginLoading}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/30 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow transition text-sm flex items-center justify-center gap-2">
                {loginLoading ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Verifying…</> : locked ? `Locked (${lockTimer}s)` : "Enter Dashboard"}
              </button>
              <button onClick={() => navigate("/")} className="w-full text-center text-sm text-gray-500 hover:text-gray-300 py-1">← Back to site</button>
            </div>
          </div>
          <p className="text-center text-gray-600 text-xs mt-4">Session expires when browser tab is closed</p>
        </div>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}.animate-shake{animation:shake 0.5s ease-in-out;}`}</style>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const allContent      = [...posts, ...drafts];
  const categories      = allContent.reduce((acc, item) => { const c = item.category || "Other"; acc[c] = (acc[c] || 0) + 1; return acc; }, {});
  const categoryEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const maxCatCount     = categoryEntries[0]?.[1] || 1;

  const monthlyData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("default", { month: "short" });
      const count = posts.filter((p) => {
        const pd = new Date(p.$createdAt || p.date);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ label, count });
    }
    return months;
  })();
  const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);

  const TABS = [
    { id: "overview",  label: "Overview"  },
    { id: "posts",     label: "Posts"     },
    { id: "drafts",    label: "Drafts"    },
    { id: "users",     label: `Users (${users.length})`     },
    { id: "messages",  label: `Messages (${messages.length})` },
    { id: "analytics", label: "Analytics" },
  ];

  const statCards = [
    { label: "Published Posts", value: posts.length,                   color: "bg-orange-500",  sub: "Total published" },
    { label: "Saved Drafts",    value: drafts.length,                  color: "bg-blue-500",    sub: "Pending publish" },
    { label: "Registered Users",value: users.length,                   color: "bg-violet-500",  sub: "Total users"     },
    { label: "Messages",        value: messages.length,                color: "bg-emerald-500", sub: "Contact inbox"   },
  ];

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#f9f7f4] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-12">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Logged in as <span className="font-semibold text-orange-500">{user?.name || "Admin"}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate("/write-post")} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition">+ New Post</button>
            <button onClick={() => navigate("/")} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition">← Back to Site</button>
            <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 rounded-xl transition">Lock</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition
                ${activeTab === tab.id ? "bg-orange-500 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className={`${card.color} rounded-2xl p-5 text-white shadow-md`}>
                  <div className="text-3xl font-bold mb-2 font-serif">{card.value}</div>
                  <p className="font-semibold text-sm">{card.label}</p>
                  <p className="text-xs opacity-75 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Posts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800 font-serif">Recent Posts</h2>
                  <button onClick={() => setActiveTab("posts")} className="text-xs text-orange-500 hover:underline">View all</button>
                </div>
                {posts.length === 0 ? <p className="text-center py-8 text-gray-400 text-sm">No posts yet</p> : (
                  <div className="space-y-2">
                    {posts.slice(0, 5).map((post) => {
                      const imgUrl = post.imageId ? getImageUrl(post.imageId) : null;
                      return (
                        <div key={post.$id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50 transition">
                          {imgUrl ? <img src={imgUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold">IMG</div>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{post.title || "Untitled"}</p>
                            <p className="text-xs text-gray-400">{post.author} · {formatDate(post.$createdAt)}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-semibold ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-500"}`}>{post.category || "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Messages */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800 font-serif">Recent Messages</h2>
                  <button onClick={() => setActiveTab("messages")} className="text-xs text-orange-500 hover:underline">View all</button>
                </div>
                {messages.length === 0 ? <p className="text-center py-8 text-gray-400 text-sm">No messages yet</p> : (
                  <div className="space-y-2">
                    {messages.slice(0, 5).map((msg) => (
                      <div key={msg.$id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50 transition">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-600 text-xs font-bold">
                          {msg.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{msg.name}</p>
                          <p className="text-xs text-gray-500 truncate">{msg.subject}</p>
                          <p className="text-xs text-gray-400">{formatDate(msg.$createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── POSTS ── */}
        {activeTab === "posts" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div><h2 className="font-bold text-gray-800 text-lg font-serif">Published Posts</h2><p className="text-sm text-gray-400">{posts.length} total</p></div>
              <button onClick={() => navigate("/write-post")} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition">+ New Post</button>
            </div>
            {posts.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-gray-400"><p className="text-sm">No posts yet</p></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Post</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell font-semibold">Author</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell font-semibold">Category</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell font-semibold">Date</th>
                      <th className="px-4 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {posts.map((post) => {
                      const imgUrl = post.imageId ? getImageUrl(post.imageId) : null;
                      return (
                        <tr key={post.$id} className={`hover:bg-orange-50 transition-all duration-300 ${deletingId === post.$id ? "opacity-0" : "opacity-100"}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {imgUrl ? <img src={imgUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold">IMG</div>}
                              <p className="font-semibold text-gray-800 line-clamp-1 max-w-xs">{post.title || "Untitled"}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">{post.author || "—"}</td>
                          <td className="px-4 py-3 hidden md:table-cell"><span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-500"}`}>{post.category || "—"}</span></td>
                          <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">{formatDate(post.$createdAt)}</td>
                          <td className="px-4 py-3">
                            {confirmDeleteId === post.$id ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => handleDeletePost(post.$id)} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-semibold transition">Delete</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-semibold transition">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => navigate(`/write-post/${post.$id}?type=posts`)} className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-lg font-semibold transition">Edit</button>
                                <button onClick={() => setConfirmDeleteId(post.$id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-semibold border border-red-200 transition">Delete</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── DRAFTS ── */}
        {activeTab === "drafts" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg font-serif">Saved Drafts</h2>
              <p className="text-sm text-gray-400">{drafts.length} drafts</p>
            </div>
            {drafts.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-gray-400"><p className="text-sm">No drafts saved yet</p></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Draft</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell font-semibold">Category</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell font-semibold">Saved</th>
                      <th className="px-4 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {drafts.map((draft) => {
                      const imgUrl = draft.imageId ? getImageUrl(draft.imageId) : null;
                      return (
                        <tr key={draft.$id} className="hover:bg-blue-50 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {imgUrl ? <img src={imgUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 text-xs font-bold">DFT</div>}
                              <div>
                                <p className="font-semibold text-gray-800 line-clamp-1">{draft.title || <span className="italic text-gray-400">Untitled</span>}</p>
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Draft</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell"><span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${CATEGORY_COLORS[draft.category] || "bg-gray-100 text-gray-500"}`}>{draft.category || "—"}</span></td>
                          <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">{formatDate(draft.$createdAt)}</td>
                          <td className="px-4 py-3">
                            {confirmDeleteId === draft.$id ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => handleDeleteDraft(draft.$id)} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-semibold transition">Delete</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-semibold transition">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => navigate(`/drafts/${draft.$id}/edit`)} className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-lg font-semibold transition">Edit</button>
                                <button onClick={() => setConfirmDeleteId(draft.$id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-semibold border border-red-200 transition">Delete</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg font-serif">Registered Users</h2>
              <p className="text-sm text-gray-400">{users.length} total users</p>
            </div>
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-sm">No users registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">User</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell font-semibold">Email</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell font-semibold">Joined</th>
                      <th className="px-4 py-3 text-center font-semibold">Posts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => {
                      const userPostCount = posts.filter((p) => p.userId === u.userId).length;
                      return (
                        <tr key={u.$id} className="hover:bg-orange-50 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {u.name?.[0]?.toUpperCase() || "U"}
                              </div>
                              <p className="font-semibold text-gray-800">{u.name || "Anonymous"}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{u.email}</td>
                          <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">{formatDate(u.$createdAt)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${userPostCount > 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                              {userPostCount} {userPostCount === 1 ? "post" : "posts"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-800 text-lg font-serif">Contact Messages</h2>
                <p className="text-sm text-gray-400">{messages.length} message{messages.length !== 1 ? "s" : ""} received</p>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400">
                <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {messages.map((msg) => (
                  <div key={msg.$id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {msg.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{msg.name}</p>
                            <p className="text-xs text-gray-400">{msg.email}</p>
                            {msg.phone && <p className="text-xs text-gray-400">{msg.phone}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-400">{formatDate(msg.$createdAt)}</span>
                          {confirmDeleteId === msg.$id ? (
                            <>
                              <button onClick={() => handleDeleteMessage(msg.$id)} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-semibold transition">Delete</button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-semibold transition">Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(msg.$id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-semibold border border-red-200 transition">Delete</button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pl-13">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Subject: <span className="text-orange-600">{msg.subject}</span>
                        </p>
                        <div className={`text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100 ${expandedMsg === msg.$id ? "" : "line-clamp-3"}`}>
                          {msg.message}
                        </div>
                        {msg.message?.length > 200 && (
                          <button onClick={() => setExpandedMsg(expandedMsg === msg.$id ? null : msg.$id)}
                            className="text-xs text-orange-500 hover:underline mt-2">
                            {expandedMsg === msg.$id ? "Show less" : "Read more"}
                          </button>
                        )}
                        <div className="mt-3">
                          <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                            className="inline-flex items-center gap-2 text-xs bg-gray-900 hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Reply via Email
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Publish Rate",    value: posts.length + drafts.length > 0 ? Math.round((posts.length / (posts.length + drafts.length)) * 100) + "%" : "0%", sub: "Posts vs total content" },
                { label: "Avg. Words/Post", value: posts.length > 0 ? Math.round(posts.reduce((a, p) => a + (p.content ? wordCount(p.content.replace(/<[^>]*>/g, " ")) : 0), 0) / posts.length) : 0, sub: "Average word count" },
                { label: "Top Category",    value: categoryEntries[0]?.[0] || "—", sub: `${categoryEntries[0]?.[1] || 0} posts` },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-2xl font-bold text-gray-900 mb-1 font-serif">{item.value}</div>
                  <p className="font-semibold text-gray-700 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-1 font-serif">Posts Published — Last 6 Months</h2>
              <p className="text-xs text-gray-400 mb-6">Monthly publishing activity</p>
              <div className="flex items-end gap-3 h-40">
                {monthlyData.map((m) => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-600">{m.count > 0 ? m.count : ""}</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-orange-300 transition-all duration-700"
                      style={{ height: `${(m.count / maxMonthly) * 110 + (m.count > 0 ? 8 : 2)}px`, minHeight: "4px" }} />
                    <span className="text-xs text-gray-400">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {categoryEntries.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-800 mb-4 font-serif">Category Distribution</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryEntries.map(([cat, count], i) => {
                    const pct = Math.round((count / allContent.length) * 100);
                    const colors = ["from-orange-400 to-orange-600","from-blue-400 to-blue-600","from-violet-400 to-violet-600","from-emerald-400 to-emerald-600","from-pink-400 to-pink-600","from-amber-400 to-amber-600","from-cyan-400 to-cyan-600"];
                    return (
                      <div key={cat} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-xs shrink-0`}>{pct}%</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700">{cat}</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div className={`h-1.5 rounded-full bg-gradient-to-r ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
