"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, domAnimation } from "framer-motion";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SentryUserIdentifier } from "@/components/shared/sentry-user-identifier";
import { TRPCProvider, trpcClient } from "@/lib/trpc/client";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 min — most data is stable
            gcTime: 30 * 60 * 1000, // 30 min — back-nav stays instant
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false, // re-use cache on remount
            refetchOnReconnect: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <TooltipProvider>
          <LazyMotion features={domAnimation} strict>
            <AuthProvider>
              <SentryUserIdentifier />
              {children}
              <Toaster />
            </AuthProvider>
          </LazyMotion>
        </TooltipProvider>
      </TRPCProvider>
    </QueryClientProvider>
  );
}
