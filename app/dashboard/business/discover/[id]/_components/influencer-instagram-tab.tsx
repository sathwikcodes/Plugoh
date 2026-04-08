import { Image as ImageIcon, Video } from "lucide-react";
import { InstagramEmbed } from "@/components/shared/instagram-embed";
import type { Database } from "@/lib/supabase/types";
import type { ShowcaseFallbackItem } from "./showcase-constants";

type MediaRow = Database["public"]["Tables"]["instagram_media"]["Row"];

interface InfluencerInstagramTabProps {
  topMedia: MediaRow[] | null;
  showcaseFallback: ShowcaseFallbackItem[];
}

export function InfluencerInstagramTab({
  topMedia,
  showcaseFallback,
}: InfluencerInstagramTabProps) {
  if (topMedia && topMedia.length > 0) {
    return (
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {topMedia
          .slice(0, 3)
          .map((item) =>
            item.permalink ? (
              <InstagramEmbed
                key={item.ig_media_id}
                permalink={item.permalink}
              />
            ) : null,
          )}
      </div>
    );
  }

  return (
    <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
      {showcaseFallback.slice(0, 3).map((item) => (
        <div
          key={`fallback-${item.type}-${item.likes}`}
          className="rounded-2xl border border-slate-800/70 bg-slate-900/60 overflow-hidden"
        >
          <div className="relative aspect-square bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
              {item.type === "Reel" ? (
                <Video className="h-10 w-10" />
              ) : (
                <ImageIcon className="h-10 w-10" />
              )}
              <span className="text-xs font-medium uppercase tracking-wider">
                {item.type}
              </span>
            </div>
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 shadow-sm border border-slate-700/70">
                Sample
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
              {item.caption}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {item.likes}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {item.comments}
              </span>
              {item.views ? (
                <span className="flex items-center gap-1">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {item.views}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
