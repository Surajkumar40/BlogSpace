import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { account } from "../lib/appwrite";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState("idle"); // idle | loading | sent | error
  const [focused, setFocused] = useState(false);
  const [errMsg,  setErrMsg]  = useState("");

  useEffect(() => { document.title = "Reset Password | BlogSpace"; }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setStatus("error"); setErrMsg("Please enter your email address."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setStatus("error"); setErrMsg("Please enter a valid email address."); return; }

    setStatus("loading");
    try {
      // Appwrite sends a real password reset email automatically
      // The redirect URL is where Appwrite will send the user after clicking the email link
      await account.createRecovery(
        email.trim(),
        `${window.location.origin}/reset-password` // update this to your domain when deployed
      );
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      if (err.message.includes("user_not_found") || err.message.includes("not found")) {
        setErrMsg("No account found with this email address.");
      } else {
        setErrMsg("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <span className="text-2xl font-bold text-white font-serif tracking-tight">Blog<span className="text-orange-400">Space</span></span>
        </Link>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {status === "sent" ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white font-serif mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-400 mb-6">
                We sent a password reset link to <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-xs text-gray-600">
                Didn't receive it? Check your spam folder or{" "}
                <button onClick={() => { setStatus("idle"); setErrMsg(""); }}
                  className="text-orange-400 hover:text-orange-300 transition-colors">
                  try again
                </button>.
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1 font-serif">Reset password</h1>
              <p className="text-sm text-gray-400 mb-8">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Email address
                  </label>
                  <input type="email" autoComplete="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setErrMsg(""); }}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    placeholder="you@example.com"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all
                      ${focused ? "border-orange-400 ring-2 ring-orange-400/20" : "border-white/10 hover:border-white/20"}`}
                  />
                  {status === "error" && errMsg && (
                    <p className="text-xs text-red-400 mt-2">{errMsg}</p>
                  )}
                </div>

                <button type="submit" disabled={status === "loading"}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                  {status === "loading" ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>Sending…</>
                  ) : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
