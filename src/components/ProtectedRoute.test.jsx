import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/secret"
          element={
            <ProtectedRoute>
              <p>Secret content</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects signed-out visitors to /login", () => {
    useAuth.mockReturnValue({ isLoggedIn: false });
    renderAt("/secret");
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders the page for signed-in users", () => {
    useAuth.mockReturnValue({ isLoggedIn: true });
    renderAt("/secret");
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });
});
