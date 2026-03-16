"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { stagger, fadeUp } from "@/lib/animations";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignMessage = Database["public"]["Tables"]["campaign_messages"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface Conversation {
  campaign: Campaign;
  businessProfile: Profile | null;
  lastMessage: CampaignMessage | null;
}

export default function InboxPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const { data: campaigns, error: campError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("influencer_id", user.id)
          .neq("status", "rejected")
          .order("updated_at", { ascending: false });

        if (campError) throw campError;
        if (!campaigns || campaigns.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        const businessIds = [...new Set(campaigns.map((c) => c.business_id))];
        const campaignIds = campaigns.map((c) => c.id);

        const [{ data: profiles }, { data: allMessages }] = await Promise.all([
          supabase.from("profiles").select("*").in("id", businessIds),
          supabase
            .from("campaign_messages")
            .select("*")
            .in("campaign_id", campaignIds)
            .neq("message_type", "system")
            .order("created_at", { ascending: false }),
        ]);

        const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

        const messageMap = new Map<string, CampaignMessage>();
        for (const msg of allMessages || []) {
          if (!messageMap.has(msg.campaign_id)) {
            messageMap.set(msg.campaign_id, msg);
          }
        }

        const convos: Conversation[] = campaigns.map((c) => ({
          campaign: c,
          businessProfile: profileMap.get(c.business_id) || null,
          lastMessage: messageMap.get(c.id) || null,
        }));

        convos.sort((a, b) => {
          const aTime =
            a.lastMessage?.created_at ||
            a.campaign.updated_at ||
            a.campaign.created_at;
          const bTime =
            b.lastMessage?.created_at ||
            b.campaign.updated_at ||
            b.campaign.created_at;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

        setConversations(convos);
      } catch (err) {
        console.error("Failed to load inbox:", err);
        toast({
          title: "Failed to load inbox",
          description: "Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 space-y-5">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-extrabold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your conversations with brands
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-1">
          {conversations.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-10 text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/10 to-purple-500/10 mb-4">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-semibold">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Conversations will appear here when brands reach out about
                campaigns.
              </p>
            </div>
          ) : (
            conversations.map((convo) => {
              const brandName =
                convo.businessProfile?.business_name ||
                convo.businessProfile?.full_name ||
                "Brand";
              const initials = brandName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const lastMsg = convo.lastMessage;
              const msgPreview = lastMsg
                ? lastMsg.message_type === "file"
                  ? "Sent a file"
                  : (lastMsg.content || "").slice(0, 60) +
                    ((lastMsg.content?.length || 0) > 60 ? "..." : "")
                : "No messages yet";
              const msgTime = lastMsg?.created_at || convo.campaign.created_at;
              const isOwn = lastMsg?.sender_id === user?.id;

              return (
                <Link
                  key={convo.campaign.id}
                  href={`/dashboard/influencer/campaigns/${convo.campaign.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/5 active:bg-white/10"
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-linear-to-br from-pink-500/20 to-purple-500/20 text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">
                        {brandName}
                      </p>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {timeAgo(msgTime)}
                      </span>
                    </div>
                    <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                      {convo.campaign.title || "Untitled Campaign"}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                      {isOwn ? "You: " : ""}
                      {msgPreview}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1.5 py-0 h-4 rounded-full border shrink-0",
                      convo.campaign.status === "pending" &&
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                      convo.campaign.status === "accepted" &&
                        "bg-green-500/10 text-green-400 border-green-500/20",
                      convo.campaign.status === "completed" &&
                        "bg-primary/10 text-primary border-primary/20",
                    )}
                  >
                    {convo.campaign.status === "accepted"
                      ? "active"
                      : convo.campaign.status}
                  </Badge>
                </Link>
              );
            })
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
