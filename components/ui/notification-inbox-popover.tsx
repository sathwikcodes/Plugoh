"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { useCurrentTime } from "@/hooks/use-current-time";
import {
  Bell,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  MessageSquare,
  Mail,
  FileText,
  Upload,
  RefreshCw,
  DollarSign,
  Star,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/lib/supabase/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  new_booking: ClipboardCheck,
  booking_accepted: CheckCircle,
  booking_rejected: XCircle,
  booking_completed: CheckCircle,
  new_message: MessageSquare,
  new_inquiry: Mail,
  terms_proposed: FileText,
  terms_accepted: CheckCircle,
  deliverable_submitted: Upload,
  revision_requested: RefreshCw,
  deliverable_approved: CheckCircle,
  payment_released: DollarSign,
  review_received: Star,
};

export function NotificationInboxPopover() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState("all");
  const now = useCurrentTime(60_000);
  const [popoverOpen, setPopoverOpen] = useState(false);

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
  const filtered =
    tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

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

  const timeAgo = (date: string) => {
    const diff = now - new Date(date).getTime();
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
        return `Your booking "${data?.title || ""}" was accepted!`;
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
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground border-2 border-card">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-[380px] p-0 overflow-hidden"
      >
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between border-b px-3 py-2">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-muted-foreground hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Inbox className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No notifications
                </p>
              </div>
            ) : (
              filtered.map((n) => {
                const Icon = NOTIFICATION_ICONS[n.type ?? ""] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                      const data = n.data as Record<string, string> | null;
                      const campaignId = data?.campaign_id;
                      if (campaignId) {
                        const basePath =
                          role === "business"
                            ? "/dashboard/business/inbox"
                            : "/dashboard/influencer/inbox";
                        router.push(`${basePath}?chat=${campaignId}`);
                        setPopoverOpen(false);
                      }
                    }}
                    className={`flex w-full items-start gap-3 border-b px-3 py-3 text-left hover:bg-accent transition-colors ${
                      n.read ? "" : "bg-primary/5"
                    }`}
                  >
                    <div className="mt-0.5 text-muted-foreground shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p
                        className={`text-sm leading-snug ${
                          n.read
                            ? "text-foreground/80"
                            : "font-semibold text-foreground"
                        }`}
                      >
                        {getNotificationText(n)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="mt-1.5 shrink-0 inline-block size-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
