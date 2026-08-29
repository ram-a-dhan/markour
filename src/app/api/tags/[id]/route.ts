import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { tags as tagSchema, noteTags as noteTagSchema } from "@/src/db/schema";
import { requireAuth } from "@/src/lib/requireAuth";

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/tags/[id]">,
) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { id } = await ctx.params;

  const [found] = await db
    .select()
    .from(tagSchema)
    .where(
      and(
        eq(tagSchema.id, id),
        eq(tagSchema.userId, auth.userId),
      ),
    );

  if (!found) {
    return NextResponse.json(
      { error: "Tag not found." },
      { status: 404 },
    );
  }

  const [used] = await db
    .select()
    .from(noteTagSchema)
    .where(eq(noteTagSchema.tagId, id))
    .limit(1);

  if (used) {
    return NextResponse.json(
      { error: "Tag is still in use." },
      { status: 409 },
    );
  }

  await db
    .delete(tagSchema)
    .where(eq(tagSchema.id, id));

  return NextResponse.json({ success: true });
}
