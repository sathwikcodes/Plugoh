import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StrengthItem {
  label: string;
  done: boolean;
  field: string;
}

interface ProfileStrengthCardProps {
  items: StrengthItem[];
  completeness: number;
  isComplete: boolean;
  onNavigateToSettings: () => void;
}

export function ProfileStrengthCard({
  items,
  completeness,
  isComplete,
  onNavigateToSettings,
}: ProfileStrengthCardProps) {
  if (isComplete) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/5 backdrop-blur-md px-4 py-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-green-400">
          Profile complete
        </span>
      </div>
    );
  }

  const ringColor =
    completeness >= 80
      ? "text-green-500"
      : completeness >= 50
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-white/5"
            />
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - completeness / 100)}`}
              className={cn(ringColor, "transition-all duration-700")}
              transform="rotate(-90 36 36)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-extrabold">{completeness}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Profile Strength
          </p>
          <div className="flex flex-wrap gap-1.5">
            {items
              .filter((item) => !item.done)
              .slice(0, 3)
              .map((item) => (
                <button
                  key={item.field}
                  onClick={onNavigateToSettings}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    completeness >= 50
                      ? "bg-yellow-500/10 hover:brightness-125"
                      : "bg-red-500/10 hover:brightness-125",
                  )}
                >
                  {item.label}
                  <ArrowRight className="h-3 w-3 opacity-50" />
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
