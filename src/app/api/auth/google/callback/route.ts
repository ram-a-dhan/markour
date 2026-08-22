import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users as userSchema } from "@/src/db/schema";
import { signJwt } from "@/src/lib/jwt";
import {
  GOOGLE_OAUTH_TOKEN_API_URL,
  GOOGLE_OAUTH_USERINFO_API_URL,
  HOME_PATH, NOTE_LIST_PATH,
} from "@/src/constants/url";

interface ITokenData {
  access_token: string;
  id_token: string;
  error?: string;
}

interface IUserData {
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

export async function GET(req:NextRequest) {
  // get code from google sign-in redirect
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url));
  }

  // exchange code for token
  const tokenRes = await fetch(GOOGLE_OAUTH_TOKEN_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = (await tokenRes?.json()) as ITokenData;

  if (!tokenRes?.ok || tokenData.error) {
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", req.url));
  }

  // fetch user profile
  const userRes = await fetch(GOOGLE_OAUTH_USERINFO_API_URL, {
    headers: { "Authorization": `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/?error=no_email", req.url));
  }

  const userData = (await userRes.json()) as IUserData;

  if (!userData.email || !userData.email_verified) {
    return NextResponse.redirect(new URL("/?error=email_not_verified", req.url));
  }

  // upsert user
  const [user] = await db
    .insert(userSchema)
    .values({
      name: userData.name,
      email: userData.email,
      picture: userData.picture,
    })
    .onConflictDoUpdate({
      target: userSchema.email,
      set: {
        name: userData.name,
        picture: userData.picture,
      },
    })
    .returning();

  // set token
  const token = signJwt({ userId: user.id, email: user.email });

  // set cookie
  const res = NextResponse.redirect(new URL(NOTE_LIST_PATH, req.url));

  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: HOME_PATH,
  });

  // redirect to home
  return res;
}
