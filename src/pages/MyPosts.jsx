import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserPosts, deletePost, getImageUrl } from "../lib/postService";
import { wordCount, formatDate } from "../utils/utils";
import { CATEGORY_COLORS } from "../utils/theme";

export default function MyPosts() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);
  const [error,      setError]      = useState("");

  useEffect(() => { document.title = "My Posts | BlogSpace"; }, []);

  // Fetch this user's posts from Appwrite
  useEffect(() => {
    if (!user) return;
    async function fetchPosts() {
      try {
        const data = await getUserPosts(user.$id);
        setPosts(data);
      } catch (e) {
        setError("Could not load posts: " + e.message);
      }
      setLoading(false);
    }
    fetchPosts();
  }, [user]);

  async function handleDelete(postId) {
    setDeletingId(postId);
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.$id !== postId));
    } catch (e) {
      setError("Could not delete: " + e.message);
    }
    setDeletingId(null);
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
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Your writing</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">My Posts</h1>
            <p className="text-sm text-gray-400 mt-1">{posts.length} published post{posts.length !== 1 ? "s" : ""}</p>
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
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-28 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2 font-serif">No posts yet</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">You haven't published anything yet. Write your first post!</p>
            <button onClick={() => navigate("/write-post")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Write a Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => {
              const imgUrl = post.imageId ? getImageUrl(post.imageId) : null;
              return (
                <div key={post.$id}
                  className={`bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col
                    ${deletingId === post.$id ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>

                  {imgUrl ? (
                    <img src={imgUrl} alt={post.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                      <svg className="w-10 h-10 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                      </svg>
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-5 gap-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.Other}`}>
                        {post.category || "Uncategorized"}
                      </span>
                      {/* FIX: strip HTML before counting words */}
                      <span className="text-xs text-gray-400">
                        {wordCount(post.content.replace(/<[^>]*>/g, " "))} words
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 font-serif">{post.title}</h2>

                    {/* FIX: strip HTML tags from excerpt before displaying */}
                    <p className="text-sm text-gray-500 line-clamp-3 flex-1 leading-relaxed">
                      {post.excerpt ? post.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : ""}
                    </p>

                    <p className="text-xs text-gray-400 italic">{formatDate(post.$createdAt)}</p>

                    {confirmId === post.$id ? (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Delete this post permanently?</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleDelete(post.$id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                            Yes, delete
                          </button>
                          <button onClick={() => setConfirmId(null)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button onClick={() => navigate(`/write-post/${post.$id}?type=posts`)}
                          className="flex-1 flex items-center justify-center gap-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setConfirmId(post.$id)}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2.5 rounded-xl transition-colors">
                          Delete
                        </button>
                      </div>
                    )}
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