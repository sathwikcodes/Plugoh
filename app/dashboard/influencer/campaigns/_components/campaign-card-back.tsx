import { cn } from "@/lib/utils";
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { STATUS_GLOW } from "./campaign-card-front";
import type { CampaignCardData } from "./campaign-card-front";

export function CampaignCardBack({ card }: { card: CampaignCardData }) {
  const glow = STATUS_GLOW[card.status] ?? "rgba(255,255,255,0.06)";
  const statusDot =
    CAMPAIGN_STATUS_CONFIG[card.status as CampaignStatus]?.dot ?? "bg-white/30";

  return (
    <>
      <div className="absolute inset-0 bg-[#080609]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${glow}, transparent)`,
        }}
      />
      <div className="absolute inset-x-5 bottom-5 rounded-[20px] border border-white/8 bg-white/4 px-4 py-3 backdrop-blur-[10px]">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[14px] font-semibold text-white/50">
            {card.title || "Untitled Campaign"}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDot)} />
            <span className="text-[13px] font-semibold tabular-nums text-white/60">
              {formatCurrency(card.price_offered)}
            </span>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
    </>
  );
}
