import { render, screen, waitFor } from "@testing-library/react";
import ActionsPage from "@/app/actions/page";
jest.mock("next/link", () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>);
global.fetch = jest.fn((url: string | URL | Request) => {
  const u = typeof url === "string" ? url : "";
  if (u.includes("/api/actions")) return Promise.resolve({ ok: true, json: () => Promise.resolve([
    { id: "a1", title: "Call solicitor", status: "todo", category: "legal", dueDate: new Date(Date.now() - 86400000).toISOString() },
    { id: "a2", title: "Book survey", status: "done", category: "survey" },
  ]) } as Response);
  if (u.includes("/api/houses")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
}) as jest.Mock;

describe("Actions Page", () => {
  it("renders action items", async () => {
    render(<ActionsPage />);
    await waitFor(() => expect(screen.getByText("Call solicitor")).toBeInTheDocument());
  });
  it("shows add action button", () => {
    render(<ActionsPage />);
    expect(screen.getByText("+ Add Action")).toBeInTheDocument();
  });
  it("shows completed section", async () => {
    render(<ActionsPage />);
    await waitFor(() => expect(screen.getByText(/Completed/)).toBeInTheDocument());
  });
  it("shows category for todo items", async () => {
    render(<ActionsPage />);
    await waitFor(() => expect(screen.getByText(/legal/i)).toBeInTheDocument());
  });
});
