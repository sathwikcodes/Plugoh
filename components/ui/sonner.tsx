"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";
import { getAlertClassName } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const toastDescriptionReadable: Record<
  "success" | "error" | "warning" | "info",
  string
> = {
  success:
    "[&_[data-description]]:!text-green-950 [&_[data-description]]:!opacity-100",
  error:
    "[&_[data-description]]:!text-red-950 [&_[data-description]]:!opacity-100",
  warning:
    "[&_[data-description]]:!text-amber-950 [&_[data-description]]:!opacity-100",
  info: "[&_[data-description]]:!text-blue-950 [&_[data-description]]:!opacity-100",
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return (
    <Sonner
      position={isMobile ? "top-center" : "bottom-right"}
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon
            className="size-4 shrink-0 align-middle"
            strokeWidth={2}
          />
        ),
        info: (
          <InfoIcon className="size-4 shrink-0 align-middle" strokeWidth={2} />
        ),
        warning: (
          <TriangleAlertIcon
            className="size-4 shrink-0 align-middle"
            strokeWidth={2}
          />
        ),
        error: (
          <OctagonXIcon
            className="size-4 shrink-0 align-middle"
            strokeWidth={2}
          />
        ),
        loading: (
          <Loader2Icon className="size-4 shrink-0 animate-spin align-middle" />
        ),
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "inherit",
          "--normal-border": "transparent",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "w-full min-w-0 max-w-full p-0 shadow-none [&>[data-icon]]:mt-0.5",
          ),
          icon: "flex shrink-0 items-center justify-center leading-none",
          content:
            "min-w-0 flex-1 flex flex-col gap-0.5 [&>[data-title]]:leading-snug",
          title: "font-bold capitalize leading-snug",
          description: "leading-snug font-normal",
          success: cn(
            getAlertClassName("success", undefined, { align: "start" }),
            toastDescriptionReadable.success,
          ),
          error: cn(
            getAlertClassName("error", undefined, { align: "start" }),
            toastDescriptionReadable.error,
          ),
          warning: cn(
            getAlertClassName("warning", undefined, { align: "start" }),
            toastDescriptionReadable.warning,
          ),
          info: cn(
            getAlertClassName("info", undefined, { align: "start" }),
            toastDescriptionReadable.info,
          ),
          default: cn(
            getAlertClassName("info", undefined, { align: "start" }),
            toastDescriptionReadable.info,
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
