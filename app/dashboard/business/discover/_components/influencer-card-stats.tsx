import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
          className="h-[18px] w-[18px] object-contain"
        />
      ) : (
        <Image
          src="/premium_target.png"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
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
          className="h-[18px] w-[18px] object-contain"
        />
      ) : (
        <Image
          src="/leaf.png"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
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
  const isOnRequest = label === "On request";

  return (
    <Link
      href={`/dashboard/business/discover/${profileId}`}
      className={cn(
        "group/price flex w-full items-stretch overflow-hidden rounded-[16px] border border-white/22 bg-[linear-gradient(180deg,rgba(54,60,72,0.62)_0%,rgba(20,24,31,0.74)_100%)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.06)] backdrop-blur-[11px] transition-transform duration-200 hover:scale-[1.02] hover:border-white/28",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2.5 py-2.5 sm:gap-2 sm:px-3 sm:py-3">
        {isOnRequest ? null : (
          <Image
            src="/coin.png"
            alt=""
            width={24}
            height={24}
            className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6"
          />
        )}
        <p className="truncate text-[20px] font-bold leading-none tracking-[-0.045em] text-white sm:text-[24px]">
          {label}
        </p>
      </div>
    </Link>
  );
}
