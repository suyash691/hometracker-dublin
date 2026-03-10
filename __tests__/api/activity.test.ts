/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET } from "@/app/api/activity/route";
import { NextRequest } from "next/server";
describe("Activity API", () => {
  it("returns activity logs", async () => {
    (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([{ id: "l1", action: "added_house" }]);
    const res = await GET(new NextRequest("http://localhost/api/activity"));
    expect(await res.json()).toHaveLength(1);
  });
  it("respects limit param", async () => {
    (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([]);
    await GET(new NextRequest("http://localhost/api/activity?limit=10"));
    expect(prisma.activityLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
  });
});
