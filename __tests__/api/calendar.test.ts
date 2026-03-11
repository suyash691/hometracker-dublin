/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET } from "@/app/api/houses/[id]/calendar/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Calendar API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns .ics file for house with viewing date", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({
      id: "h1", address: "42 Phibsborough Rd", askingPrice: 425000,
      bedrooms: 3, bathrooms: 1, ber: "C2", neighbourhood: "Phibsborough",
      eircode: "D07", viewingDate: new Date("2026-03-15T11:00:00Z"),
    });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/calendar");
    const body = await res.text();
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("Viewing: 42 Phibsborough Rd");
  });

  it("returns 404 for missing house", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(res.status).toBe(404);
  });

  it("returns 400 when no viewing date", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", address: "42 Phibs", viewingDate: null });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(res.status).toBe(400);
  });
});
