import { MapPin } from "lucide-react";
import { BusinessAvatar } from "@/components/shared/business-avatar";
import type { CampaignBrandSectionProps } from "./campaign-types";

export function CampaignBrandSection({
  businessIdentity,
  businessName,
  businessLocation,
  businessSummary,
  igUsername,
  profilesLoading,
}: CampaignBrandSectionProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
      <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
        Brand
      </p>
      {profilesLoading && !businessIdentity ? (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-white/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/[0.04]" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <BusinessAvatar
              business={businessIdentity}
              name={businessName}
              className="h-12 w-12 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-medium text-white">
                {businessName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {businessIdentity?.businessProfile?.brand_type && (
                  <span className="text-xs text-white/45">
                    {businessIdentity.businessProfile.brand_type}
                  </span>
                )}
                {businessLocation && (
                  <span className="inline-flex items-center gap-1 text-xs text-white/40">
                    <MapPin className="h-3 w-3" />
                    {businessLocation}
                  </span>
                )}
                {igUsername && (
                  <span className="text-xs text-white/40">@{igUsername}</span>
                )}
              </div>
            </div>
          </div>
          {businessSummary && (
            <p className="mt-3 text-[12.5px] leading-[1.7] text-white/60 sm:text-[13px]">
              {businessSummary}
            </p>
          )}
        </>
      )}
    </div>
  );
}
