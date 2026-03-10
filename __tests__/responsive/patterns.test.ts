import { render, screen } from "@testing-library/react";
import { setViewport, VIEWPORTS } from "../helpers/viewport";

/**
 * Tests that verify responsive design patterns are correctly applied
 * across the app. These test CSS class presence rather than visual rendering
 * (which requires Playwright/Cypress for true visual regression).
 */

describe("Responsive Design Patterns", () => {
  afterEach(() => setViewport(VIEWPORTS.desktop));

  describe("Touch targets (WCAG 2.5.8 — minimum 44x44px)", () => {
    it("nav links have min-height 44px class", async () => {
      // Import layout to check nav structure
      // Since layout is a server component, we check the CSS rules instead
      const fs = await import("fs");
      const css = fs.readFileSync("src/app/globals.css", "utf-8");
      expect(css).toContain("min-height: 44px");
    });

    it("checkboxes have minimum size", async () => {
      const fs = await import("fs");
      const css = fs.readFileSync("src/app/globals.css", "utf-8");
      expect(css).toContain("min-width: 20px");
      expect(css).toContain("min-height: 20px");
    });
  });

  describe("Responsive grid patterns", () => {
    it("profile page uses grid-cols-1 sm:grid-cols-2", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/profile/page.tsx", "utf-8");
      expect(src).toContain("grid-cols-1 sm:grid-cols-2");
    });

    it("mortgage page uses responsive grid", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/mortgage/page.tsx", "utf-8");
      expect(src).toContain("sm:grid-cols-2 md:grid-cols-3");
    });

    it("house detail stat cards use grid-cols-2 md:grid-cols-5", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/houses/[id]/page.tsx", "utf-8");
      expect(src).toContain("grid-cols-2 md:grid-cols-5");
    });

    it("dashboard stats use grid-cols-2 md:grid-cols-4", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/page.tsx", "utf-8");
      expect(src).toContain("grid-cols-2 md:grid-cols-4");
    });

    it("houses form uses responsive grid", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/houses/page.tsx", "utf-8");
      expect(src).toContain("grid-cols-1 sm:grid-cols-2");
    });

    it("actions form uses responsive grid", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/actions/page.tsx", "utf-8");
      expect(src).toContain("grid-cols-1 sm:grid-cols-2");
    });

    it("seller tab uses responsive grid", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/components/house-detail/SellerTab.tsx", "utf-8");
      expect(src).toContain("sm:grid-cols-2");
    });

    it("compliance tab uses responsive grid", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/components/house-detail/ComplianceTab.tsx", "utf-8");
      expect(src).toContain("sm:grid-cols-2");
    });
  });

  describe("Overflow handling", () => {
    it("house detail tabs have overflow-x-auto", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/houses/[id]/page.tsx", "utf-8");
      expect(src).toContain("overflow-x-auto");
    });

    it("kanban board has overflow-x-auto", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/page.tsx", "utf-8");
      expect(src).toContain("overflow-x-auto");
    });

    it("nav has overflow-x-auto for mobile", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/layout.tsx", "utf-8");
      expect(src).toContain("overflow-x-auto");
    });

    it("tab items have whitespace-nowrap to prevent wrapping", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/houses/[id]/page.tsx", "utf-8");
      expect(src).toContain("whitespace-nowrap");
    });
  });

  describe("Form wrapping on mobile", () => {
    it("bid form uses flex-wrap", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/houses/[id]/page.tsx", "utf-8");
      expect(src).toContain("flex-wrap");
    });

    it("survey form uses flex-wrap", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/components/house-detail/SurveyTab.tsx", "utf-8");
      expect(src).toContain("flex-wrap");
    });
  });

  describe("Viewport meta", () => {
    it("layout sets viewport meta", async () => {
      const fs = await import("fs");
      const src = fs.readFileSync("src/app/layout.tsx", "utf-8");
      expect(src).toContain("viewport");
    });
  });
});
