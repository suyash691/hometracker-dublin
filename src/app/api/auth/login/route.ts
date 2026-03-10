import { createAuthCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, password } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const cookie = createAuthCookie(name, password || "");
  if (!cookie) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const res = NextResponse.json({ user: name });
  res.cookies.set("ht_user", cookie, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });
  return res;
}
