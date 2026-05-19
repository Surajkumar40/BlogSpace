import React from "react";
import PostCard from "./PostCard";
import { getImageUrl } from "../lib/postService";

const PostGrid = ({ posts }) => {
  const safePosts = posts || [];

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {safePosts.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-3 text-center py-12">No posts found.</p>
        ) : (
          safePosts.map((post) => {
            const postId = post.$id || post.id;

            // Appwrite posts → imageId → real URL
            // Seed posts    → image  → direct URL
            const imageUrl = post.imageId
              ? getImageUrl(post.imageId)
              : post.image || null;

            return (
              <PostCard
                key={postId}
                id={postId}
                title={post.title}
                category={post.category}
                image={imageUrl}
                excerpt={post.excerpt}
                author={post.author}
                readTime={post.readTime}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default PostGrid;
