"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronUp, BookOpen, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  title: string | null;
  brandName: string;
  packageType: string | null;
  amount: number | null;
  status: "completed" | "accepted";
  date: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  className?: string;
}

// Only these three columns are sortable
type SortCol = "amount" | "date" | "status";
type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPackageConfig(type: string | null) {
  const t = (type || "").toLowerCase();
  if (t.includes("reel"))
    return {
      label: "Reel",
      icon: null as typeof BookOpen | null,
      img: "/reel.png",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };
  if (t.includes("post"))
    return {
      label: "Post",
      icon: null as typeof BookOpen | null,
      img: "/image.png",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
  if (t.includes("story") || t.includes("stories"))
    return {
      label: "Story",
      icon: BookOpen,
      img: null as string | null,
      color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    };
  return {
    label: type || "Other",
    icon: Zap,
    img: null as string | null,
    color: "bg-white/10 text-muted-foreground border-white/10",
  };
}

function formatDate(iso: string) {
  try {
    return format(parseISO(iso), "dd MMM yyyy");
  } catch {
    return iso;
  }
}

function sortTransactions(
  txs: Transaction[],
  col: SortCol,
  dir: SortDir,
): Transaction[] {
  return [...txs].sort((a, b) => {
    let cmp = 0;
    switch (col) {
      case "amount":
        cmp = (a.amount ?? 0) - (b.amount ?? 0);
        break;
      case "date":
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

// ─── Sort Header — single rotating arrow ─────────────────────────────────────

interface SortHeaderProps {
  label: string;
  col: SortCol;
  active: SortCol | null;
  dir: SortDir;
  onSort: (col: SortCol, dir: SortDir) => void;
  className?: string;
}

function SortHeader({
  label,
  col,
  active,
  dir,
  onSort,
  className,
}: SortHeaderProps) {
  const isActive = active === col;
  const isDesc = isActive && dir === "desc";

  const handleClick = () => {
    if (!isActive)
      onSort(col, "asc"); // new column → start ascending
    else if (dir === "asc")
      onSort(col, "desc"); // was asc → go descending
    else onSort(col, "asc"); // was desc → go ascending
  };

  return (
    <button
      onClick={handleClick}
      className={cn("flex items-center gap-1 select-none group", className)}
    >
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150",
          isActive
            ? "text-foreground/80"
            : "text-muted-foreground group-hover:text-foreground/60",
        )}
      >
        {label}
      </span>
      {/* Single arrow — rotates 180° to flip between up (asc) and down (desc) */}
      <motion.div
        animate={{ rotate: isDesc ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className={cn(
          isActive
            ? "text-primary"
            : "text-muted-foreground/25 group-hover:text-muted-foreground/50",
        )}
      >
        <ChevronUp className="h-3 w-3" strokeWidth={isActive ? 2.5 : 2} />
      </motion.div>
    </button>
  );
}

// ─── Plain column label (no sort) ─────────────────────────────────────────────

function PlainHeader({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none",
        className,
      )}
    >
      {label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TransactionTable({
  transactions,
  className,
}: TransactionTableProps) {
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (col: SortCol, dir: SortDir) => {
    setSortCol(col);
    setSortDir(dir);
  };

  const sorted = useMemo(
    () =>
      sortCol ? sortTransactions(transactions, sortCol, sortDir) : transactions,
    [transactions, sortCol, sortDir],
  );

  const rowVariants = {
    hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 380,
        damping: 26,
        mass: 0.6,
      },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  };

  if (transactions.length === 0) {
    return (
      <div className={cn("py-10 text-center", className)}>
        <img
          src="/premium.png"
          alt="no transactions"
          className="h-10 w-10 mx-auto object-contain opacity-30 mb-3"
        />
        <p className="text-sm text-muted-foreground">
          No transactions yet. Complete campaigns to see your earnings here.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto rounded-xl">
        <div className="min-w-[720px]">
          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1.2fr_1.2fr_1fr] gap-3 px-4 py-2.5 mb-1">
            <PlainHeader label="Campaign" />
            <PlainHeader label="Type" />
            <PlainHeader label="Brand" />
            <SortHeader
              label="Amount"
              col="amount"
              active={sortCol}
              dir={sortDir}
              onSort={handleSort}
            />
            <SortHeader
              label="Date"
              col="date"
              active={sortCol}
              dir={sortDir}
              onSort={handleSort}
            />
            <SortHeader
              label="Status"
              col="status"
              active={sortCol}
              dir={sortDir}
              onSort={handleSort}
              className="justify-end"
            />
          </div>

          {/* Rows */}
          <motion.div
            className="space-y-1.5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sorted.map((tx) => {
              const isEarned = tx.status === "completed";
              const pkg = getPackageConfig(tx.packageType);

              return (
                <motion.div key={tx.id} variants={rowVariants}>
                  <motion.div
                    className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden"
                    whileHover={{
                      y: -1,
                      backgroundColor: "rgba(255,255,255,0.055)",
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      },
                    }}
                  >
                    {/* Status glow — right edge */}
                    <div
                      className={cn(
                        "absolute inset-y-0 right-0 w-1/3 pointer-events-none",
                        isEarned
                          ? "bg-gradient-to-l from-green-500/[0.07] to-transparent"
                          : "bg-gradient-to-l from-yellow-500/[0.07] to-transparent",
                      )}
                    />

                    <div className="relative grid grid-cols-[2fr_1fr_1.5fr_1.2fr_1.2fr_1fr] gap-3 items-center px-4 py-3.5">
                      {/* Campaign — Wallet icon (no background) + title/brand */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src="/premium.png"
                          alt="campaign"
                          className="h-5 w-5 shrink-0 object-contain"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate leading-tight">
                            {tx.title || "Untitled Campaign"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5 leading-tight">
                            {tx.brandName}
                          </p>
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border",
                            pkg.color,
                          )}
                        >
                          {pkg.img ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={pkg.img}
                              alt={pkg.label}
                              className="h-3 w-3 object-contain"
                            />
                          ) : pkg.icon ? (
                            (() => {
                              const Icon = pkg.icon;
                              return <Icon className="h-3 w-3" />;
                            })()
                          ) : null}
                          {pkg.label}
                        </span>
                      </div>

                      {/* Brand */}
                      <p className="text-sm text-muted-foreground truncate">
                        {tx.brandName}
                      </p>

                      {/* Amount — coin.png + number, no ₹ symbol */}
                      <div className="flex items-center gap-1.5">
                        <img
                          src="/coin.png"
                          alt="coin"
                          className="h-3.5 w-3.5 object-contain shrink-0"
                        />
                        <span
                          className={cn(
                            "text-sm font-extrabold tabular-nums",
                            isEarned ? "text-green-400" : "text-yellow-400",
                          )}
                        >
                          {(tx.amount ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Date */}
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {formatDate(tx.date)}
                      </p>

                      {/* Status */}
                      <div className="flex justify-end">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                            isEarned
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                          )}
                        >
                          {isEarned ? "Earned" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
