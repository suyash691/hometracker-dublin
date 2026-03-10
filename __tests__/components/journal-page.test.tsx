import { render, screen, waitFor } from "@testing-library/react";
import JournalPage from "@/app/journal/page";

global.fetch = jest.fn((url: string | URL | Request) => {
  const u = typeof url === "string" ? url : "";
  if (u.includes("/api/journal")) return Promise.resolve({ ok: true, json: () => Promise.resolve([
    { id: "j1", type: "freeform", content: "Feeling hopeful", createdAt: new Date().toISOString(), house: { address: "42 Phibs" } },
  ]) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
}) as jest.Mock;

describe("Journal Page", () => {
  it("renders journal entries", async () => {
    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText("Feeling hopeful")).toBeInTheDocument());
  });
  it("shows house address", async () => {
    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText("42 Phibs")).toBeInTheDocument());
  });
  it("has textarea for new entry", () => {
    render(<JournalPage />);
    expect(screen.getByPlaceholderText(/house hunt/)).toBeInTheDocument();
  });
});
