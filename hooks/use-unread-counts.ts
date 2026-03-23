"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type UnreadNotification = Pick<
  Database["public"]["Tables"]["notifications"]["Row"],
  "id" | "type" | "read" | "data"
>;

const INBOX_TYPES = new Set(["new_message", "new_inquiry"]);
const INFLUENCER_CAMPAIGN_TYPES = new Set(["new_booking"]);
const BUSINESS_CAMPAIGN_TYPES = new Set([
  "booking_accepted",
  "booking_rejected",
]);

export function useUnreadCounts() {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<UnreadNotification[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = () =>
      supabase
        .from("notifications")
        .select("id, type, read, data")
        .eq("user_id", user.id)
        .eq("read", false)
        .then(({ data }) => setNotifications(data || []));

    fetchUnread();

    const channel = supabase
      .channel(`unread-counts-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Optimistically add the new notification to local state
          setNotifications((prev) => [
            ...prev,
            payload.new as UnreadNotification,
          ]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as UnreadNotification;
          if (updated.read) {
            // Optimistically remove read notifications from local state
            setNotifications((prev) => prev.filter((n) => n.id !== updated.id));
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string };
          setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Memoize count derivations to avoid recalculating on every render
  const { inboxCount, campaignsCount } = useMemo(() => {
    // Deduplicate inbox notifications by campaign_id so multiple messages
    // from the same conversation only count as 1 badge
    const uniqueInboxCampaigns = new Set(
      notifications
        .filter((n) => INBOX_TYPES.has(n.type ?? ""))
        .map((n) => (n.data as { campaign_id?: string } | null)?.campaign_id),
    );

    const campaigns =
      role === "influencer"
        ? notifications.filter((n) =>
            INFLUENCER_CAMPAIGN_TYPES.has(n.type ?? ""),
          ).length
        : role === "business"
          ? notifications.filter((n) =>
              BUSINESS_CAMPAIGN_TYPES.has(n.type ?? ""),
            ).length
          : 0;

    return { inboxCount: uniqueInboxCampaigns.size, campaignsCount: campaigns };
  }, [notifications, role]);

  return { inboxCount, campaignsCount };
}
