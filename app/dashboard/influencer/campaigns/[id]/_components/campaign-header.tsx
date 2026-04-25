import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Campaign } from "./campaign-types";

interface CampaignHeaderProps {
  campaign: Campaign;
}

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  return (
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
      <h1 className="min-w-0 flex-1 text-[26px] font-semibold tracking-[-0.03em] text-white">
        {campaign.title || "Untitled Campaign"}
      </h1>
    </div>
  );
}
