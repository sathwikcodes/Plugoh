"use client";

import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Globe } from "lucide-react";
import ProfileStrength from "../profile-strength";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

interface OverviewTabProps {
  profile: InfluencerProfile;
  campaigns: Campaign[];
  onNavigateToTab: (tab: string) => void;
}

export default function OverviewTab({
  profile,
  onNavigateToTab,
}: OverviewTabProps) {
  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      <ProfileStrength profile={profile} onNavigateToTab={onNavigateToTab} />

      {profile.bio && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bio
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          </div>
        </m.div>
      )}

      {profile.languages && profile.languages.length > 0 && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Languages
            </p>
            <div className="flex flex-wrap gap-3">
              {profile.languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Globe className="h-3.5 w-3.5" /> {lang}
                </span>
              ))}
            </div>
          </div>
        </m.div>
      )}
    </m.div>
  );
}
