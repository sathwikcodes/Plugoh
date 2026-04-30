import { NextResponse } from "next/server";
import { getDashboardPath, type AppRole } from "@/lib/auth-routing";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function redirectTo(request: Request, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, "/login");
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data?.role) {
    return redirectTo(request, "/onboarding");
  }

  return redirectTo(request, getDashboardPath(data.role as AppRole));
}
