"use client";

import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SharedChatHeaderProps {
  participantName: string;
  campaignTitle: string;
  status: string;
  onBack: () => void;
}

const statusStyles: Record<string, { label: string; classes: string }> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  accepted: {
    label: "Active",
    classes: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  completed: {
    label: "Completed",
    classes: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  rejected: {
    label: "Declined",
    classes: "bg-white/[0.04] text-white/40 border-white/[0.08]",
  },
};

export function SharedChatHeader({
  participantName,
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
  const st = statusStyles[status] || statusStyles.pending;

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
