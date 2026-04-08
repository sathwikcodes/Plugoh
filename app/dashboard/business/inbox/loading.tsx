import { Skeleton } from "@/components/ui/skeleton";

function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-11 w-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export default function InboxLoading() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] bg-[#0F1115]">
      {/* Left pane — conversation list */}
      <div className="w-full md:w-80 md:border-r md:border-border flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border">
          <Skeleton className="h-6 w-20" />
        </div>
        {/* Conversation rows */}
        <div className="flex-1 overflow-hidden divide-y divide-border/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <ConversationRowSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Right pane — chat area (desktop only) */}
      <div className="hidden md:flex flex-1 flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        {/* Empty chat body */}
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-12 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
}
