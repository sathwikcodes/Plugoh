import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FunnelData {
  sent: number;
  accepted: number;
  done: number;
}

interface AnalyticsFunnelProps {
  data: FunnelData;
}

const STAGES = [
  { key: "sent", label: "Sent", color: "text-amber-400", bg: "bg-amber-400/10" },
  {
    key: "accepted",
    label: "Accepted",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    key: "done",
    label: "Completed",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
] as const;

export function AnalyticsFunnel({ data }: AnalyticsFunnelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Campaign Funnel
      </p>
      <div className="flex items-center gap-3">
        {STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "flex-1 rounded-xl px-3 py-3 text-center",
                stage.bg,
              )}
            >
              <p className={cn("text-xl font-extrabold", stage.color)}>
                {data[stage.key]}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {stage.label}
              </p>
            </div>
            {i < 2 && (
              <IndianRupee className="h-3 w-3 text-muted-foreground/30 shrink-0 -rotate-90" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
