import { Link } from "react-router-dom";
import PostGrid from "../components/PostGrid";
import { useEffect } from "react";

const FEATURES = [
  { icon: "✦", title: "Write freely", desc: "A distraction-free editor lets your ideas flow. Save drafts, publish when ready." },
  { icon: "◈", title: "Reach readers", desc: "Your posts are instantly visible to the BlogSpace community and beyond." },
  { icon: "◉", title: "Grow together", desc: "Explore stories from writers across tech, design, lifestyle, and more." },
];

export default function Home({ allPosts, refreshPosts }) {
  useEffect(() => {
    if (refreshPosts) refreshPosts(); // refresh every time Home is visited
  }, [refreshPosts]);
  const safePosts   = allPosts || [];
  const latestPosts = safePosts.slice(0, 6);

  return (
    <main className="bg-[#0f0e0d]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {/* ✅ id="home" added so Navbar scrollspy works */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto mt-20 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-orange-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            A community for writers & readers
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight font-serif">
            Stories worth{" "}
            <span className="relative inline-block">
              <span className="text-orange-400 italic">reading</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 5.5 Q100 1 198 5.5" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
              </svg>
            </span>
            {" "}every day
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Discover thoughtful writing from real people. Share your ideas, insights, and stories with a community that cares.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              to="/write-post"
              className="group inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-orange-500/25 text-sm"
            >
              Start Writing
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/explore-posts"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-sm"
            >
              Explore Posts
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/5 mt-8">
            {[
              { val: safePosts.length || "100+", label: "Posts published" },
              { val: "7",   label: "Categories" },
              { val: "∞",   label: "Ideas shared" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white font-serif">{s.val}</div>
                <div className="text-xs text-gray-500 mt-0.5 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-linear-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* ── Latest Posts ─────────────────────────────────────────────────── */}
      <section className="bg-[#f9f7f4] px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Fresh from the community</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif">Latest Posts</h2>
            </div>
            {safePosts.length > 6 && (
              <Link to="/explore-posts" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-500 transition-colors">
                View all <span>→</span>
              </Link>
            )}
          </div>

          {safePosts.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-5xl mb-4">✦</p>
              <h3 className="text-xl font-bold text-gray-700 mb-2 font-serif">No posts yet</h3>
              <p className="text-gray-400 text-sm mb-6">Be the first to share a story with the world.</p>
              <Link to="/write-post" className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-colors">
                Write the first post
              </Link>
            </div>
          ) : (
            <>
              <PostGrid posts={latestPosts} />
              {safePosts.length > 6 && (
                <div className="text-center mt-10">
                  <Link to="/explore-posts" className="inline-flex items-center gap-2 border border-gray-300 hover:border-orange-400 text-gray-700 hover:text-orange-600 font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200">
                    See all {safePosts.length} posts →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0f0e0d] px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Why BlogSpace?</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white font-serif">Built for real writers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-orange-500/30 hover:bg-white/5 transition-all duration-300">
                <div className="text-2xl text-orange-400 mb-4 font-mono">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 font-serif">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="bg-[#f9f7f4] px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">About us</p>
              <h2 className="text-4xl font-bold text-gray-900 font-serif mb-6">More than a blogging platform</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                BlogSpace is a community where every voice matters. We believe authentic writing connects people in ways that algorithms never can.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Whether you're sharing a recipe, a React tutorial, or a travel diary — your story deserves to be told beautifully.
              </p>
              <Link to="/write-post" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                Start your journey →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "100%", label: "Free to use" },
                { val: "7",    label: "Categories" },
                { val: "∞",    label: "Posts to write" },
                { val: "1",    label: "Community" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl font-bold text-orange-500 font-serif">{s.val}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feedback / CTA ───────────────────────────────────────────────── */}
      <section id="feedback" className="bg-[#0f0e0d] px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Your feedback matters</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white font-serif mb-6">Help us grow together</h2>
          <p className="text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto">
            Your thoughts, suggestions, and experiences shape BlogSpace. Share what you love and what we can improve.
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-orange-500/25 text-sm">
            Send us feedback →
          </Link>
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────────────────────────────────── */}
      <section id="contact" className="bg-[#f9f7f4] px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Get in touch</p>
          <h2 className="text-4xl font-bold text-gray-900 font-serif mb-4">We're here to help</h2>
          <p className="text-gray-500 leading-relaxed mb-8">Have questions about writing, technical issues, or partnerships? Our team is happy to help.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-sm">
            Contact support →
          </Link>
        </div>
      </section>

    </main>
  );
}
