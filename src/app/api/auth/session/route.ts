import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users as userSchema } from "@/src/db/schema";
import { verifyJwt } from "@/src/lib/jwt";
import { serializeUser } from "@/src/utils/serialize";
import { HTTP_STATUS } from "@/src/constants/misc";

export async function GET(req:NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: HTTP_STATUS.NOT_AUTHENTICATED },
    );
  }

  const payload = verifyJwt(token);

  if (!payload) {
    return NextResponse.json(
      { message: "Token invalid or expired." },
      { status: HTTP_STATUS.NOT_AUTHENTICATED },
    );
  }

  const [user] = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.id, payload.userId));

  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: HTTP_STATUS.NOT_FOUND },
    );
  }

  return NextResponse.json({
    data: serializeUser(user),
  });
}
