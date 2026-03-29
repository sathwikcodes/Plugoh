"use client";

import { SharedChatHeader } from "@/components/inbox/shared-chat-header";

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
  return (
    <SharedChatHeader
      participantName={brandName}
      campaignTitle={campaignTitle}
      status={status}
      onBack={onBack}
    />
  );
}
