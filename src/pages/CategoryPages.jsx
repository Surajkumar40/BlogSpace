// ─── Tech.jsx ──────────────────────────────────────────────────────────────
import React from "react";
import { Link } from "react-router-dom";

const TECH_ARTICLES = [
  {
    id: "t1",
    title: "Getting Started with React 19: What's New",
    excerpt: "Explore the biggest changes in React 19 including the new compiler, improved hooks, and performance optimisations that make building UIs faster than ever.",
    category: "React",
    readTime: "6 min read",
    date: "Dec 2024",
  },
  {
    id: "t2",
    title: "Mastering CSS Grid: Beyond the Basics",
    excerpt: "Most developers know the grid basics — but subgrid, masonry layouts, and named lines unlock an entirely new level of layout control.",
    category: "CSS",
    readTime: "8 min read",
    date: "Nov 2024",
  },
  {
    id: "t3",
    title: "10 VS Code Extensions That Will Change Your Workflow",
    excerpt: "From AI-powered completions to one-click deployments, these extensions separate good developers from great ones.",
    category: "Tools",
    readTime: "4 min read",
    date: "Nov 2024",
  },
  {
    id: "t4",
    title: "TypeScript Generics: A Visual Guide",
    excerpt: "Generics are the most powerful TypeScript feature most people avoid. This visual, example-driven guide makes them click.",
    category: "Technology",
    readTime: "10 min read",
    date: "Oct 2024",
  },
  {
    id: "t5",
    title: "Building a REST API with Node.js and Express",
    excerpt: "A step-by-step tutorial on building production-ready APIs with proper error handling, validation, and authentication.",
    category: "Technology",
    readTime: "12 min read",
    date: "Oct 2024",
  },
  {
    id: "t6",
    title: "The Complete Guide to Tailwind CSS v4",
    excerpt: "Tailwind v4 rewrites the engine from the ground up. Here's everything that changed and how to migrate your existing projects.",
    category: "CSS",
    readTime: "7 min read",
    date: "Sep 2024",
  },
];

const CATEGORY_BADGE = {
  React:      "bg-cyan-100 text-cyan-800",
  CSS:        "bg-pink-100 text-pink-800",
  Tools:      "bg-amber-100 text-amber-800",
  Technology: "bg-sky-100 text-sky-800",
};

export function Tech() {
  return (
    <CategoryPage
      name="Tech"
      tagline="Programming, tools, and the future of the web"
      articles={TECH_ARTICLES}
      accentFrom="from-sky-400"
      accentTo="to-cyan-600"
    />
  );
}

// ─── Lifestyle.jsx ─────────────────────────────────────────────────────────

const LIFESTYLE_ARTICLES = [
  {
    id: "l1",
    title: "Morning Routines of the World's Most Productive People",
    excerpt: "From 4 AM cold showers to journaling rituals, the first hour of your day shapes everything that follows. Here's what the research — and top performers — say.",
    category: "Lifestyle",
    readTime: "7 min read",
    date: "Dec 2024",
  },
  {
    id: "l2",
    title: "The Art of Slow Travel: Why Rushing Ruins Everything",
    excerpt: "Spending a month in one place teaches you what two weeks in ten countries never can. A case for depth over breadth in travel.",
    category: "Lifestyle",
    readTime: "5 min read",
    date: "Nov 2024",
  },
  {
    id: "l3",
    title: "Masala Chai from Scratch: My Grandmother's Recipe",
    excerpt: "No shortcuts, no tea bags. Just whole spices, full-fat milk, and the patience to let it simmer. The real recipe, handed down unchanged.",
    category: "Food",
    readTime: "4 min read",
    date: "Nov 2024",
  },
  {
    id: "l4",
    title: "How I Read 52 Books in a Year (Without Quitting My Job)",
    excerpt: "It wasn't about reading faster. It was about reading everywhere — and building a system that made giving up harder than continuing.",
    category: "Lifestyle",
    readTime: "6 min read",
    date: "Oct 2024",
  },
  {
    id: "l5",
    title: "The Minimal Wardrobe That Changed How I Think About Style",
    excerpt: "30 items. Infinite outfits. When I stopped buying fast fashion, I started actually enjoying getting dressed.",
    category: "Lifestyle",
    readTime: "5 min read",
    date: "Oct 2024",
  },
  {
    id: "l6",
    title: "Street Food Diaries: The Best Chaat in Delhi",
    excerpt: "Seven hours, twelve stalls, and more golgappas than I'd care to admit. A food lover's guide to Delhi's most iconic street food trail.",
    category: "Food",
    readTime: "8 min read",
    date: "Sep 2024",
  },
];

export function Lifestyle() {
  return (
    <CategoryPage
      name="Lifestyle"
      tagline="Health, travel, food, and the art of living well"
      articles={LIFESTYLE_ARTICLES}
      accentFrom="from-rose-400"
      accentTo="to-orange-500"
    />
  );
}

// ─── Shared CategoryPage component ────────────────────────────────────────

function CategoryPage({ name, tagline, articles, accentFrom, accentTo }) {
  return (
    <div className="min-h-screen bg-[#f9f7f4] pt-20 pb-16">

      {/* Hero */}
      <div className={`bg-linear-to-r ${accentFrom} ${accentTo} px-6 py-16`}>
        <div className="max-w-4xl mx-auto text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3">Category</p>
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-3">{name}</h1>
          <p className="text-white/80 text-lg max-w-xl">{tagline}</p>
          <div className="flex items-center gap-4 mt-6 text-sm text-white/70">
            <span>{articles.length} articles</span>
            <span>·</span>
            <Link to="/explore-posts" className="hover:text-white transition-colors">Explore all categories →</Link>
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article key={article.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer">

              {/* Placeholder cover */}
              <div className={`h-44 bg-linear-to-br ${accentFrom} ${accentTo} opacity-80 group-hover:opacity-90 transition-opacity relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-end p-4">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm`}>
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 font-serif mb-2 group-hover:text-orange-600 transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14 py-12 bg-white rounded-2xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2">Have something to share?</h3>
          <p className="text-gray-500 text-sm mb-6">Write about your experiences in {name.toLowerCase()} and inspire others.</p>
          <Link to="/write-post"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-md shadow-orange-500/20">
            Write an article →
          </Link>
        </div>
      </div>
    </div>
  );
}
