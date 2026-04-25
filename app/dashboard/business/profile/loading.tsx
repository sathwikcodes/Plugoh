import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessProfileLoading() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)]">
      <div className="relative z-10 container max-w-2xl py-6">
        <div className="space-y-4">
          <div className="rounded-[34px] border border-white/8 bg-white/5 p-6 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-start gap-5">
                <Skeleton className="h-20 w-20 rounded-full shrink-0 bg-white/20" />
                <div className="flex-1 space-y-2 pt-2">
                  <Skeleton className="h-7 w-48 bg-white/20" />
                  <Skeleton className="h-4 w-32 bg-white/20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-25 rounded-full bg-white/10"
              />
            ))}
          </div>

          <div>
            <Skeleton className="h-14 w-full rounded-2xl bg-white/10" />
          </div>

          <div className="space-y-4 pt-2">
            <Skeleton className="h-40 w-full rounded-[34px] bg-white/5 border border-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
