import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThreeDButton } from "@/components/ui/3d-button";

export function VerificationBadge() {
  return (
    <div className="ml-0.5 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
      <Image
        src="/verified.png"
        alt="Verified"
        width={28}
        height={28}
        className="h-7 w-7 object-contain drop-shadow-[0_6px_14px_rgba(255,255,255,0.28)]"
      />
    </div>
  );
}

interface MetricPillProps {
  kind: "followers" | "engagement";
  value: string;
}

export function MetricPill({ kind, value }: MetricPillProps) {
  const isFollowers = kind === "followers";

  return (
    <div className="flex min-w-0 items-center gap-2">
      {isFollowers ? (
        <Image
          src="/people_insta.png"
          alt=""
          width={18}
          height={18}
          className="h-4.5 w-4.5 object-contain"
        />
      ) : (
        <Image
          src="/premium_target.png"
          alt=""
          width={18}
          height={18}
          className="h-4.5 w-4.5 object-contain"
        />
      )}
      <p className="truncate text-[14px] font-semibold tracking-[-0.03em] text-white">
        {value}
      </p>
    </div>
  );
}

interface ExperiencePillProps {
  isPro: boolean;
}

export function ExperiencePill({ isPro }: ExperiencePillProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {isPro ? (
        <Image
          src="/fire.png"
          alt=""
          width={18}
          height={18}
          className="h-4.5 w-4.5 object-contain"
        />
      ) : (
        <Image
          src="/leaf.png"
          alt=""
          width={18}
          height={18}
          className="h-4.5 w-4.5 object-contain"
        />
      )}
      <p
        className={cn(
          "truncate text-[14px] font-semibold tracking-[-0.03em]",
          isPro ? "text-orange-300" : "text-emerald-300",
        )}
      >
        {isPro ? "Pro" : "Fresh"}
      </p>
    </div>
  );
}

interface PriceButtonProps {
  profileId: string;
  label: string;
  className?: string;
}

export function PriceButton({ profileId, label, className }: PriceButtonProps) {
  const isNumeric = label !== "On request";

  return (
    <ThreeDButton
      asChild
      label={label}
      hoverLabel={label}
      hideIcon
      customIcon={
        isNumeric ? (
          <Image
            src="/coin.png"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 shrink-0 object-contain"
          />
        ) : null
      }
      className={cn(
        "three-d-button--no-glow three-d-button--sm three-d-button--sm-tall w-full",
        className,
      )}
    >
      <Link href={`/dashboard/business/discover/${profileId}`} />
    </ThreeDButton>
  );
}
