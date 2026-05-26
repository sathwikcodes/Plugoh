import "server-only";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getMetaReviewLoginSecrets,
  isMetaReviewLoginEnabled,
} from "@/lib/server/meta-review-login-env";
import { signInWithPasswordAndRedirect } from "@/lib/server/supabase-password-login";

export function metaReviewLoginErrorRedirect(
  request: NextRequest,
  message: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = "/review";
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

export async function runMetaReviewLoginPost(request: NextRequest) {
  if (!isMetaReviewLoginEnabled()) {
    return metaReviewLoginErrorRedirect(
      request,
      "Meta reviewer login is disabled on this deployment.",
    );
  }

  const { email, password } = getMetaReviewLoginSecrets();
  if (!email || !password) {
    return metaReviewLoginErrorRedirect(
      request,
      "Meta reviewer login is not configured (META_REVIEW_EMAIL and META_REVIEW_PASSWORD).",
    );
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim()
  ) {
    return metaReviewLoginErrorRedirect(
      request,
      "Supabase URL or anon key is missing.",
    );
  }

  const result = await signInWithPasswordAndRedirect(
    request,
    email,
    password,
    "/post-auth",
  );

  if (!result.ok) {
    return metaReviewLoginErrorRedirect(request, result.message);
  }

  return result.response;
}
