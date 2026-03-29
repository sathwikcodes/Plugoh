"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Diamond,
  Pencil,
  X,
  Clock,
  Loader2,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CONTENT_TYPES,
  TURNAROUND_OPTIONS,
  TURNAROUND_LABELS,
} from "@/lib/constants";
import { useUpdateInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

interface PricingTabProps {
  profile: InfluencerProfile;
  userId: string;
  showSkeleton?: boolean;
}

function PricingSkeletonCards() {
  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Per-card config ────────────────────────────────────────────────────────

const CARD_CONFIG = [
  {
    key: "reel" as const,
    title: "Instagram Reel",
    subtitle: "Short-form video",
    description:
      "High-energy vertical video (15–90 sec) crafted for the Reels feed — algorithm-boosted and designed to stop the scroll.",
    features: [
      "Algorithm-boosted reach",
      "Trending audio & transitions",
      "15–90 sec creative video",
      "Brand story narrative",
    ],
    profileKey: "price_per_reel" as const,
    min: 1000,
    max: 200000,
    step: 500,
    default: 5000,
  },
  {
    key: "post" as const,
    title: "Feed Post",
    subtitle: "Static or carousel",
    description:
      "Polished image or carousel post with strategic caption copy and hashtag research — long shelf life on the grid.",
    features: [
      "Carousel or single image",
      "Strategic caption copy",
      "Hashtag optimisation",
      "Long-term feed presence",
    ],
    profileKey: "price_per_post" as const,
    min: 500,
    max: 100000,
    step: 500,
    default: 3000,
  },
  {
    key: "story" as const,
    title: "Instagram Story",
    subtitle: "24-hr ephemeral content",
    description:
      "Authentic, full-screen story content that drives direct engagement, swipe-ups, and real-time product interest.",
    features: [
      "24-hr ephemeral content",
      "Direct swipe-up engagement",
      "Poll & quiz stickers",
      "Raw & authentic feel",
    ],
    profileKey: "price_per_story" as const,
    min: 500,
    max: 50000,
    step: 500,
    default: 1500,
  },
] as const;

// ─── Histogram Slider ────────────────────────────────────────────────────────

interface HistogramSliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function HistogramSlider({
  value,
  min,
  max,
  step,
  onChange,
}: HistogramSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate 40 smooth bars once — stable across renders (empty deps intentional)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bars = useMemo(() => {
    const raw = Array.from({ length: 40 }, () => Math.random());
    // Two smoothing passes for a natural equalizer look
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i < raw.length - 1; i++) {
        raw[i] = (raw[i - 1] + raw[i] + raw[i + 1]) / 3;
      }
    }
    const maxH = Math.max(...raw);
    // Floor at 0.15 so no bar vanishes completely
    return raw.map((v) => Math.max(0.15, v / maxH));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = ((value - min) / (max - min)) * 100;

  const calculateValue = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(100, ((clientX - rect.left) / rect.width) * 100),
      );
      const raw = min + (pct / 100) * (max - min);
      onChange(Math.max(min, Math.min(max, Math.round(raw / step) * step)));
    },
    [min, max, step, onChange],
  );

  // Document-level drag listeners — added only while dragging
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      calculateValue(clientX);
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
    };
  }, [isDragging, calculateValue]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-16 cursor-pointer select-none"
      onMouseDown={(e) => {
        setIsDragging(true);
        calculateValue(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        calculateValue(e.touches[0].clientX);
      }}
    >
      {/* Histogram bars — sit above the thumb */}
      <div
        className="absolute inset-x-0 top-0 flex items-end gap-px"
        style={{ bottom: 14 }}
      >
        {bars.map((height, i) => {
          const barPct = (i / (bars.length - 1)) * 100;
          const isActive = barPct <= progress;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-[2px] transition-colors duration-75",
                isActive ? "bg-primary opacity-90" : "bg-white/15",
              )}
              style={{ height: `${height * 100}%` }}
            />
          );
        })}
      </div>

      {/* Thumb */}
      <div
        className={cn(
          "absolute bottom-0 w-5 h-5 -translate-x-1/2 rounded-full bg-primary",
          "shadow-[0_0_0_3px_hsl(var(--background)),0_0_0_5px_hsl(var(--primary)/0.35)]",
          isDragging ? "cursor-grabbing scale-110" : "cursor-grab",
          "transition-transform duration-75",
        )}
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}

