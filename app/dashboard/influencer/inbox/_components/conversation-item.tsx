"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/hooks/queries/use-inbox-conversations";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string;
  onClick: () => void;
}

const statusDot: Record<string, string> = {
  pending: "bg-amber-400",
  accepted: "bg-green-400",
  completed: "bg-violet-400",
  rejected: "bg-white/20",
};

function shortTime(dateStr: string): string {
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
  if (date.getFullYear() === now.getFullYear())
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

export function ConversationItem({
  conversation,
  isSelected,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const { campaign, businessProfile, lastMessage } = conversation;

  const brandName =
    businessProfile?.business_name || businessProfile?.full_name || "Brand";
  const initials = brandName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const msgPreview = lastMessage
    ? lastMessage.message_type === "file"
      ? "Sent a file"
      : (lastMessage.content || "").slice(0, 50) +
        ((lastMessage.content?.length || 0) > 50 ? "..." : "")
    : "No messages yet";

  const msgTime = lastMessage?.created_at || campaign.created_at;
  const isOwn = lastMessage?.sender_id === currentUserId;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full text-left px-4 py-3 transition-all duration-150",
        "hover:bg-white/4 active:bg-white/8",
        isSelected && "bg-white/6 border-l-2 border-l-pink-500",
        !isSelected && "border-l-2 border-l-transparent",
      )}
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarFallback className="bg-linear-to-br from-pink-500/20 to-purple-500/20 text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        {/* Row 1: Name · dot · Campaign title */}
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="font-semibold text-sm shrink-0">{brandName}</p>
          <span
            className={cn(
              "h-2 w-2 rounded-full shrink-0",
              statusDot[campaign.status] || "bg-white/20",
            )}
          />
          <p className="text-[13px] text-muted-foreground truncate">
            {campaign.title || "Untitled Campaign"}
          </p>
        </div>
        {/* Row 2: Message preview · timestamp */}
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground/60 truncate flex-1">
            {isOwn ? "You: " : ""}
            {msgPreview}
          </p>
          <span className="text-[11px] text-muted-foreground/50 shrink-0">
            {shortTime(msgTime)}
          </span>
        </div>
      </div>
    </button>
  );
}
