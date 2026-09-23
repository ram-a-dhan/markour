import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({
    data: { success: true },
  });

  res.cookies.delete("auth_token");

  return res;
}
