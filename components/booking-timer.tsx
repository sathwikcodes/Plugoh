"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BookingTimerProps {
  expiresAt: string | null | undefined;
  onExpire?: () => void;
  className?: string;
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

export function BookingTimer({ expiresAt, onExpire, className }: BookingTimerProps) {
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
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  if (!expiresAt) return null;

  const expired = timeLeft === 0;
  const critical = !expired && timeLeft < 30 * 60 * 1000; // < 30 min
  const urgent = !expired && !critical && timeLeft < 2 * 60 * 60 * 1000; // < 2h

  return (
    <span
      className={cn(
        "font-mono text-sm font-semibold tabular-nums",
        expired && "text-red-400",
        critical && "text-red-300",
        urgent && "text-orange-300",
        !expired && !critical && !urgent && "text-amber-200",
        className,
      )}
    >
      {expired ? "Expired" : formatTime(timeLeft)}
    </span>
  );
}
