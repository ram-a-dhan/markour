import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/src/lib/jwt";

export function requireAuth(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  const payload = verifyJwt(token);

  if (!payload) {
    return { error: NextResponse.json({ error: "invalid or expired token" }, { status: 401 }) };
  }

  return { userId: payload.userId, email: payload.email };
}
