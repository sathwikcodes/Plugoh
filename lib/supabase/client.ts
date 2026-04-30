import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let _client: SupabaseClient<Database> | null = null;

// Lazy singleton — defers client creation until first use so Next.js static
// generation doesn't throw when NEXT_PUBLIC_SUPABASE_URL is not set at build time.
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop: string | symbol) {
    if (!_client) {
      _client = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      );
    }
    return (_client as unknown as Record<string | symbol, unknown>)[prop];
  },
});
