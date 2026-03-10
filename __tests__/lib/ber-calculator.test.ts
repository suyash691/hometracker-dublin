/**
 * @jest-environment node
 */
import { calculateBerImpact } from "@/lib/ber-calculator";

describe("calculateBerImpact", () => {
  it("A1 100sqm → minimal costs", () => {
    const r = calculateBerImpact("A1", 100);
    expect(r.estimatedAnnualHeating).toBe(400);
    expect(r.retrofitCostLow).toBe(0);
    expect(r.retrofitCostHigh).toBe(0);
    expect(r.seaiGrantsAvailable).toBe(0);
  });
  it("B2 100sqm → target rating, no retrofit", () => {
    const r = calculateBerImpact("B2", 100);
    expect(r.estimatedAnnualHeating).toBe(900);
    expect(r.retrofitCostLow).toBe(0);
  });
  it("D1 100sqm → significant retrofit", () => {
    const r = calculateBerImpact("D1", 100);
    expect(r.estimatedAnnualHeating).toBe(2700);
    expect(r.retrofitCostLow).toBe(25000);
    expect(r.retrofitCostHigh).toBe(40000);
    expect(r.seaiGrantsAvailable).toBe(25000);
  });
  it("D1 net retrofit after grants", () => {
    const r = calculateBerImpact("D1", 100);
    expect(r.netRetrofitLow).toBe(0); // 25000 - 25000
    expect(r.netRetrofitHigh).toBe(15000); // 40000 - 25000
  });
  it("G 100sqm → worst rating", () => {
    const r = calculateBerImpact("G", 100);
    expect(r.estimatedAnnualHeating).toBe(5500);
    expect(r.retrofitCostHigh).toBe(80000);
    expect(r.seaiGrantsAvailable).toBe(30000);
  });
  it("scales by sqm (D1, 95sqm)", () => {
    const r = calculateBerImpact("D1", 95);
    expect(r.estimatedAnnualHeating).toBe(2565);
    expect(r.retrofitCostLow).toBe(23750);
    expect(r.retrofitCostHigh).toBe(38000);
  });
  it("ten-year saving = (annual - annualAfter) * 10", () => {
    const r = calculateBerImpact("D1", 100);
    expect(r.tenYearSaving).toBe((2700 - 900) * 10);
  });
  it("annualAfterRetrofit targets B2 (9 * sqm)", () => {
    expect(calculateBerImpact("D1", 100).annualHeatingAfterRetrofit).toBe(900);
    expect(calculateBerImpact("D1", 150).annualHeatingAfterRetrofit).toBe(1350);
  });
  it("trueCost with asking price", () => {
    const r = calculateBerImpact("D1", 100, 450000);
    expect(r.trueCostWithout).toBe(450000 + 27000);
    expect(r.trueCostWith).toBe(450000 + 15000 + 9000);
  });
  it("trueCost without asking price defaults to 0", () => {
    const r = calculateBerImpact("D1", 100);
    expect(r.trueCostWithout).toBe(27000);
  });
  it("unknown BER falls back to 20/sqm", () => {
    expect(calculateBerImpact("X", 100).estimatedAnnualHeating).toBe(2000);
  });
  it("zero sqm → all zeros", () => {
    const r = calculateBerImpact("D1", 0);
    expect(r.estimatedAnnualHeating).toBe(0);
    expect(r.retrofitCostLow).toBe(0);
  });
  it("F rating 150sqm scaled", () => {
    const r = calculateBerImpact("F", 150);
    expect(r.estimatedAnnualHeating).toBe(7200);
    expect(r.retrofitCostLow).toBe(75000);
    expect(r.retrofitCostHigh).toBe(112500);
  });
});
