import type { AuthTheme } from "./theme-context";

interface GradientConfig {
  gradientColors: string[];
  gradientStops: number[];
  startingGap: number;
  breathingRange: number;
  animationSpeed: number;
  topOffset: number;
}

const configs: Record<
  AuthTheme,
  { dark: GradientConfig; light: GradientConfig }
> = {
  neutral: {
    dark: {
      gradientColors: ["#0A0A0A", "#1a1a2e", "#16213e", "#0f3460", "#1a1a2e"],
      gradientStops: [30, 50, 65, 80, 100],
      startingGap: 150,
      breathingRange: 8,
      animationSpeed: 0.02,
      topOffset: 0,
    },
    light: {
      gradientColors: ["#f5f5f7", "#e8e8ec", "#dddde3", "#d0d0d8", "#e8e8ec"],
      gradientStops: [30, 50, 65, 80, 100],
      startingGap: 150,
      breathingRange: 8,
      animationSpeed: 0.02,
      topOffset: 0,
    },
  },
  influencer: {
    dark: {
      gradientColors: [
        "#0A0A0A",
        "#dd2a7b",
        "#8134af",
        "#f58529",
        "#515bd4",
        "#dd2a7b",
        "#0A0A0A",
      ],
      gradientStops: [20, 40, 52, 64, 76, 88, 100],
      startingGap: 130,
      breathingRange: 12,
      animationSpeed: 0.03,
      topOffset: 0,
    },
    light: {
      gradientColors: [
        "#faf7fa",
        "#f5c0d8",
        "#d0a0e0",
        "#f0b880",
        "#c8a0f0",
        "#f5c0d8",
        "#faf7fa",
      ],
      gradientStops: [20, 40, 52, 64, 76, 88, 100],
      startingGap: 130,
      breathingRange: 12,
      animationSpeed: 0.03,
      topOffset: 0,
    },
  },
  brand: {
    dark: {
      gradientColors: [
        "#0A0A0A",
        "#e6c240",
        "#d4af37",
        "#b8860b",
        "#e6c240",
        "#0A0A0A",
      ],
      gradientStops: [20, 40, 55, 70, 85, 100],
      startingGap: 140,
      breathingRange: 10,
      animationSpeed: 0.025,
      topOffset: 0,
    },
    light: {
      gradientColors: [
        "#faf9f6",
        "#e8d080",
        "#d4b840",
        "#c5a028",
        "#e8d080",
        "#faf9f6",
      ],
      gradientStops: [25, 45, 58, 72, 86, 100],
      startingGap: 160,
      breathingRange: 6,
      animationSpeed: 0.015,
      topOffset: 0,
    },
  },
};

export function getGradientConfig(
  theme: AuthTheme,
  isDark: boolean,
): GradientConfig {
  return configs[theme][isDark ? "dark" : "light"];
}
