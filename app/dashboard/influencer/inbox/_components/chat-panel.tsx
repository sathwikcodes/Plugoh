"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
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
import { Loader2, Lock, MessageSquare } from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Conversation } from "@/hooks/queries/use-inbox-conversations";
import { getBusinessDisplayName } from "@/lib/business-profile";

interface ChatPanelProps {
  conversation: Conversation;
  onBack: () => void;
}

export function ChatPanel({ conversation, onBack }: ChatPanelProps) {
  const { user, profile: myProfile } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { campaign, businessProfile } = conversation;
  const { data: messages, isLoading } = useCampaignMessages(campaign.id);
  const sendMessage = useSendMessage();
  const markRead = useMarkNotificationsReadForCampaign();
  const insertFile = useMutation(
    trpc.campaignFile.insertCampaignFile.mutationOptions(),
  );
  const statusMutation = useMutation(
    trpc.campaign.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
        queryClient.invalidateQueries({
          queryKey: ["business-inbox-conversations"],
        });
        toast({ title: "Campaign updated" });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const brandName = getBusinessDisplayName(businessProfile);
  const influencerName = myProfile?.full_name || "Influencer";
  const chatLocked = ![
    "in_escrow",
    "delivery_submitted",
    "completed",
    "disputed",
  ].includes(campaign.status);
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
      recipientId: campaign.business_id,
      content,
    });
  };

  const handleSendFile = (file: File, url: string) => {
    if (!user) return;
    sendMessage.mutate({
      campaignId: campaign.id,
      senderId: user.id,
      recipientId: campaign.business_id,
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

  const getSenderName = useCallback(
    (senderId: string) => {
      if (senderId === campaign.business_id) return brandName;
      if (senderId === campaign.influencer_id) return influencerName;
      return "System";
    },
    [campaign.business_id, campaign.influencer_id, brandName, influencerName],
  );

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
                  isInfluencer={true}
                  onAccept={() =>
                    statusMutation.mutate({
                      campaignId: campaign.id,
                      status: "accepted",
                    })
                  }
                  onDecline={() =>
                    statusMutation.mutate({
                      campaignId: campaign.id,
                      status: "rejected",
                    })
                  }
                  isMutating={statusMutation.isPending}
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

      {/* Message input / locked banner */}
      {chatLocked ? (
        <div className="shrink-0 border-t border-white/8 px-4 py-3">
          <div className="flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2.5">
            <Lock className="h-4 w-4 shrink-0 text-white/30" />
            <p className="text-sm text-white/40">
              Chat unlocks once you accept this booking
            </p>
          </div>
        </div>
      ) : (
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          campaignId={campaign.id}
          userId={user.id}
          disabled={disabled}
        />
      )}
    </div>
  );
}
