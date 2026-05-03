import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runDemoLoginPost } from "@/lib/server/demo-login-handler";

export async function POST(request: NextRequest) {
  return runDemoLoginPost(request);
}

export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/demo";
  url.search = "";
  return NextResponse.redirect(url);
}
