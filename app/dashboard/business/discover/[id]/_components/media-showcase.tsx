"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Users, Video } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import type { Database } from "@/lib/supabase/types";
import type { ShowcaseFallbackItem } from "./showcase-constants";

type MediaRow = Database["public"]["Tables"]["instagram_media"]["Row"];

interface MediaShowcaseProps {
  showcaseItems: MediaRow[];
  showcaseFallback: ShowcaseFallbackItem[];
  formatStat: (value: number | null | undefined) => string;
}

function ShowcaseMediaImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <ImageIcon className="h-8 w-8 text-slate-400" />
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
  );
}

export function MediaShowcase({
  showcaseItems,
  showcaseFallback,
  formatStat,
}: MediaShowcaseProps) {
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const hasMedia = showcaseItems.length > 0;
  const fallbackItems = showcaseFallback.slice(0, 3);
  const total = hasMedia ? showcaseItems.length : fallbackItems.length;

  const activeItem = hasMedia
    ? showcaseItems[showcaseIndex % total]
    : fallbackItems[showcaseIndex % total];
  const activeMedia = hasMedia ? (activeItem as MediaRow) : null;
  const activeFallback = !hasMedia
    ? (activeItem as ShowcaseFallbackItem)
    : null;

  if (total === 0) return null;

  return (
    <div className="sm:hidden space-y-4">
      <div className="relative aspect-[0.8] w-full overflow-hidden rounded-[28px] border border-white/12 bg-[#080609] shadow-[0_28px_80px_rgba(0,0,0,0.46)]">
        {hasMedia ? (
          <ShowcaseMediaImage
            src={activeMedia?.thumbnail_url || activeMedia?.media_url || null}
            alt={activeMedia?.caption?.slice(0, 60) || "Content preview"}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
              {activeFallback?.type === "Reel" ? (
                <Video className="h-12 w-12" />
              ) : (
                <ImageIcon className="h-12 w-12" />
              )}
              <span className="text-xs font-medium uppercase tracking-wider">
                {activeFallback?.type}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,8,0)_0%,rgba(3,5,8,0.35)_52%,rgba(3,5,8,0.9)_100%)]" />
        <div className="absolute inset-x-3 bottom-3 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(40,44,49,0.24)_0%,rgba(12,14,19,0.9)_100%)] px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-lg">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
            {hasMedia
              ? activeMedia?.media_type || "Content"
              : activeFallback?.type}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-white/80">
            {hasMedia
              ? activeMedia?.caption || "Creator content highlight."
              : activeFallback?.caption}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" />
              {hasMedia
                ? formatStat(activeMedia?.like_count)
                : activeFallback?.likes}
            </span>
            <span className="flex items-center gap-1">
              <Video className="h-3.5 w-3.5" />
              {hasMedia
                ? formatStat(activeMedia?.comments_count)
                : activeFallback?.comments}
            </span>
            {!hasMedia && activeFallback?.views ? (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {activeFallback.views}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-3">
        <ShinyButton
          onClick={() =>
            setShowcaseIndex((prev) => (total ? (prev - 1 + total) % total : 0))
          }
          className="flex h-12 w-12 items-center justify-center rounded-[20px] border-white/14 bg-white/5 px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <Image
            src="/back.png"
            alt="Previous content"
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain"
          />
        </ShinyButton>
        <div className="min-w-18 text-center">
          <span className="text-sm font-medium tabular-nums text-white/78">
            {total ? showcaseIndex + 1 : 0}
          </span>
          <span className="px-1 text-white/22">/</span>
          <span className="text-sm tabular-nums text-white/48">{total}</span>
        </div>
        <ShinyButton
          onClick={() =>
            setShowcaseIndex((prev) => (total ? (prev + 1) % total : 0))
          }
          className="flex h-12 w-12 items-center justify-center rounded-[20px] border-white/14 bg-white/5 px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <Image
            src="/next.png"
            alt="Next content"
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain"
          />
        </ShinyButton>
      </div>
    </div>
  );
}
