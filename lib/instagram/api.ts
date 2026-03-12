// Official docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
// client_id must be the Instagram App ID (from the Instagram product panel), NOT the Facebook App ID
const INSTAGRAM_AUTH_BASE = "https://www.instagram.com/oauth/authorize";
const INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const GRAPH_BASE = "https://graph.instagram.com";

export function getInstagramAuthUrl(state: string): string {
  const appId =
    process.env.INSTAGRAM_APP_ID ?? process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/instagram`;
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: "instagram_business_basic",
    response_type: "code",
    enable_fb_login: "0",
    force_reauth: "0",
    state,
  });
  return `${INSTAGRAM_AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
): Promise<{ accessToken: string; igUserId: string }> {
  const body = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    grant_type: "authorization_code",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/instagram`,
    code,
  });

  const res = await fetch(INSTAGRAM_TOKEN_URL, { method: "POST", body });
  const data = await res.json();

  if (!res.ok)
    throw new Error(data.error_message ?? "Failed to exchange code for token");

  // Official docs response format: { data: [{ access_token, user_id, permissions }] }
  const tokenData = Array.isArray(data.data) ? data.data[0] : data;
  if (!tokenData?.access_token)
    throw new Error("No access_token in token exchange response");

  return {
    accessToken: tokenData.access_token,
    igUserId: String(tokenData.user_id),
  };
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    access_token: shortLivedToken,
  });

  const res = await fetch(`${GRAPH_BASE}/access_token?${params.toString()}`);
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error?.message ?? "Failed to exchange for long-lived token",
    );
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export async function fetchIGProfile(igUserId: string, accessToken: string) {
  const params = new URLSearchParams({
    fields:
      "id,username,name,followers_count,follows_count,media_count,biography,profile_picture_url,website,account_type",
    access_token: accessToken,
  });
  const res = await fetch(`${GRAPH_BASE}/${igUserId}?${params.toString()}`);
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message ?? "Failed to fetch IG profile");
  return data as {
    id: string;
    username: string;
    name?: string;
    followers_count: number;
    follows_count?: number;
    media_count: number;
    biography: string;
    profile_picture_url: string;
    website?: string;
    account_type?: string;
  };
}

export async function fetchIGMedia(igUserId: string, accessToken: string) {
  const params = new URLSearchParams({
    fields:
      "id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count",
    limit: "50",
    access_token: accessToken,
  });
  const res = await fetch(
    `${GRAPH_BASE}/${igUserId}/media?${params.toString()}`,
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message ?? "Failed to fetch IG media");
  return (data.data ?? []) as Array<{
    id: string;
    caption?: string;
    media_type: string;
    media_url?: string;
    thumbnail_url?: string;
    timestamp: string;
    permalink: string;
    like_count?: number;
    comments_count?: number;
  }>;
}

export async function fetchMediaInsights(
  igMediaId: string,
  accessToken: string,
): Promise<Record<string, number> | null> {
  const params = new URLSearchParams({
    metric: "impressions,reach,engagement,saves,video_views",
    access_token: accessToken,
  });
  const res = await fetch(
    `${GRAPH_BASE}/${igMediaId}/insights?${params.toString()}`,
  );
  const data = await res.json();
  if (!res.ok) return null;
  const insights: Record<string, number> = {};
  for (const item of data.data ?? []) {
    insights[item.name] = item.values?.[0]?.value ?? item.value ?? 0;
  }
  return insights;
}
