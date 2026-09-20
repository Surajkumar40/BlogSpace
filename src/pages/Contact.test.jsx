import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "./Contact";
import { databases } from "../lib/appwrite";

vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("../lib/appwrite", () => ({
  databases: { createDocument: vi.fn() },
  ID: { unique: () => "id" },
  MESSAGES_ID: "messages",
  DATABASE_ID: "db",
}));

async function fillAndSubmit(user) {
  await user.type(screen.getByLabelText(/name/i, { selector: "input" }), "Ada");
  await user.type(screen.getByLabelText(/email/i), "ada@example.com");
  await user.type(screen.getByLabelText(/subject/i), "Hello");
  await user.type(screen.getByLabelText(/message/i), "Nice blog, well done!");
  await user.click(screen.getByRole("button", { name: /send/i }));
}

describe("Contact form", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows validation errors and does not submit an empty form", async () => {
    const user = userEvent.setup();
    render(<Contact />);
    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(databases.createDocument).not.toHaveBeenCalled();
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
  });

  it("tells the visitor when the message could not be saved", async () => {
    databases.createDocument.mockRejectedValue(new Error("network"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<Contact />);
    await fillAndSubmit(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't send/i);
  });

  it("saves the message when the request succeeds", async () => {
    databases.createDocument.mockResolvedValue({});
    const user = userEvent.setup();
    render(<Contact />);
    await fillAndSubmit(user);
    expect(databases.createDocument).toHaveBeenCalledTimes(1);
    expect(databases.createDocument.mock.calls[0][3]).toMatchObject({
      name: "Ada",
      email: "ada@example.com",
      subject: "Hello",
    });
  });
});
