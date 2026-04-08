import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md overflow-hidden",
        "bg-[length:400px_100%]",
        "[background-image:linear-gradient(90deg,var(--muted)_25%,color-mix(in_srgb,var(--muted)_70%,var(--muted-foreground)_30%)_50%,var(--muted)_75%)]",
        "[animation:skeleton-shimmer_1.5s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
