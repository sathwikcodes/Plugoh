import { Briefcase, CheckCircle2, IndianRupee, TrendingUp } from "lucide-react";

export interface CampaignStats {
  total: number;
  completed: number;
  totalSpent: number;
  acceptanceRate: number;
}

interface CampaignStatsCardProps {
  stats: CampaignStats;
}

export function CampaignStatsCard({ stats }: CampaignStatsCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Brand Stats
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
              <Briefcase className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <p className="text-[11px] text-muted-foreground">Total Campaigns</p>
          </div>
          <p className="text-lg font-extrabold">{stats.total}</p>
        </div>

        <div className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            </div>
            <p className="text-[11px] text-muted-foreground">Completed</p>
          </div>
          <p className="text-lg font-extrabold">{stats.completed}</p>
        </div>

        <div className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <IndianRupee className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <p className="text-[11px] text-muted-foreground">Total Spent</p>
          </div>
          <p className="text-lg font-extrabold">
            ₹{stats.totalSpent.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <p className="text-[11px] text-muted-foreground">Acceptance Rate</p>
          </div>
          <p className="text-lg font-extrabold">{stats.acceptanceRate}%</p>
        </div>
      </div>
    </div>
  );
}
