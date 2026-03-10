"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
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
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

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

interface EditProfileFormProps {
  profile: InfluencerProfile;
  onSaved: (updated: InfluencerProfile) => void;
}

export function EditProfileForm({ profile, onSaved }: EditProfileFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: profile.display_name || "",
    instagram_handle: profile.instagram_handle || "",
    instagram_url: profile.instagram_url || "",
    category: profile.category || "",
    city: profile.city || "",
    languages: profile.languages || [],
    follower_count: profile.follower_count?.toString() || "",
    avg_views_per_reel: profile.avg_views_per_reel?.toString() || "",
    avg_likes_per_reel: profile.avg_likes_per_reel?.toString() || "",
    price_per_reel: profile.price_per_reel?.toString() || "",
    price_per_post: profile.price_per_post?.toString() || "",
    price_per_story: profile.price_per_story?.toString() || "",
    bio: profile.bio || "",
  });

  const update = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const toggleLang = (lang: string) =>
    update(
      "languages",
      form.languages.includes(lang)
        ? form.languages.filter((l) => l !== lang)
        : [...form.languages, lang],
    );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        display_name: form.display_name,
        instagram_handle: form.instagram_handle,
        instagram_url:
          form.instagram_url ||
          `https://instagram.com/${form.instagram_handle}`,
        category: form.category,
        city: form.city,
        languages: form.languages,
        follower_count: Number(form.follower_count) || null,
        avg_views_per_reel: Number(form.avg_views_per_reel) || null,
        avg_likes_per_reel: Number(form.avg_likes_per_reel) || null,
        price_per_reel: Number(form.price_per_reel) || null,
        price_per_post: Number(form.price_per_post) || null,
        price_per_story: Number(form.price_per_story) || null,
        bio: form.bio,
      };
      const { data, error } = await supabase
        .from("influencer_profiles")
        .update(payload)
        .eq("id", profile.id)
        .select()
        .single();
      if (error) throw error;
      onSaved(data);
      toast({ title: "Profile updated!" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input
            value={form.display_name}
            onChange={(e) => update("display_name", e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>Instagram Handle</Label>
          <Input
            value={form.instagram_handle}
            onChange={(e) => update("instagram_handle", e.target.value)}
            className="h-11"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Instagram URL</Label>
        <Input
          value={form.instagram_url}
          onChange={(e) => update("instagram_url", e.target.value)}
          className="h-11"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => update("category", v)}
          >
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
        <div className="space-y-2">
          <Label>City</Label>
          <Input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
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
              variant={form.languages.includes(lang) ? "default" : "outline"}
              size="sm"
              className="h-9"
              onClick={() => toggleLang(lang)}
            >
              {lang}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Followers</Label>
          <Input
            type="number"
            value={form.follower_count}
            onChange={(e) => update("follower_count", e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>Avg Views</Label>
          <Input
            type="number"
            value={form.avg_views_per_reel}
            onChange={(e) => update("avg_views_per_reel", e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>Avg Likes</Label>
          <Input
            type="number"
            value={form.avg_likes_per_reel}
            onChange={(e) => update("avg_likes_per_reel", e.target.value)}
            className="h-11"
          />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>₹/Reel</Label>
          <Input
            type="number"
            value={form.price_per_reel}
            onChange={(e) => update("price_per_reel", e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>₹/Post</Label>
          <Input
            type="number"
            value={form.price_per_post}
            onChange={(e) => update("price_per_post", e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>₹/Story</Label>
          <Input
            type="number"
            value={form.price_per_story}
            onChange={(e) => update("price_per_story", e.target.value)}
            className="h-11"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit" className="w-full h-12" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
