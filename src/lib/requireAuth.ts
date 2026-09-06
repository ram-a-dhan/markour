import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/src/lib/jwt";
import { HTTP_STATUS } from "@/src/constants/misc";

export function requireAuth(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { message: "Not authenticated." },
        { status: HTTP_STATUS.NOT_AUTHENTICATED },
      ),
    };
  }

  const payload = verifyJwt(token);

  if (!payload) {
    return {
      error: NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 401 },
      ),
    };
  }

  return { 
    userId: payload.userId,
    email: payload.email,
  };
}
