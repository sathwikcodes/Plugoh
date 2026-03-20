"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type UnreadNotification = Pick<
  Database["public"]["Tables"]["notifications"]["Row"],
  "id" | "type" | "read"
>;

const INBOX_TYPES = new Set(["new_message", "new_inquiry"]);

export function useUnreadCounts() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UnreadNotification[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = () =>
      supabase
        .from("notifications")
        .select("id, type, read")
        .eq("user_id", user.id)
        .eq("read", false)
        .then(({ data }) => setNotifications(data || []));

    fetchUnread();

    const channel = supabase
      .channel("unread-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnread();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const inboxCount = notifications.filter((n) =>
    INBOX_TYPES.has(n.type ?? ""),
  ).length;

  const campaignsCount = notifications.filter(
    (n) => !INBOX_TYPES.has(n.type ?? ""),
  ).length;

  return { inboxCount, campaignsCount };
}
