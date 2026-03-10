/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET } from "@/app/api/houses/[id]/ber-impact/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("BER Impact API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns impact for house with BER and sqm", async () => {
    prisma.house.findUnique.mockResolvedValue({ id: "h1", ber: "D1", squareMetres: 100, askingPrice: 450000 });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    const data = await res.json();
    expect(data.estimatedAnnualHeating).toBe(2700);
    expect(data.seaiGrantsAvailable).toBe(25000);
  });

  it("returns null when no BER", async () => {
    prisma.house.findUnique.mockResolvedValue({ id: "h1", ber: null, squareMetres: 100 });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(await res.json()).toBeNull();
  });

  it("returns null when no sqm", async () => {
    prisma.house.findUnique.mockResolvedValue({ id: "h1", ber: "D1", squareMetres: null });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(await res.json()).toBeNull();
  });
});
