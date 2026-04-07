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
        "relative flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left backdrop-blur-md transition-all duration-200",
        "border-white/10 bg-[linear-gradient(145deg,rgba(9,12,18,0.92),rgba(14,18,25,0.84))]",
        "hover:border-white/20 hover:bg-[linear-gradient(145deg,rgba(14,18,25,0.94),rgba(18,23,33,0.88))]",
        "active:scale-[0.995]",
        isSelected &&
          "border-white/28 bg-[linear-gradient(145deg,rgba(20,26,38,0.96),rgba(24,31,45,0.9))] shadow-[0_10px_26px_rgba(2,8,20,0.42)]",
      )}
    >
      {isSelected && (
        <div className="absolute left-1.5 top-1/2 h-8 w-0.75 -translate-y-1/2 rounded-full bg-linear-to-b from-primary to-primary/60" />
      )}

      <Avatar className="h-10 w-10 shrink-0 ring-1 ring-white/12">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback className="bg-linear-to-br from-primary/15 to-primary/5 text-xs font-semibold text-foreground/80">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <p className="shrink-0 text-[13px] font-semibold text-white/95">
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
          <span className="ml-auto shrink-0 text-[11px] tabular-nums text-white/60">
            {timeLabel}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs leading-tight text-white/72">
          {campaignTitle}
        </p>
        <p className="mt-0.5 truncate text-xs leading-tight text-white/62">
          {isOwn ? "You: " : ""}
          {preview}
        </p>
      </div>
    </button>
  );
}
