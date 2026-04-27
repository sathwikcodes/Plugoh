import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Database } from "./types";

// Cache validated tokens within the same server process. Each entry lives for
// 5 minutes — well within Supabase's 1-hour token lifetime, so the user is
// never served a stale identity, but rapid successive TRPC calls (e.g. saving
// pricing) skip the remote auth round-trip entirely.
const authCache = new Map<string, { user: User; expiry: number }>();

export async function authenticateUser(token: string) {
  const now = Date.now();
  const cached = authCache.get(token);
  if (cached && now < cached.expiry) return cached.user;

  // Evict stale entries when the cache grows large.
  if (authCache.size > 200) {
    for (const [k, v] of authCache) {
      if (now > v.expiry) authCache.delete(k);
    }
  }

  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);
  if (error || !user) return null;

  authCache.set(token, { user, expiry: now + 5 * 60 * 1000 });
  return user;
}

/**
 * Create a Supabase client with the service-role key for
 * privileged database operations (bypasses RLS).
 */
export function createServiceClient(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
