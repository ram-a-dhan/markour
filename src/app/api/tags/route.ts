import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { tags as tagSchema } from "@/src/db/schema";
import { requireAuth } from "@/src/lib/requireAuth";
import { serializeTag } from "@/src/utils/serialize";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const tags = await db
    .select()
    .from(tagSchema)
    .where(eq(tagSchema.userId, auth.userId));

  return NextResponse.json({ tags: tags.map(serializeTag) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const { name } = (await req.json()) as { name: string };

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Tag name is required." },
      { status: 400 },
    );
  }

  try {
    const [created] = await db
      .insert(tagSchema)
      .values({
        userId: auth.userId,
        name: name.trim(),
      })
      .returning();

    return NextResponse.json(
      { tag: serializeTag(created) },
      { status: 201 },
    );
  } catch {
    // unique constraint violation — same name already exists for this user
    return NextResponse.json(
      { error: "Tag with this name already exists." },
      { status: 409 },
    );
  }
}
