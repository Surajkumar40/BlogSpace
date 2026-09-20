import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PostCard from "./PostCard";

function renderCard(props) {
  return render(
    <MemoryRouter>
      <PostCard {...props} />
    </MemoryRouter>
  );
}

describe("PostCard", () => {
  it("shows the title and category and links to the post page", () => {
    renderCard({ id: "abc123", title: "Hello World", category: "React", excerpt: "A short intro." });
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getAllByText("React").length).toBeGreaterThan(0);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/post/abc123");
  });

  it("does not crash for an unknown category", () => {
    renderCard({ id: "x", title: "Odd one", category: "Something new" });
    expect(screen.getByText("Odd one")).toBeInTheDocument();
  });
});
