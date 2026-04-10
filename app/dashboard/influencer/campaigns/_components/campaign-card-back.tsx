import { STATUS_GLOW } from "./campaign-card-front";
import type { CampaignCardData } from "./campaign-card-front";

export function CampaignCardBack({ card }: { card: CampaignCardData }) {
  const glow = STATUS_GLOW[card.status] ?? "rgba(255,255,255,0.06)";

  return (
    <>
      <div className="absolute inset-0 bg-[#080a0d]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${glow}, transparent)`,
        }}
      />
      <div className="absolute inset-x-5 bottom-5 rounded-[20px] border border-white/8 bg-white/4 px-4 py-3 backdrop-blur-[10px]">
        <p className="truncate text-[14px] font-semibold text-white/50">
          {card.title || "Untitled Campaign"}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
    </>
  );
}
