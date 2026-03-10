/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/houses/[id]/bids/route";
import { NextRequest } from "next/server";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => jest.clearAllMocks());

describe("GET /api/houses/[id]/bids", () => {
  it("returns bids for a house", async () => {
    const bids = [{ id: "b1", houseId: "h1", amount: 400000, bidDate: new Date(), isOurs: true }];
    (prisma.bidHistory.findMany as jest.Mock).mockResolvedValue(bids);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });
});

describe("POST /api/houses/[id]/bids", () => {
  it("creates a bid and updates house currentBid", async () => {
    const bid = { id: "b1", houseId: "h1", amount: 420000 };
    (prisma.bidHistory.create as jest.Mock).mockResolvedValue(bid);
    (prisma.bidHistory.findFirst as jest.Mock).mockResolvedValue({ amount: 420000 });
    (prisma.house.update as jest.Mock).mockResolvedValue({});

    const req = new NextRequest("http://localhost", {
      method: "POST", body: JSON.stringify({ amount: 420000, isOurs: true }),
    });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(201);
    expect(prisma.house.update).toHaveBeenCalledWith({
      where: { id: "h1" }, data: { currentBid: 420000 },
    });
  });
});
