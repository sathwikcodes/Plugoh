"use client";

import { type ReactNode } from "react";
import {
  AuthThemeProvider,
  useAuthTheme,
} from "@/components/auth/theme-context";
import { ThemeToggle } from "@/components/shared/theme-toggle";

function AuthLayoutInner({ children }: { children: ReactNode }) {
  const { theme } = useAuthTheme();
  return (
    <div data-auth-theme={theme} className="min-h-screen relative">
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      {children}
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthThemeProvider>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </AuthThemeProvider>
  );
}
