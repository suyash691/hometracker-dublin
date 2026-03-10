/**
 * @jest-environment node
 */
import { calculateBorrowingLimits } from "@/lib/central-bank";

describe("calculateBorrowingLimits", () => {
  it("FTB couple €60k+€50k → 4x multiplier", () => {
    const r = calculateBorrowingLimits(60000, 50000, true);
    expect(r.combinedIncome).toBe(110000);
    expect(r.multiplier).toBe(4);
    expect(r.maxLTI).toBe(440000);
    expect(r.maxPropertyPrice).toBe(Math.round(440000 / 0.9));
    expect(r.minDeposit).toBe(Math.round(r.maxPropertyPrice * 0.1));
  });
  it("non-FTB → 3.5x multiplier", () => {
    const r = calculateBorrowingLimits(60000, 50000, false);
    expect(r.multiplier).toBe(3.5);
    expect(r.maxLTI).toBe(385000);
  });
  it("single buyer €80k", () => {
    const r = calculateBorrowingLimits(80000, 0, true);
    expect(r.combinedIncome).toBe(80000);
    expect(r.maxLTI).toBe(320000);
  });
  it("zero income → all zeros", () => {
    const r = calculateBorrowingLimits(0, 0, true);
    expect(r.maxLTI).toBe(0);
    expect(r.maxPropertyPrice).toBe(0);
    expect(r.minDeposit).toBe(0);
  });
  it("deposit is exactly 10% of maxPropertyPrice", () => {
    const r = calculateBorrowingLimits(65000, 55000, true);
    expect(r.minDeposit).toBe(Math.round(r.maxPropertyPrice * 0.1));
  });
  it("monthly at 4% is positive for non-zero income", () => {
    const r = calculateBorrowingLimits(65000, 55000, true);
    expect(r.monthlyAt4pct).toBeGreaterThan(0);
  });
  it("monthly at 6% > monthly at 4% (stress test)", () => {
    const r = calculateBorrowingLimits(65000, 55000, true);
    expect(r.monthlyAt6pct).toBeGreaterThan(r.monthlyAt4pct);
  });
  it("high earners €200k+€200k", () => {
    const r = calculateBorrowingLimits(200000, 200000, true);
    expect(r.maxLTI).toBe(1600000);
  });
});
