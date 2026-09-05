import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { tags as tagSchema, noteTags as noteTagSchema } from "@/src/db/schema";
import { requireAuth } from "@/src/lib/requireAuth";
import { HTTP_STATUS } from "@/src/constants/misc";

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
      { message: "Tag not found." },
      { status: HTTP_STATUS.NOT_FOUND },
    );
  }

  const [used] = await db
    .select()
    .from(noteTagSchema)
    .where(eq(noteTagSchema.tagId, id))
    .limit(1);

  if (used) {
    return NextResponse.json(
      { message: "Tag is still in use." },
      { status: HTTP_STATUS.CONFLICT },
    );
  }

  await db
    .delete(tagSchema)
    .where(eq(tagSchema.id, id));

  return NextResponse.json({
    data: { success: true },
  });
}
