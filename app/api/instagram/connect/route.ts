import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getInstagramAuthUrl } from "@/lib/instagram/api";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const csrf = randomBytes(16).toString("hex");
  const state = `${csrf}:${userId}`;
  const authUrl = getInstagramAuthUrl(state);

  const response = NextResponse.json({ url: authUrl });
  response.cookies.set("ig_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
