/**
 * @jest-environment node
 */
import { calculateStampDuty } from "@/lib/stamp-duty";

describe("calculateStampDuty", () => {
  // Band 1: 1% up to €1M
  it("€400k second-hand → €4,000", () => {
    expect(calculateStampDuty(400000, false)).toEqual({ stampableAmount: 400000, stampDuty: 4000 });
  });
  it("€1M boundary → €10,000", () => {
    expect(calculateStampDuty(1000000, false)).toEqual({ stampableAmount: 1000000, stampDuty: 10000 });
  });
  // Band 2: 2% from €1M to €1.5M
  it("€1.2M → €14,000", () => {
    expect(calculateStampDuty(1200000, false)).toEqual({ stampableAmount: 1200000, stampDuty: 14000 });
  });
  it("€1.5M boundary → €20,000", () => {
    expect(calculateStampDuty(1500000, false)).toEqual({ stampableAmount: 1500000, stampDuty: 20000 });
  });
  // Band 3: 6% above €1.5M
  it("€2M → €50,000", () => {
    expect(calculateStampDuty(2000000, false)).toEqual({ stampableAmount: 2000000, stampDuty: 50000 });
  });
  // New build VAT treatment
  it("€450k new build → VAT-exclusive stampable", () => {
    const r = calculateStampDuty(450000, true);
    expect(r.stampableAmount).toBe(Math.round(450000 / 1.135));
    expect(r.stampDuty).toBe(Math.round(r.stampableAmount * 0.01));
  });
  it("€500k new build (common FTB price)", () => {
    const r = calculateStampDuty(500000, true);
    expect(r.stampableAmount).toBe(440529);
    expect(r.stampDuty).toBe(4405);
  });
  // Edge cases
  it("€0 → no duty", () => {
    expect(calculateStampDuty(0, false)).toEqual({ stampableAmount: 0, stampDuty: 0 });
  });
  it("€100 → €1", () => {
    expect(calculateStampDuty(100, false)).toEqual({ stampableAmount: 100, stampDuty: 1 });
  });
  it("rounding on €333,333", () => {
    expect(calculateStampDuty(333333, false)).toEqual({ stampableAmount: 333333, stampDuty: 3333 });
  });
  it("new build crossing into band 2 after VAT removal", () => {
    const r = calculateStampDuty(1200000, true);
    expect(r.stampableAmount).toBe(Math.round(1200000 / 1.135));
    expect(r.stampDuty).toBe(10000 + Math.round((r.stampableAmount - 1000000) * 0.02));
  });
});
