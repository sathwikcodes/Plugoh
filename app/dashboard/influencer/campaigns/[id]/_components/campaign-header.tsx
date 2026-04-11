import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPackage } from "@/lib/format";
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";
import type { Campaign } from "./campaign-types";

interface CampaignHeaderProps {
  campaign: Campaign;
}

function StatusBadge({ status }: { status: string }) {
  const cfg = CAMPAIGN_STATUS_CONFIG[status as CampaignStatus];
  if (!cfg) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-[5px] text-[11px] font-medium",
        cfg.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function PackagePill({ packageType }: { packageType?: string | null }) {
  if (!packageType) return null;
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-white/[0.09] bg-white/[0.06] px-2.5 py-[5px] text-[11px] font-medium text-white/70">
      {formatPackage(packageType)}
    </span>
  );
}

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
        >
          <Link href="/dashboard/influencer/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-[26px] font-semibold tracking-[-0.03em] text-white">
          {campaign.title || "Untitled Campaign"}
        </h1>
      </div>
      <div className="ml-[52px] flex flex-wrap items-center gap-2">
        <StatusBadge status={campaign.status} />
        <PackagePill packageType={campaign.package_type} />
      </div>
    </div>
  );
}
