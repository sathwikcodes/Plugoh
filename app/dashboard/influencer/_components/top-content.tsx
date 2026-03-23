"use client";

import {
  Instagram,
  Heart,
  MessageCircle,
  Bookmark,
  ImageIcon,
} from "lucide-react";
import { compactNumber, timeAgo } from "@/lib/format";

export interface TopContentItem {
  id: string;
  permalink: string | null;
  thumbnail_url: string | null;
  media_url: string | null;
  media_type: string | null;
  like_count: number | null;
  comments_count: number | null;
  saves: number | null;
  timestamp: string | null;
  performanceScore: number;
}

interface TopContentProps {
  items: TopContentItem[];
  totalMediaCount: number;
}

export function TopContent({ items, totalMediaCount }: TopContentProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Top Performing Content</h2>
        {totalMediaCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {totalMediaCount} posts synced
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-10 text-center">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 mb-4">
            <Instagram className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-semibold">No content yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Your top performing posts will appear here once your Instagram is
            synced.
          </p>
        </div>
      ) : (
        <div
          className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={item.permalink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-[200px] sm:w-[220px] rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden group transition-all hover:border-white/20 hover:scale-[1.02]"
            >
              {/* Image */}
              <div className="relative aspect-square bg-white/5">
                {item.thumbnail_url || item.media_url ? (
                  <img
                    src={(item.thumbnail_url || item.media_url)!}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                {/* Media type badge */}
                <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-white/90 font-medium">
                  {item.media_type === "VIDEO"
                    ? "Reel"
                    : item.media_type === "CAROUSEL_ALBUM"
                      ? "Carousel"
                      : "Post"}
                </span>
                {/* Stats overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                  <div className="flex items-center gap-3 text-[11px] text-white/90">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {compactNumber(item.like_count || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {compactNumber(item.comments_count || 0)}
                    </span>
                    {(item.saves ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        {compactNumber(item.saves!)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">
                  {item.timestamp ? timeAgo(item.timestamp) : "—"}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
