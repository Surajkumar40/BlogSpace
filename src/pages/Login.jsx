import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as appwriteLogin } from "../lib/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState("");

  useEffect(() => { document.title = "Login | BlogSpace"; }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Both fields are required.");
      return;
    }

    setLoading(true);
    try {
      // Appwrite login — real credential check against server
      const user = await appwriteLogin(email.trim(), password);
      login(user);       // update AuthContext
      navigate("/");
    } catch (err) {
      // Appwrite returns specific error messages
      if (err.message.includes("Invalid credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else if (err.message.includes("missing scope")) {
        setError("Session error. Please try again.");
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
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
          <h1 className="text-2xl font-bold text-white mb-1 font-serif">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-8">Sign in to continue writing</p>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input id="login-email" type="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                placeholder="you@example.com"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all
                  ${focused === "email" ? "border-orange-400 ring-2 ring-orange-400/20" : "border-white/10 hover:border-white/20"}`}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input id="login-password" type={showPass ? "text" : "password"} autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 outline-none transition-all
                    ${focused === "password" ? "border-orange-400 ring-2 ring-orange-400/20" : "border-white/10 hover:border-white/20"}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Signing in…</>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
