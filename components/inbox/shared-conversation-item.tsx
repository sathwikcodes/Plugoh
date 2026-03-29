"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SharedConversationItemProps {
  name: string;
  campaignTitle: string;
  preview: string;
  timeLabel: string;
  status: string;
  isSelected: boolean;
  isOwn: boolean;
  onClick: () => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
  accepted: {
    label: "Active",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
  completed: {
    label: "Done",
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/20",
  },
  rejected: {
    label: "Declined",
    color: "text-white/30",
    bg: "bg-white/[0.04] border-white/[0.08]",
  },
};

export function formatConversationTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const date = new Date(dateStr);
  const now = new Date();
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
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
  const statusMeta = statusConfig[status] || statusConfig.pending;

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
              statusMeta.bg,
              statusMeta.color,
            )}
          >
            {statusMeta.label}
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
