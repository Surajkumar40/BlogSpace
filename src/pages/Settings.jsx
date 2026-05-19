import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { safeLocalGet, safeLocalSet } from "../utils/utils";

const ACCENT_OPTIONS = [
  { label: "Orange", value: "orange", bg: "bg-orange-500", hex: "#f97316" },
  { label: "Blue",   value: "blue",   bg: "bg-blue-500",   hex: "#3b82f6" },
  { label: "Purple", value: "purple", bg: "bg-violet-500", hex: "#8b5cf6" },
  { label: "Green",  value: "green",  bg: "bg-emerald-500",hex: "#10b981" },
  { label: "Rose",   value: "rose",   bg: "bg-rose-500",   hex: "#f43f5e" },
  { label: "Cyan",   value: "cyan",   bg: "bg-cyan-500",   hex: "#06b6d4" },
];

const defaults = { theme: "light", fontSize: "medium", accent: "orange", notifications: true, compactMode: false };

function Toggle({ checked, onChange, id }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400
        ${checked ? "bg-orange-500" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-300 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(() => {
    const p = safeLocalGet("userPrefs", {});
    return { ...defaults, ...p };
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", prefs.theme === "dark");
    const sizeMap = { small: "14px", medium: "16px", large: "18px" };
    root.style.fontSize = sizeMap[prefs.fontSize] || "16px";
    const accent = ACCENT_OPTIONS.find((a) => a.value === prefs.accent);
    if (accent) root.style.setProperty("--color-accent", accent.hex);
  }, [prefs.theme, prefs.fontSize, prefs.accent]);


   useEffect(() => { document.title = "Settings | BlogSpace"; }, []);
   
  function handleSave() {
    safeLocalSet("userPrefs", prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setPrefs(defaults);
    safeLocalSet("userPrefs", defaults);
  }

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Preferences</p>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Customise your BlogSpace experience</p>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-base mb-5 font-serif">Appearance</h2>
          <div className="space-y-6">

            {/* Theme */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }].map((opt) => (
                  <button key={opt.value} onClick={() => setPrefs({ ...prefs, theme: opt.value })}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all
                      ${prefs.theme === opt.value ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Accent Colour</p>
              <div className="flex flex-wrap gap-3">
                {ACCENT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setPrefs({ ...prefs, accent: opt.value })} title={opt.label}
                    className={`w-9 h-9 rounded-full ${opt.bg} transition-all hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400
                      ${prefs.accent === opt.value ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                    aria-label={opt.label} aria-pressed={prefs.accent === opt.value} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Selected: <span className="font-semibold capitalize text-gray-600">{prefs.accent}</span></p>
            </div>

            {/* Font Size */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Font Size</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ value: "small", label: "Small", preview: "text-xs" }, { value: "medium", label: "Medium", preview: "text-sm" }, { value: "large", label: "Large", preview: "text-base" }].map((opt) => (
                  <button key={opt.value} onClick={() => setPrefs({ ...prefs, fontSize: opt.value })}
                    className={`py-2.5 rounded-xl border flex flex-col items-center gap-0.5 transition-all
                      ${prefs.fontSize === opt.value ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                    <span className={`${opt.preview} font-bold`}>Aa</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-base mb-5 font-serif">Preferences</h2>
          <div className="space-y-4">
            {[
              { key: "notifications", label: "Enable Notifications",  desc: "Get notified about activity on your posts", id: "toggle-notif" },
              { key: "compactMode",   label: "Compact Mode",          desc: "Reduce spacing for a denser layout",         id: "toggle-compact" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label htmlFor={item.id} className="text-sm font-semibold text-gray-700 cursor-pointer">{item.label}</label>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <Toggle id={item.id} checked={prefs[item.key]} onChange={(v) => setPrefs({ ...prefs, [item.key]: v })} />
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-base mb-5 font-serif">Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Edit Profile",    path: "/edit-profile",    style: "border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700" },
              { label: "Change Password", path: "/change-password", style: "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700" },
              { label: "View Profile",    path: "/profile",         style: "border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-700" },
              { label: "Delete Account",  path: "/delete-account",  style: "border-red-200 text-red-600 hover:bg-red-50" },
            ].map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all ${item.style}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save / Reset */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleSave}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition-colors text-sm">
            Save Preferences
          </button>
          <button onClick={handleReset}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl border border-gray-200 transition-colors text-sm">
            Reset to Defaults
          </button>
        </div>

        {saved && (
          <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl">
            ✓ Preferences saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
