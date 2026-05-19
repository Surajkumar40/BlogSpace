import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RichTextEditor from "../components/RichTextEditor";
import {
  createPost, updatePost, getPost,
  saveDraft, updateDraft, getDraft,
  uploadImage, getImageUrl, deleteImage,
} from "../lib/postService";
import { CATEGORIES } from "../utils/theme";

// Strip HTML tags to get plain text for excerpt + word count
function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function wordCount(html = "") {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export default function WritePost({ addPost }) {
  const { id }   = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditingDraft = location.pathname.includes("/drafts/") && !!id;
  const queryParams    = new URLSearchParams(location.search);
  const type           = queryParams.get("type") || "posts";

  const [title,        setTitle]        = useState("");
  const [content,      setContent]      = useState("");
  const [category,     setCategory]     = useState("");
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [oldImageId,   setOldImageId]   = useState("");
  const [pageLoading,  setPageLoading]  = useState(!!id);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState(null);

  useEffect(() => {
    document.title = id ? "Edit Post | BlogSpace" : "Write Post | BlogSpace";
  }, [id]);

  // Load existing post or draft for editing
  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const doc = isEditingDraft ? await getDraft(id) : await getPost(id);
        setTitle(doc.title       || "");
        setContent(doc.content   || "");
        setCategory(doc.category || "");
        if (doc.imageId) {
          setOldImageId(doc.imageId);
          setImagePreview(getImageUrl(doc.imageId));
        }
      } catch (e) {
        showToast("Could not load content: " + e.message);
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [id, isEditingDraft]);

  function showToast(msg, type = "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Image must be under 5MB."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function resolveImageId() {
    if (imageFile) {
      if (oldImageId) await deleteImage(oldImageId);
      return await uploadImage(imageFile);
    }
    if (!imagePreview && oldImageId) {
      await deleteImage(oldImageId);
      return "";
    }
    return oldImageId || "";
  }

  async function handleSaveDraft() {
    if (!title.trim() && !stripHtml(content)) {
      showToast("Add a title or content before saving.");
      return;
    }
    setSaving(true);
    try {
      const imageId   = await resolveImageId();
      const plainText = stripHtml(content);
      const draftData = {
        title:    title.trim(),
        content,                             // save HTML
        category: category || "Other",
        author:   user?.name  || "Anonymous",
        userId:   user?.$id   || "",
        excerpt:  plainText.slice(0, 150),
        imageId,
        readTime: `${Math.max(1, Math.ceil(wordCount(content) / 200))} min read`,
      };
      if (isEditingDraft && id) {
        await updateDraft(id, draftData);
      } else {
        await saveDraft(draftData);
      }
      showToast("Draft saved!", "success");
      setTimeout(() => navigate("/drafts"), 1000);
    } catch (e) {
      showToast("Failed to save draft: " + e.message);
    }
    setSaving(false);
  }

  async function handlePublish() {
    if (!title.trim()) { showToast("Please add a title."); return; }
    if (!stripHtml(content)) { showToast("Please add some content."); return; }
    if (!category) { showToast("Please select a category."); return; }

    setSaving(true);
    try {
      const imageId  = await resolveImageId();
      const plainText = stripHtml(content);
      const postData = {
        title:    title.trim(),
        content,                             // save HTML
        category,
        author:   user?.name || "Anonymous",
        userId:   user?.$id  || "",
        excerpt:  plainText.slice(0, 150),
        imageId,
        readTime: `${Math.max(1, Math.ceil(wordCount(content) / 200))} min read`,
      };

      if (isEditingDraft && id) {
        await createPost(postData);
        await import("../lib/postService").then((m) => m.deleteDraft(id));
      } else if (id && type === "posts") {
        await updatePost(id, postData);
      } else {
        await createPost(postData);
      }

      if (addPost) await addPost();
      showToast("Published!", "success");
      setTimeout(() => navigate("/myposts"), 1000);
    } catch (e) {
      showToast("Failed to publish: " + e.message);
    }
    setSaving(false);
  }

  const wc       = wordCount(content);
  const readMins = Math.max(1, Math.ceil(wc / 200));

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#f9f7f4] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16 px-4">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl transition-all
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <button onClick={() => navigate(-1)} className="hover:text-gray-700 transition-colors">← Back</button>
            <span>/</span>
            <span className="text-gray-600">
              {isEditingDraft ? "Continue draft" : id ? "Edit post" : "New post"}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            {isEditingDraft ? "Continue Drafting" : id ? "Edit Post" : "Write a New Post"}
          </h1>
          {isEditingDraft && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              You're editing a saved draft — publishing will move it to My Posts.
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Cover image */}
          <div className="border-b border-gray-100 p-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Cover Image
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden group">
                <img src={imagePreview} alt="Cover" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={handleRemoveImage}
                    className="bg-white text-red-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-50">
                    Remove
                  </button>
                  <label className="bg-white text-gray-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    Replace
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 rounded-xl cursor-pointer transition-all">
                <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-400">Click to upload cover image</span>
                <span className="text-xs text-gray-300 mt-1">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>

          <div className="p-6 space-y-6">

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Post Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write a compelling title…"
                className="w-full border-0 border-b-2 border-gray-100 focus:border-orange-400 px-0 py-2 text-2xl font-bold text-gray-900 font-serif placeholder-gray-200 outline-none bg-transparent transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${category === cat
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-600"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Content
              </label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Tell your story… Use the toolbar to add headings, lists, quotes and more."
              />
              <div className="flex items-center justify-end gap-4 mt-2 text-xs text-gray-400">
                <span>~{readMins} min read</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
            <button onClick={handleSaveDraft} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              {saving ? "Saving…" : "Save as Draft"}
            </button>
            <button onClick={handlePublish} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20">
              {saving ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
              {saving ? "Publishing…" : "Publish Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
