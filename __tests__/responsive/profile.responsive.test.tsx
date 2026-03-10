import { render, screen } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";
import { setViewport, VIEWPORTS } from "../helpers/viewport";

global.fetch = jest.fn((url: string | URL | Request) => {
  const u = typeof url === "string" ? url : "";
  if (u.includes("/api/profile")) return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
  if (u.includes("/api/calculator")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ combinedIncome: 120000, multiplier: 4, maxLTI: 480000, maxPropertyPrice: 533333, minDeposit: 53333, monthlyAt4pct: 2292, monthlyAt6pct: 2878 }) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
}) as jest.Mock;

describe("Profile — Responsive", () => {
  afterEach(() => setViewport(VIEWPORTS.desktop));

  describe("Mobile (375px)", () => {
    beforeEach(() => setViewport(VIEWPORTS.mobile));

    it("all form fields are visible", () => {
      render(<ProfilePage />);
      expect(screen.getByText("Partner 1 Name")).toBeVisible();
      expect(screen.getByText("Partner 2 Name")).toBeVisible();
      expect(screen.getByText("Gross Income 1 (€)")).toBeVisible();
    });

    it("form uses single column on mobile", () => {
      const { container } = render(<ProfilePage />);
      const grid = container.querySelector(".grid");
      expect(grid?.className).toContain("grid-cols-1");
    });

    it("save button is accessible", () => {
      render(<ProfilePage />);
      expect(screen.getByText("Save Profile")).toBeVisible();
    });
  });
});
