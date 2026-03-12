"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
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
const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
];

export default function InfluencerOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [followerCount, setFollowerCount] = useState("");
  const [avgViews, setAvgViews] = useState("");
  const [avgLikes, setAvgLikes] = useState("");
  const [pricePerReel, setPricePerReel] = useState("");
  const [pricePerPost, setPricePerPost] = useState("");
  const [pricePerStory, setPricePerStory] = useState("");
  const [bio, setBio] = useState("");

  const toggleLang = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("influencer_profiles").insert({
        user_id: user.id,
        display_name: displayName,
        instagram_handle: instagramHandle,
        instagram_url:
          instagramUrl || `https://instagram.com/${instagramHandle}`,
        category,
        city,
        languages,
        follower_count: Number(followerCount),
        avg_views_per_reel: Number(avgViews),
        avg_likes_per_reel: Number(avgLikes),
        price_per_reel: Number(pricePerReel),
        price_per_post: Number(pricePerPost),
        price_per_story: pricePerStory ? Number(pricePerStory) : null,
        bio,
      });
      if (error) throw error;
      toast({
        title: "Profile created!",
        description: "You&apos;re all set to receive bookings.",
      });
      router.push("/dashboard/influencer");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-6 animate-fade-in">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile ✨</CardTitle>
          <CardDescription>
            Set up your influencer profile so businesses can find and book you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input
                  placeholder="Your creator name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram Handle *</Label>
                <Input
                  placeholder="yourhandle"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Instagram Profile URL</Label>
              <Input
                placeholder="https://instagram.com/yourhandle"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={category}
                  onValueChange={(v) => v && setCategory(v)}
                  required
                >
                  <SelectTrigger>
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
                <Label>City *</Label>
                <Input
                  placeholder="e.g. Hyderabad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
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
                    variant={languages.includes(lang) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLang(lang)}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Followers *</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={followerCount}
                  onChange={(e) => setFollowerCount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Avg Views/Reel *</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={avgViews}
                  onChange={(e) => setAvgViews(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Avg Likes/Reel *</Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={avgLikes}
                  onChange={(e) => setAvgLikes(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Price/Reel (₹) *</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={pricePerReel}
                  onChange={(e) => setPricePerReel(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price/Post (₹) *</Label>
                <Input
                  type="number"
                  placeholder="3000"
                  value={pricePerPost}
                  onChange={(e) => setPricePerPost(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price/Story (₹)</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={pricePerStory}
                  onChange={(e) => setPricePerStory(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Tell brands about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
