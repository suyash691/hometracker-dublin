import { render, screen, waitFor } from "@testing-library/react";
import SchemesPage from "@/app/schemes/page";
import { setViewport, VIEWPORTS } from "../helpers/viewport";

global.fetch = jest.fn((url: string | URL | Request) => {
  const u = typeof url === "string" ? url : "";
  if (u.includes("eligibility")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ htb: { eligible: true, reason: "OK", maxRefund: 30000 }, fhs: { eligible: false, reason: "N/A", maxEquity: 0 }, lahl: { eligible: false, reason: "N/A", maxLoan: 0 } }) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
}) as jest.Mock;

describe("Schemes — Responsive", () => {
  afterEach(() => setViewport(VIEWPORTS.desktop));
  describe("Mobile (375px)", () => {
    beforeEach(() => setViewport(VIEWPORTS.mobile));
    it("scheme cards visible", async () => {
      render(<SchemesPage />);
      await waitFor(() => expect(screen.getByText(/Help to Buy/)).toBeInTheDocument());
    });
    it("SEAI table visible", async () => {
      render(<SchemesPage />);
      await waitFor(() => expect(screen.getByText("Heat Pump System")).toBeInTheDocument());
    });
  });
});
