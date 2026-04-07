"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useInboxConversations } from "@/hooks/queries/use-inbox-conversations";
import { Input } from "@/components/ui/input";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  fadeUp,
  stagger,
} from "@/lib/animations";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConversationList } from "./_components/conversation-list";
import { ChatPanel } from "./_components/chat-panel";
import { InboxEmptyState } from "./_components/inbox-empty-state";

export default function InboxPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const selectedId = searchParams.get("chat");
  const [search, setSearch] = useState("");

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

  const mobileViewportHeight = "100dvh";
  const mobileDockInset = "calc(104px + env(safe-area-inset-bottom, 0px))";
  const showMobileChat = isMobile && !!selectedConversation;

  return (
    <div
      className="relative h-dvh overflow-hidden"
      style={
        isMobile
          ? {
              height: mobileViewportHeight,
              minHeight: mobileViewportHeight,
            }
          : undefined
      }
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden md:absolute">
        <AnimatedGradientBackground
          Breathing
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={180}
          breathingRange={8}
          animationSpeed={0.015}
          containerStyle={GRADIENT_STYLE}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff14,transparent_38%),linear-gradient(180deg,#06070a_0%,#090a0f_42%,#0c1017_100%)]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,#9fb8ff14_0%,transparent_100%)]" />
      </div>

      <div className="relative z-10 container h-full py-4 md:flex md:h-full md:flex-col md:py-6">
        <AnimatePresence mode="wait">
          {showMobileChat ? (
            <m.div
              key={selectedConversation.campaign.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d12]/75 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
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
                    ? { paddingBottom: mobileDockInset }
                    : undefined
                }
              >
                <div className="flex h-full min-h-0 flex-col gap-4 md:flex-row">
                  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/14 bg-[linear-gradient(160deg,rgba(5,8,12,0.96)_0%,rgba(10,14,21,0.94)_46%,rgba(14,19,28,0.92)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl md:w-70 md:shrink-0 md:flex-none">
                    <div className="min-h-0 flex-1 px-4 py-4">
                      <ConversationList
                        conversations={conversations}
                        searchQuery={search}
                        selectedId={selectedId}
                        currentUserId={user?.id || ""}
                        isLoading={isLoading}
                        onSelect={handleSelect}
                      />
                    </div>
                  </div>

                  <div className="hidden min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d12]/75 shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:flex md:min-w-0">
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
