import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";

/**
 * Returns status badge classes from the canonical CAMPAIGN_STATUS_CONFIG.
 * Drop-in replacement for the old per-file status mappings.
 */
export function statusColor(s: string): string {
  const cfg =
    CAMPAIGN_STATUS_CONFIG[s as CampaignStatus] ??
    CAMPAIGN_STATUS_CONFIG.requested;
  return cfg.badge;
}

/**
 * Compact number display (e.g. 1500 → "1.5K", 2000000 → "2.0M").
 * Pass `fallback` to control what's returned for falsy values (default: "—").
 */
export function compactNumber(
  n: number | null,
  fallback: string = "\u2014",
): string {
  if (!n && n !== 0) return fallback;
  if (n === 0) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

/**
 * Format a currency value for display in INR (e.g. 1500 → "₹1,500").
 */
export function formatCurrency(value: number | null): string {
  if (!value) return "\u2014";
  return `\u20B9${value.toLocaleString("en-IN")}`;
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a package type for display (e.g. "reel" → "Reel").
 */
export function formatPackage(pkg: string | null): string {
  if (!pkg) return "Campaign";
  return capitalize(pkg);
}

/**
 * Extract up to 2 initials from a name string.
 */
export function getInitials(name: string | null): string {
  return (name?.trim() || "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
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

/**
 * Compact conversation timestamp (e.g. "now", "5m", "2h", "3d", "Jun 14").
 */
export function formatConversationTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const date = new Date(dateStr);
  const now = new Date();
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}
