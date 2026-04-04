"use client";

import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  locale?: string;
}

export function AnimatedNumber({
  value,
  duration = 1200,
  locale = "en-IN",
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let rafId = 0;

    if (value === 0) {
      rafId = requestAnimationFrame(() => setDisplayed(0));
      return () => cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      setDisplayed(0);
      const start = Date.now();

      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(value * eased));
        if (progress < 1) rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return <>{displayed.toLocaleString(locale)}</>;
}
