"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const HIDE_DELAY_MS = 300;
const SCROLL_PEEK_MS = 1200;
const SCROLL_BOTTOM_THRESHOLD = 10;

export function useDockAutoHide() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const isInboxPage = pathname.includes("/inbox");
  const hasChatOpen = searchParams.get("chat") !== null;
  const [isOverlayHidden, setIsOverlayHidden] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isScrollPeek, setIsScrollPeek] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const clearScrollTimer = useCallback(() => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  }, []);

  // Reset hover state when chat closes or we leave inbox
  useEffect(() => {
    if (!hasChatOpen) {
      const frame = window.requestAnimationFrame(() => setIsHovered(false));
      return () => window.cancelAnimationFrame(frame);
    }
  }, [hasChatOpen]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);
  useEffect(() => () => clearScrollTimer(), [clearScrollTimer]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const syncOverlayState = () => {
      setIsOverlayHidden(document.body.dataset.mobileDockHidden === "true");
    };

    syncOverlayState();

    const observer = new MutationObserver(syncOverlayState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-mobile-dock-hidden"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInboxPage) return;

    const handleScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const { scrollTop, scrollHeight, clientHeight } = target;
      if (scrollHeight <= clientHeight) return;

      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD) {
        clearScrollTimer();
        setIsScrollPeek(true);
        scrollTimerRef.current = setTimeout(
          () => setIsScrollPeek(false),
          SCROLL_PEEK_MS,
        );
      }
    };

    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", handleScroll, { capture: true });
  }, [clearScrollTimer, isInboxPage]);

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

  if (isInboxPage) {
    if (isMobile) {
      // Mobile: show on list, hide inside chat
      shouldHideDock = hasChatOpen;
    } else {
      // Desktop: hidden on inbox, peek on hover/scroll
      const shouldShow = isHovered || isScrollPeek;
      shouldHideDock = !shouldShow;
      showTriggerZone = !shouldShow;
    }
  } else if (isMobile && isOverlayHidden) {
    shouldHideDock = true;
  }

  return {
    shouldHideDock,
    showTriggerZone,
    onTriggerEnter,
    onDockEnter,
    onDockLeave,
  };
}
