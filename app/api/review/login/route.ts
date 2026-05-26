import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runMetaReviewLoginPost } from "@/lib/server/meta-review-login-handler";

export async function POST(request: NextRequest) {
  return runMetaReviewLoginPost(request);
}

export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/review";
  url.search = "";
  return NextResponse.redirect(url, 303);
}
