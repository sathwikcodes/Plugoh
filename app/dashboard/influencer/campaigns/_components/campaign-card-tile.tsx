import { cn } from "@/lib/utils";
import { CampaignCardFront } from "./campaign-card-front";
import type { CampaignCardData } from "./campaign-card-front";

const TILE_ASPECT_WH = 0.74;

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
        "relative w-full overflow-hidden rounded-[34px] border border-white/10",
        className,
      )}
      style={{ paddingBottom: `${100 / TILE_ASPECT_WH}%` }}
    >
      <CampaignCardFront card={card} />
    </div>
  );
}
