"use client";

import * as React from "react";
import Image from "next/image";
import { m, useMotionValue, useTransform, animate } from "framer-motion";
import { Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeToHoldProps {
  amount: number;
  onConfirm: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function SwipeToHold({
  amount,
  onConfirm,
  disabled = false,
  isLoading = false,
  className,
}: SwipeToHoldProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const maxDragRef = React.useRef(0);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);

  const x = useMotionValue(0);
  const textOpacity = useTransform(x, [0, 150], [1, 0]);
  const arrowOpacity = useTransform(x, [0, 50], [1, 0.4]);
  const progressWidth = useTransform(x, (val) => val + 44);

  const getMaxDrag = React.useCallback(() => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    const handleWidth = 44;
    const padding = 12;
    return Math.max(0, containerWidth - handleWidth - padding);
  }, []);

  // Reset x when loading state clears
  React.useEffect(() => {
    if (!isLoading) {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
    }
  }, [isLoading, x]);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || isLoading) return;
      e.preventDefault();
      e.stopPropagation();
      // Capture the pointer so all subsequent move/up events come to this element,
      // bypassing Vaul's pointer capture entirely.
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      maxDragRef.current = getMaxDrag();
      isDragging.current = true;
      startX.current = e.clientX - x.get();
    },
    [disabled, isLoading, getMaxDrag, x],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      e.preventDefault();
      e.stopPropagation();
      const newX = Math.max(
        0,
        Math.min(e.clientX - startX.current, maxDragRef.current),
      );
      x.set(newX);
    },
    [x],
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      e.stopPropagation();
      const el = e.currentTarget;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }

      const threshold = maxDragRef.current * 0.8;
      if (x.get() >= threshold) {
        onConfirm();
        animate(x, maxDragRef.current, {
          type: "spring",
          stiffness: 300,
          damping: 30,
        });
      } else {
        animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
      }
    },
    [x, onConfirm],
  );

  return (
    <div
      ref={containerRef}
      data-vaul-no-drag
      className={cn(
        "relative h-14 w-full overflow-hidden rounded-full bg-white/5 p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-opacity duration-200 touch-none select-none",
        (disabled || isLoading) && "pointer-events-none opacity-60",
        className,
      )}
    >
      {/* Progress fill */}
      <m.div
        style={{ width: progressWidth, touchAction: "none" }}
        className="absolute bottom-1.5 left-1.5 top-1.5 z-0 rounded-full bg-gradient-to-r from-[#a6761b] via-[#e5b94a] to-[#fff4a8] opacity-20 shadow-[0_0_20px_rgba(229,185,74,0.4)] pointer-events-none"
      />

      {/* Track label */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-11 sm:px-12">
        <m.div
          style={{ opacity: textOpacity }}
          className="inline-flex max-w-full flex-nowrap items-center justify-center gap-2 text-sm font-semibold tracking-tight text-white/40"
        >
          <span className="shrink-0 leading-none">Swipe to hold</span>
          <span className="inline-flex shrink-0 items-center gap-1 leading-none tabular-nums">
            <Image
              src="/coin.png"
              alt=""
              width={16}
              height={16}
              className="h-3.5 w-3.5 shrink-0 object-contain opacity-60"
            />
            {amount.toLocaleString("en-IN")}
          </span>
        </m.div>
      </div>

      {/* Handle */}
      <m.div
        data-vaul-no-drag
        style={{ x, touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative z-10 flex h-11 w-11 cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#fff4a8] via-[#e5b94a] to-[#a6761b] shadow-[0_4px_0_#7b5614,0_8px_16px_rgba(229,185,74,0.3)] pointer-events-none" />
        <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

        {isLoading ? (
          <m.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="pointer-events-none"
          >
            <Lock className="h-4 w-4 text-[#0d0b0f] opacity-60" />
          </m.div>
        ) : (
          <Lock className="h-4 w-4 text-[#0d0b0f] pointer-events-none" />
        )}
      </m.div>

      {/* Arrow hints */}
      {!isLoading && (
        <m.div
          style={{ opacity: arrowOpacity }}
          className="absolute right-8 top-1/2 flex -translate-y-1/2 items-center gap-1 text-white/20 pointer-events-none"
        >
          <ChevronRight className="h-4 w-4" />
          <ChevronRight className="h-4 w-4 -ml-2" />
        </m.div>
      )}
    </div>
  );
}
