import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useInstagramMedia(userId: string | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.instagram.getInstagramMedia.queryOptions({ userId: userId! }),
    enabled: !!userId,
  });
}

export function useTopMedia(userId: string | undefined, limit = 6) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.instagram.getTopMedia.queryOptions({ userId: userId!, limit }),
    enabled: !!userId,
  });
}

export function usePortfolioMedia(
  userId: string | undefined,
  mediaIds: string[] | null | undefined,
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.instagram.getPortfolioMedia.queryOptions({
      userId: userId!,
      mediaIds: mediaIds!,
    }),
    enabled: !!userId && !!mediaIds && mediaIds.length > 0,
  });
}
