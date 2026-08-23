import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { notes as noteSchema } from "@/src/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { serializeNote } from "@/src/utils/serialize";
import { requireAuth } from "@/src/lib/requireAuth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const rows = await db
    .select()
    .from(noteSchema)
    .where(
      and(
        eq(noteSchema.userId, auth.userId),
        isNull(noteSchema.deletedAt),
      ),
    );

  return NextResponse.json({
    notes: rows.map(serializeNote),
    serverTime: Date.now(),
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
      { error: "id, createdAt, updatedAt are required" },
      { status: 400 },
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
      { error: "note already exists, use push to update" },
      { status: 409 },
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
    { note: serializeNote(created) },
    { status: 201 },
  );
}
