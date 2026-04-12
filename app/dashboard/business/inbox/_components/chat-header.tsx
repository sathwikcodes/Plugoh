"use client";

import Image from "next/image";
import { SharedChatHeader } from "@/components/inbox/shared-chat-header";

interface ChatHeaderProps {
  influencerName: string;
  avatarUrl?: string | null;
  campaignTitle: string;
  status: string;
  onBack: () => void;
  onRequestCall?: () => void;
  requestingCall?: boolean;
  callDisabled?: boolean;
  callDisabledReason?: string | null;
}

export function ChatHeader({
  influencerName,
  avatarUrl,
  campaignTitle,
  status,
  onBack,
  onRequestCall,
  requestingCall,
  callDisabled,
  callDisabledReason,
}: ChatHeaderProps) {
  return (
    <SharedChatHeader
      participantName={influencerName}
      avatarUrl={avatarUrl}
      campaignTitle={campaignTitle}
      status={status}
      onBack={onBack}
      actions={
        onRequestCall ? (
          <button
            type="button"
            onClick={onRequestCall}
            disabled={requestingCall || callDisabled}
            title={callDisabledReason || "Request call"}
            aria-label="Request call"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Image
              src="/call.png"
              alt="Call"
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
            />
          </button>
        ) : null
      }
    />
  );
}
