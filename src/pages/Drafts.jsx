import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserDrafts, deleteDraft, getImageUrl } from "../lib/postService";
import { wordCount, formatDate } from "../utils/utils";

export default function Drafts() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [drafts,     setDrafts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [confirmId,  setConfirmId]  = useState(null);
  const [error,      setError]      = useState("");

  useEffect(() => { document.title = "Drafts | BlogSpace"; }, []);

  // Fetch this user's drafts from Appwrite
  useEffect(() => {
    if (!user) return;
    async function fetchDrafts() {
      try {
        const data = await getUserDrafts(user.$id);
        setDrafts(data);
      } catch (e) {
        setError("Could not load drafts: " + e.message);
      }
      setLoading(false);
    }
    fetchDrafts();
  }, [user]);

  async function handleDelete(draftId) {
    try {
      await deleteDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d.$id !== draftId));
    } catch (e) {
      setError("Could not delete: " + e.message);
    }
    setConfirmId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f4] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">In progress</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">My Drafts</h1>
            <p className="text-sm text-gray-400 mt-1">{drafts.length} saved draft{drafts.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => navigate("/write-post")}
            className="self-start sm:self-auto flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Post
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Empty */}
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-28 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2 font-serif">No drafts yet</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">Start writing and save as a draft to find it here.</p>
            <button onClick={() => navigate("/write-post")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Start Writing
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {drafts.map((draft) => {
              const imgUrl = draft.imageId ? getImageUrl(draft.imageId) : null;
              return (
                <div key={draft.$id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {imgUrl && (
                      <div className="sm:w-44 sm:shrink-0">
                        <img src={imgUrl} alt={draft.title || "Draft"} className="w-full h-40 sm:h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col justify-between p-5 flex-1 gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {draft.category && (
                            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">{draft.category}</span>
                          )}
                          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">Draft</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 font-serif">
                          {draft.title || <span className="italic text-gray-400 font-sans font-normal">Untitled Post</span>}
                        </h2>
                        {draft.content && (
                           <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
    {draft.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
  </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          {draft.$createdAt && <span>{formatDate(draft.$createdAt)}</span>}
                          {draft.content    && <span>{wordCount(draft.content)} words</span>}
                        </div>

                        {confirmId === draft.$id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 mr-1">Are you sure?</span>
                            <button onClick={() => handleDelete(draft.$id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Delete</button>
                            <button onClick={() => setConfirmId(null)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => navigate(`/drafts/${draft.$id}/edit`)}
                              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                              Continue Writing
                            </button>
                            <button onClick={() => setConfirmId(draft.$id)}
                              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-xl border border-red-200 transition-colors">
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
