import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

// A signed-out visitor: there is no Appwrite session and no posts can be fetched.
vi.mock("./lib/appwrite", () => ({
  account: { get: vi.fn().mockRejectedValue(new Error("no session")) },
  databases: { listDocuments: vi.fn().mockRejectedValue(new Error("guests cannot read")) },
  storage: {},
  ID: { unique: () => "id" },
  Query: { orderDesc: () => "q", equal: () => "q", limit: () => "q" },
  ENDPOINT: "https://example.test/v1",
  DATABASE_ID: "db",
  POSTS_ID: "posts",
  DRAFTS_ID: "drafts",
  BUCKET_ID: "bucket",
  MESSAGES_ID: "messages",
  PROFILES_ID: "profiles",
}));

describe("App routing for signed-out visitors", () => {
  beforeEach(() => window.history.pushState({}, "", "/"));

  it("lets a visitor browse the home page without logging in", async () => {
    render(<App />);
    // Home is public and falls back to the built-in seed posts
    expect(await screen.findByText("Getting Started with React")).toBeInTheDocument();
  });

  it("sends a visitor to the login page when they try to write a post", async () => {
    window.history.pushState({}, "", "/write-post");
    render(<App />);
    expect(await screen.findByRole("heading", { name: /welcome back|log in|sign in/i })).toBeInTheDocument();
  });

  it("shows the 404 page for unknown URLs", async () => {
    window.history.pushState({}, "", "/definitely-not-a-page");
    render(<App />);
    expect(await screen.findByRole("heading", { name: /page not found/i })).toBeInTheDocument();
  });
});
