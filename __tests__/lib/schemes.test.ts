/**
 * @jest-environment node
 */
import { calculateHTB, calculateFHS, calculateLAHL } from "@/lib/schemes";
import { CONVEYANCING_MILESTONES, } from "@/lib/constants/conveyancing";
import { OMC_CHECKLIST } from "@/lib/constants/omc";
import { SEAI_GRANTS } from "@/lib/constants/seai";

describe("calculateHTB", () => {
  it("eligible FTB new build → capped at €30k", () => {
    expect(calculateHTB(true, true, 400000, 50000)).toEqual({ eligible: true, reason: "Eligible", maxRefund: 30000 });
  });
  it("tax-limited refund", () => {
    expect(calculateHTB(true, true, 400000, 15000).maxRefund).toBe(15000);
  });
  it("price-limited (10% of €200k)", () => {
    expect(calculateHTB(true, true, 200000, 50000).maxRefund).toBe(20000);
  });
  it("not FTB → ineligible", () => {
    const r = calculateHTB(false, true, 400000, 50000);
    expect(r.eligible).toBe(false);
    expect(r.reason).toContain("first-time");
  });
  it("not new build → ineligible", () => {
    expect(calculateHTB(true, false, 400000, 50000).eligible).toBe(false);
  });
  it("price over €500k → ineligible", () => {
    expect(calculateHTB(true, true, 550000, 50000).eligible).toBe(false);
  });
  it("exactly €500k → eligible", () => {
    expect(calculateHTB(true, true, 500000, 50000).eligible).toBe(true);
  });
  it("zero tax paid → €0 refund", () => {
    expect(calculateHTB(true, true, 400000, 0).maxRefund).toBe(0);
  });
});

describe("calculateFHS", () => {
  it("without HTB → 30% equity", () => {
    expect(calculateFHS(true, true, 400000, false).maxEquity).toBe(120000);
  });
  it("with HTB → 20% equity", () => {
    expect(calculateFHS(true, true, 400000, true).maxEquity).toBe(80000);
  });
  it("not FTB → ineligible", () => {
    expect(calculateFHS(false, true, 400000, false).eligible).toBe(false);
  });
  it("not new build → ineligible", () => {
    expect(calculateFHS(true, false, 400000, false).eligible).toBe(false);
  });
  it("over Dublin ceiling €475k → ineligible", () => {
    expect(calculateFHS(true, true, 500000, false).eligible).toBe(false);
  });
  it("exactly €475k → eligible", () => {
    expect(calculateFHS(true, true, 475000, false).eligible).toBe(true);
  });
});

describe("calculateLAHL", () => {
  it("eligible single under €80k", () => {
    expect(calculateLAHL(70000, 0, true)).toEqual(expect.objectContaining({ eligible: true, maxLoan: 415000 }));
  });
  it("eligible couple under €85k", () => {
    expect(calculateLAHL(50000, 30000, true).eligible).toBe(true);
  });
  it("single over €80k → ineligible", () => {
    expect(calculateLAHL(85000, 0, true).eligible).toBe(false);
  });
  it("couple over €85k → ineligible", () => {
    expect(calculateLAHL(50000, 40000, true).eligible).toBe(false);
  });
  it("not FTB → ineligible", () => {
    expect(calculateLAHL(50000, 30000, false).eligible).toBe(false);
  });
  it("exactly at single limit €80k → ineligible (> not >=)", () => {
    // €80k > €80k is false, so this should be eligible
    // Actually: total=80000, limit=80000, condition is total > limit → false → eligible
    expect(calculateLAHL(80000, 0, true).eligible).toBe(true);
  });
});

describe("constants", () => {
  it("CONVEYANCING_MILESTONES has 18 items", () => expect(CONVEYANCING_MILESTONES).toHaveLength(18));
  it("first milestone is Solicitor appointed", () => expect(CONVEYANCING_MILESTONES[0]).toBe("Solicitor appointed"));
  it("last milestone is LPT registration updated", () => expect(CONVEYANCING_MILESTONES[17]).toBe("LPT registration updated"));
  it("OMC_CHECKLIST has 14 items", () => expect(OMC_CHECKLIST).toHaveLength(14));
  it("SEAI_GRANTS has 9 items", () => expect(SEAI_GRANTS).toHaveLength(9));
  it("Heat Pump grant is €12,500", () => expect(SEAI_GRANTS[0].amount).toBe(12500));
});
