"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, X, Clock, Loader2, Check } from "lucide-react";
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
}

export default function PricingTab({ profile, userId }: PricingTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    price_per_reel: profile.price_per_reel?.toString() || "",
    price_per_post: profile.price_per_post?.toString() || "",
    price_per_story: profile.price_per_story?.toString() || "",
    content_types: profile.content_types || [],
    turnaround_time: profile.turnaround_time || "",
  });

  const updateProfile = useUpdateInfluencerProfile();

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        userId,
        data: {
          price_per_reel: form.price_per_reel
            ? Number(form.price_per_reel)
            : null,
          price_per_post: form.price_per_post
            ? Number(form.price_per_post)
            : null,
          price_per_story: form.price_per_story
            ? Number(form.price_per_story)
            : null,
          content_types: form.content_types,
          turnaround_time: form.turnaround_time || null,
        },
      });
      toast.success("Pricing updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleCancel = () => {
    setForm({
      price_per_reel: profile.price_per_reel?.toString() || "",
      price_per_post: profile.price_per_post?.toString() || "",
      price_per_story: profile.price_per_story?.toString() || "",
      content_types: profile.content_types || [],
      turnaround_time: profile.turnaround_time || "",
    });
    setIsEditing(false);
  };

  const toggleContentType = (ct: string) => {
    setForm((prev) => ({
      ...prev,
      content_types: prev.content_types.includes(ct)
        ? prev.content_types.filter((c) => c !== ct)
        : [...prev.content_types, ct],
    }));
  };

  const hasAnyPrice =
    profile.price_per_reel || profile.price_per_post || profile.price_per_story;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rate Card
            </p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={handleCancel}
                  disabled={updateProfile.isPending}
                >
                  <X className="mr-1 h-3 w-3" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSave}
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
                className="text-muted-foreground -mr-2 h-7 text-xs"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-1 h-3 w-3" /> Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            /* Edit mode */
            <div className="space-y-5">
              {/* Price inputs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Reel", key: "price_per_reel" as const },
                  { label: "Post", key: "price_per_post" as const },
                  { label: "Story", key: "price_per_story" as const },
                ].map((pkg) => (
                  <div key={pkg.label} className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      {pkg.label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form[pkg.key]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [pkg.key]: e.target.value,
                          }))
                        }
                        className="pl-7 text-sm h-9"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Content types */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Content Types (select all that apply)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CONTENT_TYPES.map((ct) => (
                    <button
                      key={ct}
                      onClick={() => toggleContentType(ct)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                        form.content_types.includes(ct)
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20",
                      )}
                    >
                      {ct}
                    </button>
                  ))}
                </div>
              </div>

              {/* Turnaround */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Turnaround Time</p>
                <div className="flex flex-wrap gap-2">
                  {TURNAROUND_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, turnaround_time: opt }))
                      }
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                        form.turnaround_time === opt
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20",
                      )}
                    >
                      {TURNAROUND_LABELS[opt]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : hasAnyPrice ? (
            /* View mode */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Reel", value: profile.price_per_reel },
                  { label: "Post", value: profile.price_per_post },
                  { label: "Story", value: profile.price_per_story },
                ].map((pkg) => (
                  <div
                    key={pkg.label}
                    className={cn(
                      "rounded-xl border p-3 text-center",
                      pkg.value
                        ? "border-white/10"
                        : "border-white/5 opacity-40",
                    )}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {pkg.label}
                    </p>
                    <p className="text-lg font-extrabold">
                      {pkg.value ? `₹${pkg.value.toLocaleString()}` : "—"}
                    </p>
                  </div>
                ))}
              </div>

              {profile.content_types && profile.content_types.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Content Types
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.content_types.map((ct) => (
                      <Badge
                        key={ct}
                        variant="outline"
                        className="rounded-full border-white/10 bg-white/5 text-xs"
                      >
                        {ct}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.turnaround_time && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Delivers in{" "}
                  {TURNAROUND_LABELS[profile.turnaround_time] ||
                    profile.turnaround_time.replace(/_/g, " ")}
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                No pricing set yet
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs"
              >
                <Pencil className="mr-1.5 h-3 w-3" /> Set your rates
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
