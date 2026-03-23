"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface SocialProofProps {
  brands: string[] | null;
}

export default function SocialProof({ brands }: SocialProofProps) {
  if (!brands || brands.length === 0) {
    return (
      <m.div variants={fadeUp}>
        <Link
          href="/dashboard/influencer/complete-profile?step=3"
          className="block rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center transition-colors hover:border-white/20 hover:bg-white/[0.04]"
        >
          <p className="text-sm text-muted-foreground">
            Add brands you&apos;ve collaborated with
          </p>
        </Link>
      </m.div>
    );
  }

  return (
    <m.div variants={fadeUp}>
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Worked With
        </p>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Badge
              key={brand}
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-sm"
            >
              {brand}
            </Badge>
          ))}
        </div>
      </div>
    </m.div>
  );
}
