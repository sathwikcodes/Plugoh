"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "@/contexts/auth-context";

/**
 * Syncs the authenticated user's identity into Sentry scope.
 * Placed inside AuthProvider so it can read user/role from context.
 * Tags every error with: user ID, email, and app role (business/influencer/admin).
 */
export function SentryUserIdentifier() {
  const { user, role } = useAuth();

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        role: role ?? "unknown",
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user, role]);

  return null;
}
