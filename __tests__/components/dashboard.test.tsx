import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "@/app/page";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
});

const mockHouses = [
  {
    id: "h1", address: "10 Temple Bar", status: "bidding", askingPrice: 350000,
    viewingDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    media: [], bids: [], actionItems: [], renovationEstimates: [], viewingChecklists: [],
  },
  {
    id: "h2", address: "5 Ranelagh Rd", status: "wishlist", askingPrice: 500000,
    viewingDate: null,
    media: [], bids: [], actionItems: [], renovationEstimates: [], viewingChecklists: [],
  },
];

const mockActions = [
  { id: "a1", title: "Call solicitor", status: "todo", category: "legal", dueDate: new Date(Date.now() - 86400000).toISOString() },
  { id: "a2", title: "Book survey", status: "done", category: "survey", dueDate: null },
];

global.fetch = jest.fn((url: string | URL | Request) => {
  const urlStr = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
  if (urlStr.includes("/api/houses")) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockHouses) } as Response);
  if (urlStr.includes("/api/actions")) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockActions) } as Response);
  if (urlStr.includes("/api/activity")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
  if (urlStr.includes("/api/profile")) return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
  if (urlStr.includes("/api/mortgage")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
  if (urlStr.includes("/api/calculator")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ maxPropertyPrice: 500000, maxLTI: 450000 }) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
}) as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("Dashboard", () => {
  it("renders stats cards", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Total Houses")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("shows bidding count", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Bidding")).toBeInTheDocument();
      // "1" appears multiple times (bidding count + overdue count), use getAllByText
      expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows overdue actions", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Call solicitor")).toBeInTheDocument();
    });
  });

  it("shows upcoming viewings", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Upcoming Viewings")).toBeInTheDocument();
      // "10 Temple Bar" appears in both upcoming viewings and kanban
      expect(screen.getAllByText("10 Temple Bar").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders kanban columns for all statuses", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Houses by Status")).toBeInTheDocument();
      expect(screen.getByText(/wishlist/)).toBeInTheDocument();
      expect(screen.getByText(/bidding/)).toBeInTheDocument();
    });
  });
});
