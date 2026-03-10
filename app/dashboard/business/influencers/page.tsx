"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
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
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

const CATEGORIES = [
  "All",
  "Food",
  "Fitness",
  "Beauty",
  "Lifestyle",
  "Travel",
  "Education",
  "Tech",
  "Fashion",
  "Other",
];

export default function InfluencerDiscovery() {
  const [profiles, setProfiles] = useState<InfluencerProfile[]>([]);
  const [filtered, setFiltered] = useState<InfluencerProfile[]>([]);
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("influencer_profiles")
      .select("*")
      .eq("is_active", true)
      .order("follower_count", { ascending: false })
      .then(({ data }) => {
        setProfiles(data || []);
        setFiltered(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
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
    setFiltered(result);
  }, [category, city, minPrice, maxPrice, minFollowers, profiles]);

  const formatNum = (n: number | null) => {
    if (!n) return "—";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  const clearFilters = () => {
    setCategory("All");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinFollowers("");
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
        <CardContent className="grid gap-4 p-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger className="h-11">
                <SelectValue />
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
          <div className="space-y-1">
            <Label className="text-xs">City</Label>
            <Input
              placeholder="e.g. Hyderabad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11"
            />
          </div>
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
        </CardContent>
      </Card>

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
          {filtered.map((p) => (
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
                  {p.category && (
                    <Badge variant="secondary" className="text-xs">
                      {p.category}
                    </Badge>
                  )}
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
                      {formatNum(p.follower_count)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Followers
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary p-2">
                    <Eye className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-sm font-semibold">
                      {formatNum(p.avg_views_per_reel)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Views</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-2">
                    <Heart className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-sm font-semibold">
                      {formatNum(p.avg_likes_per_reel)}
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
          ))}
        </div>
      )}
    </div>
  );
}
