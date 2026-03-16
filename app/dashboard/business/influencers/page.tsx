"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Instagram,
  Eye,
  Heart,
  IndianRupee,
  MapPin,
  ArrowLeft,
  SearchX,
  TrendingUp,
  X,
} from "lucide-react";
import { useInfluencerProfiles } from "@/hooks/queries/use-influencer-profiles";
import { formatNumber } from "@/lib/format";
import { CATEGORIES_WITH_ALL, LANGUAGES, CONTENT_TYPES } from "@/lib/constants";

type SortOption = "followers" | "price_low" | "engagement";

function getEngagementRate(
  likes: number | null,
  followers: number | null,
): number {
  if (!likes || !followers || followers === 0) return 0;
  return (likes / followers) * 100;
}

export default function InfluencerDiscovery() {
  const { data: profiles = [], isLoading: loading } = useInfluencerProfiles();
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [language, setLanguage] = useState("All");
  const [contentType, setContentType] = useState("All");
  const [sort, setSort] = useState<SortOption>("followers");

  const filtered = useMemo(() => {
    let result = [...profiles];
    if (category !== "All")
      result = result.filter((p) => p.category === category);
    if (city)
      result = result.filter((p) =>
        p.city?.toLowerCase().includes(city.toLowerCase()),
      );
    if (minPrice)
      result = result.filter(
        (p) => (p.price_per_reel || 0) >= Number(minPrice),
      );
    if (maxPrice)
      result = result.filter(
        (p) => (p.price_per_reel || 0) <= Number(maxPrice),
      );
    if (minFollowers)
      result = result.filter(
        (p) => (p.follower_count || 0) >= Number(minFollowers),
      );
    if (language !== "All")
      result = result.filter((p) =>
        (p.languages as string[] | null)?.includes(language),
      );
    if (contentType !== "All")
      result = result.filter((p) =>
        (p.content_types as string[] | null)?.includes(contentType),
      );

    // Sort
    switch (sort) {
      case "followers":
        result.sort(
          (a, b) => (b.follower_count || 0) - (a.follower_count || 0),
        );
        break;
      case "price_low":
        result.sort(
          (a, b) => (a.price_per_reel || 0) - (b.price_per_reel || 0),
        );
        break;
      case "engagement":
        result.sort(
          (a, b) =>
            getEngagementRate(b.avg_likes_per_reel, b.follower_count) -
            getEngagementRate(a.avg_likes_per_reel, a.follower_count),
        );
        break;
    }
    return result;
  }, [
    category,
    city,
    minPrice,
    maxPrice,
    minFollowers,
    language,
    contentType,
    sort,
    profiles,
  ]);

  const hasActiveFilters =
    category !== "All" ||
    city ||
    minPrice ||
    maxPrice ||
    minFollowers ||
    language !== "All" ||
    contentType !== "All";

  const clearFilters = () => {
    setCategory("All");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinFollowers("");
    setLanguage("All");
    setContentType("All");
    setSort("followers");
  };

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-11 w-11">
          <Link href="/dashboard/business">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Discover Influencers</h1>
          <p className="text-sm text-muted-foreground">
            Find the perfect creator for your brand
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-xs">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => v && setCategory(v)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES_WITH_ALL.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Language</Label>
              <Select
                value={language}
                onValueChange={(v) => v && setLanguage(v)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(v) => v && setContentType(v)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct} value={ct}>
                      {ct}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">City</Label>
              <Input
                placeholder="e.g. Hyderabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Min ₹/Reel</Label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max ₹/Reel</Label>
              <Input
                type="number"
                placeholder="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Min Followers</Label>
              <Input
                type="number"
                placeholder="1000"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sort By</Label>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortOption)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="followers">Most Followers</SelectItem>
                  <SelectItem value="price_low">Lowest Price</SelectItem>
                  <SelectItem value="engagement">Highest Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="mr-1 h-4 w-4" /> Clear all filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Result count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} creator{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                No influencers match your filters
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try different criteria or clear all filters
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters} className="h-11">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const er = getEngagementRate(
              p.avg_likes_per_reel,
              p.follower_count,
            );
            return (
              <Card
                key={p.id}
                className="group transition-all hover:shadow-lg hover:border-primary/20"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {p.display_name || "Creator"}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {p.city || "India"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {er > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] gap-0.5 bg-success/10 text-success border-success/20"
                        >
                          <TrendingUp className="h-3 w-3" />
                          {er.toFixed(1)}%
                        </Badge>
                      )}
                      {p.category && (
                        <Badge variant="secondary" className="text-xs">
                          {p.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {p.instagram_handle && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Instagram className="h-4 w-4" /> @{p.instagram_handle}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-secondary p-2">
                      <Users className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                      <p className="text-sm font-semibold">
                        {formatNumber(p.follower_count)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Followers
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary p-2">
                      <Eye className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                      <p className="text-sm font-semibold">
                        {formatNumber(p.avg_views_per_reel)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Views</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-2">
                      <Heart className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                      <p className="text-sm font-semibold">
                        {formatNumber(p.avg_likes_per_reel)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Likes</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg font-bold text-primary">
                      <IndianRupee className="h-4 w-4" />
                      {p.price_per_reel?.toLocaleString() || "—"}
                      <span className="text-xs font-normal text-muted-foreground">
                        /reel
                      </span>
                    </div>
                    <Button size="sm" className="h-10" asChild>
                      <Link href={`/dashboard/business/influencers/${p.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
