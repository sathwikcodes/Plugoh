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
    case "accepted":
      return "bg-success/10 text-success border-success/20";
    case "pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "rejected":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "completed":
      return "bg-primary/10 text-primary border-primary/20";
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
