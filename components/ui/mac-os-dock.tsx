"use client";

import { useRef, useState } from "react";
import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface DockApp {
  id: string;
  name: string;
  icon: string;
  separatorBefore?: boolean;
  badgeCount?: number;
}

interface MacOSDockProps {
  apps: DockApp[];
  onAppClick: (appId: string) => void;
  openApps?: string[];
  className?: string;
}

// Icon sizing constants
const BASE_SIZE = 46; // px — resting icon size
const MAX_SIZE = 64; // px — max icon size when cursor is directly over it
const DIST = 140; // px — magnification influence radius

function useIsTouchDevice() {
  const [isTouch] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
  );
  return isTouch;
}

interface DockIconProps {
  app: DockApp;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  isOpen: boolean;
  onClick: () => void;
  isTouch: boolean;
}

function DockIcon({ app, mouseX, isOpen, onClick, isTouch }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Distance from cursor to this icon's center — computed as a derived motion value
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - (bounds.left + bounds.width / 2);
  });

  // Map distance to a target size
  const sizeSync = useTransform(
    distance,
    [-DIST, 0, DIST],
    [BASE_SIZE, MAX_SIZE, BASE_SIZE],
  );

  // Spring smoothing — fast, no wobble (desktop only)
  const sizeSpring = useSpring(sizeSync, {
    mass: 0.1,
    stiffness: 200,
    damping: 20,
  });

  return (
    <div
      className="relative flex flex-col items-center justify-end group cursor-pointer"
      style={{
        paddingBottom: isOpen ? "6px" : "0px",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
      onClick={onClick}
    >
      {/* Tooltip — desktop only */}
      {!isTouch && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none
                     opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10"
        >
          <span className="whitespace-nowrap text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {app.name}
          </span>
        </div>
      )}

      {/* Icon image */}
      <m.div
        ref={ref}
        style={{
          width: isTouch ? BASE_SIZE : sizeSpring,
          height: isTouch ? BASE_SIZE : sizeSpring,
          willChange: "width, height",
        }}
        className="relative"
      >
        {/* Unread badge */}
        {(app.badgeCount ?? 0) > 0 && (
          <div className="absolute -top-1 -right-1 z-10 min-w-[16px] h-4 px-0.5 rounded-full bg-white/95 backdrop-blur-sm text-neutral-800 text-[9px] font-bold flex items-center justify-center leading-none pointer-events-none shadow-md">
            {app.badgeCount! > 99 ? "99+" : app.badgeCount}
          </div>
        )}

        {/* Active glow — sits behind icon, bleeds outward */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.38) 0%, transparent 68%)",
            transform: "scale(1.2)",
            borderRadius: "50%",
            filter: "blur(5px)",
            zIndex: -1,
            opacity: isOpen ? 1 : 0,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={app.icon}
          alt={app.name}
          className="w-full h-full object-contain rounded-xl select-none"
          style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
          draggable={false}
        />
      </m.div>

      {/* Active indicator dot */}
      <span
        className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-[3px] h-0.75 rounded-full bg-white/75 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

export default function MacOSDock({
  apps,
  onAppClick,
  openApps = [],
  className,
}: MacOSDockProps) {
  const mouseX = useMotionValue(Infinity);
  const isTouch = useIsTouchDevice();

  return (
    <m.div
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        mouseX.set(e.pageX);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        mouseX.set(Infinity);
      }}
      className={cn(
        "flex items-end justify-between md:justify-start gap-0 md:gap-5 px-4 md:px-8 py-1.5 md:py-2.5",
        "rounded-2xl",
        "bg-black/25 backdrop-blur-xl",
        "border border-white/[0.1]",
        "shadow-xl shadow-black/20",
        className,
      )}
    >
      {apps.flatMap((app, i) => {
        const nodes = [];
        if (app.separatorBefore) {
          nodes.push(
            <div
              key={`sep-${i}`}
              className="self-center flex-shrink-0 w-px h-[36px] rounded-full bg-white/[0.15]"
            />,
          );
        }
        nodes.push(
          <DockIcon
            key={app.id}
            app={app}
            mouseX={mouseX}
            isOpen={openApps.includes(app.id)}
            onClick={() => onAppClick(app.id)}
            isTouch={isTouch}
          />,
        );
        return nodes;
      })}
    </m.div>
  );
}
