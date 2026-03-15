"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Package,
  Image as ImageIcon,
  Eye,
  X,
  Users,
  Heart,
  MapPin,
  Globe,
  Instagram,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  LANGUAGES,
  TURNAROUND_OPTIONS,
  TURNAROUND_LABELS,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

const CONTENT_TYPES = [
  "Reels",
  "Stories",
  "Static Posts",
  "UGC",
  "Product Reviews",
  "Tutorials",
  "Unboxing",
  "Behind the Scenes",
  "Event Coverage",
];

const STEPS = [
  { id: 1, label: "Profile", icon: Sparkles },
  { id: 2, label: "Packages", icon: Package },
  { id: 3, label: "Portfolio", icon: ImageIcon },
  { id: 4, label: "Preview", icon: Eye },
];

function calculateCompleteness(profile: InfluencerProfile): number {
  let score = 0;
  if (profile.display_name) score += 10;
  if (profile.bio) score += 10;
  if (profile.category) score += 10;
  if (profile.city) score += 5;
  if (profile.languages && profile.languages.length > 0) score += 5;
  if (
    profile.price_per_reel ||
    profile.price_per_post ||
    profile.price_per_story
  )
    score += 15;
  if (profile.content_types && profile.content_types.length > 0) score += 15;
  if (profile.turnaround_time) score += 5;
  if (profile.portfolio_media_ids && profile.portfolio_media_ids.length > 0)
    score += 15;
  if (profile.previous_brands && profile.previous_brands.length > 0)
    score += 10;
  return score;
}

function canGoLive(profile: InfluencerProfile): boolean {
  return !!(
    profile.display_name &&
    profile.category &&
    (profile.price_per_reel ||
      profile.price_per_post ||
      profile.price_per_story)
  );
}

