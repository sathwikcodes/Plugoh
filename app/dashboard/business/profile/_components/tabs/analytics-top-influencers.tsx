import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export interface TopInfluencerItem {
  total: number;
  count: number;
  profileId: string;
  profile: InfluencerProfile | null;
}

interface AnalyticsTopInfluencersProps {
  data: TopInfluencerItem[];
}

export function AnalyticsTopInfluencers({
  data,
}: AnalyticsTopInfluencersProps) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Top Influencers Worked With
      </p>
      <div className="space-y-3">
        {data.map(({ profile: ip, total, count, profileId }, i) => {
          const name = ip?.display_name ?? "Influencer";
          const initials = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          return (
            <div key={profileId} className="flex items-center gap-3">
              {ip?.ig_profile_picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ip.ig_profile_picture_url}
                  alt={name}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white/60">
                    {initials}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {ip?.ig_followers_count || ip?.follower_count ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {compactNumber(
                        ip.ig_followers_count ?? ip.follower_count ?? 0,
                      )}
                    </span>
                  ) : null}
                  <span className="text-[11px] text-muted-foreground">
                    {count} campaign{count > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">
                  ₹{total.toLocaleString()}
                </p>
                <div
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    i === 0
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-white/5 text-muted-foreground",
                  )}
                >
                  #{i + 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
