import { GoogleGenerativeAI } from "@google/generative-ai";
import { BUSINESS_TYPES } from "@/lib/constants";

const VALID_CATEGORIES = [
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

const VALID_LANGUAGES = [
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
] as const;

interface ProfileInput {
  name: string;
  phone: string | null;
  igBio: string | null;
  igUsername: string;
  followerCount: number;
  accountType: string | null;
  captions: string[];
}

interface ProfileResult {
  category: string;
  city: string | null;
  languages: string[];
  bio: string;
  price_per_reel: number;
  price_per_post: number;
  price_per_story: number;
}

interface BusinessProfileInput {
  fullName: string | null;
  location: string | null;
  brandName: string | null;
  brandType: string | null;
  igBio: string | null;
  igUsername: string | null;
  followerCount: number;
  captions: string[];
}

interface BusinessProfileResult {
  brand_name: string | null;
  brand_type: string | null;
  brand_location: string | null;
  brand_summary: string | null;
  tagline: string | null;
}

export async function generateInfluencerProfile(
  input: ProfileInput,
): Promise<ProfileResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
    });

    const captionsSample = input.captions
      .slice(0, 10)
      .map((c, i) => `${i + 1}. ${c.slice(0, 200)}`)
      .join("\n");

    const prompt = `You are helping set up an influencer's profile on Plugoh, a platform connecting brands with Instagram influencers in India.

Given the following Instagram data, generate profile fields:

Name: ${input.name}
Instagram Username: ${input.igUsername}
Instagram Bio: ${input.igBio ?? "Not provided"}
Followers: ${input.followerCount}
Account Type: ${input.accountType ?? "Unknown"}
Recent post captions (sample):
${captionsSample || "No captions available"}

Return a JSON object with:
- category: one of [${VALID_CATEGORIES.join(", ")}]
- city: infer from bio/captions if possible, else null
- languages: array from [${VALID_LANGUAGES.join(", ")}] — detect from caption languages and bio
- bio: a polished 1-2 sentence platform bio for this influencer
- price_per_reel: estimated price in INR (based on roughly ₹1-2 per follower for reels, round to nearest 500)
- price_per_post: estimated price in INR (slightly less than reels, round to nearest 500)
- price_per_story: estimated price in INR (roughly 30-50% of reel price, round to nearest 500)

Return ONLY valid JSON. No explanation, no markdown, no code fences.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (!text) return null;

    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    // Validate and constrain values
    const category = VALID_CATEGORIES.includes(
      parsed.category as (typeof VALID_CATEGORIES)[number],
    )
      ? (parsed.category as string)
      : "Other";

    const languages = Array.isArray(parsed.languages)
      ? (parsed.languages as string[]).filter((l) =>
          VALID_LANGUAGES.includes(l as (typeof VALID_LANGUAGES)[number]),
        )
      : ["English"];

    return {
      category,
      city: typeof parsed.city === "string" ? parsed.city : null,
      languages,
      bio: typeof parsed.bio === "string" ? parsed.bio : (input.igBio ?? ""),
      price_per_reel: Math.max(500, Number(parsed.price_per_reel) || 500),
      price_per_post: Math.max(500, Number(parsed.price_per_post) || 500),
      price_per_story: Math.max(500, Number(parsed.price_per_story) || 500),
    };
  } catch (err) {
    console.error("AI profile generation failed (non-blocking):", err);
    return null;
  }
}

export async function generateBusinessProfile(
  input: BusinessProfileInput,
): Promise<BusinessProfileResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallbackBrandName =
    input.brandName?.trim() ||
    input.igUsername?.trim() ||
    input.fullName?.trim();
  const fallbackLocation = input.location?.trim() || null;

  if (!apiKey) {
    return {
      brand_name: fallbackBrandName ?? null,
      brand_type: input.brandType?.trim() || "Other",
      brand_location: fallbackLocation,
      brand_summary: input.igBio?.trim() || null,
      tagline: fallbackBrandName
        ? `Built for growth by ${fallbackBrandName}`
        : null,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
    });

    const captionsSample = input.captions
      .slice(0, 10)
      .map((c, i) => `${i + 1}. ${c.slice(0, 200)}`)
      .join("\n");

    const prompt = `You are helping set up a brand owner's business profile on Plugoh, a platform connecting brands with Instagram influencers in India.

Given the following business context, infer a polished brand profile.

Owner Name: ${input.fullName ?? "Unknown"}
Manual Brand Name: ${input.brandName ?? "Not provided"}
Manual Brand Type: ${input.brandType ?? "Not provided"}
Manual Location: ${input.location ?? "Not provided"}
Instagram Username: ${input.igUsername ?? "Not connected"}
Instagram Bio: ${input.igBio ?? "Not provided"}
Followers: ${input.followerCount}
Recent post captions:
${captionsSample || "No captions available"}

Return a JSON object with:
- brand_name: best public-facing brand name, prefer manual values when present
- brand_type: one of [${BUSINESS_TYPES.join(", ")}]
- brand_location: infer from manual location/bio/captions if possible, else null
- brand_summary: a polished 1-2 sentence summary for the brand profile
- tagline: a short punchy brand line under 80 characters

Return ONLY valid JSON. No explanation, no markdown, no code fences.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (!text) return null;

    const jsonStr = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    const brandType = BUSINESS_TYPES.includes(
      parsed.brand_type as (typeof BUSINESS_TYPES)[number],
    )
      ? (parsed.brand_type as string)
      : input.brandType?.trim() || "Other";

    return {
      brand_name:
        typeof parsed.brand_name === "string" && parsed.brand_name.trim()
          ? parsed.brand_name.trim()
          : (fallbackBrandName ?? null),
      brand_type: brandType,
      brand_location:
        typeof parsed.brand_location === "string" &&
        parsed.brand_location.trim()
          ? parsed.brand_location.trim()
          : fallbackLocation,
      brand_summary:
        typeof parsed.brand_summary === "string" && parsed.brand_summary.trim()
          ? parsed.brand_summary.trim()
          : input.igBio?.trim() || null,
      tagline:
        typeof parsed.tagline === "string" && parsed.tagline.trim()
          ? parsed.tagline.trim().slice(0, 80)
          : null,
    };
  } catch (err) {
    console.error("AI business profile generation failed (non-blocking):", err);
    return {
      brand_name: fallbackBrandName ?? null,
      brand_type: input.brandType?.trim() || "Other",
      brand_location: fallbackLocation,
      brand_summary: input.igBio?.trim() || null,
      tagline: fallbackBrandName
        ? `Built for growth by ${fallbackBrandName}`
        : null,
    };
  }
}
