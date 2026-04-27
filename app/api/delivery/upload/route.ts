import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { authenticateUser, createServiceClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
]);

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await authenticateUser(authHeader.slice(7));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const campaignId = formData.get("campaignId");

  if (
    !(file instanceof File) ||
    typeof campaignId !== "string" ||
    !campaignId
  ) {
    return NextResponse.json(
      { error: "Missing file or campaignId" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File exceeds 50 MB limit" },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Upload images, videos, PDFs, or ZIPs." },
      { status: 400 },
    );
  }

  const db = createServiceClient();

  const { data: campaign } = await db
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("influencer_id", user.id)
    .eq("status", "in_escrow")
    .maybeSingle();

  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign not found or not eligible for delivery" },
      { status: 403 },
    );
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${campaignId}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await db.storage
    .from("campaign-deliveries")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  return NextResponse.json({ storagePath });
}
