/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/comms/route";
import { NextRequest } from "next/server";

describe("Comms API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns all comms", async () => {
    prisma.commLog.findMany.mockResolvedValue([{ id: "c1", professional: "solicitor" }]);
    const res = await GET(new NextRequest("http://localhost/api/comms"));
    expect(await res.json()).toHaveLength(1);
  });
  it("GET filters by houseId", async () => {
    await GET(new NextRequest("http://localhost/api/comms?houseId=h1"));
    expect(prisma.commLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ houseId: "h1" }) }));
  });
  it("POST creates comm log", async () => {
    const req = new NextRequest("http://localhost/api/comms", { method: "POST", body: JSON.stringify({ professional: "solicitor", contactName: "Mary", direction: "outbound", method: "email", summary: "Chased contracts" }) });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
