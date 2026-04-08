import { Film, ImageIcon, Mic } from "lucide-react";

const PACKAGE_ICON: Record<string, React.ElementType> = {
  reel: Film,
  post: ImageIcon,
  story: Mic,
};

export interface PackageDataItem {
  name: string;
  rawName: string;
  count: number;
  total: number;
}

interface AnalyticsPackageBreakdownProps {
  data: PackageDataItem[];
}

export function AnalyticsPackageBreakdown({
  data,
}: AnalyticsPackageBreakdownProps) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Spend by Content Type
      </p>
      <div className="flex flex-col gap-3">
        {data.map((pkg) => {
          const Icon = PACKAGE_ICON[pkg.rawName] ?? Film;
          const maxTotal = data[0]?.total || 1;
          const pct = Math.round((pkg.total / maxTotal) * 100);
          return (
            <div key={pkg.rawName} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{pkg.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {pkg.count} campaign{pkg.count > 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  ₹{pkg.total.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
