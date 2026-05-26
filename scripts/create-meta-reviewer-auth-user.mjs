#!/usr/bin/env node
/**
 * Creates or updates the Meta App Review Supabase Auth user.
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * META_REVIEW_EMAIL, META_REVIEW_PASSWORD in env or .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { envOrLocal } from "./lib/load-env-local.mjs";

const url = envOrLocal("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = envOrLocal("SUPABASE_SERVICE_ROLE_KEY");
const email = envOrLocal("META_REVIEW_EMAIL") || "meta-reviewer@plugoh.in";
const password = envOrLocal("META_REVIEW_PASSWORD");

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}
if (!password) {
  console.error("Missing META_REVIEW_PASSWORD.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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
  if (error) {
    console.error("updateUserById failed:", error.message);
    process.exit(1);
  }
  console.log(`Updated Meta reviewer auth user: ${email} (${existing.id})`);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("createUser failed:", error.message);
    process.exit(1);
  }
  console.log(`Created Meta reviewer auth user: ${email} (${data.user.id})`);
}

console.log("Next: run supabase/seed_meta_reviewer.sql in the SQL editor.");
