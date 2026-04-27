import type { Database } from "@/lib/supabase/types";

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  payment_method?: string | null;
};
