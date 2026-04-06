"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";
export { formatConversationTime } from "@/lib/format";

interface SharedConversationItemProps {
  name: string;
  avatarUrl?: string | null;
  campaignTitle: string;
  preview: string;
  timeLabel: string;
  status: string;
  isSelected: boolean;
  isOwn: boolean;
  onClick: () => void;
}

export function buildConversationPreview(
  content: string | null,
  messageType: string,
) {
  if (messageType === "file") return "Sent a file";
  const text = content || "";
  return text.slice(0, 50) + (text.length > 50 ? "..." : "");
}

export function SharedConversationItem({
  name,
  avatarUrl,
  campaignTitle,
  preview,
  timeLabel,
  status,
  isSelected,
  isOwn,
  onClick,
}: SharedConversationItemProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const cfg =
    CAMPAIGN_STATUS_CONFIG[status as CampaignStatus] ??
    CAMPAIGN_STATUS_CONFIG.requested;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150",
        "hover:bg-white/[0.03] active:bg-white/[0.06]",
        isSelected && "bg-white/[0.05]",
      )}
    >
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-full bg-gradient-to-b from-pink-500 to-purple-500" />
      )}

      <Avatar className="h-10 w-10 shrink-0 ring-1 ring-white/[0.06]">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback className="bg-gradient-to-br from-pink-500/15 to-purple-500/15 text-xs font-semibold text-foreground/80">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-semibold text-[13px] shrink-0 text-foreground/90">
            {name}
          </p>
          <span
            className={cn(
              "text-[9px] font-medium px-1.5 py-px rounded-full border shrink-0",
              cfg.badge,
            )}
          >
            {cfg.shortLabel}
          </span>
          <span className="text-[11px] text-muted-foreground/40 shrink-0 ml-auto tabular-nums">
            {timeLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground/50 truncate mt-0.5 leading-tight">
          {campaignTitle}
        </p>
        <p className="text-xs text-muted-foreground/35 truncate mt-0.5 leading-tight">
          {isOwn ? "You: " : ""}
          {preview}
        </p>
      </div>
    </button>
  );
}
