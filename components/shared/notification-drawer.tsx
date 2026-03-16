"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Bell, Check, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Database } from "@/lib/supabase/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export function NotificationDrawer() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setNotifications(data || []));

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const timeAgo = (date: string, currentNow: number) => {
    const diff = currentNow - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getNotificationText = (n: Notification) => {
    const data = n.data as Record<string, string> | null;
    switch (n.type) {
      case "new_booking":
        return `New booking request: "${data?.title || "Untitled"}"`;
      case "booking_accepted":
        return `Your booking "${data?.title || ""}" was accepted! 🎉`;
      case "booking_rejected":
        return `Your booking "${data?.title || ""}" was declined.`;
      case "booking_completed":
        return `Campaign "${data?.title || ""}" marked as completed.`;
      case "new_message":
        return `New message in "${data?.title || "a campaign"}"`;
      case "new_inquiry":
        return `New inquiry: "${data?.title || "Untitled"}"`;
      case "terms_proposed":
        return `New terms proposed for "${data?.title || ""}"`;
      case "terms_accepted":
        return `Terms accepted for "${data?.title || ""}"`;
      case "deliverable_submitted":
        return `Content submitted for review: "${data?.title || ""}"`;
      case "revision_requested":
        return `Revision requested for "${data?.title || ""}"`;
      case "deliverable_approved":
        return `Content approved: "${data?.title || ""}"`;
      case "payment_released":
        return `Payment released for "${data?.title || ""}"`;
      case "review_received":
        return `You received a review for "${data?.title || ""}"`;
      default:
        return data?.message || "You have a new notification";
    }
  };

  if (!user) return null;

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground border-2 border-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[min(380px,90vw)] ml-auto rounded-none">
        <DrawerHeader className="flex flex-row items-center justify-between border-b pb-3">
          <DrawerTitle className="font-display">Notifications</DrawerTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={markAllRead}
            >
              <Check className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </DrawerHeader>
        <ScrollArea className="flex-1 p-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors ${
                    n.read
                      ? "bg-muted/30"
                      : "bg-primary/5 border border-primary/10"
                  } hover:bg-muted/50`}
                >
                  <p className="text-sm font-medium leading-snug">
                    {getNotificationText(n)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeAgo(n.created_at, now)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
