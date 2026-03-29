"use client";

import Image from "next/image";
import { Building2, MapPin } from "lucide-react";
import { RealReachVerifiedBadge } from "@/components/ui/realreach-verified-badge";
import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import {
  type BusinessIdentity,
  getBusinessDisplayName,
  getBusinessLocation,
  isBusinessProfileComplete,
} from "@/lib/business-profile";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileCardHeaderProps {
  identity: BusinessIdentity;
  totalCampaigns: number;
  totalSpent: number;
  onNavigateToSettings?: () => void;
}

export default function BusinessProfileCardHeader({
  identity,
  totalCampaigns,
  totalSpent,
  onNavigateToSettings,
}: ProfileCardHeaderProps) {
  const profile = identity.basicProfile as Profile | null;
  const businessProfile = identity.businessProfile;
  const isComplete = isBusinessProfileComplete(identity);
  const displayName = getBusinessDisplayName(identity);
  const location = getBusinessLocation(identity);

  const initials = (displayName || "B")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasPhone = !!profile?.phone;

  return (
    <m.div variants={fadeUp}>
      <div
        className="rounded-3xl border border-white/[0.08] p-6 space-y-5 shadow-2xl"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 10%, #1e1e1e 0%, #111112 55%, #0c0c0d 100%)",
        }}
      >
        {/* ── STATUS BAR ── */}
        <button
          onClick={onNavigateToSettings}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-50",
                  isComplete ? "bg-green-400" : "bg-amber-400",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2.5 w-2.5",
                  isComplete ? "bg-green-500" : "bg-amber-500",
                )}
              />
            </span>
            <span
              className={cn(
                "text-sm font-medium tracking-wide",
                isComplete ? "text-green-400" : "text-amber-400",
              )}
            >
              {isComplete ? "Actively booking" : "Profile incomplete"}
            </span>
          </div>

          {(businessProfile?.brand_type || profile?.business_type) && (
            <span className="text-xs text-white/50 bg-white/[0.07] border border-white/[0.08] px-3 py-1 rounded-full group-hover:bg-white/[0.10] transition-colors">
              {businessProfile?.brand_type || profile?.business_type}
            </span>
          )}
        </button>

        {/* ── IDENTITY ROW ── */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            <div
              className="rounded-full p-[3px] shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b, #3b82f6, #6366f1, #8b5cf6)",
              }}
            >
              {businessProfile?.ig_profile_picture_url ? (
                <Image
                  src={businessProfile.ig_profile_picture_url}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover border-[3px] border-[#111112]"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-[3px] border-[#111112] bg-[#1e1e1e] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white/60">
                    {initials}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-white truncate">
                {displayName || "Your Business"}
              </h1>
              {hasPhone && <RealReachVerifiedBadge />}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {businessProfile?.ig_username && businessProfile.instagram_url && (
                <a
                  href={businessProfile.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-pink-400/80 hover:text-pink-300 transition-colors"
                >
                  @{businessProfile.ig_username}
                </a>
              )}
              {businessProfile?.ig_username && profile?.full_name && (
                <span className="text-white/20 text-xs">·</span>
              )}
              {profile?.full_name && (
                <span className="inline-flex items-center gap-1.5 text-sm text-white/50">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  {profile.full_name}
                </span>
              )}
              {profile?.full_name && location && (
                <span className="text-white/20 text-xs">·</span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1.5 text-sm text-white/50">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── CAMPAIGN SUMMARY ── */}
        <div className="flex items-center gap-4 px-1">
          <div className="text-center">
            <p className="text-lg font-extrabold">{totalCampaigns}</p>
            <p className="text-[11px] text-white/40">Campaigns</p>
          </div>
          <div className="h-8 w-px bg-white/[0.08]" />
          <div className="text-center">
            <p className="text-lg font-extrabold">
              {totalSpent > 0 ? `₹${totalSpent.toLocaleString()}` : "₹0"}
            </p>
            <p className="text-[11px] text-white/40">Total Spent</p>
          </div>
          {profile?.email && (
            <>
              <div className="h-8 w-px bg-white/[0.08]" />
              <p className="text-xs text-white/30 truncate">{profile.email}</p>
            </>
          )}
        </div>
      </div>
    </m.div>
  );
}
