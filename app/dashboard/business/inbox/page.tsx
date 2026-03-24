"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useBusinessInboxConversations } from "@/hooks/queries/use-business-inbox-conversations";
import { ConversationList } from "./_components/conversation-list";
import { ChatPanel } from "./_components/chat-panel";
import { InboxEmptyState } from "./_components/inbox-empty-state";
import { AnimatePresence, m } from "framer-motion";

export default function BusinessInboxPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("chat");

  const { data: conversations = [], isLoading } = useBusinessInboxConversations(
    user?.id,
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.campaign.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const handleSelect = useCallback(
    (campaignId: string) => {
      router.push(`/dashboard/business/inbox?chat=${campaignId}`);
    },
    [router],
  );

  const handleBack = useCallback(() => {
    router.push("/dashboard/business/inbox");
  }, [router]);

  return (
    <div className="h-dvh flex overflow-hidden bg-background">
      {/* Left panel — conversation list */}
      <div
        className={
          selectedId
            ? "hidden md:flex md:flex-col w-full md:w-[340px] md:shrink-0 md:border-r md:border-white/4 h-full"
            : "flex flex-col w-full md:w-[340px] md:shrink-0 md:border-r md:border-white/4 h-full"
        }
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          currentUserId={user?.id || ""}
          isLoading={isLoading}
          onSelect={handleSelect}
        />
      </div>

      {/* Right panel — chat or empty state */}
      <div
        className={
          selectedId
            ? "flex flex-col flex-1 min-w-0 h-full"
            : "hidden md:flex md:flex-col md:flex-1 md:min-w-0 h-full"
        }
      >
        <AnimatePresence mode="wait">
          {selectedConversation ? (
            <m.div
              key={selectedConversation.campaign.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <ChatPanel
                conversation={selectedConversation}
                onBack={handleBack}
              />
            </m.div>
          ) : (
            <m.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <InboxEmptyState />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
