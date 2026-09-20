import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  wordCount,
  formatDate,
  getInitials,
  readTime,
  safeLocalGet,
  safeLocalSet,
} from "./utils";

describe("wordCount", () => {
  it("counts words separated by any amount of whitespace", () => {
    expect(wordCount("one  two\nthree\tfour")).toBe(4);
  });
  it("returns 0 for empty or whitespace-only input", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
    expect(wordCount()).toBe(0);
  });
});

describe("readTime", () => {
  it("is at least 1 minute, even for very short text", () => {
    expect(readTime("hello")).toBe("1 min read");
  });
  it("rounds up at 200 words per minute", () => {
    expect(readTime("word ".repeat(201))).toBe("2 min read");
  });
});

describe("formatDate", () => {
  it("formats a valid date", () => {
    expect(formatDate("2026-07-15T12:00:00")).toBe("Jul 15, 2026");
  });
  it("returns an empty string when there is no date", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate(undefined)).toBe("");
  });
  it("returns the original text when the date is invalid", () => {
    expect(formatDate("not a date")).toBe("not a date");
  });
});

describe("getInitials", () => {
  it("uses the first letters of up to two name parts", () => {
    expect(getInitials("suraj kumar")).toBe("SK");
    expect(getInitials("Ada Lovelace King")).toBe("AL");
  });
  it("falls back to the email initial, then to U", () => {
    expect(getInitials("", "zed@example.com")).toBe("Z");
    expect(getInitials()).toBe("U");
  });
});

describe("safeLocalGet / safeLocalSet", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips JSON values", () => {
    expect(safeLocalSet("k", { a: 1 })).toBe(true);
    expect(safeLocalGet("k", null)).toEqual({ a: 1 });
  });
  it("returns the fallback for missing or corrupt values", () => {
    expect(safeLocalGet("missing", ["x"])).toEqual(["x"]);
    localStorage.setItem("bad", "{not json");
    expect(safeLocalGet("bad", [])).toEqual([]);
  });
  it("returns false (and does not throw) when storage fails", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(safeLocalSet("k", 1)).toBe(false);
    spy.mockRestore();
    errorSpy.mockRestore();
  });
});
