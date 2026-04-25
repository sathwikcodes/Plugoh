"use client";

import { useEffect, useState } from "react";
import { MoveUpRight } from "lucide-react";

interface LocationTagProps {
  city?: string;
  country?: string;
}

export function LocationTag({
  city = "Vijaywada",
  country = "India",
}: LocationTagProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const locationLabel = country ? `${city}, ${country}` : city;

  return (
    <button
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-center gap-2.5 rounded-full border border-white/16 bg-white/6 px-3 py-2 text-white transition-all duration-500 ease-out hover:border-white/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] sm:gap-3 sm:px-4 sm:py-2.5"
    >
      <div className="relative flex items-center justify-center">
        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-hidden">
        <span
          className="text-xs font-medium text-white transition-all duration-500 sm:text-sm"
          style={{
            transform: isHovered ? "translateY(-100%)" : "translateY(0)",
            opacity: isHovered ? 0 : 1,
          }}
        >
          {locationLabel}
        </span>

        <span
          className="absolute left-9 whitespace-nowrap text-xs font-medium text-white transition-all duration-500 sm:left-11 sm:text-sm"
          style={{
            transform: isHovered ? "translateY(0)" : "translateY(100%)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          {currentTime}
        </span>
      </div>

      <MoveUpRight
        className="h-2.5 w-2.5 text-white/65 transition-all duration-300 sm:h-3 sm:w-3"
        style={{
          transform: isHovered
            ? "translateX(2px) rotate(-45deg)"
            : "translateX(0) rotate(0)",
          opacity: isHovered ? 1 : 0.65,
        }}
      />
    </button>
  );
}
