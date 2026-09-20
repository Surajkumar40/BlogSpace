import { describe, it, expect } from "vitest";
import { isAdmin } from "./roles";

describe("isAdmin", () => {
  it("is true only when the user has the admin label", () => {
    expect(isAdmin({ labels: ["admin"] })).toBe(true);
    expect(isAdmin({ labels: ["editor", "admin"] })).toBe(true);
  });
  it("is false for other labels, no labels, or no user", () => {
    expect(isAdmin({ labels: ["editor"] })).toBe(false);
    expect(isAdmin({ labels: [] })).toBe(false);
    expect(isAdmin({})).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
  it("cannot be spoofed by an admin email, name or prefs", () => {
    expect(isAdmin({ email: "admin@blogspace.com", name: "admin", prefs: { admin: true } })).toBe(false);
  });
});
