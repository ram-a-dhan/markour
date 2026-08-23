import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { notes as noteSchema } from "@/src/db/schema";
import { gt, asc, eq, and } from "drizzle-orm";
import { serializeNote } from "@/src/utils/serialize";
import { requireAuth } from "@/src/lib/requireAuth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const since = Number(req.nextUrl.searchParams.get("since") ?? 0);

  const rows = await db
    .select()
    .from(noteSchema)
    .where(
      and(
        eq(noteSchema.userId, auth.userId),
        gt(noteSchema.updatedAt, new Date(since)),
      ),
    )
    .orderBy(asc(noteSchema.updatedAt));

  return NextResponse.json({
    notes: rows.map(serializeNote),
    serverTime: Date.now(),
  });
}
