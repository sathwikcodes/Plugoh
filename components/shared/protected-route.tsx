"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authReady, needsOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/login");
    } else if (needsOnboarding && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [authReady, user, needsOnboarding, pathname, router]);

  if (authReady && (!user || needsOnboarding)) return null;

  return <>{children}</>;
}
