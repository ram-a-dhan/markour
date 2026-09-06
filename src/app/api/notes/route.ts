import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { notes as noteSchema, noteTags as noteTagSchema } from "@/src/db/schema";
import { eq, inArray } from "drizzle-orm";
import { serializeNote } from "@/src/utils/serialize";
import { requireAuth } from "@/src/lib/requireAuth";
import { HTTP_STATUS } from "@/src/constants/misc";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const rows = await db
    .select()
    .from(noteSchema)
    .where(eq(noteSchema.userId, auth.userId));

  const allTagLinks = rows.length
    ? await db
        .select()
        .from(noteTagSchema)
        .where(inArray(noteTagSchema.noteId, rows.map((r) => r.id)))
    : [];

  const tagsByNote = new Map<string, string[]>();
  for (const link of allTagLinks) {
    const list = tagsByNote.get(link.noteId) ?? [];
    list.push(link.tagId);
    tagsByNote.set(link.noteId, list);
  }

  return NextResponse.json({
    data: rows.map((r) => serializeNote(r, tagsByNote.get(r.id) ?? [])),
    meta: {
      serverTime: Date.now(),
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const body = await req.json();
  const {
    id,
    title,
    content,
    createdAt,
    updatedAt
  } = body as INoteFE;

  if (!id || typeof createdAt !== "number" || typeof updatedAt !== "number") {
    return NextResponse.json(
      { message: "id, createdAt, updatedAt are required." },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  // Client generated the ID (offline-capable). If it somehow already
  // exists, don't silently overwrite — that'd bypass LWW entirely.
  const [existing] = await db
    .select()
    .from(noteSchema)
    .where(eq(noteSchema.id, id));

  if (existing) {
    return NextResponse.json(
      { message: "Note already exists, use push to update." },
      { status: HTTP_STATUS.CONFLICT },
    );
  }

  const [created] = await db
    .insert(noteSchema)
    .values({
      id,
      userId: auth.userId,
      title: title ?? "",
      content: content ?? "",
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })
    .returning();

  return NextResponse.json(
    { data: serializeNote(created) },
    { status: HTTP_STATUS.CREATED },
  );
}
