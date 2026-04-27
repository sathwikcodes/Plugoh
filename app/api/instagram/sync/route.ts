import { NextRequest, NextResponse } from "next/server";
import {
  fetchIGMedia,
  fetchIGProfile,
  fetchMediaInsights,
} from "@/lib/instagram/api";
import { authenticateUser, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const user = await authenticateUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient();

  const { data: profileData } = await db
    .from("influencer_profiles")
    .select("ig_user_id, access_token, token_expires_at")
    .eq("user_id", user.id)
    .single();

  if (!profileData?.access_token || !profileData?.ig_user_id) {
    return NextResponse.json(
      { error: "Instagram not connected" },
      { status: 400 },
    );
  }

  let { access_token: accessToken } = profileData;

  const expiresAt = new Date(profileData.token_expires_at ?? 0);
  const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  if (expiresAt < tenDaysFromNow) {
    const params = new URLSearchParams({
      grant_type: "ig_refresh_token",
      access_token: accessToken,
    });
    const res = await fetch(
      `https://graph.instagram.com/refresh_access_token?${params.toString()}`,
    );
    if (res.ok) {
      const data = await res.json();
      accessToken = data.access_token;
      const newExpiry = new Date(
        Date.now() + data.expires_in * 1000,
      ).toISOString();
      await db
        .from("influencer_profiles")
        .update({ access_token: accessToken, token_expires_at: newExpiry })
        .eq("user_id", user.id);
    }
  }

  const igProfile = await fetchIGProfile(profileData.ig_user_id, accessToken);
  const mediaItems = await fetchIGMedia(profileData.ig_user_id, accessToken);
  const avgLikes =
    mediaItems.length > 0
      ? mediaItems.reduce((sum, item) => sum + (item.like_count ?? 0), 0) /
        mediaItems.length
      : null;
  const { data: existingProfile } = await db
    .from("influencer_profiles")
    .select("bio,display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  await db
    .from("influencer_profiles")
    .update({
      ig_username: igProfile.username,
      ig_followers_count: igProfile.followers_count,
      ig_follows_count: igProfile.follows_count ?? null,
      ig_media_count: igProfile.media_count,
      ig_biography: igProfile.biography,
      ig_profile_picture_url: igProfile.profile_picture_url,
      follower_count: igProfile.followers_count,
      avg_likes_per_reel: avgLikes,
      bio: existingProfile?.bio?.trim()
        ? existingProfile.bio
        : (igProfile.biography ?? null),
      display_name: existingProfile?.display_name?.trim()
        ? existingProfile.display_name
        : igProfile.username,
      access_token: accessToken,
    })
    .eq("user_id", user.id);

  // Fan out: insights fetch + upsert per media item run in parallel.
  // 50 items × ~2 s per item = ~100 s sequentially → ~5 s here.
  const results = await Promise.all(
    mediaItems.map(async (item) => {
      const insights = await fetchMediaInsights(item.id, accessToken);
      const { error } = await db.from("instagram_media").upsert(
        {
          user_id: user.id,
          ig_media_id: item.id,
          media_type: item.media_type,
          caption: item.caption ?? null,
          media_url: item.media_url ?? null,
          thumbnail_url: item.thumbnail_url ?? null,
          permalink: item.permalink,
          timestamp: item.timestamp,
          like_count: item.like_count ?? null,
          comments_count: item.comments_count ?? null,
          impressions: insights?.impressions ?? null,
          reach: insights?.reach ?? null,
          engagement: (item.like_count ?? 0) + (item.comments_count ?? 0),
          saves: insights?.saves ?? null,
          video_views: insights?.video_views ?? null,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "user_id,ig_media_id" },
      );
      return error ? 0 : 1;
    }),
  );
  const synced = results.reduce<number>((acc, n) => acc + n, 0);

  return NextResponse.json({ synced });
}
