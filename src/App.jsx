import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import { getAllPosts } from "./lib/postService";

// ── Route-level code splitting ────────────────────────────────────────────────
// Each page is loaded on demand, so the first paint only downloads what it needs.
// The Tiptap editor (the heaviest dependency) is only fetched when writing a post.
const Home           = lazy(() => import("./pages/Home"));
const Login          = lazy(() => import("./pages/Login"));
const Signup         = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword  = lazy(() => import("./pages/ResetPassword"));
const Contact        = lazy(() => import("./pages/Contact"));
const ExplorePosts   = lazy(() => import("./pages/ExplorePosts"));
const PostDetail     = lazy(() => import("./pages/PostDetail"));
const Tech           = lazy(() => import("./pages/CategoryPages").then((m) => ({ default: m.Tech })));
const Lifestyle      = lazy(() => import("./pages/CategoryPages").then((m) => ({ default: m.Lifestyle })));
const WritePost      = lazy(() => import("./pages/WritePost"));
const MyPosts        = lazy(() => import("./pages/MyPosts"));
const Drafts         = lazy(() => import("./pages/Drafts"));
const ProfilePage    = lazy(() => import("./pages/ProfilePage"));
const Settings       = lazy(() => import("./pages/Settings"));
const EditProfilePage    = lazy(() => import("./pages/AccountPages").then((m) => ({ default: m.EditProfilePage })));
const ChangePasswordPage = lazy(() => import("./pages/AccountPages").then((m) => ({ default: m.ChangePasswordPage })));
const DeleteAccountPage  = lazy(() => import("./pages/AccountPages").then((m) => ({ default: m.DeleteAccountPage })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound       = lazy(() => import("./pages/NotFound"));

// ── Seed posts, defined OUTSIDE the component so they are never recreated ─────
const SEED_POSTS = [
  { id: "r1",    title: "Getting Started with React",         category: "React",      excerpt: "Learn the basics of React and build your first component.",             image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=1170&auto=format&fit=crop" },
  { id: "r2",    title: "React Hooks Explained",              category: "React",      excerpt: "Understand useState, useEffect, and custom hooks.",                     image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop" },
  { id: "r3",    title: "React Router Guide",                 category: "React",      excerpt: "Implement navigation in your React apps.",                              image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop" },
  { id: "c1",    title: "TailwindCSS Tips & Tricks",          category: "CSS",        excerpt: "Style your apps faster with TailwindCSS utilities.",                   image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" },
  { id: "c2",    title: "Flexbox Made Easy",                  category: "CSS",        excerpt: "Master layout with CSS Flexbox.",                                       image: "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=600&h=400&fit=crop" },
  { id: "c3",    title: "CSS Grid Layouts",                   category: "CSS",        excerpt: "Build complex layouts with CSS Grid.",                                  image: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=600&h=400&fit=crop" },
  { id: "t1",    title: "Vite for Fast Builds",               category: "Tools",      excerpt: "Speed up your development workflow using Vite.",                       image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=600&h=400&fit=crop" },
  { id: "t2",    title: "Webpack Essentials",                 category: "Tools",      excerpt: "Bundle your assets efficiently with Webpack.",                         image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop" },
  { id: "d1",    title: "Responsive Web Design",              category: "Design",     excerpt: "Make your site look great on all devices.",                            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop" },
  { id: "d2",    title: "UI/UX Principles",                   category: "Design",     excerpt: "Learn the fundamentals of user interface and experience design.",      image: "https://images.unsplash.com/photo-1690228254548-31ef53e40cd1?w=600&auto=format&fit=crop&q=60" },
  { id: "tech1", title: "Latest Tech Trends",                 category: "Technology", excerpt: "Explore the newest innovations in technology.",                        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop" },
  { id: "tech2", title: "AI in Everyday Life",                category: "Technology", excerpt: "How artificial intelligence is shaping our world.",                    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop" },
  { id: "f1",    title: "Food Blogging Basics",               category: "Food",       excerpt: "Share your recipes and food stories with the world.",                  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop" },
  { id: "f2",    title: "Healthy Eating Tips",                category: "Food",       excerpt: "Simple ways to maintain a balanced diet.",                             image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop" },
];

// Merge posts from Appwrite with the seed posts.
// If the request fails (e.g. a guest without read access) fall back to the seeds.
async function fetchMergedPosts() {
  try {
    const appwritePosts = await getAllPosts();
    const savedIds = new Set(appwritePosts.map((p) => p.$id));
    return [...appwritePosts, ...SEED_POSTS.filter((p) => !savedIds.has(p.id))];
  } catch {
    return SEED_POSTS;
  }
}

function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="min-h-screen bg-[#0f0e0d] flex items-center justify-center"
    >
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Inner app (uses AuthContext) ──────────────────────────────────────────────
function AppInner() {
  const { logout } = useAuth();
  const [allPosts, setAllPosts] = useState(SEED_POSTS);

  // Stable callback so pages can re-fetch (e.g. after publishing a post)
  const refreshPosts = useCallback(async () => {
    setAllPosts(await fetchMergedPosts());
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;
    fetchMergedPosts().then((posts) => { if (active) setAllPosts(posts); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <ScrollToTop />
      <Navbar onLogout={logout} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public: anyone (including recruiters) can browse without signing up */}
          <Route path="/"               element={<Home allPosts={allPosts} refreshPosts={refreshPosts} />} />
          <Route path="/explore-posts"  element={<ExplorePosts allPosts={allPosts} refreshPosts={refreshPosts} />} />
          <Route path="/post/:id"       element={<PostDetail />} />
          <Route path="/tech"           element={<Tech />} />
          <Route path="/lifestyle"      element={<Lifestyle />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/signup"         element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Write / edit (login required) */}
          <Route path="/write-post"       element={<ProtectedRoute><WritePost addPost={refreshPosts} /></ProtectedRoute>} />
          <Route path="/write-post/:id"   element={<ProtectedRoute><WritePost addPost={refreshPosts} /></ProtectedRoute>} />
          <Route path="/drafts/:id/edit"  element={<ProtectedRoute><WritePost addPost={refreshPosts} /></ProtectedRoute>} />

          {/* Content (login required) */}
          <Route path="/myposts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
          <Route path="/drafts"  element={<ProtectedRoute><Drafts /></ProtectedRoute>} />

          {/* Profile & settings (login required) */}
          <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings"        element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/edit-profile"    element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          <Route path="/delete-account"  element={<ProtectedRoute><DeleteAccountPage /></ProtectedRoute>} />

          {/* Admin: login required here, and the "admin" label is checked inside the page */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* 404 (must be last) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </Router>
  );
}
