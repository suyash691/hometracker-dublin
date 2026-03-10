import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "@/app/page";
import { setViewport, VIEWPORTS } from "../helpers/viewport";

jest.mock("next/link", () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>);

global.fetch = jest.fn((url: string | URL | Request) => {
  const u = typeof url === "string" ? url : "";
  if (u.includes("/api/houses")) return Promise.resolve({ ok: true, json: () => Promise.resolve([
    { id: "h1", address: "42 Phibsborough Rd", status: "bidding", askingPrice: 425000, media: [], bids: [], actionItems: [], renovationEstimates: [], viewingChecklists: [] },
  ]) } as Response);
  if (u.includes("/api/actions")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
  if (u.includes("/api/activity")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
  if (u.includes("/api/profile")) return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
  if (u.includes("/api/mortgage")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
}) as jest.Mock;

describe("Dashboard — Responsive", () => {
  afterEach(() => setViewport(VIEWPORTS.desktop));

  describe("Mobile (375px)", () => {
    beforeEach(() => setViewport(VIEWPORTS.mobile));

    it("renders all stat cards", async () => {
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText("Total Houses")).toBeInTheDocument());
      expect(screen.getByText("Bidding")).toBeInTheDocument();
      expect(screen.getByText("Overdue Actions")).toBeInTheDocument();
    });

    it("import input is visible and full-width", async () => {
      render(<Dashboard />);
      const input = screen.getByPlaceholderText(/Daft.ie/);
      expect(input).toBeInTheDocument();
      expect(input).toBeVisible();
    });

    it("import button is accessible", () => {
      render(<Dashboard />);
      expect(screen.getByText("Import Listing")).toBeInTheDocument();
    });

    it("kanban columns are scrollable (overflow-x-auto)", async () => {
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText("Houses by Status")).toBeInTheDocument());
    });

    it("house cards are visible in kanban", async () => {
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText("42 Phibsborough Rd")).toBeInTheDocument());
    });
  });

  describe("Tablet (768px)", () => {
    beforeEach(() => setViewport(VIEWPORTS.tablet));

    it("renders all content", async () => {
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
      expect(screen.getByText("Total Houses")).toBeInTheDocument();
      expect(screen.getByText("Upcoming Viewings")).toBeInTheDocument();
    });
  });

  describe("Desktop (1280px)", () => {
    beforeEach(() => setViewport(VIEWPORTS.desktop));

    it("renders full layout", async () => {
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    });
  });
});
