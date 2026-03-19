"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Check, ArrowRight } from "lucide-react";
import {
  calculateCompleteness,
  getMissingItems,
} from "@/lib/profile-utils";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

interface ProfileStrengthProps {
  profile: InfluencerProfile;
}

export default function ProfileStrength({ profile }: ProfileStrengthProps) {
  const completeness = calculateCompleteness(profile);
  const missing = getMissingItems(profile).slice(0, 3);
  const isComplete = completeness === 100;

  const ringColor =
    completeness >= 80
      ? "text-green-500"
      : completeness >= 50
        ? "text-yellow-500"
        : "text-red-500";

  const bgColor =
    completeness >= 80
      ? "bg-green-500/10"
      : completeness >= 50
        ? "bg-yellow-500/10"
        : "bg-red-500/10";

  // If 100%, show compact badge
  if (isComplete) {
    return (
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/5 backdrop-blur-md px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-green-400">
            Profile complete
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp}>
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5">
        <div className="flex items-center gap-5">
          {/* Circular Progress Ring */}
          <div className="relative shrink-0">
            <svg width="72" height="72" viewBox="0 0 72 72">
              {/* Background circle */}
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-white/5"
              />
              {/* Progress circle */}
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - completeness / 100)}`}
                className={cn(ringColor, "transition-all duration-700")}
                transform="rotate(-90 36 36)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-extrabold">{completeness}%</span>
            </div>
          </div>

          {/* Missing items */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Profile Strength
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((item) => (
                <Link
                  key={item.label}
                  href={`/dashboard/influencer/complete-profile?step=${item.step}`}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    bgColor,
                    "hover:brightness-125",
                  )}
                >
                  {item.label}{" "}
                  <span className="opacity-60">+{item.weight}%</span>
                  <ArrowRight className="h-3 w-3 opacity-50" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
