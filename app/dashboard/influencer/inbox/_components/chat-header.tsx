"use client";

import { SharedChatHeader } from "@/components/inbox/shared-chat-header";

interface ChatHeaderProps {
  brandName: string;
  avatarUrl?: string | null;
  campaignTitle: string;
  status: string;
  onBack: () => void;
}

export function ChatHeader({
  brandName,
  avatarUrl,
  campaignTitle,
  status,
  onBack,
}: ChatHeaderProps) {
  return (
    <SharedChatHeader
      participantName={brandName}
      avatarUrl={avatarUrl}
      campaignTitle={campaignTitle}
      status={status}
      onBack={onBack}
    />
  );
}
