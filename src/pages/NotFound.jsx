import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const [count, setCount] = useState(10);

  // Auto-redirect countdown
  useEffect(() => {
     document.title = "404 Not Found | BlogSpace";
    if (count <= 0) { navigate("/"); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center px-4 py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">

        {/* Big 404 */}
        <div className="mb-6">
          <span className="text-[120px] md:text-[160px] font-bold font-serif leading-none"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 60%, #9a3412 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif mb-3">
          Page not found
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-2 max-w-sm mx-auto">
          The page you're looking for doesn't exist, was moved, or you may have mistyped the URL.
        </p>

        {/* Countdown */}
        <p className="text-xs text-gray-600 mb-8">
          Redirecting to home in{" "}
          <span className="text-orange-400 font-semibold tabular-nums">{count}s</span>
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
          <Link
            to="/explore-posts"
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm"
          >
            Explore Posts
          </Link>
        </div>

        {/* Popular links */}
        <div className="mt-12 border-t border-white/5 pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">
            Popular pages
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Write a Post", to: "/write-post" },
              { label: "My Posts",     to: "/myposts"    },
              { label: "Drafts",       to: "/drafts"     },
              { label: "Settings",     to: "/settings"   },
              { label: "Contact",      to: "/contact"    },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-gray-500 hover:text-orange-400 transition-colors border border-white/5 hover:border-orange-500/30 px-3 py-1.5 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
