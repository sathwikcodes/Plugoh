"use client";

import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  CAMPAIGN_STATUS_CONFIG,
  type CampaignStatus,
} from "@/lib/constants";

interface SharedChatHeaderProps {
  participantName: string;
  avatarUrl?: string | null;
  campaignTitle: string;
  status: string;
  onBack: () => void;
}

export function SharedChatHeader({
  participantName,
  avatarUrl,
  campaignTitle,
  status,
  onBack,
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
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05] bg-background/60 backdrop-blur-xl shrink-0">
      <button
        type="button"
        onClick={onBack}
        className="md:hidden shrink-0 p-1.5 -ml-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
      >
        <ArrowLeft className="h-5 w-5 text-foreground/70" />
      </button>

      <Avatar className="h-9 w-9 shrink-0 ring-1 ring-white/[0.06]">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={participantName} /> : null}
        <AvatarFallback className="bg-gradient-to-br from-pink-500/15 to-purple-500/15 text-xs font-semibold text-foreground/80">
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

      <span
        className={cn(
          "text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0",
          st.classes,
        )}
      >
        {st.label}
      </span>
    </div>
  );
}
