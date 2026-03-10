import { render, screen, waitFor } from "@testing-library/react";
import SchemesPage from "@/app/schemes/page";

global.fetch = jest.fn((url: string | URL | Request) => {
  const u = typeof url === "string" ? url : "";
  if (u.includes("/api/schemes/eligibility")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ htb: { eligible: true, reason: "Eligible", maxRefund: 30000 }, fhs: { eligible: true, reason: "Eligible", maxEquity: 80000 }, lahl: { eligible: false, reason: "Income too high", maxLoan: 0 } }) } as Response);
  if (u.includes("/api/houses")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
  if (u.includes("/api/profile")) return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
  if (u.includes("/api/calculator")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ maxPropertyPrice: 500000 }) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
}) as jest.Mock;

describe("Schemes Page", () => {
  it("shows HTB as eligible", async () => {
    render(<SchemesPage />);
    await waitFor(() => expect(screen.getByText(/Help to Buy/)).toBeInTheDocument());
    expect(screen.getAllByText(/ELIGIBLE/).length).toBeGreaterThanOrEqual(1);
  });
  it("shows SEAI grants table", async () => {
    render(<SchemesPage />);
    await waitFor(() => expect(screen.getByText("Heat Pump System")).toBeInTheDocument());
  });
  it("shows LAHL as not eligible", async () => {
    render(<SchemesPage />);
    await waitFor(() => expect(screen.getByText(/NOT ELIGIBLE/)).toBeInTheDocument());
  });
});
