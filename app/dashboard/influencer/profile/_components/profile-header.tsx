"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Instagram, MapPin, Globe, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

interface ProfileHeaderProps {
  profile: InfluencerProfile;
  fullName?: string | null;
  onToggleActive: (active: boolean) => void;
  isToggling: boolean;
}

export default function ProfileHeader({
  profile,
  fullName,
  onToggleActive,
  isToggling,
}: ProfileHeaderProps) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const initials = (profile.display_name || fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleToggle = (checked: boolean) => {
    if (!checked) {
      setShowDeactivateDialog(true);
    } else {
      onToggleActive(true);
    }
  };

  return (
    <>
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
          {/* Top row: Edit button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground -mt-1 -mr-2"
              asChild
            >
              <Link href="/dashboard/influencer/complete-profile">
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Link>
            </Button>
          </div>

          {/* Avatar + Identity */}
          <div className="flex items-start gap-4 -mt-2">
            <div className="shrink-0">
              <div
                className="rounded-full p-[2.5px]"
                style={{
                  background:
                    "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
                }}
              >
                {profile.ig_profile_picture_url ? (
                  <Image
                    src={profile.ig_profile_picture_url}
                    alt={profile.display_name || "Profile"}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-full object-cover border-2 border-background"
                  />
                ) : (
                  <div className="h-[72px] w-[72px] rounded-full border-2 border-background bg-card flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="text-xl font-extrabold tracking-tight truncate">
                {profile.display_name || fullName || "Creator"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                {profile.instagram_handle && (
                  <a
                    href={
                      profile.instagram_url ||
                      `https://instagram.com/${profile.instagram_handle}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    <Instagram className="h-3.5 w-3.5" /> @
                    {profile.instagram_handle}
                  </a>
                )}
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {profile.city}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {profile.category && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 text-xs"
                  >
                    {profile.category}
                  </Badge>
                )}
                {profile.languages && profile.languages.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />{" "}
                    {profile.languages.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Instagram Stats (compact) */}
          {(profile.follower_count ||
            profile.avg_views_per_reel ||
            profile.avg_likes_per_reel) && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {profile.follower_count && (
                <span>
                  <span className="font-semibold text-foreground">
                    {formatCompact(profile.follower_count)}
                  </span>{" "}
                  followers
                </span>
              )}
              {profile.avg_views_per_reel && (
                <span>
                  <span className="font-semibold text-foreground">
                    {formatCompact(profile.avg_views_per_reel)}
                  </span>{" "}
                  avg views
                </span>
              )}
              {profile.avg_likes_per_reel && (
                <span>
                  <span className="font-semibold text-foreground">
                    {formatCompact(profile.avg_likes_per_reel)}
                  </span>{" "}
                  avg likes
                </span>
              )}
            </div>
          )}

          {/* Visibility Toggle */}
          <div
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2.5",
              profile.is_active
                ? "bg-green-500/10"
                : "bg-amber-500/10",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  profile.is_active ? "bg-green-500" : "bg-amber-500",
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  profile.is_active ? "text-green-400" : "text-amber-400",
                )}
              >
                {profile.is_active
                  ? "Visible to brands"
                  : "Hidden from brands"}
              </span>
            </div>
            <Switch
              checked={!!profile.is_active}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
      </motion.div>

      <AlertDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide your profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Brands won&apos;t be able to discover you while your profile is
              hidden. You can turn it back on anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onToggleActive(false)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Hide Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}
