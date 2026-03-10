import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";

global.fetch = jest.fn((url: string | URL | Request) => {
  const u = typeof url === "string" ? url : "";
  if (u.includes("/api/profile")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: "p1", name1: "Sarah", name2: "John", isFirstTimeBuyer: true, grossIncome1: 65000, grossIncome2: 55000, totalSavings: 55000, taxPaid4Years1: 40000, taxPaid4Years2: 35000, existingMonthlyDebt: 0 }) } as Response);
  if (u.includes("/api/calculator")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ combinedIncome: 120000, multiplier: 4, maxLTI: 480000, maxPropertyPrice: 533333, minDeposit: 53333, monthlyAt4pct: 2292, monthlyAt6pct: 2878 }) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
}) as jest.Mock;

describe("Profile Page", () => {
  it("renders profile form", async () => {
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText("Buyer Profile")).toBeInTheDocument());
  });
  it("shows computed borrowing limits", async () => {
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText(/Max Borrowing/)).toBeInTheDocument());
  });
  it("has first-time buyer checkbox", () => {
    render(<ProfilePage />);
    expect(screen.getByText("First-time buyer")).toBeInTheDocument();
  });
});
