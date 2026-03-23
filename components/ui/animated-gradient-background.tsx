import { m } from "framer-motion";
import React, { useEffect, useRef, memo } from "react";

interface AnimatedGradientBackgroundProps {
  startingGap?: number;
  Breathing?: boolean;
  gradientColors?: string[];
  gradientStops?: number[];
  animationSpeed?: number;
  breathingRange?: number;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  topOffset?: number;
}

const DEFAULT_COLORS = [
  "#0A0A0A",
  "#2979FF",
  "#FF80AB",
  "#FF6D00",
  "#FFD600",
  "#00E676",
  "#3D5AFE",
];
const DEFAULT_STOPS = [35, 50, 60, 70, 80, 90, 100];
const DEFAULT_STYLE: React.CSSProperties = {};

const INITIAL_ANIM = { opacity: 0, scale: 1.5 };
const ANIMATE_ANIM = {
  opacity: 1,
  scale: 1,
  transition: {
    duration: 2,
    ease: [0.25, 0.1, 0.25, 1] as const,
  },
};

const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> =
  memo(
    ({
      startingGap = 125,
      Breathing = false,
      gradientColors = DEFAULT_COLORS,
      gradientStops = DEFAULT_STOPS,
      animationSpeed = 0.02,
      breathingRange = 5,
      containerStyle = DEFAULT_STYLE,
      topOffset = 0,
      containerClassName = "",
    }) => {
      if (gradientColors.length !== gradientStops.length) {
        throw new Error(
          `GradientColors and GradientStops must have the same length. Received gradientColors length: ${gradientColors.length}, gradientStops length: ${gradientStops.length}`,
        );
      }

      const containerRef = useRef<HTMLDivElement | null>(null);

      useEffect(() => {
        let animationFrame: number;
        let width = startingGap;
        let directionWidth = 1;

        const animateGradient = () => {
          if (width >= startingGap + breathingRange) directionWidth = -1;
          if (width <= startingGap - breathingRange) directionWidth = 1;

          if (!Breathing) directionWidth = 0;
          width += directionWidth * animationSpeed;

          const gradientStopsString = gradientStops
            .map((stop, index) => `${gradientColors[index]} ${stop}%`)
            .join(", ");

          const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 20%, ${gradientStopsString})`;

          if (containerRef.current) {
            containerRef.current.style.background = gradient;
          }

          animationFrame = requestAnimationFrame(animateGradient);
        };

        animationFrame = requestAnimationFrame(animateGradient);

        return () => cancelAnimationFrame(animationFrame);
      }, [
        startingGap,
        Breathing,
        gradientColors,
        gradientStops,
        animationSpeed,
        breathingRange,
        topOffset,
      ]);

      return (
        <m.div
          key="animated-gradient-background"
          initial={INITIAL_ANIM}
          animate={ANIMATE_ANIM}
          className={`absolute inset-0 overflow-hidden ${containerClassName}`}
        >
          <div
            ref={containerRef}
            style={containerStyle}
            className="absolute inset-0 transition-transform"
          />
        </m.div>
      );
    },
  );

AnimatedGradientBackground.displayName = "AnimatedGradientBackground";

export default AnimatedGradientBackground;
