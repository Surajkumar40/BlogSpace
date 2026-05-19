import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup as appwriteSignup } from "../lib/authService";
import { useAuth } from "../context/AuthContext";
import { databases, ID, PROFILES_ID, DATABASE_ID } from "../lib/appwrite";

function StrengthBar({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Number",        pass: /\d/.test(password) },
    { label: "Special char",  pass: /[!@#$%^&*]/.test(password) },
    { label: "Uppercase",     pass: /[A-Z]/.test(password) },
  ];
  const score  = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-400", "bg-emerald-400", "bg-emerald-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1.5">
        {[0,1,2,3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : "bg-white/10"}`} />
        ))}
        <span className={`text-xs font-semibold ml-1 ${score >= 3 ? "text-emerald-400" : score >= 2 ? "text-yellow-400" : "text-red-400"}`}>
          {labels[score]}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? "text-emerald-400" : "text-gray-600"}`}>
            <span className="text-[10px]">{c.pass ? "✓" : "○"}</span>{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Signup() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState("");

  useEffect(() => { document.title = "Sign Up | BlogSpace"; }, []);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
      setError("Password must be 8+ characters with a number and special character.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Appwrite account
      const user = await appwriteSignup(name.trim(), email.trim(), password);

      // 2. Save profile to profiles collection so admin can see all users
      try {
        await databases.createDocument(DATABASE_ID, PROFILES_ID, ID.unique(), {
          name:   name.trim(),
          email:  email.trim().toLowerCase(),
          userId: user.$id,
          bio:    "",
        });
      } catch (profileErr) {
        // Profile creation failure shouldn't block signup
        console.log("Profile save error:", profileErr.message);
      }

      login(user);
      navigate("/");
    } catch (err) {
      if (err.message.includes("already exists")) {
        setError("An account with this email already exists. Please sign in.");
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
  }

  const inputClass = (field) =>
    `w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all
    ${focused === field ? "border-orange-400 ring-2 ring-orange-400/20" : "border-white/10 hover:border-white/20"}`;

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
          <h1 className="text-2xl font-bold text-white mb-1 font-serif">Create your account</h1>
          <p className="text-sm text-gray-400 mb-8">Join BlogSpace — it's free</p>

          <form onSubmit={handleSignup} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full name</label>
              <input type="text" autoComplete="name" value={name}
                onChange={(e) => setName(e.target.value)} onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                placeholder="Your full name" className={inputClass("name")} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email address</label>
              <input type="email" autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                placeholder="you@example.com" className={inputClass("email")} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  placeholder="Create a strong password" className={inputClass("password") + " pr-12"} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Creating account…</>
              ) : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
