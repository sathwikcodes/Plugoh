"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useMyBusinessProfile } from "@/hooks/queries/use-business-profiles";
import {
  useCampaignMessages,
  useSendMessage,
  useMarkNotificationsReadForCampaign,
} from "@/hooks/queries/use-campaign-messages";
import {
  MessageBubble,
  SystemMessage,
  BookingCardMessage,
} from "@/components/campaign/message-bubble";
import { MessageInput } from "@/components/campaign/message-input";
import { ChatHeader } from "./chat-header";
import { Loader2, MessageSquare } from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import type { BusinessConversation } from "@/hooks/queries/use-business-inbox-conversations";
import { getBusinessDisplayName } from "@/lib/business-profile";

interface ChatPanelProps {
  conversation: BusinessConversation;
  onBack: () => void;
}

export function ChatPanel({ conversation, onBack }: ChatPanelProps) {
  const { user } = useAuth();
  const { data: myIdentity } = useMyBusinessProfile(user?.id);
  const trpc = useTRPC();
  const { campaign, influencerProfile } = conversation;
  const { data: messages, isLoading } = useCampaignMessages(campaign.id);
  const sendMessage = useSendMessage();
  const markRead = useMarkNotificationsReadForCampaign();
  const insertFile = useMutation(
    trpc.campaignFile.insertCampaignFile.mutationOptions(),
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const influencerName = influencerProfile?.full_name || "Influencer";
  const brandName = getBusinessDisplayName(myIdentity ?? null);
  const disabled = campaign.status === "completed";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  // Mark new_message notifications as read when this conversation is opened
  useEffect(() => {
    if (!user?.id || !campaign.id) return;
    markRead.mutate({ campaignId: campaign.id, userId: user.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign.id, user?.id]);

  const handleSendMessage = (content: string) => {
    if (!user) return;
    sendMessage.mutate({
      campaignId: campaign.id,
      senderId: user.id,
      recipientId: campaign.influencer_id,
      content,
    });
  };

  const handleSendFile = (file: File, url: string) => {
    if (!user) return;
    sendMessage.mutate({
      campaignId: campaign.id,
      senderId: user.id,
      recipientId: campaign.influencer_id,
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
        influencerName={influencerName}
        campaignTitle={campaign.title || "Untitled Campaign"}
        status={campaign.status}
        onBack={onBack}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((msg) =>
              msg.message_type === "booking_card" ? (
                <BookingCardMessage
                  key={msg.id}
                  metadata={msg.metadata}
                  campaignStatus={campaign.status}
                  isInfluencer={false}
                />
              ) : msg.message_type === "system" ? (
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
            <MessageSquare className="h-7 w-7 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground/50">
              No messages yet
            </p>
            <p className="text-xs text-muted-foreground/30 mt-1">
              Start the conversation!
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
