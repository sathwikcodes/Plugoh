"use client";

import { RazorpayScript } from "@/components/shared/razorpay-script";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-background md:min-h-dvh">
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
      <RazorpayScript />
    </div>
  );
}
