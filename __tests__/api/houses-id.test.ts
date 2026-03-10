/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT, DELETE } from "@/app/api/houses/[id]/route";
import { NextRequest } from "next/server";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

const mockHouse = {
  id: "h1", address: "123 Grafton St", status: "wishlist",
  media: [], bids: [], actionItems: [], renovationEstimates: [], viewingChecklists: [],
};

beforeEach(() => jest.clearAllMocks());

describe("GET /api/houses/[id]", () => {
  it("returns house with relations", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue(mockHouse);
    const res = await GET(new NextRequest("http://localhost/api/houses/h1"), ctx("h1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.address).toBe("123 Grafton St");
  });

  it("returns 404 for missing house", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/houses/missing"), ctx("missing"));
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/houses/[id]", () => {
  it("updates a house", async () => {
    (prisma.house.update as jest.Mock).mockResolvedValue({ ...mockHouse, status: "bidding" });
    const req = new NextRequest("http://localhost/api/houses/h1", {
      method: "PUT", body: JSON.stringify({ status: "bidding" }),
    });
    const res = await PUT(req, ctx("h1"));
    expect(res.status).toBe(200);
    expect(prisma.house.update).toHaveBeenCalledWith({ where: { id: "h1" }, data: { status: "bidding" } });
  });

  it("serializes pros/cons arrays on update", async () => {
    (prisma.house.update as jest.Mock).mockResolvedValue(mockHouse);
    const req = new NextRequest("http://localhost/api/houses/h1", {
      method: "PUT", body: JSON.stringify({ pros: ["big garden"] }),
    });
    await PUT(req, ctx("h1"));
    const call = (prisma.house.update as jest.Mock).mock.calls[0][0];
    expect(call.data.pros).toBe(JSON.stringify(["big garden"]));
  });
});

describe("DELETE /api/houses/[id]", () => {
  it("deletes a house", async () => {
    (prisma.house.delete as jest.Mock).mockResolvedValue({});
    const res = await DELETE(new NextRequest("http://localhost/api/houses/h1"), ctx("h1"));
    expect(res.status).toBe(200);
    expect(prisma.house.delete).toHaveBeenCalledWith({ where: { id: "h1" } });
  });
});
