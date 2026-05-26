#!/usr/bin/env node
/**
 * Resets the Meta reviewer to pre-onboarding state (no role, no Instagram data)
 * so App Review can record login → onboarding → Instagram OAuth → profile.
 */
import { createClient } from "@supabase/supabase-js";
import { envOrLocal } from "./lib/load-env-local.mjs";

const url = envOrLocal("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = envOrLocal("SUPABASE_SERVICE_ROLE_KEY");
const email = envOrLocal("META_REVIEW_EMAIL") || "meta-reviewer@plugoh.in";

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
const user = list?.users?.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase(),
);

if (!user) {
  console.error(
    `No auth user for ${email}. Run npm run meta:create-reviewer first.`,
  );
  process.exit(1);
}

const userId = user.id;

const tables = [
  admin.from("instagram_media").delete().eq("user_id", userId),
  admin.from("influencer_profiles").delete().eq("user_id", userId),
  admin.from("business_profiles").delete().eq("user_id", userId),
  admin.from("user_roles").delete().eq("user_id", userId),
  admin.from("profiles").delete().eq("id", userId),
];

for (const op of tables) {
  const { error } = await op;
  if (error) {
    console.error("Reset failed:", error.message);
    process.exit(1);
  }
}

console.log(
  `Reset ${email} (${userId}) for onboarding flow. Sign in at /review → complete onboarding → connect Instagram.`,
);
