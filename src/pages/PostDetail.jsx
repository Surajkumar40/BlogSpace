import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getPost, getImageUrl, getAllPosts } from "../lib/postService";

const C = {
  ink: "#0f0e0d", ink2: "#3a3835", ink3: "#7a7672",
  paper: "#faf8f5", paper2: "#f2efe9", paper3: "#e8e4dc",
  accent: "#c8522a", accentLight: "#fff7ed",
};

const CATEGORY_META = {
  React:      { bg: "#dbeafe", text: "#1e3a5f" },
  CSS:        { bg: "#ede9fe", text: "#5b21b6" },
  Tools:      { bg: "#d8f3dc", text: "#2d6a4f" },
  Design:     { bg: "#fce7f3", text: "#9d174d" },
  Technology: { bg: "#dbeafe", text: "#1e3a5f" },
  Food:       { bg: "#fef9c3", text: "#92400e" },
  Lifestyle:  { bg: "#ffe4e6", text: "#9f1239" },
  Default:    { bg: "#f0e6df", text: "#9a3d1e" },
};

const SEED_POSTS = [
  { id: "r1",    title: "Getting Started with React",    category: "React",      excerpt: "Learn the basics of React and build your first component.",             image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=1170&auto=format&fit=crop" },
  { id: "r2",    title: "React Hooks Explained",         category: "React",      excerpt: "Understand useState, useEffect, and custom hooks.",                     image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop" },
  { id: "r3",    title: "React Router Guide",            category: "React",      excerpt: "Implement navigation in your React apps.",                              image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop" },
  { id: "c1",    title: "TailwindCSS Tips & Tricks",     category: "CSS",        excerpt: "Style your apps faster with TailwindCSS utilities.",                   image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" },
  { id: "c2",    title: "Flexbox Made Easy",             category: "CSS",        excerpt: "Master layout with CSS Flexbox.",                                       image: "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=600&h=400&fit=crop" },
  { id: "c3",    title: "CSS Grid Layouts",              category: "CSS",        excerpt: "Build complex layouts with CSS Grid.",                                  image: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=600&h=400&fit=crop" },
  { id: "t1",    title: "Vite for Fast Builds",          category: "Tools",      excerpt: "Speed up your development workflow using Vite.",                       image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=600&h=400&fit=crop" },
  { id: "t2",    title: "Webpack Essentials",            category: "Tools",      excerpt: "Bundle your assets efficiently with Webpack.",                         image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop" },
  { id: "d1",    title: "Responsive Web Design",         category: "Design",     excerpt: "Make your site look great on all devices.",                            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop" },
  { id: "d2",    title: "UI/UX Principles",              category: "Design",     excerpt: "Learn the fundamentals of user interface and experience design.",      image: "https://images.unsplash.com/photo-1690228254548-31ef53e40cd1?w=600&auto=format&fit=crop&q=60" },
  { id: "tech1", title: "Latest Tech Trends",            category: "Technology", excerpt: "Explore the newest innovations in technology.",                        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop" },
  { id: "tech2", title: "AI in Everyday Life",           category: "Technology", excerpt: "How artificial intelligence is shaping our world.",                    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop" },
  { id: "f1",    title: "Food Blogging Basics",          category: "Food",       excerpt: "Share your recipes and food stories with the world.",                  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop" },
  { id: "f2",    title: "Healthy Eating Tips",           category: "Food",       excerpt: "Simple ways to maintain a balanced diet.",                             image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop" },
];

function getCatStyle(cat) { return CATEGORY_META[cat] || CATEGORY_META.Default; }
function getInitials(name = "") { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "AU"; }

const AVATAR_COLORS = [
  { bg: "#f0e6df", text: "#9a3d1e" },
  { bg: "#d8f3dc", text: "#2d6a4f" },
  { bg: "#dbeafe", text: "#1e3a5f" },
  { bg: "#ede9fe", text: "#5b21b6" },
];

function Avatar({ name = "?", size = 42 }) {
  const col = AVATAR_COLORS[name.length % AVATAR_COLORS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: col.bg, color: col.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
      {getInitials(name)}
    </div>
  );
}

function isHTML(str = "") {
  return /<[a-z][\s\S]*>/i.test(str);
}

export default function PostDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [post,     setPost]     = useState(null);
  const [related,  setRelated]  = useState([]);
  const [imgError, setImgError] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef(null);

  // ── Reading progress bar ──
  // Depends on [post] so it only attaches AFTER the post is in the DOM
  useEffect(() => {
    if (!post) return;

    const updateProgress = () => {
      const article = contentRef.current;
      if (!article) return;

      const articleTop    = article.getBoundingClientRect().top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const windowHeight  = window.innerHeight;
      const scrolled      = window.scrollY - articleTop + windowHeight * 0.15;
      const percent       = Math.min(Math.max((scrolled / articleHeight) * 100, 0), 100);

      setReadProgress(percent);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress(); // run once on mount so bar isn't stuck at 0
    return () => window.removeEventListener("scroll", updateProgress);
  }, [post]);

  useEffect(() => {
    if (!id || id === "undefined") { setNotFound(true); setLoading(false); return; }
    async function loadPost() {
      setLoading(true);
      try {
        const found = await getPost(id);
        setPost(found);
        document.title = `${found.title} | BlogSpace`;
        const all = await getAllPosts();
        setRelated(all.filter((p) => p.$id !== id && p.category === found.category).slice(0, 3));
      } catch {
        const seed = SEED_POSTS.find((p) => String(p.id) === String(id));
        if (seed) {
          setPost(seed);
          document.title = `${seed.title} | BlogSpace`;
          setRelated(SEED_POSTS.filter((p) => p.id !== id && p.category === seed.category).slice(0, 3));
        } else {
          setNotFound(true);
        }
      }
      setLoading(false);
    }
    loadPost();
  }, [id]);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center px-4 pt-20">
        <div className="text-center">
          <p className="text-6xl mb-4">📄</p>
          <h1 className="text-2xl font-bold text-white font-serif mb-2">Post not found</h1>
          <p className="text-gray-400 text-sm mb-6">This post may have been deleted or the link is wrong.</p>
          <Link to="/explore-posts" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = post.imageId ? getImageUrl(post.imageId) : post.image || null;
  const catStyle = getCatStyle(post.category);
  const hasRichContent = isHTML(post.content);

  return (
    <div style={{ background: C.paper, minHeight: "100vh", paddingTop: "64px" }}>

      {/* ── Reading Progress Bar ──
          - top: 0, zIndex: 2147483647 (max possible) = always on top of navbar
          - background: transparent track, only orange fill is visible
          - pointerEvents: none = doesn't block navbar clicks                 */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "4px",
        zIndex: 2147483647,
        background: "transparent",
        pointerEvents: "none",
      }}>
        <div style={{
          height: "100%",
          width: `${readProgress}%`,
          background: "#f97316",
          transition: "width 60ms ease-out",
          boxShadow: "0 0 8px rgba(249,115,22,0.7)",
        }} />
      </div>

      {/* ── Hero header ── */}
      <div style={{ background: C.ink, padding: "60px 24px 44px", textAlign: "center" }}>
        <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          background: catStyle.bg, color: catStyle.text,
          padding: "4px 14px", borderRadius: "4px", marginBottom: "16px" }}>
          {post.category}
        </span>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(24px, 5vw, 44px)", fontWeight: 700,
          color: C.paper, lineHeight: 1.15, maxWidth: "740px",
          margin: "0 auto 14px", letterSpacing: "-0.5px" }}>
          {post.title}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px",
          color: "#a8a09a", maxWidth: "560px", margin: "0 auto 24px", lineHeight: 1.65 }}>
          {post.excerpt}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px",
          justifyContent: "center", paddingTop: "20px", borderTop: "1px solid #2a2825" }}>
          <Avatar name={post.author || "Author"} size={42} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 500, color: C.paper }}>
              {post.author || "Anonymous"}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#a8a09a", marginTop: "2px" }}>
              {post.$createdAt
                ? new Date(post.$createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                : post.date || ""}
              {post.readTime ? ` · ${post.readTime}` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* ── Cover image ── */}
      {imageUrl && !imgError && (
        <div style={{ width: "100%", height: "clamp(200px, 40vw, 460px)",
          position: "relative", overflow: "hidden", background: catStyle.bg }}>
          <img src={imageUrl} alt={post.title} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px",
            background: `linear-gradient(to bottom, transparent, ${C.paper})` }} />
        </div>
      )}

      {/* ── Main layout ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px",
        display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}
        className="post-layout">

        {/* Back button */}
        <button onClick={() => navigate("/explore-posts")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px",
            background: "transparent", border: `1.5px solid ${C.paper3}`,
            borderRadius: "8px", padding: "7px 16px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
            fontWeight: 500, color: C.ink2, cursor: "pointer", width: "fit-content" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.paper3; e.currentTarget.style.color = C.ink2; }}>
          ← Back to Explore
        </button>

        {/* Article + sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px" }} className="article-layout">

          {/* Article content — ref is attached here for scroll tracking */}
          <article>
            {hasRichContent ? (
              <div
                ref={contentRef}
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <div
                ref={contentRef}
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "17px",
                color: C.ink2, lineHeight: 1.9 }}>
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "62px", fontWeight: 700, float: "left",
                  lineHeight: "0.82", marginRight: "8px", color: C.accent }}>
                  {(post.content || post.excerpt || "L")[0]}
                </span>
                {post.content || post.excerpt}
              </div>
            )}

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "32px 0", clear: "both" }}>
              {[post.category, "Writing", "Blog"].filter(Boolean).map((tag) => (
                <span key={tag} style={{ background: C.paper2, border: `1px solid ${C.paper3}`,
                  padding: "5px 14px", borderRadius: "20px", fontSize: "12px",
                  color: C.ink2, fontFamily: "'DM Mono', monospace" }}>
                  #{tag.toLowerCase()}
                </span>
              ))}
            </div>

            {/* Share */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px",
              padding: "20px 0", borderTop: `1px solid ${C.paper3}` }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
                color: C.ink3, fontWeight: 500 }}>Share this post:</span>
              <button onClick={handleCopy}
                style={{ background: copied ? "#10b981" : C.ink, color: C.paper, border: "none",
                  borderRadius: "8px", padding: "6px 14px", fontSize: "12px",
                  fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "background 0.2s" }}>
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>
          </article>

          {/* Sidebar — related posts */}
          {related.length > 0 && (
            <aside className="post-sidebar">
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px",
                letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink3,
                marginBottom: "14px", paddingBottom: "8px", borderBottom: `1px solid ${C.paper3}` }}>
                Related Posts
              </p>
              {related.map((rp) => {
                const rpId  = rp.$id || rp.id;
                const rpImg = rp.imageId ? getImageUrl(rp.imageId) : rp.image || null;
                return (
                  <div key={rpId} onClick={() => navigate(`/post/${rpId}`)}
                    style={{ display: "flex", gap: "10px", alignItems: "flex-start",
                      marginBottom: "16px", cursor: "pointer" }}>
                    <div style={{ width: "60px", height: "50px", borderRadius: "8px",
                      overflow: "hidden", flexShrink: 0,
                      background: getCatStyle(rp.category).bg }}>
                      {rpImg && (
                        <img src={rpImg} alt={rp.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Playfair Display', serif",
                        fontSize: "13px", fontWeight: 600,
                        color: C.ink, lineHeight: 1.35, marginBottom: "4px" }}>
                        {rp.title}
                      </p>
                      <span style={{ fontFamily: "'DM Mono', monospace",
                        fontSize: "11px", color: C.ink3 }}>
                        {rp.readTime || "5 min read"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </aside>
          )}
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        @media (min-width: 900px) {
          .post-layout { grid-template-columns: 1fr !important; }
          .article-layout { grid-template-columns: 1fr 260px !important; }
        }
        .rich-content { font-family: 'Georgia', serif; font-size: 17px; line-height: 1.85; color: #3a3835; }
        .rich-content p { margin-bottom: 16px; }
        .rich-content h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 700; color: #0f0e0d; margin: 32px 0 14px; line-height: 1.2; }
        .rich-content h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #0f0e0d; margin: 28px 0 12px; line-height: 1.25; }
        .rich-content h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; color: #0f0e0d; margin: 22px 0 10px; }
        .rich-content ul { list-style: disc; padding-left: 28px; margin-bottom: 16px; }
        .rich-content ol { list-style: decimal; padding-left: 28px; margin-bottom: 16px; }
        .rich-content li { margin-bottom: 6px; }
        .rich-content blockquote { border-left: 4px solid #f97316; padding: 14px 20px; margin: 24px 0; background: #fff7ed; border-radius: 0 10px 10px 0; font-style: italic; color: #374151; }
        .rich-content code { background: #f3f4f6; padding: 2px 7px; border-radius: 4px; font-size: 14px; font-family: monospace; color: #e11d48; }
        .rich-content pre { background: #1f2937; color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; overflow-x: auto; }
        .rich-content pre code { background: none; color: inherit; padding: 0; font-size: 14px; }
        .rich-content hr { border: none; border-top: 2px solid #f3f4f6; margin: 28px 0; }
        .rich-content a { color: #f97316; text-decoration: underline; }
        .rich-content a:hover { color: #ea580c; }
        .rich-content img { max-width: 100%; border-radius: 12px; margin: 16px 0; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .rich-content mark { background: #fde047; padding: 1px 4px; border-radius: 3px; }
        .rich-content strong { font-weight: 700; color: #0f0e0d; }
      `}</style>
    </div>
  );
}
