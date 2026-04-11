import { BusinessAvatar } from "@/components/shared/business-avatar";
import type { CampaignBrandSectionProps } from "./campaign-types";

export function CampaignBrandSection({
  businessIdentity,
  businessName,
  businessSummary,
  igUsername,
  profilesLoading,
}: CampaignBrandSectionProps) {
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:p-5">
      <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
        Brand
      </p>
      {profilesLoading && !businessIdentity ? (
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-[#211b2c]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-[#211b2c]" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <BusinessAvatar
              business={businessIdentity}
              name={businessName}
              className="h-14 w-14 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-white">
                {businessName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                {businessIdentity?.businessProfile?.brand_type && (
                  <span className="text-xs text-white/45">
                    {businessIdentity.businessProfile.brand_type}
                  </span>
                )}
                {igUsername && (
                  <span className="text-xs text-white/40">@{igUsername}</span>
                )}
              </div>
            </div>
          </div>
          {businessSummary && (
            <p className="mt-3 line-clamp-3 text-[12.5px] leading-[1.7] text-white/55 sm:text-[13px]">
              {businessSummary}
            </p>
          )}
        </>
      )}
    </div>
  );
}
