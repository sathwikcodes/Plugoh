import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  fetchIGProfile,
  fetchIGMedia,
  fetchMediaInsights,
} from "@/lib/instagram/api";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function errorRedirect(request: NextRequest, reason: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/influencer/onboarding?error=${reason}`, request.url),
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (searchParams.get("error")) {
    return errorRedirect(request, "instagram_denied");
  }
  if (!code || !state) {
    return errorRedirect(request, "missing_params");
  }

  const storedState = request.cookies.get("ig_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return errorRedirect(request, "invalid_state");
  }

  const colonIdx = state.indexOf(":");
  const userId = colonIdx !== -1 ? state.slice(colonIdx + 1) : null;
  if (!userId) {
    return errorRedirect(request, "invalid_state");
  }

  try {
    const { accessToken: shortToken, igUserId } =
      await exchangeCodeForToken(code);
    const { accessToken, expiresIn } =
      await exchangeForLongLivedToken(shortToken);
    const tokenExpiresAt = new Date(
      Date.now() + expiresIn * 1000,
    ).toISOString();
    const db = serviceClient();
    const profile = await fetchIGProfile(igUserId, accessToken);
    const mediaItems = await fetchIGMedia(igUserId, accessToken);
    const avgLikes =
      mediaItems.length > 0
        ? mediaItems.reduce((sum, item) => sum + (item.like_count ?? 0), 0) /
          mediaItems.length
        : null;
    const { data: existingProfile } = await db
      .from("influencer_profiles")
      .select("bio,display_name")
      .eq("user_id", userId)
      .maybeSingle();
    const { error: upsertError } = await db.from("influencer_profiles").upsert(
      {
        user_id: userId,
        ig_user_id: igUserId,
        ig_username: profile.username,
        ig_followers_count: profile.followers_count,
        ig_follows_count: profile.follows_count ?? null,
        ig_media_count: profile.media_count,
        ig_biography: profile.biography,
        ig_profile_picture_url: profile.profile_picture_url,
        follower_count: profile.followers_count,
        avg_likes_per_reel: avgLikes,
        bio: existingProfile?.bio?.trim()
          ? existingProfile.bio
          : (profile.biography ?? null),
        display_name: existingProfile?.display_name?.trim()
          ? existingProfile.display_name
          : profile.username,
        instagram_handle: profile.username,
        instagram_url: `https://www.instagram.com/${profile.username}`,
        access_token: accessToken,
        token_expires_at: tokenExpiresAt,
      },
      { onConflict: "user_id" },
    );

    if (upsertError) throw upsertError;

    for (const item of mediaItems) {
      const insights = await fetchMediaInsights(item.id, accessToken);
      await db.from("instagram_media").upsert(
        {
          user_id: userId,
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
    }

    const { data: updatedProfile } = await db
      .from("influencer_profiles")
      .select("category, city, price_per_reel")
      .eq("user_id", userId)
      .single();

    const needsProfileEdit =
      !updatedProfile?.category ||
      !updatedProfile?.city ||
      !updatedProfile?.price_per_reel;

    const redirectPath = needsProfileEdit
      ? "/dashboard/influencer?tab=edit"
      : "/dashboard/influencer";

    const response = NextResponse.redirect(
      new URL(redirectPath, request.url),
    );
    response.cookies.delete("ig_oauth_state");
    return response;
  } catch (err) {
    console.error("Instagram OAuth callback error:", err);
    return errorRedirect(request, "server_error");
  }
}