export default function CompleteProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ip, setIp] = useState<InfluencerProfile | null>(null);
  const [media, setMedia] = useState<InstagramMedia[]>([]);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [priceReel, setPriceReel] = useState("");
  const [pricePost, setPricePost] = useState("");
  const [priceStory, setPriceStory] = useState("");
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [turnaroundTime, setTurnaroundTime] = useState("");
  const [portfolioIds, setPortfolioIds] = useState<string[]>([]);
  const [previousBrands, setPreviousBrands] = useState<string[]>([]);
  const [brandInput, setBrandInput] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [ipRes, mediaRes] = await Promise.all([
          supabase
            .from("influencer_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("instagram_media")
            .select("*")
            .eq("user_id", user.id)
            .order("timestamp", { ascending: false }),
        ]);
        if (ipRes.error) throw ipRes.error;
        if (mediaRes.error) throw mediaRes.error;
        if (ipRes.data) {
          const p = ipRes.data;
          setIp(p);
          setDisplayName(p.display_name || "");
          setBio(p.bio || "");
          setCategory(p.category || "");
          setCity(p.city || "");
          setLanguages(p.languages || []);
          setPriceReel(p.price_per_reel?.toString() || "");
          setPricePost(p.price_per_post?.toString() || "");
          setPriceStory(p.price_per_story?.toString() || "");
          setContentTypes(p.content_types || []);
          setTurnaroundTime(p.turnaround_time || "");
          setPortfolioIds(p.portfolio_media_ids || []);
          setPreviousBrands(p.previous_brands || []);
        }
        setMedia(mediaRes.data || []);
      } catch (err) {
        console.error("Failed to load profile data:", err);
        toast({
          title: "Failed to load profile data",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, toast]);

  const currentProfile = useCallback((): InfluencerProfile => {
    return {
      ...(ip as InfluencerProfile),
      display_name: displayName,
      bio,
      category,
      city,
      languages,
      price_per_reel: Number(priceReel) || null,
      price_per_post: Number(pricePost) || null,
      price_per_story: Number(priceStory) || null,
      content_types: contentTypes,
      turnaround_time: turnaroundTime,
      portfolio_media_ids: portfolioIds,
      previous_brands: previousBrands,
    };
  }, [
    ip,
    displayName,
    bio,
    category,
    city,
    languages,
    priceReel,
    pricePost,
    priceStory,
    contentTypes,
    turnaroundTime,
    portfolioIds,
    previousBrands,
  ]);

  const saveProgress = async () => {
    if (!ip) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("influencer_profiles")
        .update({
          display_name: displayName,
          bio,
          category,
          city,
          languages,
          price_per_reel: Number(priceReel) || null,
          price_per_post: Number(pricePost) || null,
          price_per_story: Number(priceStory) || null,
          content_types: contentTypes.length > 0 ? contentTypes : null,
          turnaround_time: turnaroundTime || null,
          portfolio_media_ids: portfolioIds.length > 0 ? portfolioIds : null,
          previous_brands: previousBrands.length > 0 ? previousBrands : null,
        })
        .eq("id", ip.id);
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveProgress();
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGoLive = async () => {
    if (!ip) return;
    const prof = currentProfile();
    if (!canGoLive(prof)) {
      toast({
        title: "Profile incomplete",
        description:
          "You need at least a display name, category, and one price to go live.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("influencer_profiles")
        .update({
          display_name: displayName,
          bio,
          category,
          city,
          languages,
          price_per_reel: Number(priceReel) || null,
          price_per_post: Number(pricePost) || null,
          price_per_story: Number(priceStory) || null,
          content_types: contentTypes.length > 0 ? contentTypes : null,
          turnaround_time: turnaroundTime || null,
          portfolio_media_ids: portfolioIds.length > 0 ? portfolioIds : null,
          previous_brands: previousBrands.length > 0 ? previousBrands : null,
          is_active: true,
        })
        .eq("id", ip.id);
      if (error) throw error;
      toast({
        title: ip?.is_active ? "Profile updated!" : "You're live!",
        description: ip?.is_active
          ? "Your changes have been saved."
          : "Brands can now discover your profile.",
      });
      router.push("/dashboard/influencer");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to go live";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleContentType = (ct: string) => {
    setContentTypes((prev) =>
      prev.includes(ct) ? prev.filter((t) => t !== ct) : [...prev, ct],
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const togglePortfolioItem = (mediaId: string) => {
    setPortfolioIds((prev) => {
      if (prev.includes(mediaId)) return prev.filter((id) => id !== mediaId);
      if (prev.length >= 6) {
        toast({
          title: "Max 6 items",
          description: "Remove one to add another.",
        });
        return prev;
      }
      return [...prev, mediaId];
    });
  };

  const addBrand = () => {
    const name = brandInput.trim();
    if (!name) return;
    if (previousBrands.includes(name)) {
      setBrandInput("");
      return;
    }
    setPreviousBrands((prev) => [...prev, name]);
    setBrandInput("");
  };

  const removeBrand = (name: string) => {
    setPreviousBrands((prev) => prev.filter((b) => b !== name));
  };

  useEffect(() => {
    if (!loading && !ip) {
      router.push("/dashboard/influencer");
    }
  }, [loading, ip, router]);

  if (loading || !ip) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const prof = currentProfile();
  const completeness = calculateCompleteness(prof);
  const canLive = canGoLive(prof);
  const formatNum = (n: number | null) => {
    if (!n) return "—";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground"
          onClick={() => router.push("/dashboard/influencer")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {ip?.is_active ? "Edit Your Profile" : "Complete Your Profile"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {ip?.is_active
            ? "Update your profile details. Changes are saved automatically."
            : "We pre-filled most fields from your Instagram. Review and adjust."}
        </p>
      </div>

      {/* Completeness Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Profile completeness</span>
          <span className="font-semibold">{completeness}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              completeness >= 80
                ? "bg-green-500"
                : completeness >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500",
            )}
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (isDone || isActive) setStep(s.id);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-primary/10 text-primary cursor-pointer"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-4 mx-1 shrink-0",
                    isDone ? "bg-primary" : "bg-secondary",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6 space-y-5">
          {/* STEP 1: Review Profile */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Review Your Profile
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  AI filled these from your Instagram. Adjust anything that
                  doesn&apos;t look right.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your creator name"
                    className="h-11"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={category}
                      onValueChange={(v) => setCategory(v ?? "")}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <Button
                        key={lang}
                        type="button"
                        variant={
                          languages.includes(lang) ? "default" : "outline"
                        }
                        size="sm"
                        className="h-8"
                        onClick={() => toggleLanguage(lang)}
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell brands about yourself..."
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Packages */}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Set Your Packages
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Brands filter by content type and delivery speed. Be specific.
                </p>
              </div>

              {/* Prices */}
              <div className="grid gap-4 grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs">₹ / Reel</Label>
                  <Input
                    type="number"
                    value={priceReel}
                    onChange={(e) => setPriceReel(e.target.value)}
                    placeholder="5000"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">₹ / Post</Label>
                  <Input
                    type="number"
                    value={pricePost}
                    onChange={(e) => setPricePost(e.target.value)}
                    placeholder="3000"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">₹ / Story</Label>
                  <Input
                    type="number"
                    value={priceStory}
                    onChange={(e) => setPriceStory(e.target.value)}
                    placeholder="1500"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Content Types */}
              <div className="space-y-2">
                <Label>Content You Create</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((ct) => (
                    <Button
                      key={ct}
                      type="button"
                      variant={
                        contentTypes.includes(ct) ? "default" : "outline"
                      }
                      size="sm"
                      className="h-8"
                      onClick={() => toggleContentType(ct)}
                    >
                      {ct}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Turnaround */}
              <div className="space-y-2">
                <Label>Typical Turnaround Time</Label>
                <Select
                  value={turnaroundTime}
                  onValueChange={(v) => setTurnaroundTime(v ?? "")}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="How fast do you deliver?" />
                  </SelectTrigger>
                  <SelectContent>
                    {TURNAROUND_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {TURNAROUND_LABELS[opt] || opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* STEP 3: Portfolio */}
          {step === 3 && (
            <>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Curate Your Portfolio
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Pick your best work (3-6 posts). Brands see these first.
                </p>
              </div>

              {/* Media Grid */}
              {media.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {media.map((item) => {
                    const isSelected = portfolioIds.includes(item.ig_media_id);
                    const imgSrc = item.thumbnail_url || item.media_url;
                    return (
                      <button
                        key={item.ig_media_id}
                        onClick={() => togglePortfolioItem(item.ig_media_id)}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                          isSelected
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-transparent hover:border-muted-foreground/30",
                        )}
                      >
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={item.caption?.slice(0, 50) || "Post"}
                            fill
                            sizes="(max-width: 768px) 33vw, 150px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary rounded-full p-1">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                          <div className="flex items-center gap-2 text-[10px] text-white">
                            <span className="flex items-center gap-0.5">
                              <Heart className="h-2.5 w-2.5" />
                              {item.like_count ?? 0}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No Instagram media synced yet. Connect your Instagram first.
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {portfolioIds.length}/6 selected
              </p>

              {/* Previous Brands */}
              <div className="space-y-2">
                <Label>Previous Brand Collaborations</Label>
                <div className="flex gap-2">
                  <Input
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    placeholder="e.g. Nike, Zomato..."
                    className="h-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBrand();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 px-4"
                    onClick={addBrand}
                  >
                    Add
                  </Button>
                </div>
                {previousBrands.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previousBrands.map((brand) => (
                      <Badge
                        key={brand}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {brand}
                        <button
                          onClick={() => removeBrand(brand)}
                          className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* STEP 4: Preview */}
          {step === 4 && (
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
                      {displayName || "Your Name"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                      {city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {city}
                        </span>
                      )}
                      {category && (
                        <Badge variant="secondary">{category}</Badge>
                      )}
                      {languages.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {languages.join(", ")}
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
                    <p className="text-[10px] text-muted-foreground">
                      Followers
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary p-3 text-center">
                    <Eye className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">
                      {formatNum(ip?.avg_views_per_reel ?? null)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Avg Views
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary p-3 text-center">
                    <Heart className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">
                      {formatNum(ip?.avg_likes_per_reel ?? null)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Avg Likes
                    </p>
                  </div>
                </div>

                {/* Content Types */}
                {contentTypes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Content Types
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {contentTypes.map((ct) => (
                        <Badge key={ct} variant="outline" className="text-xs">
                          {ct}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Turnaround */}
                {turnaroundTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Delivers in{" "}
                    {TURNAROUND_LABELS[turnaroundTime] || turnaroundTime}
                  </div>
                )}

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Reel", value: priceReel },
                    { label: "Post", value: pricePost },
                    { label: "Story", value: priceStory },
                  ].map((pkg) => (
                    <div
                      key={pkg.label}
                      className="rounded-lg border p-3 text-center"
                    >
                      <p className="text-xs text-muted-foreground">
                        {pkg.label}
                      </p>
                      <p className="text-lg font-bold">
                        {pkg.value
                          ? `₹${Number(pkg.value).toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {bio && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      About
                    </p>
                    <p className="text-sm leading-relaxed">{bio}</p>
                  </div>
                )}

                {/* Portfolio Preview */}
                {portfolioIds.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Portfolio Highlights
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {portfolioIds.map((id) => {
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
                {previousBrands.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Worked With
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {previousBrands.map((brand) => (
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
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <div>
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => router.push("/dashboard/influencer")}
          >
            Skip for now
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGoLive}
              disabled={saving || !canLive}
              className={ip?.is_active ? "" : "bg-green-600 hover:bg-green-700"}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ip?.is_active ? "Save Changes" : "Go Live"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
