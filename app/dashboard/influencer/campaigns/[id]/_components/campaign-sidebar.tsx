"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Phone, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThreeDButton } from "@/components/ui/3d-button";
import { supabase } from "@/lib/supabase/client";
import type { Campaign } from "./campaign-types";

interface CampaignSidebarProps {
  campaign: Campaign;
  showContactInfo: boolean;
  onSubmitDelivery: (input: {
    campaignId: string;
    storagePath: string;
    notes?: string;
  }) => Promise<unknown>;
  isSubmittingDelivery: boolean;
}

const OFFER_STATUSES = new Set(["pre_authorized", "requested", "pending"]);
const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPT = "image/*,video/mp4,video/quicktime,video/webm,application/pdf,application/zip";

// ── Inline delivery form ──────────────────────────────────────────────────────

function DeliveryWidget({
  campaign,
  onSubmitDelivery,
  isSubmittingDelivery,
}: {
  campaign: Campaign;
  onSubmitDelivery: (input: {
    campaignId: string;
    storagePath: string;
    notes?: string;
  }) => Promise<unknown>;
  isSubmittingDelivery: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCancel = () => {
    setShowForm(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploadState("uploading");
    setUploadError(null);

    const { data: { session } } = await supabase.auth.getSession();
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
      setUploadError((body as { error?: string }).error ?? "Upload failed. Please try again.");
      return;
    }

    const { storagePath } = await res.json() as { storagePath: string };
    setUploadState("idle");

    await onSubmitDelivery({
      campaignId: campaign.id,
      storagePath,
      notes: deliveryNotes.trim() || undefined,
    });
    handleCancel();
  };

  const isWorking = isSubmittingDelivery || uploadState === "uploading";

  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
      <p className="mb-4 text-[12px] text-white/45 leading-[1.6]">
        Upload your content directly — no external links needed. Max 50 MB.
      </p>

      {!showForm ? (
        <ThreeDButton
          label="Upload file"
          hoverLabel="Upload file"
          hideIcon
          className="!w-full !min-w-0 !h-11 three-d-button--emerald three-d-button--no-glow"
          onClick={() => setShowForm(true)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-3.5 rounded-[18px] border border-white/[0.08] bg-[rgba(22,18,25,0.70)] p-3.5 backdrop-blur-sm overflow-hidden">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-white/70">
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
              className="flex h-9 w-full items-center justify-center gap-2 rounded-full border border-dashed border-white/20 bg-white/5 text-sm text-white/60 transition-colors hover:border-white/40 hover:text-white/90"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="truncate max-w-[140px]">{file ? file.name : "Choose file"}</span>
            </button>
            {file ? (
              <p className="text-[10px] text-white/35">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            ) : null}
            {fileError ? (
              <p className="text-[10px] text-rose-400">{fileError}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-white/50">
              Notes to brand
            </Label>
            <Textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Anything the brand should know…"
              rows={2}
              className="resize-none border-white/10 bg-white/5 text-sm"
            />
          </div>

          {uploadState === "error" && uploadError ? (
            <p className="text-[10px] text-rose-400">{uploadError}</p>
          ) : null}

          {uploadState === "uploading" ? (
            <p className="flex items-center gap-1.5 text-[10px] text-white/45">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading…
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isWorking}
              className="flex h-10 w-full items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/15 text-sm font-semibold text-rose-300 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isWorking || !file}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-emerald-400 text-sm font-semibold text-black shadow-[0_4px_14px_rgba(52,211,153,0.30)] transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {isWorking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function CampaignSidebar({
  campaign,
  showContactInfo,
  onSubmitDelivery,
  isSubmittingDelivery,
}: CampaignSidebarProps) {
  const isOffer = OFFER_STATUSES.has(campaign.status);
  const showDelivery = campaign.status === "in_escrow";
  const hasSubmitted = campaign.status === "delivery_submitted";

  return (
    <div className="space-y-3">
      {/* Delivered content status */}
      {hasSubmitted && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3.5">
          <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/35">
            Delivered content
          </p>
          <p className="text-sm text-emerald-400">
            Content submitted — awaiting brand review
          </p>
        </div>
      )}

      {/* Submit delivery widget */}
      {showDelivery && (
        <DeliveryWidget
          campaign={campaign}
          onSubmitDelivery={onSubmitDelivery}
          isSubmittingDelivery={isSubmittingDelivery}
        />
      )}

      {/* Brand contact */}
      {showContactInfo &&
      (campaign.business_contact_email || campaign.business_contact_phone) ? (
        <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
          <div className="space-y-2.5">
            {campaign.business_contact_email ? (
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/35" />
                <p className="break-all text-[13px] text-white/75">
                  {campaign.business_contact_email}
                </p>
              </div>
            ) : null}
            {campaign.business_contact_phone ? (
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-white/35" />
                <p className="text-[13px] text-white/75">
                  {campaign.business_contact_phone}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Chat button */}
      <ThreeDButton
        asChild
        label="Open in inbox"
        className="!h-11 !w-full !min-w-0 text-[13px]"
      >
        <Link href={`/dashboard/influencer/inbox?chat=${campaign.id}`} />
      </ThreeDButton>
    </div>
  );
}
