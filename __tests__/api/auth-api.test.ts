/**
 * @jest-environment node
 */
import { POST } from "@/app/api/auth/login/route";
import { GET } from "@/app/api/auth/me/route";
import { NextRequest } from "next/server";
describe("Auth API", () => {
  it("POST login sets cookie", async () => {
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ name: "sarah", password: "" }) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.cookies.get("ht_user")).toBeDefined();
  });
  it("POST login returns 400 for missing name", async () => {
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({}) });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
  it("GET me returns null without cookie", async () => {
    const req = new NextRequest("http://localhost");
    const res = await GET(req);
    expect((await res.json()).user).toBeNull();
  });
});
