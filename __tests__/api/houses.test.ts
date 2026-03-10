/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/houses/route";
import { NextRequest } from "next/server";

const mockHouse = {
  id: "h1", address: "123 Grafton St", status: "wishlist", askingPrice: 450000,
  neighbourhood: "Dublin 2", createdAt: new Date(), updatedAt: new Date(),
  bids: [], media: [],
};

beforeEach(() => jest.clearAllMocks());

describe("GET /api/houses", () => {
  it("returns all houses", async () => {
    (prisma.house.findMany as jest.Mock).mockResolvedValue([mockHouse]);
    const res = await GET(new NextRequest("http://localhost/api/houses"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].address).toBe("123 Grafton St");
  });

  it("filters by status", async () => {
    (prisma.house.findMany as jest.Mock).mockResolvedValue([]);
    await GET(new NextRequest("http://localhost/api/houses?status=bidding"));
    expect(prisma.house.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: "bidding" }) })
    );
  });

  it("filters by neighbourhood", async () => {
    (prisma.house.findMany as jest.Mock).mockResolvedValue([]);
    await GET(new NextRequest("http://localhost/api/houses?neighbourhood=Dublin+2"));
    expect(prisma.house.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ neighbourhood: "Dublin 2" }) })
    );
  });
});

describe("POST /api/houses", () => {
  it("creates a house", async () => {
    (prisma.house.create as jest.Mock).mockResolvedValue(mockHouse);
    const req = new NextRequest("http://localhost/api/houses", {
      method: "POST",
      body: JSON.stringify({ address: "123 Grafton St" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(prisma.house.create).toHaveBeenCalled();
  });

  it("serializes pros/cons arrays to JSON strings", async () => {
    (prisma.house.create as jest.Mock).mockResolvedValue(mockHouse);
    const req = new NextRequest("http://localhost/api/houses", {
      method: "POST",
      body: JSON.stringify({ address: "x", pros: ["garden", "quiet"], cons: ["small"] }),
    });
    await POST(req);
    const call = (prisma.house.create as jest.Mock).mock.calls[0][0];
    expect(call.data.pros).toBe(JSON.stringify(["garden", "quiet"]));
    expect(call.data.cons).toBe(JSON.stringify(["small"]));
  });
});
