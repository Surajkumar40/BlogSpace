// ─── Shared Utilities ─────────────────────────────────────────────────────

export function wordCount(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d)
    ? dateStr
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function getInitials(name = "", email = "") {
  if (name && name.trim()) {
    return name.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }
  return email ? email[0].toUpperCase() : "U";
}

export function readTime(text = "") {
  const words = wordCount(text);
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export function safeLocalGet(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

export function safeLocalSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("Storage quota exceeded:", e);
    return false;
  }
}