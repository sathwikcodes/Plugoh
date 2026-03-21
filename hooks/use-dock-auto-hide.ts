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

  // Desktop auto-hide hover state
  const [isHovered, setIsHovered] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Reset hover state when navigating away from inbox
  useEffect(() => {
    if (!isInboxPage) setIsHovered(false);
  }, [isInboxPage]);

  // Cleanup timer on unmount
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

  // Resolve final visibility
  let shouldHideDock = false;
  let showTriggerZone = false;

  if (isInboxPage) {
    if (isMobile) {
      // Mobile: hide dock when in active chat, show on conversation list
      shouldHideDock = hasChatOpen;
    } else {
      // Desktop: auto-hide with hover trigger
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
