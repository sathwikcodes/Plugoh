import "server-only";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type PasswordLoginResult =
  | { ok: true; response: NextResponse }
  | { ok: false; message: string };

/**
 * Password sign-in for route handlers. Uses `cookies()` from next/headers so
 * session cookies are attached to the redirect response (manual response.cookies
 * on a pre-built redirect often fails to persist in the browser).
 */
export async function signInWithPasswordAndRedirect(
  request: NextRequest,
  email: string,
  password: string,
  redirectPathname: string,
): Promise<PasswordLoginResult> {
  const supabase = await createClient();

  await supabase.auth.signOut();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, message: error.message };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      ok: false,
      message: "Could not establish session after sign in.",
    };
  }

  const url = request.nextUrl.clone();
  url.pathname = redirectPathname;
  url.search = "";

  return { ok: true, response: NextResponse.redirect(url, 303) };
}
