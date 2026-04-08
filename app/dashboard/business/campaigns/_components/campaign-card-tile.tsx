import { cn } from "@/lib/utils";
import { CampaignCardFront } from "./campaign-card-front";
import type { CampaignCardData } from "./campaign-card-front";

export function CampaignCardTile({
  card,
  className,
}: {
  card: CampaignCardData;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[34px] border border-white/10",
        className,
      )}
    >
      <CampaignCardFront card={card} />
    </div>
  );
}
