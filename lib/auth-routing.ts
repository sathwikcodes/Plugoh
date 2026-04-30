import type { Database } from "@/lib/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export function getDashboardPath(role: AppRole) {
  return role === "influencer"
    ? "/dashboard/influencer"
    : "/dashboard/business";
}
