/**
 * @jest-environment node
 */
import { GET } from "@/app/api/calculator/planning/route";
import { NextRequest } from "next/server";

describe("Planning Calculator API", () => {
  it("rear extension 35sqm → exempt", async () => {
    const res = await GET(new NextRequest("http://localhost/api/calculator/planning?type=rear_extension&size=35"));
    const data = await res.json();
    expect(data.exempt).toBe(true);
  });

  it("rear extension 45sqm → not exempt", async () => {
    const res = await GET(new NextRequest("http://localhost/api/calculator/planning?type=rear_extension&size=45"));
    const data = await res.json();
    expect(data.exempt).toBe(false);
  });

  it("includes gardenSize param", async () => {
    const res = await GET(new NextRequest("http://localhost/api/calculator/planning?type=rear_extension&size=35&gardenSize=55"));
    const data = await res.json();
    expect(data.exempt).toBe(false); // 55-35=20 < 25
  });
});
