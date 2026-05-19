import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {getImageUrl} from "../lib/postService";

const C = {
  ink: "#0f0e0d", ink2: "#3a3835", ink3: "#7a7672",
  paper: "#faf8f5", paper2: "#f2efe9", paper3: "#e8e4dc",
  accent: "#c8522a", accentLight: "#f0e6df",
};

const CATEGORY_META = {
  React:      { bg: "#dbeafe", text: "#1e3a5f" },
  CSS:        { bg: "#ede9fe", text: "#5b21b6" },
  Tools:      { bg: "#d8f3dc", text: "#2d6a4f" },
  Design:     { bg: "#fce7f3", text: "#9d174d" },
  Technology: { bg: "#dbeafe", text: "#1e3a5f" },
  Food:       { bg: "#fef9c3", text: "#92400e" },
  Lifestyle:  { bg: "#ffe4e6", text: "#9f1239" },
  Other:  { bg: "#ffe4e6", text: "#9f1239" },
  Default:    { bg: "#f0e6df", text: "#9a3d1e" },
};

const CATEGORIES = ["All", "React", "CSS", "Tools", "Design", "Technology", "Food", "Lifestyle", "Other"];

function getCatStyle(cat) { return CATEGORY_META[cat] || CATEGORY_META.Default; }


// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post, onClick }) {
  const [hovered,  setHovered]  = useState(false);
  const [imgError, setImgError] = useState(false);

  // Resolve image URL:
  // 1. Appwrite post with uploaded image → use getImagePreview (real image)
  // 2. Seed post with direct URL         → use post.image directly
  // 3. No image at all                   → show category color block
  const imgSrc = post.imageId
    ? getImageUrl(post.imageId)
    : post.image || null;

  const catStyle = getCatStyle(post.category);
  const hasImage = imgSrc && !imgError;

  return (
    <article
      onClick={() => onClick(post)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.paper,
        border: `1px solid ${C.paper3}`,
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.13)" : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Cover image area */}
      <div style={{
        height: "190px",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        background: catStyle.bg,
      }}>
        {/* Actual uploaded image */}
        {hasImage && (
          <img
            src={imgSrc}
            alt={post.title}
            onError={() => setImgError(true)}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", display: "block",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.4s ease",
            }}
          />
        )}

        {/* Placeholder when no image */}
        {!hasImage && (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${catStyle.bg}, ${catStyle.bg}dd)`,
          }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"
              stroke={catStyle.text} strokeWidth={1} style={{ opacity: 0.4, marginBottom: 6 }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px", fontWeight: 600,
              color: catStyle.text, opacity: 0.6,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              No image
            </span>
          </div>
        )}

        {/* Hover overlay — only when image exists */}
        {hasImage && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(15,14,13,0.55) 0%, transparent 60%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
            display: "flex", alignItems: "flex-end", padding: "14px",
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px", fontWeight: 600,
              color: "#fff", background: C.accent,
              padding: "5px 14px", borderRadius: "20px",
            }}>
              Read Post →
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <span style={{
          display: "inline-block", fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          background: catStyle.bg, color: catStyle.text,
          padding: "3px 10px", borderRadius: "4px",
        }}>
          {post.category}
        </span>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "16px", fontWeight: 600,
          color: C.ink, lineHeight: 1.35, margin: "8px 0",
        }}>
          {post.title}
        </h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px", color: C.ink3, lineHeight: 1.65,
          marginBottom: "auto", paddingBottom: "12px",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {post.excerpt}
        </p>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "10px", borderTop: `1px solid ${C.paper3}`, marginTop: "10px",
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 500, color: C.ink2 }}>
            {post.author || "Anonymous"}
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: C.ink3 }}>
            {post.readTime || "5 min read"}
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ query, category }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px",
      background: C.paper2, borderRadius: "12px", border: `1.5px dashed ${C.paper3}` }}>
      <div style={{ fontSize: "44px", marginBottom: "16px" }}>🔍</div>
      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "22px", fontWeight: 600, color: C.ink, marginBottom: "8px" }}>
        No posts found
      </h3>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: C.ink3, lineHeight: 1.6 }}>
        {query ? `No results for "${query}"${category !== "All" ? ` in ${category}` : ""}.` : `No posts in ${category} yet.`}
        <br />Try a different keyword or category.
      </p>
    </div>
  );
}

// ─── Main: ExplorePosts ───────────────────────────────────────────────────────
export default function ExplorePosts({ allPosts, refreshPosts }) {
  const navigate = useNavigate();
  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFocused,        setIsFocused]        = useState(false);

  useEffect(() => {
    if (refreshPosts) refreshPosts(); // refresh every time Explore is visited
  }, []);
  
  const safePosts = allPosts || [];

  const filteredPosts = safePosts.filter((post) => {
    const matchesKeyword =
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    return matchesKeyword && matchesCategory;
  });

  function handlePostClick(post) {
    const postId = post.$id || post.id;
    navigate(`/post/${postId}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.paper,
      fontFamily: "'DM Sans', sans-serif", paddingTop: "64px" }}>

      {/* Hero */}
      <div style={{ background: C.ink, padding: "56px 24px 48px", textAlign: "center" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px",
          letterSpacing: "0.15em", textTransform: "uppercase",
          color: C.accent, display: "block", marginBottom: "14px" }}>
          Discover · Read · Learn
        </span>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(30px, 6vw, 52px)", fontWeight: 700,
          color: C.paper, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "16px" }}>
          Explore <em style={{ color: C.accent, fontStyle: "normal" }}>All Posts</em>
        </h1>
        <p style={{ fontSize: "16px", color: "#a8a09a", lineHeight: 1.7,
          maxWidth: "460px", margin: "0 auto 32px" }}>
          Handpicked articles on React, design, tools, and everything in between.
        </p>
        <div style={{ display: "inline-flex", gap: "clamp(16px, 4vw, 40px)",
          background: "#1e1c1a", padding: "14px clamp(20px, 5vw, 36px)",
          borderRadius: "10px", border: "1px solid #2a2825" }}>
          {[
            { label: "Posts",      val: safePosts.length },
            { label: "Categories", val: CATEGORIES.length - 1 },
            { label: "Authors",    val: [...new Set(safePosts.map((p) => p.author).filter(Boolean))].length || "—" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 700, color: C.paper }}>
                {s.val}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px",
                color: "#a8a09a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky filter + search */}
      <div style={{ position: "sticky", top: "64px", zIndex: 40,
        background: C.paper, borderBottom: `1px solid ${C.paper3}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto",
          padding: "14px 20px 0", scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
                fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                background: selectedCategory === cat ? C.ink : C.paper2,
                color: selectedCategory === cat ? C.paper : C.ink2,
                border: selectedCategory === cat ? `1px solid ${C.ink}` : `1px solid ${C.paper3}`,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "background 0.18s, color 0.18s", marginBottom: "14px" }}>
              {cat}
            </button>
          ))}
        </div>
        <div style={{ padding: "0 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px",
            border: `1.5px solid ${isFocused ? C.accent : C.paper3}`,
            borderRadius: "8px", padding: "9px 14px", background: C.paper,
            transition: "border-color 0.18s",
            boxShadow: isFocused ? `0 0 0 3px ${C.accentLight}` : "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={isFocused ? C.accent : C.ink3} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search by title or keyword…"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
              style={{ flex: 1, border: "none", outline: "none",
                background: "transparent", fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px", color: C.ink }} />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}
                style={{ background: C.paper3, border: "none", borderRadius: "50%",
                  width: "20px", height: "20px", cursor: "pointer", fontSize: "11px",
                  color: C.ink3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px 80px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
          paddingBottom: "20px", marginBottom: "28px",
          borderTop: `2px solid ${C.ink}`, paddingTop: "24px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "22px", fontWeight: 600, color: C.ink }}>
            {selectedCategory === "All" ? "All Posts" : selectedCategory}
          </h2>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: C.ink3 }}>
            {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
            {searchTerm ? ` for "${searchTerm}"` : ""}
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <EmptyState query={searchTerm} category={selectedCategory} />
        ) : (
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
            gap: "24px" }}>
            {filteredPosts.map((post) => (
              <PostCard
                key={post.$id || post.id}
                post={post}
                onClick={handlePostClick}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        div::-webkit-scrollbar { display: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        article { animation: fadeUp 0.35s ease both; }
        article:nth-child(1) { animation-delay: 0.03s; }
        article:nth-child(2) { animation-delay: 0.07s; }
        article:nth-child(3) { animation-delay: 0.11s; }
        article:nth-child(4) { animation-delay: 0.15s; }
        article:nth-child(5) { animation-delay: 0.18s; }
        article:nth-child(6) { animation-delay: 0.21s; }
        @media (max-width: 480px) { input { font-size: 16px !important; } }
      `}</style>
    </div>
  );
}
