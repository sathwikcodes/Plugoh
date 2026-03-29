/**
 * Format a number for display (e.g. 1500 → "1.5K", 2000000 → "2.0M").
 */
export function formatNumber(n: number | null): string {
  if (!n) return "\u2014";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

/**
 * Returns a status badge class string based on campaign status.
 */
export function statusColor(s: string): string {
  switch (s) {
    case "requested":
    case "pending":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "payment_pending":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "in_escrow":
    case "accepted":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "delivery_submitted":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "completed":
      return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "disputed":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "declined":
    case "rejected":
    case "expired":
    case "cancelled":
    case "refunded":
      return "bg-muted text-muted-foreground border-muted";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/**
 * Instagram-style message timestamp:
 * < 1 min   → "Just now"
 * < 60 min  → "2 minutes ago"
 * < 24 hr   → "2 hours ago"
 * yesterday → "Yesterday"
 * this week → "Monday"
 * this year → "Jun 14"
 * older     → "Jun 14, 2024"
 */
export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60)
    return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24)
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((today.getTime() - msgDay.getTime()) / 86_400_000);

  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  if (date.getFullYear() === now.getFullYear())
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Compact number display (e.g. 1500 → "1.5K", 2000000 → "2.0M").
 * Unlike formatNumber, returns the raw number string for 0 and small values.
 */
export function compactNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

/**
 * Returns a human-readable relative time string (e.g. "5m ago", "2d ago").
 */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
