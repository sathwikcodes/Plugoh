#!/usr/bin/env node
/**
 * Creates or updates YC demo Auth users (brand + creator).
 */
import { createClient } from "@supabase/supabase-js";
import { envOrLocal } from "./lib/load-env-local.mjs";

const url = envOrLocal("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = envOrLocal("SUPABASE_SERVICE_ROLE_KEY");
const password = envOrLocal("DEMO_ACCOUNT_PASSWORD");
const brandEmail = envOrLocal("DEMO_BRAND_EMAIL") || "yc-demo-brand@plugoh.in";
const creatorEmail =
  envOrLocal("DEMO_CREATOR_EMAIL") || "yc-demo-creator@plugoh.in";

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}
if (!password) {
  console.error("Missing DEMO_ACCOUNT_PASSWORD.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsertUser(email) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      email,
      password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  return data.user.id;
}

try {
  const brandId = await upsertUser(brandEmail);
  const creatorId = await upsertUser(creatorEmail);
  console.log(`Demo brand: ${brandEmail} (${brandId})`);
  console.log(`Demo creator: ${creatorEmail} (${creatorId})`);
  console.log("Next: run supabase/seed_yc_demo.sql in the SQL editor.");
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
