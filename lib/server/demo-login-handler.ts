import "server-only";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDashboardPath, type AppRole } from "@/lib/auth-routing";
import { getDemoLoginSecrets } from "@/lib/server/demo-login-env";
import { signInWithPasswordAndRedirect } from "@/lib/server/supabase-password-login";

export function demoLoginErrorRedirect(request: NextRequest, message: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/demo";
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

export async function runDemoLoginPost(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_ENABLED !== "true") {
    return demoLoginErrorRedirect(
      request,
      "Demo is disabled on this deployment.",
    );
  }

  const formData = await request.formData();
  const rawRole = formData.get("role");
  if (rawRole !== "business" && rawRole !== "influencer") {
    return demoLoginErrorRedirect(request, "Invalid role.");
  }
  const role = rawRole as AppRole;

  const { password, email } = getDemoLoginSecrets(role);
  if (!email || !password) {
    return demoLoginErrorRedirect(
      request,
      "Demo login is not configured (missing DEMO_ACCOUNT_PASSWORD and/or demo emails). Set them in the environment or .env.local, then restart dev.",
    );
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim()
  ) {
    return demoLoginErrorRedirect(
      request,
      "Supabase URL or anon key is missing.",
    );
  }

  const result = await signInWithPasswordAndRedirect(
    request,
    email,
    password,
    getDashboardPath(role),
  );

  if (!result.ok) {
    return demoLoginErrorRedirect(request, result.message);
  }

  return result.response;
}
