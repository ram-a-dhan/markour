import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users as userSchema } from "@/src/db/schema";
import { verifyJwt } from "@/src/lib/jwt";
import { serializeUser } from "@/src/utils/serialize";

export async function GET(req:NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const payload = verifyJwt(token);

  if (!payload) {
    return NextResponse.json({ error: "Token invalid or expired." }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.id, payload.userId));

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json(serializeUser(user));
}
