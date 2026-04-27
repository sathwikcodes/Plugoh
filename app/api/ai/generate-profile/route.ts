import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateInfluencerProfile } from "@/lib/ai/generate-profile";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { userId?: unknown };
    const userId =
      typeof body.userId === "string" && body.userId.trim()
        ? body.userId.trim()
        : null;

    if (!userId) {
      return NextResponse.json({ error: "missing_user_id" }, { status: 400 });
    }

    const db = createServiceClient();

    const [
      { data: userProfile },
      { data: ipProfile },
      { data: mediaCaptions },
    ] = await Promise.all([
      db
        .from("profiles")
        .select("full_name, phone, location")
        .eq("id", userId)
        .single(),
      db
        .from("influencer_profiles")
        .select("ig_biography, ig_username, ig_followers_count, city")
        .eq("user_id", userId)
        .single(),
      db
        .from("instagram_media")
        .select("caption")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(20),
    ]);

    if (!ipProfile?.ig_username) {
      return NextResponse.json(
        { error: "no_instagram_profile" },
        { status: 400 },
      );
    }

    const captions = (mediaCaptions ?? [])
      .map((m) => m.caption)
      .filter((c): c is string => !!c);

    const aiResult = await generateInfluencerProfile({
      name: userProfile?.full_name ?? ipProfile.ig_username,
      phone: userProfile?.phone ?? null,
      igBio: ipProfile.ig_biography ?? null,
      igUsername: ipProfile.ig_username,
      followerCount: ipProfile.ig_followers_count ?? 0,
      accountType: null,
      captions,
    });

    const { error: ipUpdateError } = await db
      .from("influencer_profiles")
      .update({
        category: aiResult.category,
        city: aiResult.city,
        languages: aiResult.languages,
        bio: aiResult.bio,
        price_per_reel: aiResult.price_per_reel,
        price_per_post: aiResult.price_per_post,
        price_per_story: aiResult.price_per_story,
      })
      .eq("user_id", userId);

    if (ipUpdateError) {
      console.error(
        "generate-profile influencer_profiles update:",
        ipUpdateError,
      );
      return NextResponse.json(
        { error: "persist_failed", details: ipUpdateError.message },
        { status: 500 },
      );
    }

    if (aiResult.city && !userProfile?.location) {
      const { error: profileLocError } = await db
        .from("profiles")
        .update({ location: aiResult.city })
        .eq("id", userId);
      if (profileLocError) {
        console.error(
          "generate-profile profiles.location update:",
          profileLocError,
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("AI generate-profile error:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
