import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount rendered components between tests
afterEach(() => cleanup());

// jsdom does not implement scrolling
window.scrollTo = vi.fn();
