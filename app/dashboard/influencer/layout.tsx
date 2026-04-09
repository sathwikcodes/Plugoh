"use client";

import type { ReactNode } from "react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";

export default function InfluencerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden md:min-h-dvh bg-[#0F1115]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <AnimatedGradientBackground
          Breathing
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={125}
          breathingRange={2.2}
          animationSpeed={0.008}
          containerStyle={GRADIENT_STYLE}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
