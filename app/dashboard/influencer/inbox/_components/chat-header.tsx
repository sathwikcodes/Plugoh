"use client";

import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  brandName: string;
  campaignTitle: string;
  status: string;
  onBack: () => void;
}

export function ChatHeader({
  brandName,
  campaignTitle,
  status,
  onBack,
}: ChatHeaderProps) {
  const initials = brandName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const statusLabel = status === "accepted" ? "active" : status;
  const statusClasses = cn(
    "text-[9px] px-1.5 py-0 h-4 rounded-full border",
    status === "pending" &&
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    status === "accepted" &&
      "bg-green-500/10 text-green-400 border-green-500/20",
    status === "completed" && "bg-primary/10 text-primary border-primary/20",
  );

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6 bg-card/80 backdrop-blur-sm shrink-0">
      <button
        type="button"
        onClick={onBack}
        className="md:hidden shrink-0 p-1 -ml-1 rounded-lg hover:bg-white/6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-linear-to-br from-pink-500/20 to-purple-500/20 text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate">{brandName}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {campaignTitle}
        </p>
      </div>

      <Badge variant="outline" className={statusClasses}>
        {statusLabel}
      </Badge>
    </div>
  );
}
