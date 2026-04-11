import type { Campaign } from "./campaign-types";

interface CampaignBriefSectionProps {
  campaign: Campaign;
}

export function CampaignBriefSection({
  campaign,
}: CampaignBriefSectionProps) {
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] px-4 py-4 sm:px-5">
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
