"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authReady, roleLoading, needsOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const checkingAuth = !authReady || roleLoading;

  useEffect(() => {
    if (checkingAuth) return;
    if (!user) {
      router.replace("/login");
    } else if (needsOnboarding && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [checkingAuth, user, needsOnboarding, pathname, router]);

  if (checkingAuth || !user || needsOnboarding) {
    return <PageLoadingSpinner />;
  }

  return <>{children}</>;
}
