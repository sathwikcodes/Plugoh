"use client";

import { m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useMyInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { fadeUp } from "@/lib/animations";
import { parseLocation } from "@/lib/location-time";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { LocationTag } from "@/components/ui/location-tag";

export default function InfluencerDashboard() {
  const { user, profile } = useAuth();
  const { data: ip, isLoading } = useMyInfluencerProfile(user?.id);

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  const displayName = ip?.display_name || profile?.full_name || "Creator";
  const storedLocation = profile?.location || ip?.city || null;
  const { city, country } = parseLocation(storedLocation);

  return (
    <div className="container flex min-h-[calc(100dvh-4rem)] flex-col py-4 md:min-h-dvh md:py-6">
      <m.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="shrink-0 text-center"
      >
        <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          Hey, <span className="heading-mix-accent">{displayName}</span>
        </h1>
        <div className="mt-4 flex items-center justify-center">
          <LocationTag city={city} country={country} />
        </div>
      </m.div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6">
        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl rounded-[28px] border border-white/12 bg-[linear-gradient(155deg,rgba(21,25,34,0.88)_0%,rgba(27,34,48,0.84)_100%)] px-6 py-8 text-center shadow-[0_20px_56px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-8"
        >
          <p className="mx-auto max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            Thank you for being part of{" "}
            <Image
              src="/logo-gold.png"
              alt="Plugoh"
              width={60}
              height={24}
              style={{
                width: "3.2em",
                height: "1.25em",
                objectFit: "cover",
                objectPosition: "center",
                display: "inline-block",
                verticalAlign: "middle",
                marginTop: "-0.2em",
                marginLeft: "0.15em",
              }}
            />
            . We&rsquo;re building this thoughtfully, with a lot more to come,
            and your feedback helps shape what we create next. If you have a
            suggestion, improvement, or issue to share, we&rsquo;d truly value
            hearing from you through the anonymous form below.
          </p>
        </m.div>

        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex w-full justify-center"
        >
          <Link
            href="/dashboard/influencer/campaigns"
            className="flex w-[80vw] max-w-xs items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-bold text-[#1d1c1c] shadow-[0_4px_16px_rgba(255,255,255,0.1)] transition-all hover:bg-neutral-200 active:scale-95"
          >
            Let&rsquo;s go
          </Link>
        </m.div>
      </div>
    </div>
  );
}
