import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CAMPAIGN_STATUS_CONFIG } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

interface SpendingTransactionRowProps {
  campaign: Campaign;
  influencerProfile: InfluencerProfile | null;
}

export function SpendingTransactionRow({
  campaign: c,
  influencerProfile: ip,
}: SpendingTransactionRowProps) {
  const statusCfg =
    CAMPAIGN_STATUS_CONFIG[c.status as keyof typeof CAMPAIGN_STATUS_CONFIG];
  const date = new Date(c.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });

  return (
    <div className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
      <div className="sm:hidden flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {ip?.display_name ?? c.title ?? "Campaign"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground capitalize">
              {c.package_type ?? "—"}
            </span>
            <span className="text-[11px] text-muted-foreground">{date}</span>
          </div>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <p className="text-sm font-semibold">
            ₹{(c.price_offered || 0).toLocaleString()}
          </p>
          <Badge
            variant="outline"
            className={cn("text-[10px] px-2 py-0.5", statusCfg?.badge)}
          >
            {statusCfg?.label ?? c.status}
          </Badge>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {ip?.display_name ?? "—"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {c.title ?? date}
          </p>
        </div>
        <p className="text-sm capitalize text-muted-foreground">
          {c.package_type ?? "—"}
        </p>
        <p className="text-sm font-semibold text-right">
          ₹{(c.price_offered || 0).toLocaleString()}
        </p>
        <Badge
          variant="outline"
          className={cn("text-[10px] px-2 py-0.5", statusCfg?.badge)}
        >
          {statusCfg?.label ?? c.status}
        </Badge>
      </div>
    </div>
  );
}
