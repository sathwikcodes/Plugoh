"use client";

import * as React from "react";
import Image from "next/image";
import { m, useMotionValue, useTransform, useAnimation } from "framer-motion";
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
  const [maxDrag, setMaxDrag] = React.useState(0);
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Controls for the text opacity
  const textOpacity = useTransform(x, [0, 150], [1, 0]);
  const arrowOpacity = useTransform(x, [0, 50], [1, 0.4]);

  const updateConstraints = React.useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const handleWidth = 44; // h-11
      const padding = 12; // p-1.5 = 6px each side
      const calculatedMax = containerWidth - handleWidth - padding;
      if (calculatedMax > 0) setMaxDrag(calculatedMax);
    }
  }, []);

  React.useLayoutEffect(() => {
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [updateConstraints]);

  const handleDragEnd = async () => {
    const threshold = maxDrag * 0.8; // slightly lower threshold for better mobile feel

    if (x.get() >= threshold) {
      // Trigger confirmation
      await controls.start({ x: maxDrag, transition: { type: "spring", stiffness: 300, damping: 30 } });
      onConfirm();
    } else {
      // Snap back
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } });
    }
  };

  React.useEffect(() => {
    if (!isLoading) {
      controls.start({ x: 0 });
    }
  }, [isLoading, controls]);

  return (
    <div
      ref={containerRef}
      data-vaul-no-drag
      onPointerDown={(e) => {
        updateConstraints();
        e.stopPropagation();
      }}
      className={cn(
        "relative h-14 w-full overflow-hidden rounded-full bg-white/5 p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-opacity duration-200 touch-none",
        (disabled || isLoading) && "pointer-events-none opacity-60",
        className
      )}
    >
      {/* Dynamic Progress Fill (Champagne Gold Gradient) */}
      <m.div
        style={{ 
          width: useTransform(x, (val) => val + 44),
          touchAction: "none" 
        }}
        className="absolute bottom-1.5 left-1.5 top-1.5 z-0 rounded-full bg-gradient-to-r from-[#a6761b] via-[#e5b94a] to-[#fff4a8] opacity-20 shadow-[0_0_20px_rgba(229,185,74,0.4)] pointer-events-none"
      />

      {/* Background Track Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <m.div
          style={{ opacity: textOpacity }}
          className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-white/40"
        >
          <span>Swipe to hold</span>
          <div className="flex items-center">
            <Image
              src="/coin.png"
              alt=""
              width={16}
              height={16}
              className="mr-1 h-3.5 w-3.5 object-contain opacity-60"
            />
            {amount.toLocaleString("en-IN")}
          </div>
        </m.div>
      </div>

      {/* The 3D Handle */}
      <m.div
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag || 300 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onPointerDown={(e) => {
          updateConstraints();
          e.stopPropagation();
        }}
        animate={controls}
        style={{ x, touchAction: "none" }}
        className="relative z-10 flex h-11 w-11 cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
      >
        {/* 3D Visual Layers (similar to ThreeDButton) */}
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

      {/* Animated Arrow Indicators */}
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

