import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";
import { createServiceClient } from "@/lib/supabase/server";
import { getAuthUserAvatarUrl } from "@/lib/avatar-utils";

async function fetchAuthAvatarMap(userIds: string[]) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map<string, string | null>();

  const adminDb = createServiceClient();
  const results = await Promise.all(
    uniqueIds.map(async (userId) => {
      const { data, error } = await adminDb.auth.admin.getUserById(userId);
      if (error || !data.user) return [userId, null] as const;
      return [userId, getAuthUserAvatarUrl(data.user)] as const;
    }),
  );

  return new Map<string, string | null>(results);
}

export const inboxRouter = router({
  getBusinessInboxConversations: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const { data: campaigns, error: campError } = await db
      .from("campaigns")
      .select("*")
      .eq("business_id", user.id)
      .neq("status", "rejected")
      .order("updated_at", { ascending: false });

    if (campError)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: campError.message,
      });
    if (!campaigns || campaigns.length === 0) return [];

    const influencerIds = [...new Set(campaigns.map((c) => c.influencer_id))];
    const campaignIds = campaigns.map((c) => c.id);

    const [{ data: profiles }, { data: allMessages }, avatarMap] =
      await Promise.all([
        db.from("influencer_profiles").select("*").in("user_id", influencerIds),
        db
          .from("campaign_messages")
          .select("*")
          .in("campaign_id", campaignIds)
          .neq("message_type", "system")
          .order("created_at", { ascending: false }),
        fetchAuthAvatarMap(influencerIds),
      ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    const messageMap = new Map<
      string,
      typeof allMessages extends (infer T)[] | null ? T : never
    >();
    for (const msg of allMessages ?? []) {
      if (!messageMap.has(msg.campaign_id)) {
        messageMap.set(msg.campaign_id, msg);
      }
    }

    const convos = campaigns.map((c) => ({
      campaign: c,
      influencerProfile: profileMap.get(c.influencer_id) ?? null,
      influencerAuthAvatarUrl: avatarMap.get(c.influencer_id) ?? null,
      lastMessage: messageMap.get(c.id) ?? null,
    }));

    return convos.toSorted((a, b) => {
      const aTime =
        a.lastMessage?.created_at ??
        a.campaign.updated_at ??
        a.campaign.created_at;
      const bTime =
        b.lastMessage?.created_at ??
        b.campaign.updated_at ??
        b.campaign.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }),

  getInboxConversations: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const { data: campaigns, error: campError } = await db
      .from("campaigns")
      .select("*")
      .eq("influencer_id", user.id)
      .neq("status", "rejected")
      .order("updated_at", { ascending: false });

    if (campError)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: campError.message,
      });
    if (!campaigns || campaigns.length === 0) return [];

    const businessIds = [...new Set(campaigns.map((c) => c.business_id))];
    const campaignIds = campaigns.map((c) => c.id);

    const [
      { data: basicProfiles },
      { data: businessProfiles },
      { data: allMessages },
      avatarMap,
    ] = await Promise.all([
      db.from("profiles").select("*").in("id", businessIds),
      db.from("business_profiles").select("*").in("user_id", businessIds),
      db
        .from("campaign_messages")
        .select("*")
        .in("campaign_id", campaignIds)
        .neq("message_type", "system")
        .order("created_at", { ascending: false }),
      fetchAuthAvatarMap(businessIds),
    ]);

    const profileMap = new Map((basicProfiles ?? []).map((p) => [p.id, p]));
    const businessMap = new Map(
      (businessProfiles ?? []).map((bp) => [bp.user_id, bp]),
    );
    const messageMap = new Map<
      string,
      typeof allMessages extends (infer T)[] | null ? T : never
    >();
    for (const msg of allMessages ?? []) {
      if (!messageMap.has(msg.campaign_id)) {
        messageMap.set(msg.campaign_id, msg);
      }
    }

    const convos = campaigns.map((c) => ({
      campaign: c,
      businessProfile: {
        basicProfile: profileMap.get(c.business_id) ?? null,
        businessProfile: businessMap.get(c.business_id) ?? null,
        authAvatarUrl: avatarMap.get(c.business_id) ?? null,
      },
      lastMessage: messageMap.get(c.id) ?? null,
    }));

    return convos.toSorted((a, b) => {
      const aTime =
        a.lastMessage?.created_at ??
        a.campaign.updated_at ??
        a.campaign.created_at;
      const bTime =
        b.lastMessage?.created_at ??
        b.campaign.updated_at ??
        b.campaign.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }),
});
