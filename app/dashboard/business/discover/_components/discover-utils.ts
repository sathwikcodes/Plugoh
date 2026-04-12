import type { Database } from "@/lib/supabase/types";
import type { DiscoverFilters } from "./filter-panel";
import { getStartsAtPrice } from "./influencer-card";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

function getEngagementRate(
  likes: number | null,
  followers: number | null,
): number {
  if (!likes || !followers || followers <= 0) return 0;
  return (likes / followers) * 100;
}

function getSortValue(
  profile: InfluencerProfile,
  sortField: DiscoverFilters["sortField"],
): number {
  if (sortField === "price") return getStartsAtPrice(profile) ?? 0;
  if (sortField === "engagement")
    return getEngagementRate(
      profile.avg_likes_per_reel,
      profile.follower_count,
    );
  return profile.follower_count ?? 0;
}

export function getDefaultPriceBounds(
  profiles: InfluencerProfile[],
): [number, number] {
  const prices = profiles
    .map((profile) => getStartsAtPrice(profile))
    .filter((price): price is number => typeof price === "number" && price > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return [500, 50000];

  const min = Math.max(500, Math.floor(prices[0] / 500) * 500);
  const max = prices[prices.length - 1];

  return [min, Math.max(min, max)];
}

export function createDefaultFilters(
  priceBounds: [number, number],
): DiscoverFilters {
  return {
    place: "All",
    category: "All",
    priceRange: priceBounds,
    sortField: "followers",
    sortDirection: "desc",
  };
}

export function applyFilters(
  profiles: InfluencerProfile[],
  search: string,
  filters: DiscoverFilters,
  priceBounds: [number, number],
) {
  const normalizedSearch = search.trim().toLowerCase();

  return profiles
    .filter((profile) => {
      if (normalizedSearch) {
        const haystack = [
          profile.display_name,
          profile.instagram_handle,
          profile.ig_username,
          profile.bio,
          profile.category,
          profile.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }

      if (filters.category !== "All" && profile.category !== filters.category) {
        return false;
      }

      if (filters.place !== "All" && profile.city !== filters.place) {
        return false;
      }

      const startsAt = getStartsAtPrice(profile);
      const isBudgetDefault =
        filters.priceRange[0] === priceBounds[0] &&
        filters.priceRange[1] === priceBounds[1];
      if (startsAt != null) {
        if (
          startsAt < filters.priceRange[0] ||
          startsAt > filters.priceRange[1]
        ) {
          return false;
        }
      } else if (!isBudgetDefault) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const delta =
        getSortValue(a, filters.sortField) - getSortValue(b, filters.sortField);
      return filters.sortDirection === "asc" ? delta : -delta;
    });
}
