"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  useCampaignMessages,
  useSendMessage,
} from "@/hooks/queries/use-campaign-messages";
import {
  MessageBubble,
  SystemMessage,
  BookingCardMessage,
} from "./message-bubble";
import { MessageInput } from "./message-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface CampaignChatProps {
  campaignId: string;
  businessId: string;
  influencerId: string;
  businessName?: string;
  influencerName?: string;
  disabled?: boolean;
}

export function CampaignChat({
  campaignId,
  businessId,
  influencerId,
  businessName = "Business",
  influencerName = "Influencer",
  disabled,
}: CampaignChatProps) {
  const { user } = useAuth();
  const { data: messages, isLoading } = useCampaignMessages(campaignId);
  const sendMessage = useSendMessage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const recipientId = user?.id === businessId ? influencerId : businessId;

  const handleSendMessage = (content: string) => {
    if (!user) return;
    sendMessage.mutate({
      campaignId,
      senderId: user.id,
      recipientId,
      content,
    });
  };

  const handleSendFile = (file: File, url: string) => {
    if (!user) return;
    sendMessage.mutate({
      campaignId,
      senderId: user.id,
      recipientId,
      content: file.name,
      messageType: "file",
      metadata: {
        url,
        filename: file.name,
        size: file.size,
        mime_type: file.type,
      },
    });

    // Also insert into campaign_files for the files list
    supabase.from("campaign_files").insert({
      campaign_id: campaignId,
      uploaded_by: user.id,
      file_name: file.name,
      file_url: url,
      file_size: file.size,
      mime_type: file.type,
    });
  };

  const getSenderName = useCallback(
    (senderId: string) => {
      if (senderId === businessId) return businessName;
      if (senderId === influencerId) return influencerName;
      return "System";
    },
    [businessId, influencerId, businessName, influencerName],
  );

  if (!user) return null;

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="py-3 px-4 border-b shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ maxHeight: "400px", minHeight: "200px" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages && messages.length > 0 ? (
            <>
              {messages.map((msg) =>
                msg.message_type === "booking_card" ? (
                  <BookingCardMessage key={msg.id} metadata={msg.metadata} />
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
        </div>
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          campaignId={campaignId}
          userId={user.id}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
