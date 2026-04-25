"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type PillPreset = "gold" | "emerald" | "amber" | "rose" | "sky" | "violet" | "slate";

export type PillCustomColor = {
  base: string;
  light: string;
  mid: string;
  dark: string;
  ink: string;
  glow: string;
};

export type ThreeDPillProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> & {
  label: string;
  color?: PillPreset | PillCustomColor;
  icon?: React.ReactNode;
};

function isCustomColor(c: PillPreset | PillCustomColor): c is PillCustomColor {
  return typeof c === "object";
}

const ThreeDPill = React.forwardRef<HTMLSpanElement, ThreeDPillProps>(
  ({ label, color = "gold", icon, className, style, ...props }, ref) => {
    const presetClass =
      !isCustomColor(color) && color !== "gold" ? `three-d-pill--${color}` : undefined;

    const customVars: React.CSSProperties = isCustomColor(color)
      ? ({
          "--pill-base": color.base,
          "--pill-light": color.light,
          "--pill-mid": color.mid,
          "--pill-dark": color.dark,
          "--pill-ink": color.ink,
          "--pill-glow": color.glow,
        } as React.CSSProperties)
      : {};

    return (
      <span
        ref={ref}
        className={cn("three-d-pill", presetClass, className)}
        style={{ ...customVars, ...style }}
        {...props}
      >
        <div className="pill-bg" />
        <div className="pill-outline" />
        <span className="pill-label min-w-0">
          {icon}
          <span className="pill-text">{label}</span>
        </span>
      </span>
    );
  },
);

ThreeDPill.displayName = "ThreeDPill";

export { ThreeDPill };
