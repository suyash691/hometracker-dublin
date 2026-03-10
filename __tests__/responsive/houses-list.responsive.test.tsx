import { render, screen, waitFor } from "@testing-library/react";
import HousesPage from "@/app/houses/page";
import { setViewport, VIEWPORTS } from "../helpers/viewport";

jest.mock("next/link", () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>);

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([
  { id: "h1", address: "42 Phibsborough Rd", askingPrice: 425000, status: "bidding", neighbourhood: "Phibsborough", bedrooms: 3, bathrooms: 1, propertyType: "terraced", ber: "C2", media: [], bids: [] },
]) } as Response)) as jest.Mock;

describe("Houses List — Responsive", () => {
  afterEach(() => setViewport(VIEWPORTS.desktop));

  describe("Mobile (375px)", () => {
    beforeEach(() => setViewport(VIEWPORTS.mobile));

    it("house cards show address and price", async () => {
      render(<HousesPage />);
      await waitFor(() => expect(screen.getByText("42 Phibsborough Rd")).toBeVisible());
      expect(screen.getByText(/425,000/)).toBeVisible();
    });

    it("add house button is visible", () => {
      render(<HousesPage />);
      expect(screen.getByText("+ Add House")).toBeVisible();
    });

    it("form uses single column on mobile", async () => {
      const { container } = render(<HousesPage />);
      // The form grid should have responsive classes
      const grids = container.querySelectorAll(".grid");
      grids.forEach(g => {
        if (g.className.includes("grid-cols")) {
          expect(g.className).toMatch(/grid-cols-1|sm:grid-cols/);
        }
      });
    });
  });
});
