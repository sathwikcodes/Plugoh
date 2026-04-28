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

export function AuthShell({
  children,
  hideLogo,
}: {
  children: ReactNode;
  hideLogo?: boolean;
}) {
  return (
    <div className="fixed inset-0 flex w-full flex-col items-center justify-center overflow-hidden bg-[#08060d] px-4 py-2 sm:px-6 sm:py-10">
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

      <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center justify-center">
        {!hideLogo && (
          <m.div
            className="mb-1.5 sm:mb-6"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Image
              src="/logo-gold.png"
              alt="Plugoh"
              height={120}
              width={380}
              className="h-[clamp(4.55rem,11.9vh,5.95rem)] w-auto sm:h-24"
              style={{ objectFit: "contain" }}
              priority
            />
          </m.div>
        )}

        <div
          className="w-full rounded-2xl px-4 py-3 sm:rounded-3xl sm:px-8 sm:py-8"
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
