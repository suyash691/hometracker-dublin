import { NextRequest, NextResponse } from "next/server";

const USERS: Record<string, string> = {};

// Load users from env: AUTH_USERS="name1:pass1,name2:pass2"
function getUsers(): Record<string, string> {
  if (Object.keys(USERS).length > 0) return USERS;
  const raw = process.env.AUTH_USERS || "";
  if (!raw) return USERS;
  for (const pair of raw.split(",")) {
    const [name, pass] = pair.split(":");
    if (name && pass) USERS[name.trim()] = pass.trim();
  }
  return USERS;
}

export function getAuthUser(req: NextRequest): string | null {
  const cookie = req.cookies.get("ht_user")?.value;
  if (!cookie) return null;
  try {
    const decoded = Buffer.from(cookie, "base64").toString();
    const [name] = decoded.split(":");
    const users = getUsers();
    // If no users configured, auth is disabled — treat cookie name as user
    if (Object.keys(users).length === 0) return name || "anonymous";
    return users[name] ? name : null;
  } catch {
    return null;
  }
}

export function createAuthCookie(name: string, password: string): string | null {
  const users = getUsers();
  // If no users configured, allow any name
  if (Object.keys(users).length === 0 || users[name] === password) {
    return Buffer.from(`${name}:${password}`).toString("base64");
  }
  return null;
}

export function requireAuth(req: NextRequest): NextResponse | null {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
