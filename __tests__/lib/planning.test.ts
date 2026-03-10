/**
 * @jest-environment node
 */
import { checkPlanningExemption } from "@/lib/planning";

describe("checkPlanningExemption", () => {
  // Rear extension
  it("rear 35sqm → exempt", () => {
    expect(checkPlanningExemption("rear_extension", 35)).toEqual(expect.objectContaining({ exempt: true }));
  });
  it("rear 40sqm → exempt (boundary)", () => {
    expect(checkPlanningExemption("rear_extension", 40)).toEqual(expect.objectContaining({ exempt: true }));
  });
  it("rear 41sqm → not exempt", () => {
    expect(checkPlanningExemption("rear_extension", 41).exempt).toBe(false);
  });
  it("rear 35sqm, garden 55sqm → not exempt (remaining <25)", () => {
    expect(checkPlanningExemption("rear_extension", 35, 55).exempt).toBe(false);
  });
  it("rear 35sqm, garden 60sqm → exempt (remaining =25)", () => {
    expect(checkPlanningExemption("rear_extension", 35, 60).exempt).toBe(true);
  });
  it("rear with no garden size → exempt (skip check)", () => {
    expect(checkPlanningExemption("rear_extension", 35).exempt).toBe(true);
  });
  it("rear exempt has conditions", () => {
    const r = checkPlanningExemption("rear_extension", 30);
    expect(r.conditions).toBeDefined();
    expect(r.conditions!.some(c => c.includes("Single storey"))).toBe(true);
  });
  // Garage/shed
  it("garage 20sqm → exempt", () => {
    expect(checkPlanningExemption("garage_shed", 20).exempt).toBe(true);
  });
  it("garage 30sqm → not exempt", () => {
    expect(checkPlanningExemption("garage_shed", 30).exempt).toBe(false);
  });
  // Porch
  it("porch 1.5sqm → exempt", () => {
    expect(checkPlanningExemption("porch", 1.5).exempt).toBe(true);
  });
  it("porch 3sqm → not exempt", () => {
    expect(checkPlanningExemption("porch", 3).exempt).toBe(false);
  });
  // Attic
  it("attic conversion → generally exempt", () => {
    const r = checkPlanningExemption("attic_conversion", 0);
    expect(r.exempt).toBe(true);
    expect(r.conditions!.some(c => c.includes("Dormer"))).toBe(true);
  });
  // Unknown
  it("unknown type → not exempt", () => {
    expect(checkPlanningExemption("swimming_pool", 50).exempt).toBe(false);
  });
});
