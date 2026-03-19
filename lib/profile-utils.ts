import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export interface MissingItem {
  label: string;
  weight: number;
  step: number;
}

export function calculateCompleteness(profile: InfluencerProfile): number {
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

export function canGoLive(profile: InfluencerProfile): boolean {
  return !!(
    profile.display_name &&
    profile.category &&
    (profile.price_per_reel ||
      profile.price_per_post ||
      profile.price_per_story)
  );
}

export function getMissingItems(profile: InfluencerProfile): MissingItem[] {
  const items: MissingItem[] = [];
  if (
    !(
      profile.price_per_reel ||
      profile.price_per_post ||
      profile.price_per_story
    )
  )
    items.push({ label: "Set prices", weight: 15, step: 2 });
  if (!profile.portfolio_media_ids || profile.portfolio_media_ids.length === 0)
    items.push({ label: "Add portfolio", weight: 15, step: 3 });
  if (!profile.content_types || profile.content_types.length === 0)
    items.push({ label: "Add content types", weight: 15, step: 2 });
  if (!profile.display_name)
    items.push({ label: "Add display name", weight: 10, step: 1 });
  if (!profile.bio) items.push({ label: "Add bio", weight: 10, step: 1 });
  if (!profile.category)
    items.push({ label: "Pick a category", weight: 10, step: 1 });
  if (!profile.previous_brands || profile.previous_brands.length === 0)
    items.push({ label: "Add past brands", weight: 10, step: 3 });
  if (!profile.city) items.push({ label: "Add city", weight: 5, step: 1 });
  if (!profile.languages || profile.languages.length === 0)
    items.push({ label: "Add languages", weight: 5, step: 1 });
  if (!profile.turnaround_time)
    items.push({ label: "Set turnaround time", weight: 5, step: 2 });
  return items;
}
