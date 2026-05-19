import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import { EditProfilePage, ChangePasswordPage, DeleteAccountPage } from "./pages/AccountPages";
import { Tech, Lifestyle } from "./pages/CategoryPages";
import WritePost from "./pages/WritePost";
import MyPosts from "./pages/MyPosts";
import Drafts from "./pages/Drafts";
import ExplorePosts from "./pages/ExplorePosts";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";
import { getAllPosts } from "./lib/postService";
import ResetPassword from "./pages/ResetPassword";

// ── Seed posts — defined OUTSIDE component so they never recreate ─────────────
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

// ── Inner app — uses AuthContext ──────────────────────────────────────────────
function AppInner() {
  const { logout } = useAuth();
  const [allPosts, setAllPosts] = useState([...SEED_POSTS]);

  // Fetch all posts from Appwrite on mount + merge with seed posts
  useEffect(() => {
    refreshPosts();
  }, []);

  async function refreshPosts() {
    try {
      const appwritePosts = await getAllPosts();
      const savedIds      = new Set(appwritePosts.map((p) => p.$id));
      const merged        = [
        ...appwritePosts,
        ...SEED_POSTS.filter((p) => !savedIds.has(p.id)),
      ];
      setAllPosts(merged);
    } catch (e) {
      console.log("Could not fetch posts:", e.message);
      setAllPosts([...SEED_POSTS]); // fallback to seed posts
    }
  }

  // Called after publishing — re-fetches from Appwrite so new post appears everywhere
  async function addPost() {
    await refreshPosts();
  }

  return (
    <>
      <ScrollToTop />
      <Navbar onLogout={logout} />
      <Routes>
        {/* Public */}
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />
        <Route path="/contact"         element={<Contact />} />

        {/* Protected */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home allPosts={allPosts} refreshPosts={refreshPosts} />
          </ProtectedRoute>
        } />
        <Route path="/explore-posts" element={
          <ProtectedRoute>
            <ExplorePosts allPosts={allPosts} refreshPosts={refreshPosts} />
          </ProtectedRoute>
        } />
        <Route path="/post/:id"      element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/tech"          element={<ProtectedRoute><Tech /></ProtectedRoute>} />
        <Route path="/lifestyle"     element={<ProtectedRoute><Lifestyle /></ProtectedRoute>} />

        {/* Write / Edit */}
        <Route path="/write-post"      element={<ProtectedRoute><WritePost addPost={addPost} /></ProtectedRoute>} />
        <Route path="/write-post/:id"  element={<ProtectedRoute><WritePost addPost={addPost} /></ProtectedRoute>} />
        <Route path="/drafts/:id/edit" element={<ProtectedRoute><WritePost addPost={addPost} /></ProtectedRoute>} />

        {/* Content */}
        <Route path="/myposts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
        <Route path="/drafts"  element={<ProtectedRoute><Drafts /></ProtectedRoute>} />

        {/* Profile & Settings */}
        <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings"        element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/edit-profile"    element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/delete-account"  element={<ProtectedRoute><DeleteAccountPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* 404 — must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
