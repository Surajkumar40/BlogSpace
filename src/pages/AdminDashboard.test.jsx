import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../context/AuthContext";
import { getAllPosts, getAllDrafts } from "../lib/postService";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../lib/appwrite", () => ({
  databases: { listDocuments: vi.fn().mockResolvedValue({ documents: [] }), deleteDocument: vi.fn() },
  DATABASE_ID: "db",
  MESSAGES_ID: "messages",
  PROFILES_ID: "profiles",
}));
vi.mock("../lib/postService", () => ({
  getAllPosts: vi.fn().mockResolvedValue([]),
  getAllDrafts: vi.fn().mockResolvedValue([]),
  deletePost: vi.fn(),
  deleteDraft: vi.fn(),
  getImageUrl: vi.fn(),
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
}

describe("AdminDashboard access control", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks a signed-in user who does not have the admin label", () => {
    useAuth.mockReturnValue({ user: { name: "Regular", labels: [] } });
    renderDashboard();
    expect(screen.getByText("Admin access required")).toBeInTheDocument();
  });

  it("does not even request admin data for non-admins", () => {
    useAuth.mockReturnValue({ user: { name: "Regular", labels: ["editor"] } });
    renderDashboard();
    expect(getAllPosts).not.toHaveBeenCalled();
    expect(getAllDrafts).not.toHaveBeenCalled();
  });

  it("loads the dashboard for a user with the admin label", async () => {
    useAuth.mockReturnValue({ user: { name: "Boss", labels: ["admin"] } });
    renderDashboard();
    expect(await screen.findByText("Admin Dashboard")).toBeInTheDocument();
    expect(getAllPosts).toHaveBeenCalled();
  });
});
