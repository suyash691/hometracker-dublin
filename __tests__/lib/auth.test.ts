/**
 * @jest-environment node
 */
import { createAuthCookie, getAuthUser } from "@/lib/auth";
import { NextRequest } from "next/server";

function makeReq(cookie?: string): NextRequest {
  const req = new NextRequest("http://localhost:3000/api/test");
  if (cookie) req.cookies.set("ht_user", cookie);
  return req;
}

describe("auth", () => {
  beforeEach(() => { delete process.env.AUTH_USERS; });

  it("createAuthCookie with no AUTH_USERS → allows any name", () => {
    expect(createAuthCookie("sarah", "")).not.toBeNull();
  });
  it("createAuthCookie returns base64 string", () => {
    const cookie = createAuthCookie("sarah", "pass");
    expect(cookie).toBe(Buffer.from("sarah:pass").toString("base64"));
  });
  it("createAuthCookie with AUTH_USERS and valid creds → cookie", () => {
    process.env.AUTH_USERS = "sarah:pass123";
    expect(createAuthCookie("sarah", "pass123")).not.toBeNull();
  });
  it("createAuthCookie with AUTH_USERS and wrong password → null", () => {
    process.env.AUTH_USERS = "sarah:pass123";
    expect(createAuthCookie("sarah", "wrong")).toBeNull();
  });
  it("getAuthUser with valid cookie → returns name", () => {
    const cookie = Buffer.from("sarah:pass").toString("base64");
    expect(getAuthUser(makeReq(cookie))).toBe("sarah");
  });
  it("getAuthUser with no cookie → null", () => {
    expect(getAuthUser(makeReq())).toBeNull();
  });
  it("getAuthUser with invalid base64 → null", () => {
    expect(getAuthUser(makeReq("not-base64!!!"))).toBeNull();
  });
  it("getAuthUser with AUTH_USERS and wrong user → null", () => {
    process.env.AUTH_USERS = "sarah:pass123";
    const cookie = Buffer.from("hacker:pass").toString("base64");
    expect(getAuthUser(makeReq(cookie))).toBeNull();
  });
});
