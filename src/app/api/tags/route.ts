import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { tags as tagSchema } from "@/src/db/schema";
import { requireAuth } from "@/src/lib/requireAuth";
import { serializeTag } from "@/src/utils/serialize";
import { HTTP_STATUS } from "@/src/constants/misc";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const tags = await db
    .select()
    .from(tagSchema)
    .where(eq(tagSchema.userId, auth.userId));

  return NextResponse.json({
    data: tags.map(serializeTag),
  });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const { name } = (await req.json()) as { name: string };

  if (!name?.trim()) {
    return NextResponse.json(
      { message: "Tag name is required." },
      { status: HTTP_STATUS.BAD_REQUEST },
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
      { data: serializeTag(created) },
      { status: HTTP_STATUS.CREATED },
    );
  } catch {
    // unique constraint violation — same name already exists for this user
    return NextResponse.json(
      { message: "Tag with this name already exists." },
      { status: HTTP_STATUS.CONFLICT },
    );
  }
}
