"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuthTheme, type AuthTheme } from "./theme-context";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { getGradientConfig } from "./auth-gradient-config";

const taglines: Record<AuthTheme, string> = {
  neutral: "Where creators meet brands",
  influencer: "Grow your influence, land dream collabs",
  brand: "Discover creators who move the needle",
};

export function AuthShell({ children }: { children: ReactNode }) {
  const { theme } = useAuthTheme();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gradientConfig = getGradientConfig(theme, isDark);

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ background: "var(--auth-bg)" }}
    >
      {/* Left decorative panel — lg only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <AnimatedGradientBackground
          key={`${theme}-${isDark}`}
          Breathing
          {...gradientConfig}
        />
        <div className="relative z-10 text-center px-12">
          <motion.h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: "var(--auth-text)", opacity: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            ReelReach
          </motion.h1>
          <motion.p
            key={theme}
            className="text-lg max-w-xs mx-auto"
            style={{ color: "var(--auth-text-secondary)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            {taglines[theme]}
          </motion.p>
        </div>
      </div>

      {/* Right content panel */}
      <div
        className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 sm:px-8 lg:px-16 relative overflow-hidden"
        style={{ background: "var(--auth-bg)" }}
      >
        <AnimatedGradientBackground
          key={`right-${theme}-${isDark}`}
          {...gradientConfig}
          containerStyle={{ opacity: theme === "brand" ? 0.35 : 0.25 }}
          startingGap={200}
          topOffset={-30}
        />
        <div className="w-full max-w-md relative z-10">{children}</div>
      </div>
    </div>
  );
}
