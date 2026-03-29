import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateBusinessProfile } from "@/lib/ai/generate-profile";

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
      { data: businessProfile },
      { data: mediaCaptions },
    ] = await Promise.all([
      db
        .from("profiles")
        .select("full_name, phone, location, business_name, business_type")
        .eq("id", userId)
        .single(),
      db
        .from("business_profiles")
        .select(
          "brand_name, brand_type, brand_location, ig_biography, ig_username, ig_followers_count, brand_summary, tagline",
        )
        .eq("user_id", userId)
        .single(),
      db
        .from("instagram_media")
        .select("caption")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(20),
    ]);

    if (!businessProfile) {
      return NextResponse.json(
        { error: "no_business_profile" },
        { status: 400 },
      );
    }

    const captions = (mediaCaptions ?? [])
      .map((m) => m.caption)
      .filter((c): c is string => !!c);

    const aiResult = await generateBusinessProfile({
      fullName: userProfile?.full_name ?? null,
      location: userProfile?.location ?? null,
      brandName:
        businessProfile.brand_name ?? userProfile?.business_name ?? null,
      brandType:
        businessProfile.brand_type ?? userProfile?.business_type ?? null,
      igBio: businessProfile.ig_biography ?? null,
      igUsername: businessProfile.ig_username ?? null,
      followerCount: businessProfile.ig_followers_count ?? 0,
      captions,
    });

    if (aiResult) {
      await db
        .from("business_profiles")
        .update({
          brand_name:
            businessProfile.brand_name?.trim() ||
            userProfile?.business_name?.trim() ||
            aiResult.brand_name,
          brand_type:
            businessProfile.brand_type?.trim() ||
            userProfile?.business_type?.trim() ||
            aiResult.brand_type,
          brand_location:
            businessProfile.brand_location?.trim() ||
            aiResult.brand_location ||
            userProfile?.location ||
            null,
          brand_summary:
            businessProfile.brand_summary?.trim() || aiResult.brand_summary,
          tagline: businessProfile.tagline?.trim() || aiResult.tagline,
        })
        .eq("user_id", userId);

      if (aiResult.brand_name && !userProfile?.business_name?.trim()) {
        await db
          .from("profiles")
          .update({ business_name: aiResult.brand_name })
          .eq("id", userId);
      }

      if (aiResult.brand_type && !userProfile?.business_type?.trim()) {
        await db
          .from("profiles")
          .update({ business_type: aiResult.brand_type })
          .eq("id", userId);
      }

      if (aiResult.brand_location && !userProfile?.location?.trim()) {
        await db
          .from("profiles")
          .update({ location: aiResult.brand_location })
          .eq("id", userId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("AI generate-business-profile error:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
