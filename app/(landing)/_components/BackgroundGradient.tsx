"use client";

import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { GRADIENT_STYLE } from "@/lib/animations";
import styles from "../landing.module.css";

const LANDING_GRADIENT_COLORS = [
  "#08060d",
  "#180e22",
  "#8a2a66",
  "#b65b20",
  "#b8912d",
  "#54203f",
  "#170c1e",
  "#060408",
];

const LANDING_GRADIENT_STOPS = [20, 34, 48, 58, 68, 78, 88, 100];

export function BackgroundGradient() {
  return (
    <div className={styles.bgGradient} aria-hidden>
      <AnimatedGradientBackground
        Breathing
        gradientColors={LANDING_GRADIENT_COLORS}
        gradientStops={LANDING_GRADIENT_STOPS}
        startingGap={96}
        breathingRange={2}
        animationSpeed={0.008}
        containerStyle={GRADIENT_STYLE}
        gradientOrigin="50% 118%"
      />
    </div>
  );
}
