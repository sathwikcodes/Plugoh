"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  Download,
  BookOpen,
  Zap,
  Briefcase,
  CheckCircle,
  X,
} from "lucide-react";
import { formatFileSize } from "@/lib/file-upload";
import { motion } from "framer-motion";
import type { Json } from "@/lib/supabase/types";

interface MessageBubbleProps {
  content: string | null;
  messageType: string;
  metadata: Json | null;
  isOwn: boolean;
  senderName: string;
  timestamp: string;
}

interface FileMetadata {
  url: string;
  filename: string;
  size?: number;
  mime_type?: string;
}

function FileAttachment({ metadata }: { metadata: FileMetadata }) {
  const url = metadata.url;
  const fileName = metadata.filename;
  const fileSize = metadata.size;
  const mimeType = metadata.mime_type || "";

  const isImage = mimeType.startsWith("image/");

  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-1 rounded-lg overflow-hidden max-w-[280px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={fileName}
          className="w-full h-auto rounded-lg"
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 mt-1 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <FileText className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{fileName}</p>
        {fileSize && (
          <p className="text-xs text-muted-foreground">
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <Download className="h-4 w-4 text-muted-foreground shrink-0" />
    </a>
  );
}

export function MessageBubble({
  content,
  messageType,
  metadata,
  isOwn,
  senderName,
  timestamp,
}: MessageBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const metaObj = (metadata || {}) as Record<string, unknown>;
  const hasFile = messageType === "file" && typeof metaObj.url === "string";

  return (
    <div
      className={cn(
        "flex flex-col max-w-[80%] sm:max-w-[70%]",
        isOwn ? "ml-auto items-end" : "mr-auto items-start",
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md",
        )}
      >
        {!isOwn && (
          <p className="text-xs font-medium mb-1 opacity-70">{senderName}</p>
        )}
        {content && (
          <p className="whitespace-pre-wrap wrap-break-word">{content}</p>
        )}
        {hasFile && (
          <FileAttachment
            metadata={{
              url: metaObj.url as string,
              filename: (metaObj.filename as string) || "file",
              size: metaObj.size as number | undefined,
              mime_type: metaObj.mime_type as string | undefined,
            }}
          />
        )}
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 px-1">
        {time}
      </span>
    </div>
  );
}

// ─── Booking Card (rich message for new campaign bookings) ────────────────────

interface BookingCardMeta {
  title?: string;
  package_type?: string | null;
  price_offered?: number;
  brief?: string;
  business_name?: string;
}

interface BookingCardMessageProps {
  metadata: Json | null;
  campaignStatus?: string;
  isInfluencer?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  isMutating?: boolean;
}

function getPackageIcon(type: string | null | undefined) {
  const t = (type || "").toLowerCase();
  if (t.includes("reel"))
    return {
      label: "Reel",
      icon: null as typeof BookOpen | null,
      img: "/reel.png",
      color: "text-purple-400",
      bg: "from-purple-500/20 to-violet-500/20",
    };
  if (t.includes("post"))
    return {
      label: "Post",
      icon: null as typeof BookOpen | null,
      img: "/image.png",
      color: "text-blue-400",
      bg: "from-blue-500/20 to-cyan-500/20",
    };
  if (t.includes("story") || t.includes("stories"))
    return {
      label: "Story",
      icon: BookOpen,
      img: null as string | null,
      color: "text-pink-400",
      bg: "from-pink-500/20 to-rose-500/20",
    };
  return {
    label: type || "Package",
    icon: Zap,
    img: null as string | null,
    color: "text-muted-foreground",
    bg: "from-white/10 to-white/5",
  };
}

const statusConfig: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  pending: {
    label: "Awaiting Response",
    dot: "bg-amber-400",
    text: "text-amber-400",
  },
  accepted: { label: "Accepted", dot: "bg-green-400", text: "text-green-400" },
  rejected: { label: "Declined", dot: "bg-red-400", text: "text-red-400" },
  completed: {
    label: "Completed",
    dot: "bg-violet-400",
    text: "text-violet-400",
  },
};

export function BookingCardMessage({
  metadata,
  campaignStatus,
  isInfluencer,
  onAccept,
  onDecline,
  isMutating,
}: BookingCardMessageProps) {
  const meta = (metadata || {}) as BookingCardMeta;
  const pkg = getPackageIcon(meta.package_type);
  const brief = meta.brief || "";
  const truncatedBrief =
    brief.length > 150 ? brief.slice(0, 150) + "..." : brief;
  const status = statusConfig[campaignStatus || ""] || statusConfig.pending;
  const isPending = campaignStatus === "pending";
  const isRejected = campaignStatus === "rejected";
  const showActions = isInfluencer && isPending && onAccept && onDecline;

  return (
    <div className="flex justify-center py-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "w-full max-w-[380px] rounded-2xl border overflow-hidden transition-opacity",
          isRejected ? "border-white/5 opacity-60" : "border-white/[0.08]",
        )}
      >
        {/* ── Gradient header ── */}
        <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent">
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/[0.06]"
            >
              <Briefcase className="h-5 w-5 text-pink-400" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">
                Collaboration Proposal
              </p>
              {meta.business_name && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  from{" "}
                  <span className="font-semibold text-foreground/80">
                    {meta.business_name}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 pb-5 space-y-4">
          {/* Campaign title */}
          <motion.h3
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-[15px] font-bold leading-snug tracking-tight"
          >
            {meta.title || "Untitled Campaign"}
          </motion.h3>

          {/* Info rows */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.06]"
          >
            {/* Package */}
            {meta.package_type && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-muted-foreground">Package</span>
                <span className="inline-flex items-center gap-1.5">
                  {pkg.img ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={pkg.img}
                      alt={pkg.label}
                      className="h-4 w-4 object-contain"
                    />
                  ) : pkg.icon ? (
                    (() => {
                      const Icon = pkg.icon;
                      return <Icon className={cn("h-3.5 w-3.5", pkg.color)} />;
                    })()
                  ) : null}
                  <span className="text-xs font-semibold">{pkg.label}</span>
                </span>
              </div>
            )}

            {/* Budget */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">Budget</span>
              <span className="inline-flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/coin.png"
                  alt="coin"
                  className="h-4 w-4 object-contain"
                />
                <span className="text-sm font-extrabold tabular-nums tracking-tight">
                  ₹{(meta.price_offered ?? 0).toLocaleString("en-IN")}
                </span>
              </span>
            </div>

            {/* Status */}
            {campaignStatus && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                  />
                  <span className={cn("text-xs font-semibold", status.text)}>
                    {status.label}
                  </span>
                </span>
              </div>
            )}
          </motion.div>

          {/* Brief */}
          {truncatedBrief && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="relative pl-3 border-l-2 border-white/[0.08]"
            >
              <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                &ldquo;{truncatedBrief}&rdquo;
              </p>
            </motion.div>
          )}

          {/* Accept / Decline actions */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="space-y-2 pt-1"
            >
              <button
                onClick={onAccept}
                disabled={isMutating}
                className={cn(
                  "w-full h-10 rounded-xl text-sm font-semibold transition-all",
                  "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
                  "hover:brightness-110 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  "flex items-center justify-center gap-2",
                )}
              >
                <CheckCircle className="h-4 w-4" />
                Accept Collaboration
              </button>
              <button
                onClick={onDecline}
                disabled={isMutating}
                className={cn(
                  "w-full h-9 rounded-xl text-xs font-medium transition-all",
                  "border border-white/10 text-muted-foreground",
                  "hover:bg-white/5 hover:text-foreground active:scale-[0.98]",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  "flex items-center justify-center gap-1.5",
                )}
              >
                <X className="h-3.5 w-3.5" />
                Decline
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function SystemMessage({ content }: { content: string | null }) {
  return (
    <div className="flex justify-center py-2">
      <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
        {content}
      </span>
    </div>
  );
}
