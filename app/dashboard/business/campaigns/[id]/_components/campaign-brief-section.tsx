import type { Campaign } from "./campaign-types";

interface BriefRow {
  key: string;
  value: string;
}

function parseBrief(brief: string): BriefRow[] | null {
  const lines = brief.trim().split("\n").filter(Boolean);
  const rows: BriefRow[] = [];
  for (const line of lines) {
    const match = line.match(/^([A-Za-z][A-Za-z /]+?):\s*(.+)$/);
    if (!match) return null;
    rows.push({ key: match[1].trim(), value: match[2].trim() });
  }
  return rows.length >= 2 ? rows : null;
}

interface CampaignBriefSectionProps {
  campaign: Campaign;
}

export function CampaignBriefSection({ campaign }: CampaignBriefSectionProps) {
  const rows = campaign.brief ? parseBrief(campaign.brief) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] px-4 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:px-5">
        {campaign.brief ? (
          rows ? (
            <div className="space-y-2.5">
              {rows.map(({ key, value }) => (
                <div key={key} className="flex gap-3">
                  <span className="w-24 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">
                    {key}
                  </span>
                  <span className="flex-1 text-[13px] leading-[1.6] text-white/75">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-[12.5px] leading-[1.75] text-white/70 sm:text-[13px]">
              {campaign.brief}
            </p>
          )
        ) : (
          <p className="text-[12.5px] italic text-white/35 sm:text-[13px]">
            No brief provided.
          </p>
        )}
      </div>

    </div>
  );
}
