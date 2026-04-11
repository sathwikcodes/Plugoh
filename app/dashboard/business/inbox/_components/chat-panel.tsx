"use client";

import { useCallback, useEffect, useRef } from "react";
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
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Loader2,
  Lock,
  MessageSquare,
} from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import type { BusinessConversation } from "@/hooks/queries/use-business-inbox-conversations";
import { getBusinessDisplayName } from "@/lib/business-profile";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getInfluencerAvatarUrlWithFallback,
  getInfluencerDisplayName,
} from "./profile-display";

interface ChatPanelProps {
  conversation: BusinessConversation;
  onBack: () => void;
}

export function ChatPanel({ conversation, onBack }: ChatPanelProps) {
  const { user } = useAuth();
  const { data: myIdentity } = useMyBusinessProfile(user?.id);
  const trpc = useTRPC();
  const { campaign, influencerProfile } = conversation;
  const {
    data: messages,
    isLoading,
    isError,
    refetch,
  } = useCampaignMessages(campaign.id);
  const sendMessage = useSendMessage();
  const { mutate: markNotificationsRead } =
    useMarkNotificationsReadForCampaign();
  const insertFile = useMutation(
    trpc.campaignFile.insertCampaignFile.mutationOptions(),
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const influencerName = getInfluencerDisplayName(influencerProfile);
  const influencerAvatarUrl = getInfluencerAvatarUrlWithFallback(
    influencerProfile,
    conversation.influencerAuthAvatarUrl,
  );
  const brandName = getBusinessDisplayName(myIdentity ?? null);
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

  useEffect(() => {
    if (!user?.id || !campaign.id) return;
    markNotificationsRead({ campaignId: campaign.id, userId: user.id });
  }, [campaign.id, user?.id, markNotificationsRead]);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!user) return;
      sendMessage.mutate({
        campaignId: campaign.id,
        senderId: user.id,
        recipientId: campaign.influencer_id,
        content,
      });
    },
    [user, sendMessage, campaign.id, campaign.influencer_id],
  );

  const handleSendFile = useCallback(
    (file: File, url: string) => {
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
    },
    [user, sendMessage, insertFile, campaign.id, campaign.influencer_id],
  );

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
        influencerName={influencerName}
        avatarUrl={influencerAvatarUrl}
        campaignTitle={campaign.title || "Untitled Campaign"}
        status={campaign.status}
        onBack={onBack}
      />

      {campaign.status === "payment_pending" && (
        <Link
          href={`/dashboard/business/campaigns/${campaign.id}`}
          className="group flex items-center justify-between gap-3 border-b border-yellow-500/20 bg-yellow-500/10 px-5 py-3 transition-colors hover:bg-yellow-500/15"
        >
          <div className="flex items-center gap-3 min-w-0">
            <CreditCard className="h-4 w-4 text-yellow-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-yellow-200">
                Creator accepted — payment required
              </p>
              <p className="text-xs text-yellow-300/70">
                {campaign.price_offered
                  ? `₹${campaign.price_offered.toLocaleString("en-IN")} due to start the campaign`
                  : "Complete payment to lock in the deal"}
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-black transition-transform group-hover:translate-x-0.5">
            Pay now
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {isError ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <AlertTriangle className="h-7 w-7 text-red-400/60" />
            <p className="text-sm font-medium text-muted-foreground/60">
              Failed to load messages
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-full"
            >
              Retry
            </Button>
          </div>
        ) : isLoading ? (
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

      {chatLocked ? (
        <div className="shrink-0 border-t border-white/8 px-4 py-3">
          <div className="flex items-center gap-2.5 rounded-full border border-white/8 bg-white/3 px-4 py-2.5">
            <Lock className="h-4 w-4 shrink-0 text-white/30" />
            <p className="text-sm text-white/40">
              Chat unlocks once the creator accepts this booking
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
