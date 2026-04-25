"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";
import { ThreeDPill, type PillPreset } from "@/components/ui/3d-pill";

function getStatusPillColor(status: string): PillPreset {
  if (["completed", "accepted"].includes(status)) return "emerald";
  if (["disputed", "declined", "rejected", "expired", "cancelled", "refunded"].includes(status)) return "rose";
  if (["in_escrow", "delivery_submitted"].includes(status)) return "sky";
  return "gold";
}

interface SharedChatHeaderProps {
  participantName: string;
  avatarUrl?: string | null;
  campaignTitle: string;
  status: string;
  onBack: () => void;
  actions?: ReactNode;
}

export function SharedChatHeader({
  participantName,
  avatarUrl,
  campaignTitle,
  status,
  onBack,
  actions,
}: SharedChatHeaderProps) {
  const initials = participantName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const cfg =
    CAMPAIGN_STATUS_CONFIG[status as CampaignStatus] ??
    CAMPAIGN_STATUS_CONFIG.requested;
  const st = { label: cfg.shortLabel, classes: cfg.badge };

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-background/60 backdrop-blur-xl shrink-0">
      <button
        type="button"
        onClick={onBack}
        className="md:hidden shrink-0 p-1.5 -ml-1.5 rounded-xl hover:bg-white/6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 text-foreground/70" />
      </button>

      <Avatar className="h-9 w-9 shrink-0 ring-1 ring-white/6">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={participantName} />
        ) : null}
        <AvatarFallback className="bg-linear-to-br from-primary/15 to-primary/5 text-xs font-semibold text-foreground/80">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[15px] truncate leading-tight text-foreground/90">
          {participantName}
        </p>
        <p className="text-xs text-muted-foreground/50 truncate mt-0.5 leading-tight">
          {campaignTitle}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <ThreeDPill
          label={st.label}
          color={getStatusPillColor(status)}
          className="!h-[22px] !px-2.5 !text-[10px] !font-semibold shrink-0"
        />
      </div>
    </div>
  );
}
