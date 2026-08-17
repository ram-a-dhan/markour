import { NextResponse } from "next/server";
import { GOOGLE_OAUTH_CONSENT_SCREEN_URL } from "@/src/constants/url";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return NextResponse.redirect(`${GOOGLE_OAUTH_CONSENT_SCREEN_URL}?${params}`);
}
