"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Eye,
  Heart,
  MapPin,
  Globe,
  Instagram,
  Loader2,
  Clock,
  Image as ImageIcon,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

const GRADIENT_COLORS = [
  "#0A0A0A",
  "#dd2a7b",
  "#8134af",
  "#f58529",
  "#515bd4",
  "#dd2a7b",
  "#0A0A0A",
];
const GRADIENT_STOPS = [20, 40, 55, 65, 75, 85, 100];
const GRADIENT_STYLE = { opacity: 0.08 } as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const TURNAROUND_LABELS: Record<string, string> = {
  "24_hours": "24 hours",
  "2_3_days": "2-3 days",
  "1_week": "1 week",
  "2_weeks": "2 weeks",
};

function formatNum(n: number | null): string {
  if (!n) return "\u2014";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function InfluencerProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ip, setIp] = useState<InfluencerProfile | null>(null);
  const [portfolioMedia, setPortfolioMedia] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    supabase
      .from("influencer_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        setIp(data);
        if (data?.portfolio_media_ids && data.portfolio_media_ids.length > 0) {
          const { data: mediaData } = await supabase
            .from("instagram_media")
            .select("*")
            .eq("user_id", user.id)
            .in("ig_media_id", data.portfolio_media_ids);
          setPortfolioMedia(mediaData || []);
        }
        setLoading(false);
      });
  }, [user, authLoading]);

  useEffect(() => {
    if (!loading && !ip && !authLoading) {
      router.push("/dashboard/influencer");
    }
  }, [loading, ip, authLoading, router]);

  if (loading || authLoading || !ip) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = (ip.display_name || profile?.full_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasAnyPrice =
    ip.price_per_reel || ip.price_per_post || ip.price_per_story;

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatedGradientBackground
          Breathing
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={180}
          breathingRange={8}
          animationSpeed={0.015}
          containerStyle={GRADIENT_STYLE}
        />
      </div>

      <div className="relative z-10 container max-w-2xl py-6 space-y-5">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {/* Top Bar */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-between"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground -ml-2"
              onClick={() => router.push("/dashboard/influencer")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 hover:border-white/20"
              asChild
            >
              <Link href="/dashboard/influencer/complete-profile">
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
              </Link>
            </Button>
          </motion.div>

          {/* Hero Card */}
          <motion.div variants={fadeUp}>
            <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 space-y-5">
              {/* Avatar + Identity */}
              <div className="flex items-start gap-4">
                {/* Profile Picture with gradient ring */}
                <div className="shrink-0">
                  <div
                    className="rounded-full p-[2.5px]"
                    style={{
                      background:
                        "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
                    }}
                  >
                    {ip.ig_profile_picture_url ? (
                      <img
                        src={ip.ig_profile_picture_url}
                        alt={ip.display_name || "Profile"}
                        className="h-20 w-20 rounded-full object-cover border-2 border-background"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full border-2 border-background bg-card flex items-center justify-center">
                        <span className="text-xl font-bold text-muted-foreground">
                          {initials}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name + Meta */}
                <div className="min-w-0 flex-1 pt-1">
                  <h1 className="text-2xl font-extrabold tracking-tight truncate">
                    {ip.display_name || profile?.full_name || "Creator"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                    {ip.instagram_handle && (
                      <a
                        href={
                          ip.instagram_url ||
                          `https://instagram.com/${ip.instagram_handle}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        <Instagram className="h-3.5 w-3.5" /> @
                        {ip.instagram_handle}
                      </a>
                    )}
                    {ip.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {ip.city}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {ip.category && (
                      <Badge
                        variant="outline"
                        className="rounded-full border-white/10 bg-white/5 text-xs"
                      >
                        {ip.category}
                      </Badge>
                    )}
                    {ip.languages && ip.languages.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" /> {ip.languages.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {ip.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ip.bio}
                </p>
              )}

              {/* Status Indicator */}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                  ip.is_active
                    ? "bg-green-500/10 text-green-400"
                    : "bg-amber-500/10 text-amber-400",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    ip.is_active ? "bg-green-500" : "bg-amber-500",
                  )}
                />
                {ip.is_active
                  ? "Profile is live — brands can discover you"
                  : "Profile not visible to brands yet"}
                {!ip.is_active && (
                  <Link
                    href="/dashboard/influencer/complete-profile"
                    className="ml-auto text-xs font-medium underline underline-offset-2 hover:text-amber-300"
                  >
                    Complete Profile
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid gap-3 grid-cols-3">
            {[
              {
                icon: Users,
                value: formatNum(ip.follower_count),
                label: "Followers",
                gradient: "from-pink-500/20 to-rose-500/20",
                iconColor: "text-pink-400",
              },
              {
                icon: Eye,
                value: formatNum(ip.avg_views_per_reel),
                label: "Avg Views",
                gradient: "from-purple-500/20 to-violet-500/20",
                iconColor: "text-purple-400",
              },
              {
                icon: Heart,
                value: formatNum(ip.avg_likes_per_reel),
                label: "Avg Likes",
                gradient: "from-orange-500/20 to-amber-500/20",
                iconColor: "text-orange-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 text-center transition-all hover:border-white/20 hover:scale-[1.02]"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 mx-auto items-center justify-center rounded-xl bg-gradient-to-br mb-2",
                    stat.gradient,
                  )}
                >
                  <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
                </div>
                <p className="text-xl font-extrabold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Packages & Content */}
          {hasAnyPrice && (
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Packages
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Reel", value: ip.price_per_reel },
                    { label: "Post", value: ip.price_per_post },
                    { label: "Story", value: ip.price_per_story },
                  ].map((pkg) => (
                    <div
                      key={pkg.label}
                      className={cn(
                        "rounded-xl border p-3 text-center transition-all",
                        pkg.value
                          ? "border-white/10 hover:border-white/20"
                          : "border-white/5 opacity-40",
                      )}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {pkg.label}
                      </p>
                      <p className="text-lg font-extrabold">
                        {pkg.value
                          ? `\u20B9${pkg.value.toLocaleString()}`
                          : "\u2014"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Content Types */}
                {ip.content_types && ip.content_types.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Content Types
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ip.content_types.map((ct) => (
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

                {/* Turnaround */}
                {ip.turnaround_time && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Delivers in{" "}
                    {TURNAROUND_LABELS[ip.turnaround_time] ||
                      ip.turnaround_time.replace(/_/g, " ")}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Portfolio */}
          {portfolioMedia.length > 0 && (
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Portfolio Highlights
                </p>
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
                          <img
                            src={imgSrc}
                            alt={item.caption?.slice(0, 50) || "Portfolio"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Stats overlay */}
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
                </div>
              </div>
            </motion.div>
          )}

          {/* Previous Brands */}
          {ip.previous_brands && ip.previous_brands.length > 0 && (
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Worked With
                </p>
                <div className="flex flex-wrap gap-2">
                  {ip.previous_brands.map((brand) => (
                    <Badge
                      key={brand}
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-sm"
                    >
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Edit Profile CTA */}
          <motion.div variants={fadeUp}>
            <Button
              asChild
              size="lg"
              className="w-full rounded-xl h-12 text-base font-semibold border-0"
              style={{
                background:
                  "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
              }}
            >
              <Link href="/dashboard/influencer/complete-profile">
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