// ─── Individual Pricing Slider Card ─────────────────────────────────────────

interface PricingSliderCardProps {
  title: string;
  subtitle: string;
  description: string;
  features: readonly string[];
  initialPrice: number;
  min: number;
  max: number;
  step: number;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (price: number) => void;
}

function PricingSliderCard({
  title,
  subtitle,
  description,
  features,
  initialPrice,
  min,
  max,
  step,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: PricingSliderCardProps) {
  const [draft, setDraft] = useState(initialPrice);

  // Reset draft when editing is cancelled or initialPrice changes externally
  useEffect(() => {
    if (!isEditing) setDraft(initialPrice);
  }, [isEditing, initialPrice]);

  // Displayed price: raw draft while editing (instant), saved price when not
  const displayPrice = isEditing ? draft : initialPrice;

  return (
    // No whileHover — removed zoom animation as requested
    <m.div
      variants={fadeUp}
      className="flex flex-col rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md"
    >
      <div className="flex flex-col gap-4 p-5 flex-1">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <m.img
            src="/coin.png"
            alt="coin"
            width={52}
            height={52}
            className="select-none shrink-0"
            animate={
              isEditing ? { rotate: -8, scale: 1.05 } : { rotate: 0, scale: 1 }
            }
            transition={{
              type: "spring" as const,
              stiffness: 300,
              damping: 22,
            }}
          />
        </div>

        {/* Price — direct display, no spring lag */}
        <div>
          <p className="text-3xl font-extrabold tracking-tight tabular-nums">
            ₹{displayPrice.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            per {title.toLowerCase().replace("instagram ", "")}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Feature list */}
        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Diamond className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Slider — animates in/out */}
        <AnimatePresence initial={false}>
          {isEditing && (
            <m.div
              key="slider"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-2">
                <HistogramSlider
                  value={draft}
                  min={min}
                  max={max}
                  step={step}
                  onChange={setDraft}
                />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer CTA — plain conditional, no AnimatePresence to avoid dead-click window */}
      <div className="px-5 pb-5">
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 border border-white/10"
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="mr-1.5 h-3 w-3" /> Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onSave(draft)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              ) : (
                <Check className="mr-1.5 h-3 w-3" />
              )}
              Save
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-white/10 bg-white/5 hover:bg-white/10"
            onClick={onEdit}
          >
            <Pencil className="mr-1.5 h-3 w-3" /> Edit Price
          </Button>
        )}
      </div>
    </m.div>
  );
}

// ─── Main Pricing Tab ────────────────────────────────────────────────────────

