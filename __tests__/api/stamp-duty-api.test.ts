/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET } from "@/app/api/stamp-duty/route";
import { NextRequest } from "next/server";

describe("Stamp Duty API", () => {
  it("returns stamp duty for valid price", async () => {
    const res = await GET(new NextRequest("http://localhost/api/stamp-duty?price=450000"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.stampableAmount).toBe(450000);
    expect(data.stampDuty).toBe(4500);
  });

  it("returns 400 for missing price", async () => {
    const res = await GET(new NextRequest("http://localhost/api/stamp-duty"));
    expect(res.status).toBe(400);
  });

  it("handles newBuild=true", async () => {
    const res = await GET(new NextRequest("http://localhost/api/stamp-duty?price=450000&newBuild=true"));
    const data = await res.json();
    expect(data.stampableAmount).toBe(Math.round(450000 / 1.135));
  });

  it("defaults newBuild to false", async () => {
    const res = await GET(new NextRequest("http://localhost/api/stamp-duty?price=450000"));
    const data = await res.json();
    expect(data.stampableAmount).toBe(450000);
  });
});
