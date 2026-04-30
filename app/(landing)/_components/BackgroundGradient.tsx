"use client";

import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";
import styles from "../landing.module.css";

export function BackgroundGradient() {
  return (
    <div className={styles.bgGradient} aria-hidden>
      <AnimatedGradientBackground
        Breathing
        gradientColors={GRADIENT_COLORS}
        gradientStops={GRADIENT_STOPS}
        startingGap={96}
        breathingRange={2}
        animationSpeed={0.008}
        containerStyle={GRADIENT_STYLE}
        gradientOrigin="50% 118%"
      />
    </div>
  );
}
