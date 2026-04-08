import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

interface PriceButtonProps {
  profileId: string;
  label: string;
  className?: string;
}

export function PriceButton({ profileId, label, className }: PriceButtonProps) {
  return (
    <Link
      href={`/dashboard/business/discover/${profileId}`}
      className={cn(
        "group/price inline-flex h-full min-h-[76px] items-center gap-3 rounded-[22px] bg-[#f4f4f1] px-5 py-3 text-[#111316] shadow-[0_18px_30px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:scale-[1.02]",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.22em] text-[#111316]/45">
          Starts from
        </p>
        <p className="mt-1 truncate text-[17px] font-semibold tracking-[-0.04em] text-[#111316]">
          {label}
        </p>
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111316] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/price:translate-x-0.5" />
      </div>
    </Link>
  );
}
