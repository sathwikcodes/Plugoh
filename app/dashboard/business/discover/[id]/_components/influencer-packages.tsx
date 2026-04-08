import type { BookablePackage } from "@/lib/booking";

interface PackageItem {
  key: BookablePackage;
  label: string;
  price: number;
}

interface InfluencerPackagesProps {
  availablePackages: PackageItem[];
  canOpenBooking: boolean;
  turnaroundTime: string | null;
  onSelectPackage: (pkg: BookablePackage) => void;
}

export function InfluencerPackages({
  availablePackages,
  canOpenBooking,
  turnaroundTime,
  onSelectPackage,
}: InfluencerPackagesProps) {
  if (availablePackages.length === 0) return null;

  return (
    <div id="packages" className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Packages</h2>
        <p className="text-sm text-slate-400">
          Fixed pricing keeps booking fast and predictable.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {availablePackages.map((item) => (
          <button
            key={item.key}
            type="button"
            disabled={!canOpenBooking}
            onClick={() => onSelectPackage(item.key)}
            className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 text-left transition hover:border-slate-700 hover:shadow-[0_12px_24px_rgba(2,6,23,0.4)] disabled:cursor-default"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              ₹{item.price.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {canOpenBooking
                ? "Tap to book this package"
                : "Bookable once your profile is ready"}
            </p>
          </button>
        ))}
      </div>
      {turnaroundTime ? (
        <p className="text-xs text-slate-400">
          Typical turnaround:{" "}
          <span className="font-medium text-slate-200">
            {turnaroundTime.replace(/_/g, " ").replace(/(\d)(\d)/, "$1-$2")}
          </span>
        </p>
      ) : null}
    </div>
  );
}
