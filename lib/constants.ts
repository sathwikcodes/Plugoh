export const CATEGORIES = [
  "Food",
  "Fitness",
  "Beauty",
  "Lifestyle",
  "Travel",
  "Education",
  "Tech",
  "Fashion",
  "Other",
] as const;

export const CATEGORIES_WITH_ALL = ["All", ...CATEGORIES] as const;

export const LANGUAGES = [
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
  "Urdu",
  "Other",
] as const;

export const CONTENT_TYPES = [
  "Product Reviews",
  "Tutorials",
  "Vlogs",
  "Reels/Shorts",
  "Stories",
  "Unboxing",
  "Recipe",
  "Before/After",
  "Day in Life",
  "Brand Integration",
] as const;

export const TURNAROUND_OPTIONS = [
  "24_hours",
  "2_3_days",
  "1_week",
  "2_weeks",
] as const;

export const TURNAROUND_LABELS: Record<string, string> = {
  "24_hours": "24 hours",
  "2_3_days": "2-3 days",
  "1_week": "1 week",
  "2_weeks": "2 weeks",
};

export const PACKAGE_TYPES = [
  "reel",
  "post",
  "story",
  "reel+story",
  "reel+post",
] as const;
