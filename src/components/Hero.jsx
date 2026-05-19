import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-black text-white p-8 md:p-16">
      <div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
          Stories worth <span className="text-orange-600">reading</span> every day
        </h1>
        <p className="text-gray-400 mb-6">
          A place to discover thoughtful writing from real people. Share your ideas, insights, and stories with the world.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* ✅ Start Writing navigates to WritePost.jsx */}
          <Link
            to="/write-post"
            className="bg-orange-600 px-6 py-3 rounded text-center font-semibold hover:bg-orange-700 transition cursor-pointer"
          >
            Start Writing
          </Link>

          {/* Explore Posts button */}
          <Link
            to="/explore-posts"
            className="border border-gray-700 px-6 py-3 rounded text-center font-semibold hover:bg-gray-800 transition cursor-pointer"
          >
            Explore Posts
          </Link>
        </div>
      </div>

      {/* Right side placeholder */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
          Featured Post Placeholder
        </div>
      </div>
    </section>
  );
}
