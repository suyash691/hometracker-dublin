import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";

global.fetch = jest.fn((url: string | URL | Request) => {
  const u = typeof url === "string" ? url : "";
  if (u.includes("/api/profile") && u.includes("PUT")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: "p1" }) } as Response);
  if (u.includes("/api/profile")) return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
  if (u.includes("/api/calculator")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ combinedIncome: 0, maxLTI: 0, maxPropertyPrice: 0, minDeposit: 0, monthlyAt4pct: 0, monthlyAt6pct: 0, multiplier: 4 }) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve(null) } as Response);
}) as jest.Mock;

describe("Profile — Interactions", () => {
  it("save button calls API", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByText("Partner 1 Name").closest("label")!.querySelector("input")!, { target: { value: "Sarah" } });
    fireEvent.change(screen.getByText("Partner 2 Name").closest("label")!.querySelector("input")!, { target: { value: "John" } });
    fireEvent.click(screen.getByText("Save Profile"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/profile"), expect.objectContaining({ method: "PUT" })));
  });
});
