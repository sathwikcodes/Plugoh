"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { TURNAROUND_LABELS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

interface RateCardProps {
  profile: InfluencerProfile;
}

export default function RateCard({ profile }: RateCardProps) {
  const hasAnyPrice =
    profile.price_per_reel || profile.price_per_post || profile.price_per_story;

  if (!hasAnyPrice) return null;

  return (
    <motion.div variants={fadeUp}>
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rate Card
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground -mr-2 h-7 text-xs"
            asChild
          >
            <Link href="/dashboard/influencer/complete-profile?step=2">
              <Pencil className="mr-1 h-3 w-3" /> Edit
            </Link>
          </Button>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Reel", value: profile.price_per_reel },
            { label: "Post", value: profile.price_per_post },
            { label: "Story", value: profile.price_per_story },
          ].map((pkg) => (
            <div
              key={pkg.label}
              className={cn(
                "rounded-xl border p-3 text-center transition-all",
                pkg.value
                  ? "border-white/10 hover:border-white/20"
                  : "border-white/5 opacity-40",
              )}
            >
              <p className="text-xs text-muted-foreground mb-1">{pkg.label}</p>
              <p className="text-lg font-extrabold">
                {pkg.value ? `\u20B9${pkg.value.toLocaleString()}` : "\u2014"}
              </p>
            </div>
          ))}
        </div>

        {/* Content Types */}
        {profile.content_types && profile.content_types.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Content Types</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.content_types.map((ct) => (
                <Badge
                  key={ct}
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 text-xs"
                >
                  {ct}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Turnaround */}
        {profile.turnaround_time && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Delivers in{" "}
            {TURNAROUND_LABELS[profile.turnaround_time] ||
              profile.turnaround_time.replace(/_/g, " ")}
          </div>
        )}
      </div>
    </motion.div>
  );
}
