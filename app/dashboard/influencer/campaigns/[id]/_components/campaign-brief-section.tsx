import type { Campaign } from "./campaign-types";

interface CampaignBriefSectionProps {
  campaign: Campaign;
}

export function CampaignBriefSection({
  campaign,
}: CampaignBriefSectionProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 sm:px-5">
      <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
        Campaign brief
      </p>
      {campaign.brief ? (
        <p className="whitespace-pre-wrap text-[12.5px] leading-[1.75] text-white/70 sm:text-[13px]">
          {campaign.brief}
        </p>
      ) : (
        <p className="text-[12.5px] italic text-white/35 sm:text-[13px]">
          No brief provided.
        </p>
      )}
    </div>
  );
}
