"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Pencil,
  Plus,
} from "lucide-react";
import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import type { Database } from "@/lib/supabase/types";

type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

interface PortfolioSectionProps {
  media: InstagramMedia[];
}

export default function PortfolioSection({ media }: PortfolioSectionProps) {
  // Show empty slots if fewer than 3
  const minSlots = 3;
  const emptySlots = Math.max(0, minSlots - media.length);

  if (media.length === 0 && emptySlots === 0) return null;

  return (
    <m.div variants={fadeUp}>
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Portfolio Highlights
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground -mr-2 h-7 text-xs"
            asChild
          >
            <Link href="/dashboard/influencer/complete-profile?step=3">
              <Pencil className="mr-1 h-3 w-3" /> Edit
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {media.map((item) => {
            const imgSrc = item.thumbnail_url || item.media_url;
            return (
              <a
                key={item.ig_media_id}
                href={item.permalink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden bg-secondary transition-transform hover:scale-[1.03]"
              >
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={item.caption?.slice(0, 50) || "Portfolio"}
                    fill
                    sizes="(max-width: 768px) 33vw, 200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <div className="flex items-center gap-2 text-[10px] text-white">
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-2.5 w-2.5" /> {item.like_count ?? 0}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}

          {/* Empty placeholder slots */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <Link
              key={`empty-${i}`}
              href="/dashboard/influencer/complete-profile?step=3"
              className="aspect-square rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center transition-colors hover:border-white/20 hover:bg-white/[0.04]"
            >
              <Plus className="h-5 w-5 text-muted-foreground/50" />
            </Link>
          ))}
        </div>
      </div>
    </m.div>
  );
}
