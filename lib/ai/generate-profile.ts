import { GoogleGenerativeAI } from "@google/generative-ai";

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
