"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import type { BusinessConversation } from "@/hooks/queries/use-business-inbox-conversations";

interface ConversationItemProps {
  conversation: BusinessConversation;
  isSelected: boolean;
  currentUserId: string;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const { campaign, influencerProfile, lastMessage } = conversation;

  const influencerName = influencerProfile?.full_name || "Influencer";
  const initials = influencerName
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

  const statusLabel =
    campaign.status === "accepted" ? "active" : campaign.status;
  const statusClasses = cn(
    "text-[9px] px-1.5 py-0 h-4 rounded-full border shrink-0",
    campaign.status === "pending" &&
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    campaign.status === "accepted" &&
      "bg-green-500/10 text-green-400 border-green-500/20",
    campaign.status === "completed" &&
      "bg-primary/10 text-primary border-primary/20",
  );

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
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm truncate">{influencerName}</p>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {timeAgo(msgTime)}
          </span>
        </div>
        <p className="text-[13px] text-muted-foreground truncate mt-0.5">
          {campaign.title || "Untitled Campaign"}
        </p>
        <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
          {isOwn ? "You: " : ""}
          {msgPreview}
        </p>
      </div>

      <Badge variant="outline" className={statusClasses}>
        {statusLabel}
      </Badge>
    </button>
  );
}
