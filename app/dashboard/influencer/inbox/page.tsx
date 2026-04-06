"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useInboxConversations } from "@/hooks/queries/use-inbox-conversations";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConversationList } from "./_components/conversation-list";
import { ChatPanel } from "./_components/chat-panel";
import { InboxEmptyState } from "./_components/inbox-empty-state";
import { AnimatePresence, m } from "framer-motion";

export default function InboxPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("chat");

  const { data: conversations = [], isLoading } = useInboxConversations(
    user?.id,
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.campaign.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const handleSelect = useCallback(
    (campaignId: string) => {
      router.push(`/dashboard/influencer/inbox?chat=${campaignId}`);
    },
    [router],
  );

  const handleBack = useCallback(() => {
    router.push("/dashboard/influencer/inbox");
  }, [router]);

  const isMobile = useIsMobile();
  const mobileDockInset = "calc(104px + env(safe-area-inset-bottom, 0px))";
  const showMobileChat = isMobile && !!selectedConversation;

  return (
    <div
      className="h-dvh flex overflow-hidden bg-background"
      style={
        isMobile && !showMobileChat
          ? { paddingBottom: mobileDockInset }
          : undefined
      }
    >
      {/* Desktop: always show both panels */}
      {/* Mobile: show list OR chat */}

      {/* Left panel — conversation list */}
      <div
        className={
          selectedId
            ? "hidden h-full w-full flex-col p-3 md:flex md:w-70 md:shrink-0 md:flex-none md:border-r md:border-white/4 md:p-0"
            : "flex h-full w-full flex-col p-3 md:w-70 md:shrink-0 md:flex-none md:border-r md:border-white/4 md:p-0"
        }
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-white/14 bg-[linear-gradient(160deg,rgba(5,8,12,0.96)_0%,rgba(10,14,21,0.94)_46%,rgba(14,19,28,0.92)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl md:rounded-none md:border-0 md:bg-transparent md:shadow-none md:backdrop-blur-0">
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            currentUserId={user?.id || ""}
            isLoading={isLoading}
            onSelect={handleSelect}
          />
        </div>
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
