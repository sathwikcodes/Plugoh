"use client";

import { m, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SkeletonTab = "instagram" | "pricing" | "career";

/* ─── AI Status Banner ─────────────────────────────────────────────────────── */

export function AIStatusBanner({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <m.div
          key="ai-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs text-muted-foreground"
            style={{
              background:
                "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.08), rgba(59,130,246,0.08))",
              border: "1px solid transparent",
              backgroundClip: "padding-box",
              boxShadow:
                "0 0 0 1px rgba(168,85,247,0.25), 0 2px 12px rgba(168,85,247,0.12)",
            }}
          >
            <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />
            <span className="font-medium">
              AI is analyzing your Instagram...
            </span>
            <span className="flex items-center gap-0.5 ml-0.5">
              {[0, 200, 400].map((delay, i) => (
                <span
                  key={i}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400"
                  style={{
                    animation: "bounce 1s ease-in-out infinite",
                    animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Per-tab skeleton content ─────────────────────────────────────────────── */

function InstagramSkeleton() {
  return (
    <div className="space-y-4">
      {/* Account header */}
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-xl border border-white/5 bg-card/60 p-3 space-y-2 ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function PricingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-28" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CareerSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileTabSkeleton({ tab }: { tab: SkeletonTab }) {
  return (
    <m.div
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {tab === "instagram" && <InstagramSkeleton />}
      {tab === "pricing" && <PricingSkeleton />}
      {tab === "career" && <CareerSkeleton />}
    </m.div>
  );
}
