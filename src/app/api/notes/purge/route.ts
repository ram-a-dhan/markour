import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { notes as noteSchema } from "@/src/db/schema";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { requireAuth } from "@/src/lib/requireAuth";
import { HTTP_STATUS } from "@/src/constants/misc";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const { ids } = (await req.json()) as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { message: "Array of ids is required." },
      { status: HTTP_STATUS.BAD_REQUEST });
  }

  // Scoped by userId AND requires deletedAt already set — this endpoint
  // can only hard-delete notes that are already tombstoned. Prevents an
  // accidental/malicious call from wiping active notes outright.
  const deleted = await db
    .delete(noteSchema)
    .where(
      and(
        eq(noteSchema.userId, auth.userId),
        inArray(noteSchema.id, ids),
        isNotNull(noteSchema.deletedAt)
      )
    )
    .returning({ id: noteSchema.id });

  return NextResponse.json({
    data: deleted.map((r) => r.id),
  });
}
