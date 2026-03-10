/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/journal/route";
import { NextRequest } from "next/server";

describe("Journal API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns entries with house address", async () => {
    prisma.journalEntry.findMany.mockResolvedValue([{ id: "j1", content: "Felt good", house: { address: "42 Phibs" } }]);
    const res = await GET(new NextRequest("http://localhost/api/journal"));
    expect(await res.json()).toHaveLength(1);
  });
  it("GET filters by houseId", async () => {
    await GET(new NextRequest("http://localhost/api/journal?houseId=h1"));
    expect(prisma.journalEntry.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { houseId: "h1" } }));
  });
  it("POST creates entry", async () => {
    const req = new NextRequest("http://localhost/api/journal", { method: "POST", body: JSON.stringify({ type: "freeform", content: "Feeling hopeful" }) });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
