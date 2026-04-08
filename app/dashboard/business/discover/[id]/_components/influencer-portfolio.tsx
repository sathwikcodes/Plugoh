import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/supabase/types";

type MediaRow = Database["public"]["Tables"]["instagram_media"]["Row"];

interface PortfolioGridProps {
  media: MediaRow[];
  onSelect: (item: MediaRow) => void;
}

export function PortfolioGrid({ media, onSelect }: PortfolioGridProps) {
  return (
    <div className="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-3">
      {media.slice(0, 3).map((item) => {
        const imageSource = item.thumbnail_url || item.media_url;
        return (
          <button
            key={item.ig_media_id}
            type="button"
            onClick={() => onSelect(item)}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/50"
          >
            {imageSource ? (
              <Image
                src={imageSource}
                alt={item.caption?.slice(0, 50) || "Portfolio"}
                fill
                sizes="(max-width: 768px) 50vw, 220px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-5 w-5 text-slate-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        );
      })}
    </div>
  );
}

interface PortfolioDialogProps {
  activeMedia: MediaRow | null;
  onClose: () => void;
  formatStat: (value: number | null | undefined) => string;
}

export function PortfolioDialog({
  activeMedia,
  onClose,
  formatStat,
}: PortfolioDialogProps) {
  const activeImage = activeMedia?.media_url || activeMedia?.thumbnail_url;

  return (
    <Dialog
      open={!!activeMedia}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-3xl border border-slate-200 bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-lg">Portfolio detail</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={activeMedia?.caption?.slice(0, 60) || "Portfolio"}
                fill
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-6 w-6 text-slate-400" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Caption
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {activeMedia?.caption || "No caption available."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Likes
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatStat(activeMedia?.like_count)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Comments
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatStat(activeMedia?.comments_count)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Reach
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatStat(activeMedia?.reach)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Impressions
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatStat(activeMedia?.impressions)}
                </p>
              </div>
            </div>
            {activeMedia?.permalink ? (
              <Button
                asChild
                className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                <a
                  href={activeMedia.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Instagram
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
