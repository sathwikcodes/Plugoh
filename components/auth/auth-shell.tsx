"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";

export function AuthShell({ children, hideLogo }: { children: ReactNode; hideLogo?: boolean }) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[#08060d] px-4 py-10 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <AnimatedGradientBackground
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={125}
          breathingRange={2.2}
          animationSpeed={0.008}
          containerStyle={GRADIENT_STYLE}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {!hideLogo && (
          <m.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Image
              src="/logo-gold.png"
              alt="Plugoh"
              height={120}
              width={380}
              className="h-24 w-auto sm:h-32"
              style={{ objectFit: "contain" }}
              priority
            />
          </m.div>
        )}

        <div
          className="w-full rounded-2xl px-5 py-7 sm:rounded-3xl sm:px-8 sm:py-10"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
