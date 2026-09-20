import React, { useState } from "react";
import { Link } from "react-router-dom";

const CATEGORY_COLORS = {
  React:      { bg: "#dbeafe", text: "#1e40af" },
  CSS:        { bg: "#ede9fe", text: "#6d28d9" },
  Tools:      { bg: "#d1fae5", text: "#065f46" },
  Design:     { bg: "#fce7f3", text: "#9d174d" },
  Technology: { bg: "#e0f2fe", text: "#0369a1" },
  Food:       { bg: "#fef9c3", text: "#854d0e" },
  Lifestyle:  { bg: "#ffe4e6", text: "#9f1239" },
  Other:      { bg: "#f3f4f6", text: "#374151" },
};

function getCatStyle(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
}

const PostCard = ({ id, title, category, image, excerpt, author, readTime }) => {
  const [hovered,  setHovered]  = useState(false);
  const [imgError, setImgError] = useState(false);
  const catStyle = getCatStyle(category);

  return (
    <Link to={`/post/${id}`} className="block">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #f0ede8",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.13)" : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Image section */}
        <div style={{
          height: "200px",
          overflow: "hidden",
          position: "relative",
          background: catStyle.bg,
          flexShrink: 0,
        }}>
          {image && !imgError ? (
            <img
            loading="lazy"
              src={image}
              alt={title}
              onError={() => setImgError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transform: hovered ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.4s ease",
              }}
            />
          ) : (
            // Clean placeholder when no image
            <div style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: `linear-gradient(135deg, ${catStyle.bg} 0%, ${catStyle.bg}99 100%)`,
            }}>
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24"
                stroke={catStyle.text} strokeWidth={1}
                style={{ opacity: 0.35, marginBottom: 8 }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span style={{
                fontSize: "11px", fontWeight: 600,
                color: catStyle.text, opacity: 0.5,
                textTransform: "uppercase", letterSpacing: "0.08em",
                fontFamily: "sans-serif",
              }}>
                {category}
              </span>
            </div>
          )}

          {/* Read post overlay on hover */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
            display: "flex", alignItems: "flex-end",
            padding: "16px",
          }}>
            <span style={{
              fontSize: "12px", fontWeight: 600,
              color: "#fff", background: "#f97316",
              padding: "5px 14px", borderRadius: "20px",
              fontFamily: "sans-serif",
              transform: hovered ? "translateY(0)" : "translateY(8px)",
              transition: "transform 0.25s ease",
            }}>
              Read Post →
            </span>
          </div>
        </div>

        {/* Text section — always clean white */}
        <div style={{
          padding: "18px 20px 20px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          background: "#ffffff",
        }}>

          {/* Category badge */}
          <span style={{
            display: "inline-block",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: catStyle.bg,
            color: catStyle.text,
            padding: "3px 10px",
            borderRadius: "20px",
            width: "fit-content",
            fontFamily: "sans-serif",
            marginBottom: "10px",
          }}>
            {category}
          </span>

          {/* Title */}
          <h3 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "17px",
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1.35,
            marginBottom: "8px",
            transition: "color 0.2s ease",
            ...(hovered ? { color: "#f97316" } : {}),
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {title}
          </h3>

          {/* Excerpt */}
          <p style={{
            fontFamily: "sans-serif",
            fontSize: "13px",
            color: "#6b7280",
            lineHeight: 1.65,
            marginBottom: "auto",
            paddingBottom: "14px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {excerpt}
          </p>

          {/* Footer */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "12px",
            borderTop: "1px solid #f3f4f6",
            marginTop: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Avatar circle */}
              <div style={{
                width: "28px", height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700, color: "#fff",
                fontFamily: "sans-serif", flexShrink: 0,
              }}>
                {(author || "A")[0].toUpperCase()}
              </div>
              <span style={{
                fontFamily: "sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#374151",
              }}>
                {author || "Anonymous"}
              </span>
            </div>
            <span style={{
              fontFamily: "monospace",
              fontSize: "11px",
              color: "#9ca3af",
              background: "#f9fafb",
              padding: "3px 8px",
              borderRadius: "6px",
              border: "1px solid #f3f4f6",
            }}>
              {readTime || "5 min"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
