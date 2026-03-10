import { render, screen, waitFor } from "@testing-library/react";
import MortgagePage from "@/app/mortgage/page";
import { setViewport, VIEWPORTS } from "../helpers/viewport";

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([
  { id: "m1", lender: "AIB", approvalAmount: 430000, interestRate: 3.95, fixedPeriod: 5, term: 30, status: "approval_in_principle", documents: [], exemptions: [] },
]) } as Response)) as jest.Mock;

describe("Mortgage — Responsive", () => {
  afterEach(() => setViewport(VIEWPORTS.desktop));
  describe("Mobile (375px)", () => {
    beforeEach(() => setViewport(VIEWPORTS.mobile));
    it("lender cards visible", async () => {
      render(<MortgagePage />);
      await waitFor(() => expect(screen.getAllByText("AIB").length).toBeGreaterThanOrEqual(1));
    });
    it("add button visible", () => {
      render(<MortgagePage />);
      expect(screen.getByText("+ Add Lender")).toBeVisible();
    });
  });
});
