"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";

const Digit = ({ value, compact }: { value: number; compact?: boolean }) => {
  return (
    <div className={`relative overflow-hidden rounded-md bg-zinc-900 font-mono font-bold text-white flex items-center justify-center ${compact ? "h-10 w-7 text-xl" : "h-14 w-10 text-3xl"}`}>
      <AnimatePresence mode="popLayout">
        <m.span
          key={value}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {value}
        </m.span>
      </AnimatePresence>
    </div>
  );
};

interface FlipClockProps {
  expiresAt?: string | null;
  onExpire?: () => void;
  className?: string;
  compact?: boolean;
}

function getTimeLeft(expiresAt: string): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function FlipClock({
  expiresAt,
  onExpire,
  className,
  compact,
}: FlipClockProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    expiresAt ? getTimeLeft(expiresAt) : 0,
  );

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const remaining = getTimeLeft(expiresAt);
      setTimeLeft(remaining);
      if (remaining === 0) {
        onExpire?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const [hours, minutes, seconds] = formatTime(timeLeft).split(":");

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`.trim()}>
      {hours.split("").map((digit, i) => (
        <Digit key={`h-${i}`} value={parseInt(digit)} compact={compact} />
      ))}
      <span className={`font-bold text-white/40 ${compact ? "text-xl" : "text-3xl"}`}>:</span>
      {minutes.split("").map((digit, i) => (
        <Digit key={`m-${i}`} value={parseInt(digit)} compact={compact} />
      ))}
      <span className={`font-bold text-white/40 ${compact ? "text-xl" : "text-3xl"}`}>:</span>
      {seconds.split("").map((digit, i) => (
        <Digit key={`s-${i}`} value={parseInt(digit)} compact={compact} />
      ))}
    </div>
  );
}
