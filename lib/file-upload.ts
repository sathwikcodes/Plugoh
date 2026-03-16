import { supabase } from "@/lib/supabase/client";

const BUCKET_NAME = "campaign-files";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function uploadCampaignFile(
  file: File,
  campaignId: string,
  userId: string,
): Promise<{ url: string; path: string }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 50MB limit");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("File type not supported");
  }

  const ext = file.name.split(".").pop() || "bin";
  const path = `${campaignId}/${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return { url: publicUrl, path };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
