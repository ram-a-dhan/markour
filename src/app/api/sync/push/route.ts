import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { notes as noteSchema, noteTags as noteTagSchema, tags as tagSchema } from "@/src/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { serializeNote } from "@/src/utils/serialize";
import { requireAuth } from "@/src/lib/requireAuth";

interface INotePushPayload extends INoteFE {
  clientId?: string;
}

// LWW: incoming write only wins if its updatedAt (ms) is strictly newer
// than what's stored. Otherwise reject with 409 + the server's current row.
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const body = await req.json();
  const {
    id,
    title,
    content,
    updatedAt,
    deletedAt,
    tagIds,
    clientId
  } = body as INotePushPayload;

  if (!id || typeof updatedAt !== "number") {
    return NextResponse.json(
      { error: "id and updatedAt are required." },
      { status: 400 },
    );
  }

  const [current] = await db
    .select()
    .from(noteSchema)
    .where(
      and(
        eq(noteSchema.userId, auth.userId),
        eq(noteSchema.id, id),
      ),
    );

  if (!current) {
    return NextResponse.json(
      { error: "Note not found." },
      { status: 404 },
    );
  }

  if (updatedAt <= current.updatedAt.getTime()) {
    const [existingTags] = await db
      .select({ tagId: noteTagSchema.tagId })
      .from(noteTagSchema)
      .where(eq(noteTagSchema.noteId, id));

    return NextResponse.json(
      {
        accepted: false,
        reason: "conflict",
        serverNote: serializeNote(current, existingTags ? [existingTags.tagId] : []),
      },
      { status: 409 }
    );
  }

  const [updated] = await db
    .update(noteSchema)
    .set({
      title: title ?? current.title,
      content: content ?? current.content,
      updatedAt: new Date(updatedAt),
      deletedAt: deletedAt != null ? new Date(deletedAt) : current.deletedAt,
      version: current.version + 1,
    })
    .where(
      and(
        eq(noteSchema.userId, auth.userId),
        eq(noteSchema.id, id),
      ),
    )
    .returning();


  // Replace-the-whole-set: only touch tags if the client actually sent
  // a tagIds array — omitting the field entirely means "don't touch tags."
  if (tagIds !== undefined) {
    // Only allow tags that actually belong to this user — prevents
    // attaching someone else's tag ID even if guessed.
    const validTags = tagIds.length
      ? await db
          .select({ id: tagSchema.id })
          .from(tagSchema)
          .where(
            and(
              eq(tagSchema.userId, auth.userId),
              inArray(tagSchema.id, tagIds),
            ),
          )
      : [];

    const validTagIds = validTags.map((t) => t.id);

    await db
      .delete(noteTagSchema)
      .where(eq(noteTagSchema.noteId, id));

    if (validTagIds.length) {
      await db
        .insert(noteTagSchema)
        .values(validTagIds.map((tagId) => ({ noteId: id, tagId })));
    }
  }

  const finalTagLinks = await db
    .select()
    .from(noteTagSchema)
    .where(eq(noteTagSchema.noteId, id));

  return NextResponse.json({
    accepted: true,
    serverNote: serializeNote(updated, finalTagLinks.map((l) => l.tagId)),
    receivedAt: Date.now(),
    fromClient: clientId ?? null,
  });
}
