import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { account } from "../lib/appwrite";

export default function ResetPassword() {
  const navigate           = useNavigate();
  const [searchParams]     = useSearchParams();
  const [newPassword, setNewPass]  = useState("");
  const [confirmPass, setConfPass] = useState("");
  const [showNew,  setShowNew]     = useState(false);
  const [showConf, setShowConf]    = useState(false);
  const [status,   setStatus]      = useState("idle");
  const [errorMsg, setErrorMsg]    = useState("");
  const [focused,  setFocused]     = useState("");

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  useEffect(() => {
    document.title = "Reset Password | BlogSpace";
    if (!userId || !secret) setStatus("invalid");
  }, [userId, secret]);

  async function handleReset(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!newPassword || !confirmPass) { setErrorMsg("Both fields are required."); return; }
    if (newPassword.length < 8) { setErrorMsg("Password must be at least 8 characters."); return; }
    if (!/\d/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
      setErrorMsg("Include a number and special character (!@#$%^&*)."); return;
    }
    if (newPassword !== confirmPass) { setErrorMsg("Passwords do not match."); return; }

    setStatus("loading");
    try {
      await account.updateRecovery(userId, secret, newPassword);
      setStatus("success");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setStatus("error");
      if (err.message.includes("expired") || err.message.includes("invalid")) {
        setErrorMsg("This reset link has expired. Please request a new one.");
      } else {
        setErrorMsg(err.message || "Something went wrong. Please try again.");
      }
    }
  }

  const inputClass = (field) =>
    `w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all
    ${focused === field ? "border-orange-400 ring-2 ring-orange-400/20" : "border-white/10 hover:border-white/20"}`;

  // Invalid link
  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif mb-2">Invalid reset link</h1>
          <p className="text-gray-400 text-sm mb-6">This link is missing required information. Please request a new password reset.</p>
          <Link to="/forgot-password"
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  // Success
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif mb-2">Password updated!</h1>
          <p className="text-gray-400 text-sm mb-2">Your password has been changed successfully.</p>
          <p className="text-xs text-gray-600">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center mb-10">
          <span className="text-2xl font-bold text-white font-serif">Blog<span className="text-orange-400">Space</span></span>
        </Link>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 font-serif">Set new password</h1>
          <p className="text-sm text-gray-400 mb-8">Choose a strong password for your account.</p>

          <form onSubmit={handleReset} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={newPassword}
                  onChange={(e) => setNewPass(e.target.value)}
                  onFocus={() => setFocused("new")} onBlur={() => setFocused("")}
                  placeholder="New password" className={inputClass("new") + " pr-12"} />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <input type={showConf ? "text" : "password"} value={confirmPass}
                  onChange={(e) => setConfPass(e.target.value)}
                  onFocus={() => setFocused("conf")} onBlur={() => setFocused("")}
                  placeholder="Confirm new password" className={inputClass("conf") + " pr-12"} />
                <button type="button" onClick={() => setShowConf(!showConf)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
                  {showConf ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Password rules */}
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {[
                { label: "8+ characters",  pass: newPassword.length >= 8 },
                { label: "Number",         pass: /\d/.test(newPassword) },
                { label: "Special char",   pass: /[!@#$%^&*]/.test(newPassword) },
                { label: "Passwords match",pass: newPassword.length > 0 && newPassword === confirmPass },
              ].map((c) => (
                <span key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? "text-emerald-400" : "text-gray-600"}`}>
                  <span className="text-[10px]">{c.pass ? "✓" : "○"}</span>{c.label}
                </span>
              ))}
            </div>

            {(status === "error" && errorMsg) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            <button type="submit" disabled={status === "loading"}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              {status === "loading" ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Updating…</>
              ) : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
