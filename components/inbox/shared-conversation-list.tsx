"use client";

import { useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

interface ListRow {
  id: string;
  searchText: string;
  node: React.ReactNode;
}

interface SharedConversationListProps {
  rows: ListRow[];
  totalCount: number;
  isLoading: boolean;
  emptySearchLabel: string;
  emptyIdleLabel: string;
  emptyIdleHint: string;
}

const listStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function SharedConversationList({
  rows,
  totalCount,
  isLoading,
  emptySearchLabel,
  emptyIdleLabel,
  emptyIdleHint,
}: SharedConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) => row.searchText.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="shrink-0 px-5 pt-5 pb-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold tracking-tight text-white/92">
            Messages
          </h2>
          {totalCount > 0 && (
            <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white/70">
              {totalCount}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className={cn(
              "h-10 w-full rounded-xl border pl-10 pr-4 text-sm",
              "border-white/14 bg-[linear-gradient(145deg,rgba(8,11,16,0.94),rgba(14,18,25,0.9))] text-white/88",
              "placeholder:text-white/38",
              "focus:border-white/24 focus:bg-[linear-gradient(145deg,rgba(12,16,23,0.96),rgba(18,24,34,0.92))] focus:outline-none",
              "transition-all duration-200",
            )}
          />
        </div>
      </div>

      <div className="mx-4 h-px shrink-0 bg-white/12" />

      <div className="flex-1 overflow-y-auto min-h-0 py-1.5">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/6 bg-white/3">
              <Search className="h-5 w-5 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-muted-foreground/70">
              {search ? emptySearchLabel : emptyIdleLabel}
            </p>
            {!search && (
              <p className="mt-1.5 max-w-50 text-xs text-muted-foreground/40">
                {emptyIdleHint}
              </p>
            )}
          </div>
        ) : (
          <m.div
            className="space-y-2 px-2.5 py-1"
            variants={listStagger}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((row) => (
              <m.div
                key={row.id}
                variants={itemFade}
                style={{
                  contentVisibility: "auto",
                  containIntrinsicSize: "0 76px",
                }}
              >
                {row.node}
              </m.div>
            ))}
          </m.div>
        )}
      </div>
    </div>
  );
}
