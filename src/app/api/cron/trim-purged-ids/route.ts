import { NextRequest, NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import { db } from "@/src/db";
import { purgedNotes as purgedNoteSchema } from "@/src/db/schema";
import { HTTP_STATUS } from "@/src/constants/misc";

export async function GET(req: NextRequest) {
  // verify this is actually Vercel's cron calling it, not a public endpoint
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { message: "Cron access not authenticated." },
      { status: HTTP_STATUS.NOT_AUTHENTICATED },
    );
  }

  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await db
    .delete(purgedNoteSchema)
    .where(lt(purgedNoteSchema.purgedAt, oneMonthAgo));

  return NextResponse.json({
    data: { success: true },
  });
}
