"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import type { FilterPanelProps, FilterStep } from "./filter-types";
import { DESKTOP_SPRING, MOBILE_SPRING } from "./filter-types";
import { FilterPanelContent } from "./filter-panel-content";

export type {
  DiscoverFilters,
  SortField,
  SortDirection,
  FilterPanelProps,
} from "./filter-types";

export function FilterPanel({
  open,
  onClose,
  onApply,
  onClearAll,
  draftFilters,
  setDraftFilters,
  placeOptions,
  categoryOptions,
  priceBounds,
  resultCount,
  filterCount,
}: FilterPanelProps) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<FilterStep>("root");

  const handleDismiss = useCallback(() => {
    setStep("root");
    onClose();
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open && isMobile) {
      document.body.dataset.mobileDockHidden = "true";
    } else {
      delete document.body.dataset.mobileDockHidden;
    }
    return () => {
      delete document.body.dataset.mobileDockHidden;
    };
  }, [isMobile, open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (step !== "root") setStep("root");
        else handleDismiss();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDismiss, open, step]);

  const contentProps = {
    step,
    setStep,
    handleDismiss,
    isMobile,
    draftFilters,
    setDraftFilters,
    placeOptions,
    categoryOptions,
    priceBounds,
    resultCount,
    filterCount,
    onApply,
    onClose,
    onClearAll,
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <m.div
            key="filter-backdrop"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleDismiss}
          />
          {isMobile ? (
            <m.div
              key="filter-sheet-mobile"
              ref={panelRef}
              className="fixed bottom-0 left-0 right-0 z-50 flex h-[92dvh] max-h-[92dvh] flex-col overflow-hidden rounded-t-[32px] border-t border-white/10 bg-[#241e30] text-white shadow-[0_-24px_60px_rgba(0,0,0,0.55)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={MOBILE_SPRING}
            >
              <FilterPanelContent {...contentProps} />
            </m.div>
          ) : (
            <m.div
              key="filter-panel-desktop"
              ref={panelRef}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-105 flex-col border-l border-white/10 bg-[#241e30] text-white shadow-[-28px_0_90px_rgba(0,0,0,0.5)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={DESKTOP_SPRING}
            >
              <FilterPanelContent {...contentProps} />
            </m.div>
          )}
        </>
      ) : null}
    </AnimatePresence>
  );
}
