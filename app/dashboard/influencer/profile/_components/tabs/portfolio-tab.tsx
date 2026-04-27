"use client";

import { useState } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  X,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useInstagramMedia } from "@/hooks/queries/use-instagram-media";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

interface PortfolioTabProps {
  profile: InfluencerProfile;
  portfolioMedia: InstagramMedia[];
  userId: string;
}

export default function PortfolioTab({
  profile,
  portfolioMedia,
  userId,
}: PortfolioTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    profile.portfolio_media_ids || [],
  );
  const [brands, setBrands] = useState<string[]>(profile.previous_brands || []);
  const [brandInput, setBrandInput] = useState("");

  const updateProfile = useUpdateInfluencerProfile();
  const { data: allMedia } = useInstagramMedia(isEditing ? userId : undefined);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        portfolioMediaIds: selectedIds,
        previousBrands: brands,
      });
      toast.success("Portfolio updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleCancel = () => {
    setSelectedIds(profile.portfolio_media_ids || []);
    setBrands(profile.previous_brands || []);
    setBrandInput("");
    setIsEditing(false);
  };

  const toggleMedia = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 6
          ? [...prev, id]
          : prev,
    );
  };

  const addBrand = () => {
    const trimmed = brandInput.trim();
    if (trimmed && !brands.includes(trimmed)) {
      setBrands((prev) => [...prev, trimmed]);
      setBrandInput("");
    }
  };

  const removeBrand = (brand: string) => {
    setBrands((prev) => prev.filter((b) => b !== brand));
  };

  const hasPortfolio =
    portfolioMedia.length > 0 ||
    (profile.portfolio_media_ids && profile.portfolio_media_ids.length > 0);

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      {/* Portfolio Media */}
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Portfolio Highlights
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
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Select up to 6 posts ({selectedIds.length}/6)
              </p>
              {allMedia && allMedia.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {allMedia.map((item) => {
                    const imgSrc = item.thumbnail_url || item.media_url;
                    const selected = selectedIds.includes(item.ig_media_id);
                    return (
                      <button
                        key={item.ig_media_id}
                        onClick={() => toggleMedia(item.ig_media_id)}
                        className={cn(
                          "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                          selected
                            ? "border-primary"
                            : "border-transparent opacity-70 hover:opacity-100",
                          !selected &&
                            selectedIds.length >= 6 &&
                            "cursor-not-allowed opacity-40",
                        )}
                        disabled={!selected && selectedIds.length >= 6}
                      >
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={item.caption?.slice(0, 30) || "Media"}
                            fill
                            sizes="(max-width: 768px) 33vw, 150px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        {selected && (
                          <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No Instagram media found
                </p>
              )}

              {/* Brands edit section within same card */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Worked With
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Brand name"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addBrand()}
                    className="h-9 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addBrand}
                    className="h-9 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {brands.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => (
                      <span
                        key={brand}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm"
                      >
                        {brand}
                        <button
                          onClick={() => removeBrand(brand)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {hasPortfolio ? (
                <div className="grid grid-cols-3 gap-2">
                  {portfolioMedia.map((item) => {
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
                              <Heart className="h-2.5 w-2.5" />{" "}
                              {item.like_count ?? 0}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                  {/* Empty slots to show minimum 3 */}
                  {Array.from({
                    length: Math.max(0, 3 - portfolioMedia.length),
                  }).map((_, i) => (
                    <button
                      key={`empty-${i}`}
                      onClick={() => setIsEditing(true)}
                      className="aspect-square rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center transition-colors hover:border-white/20 hover:bg-white/4"
                    >
                      <Plus className="h-5 w-5 text-muted-foreground/50" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No portfolio posts selected
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-xs"
                  >
                    <Plus className="mr-1.5 h-3 w-3" /> Add portfolio
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </m.div>

      {/* Previous brands (view only when not editing) */}
      {!isEditing && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Worked With
            </p>
            {profile.previous_brands && profile.previous_brands.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.previous_brands.map((brand) => (
                  <Badge
                    key={brand}
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-sm"
                  >
                    {brand}
                  </Badge>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full text-center text-sm text-muted-foreground py-2 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-colors"
              >
                Add brands you&apos;ve collaborated with
              </button>
            )}
          </div>
        </m.div>
      )}
    </m.div>
  );
}
