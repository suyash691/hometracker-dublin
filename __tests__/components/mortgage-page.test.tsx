import { render, screen, waitFor } from "@testing-library/react";
import MortgagePage from "@/app/mortgage/page";
const mockMortgages = [
  { id: "m1", lender: "AIB", approvalAmount: 430000, interestRate: 3.95, fixedPeriod: 5, term: 30, status: "approval_in_principle", documents: [], exemptions: [] },
  { id: "m2", lender: "PTSB", approvalAmount: 420000, interestRate: 4.1, fixedPeriod: 3, term: 30, status: "researching", documents: [], exemptions: [] },
];

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockMortgages) } as Response)) as jest.Mock;

beforeEach(() => {
  (global.fetch as jest.Mock).mockImplementation((url: string | URL | Request) => {
    const u = typeof url === "string" ? url : url instanceof URL ? url.toString() : (url as Request).url;
    if (u.includes("/api/mortgage")) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMortgages) } as Response);
    if (u.includes("/api/profile")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ grossIncome1: 65000, grossIncome2: 55000, isFirstTimeBuyer: true }) } as Response);
    if (u.includes("/api/calculator")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ maxLTI: 480000, multiplier: 4 }) } as Response);
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
  });
});

describe("Mortgage Page", () => {
  it("renders lender cards", async () => {
    render(<MortgagePage />);
    await waitFor(() => expect(screen.getAllByText("AIB").length).toBeGreaterThanOrEqual(1));
    expect(screen.getAllByText("PTSB").length).toBeGreaterThanOrEqual(1);
  });
  it("shows add lender button", () => {
    render(<MortgagePage />);
    expect(screen.getByText("+ Add Lender")).toBeInTheDocument();
  });
  it("shows comparison table when 2+ lenders", async () => {
    render(<MortgagePage />);
    await waitFor(() => expect(screen.getByText("Lender Comparison")).toBeInTheDocument());
  });
  it("shows approval amount", async () => {
    render(<MortgagePage />);
    await waitFor(() => expect(screen.getByText(/430,000/)).toBeInTheDocument());
  });
});
