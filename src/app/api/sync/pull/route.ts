import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { notes as noteSchema, noteTags as noteTagSchema } from "@/src/db/schema";
import { gt, asc, eq, and, inArray } from "drizzle-orm";
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

  const allTagLinks = await db
    .select()
    .from(noteTagSchema)
    .where(inArray(noteTagSchema.noteId, rows.map((r) => r.id)));

  const tagsByNote = new Map<string, string[]>();
  for (const link of allTagLinks) {
    const list = tagsByNote.get(link.noteId) ?? [];
    list.push(link.tagId);
    tagsByNote.set(link.noteId, list);
  }

  return NextResponse.json({
    notes: rows.map((r) => serializeNote(r, tagsByNote.get(r.id) ?? [])),
    serverTime: Date.now(),
  });
}