export default function PricingTab({
  profile,
  userId,
  showSkeleton,
}: PricingTabProps) {
  if (showSkeleton) return <PricingSkeletonCards />;

  const [editingCard, setEditingCard] = useState<
    "reel" | "post" | "story" | null
  >(null);
  const [savingCard, setSavingCard] = useState<
    "reel" | "post" | "story" | null
  >(null);

  // Meta section (content types + turnaround)
  const [metaOpen, setMetaOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({
    content_types: profile.content_types || [],
    turnaround_time: profile.turnaround_time || "",
  });

  const updateProfile = useUpdateInfluencerProfile();

  const handleSavePrice = async (
    card: "reel" | "post" | "story",
    price: number,
  ) => {
    setSavingCard(card);
    const field = `price_per_${card}` as
      | "price_per_reel"
      | "price_per_post"
      | "price_per_story";
    try {
      await updateProfile.mutateAsync({
        userId,
        data: { [field]: price },
      });
      toast.success("Price updated");
      setEditingCard(null);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSavingCard(null);
    }
  };

  const handleSaveMeta = async () => {
    try {
      await updateProfile.mutateAsync({
        userId,
        data: {
          price_per_reel: profile.price_per_reel,
          price_per_post: profile.price_per_post,
          price_per_story: profile.price_per_story,
          content_types: metaForm.content_types,
          turnaround_time: metaForm.turnaround_time || null,
        },
      });
      toast.success("Settings updated");
      setEditingMeta(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const toggleContentType = (ct: string) => {
    setMetaForm((prev) => ({
      ...prev,
      content_types: prev.content_types.includes(ct)
        ? prev.content_types.filter((c) => c !== ct)
        : [...prev.content_types, ct],
    }));
  };

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      {/* Three pricing cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CARD_CONFIG.map((card) => {
          const currentPrice = profile[card.profileKey] ?? card.default;
          return (
            <PricingSliderCard
              key={card.key}
              title={card.title}
              subtitle={card.subtitle}
              description={card.description}
              features={card.features}
              initialPrice={currentPrice}
              min={card.min}
              max={card.max}
              step={card.step}
              isEditing={editingCard === card.key}
              isSaving={savingCard === card.key}
              onEdit={() => setEditingCard(card.key)}
              onCancel={() => setEditingCard(null)}
              onSave={(price) => handleSavePrice(card.key, price)}
            />
          );
        })}
      </div>

      {/* AI suggestion note */}
      {profile.price_per_reel && (
        <m.p
          variants={fadeUp}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
        >
          <Sparkles className="h-3 w-3 text-purple-400" />
          Suggested by Plugoh AI based on your engagement — edit anytime
        </m.p>
      )}

      {/* Content types + turnaround — collapsible */}
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden">
          {/* Toggle header */}
          <button
            className="flex w-full items-center justify-between p-4 text-left"
            onClick={() => setMetaOpen((o) => !o)}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Content Types & Turnaround
            </p>
            <m.div
              animate={{ rotate: metaOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </m.div>
          </button>

          <AnimatePresence initial={false}>
            {metaOpen && (
              <m.div
                key="meta-content"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                  {/* Edit toggle */}
                  <div className="flex justify-end">
                    {editingMeta ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => {
                            setMetaForm({
                              content_types: profile.content_types || [],
                              turnaround_time: profile.turnaround_time || "",
                            });
                            setEditingMeta(false);
                          }}
                          disabled={updateProfile.isPending}
                        >
                          <X className="mr-1 h-3 w-3" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleSaveMeta}
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="mr-1 h-3 w-3" />
                          )}
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => setEditingMeta(true)}
                      >
                        <Pencil className="mr-1 h-3 w-3" /> Edit
                      </Button>
                    )}
                  </div>

                  {/* Content types */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Content Types
                    </p>
                    {editingMeta ? (
                      <div className="flex flex-wrap gap-1.5">
                        {CONTENT_TYPES.map((ct) => (
                          <button
                            key={ct}
                            onClick={() => toggleContentType(ct)}
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                              metaForm.content_types.includes(ct)
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20",
                            )}
                          >
                            {ct}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(profile.content_types || []).length > 0 ? (
                          (profile.content_types || []).map((ct) => (
                            <Badge
                              key={ct}
                              variant="outline"
                              className="rounded-full border-white/10 bg-white/5 text-xs"
                            >
                              {ct}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            None set
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Turnaround time */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Turnaround Time
                    </p>
                    {editingMeta ? (
                      <div className="flex flex-wrap gap-2">
                        {TURNAROUND_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() =>
                              setMetaForm((prev) => ({
                                ...prev,
                                turnaround_time: opt,
                              }))
                            }
                            className={cn(
                              "rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                              metaForm.turnaround_time === opt
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20",
                            )}
                          >
                            {TURNAROUND_LABELS[opt]}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {profile.turnaround_time ? (
                          <span>
                            Delivers in{" "}
                            {TURNAROUND_LABELS[profile.turnaround_time] ||
                              profile.turnaround_time.replace(/_/g, " ")}
                          </span>
                        ) : (
                          <span className="text-xs">Not set</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>
    </m.div>
  );
}
