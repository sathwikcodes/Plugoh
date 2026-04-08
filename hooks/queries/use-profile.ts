import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useProfile(userId: string | undefined | null) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.profile.getMyProfile.queryOptions(),
    enabled: !!userId,
  });
}
