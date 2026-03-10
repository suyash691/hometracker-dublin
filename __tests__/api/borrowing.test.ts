/**
 * @jest-environment node
 */
import { GET } from "@/app/api/calculator/borrowing/route";
import { NextRequest } from "next/server";

describe("Borrowing Calculator API", () => {
  it("returns limits for FTB couple", async () => {
    const res = await GET(new NextRequest("http://localhost/api/calculator/borrowing?income1=65000&income2=55000&ftb=true"));
    const data = await res.json();
    expect(data.combinedIncome).toBe(120000);
    expect(data.multiplier).toBe(4);
    expect(data.maxLTI).toBe(480000);
  });

  it("ftb=false uses 3.5x", async () => {
    const res = await GET(new NextRequest("http://localhost/api/calculator/borrowing?income1=65000&income2=55000&ftb=false"));
    const data = await res.json();
    expect(data.multiplier).toBe(3.5);
  });

  it("defaults ftb to true", async () => {
    const res = await GET(new NextRequest("http://localhost/api/calculator/borrowing?income1=65000&income2=55000"));
    const data = await res.json();
    expect(data.multiplier).toBe(4);
  });
});
