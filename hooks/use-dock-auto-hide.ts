"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const HIDE_DELAY_MS = 300;

export function useDockAutoHide() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const isInboxPage = pathname.includes("/inbox");
  const hasChatOpen = searchParams.get("chat") !== null;

  const [isHovered, setIsHovered] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Reset hover state when chat closes or we leave inbox
  useEffect(() => {
    if (!hasChatOpen) setIsHovered(false);
  }, [hasChatOpen]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const onTriggerEnter = useCallback(() => {
    clearHideTimer();
    setIsHovered(true);
  }, [clearHideTimer]);

  const onDockEnter = useCallback(() => {
    clearHideTimer();
  }, [clearHideTimer]);

  const onDockLeave = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setIsHovered(false), HIDE_DELAY_MS);
  }, []);

  let shouldHideDock = false;
  let showTriggerZone = false;

  if (isInboxPage && hasChatOpen) {
    if (isMobile) {
      // Mobile: hard hide, no way to peek
      shouldHideDock = true;
    } else {
      // Desktop: hidden but hover at bottom edge peeks it back
      shouldHideDock = !isHovered;
      showTriggerZone = !isHovered;
    }
  }

  return {
    shouldHideDock,
    showTriggerZone,
    onTriggerEnter,
    onDockEnter,
    onDockLeave,
  };
}
