import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getDashboardPath, type AppRole } from "@/lib/auth-routing";
import { getDemoLoginSecrets } from "@/lib/server/demo-login-env";
import type { Database } from "@/lib/supabase/types";

function demoErrorRedirect(request: NextRequest, message: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/demo";
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

function demoLandingRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/demo";
  url.search = "";
  return NextResponse.redirect(url);
}

export function GET(request: NextRequest) {
  return demoLandingRedirect(request);
}

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_ENABLED !== "true") {
    return demoErrorRedirect(request, "Demo is disabled on this deployment.");
  }

  const formData = await request.formData();
  const rawRole = formData.get("role");
  if (rawRole !== "business" && rawRole !== "influencer") {
    return demoErrorRedirect(request, "Invalid role.");
  }
  const role = rawRole as AppRole;

  const { password, email } = getDemoLoginSecrets(role);
  if (!email || !password) {
    return demoErrorRedirect(
      request,
      "Demo login is not configured (missing DEMO_ACCOUNT_PASSWORD and/or demo emails). Set them in the environment or .env.local, then restart dev.",
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!supabaseUrl?.trim() || !anonKey?.trim()) {
    return demoErrorRedirect(request, "Supabase URL or anon key is missing.");
  }

  const dashboardUrl = request.nextUrl.clone();
  dashboardUrl.pathname = getDashboardPath(role);
  dashboardUrl.search = "";

  const response = NextResponse.redirect(dashboardUrl);

  const supabase = createServerClient<Database>(
    supabaseUrl.trim(),
    anonKey.trim(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.signOut();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return demoErrorRedirect(request, error.message);
  }

  return response;
}
