import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { notes as noteSchema } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
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
    return NextResponse.json(
      { accepted: false, reason: "conflict", serverNote: serializeNote(current) },
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

  return NextResponse.json({
    accepted: true,
    serverNote: serializeNote(updated),
    receivedAt: Date.now(),
    fromClient: clientId ?? null,
  });
}
