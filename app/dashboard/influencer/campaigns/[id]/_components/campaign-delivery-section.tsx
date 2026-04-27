"use client";

import { useRef, useState } from "react";
import { Loader2, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThreeDButton } from "@/components/ui/3d-button";
import { supabase } from "@/lib/supabase/client";
import type { Campaign } from "./campaign-types";

const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPT =
  "image/*,video/mp4,video/quicktime,video/webm,application/pdf,application/zip";

interface CampaignDeliverySectionProps {
  campaign: Campaign;
  onSubmitDelivery: (input: {
    campaignId: string;
    storagePath: string;
    notes?: string;
  }) => Promise<unknown>;
  isSubmittingDelivery: boolean;
}

export function CampaignDeliverySection({
  campaign,
  onSubmitDelivery,
  isSubmittingDelivery,
}: CampaignDeliverySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCancel = () => {
    setShowDeliveryForm(false);
    setFile(null);
    setFileError(null);
    setDeliveryNotes("");
    setUploadState("idle");
    setUploadError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    setFileError(null);
    if (!picked) return;
    if (picked.size > MAX_BYTES) {
      setFileError("File exceeds 50 MB limit.");
      e.target.value = "";
      return;
    }
    setFile(picked);
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploadState("uploading");
    setUploadError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("campaignId", campaign.id);

    const res = await fetch("/api/delivery/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setUploadState("error");
      setUploadError(
        (body as { error?: string }).error ??
          "Upload failed. Please try again.",
      );
      return;
    }

    const { storagePath } = (await res.json()) as { storagePath: string };
    setUploadState("idle");

    await onSubmitDelivery({
      campaignId: campaign.id,
      storagePath,
      notes: deliveryNotes.trim() || undefined,
    });
    handleCancel();
  };

  const isWorking = isSubmittingDelivery || uploadState === "uploading";

  const eligibleStatuses = ["in_escrow", "delivery_submitted"];
  if (!eligibleStatuses.includes(campaign.status ?? "")) return null;

  return (
    <div className="space-y-4">
      {campaign.status === "delivery_submitted" ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4">
          <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/35">
            Delivered content
          </p>
          <p className="text-sm text-emerald-400">
            Content submitted — awaiting brand review
          </p>
        </div>
      ) : null}

      {campaign.status === "in_escrow" ? (
        <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] px-4 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:px-5">
          <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/35">
            Submit delivery
          </p>
          <p className="mb-4 text-[12.5px] text-white/50 sm:text-[13px]">
            Upload your content directly — no external links needed. Max 50 MB.
          </p>
          {!showDeliveryForm ? (
            <Button
              className="h-10 rounded-full px-5 text-sm"
              onClick={() => setShowDeliveryForm(true)}
            >
              <Upload className="mr-2 h-3.5 w-3.5" />
              Upload file
            </Button>
          ) : (
            <form
              onSubmit={handleSubmitDelivery}
              className="space-y-4 rounded-[20px] border border-white/[0.08] bg-[rgba(22,18,25,0.70)] p-4 backdrop-blur-sm"
            >
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Content file <span className="text-amber-400">*</span>
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-dashed border-white/20 bg-white/5 text-sm text-white/60 transition-colors hover:border-white/40 hover:text-white/90"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {file ? file.name : "Choose file"}
                </button>
                {file ? (
                  <p className="text-[11px] text-white/40">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                ) : null}
                {fileError ? (
                  <p className="text-[11px] text-rose-400">{fileError}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="delivery-notes"
                  className="text-sm font-medium text-white/60"
                >
                  Notes to brand
                </Label>
                <Textarea
                  id="delivery-notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Anything the brand should know about the content…"
                  rows={3}
                  className="resize-none border-white/10 bg-white/5 text-sm"
                />
              </div>

              {uploadState === "error" && uploadError ? (
                <p className="text-[12px] text-rose-400">{uploadError}</p>
              ) : null}

              {uploadState === "uploading" ? (
                <p className="flex items-center gap-2 text-[12px] text-white/50">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </p>
              ) : null}

              <div className="flex gap-2">
                <ThreeDButton
                  type="button"
                  label="Cancel"
                  hideIcon
                  onClick={handleCancel}
                  disabled={isWorking}
                  className="flex-1 !h-9 !w-auto !min-w-0 text-xs [&_.icon]:hidden"
                  style={
                    {
                      "--button-gold": "#e11d48",
                      "--button-gold-light": "#fb7185",
                      "--button-gold-dark": "#9f1239",
                      "--button-mid": "#e11d48",
                      "--button-ink": "#fff",
                      "--button-glow": "rgba(251,113,133,0.38)",
                      "--button-edge": "#9f1239",
                      "--button-shadow-inner": "rgba(80,0,20,0.38)",
                    } as React.CSSProperties
                  }
                />
                <ThreeDButton
                  type="submit"
                  label={isWorking ? "Sending…" : "Submit"}
                  hideIcon
                  customIcon={
                    isWorking ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )
                  }
                  disabled={isWorking || !file}
                  className="flex-1 !h-9 !w-auto !min-w-0 text-xs [&_.icon]:hidden"
                  style={
                    {
                      "--button-gold": "#34d399",
                      "--button-gold-light": "#a7f3d0",
                      "--button-gold-dark": "#065f46",
                      "--button-mid": "#10b981",
                      "--button-ink": "#022c22",
                      "--button-glow": "rgba(52,211,153,0.38)",
                      "--button-edge": "#065f46",
                      "--button-shadow-inner": "rgba(0,60,30,0.35)",
                    } as React.CSSProperties
                  }
                />
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
