import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserPosts, getUserDrafts, getImageUrl } from "../lib/postService";
import { account } from "../lib/appwrite";

export default function ProfilePage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [profile,   setProfile]   = useState({ name: "", email: "", bio: "", website: "", location: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [posts,     setPosts]     = useState([]);
  const [drafts,    setDrafts]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    document.title = "Profile | BlogSpace";
  }, []);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      try {
        // Load user prefs from Appwrite account prefs
        const prefs = await account.getPrefs();
        setProfile({
          name:     user.name                 || "Anonymous Writer",
          email:    user.email                || "",
          bio:      prefs.bio                 || "Welcome to my blog! I write about things I love.",
          website:  prefs.website             || "",
          location: prefs.location            || "",
        });

        const [userPosts, userDrafts] = await Promise.all([
          getUserPosts(user.$id),
          getUserDrafts(user.$id),
        ]);
        setPosts(userPosts);
        setDrafts(userDrafts);
      } catch (e) {
        console.log("Profile load error:", e.message);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try {
      // Save bio, website, location to Appwrite account preferences
      await account.updatePrefs({
        bio:      profile.bio,
        website:  profile.website,
        location: profile.location,
      });
      // Update name in Appwrite auth
      if (profile.name !== user.name) {
        await account.updateName(profile.name);
      }
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.log("Save error:", e.message);
    }
    setSaving(false);
  }

  const stats = [
    { label: "Posts",      value: posts.length,  icon: "📝" },
    { label: "Drafts",     value: drafts.length, icon: "✏️" },
    { label: "Categories", value: [...new Set([...posts, ...drafts].map((p) => p.category).filter(Boolean))].length, icon: "🏷️" },
  ];

  function getInitials(name = "") {
    return name.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  }

  const inputClass = "w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-all bg-gray-50 focus:bg-white";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f4] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 relative" />

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-1 mb-4">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 font-serif">
                {getInitials(profile.name)}
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`self-start sm:self-auto text-sm font-semibold px-4 py-2 rounded-xl transition-all
                  ${isEditing ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20"}`}>
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {!isEditing ? (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-serif">{profile.name}</h1>
                <p className="text-gray-400 text-sm">{profile.email}</p>
                {profile.bio && <p className="mt-3 text-gray-600 text-sm leading-relaxed max-w-lg">{profile.bio}</p>}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noreferrer"
                      className="text-orange-500 hover:underline flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
                {saved && <p className="text-sm text-emerald-600 font-medium mt-3">✓ Profile saved!</p>}
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {[
                  { label: "Full Name",  key: "name",     type: "text",  placeholder: "Your full name" },
                  { label: "Location",   key: "location", type: "text",  placeholder: "City, Country" },
                  { label: "Website",    key: "website",  type: "url",   placeholder: "https://yoursite.com" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{f.label}</label>
                    <input type={f.type} value={profile[f.key]} placeholder={f.placeholder}
                      onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                      className={inputClass} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Bio</label>
                  <textarea rows={3} value={profile.bio} placeholder="Tell the world about yourself…"
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className={inputClass + " resize-none"} />
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-colors text-sm">
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-2xl font-bold text-gray-900 mt-1 font-serif">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4 font-serif">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Write New Post",  path: "/write-post", color: "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20" },
              { label: "View My Posts",   path: "/myposts",    color: "bg-gray-900 hover:bg-gray-800 text-white" },
              { label: "View Drafts",     path: "/drafts",     color: "bg-gray-100 hover:bg-gray-200 text-gray-700" },
              { label: "Admin Dashboard", path: "/admin",      color: "bg-gray-100 hover:bg-gray-200 text-gray-700" },
            ].map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${action.color}`}>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        {posts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 font-serif">Recent Posts</h2>
              <button onClick={() => navigate("/myposts")} className="text-xs text-orange-500 hover:underline">View all</button>
            </div>
            <div className="space-y-2">
              {posts.slice(0, 3).map((post) => {
                const imgUrl = post.imageId ? getImageUrl(post.imageId) : null;
                return (
                  <div key={post.$id} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                    onClick={() => navigate(`/post/${post.$id}`)}>
                    {imgUrl
                      ? <img src={imgUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      : <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold">IMG</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{post.title}</p>
                      <p className="text-xs text-gray-400">{post.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
