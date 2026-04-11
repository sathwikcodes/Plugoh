"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Search } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useInboxConversations } from "@/hooks/queries/use-inbox-conversations";
import { Input } from "@/components/ui/input";
import {
  fadeUp,
  stagger,
} from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConversationList } from "./_components/conversation-list";
import { ChatPanel } from "./_components/chat-panel";
import { InboxEmptyState } from "./_components/inbox-empty-state";
import InboxLoading from "./loading";

const MOBILE_VIEWPORT_STYLE = {
  height: "100dvh",
  minHeight: "100dvh",
} as const;

const MOBILE_DOCK_INSET_STYLE = {
  paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))",
} as const;

export default function InfluencerInboxPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const selectedId = searchParams.get("chat");
  const [search, setSearch] = useState("");

  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
  } = useInboxConversations(user?.id);

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

  const showMobileChat = isMobile && !!selectedConversation;

  if (isLoading) return <InboxLoading />;

  if (isError) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3">
        <AlertTriangle className="h-8 w-8 text-red-400/60" />
        <p className="text-sm font-medium text-muted-foreground/60">
          Failed to load conversations
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
    );
  }

  return (
    <div
      className="relative h-dvh overflow-hidden"
      style={isMobile ? MOBILE_VIEWPORT_STYLE : undefined}
    >
      <div className="relative z-10 container h-full py-4 md:flex md:h-full md:flex-col md:py-6">
        <AnimatePresence mode="wait">
          {showMobileChat ? (
            <m.div
              key={selectedConversation.campaign.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-card/75 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
            >
              <ChatPanel
                conversation={selectedConversation}
                onBack={handleBack}
              />
            </m.div>
          ) : (
            <m.div
              key="inbox-shell"
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex h-full flex-col gap-4 md:gap-5"
            >
              <m.div
                variants={fadeUp}
                className="flex shrink-0 items-center justify-center"
              >
                <div className="min-w-0 text-center">
                  <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-3xl">
                    <span className="heading-mix-accent text-4xl text-white/90">
                      Messages
                    </span>
                  </h1>
                </div>
              </m.div>

              <m.section variants={fadeUp} className="shrink-0">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-12 rounded-full border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/35"
                  />
                </div>
              </m.section>

              <m.section
                variants={fadeUp}
                className="min-h-0 flex-1 md:flex-none md:h-[calc(100dvh-14rem)]"
                style={
                  isMobile && !showMobileChat
                    ? MOBILE_DOCK_INSET_STYLE
                    : undefined
                }
              >
                <div className="flex h-full min-h-0 flex-col gap-4 md:flex-row">
                  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/14 bg-[linear-gradient(160deg,rgba(22,18,25,0.96)_0%,rgba(22,18,25,0.94)_46%,rgba(30,24,41,0.92)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl md:w-70 md:shrink-0 md:flex-none">
                    <div className="min-h-0 flex-1 px-4 py-4">
                      <ConversationList
                        conversations={conversations}
                        searchQuery={search}
                        selectedId={selectedId}
                        currentUserId={user?.id || ""}
                        onSelect={handleSelect}
                      />
                    </div>
                  </div>

                  <div className="hidden min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-card/75 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl md:flex md:min-w-0">
                    <AnimatePresence mode="wait">
                      {selectedConversation ? (
                        <m.div
                          key={selectedConversation.campaign.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="h-full w-full"
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
                          className="h-full w-full"
                        >
                          <InboxEmptyState />
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </m.section>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
