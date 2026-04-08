"use client";

import { useState, useCallback } from "react";
import { useMotionValue, useTransform } from "framer-motion";

const SWIPE_THRESHOLD = 60;

interface UseCardStackDragOptions {
  total: number;
}

export function useCardStackDrag({ total }: UseCardStackDragOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDir, setDragDir] = useState<"left" | "right" | null>(null);

  const dragX = useMotionValue(0);
  const rotateY = useTransform(dragX, [-200, 0, 200], [-10, 0, 10]);
  const overlayOpacity = useTransform(
    dragX,
    [-220, -80, 0, 80, 220],
    [0.72, 0.88, 1, 0.88, 0.72],
  );

  const moveToEnd = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const moveToStart = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const { x: offsetX } = info.offset;
      const { x: velX } = info.velocity;

      if (Math.abs(offsetX) > SWIPE_THRESHOLD || Math.abs(velX) > 500) {
        if (offsetX < 0 || velX < -300) {
          setDragDir("left");
          setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % total);
            setDragDir(null);
          }, 120);
        } else {
          setDragDir("right");
          setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + total) % total);
            setDragDir(null);
          }, 120);
        }
        return;
      }

      dragX.set(0);
    },
    [dragX, total],
  );

  return {
    currentIndex,
    setCurrentIndex,
    dragDir,
    dragX,
    rotateY,
    overlayOpacity,
    moveToEnd,
    moveToStart,
    handleDragEnd,
  };
}
