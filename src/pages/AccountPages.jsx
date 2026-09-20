import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "../lib/appwrite";
import { useAuth } from "../context/AuthContext";
import { uploadProfilePicture, deleteImage } from "../lib/postService";

// ─── EditProfilePage ──────────────────────────────────────────────────────────
export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser, avatarUrl } = useAuth();
  const [name,        setName]       = useState("");
  const [saved,       setSaved]      = useState(false);
  const [saving,      setSaving]     = useState(false);
  const [error,       setError]      = useState("");
  const [focused,     setFocused]    = useState("");
  // ── Photo state ──────────────────────────────────────────────────────
  const [photoFile,   setPhotoFile]  = useState(null);       // selected File object
  const [photoPreview,setPhotoPreview] = useState(avatarUrl || null); // existing avatar, or local blob URL after picking a file
  const [uploading,   setUploading]  = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = "Edit Profile | BlogSpace";
    account.get().then((u) => setName(u.name || "")).catch(() => {});
  }, []);

  // ── Handle file selection ─────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file."); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB."); return;
    }
    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file)); // instant local preview
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      // ── 1. Upload new photo if selected ────────────────────────────
      if (photoFile) {
        setUploading(true);
        // Delete old avatar from storage if exists
        const oldAvatarId = user?.prefs?.avatarId;
        if (oldAvatarId) {
          await deleteImage(oldAvatarId).catch(() => {}); // silent fail ok
        }
        const newFileId = await uploadProfilePicture(photoFile);
        // Save avatarId to Appwrite prefs
        await account.updatePrefs({ ...user?.prefs, avatarId: newFileId });
        setUploading(false);
      }

      // ── 2. Update display name ──────────────────────────────────────
      await account.updateName(name.trim());

      // ── 3. Refresh context so navbar updates instantly ──────────────
      await refreshUser();

      setSaved(true);
      setTimeout(() => { setSaved(false); navigate("/settings"); }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
      setUploading(false);
    }
    setSaving(false);
  }

  const inputClass = (f) =>
    `w-full border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all bg-gray-50 focus:bg-white
    ${focused === f ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200 hover:border-gray-300"}`;

  const initials = (user?.name || user?.email || "U")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <FormPage title="Edit Profile" subtitle="Update your display name and photo" onBack={() => navigate("/settings")}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>

        {/* ── Profile Photo Upload ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          {/* Avatar preview */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-orange-100 flex-shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile"
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
            </div>
            {/* Remove button — only if there's a photo */}
            {photoPreview && (
              <button type="button" onClick={handleRemovePhoto}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-md">
                ✕
              </button>
            )}
          </div>

          {/* Upload / Change button */}
          <div className="flex flex-col items-center gap-1">
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="text-sm text-orange-600 hover:text-orange-700 font-semibold border border-orange-200 hover:border-orange-400 px-4 py-1.5 rounded-lg transition-all bg-orange-50 hover:bg-orange-100">
              {photoPreview ? "Change Photo" : "Upload Photo"}
            </button>
            <p className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB</p>
          </div>

          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/*"
            onChange={handleFileChange} className="hidden" />
        </div>

        {/* ── Name field ───────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
            placeholder="Your full name" className={inputClass("name")} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {saved ? (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl">
            ✓ Profile updated! Redirecting…
          </div>
        ) : (
          <button type="submit" disabled={saving || uploading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl shadow-md shadow-orange-500/20 transition-colors text-sm">
            {uploading ? "Uploading photo…" : saving ? "Saving…" : "Save Changes"}
          </button>
        )}
      </form>
    </FormPage>
  );
}

// ─── ChangePasswordPage ───────────────────────────────────────────────────────
export function ChangePasswordPage() {
  const navigate  = useNavigate();
  const [oldPw,   setOldPw]   = useState("");
  const [newPw,   setNewPw]   = useState("");
  const [confPw,  setConfPw]  = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [show,    setShow]    = useState({ old: false, new: false, conf: false });

  useEffect(() => { document.title = "Change Password | BlogSpace"; }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!oldPw || !newPw || !confPw) { setError("All fields are required."); return; }
    if (newPw.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (!/\d/.test(newPw) || !/[!@#$%^&*]/.test(newPw)) {
      setError("Include a number and special character in new password."); return;
    }
    if (newPw !== confPw) { setError("Passwords do not match."); return; }
    if (oldPw === newPw) { setError("New password must be different from current password."); return; }

    setLoading(true);
    try {
      await account.updatePassword(newPw, oldPw);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); navigate("/settings"); }, 2000);
    } catch (err) {
      if (err.message.includes("Invalid credentials") || err.message.includes("password")) {
        setError("Current password is incorrect. Please try again.");
      } else {
        setError(err.message || "Failed to update password.");
      }
    }
    setLoading(false);
  }

  const inputClass = (f) =>
    `w-full border rounded-xl px-4 py-3 pr-16 text-sm text-gray-800 outline-none transition-all bg-gray-50 focus:bg-white
    ${focused === f ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200 hover:border-gray-300"}`;

  const fields = [
    { id: "old-pw",  label: "Current Password",    val: oldPw,  set: setOldPw,  key: "old",  showKey: "old"  },
    { id: "new-pw",  label: "New Password",         val: newPw,  set: setNewPw,  key: "new",  showKey: "new"  },
    { id: "conf-pw", label: "Confirm New Password", val: confPw, set: setConfPw, key: "conf", showKey: "conf" },
  ];

  return (
    <FormPage title="Change Password" subtitle="Keep your account secure with a strong password" onBack={() => navigate("/settings")}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {fields.map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{f.label}</label>
            <div className="relative">
              <input id={f.id} type={show[f.showKey] ? "text" : "password"} value={f.val}
                onChange={(e) => f.set(e.target.value)}
                onFocus={() => setFocused(f.key)} onBlur={() => setFocused("")}
                placeholder="••••••••" className={inputClass(f.key)} />
              <button type="button" onClick={() => setShow({ ...show, [f.showKey]: !show[f.showKey] })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                {show[f.showKey] ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        ))}

        {newPw.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {[
              { label: "8+ characters",   pass: newPw.length >= 8 },
              { label: "Number",          pass: /\d/.test(newPw) },
              { label: "Special char",    pass: /[!@#$%^&*]/.test(newPw) },
              { label: "Passwords match", pass: newPw.length > 0 && newPw === confPw },
            ].map((c) => (
              <span key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? "text-emerald-600" : "text-gray-400"}`}>
                <span className="text-[10px]">{c.pass ? "✓" : "○"}</span>{c.label}
              </span>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success ? (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl">
            ✓ Password updated! Redirecting…
          </div>
        ) : (
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl shadow-md shadow-orange-500/20 transition-colors text-sm">
            {loading ? "Updating…" : "Update Password"}
          </button>
        )}
      </form>
    </FormPage>
  );
}

// ─── DeleteAccountPage ────────────────────────────────────────────────────────
export function DeleteAccountPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [confirm,  setConfirm]  = useState("");
  const [focused,  setFocused]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");
  const PHRASE = "DELETE";
  const ready  = confirm === PHRASE;

  useEffect(() => { document.title = "Delete Account | BlogSpace"; }, []);

  async function handleDelete() {
    if (!ready) return;
    setDeleting(true);
    setError("");
    try {
      // The browser SDK cannot hard-delete a user, so this blocks the account
      // (Appwrite keeps the record but the user can no longer sign in).
      await account.updateStatus();
    } catch (e) {
      setDeleting(false);
      setError(e?.message || "Could not delete your account. Please try again.");
      return;
    }
    await logout(); // clears the session and the in-memory user
    navigate("/login");
  }

  return (
    <FormPage title="Delete Account" subtitle="Your account will be disabled and you will be signed out" onBack={() => navigate("/settings")} danger>
      <div className="space-y-5">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">Before you continue</p>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• You will be signed out and will not be able to sign in again</li>
            <li>• Posts you already published stay visible under your name</li>
            <li>• To have your content removed too, contact the site admin</li>
          </ul>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            Type <span className="text-red-600 font-mono">{PHRASE}</span> to confirm
          </label>
          <input type="text" value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder={PHRASE}
            className={`w-full border rounded-xl px-4 py-3 text-sm font-mono outline-none transition-all bg-gray-50
              ${focused ? "border-red-400 ring-2 ring-red-100" : "border-gray-200"}`} />
        </div>
        {error && (
          <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={handleDelete} disabled={!ready || deleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm">
            {deleting ? "Deleting…" : "Delete My Account"}
          </button>
          <button onClick={() => navigate("/settings")}
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">
            Cancel
          </button>
        </div>
      </div>
    </FormPage>
  );
}

// ─── Shared FormPage wrapper ──────────────────────────────────────────────────
function FormPage({ title, subtitle, children, onBack, danger }) {
  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16 px-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Settings
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${danger ? "bg-red-100" : "bg-orange-100"}`}>
            {danger ? (
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
          </div>
          <h1 className={`text-2xl font-bold mb-1 font-serif ${danger ? "text-red-700" : "text-gray-900"}`}>{title}</h1>
          <p className="text-sm text-gray-400 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}