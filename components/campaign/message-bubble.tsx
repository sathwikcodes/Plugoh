"use client";

import { cn } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { formatFileSize } from "@/lib/file-upload";
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

export function SystemMessage({ content }: { content: string | null }) {
  return (
    <div className="flex justify-center py-2">
      <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
        {content}
      </span>
    </div>
  );
}
