"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, m } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ThreeDButton } from "@/components/ui/3d-button";
import {
  SORT_OPTIONS,
  STATUS_FILTERS,
  STATUS_PILL_LABELS,
  type SortMode,
  type StatusFilter,
} from "./campaign-constants";

interface CampaignSortPanelProps {
  open: boolean;
  onClose: () => void;
  activeTab: "status" | "sort";
  setActiveTab: (v: "status" | "sort") => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  statusCounts: Record<StatusFilter, number>;
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
}

export function CampaignSortPanel({
  open,
  onClose,
  activeTab,
  setActiveTab,
  statusFilter,
  setStatusFilter,
  statusCounts,
  sortMode,
  setSortMode,
}: CampaignSortPanelProps) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open && isMobile) document.body.dataset.mobileDockHidden = "true";
    else delete document.body.dataset.mobileDockHidden;
    return () => {
      delete document.body.dataset.mobileDockHidden;
    };
  }, [isMobile, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  const content = (
    <div className="flex h-full min-h-0 flex-col">
      {isMobile && (
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1.5 w-22 rounded-full bg-white/14" />
        </div>
      )}
      <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-white/45" />
          <span className="text-[15px] font-semibold text-white">
            Sort campaigns
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/6 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-2 gap-4 px-2 pb-3">
            {(["status", "sort"] as const).map((tab) => (
              <ThreeDButton
                key={tab}
                label={tab === "status" ? "Status" : "Sort"}
                hideIcon={true}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "three-d-button--sm transition-all duration-300",
                  activeTab !== tab && "three-d-button--neutral",
                )}
              />
            ))}
          </div>
          {activeTab === "status" ? (
            <div className="space-y-3">
              <p className="eyebrow-label text-[10px] text-white/35">
                Filter by status
              </p>
              <div className="space-y-3">
                {STATUS_FILTERS.map((sf) => {
                  const active = statusFilter === sf;
                  const count = statusCounts[sf];
                  const isUrgent = sf === "requested" && count > 0 && !active;
                  return (
                    <button
                      key={sf}
                      type="button"
                      onClick={() => {
                        setStatusFilter(sf);
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[22px] border px-4 py-3.5 text-left transition-colors",
                        active
                          ? "border-white/20 bg-white/10"
                          : isUrgent
                            ? "border-yellow-400/40 bg-yellow-400/10 hover:bg-yellow-400/15"
                            : "border-white/10 bg-white/[0.035] hover:bg-white/6.5",
                      )}
                    >
                      <div className="pr-4">
                        <p
                          className={cn(
                            "text-[15px]",
                            active
                              ? "text-white"
                              : isUrgent
                                ? "text-yellow-200"
                                : "text-white",
                          )}
                        >
                          {STATUS_PILL_LABELS[sf]}
                        </p>
                        <p className="mt-1 text-[12px] text-white/42">
                          {count} campaign{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex min-w-8 items-center justify-center rounded-full border px-2 py-1 text-[11px]",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : isUrgent
                              ? "border-yellow-300/30 bg-yellow-300/12 text-yellow-200"
                              : "border-white/12 text-white/45",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="eyebrow-label text-[10px] text-white/35">Sort by</p>
              <div className="space-y-3">
                {SORT_OPTIONS.map((opt) => {
                  const active = sortMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortMode(opt.value);
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[22px] border px-4 py-3.5 text-left transition-colors",
                        active
                          ? "border-white/20 bg-white/10"
                          : "border-white/10 bg-white/[0.035] hover:bg-white/6.5",
                      )}
                    >
                      <div className="pr-4">
                        <p className="text-[15px] text-white">{opt.label}</p>
                        <p className="mt-1 text-[12px] text-white/42">
                          {opt.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white/12 text-transparent",
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-current" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            key="sort-backdrop"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          {isMobile ? (
            <m.div
              key="sort-sheet-mobile"
              ref={panelRef}
              className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[88dvh] flex-col rounded-t-[32px] border-t border-white/10 bg-[#141414] text-white shadow-[0_-24px_60px_rgba(0,0,0,0.55)]"
              style={{ height: "min(88dvh, 760px)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90) onClose();
              }}
            >
              {content}
            </m.div>
          ) : (
            <m.div
              key="sort-panel-desktop"
              ref={panelRef}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-105 flex-col border-l border-white/10 bg-[#141414] text-white shadow-[-28px_0_90px_rgba(0,0,0,0.5)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
            >
              {content}
            </m.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
