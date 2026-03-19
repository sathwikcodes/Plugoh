"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  useCampaignMessages,
  useSendMessage,
} from "@/hooks/queries/use-campaign-messages";
import { MessageBubble, SystemMessage } from "@/components/campaign/message-bubble";
import { MessageInput } from "@/components/campaign/message-input";
import { ChatHeader } from "./chat-header";
import { Loader2, MessageSquare } from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import type { Conversation } from "@/hooks/queries/use-inbox-conversations";

interface ChatPanelProps {
  conversation: Conversation;
  onBack: () => void;
}

export function ChatPanel({ conversation, onBack }: ChatPanelProps) {
  const { user, profile: myProfile } = useAuth();
  const trpc = useTRPC();
  const { campaign, businessProfile } = conversation;
  const { data: messages, isLoading } = useCampaignMessages(campaign.id);
  const sendMessage = useSendMessage();
  const insertFile = useMutation(trpc.campaignFile.insertCampaignFile.mutationOptions());
  const bottomRef = useRef<HTMLDivElement>(null);

  const brandName =
    businessProfile?.business_name ||
    businessProfile?.full_name ||
    "Business";
  const influencerName = myProfile?.full_name || "Influencer";
  const disabled = campaign.status === "completed";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSendMessage = (content: string) => {
    if (!user) return;
    sendMessage.mutate({
      campaignId: campaign.id,
      senderId: user.id,
      content,
    });
  };

  const handleSendFile = (file: File, url: string) => {
    if (!user) return;
    sendMessage.mutate({
      campaignId: campaign.id,
      senderId: user.id,
      content: file.name,
      messageType: "file",
      metadata: {
        url,
        filename: file.name,
        size: file.size,
        mime_type: file.type,
      },
    });

    insertFile.mutate({
      campaignId: campaign.id,
      fileName: file.name,
      fileUrl: url,
      fileSize: file.size,
      mimeType: file.type,
    });
  };

  const getSenderName = (senderId: string) => {
    if (senderId === campaign.business_id) return brandName;
    if (senderId === campaign.influencer_id) return influencerName;
    return "System";
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        brandName={brandName}
        campaignTitle={campaign.title || "Untitled Campaign"}
        status={campaign.status}
        onBack={onBack}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((msg) =>
              msg.message_type === "system" ? (
                <SystemMessage key={msg.id} content={msg.content} />
              ) : (
                <MessageBubble
                  key={msg.id}
                  content={msg.content}
                  messageType={msg.message_type}
                  metadata={msg.metadata}
                  isOwn={msg.sender_id === user.id}
                  senderName={getSenderName(msg.sender_id)}
                  timestamp={msg.created_at}
                />
              ),
            )}
            <div ref={bottomRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        campaignId={campaign.id}
        userId={user.id}
        disabled={disabled}
      />
    </div>
  );
}
