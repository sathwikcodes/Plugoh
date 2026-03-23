"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Eye,
  Users,
  Heart,
  MapPin,
  Globe,
  Instagram,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TURNAROUND_LABELS } from "@/lib/constants";
import type { FormState, InfluencerProfile, InstagramMedia } from "./types";

interface StepPreviewProps {
  state: FormState;
  ip: InfluencerProfile;
  media: InstagramMedia[];
  completeness: number;
  canLive: boolean;
}

function formatNum(n: number | null) {
  if (!n) return "\u2014";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function StepPreview({
  state,
  ip,
  media,
  completeness,
  canLive,
}: StepPreviewProps) {
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Preview Your Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          This is exactly what brands see when they find you.
        </p>
      </div>

      {/* Preview Card */}
      <div className="rounded-xl border bg-card p-5 space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold">
              {state.displayName || "Your Name"}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
              {state.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {state.city}
                </span>
              )}
              {state.category && (
                <Badge variant="secondary">{state.category}</Badge>
              )}
              {state.languages.length > 0 && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {state.languages.join(", ")}
                </span>
              )}
            </div>
          </div>
          {ip?.instagram_handle && (
            <span className="flex items-center gap-1.5 text-sm text-primary">
              <Instagram className="h-4 w-4" /> @{ip.instagram_handle}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-secondary p-3 text-center">
            <Users className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-lg font-bold">
              {formatNum(ip?.follower_count ?? null)}
            </p>
            <p className="text-[10px] text-muted-foreground">Followers</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <Eye className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-lg font-bold">
              {formatNum(ip?.avg_views_per_reel ?? null)}
            </p>
            <p className="text-[10px] text-muted-foreground">Avg Views</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <Heart className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-lg font-bold">
              {formatNum(ip?.avg_likes_per_reel ?? null)}
            </p>
            <p className="text-[10px] text-muted-foreground">Avg Likes</p>
          </div>
        </div>

        {/* Content Types */}
        {state.contentTypes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Content Types
            </p>
            <div className="flex flex-wrap gap-1.5">
              {state.contentTypes.map((ct) => (
                <Badge key={ct} variant="outline" className="text-xs">
                  {ct}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Turnaround */}
        {state.turnaroundTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Delivers in{" "}
            {TURNAROUND_LABELS[state.turnaroundTime] || state.turnaroundTime}
          </div>
        )}

        {/* Pricing */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Reel", value: state.priceReel },
            { label: "Post", value: state.pricePost },
            { label: "Story", value: state.priceStory },
          ].map((pkg) => (
            <div key={pkg.label} className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">{pkg.label}</p>
              <p className="text-lg font-bold">
                {pkg.value
                  ? `\u20B9${Number(pkg.value).toLocaleString()}`
                  : "\u2014"}
              </p>
            </div>
          ))}
        </div>

        {/* Bio */}
        {state.bio && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              About
            </p>
            <p className="text-sm leading-relaxed">{state.bio}</p>
          </div>
        )}

        {/* Portfolio Preview */}
        {state.portfolioIds.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Portfolio Highlights
            </p>
            <div className="grid grid-cols-3 gap-2">
              {state.portfolioIds.map((id) => {
                const item = media.find((m) => m.ig_media_id === id);
                const imgSrc = item?.thumbnail_url || item?.media_url;
                return (
                  <div
                    key={id}
                    className="aspect-square rounded-lg overflow-hidden bg-secondary"
                  >
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt="Portfolio"
                        fill
                        sizes="(max-width: 768px) 33vw, 150px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Previous Brands */}
        {state.previousBrands.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Worked With
            </p>
            <div className="flex flex-wrap gap-1.5">
              {state.previousBrands.map((brand) => (
                <Badge key={brand} variant="secondary">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completeness summary */}
      <div
        className={cn(
          "rounded-lg border p-4 text-center",
          canLive
            ? "border-green-500/30 bg-green-500/5"
            : "border-yellow-500/30 bg-yellow-500/5",
        )}
      >
        <p className="text-sm font-medium">
          {canLive
            ? `Your profile is ${completeness}% complete. Ready to go live!`
            : "Add a display name, category, and at least one price to go live."}
        </p>
      </div>
    </>
  );
}
