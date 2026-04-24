"use client";

import { m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useMyBusinessProfile } from "@/hooks/queries/use-business-profiles";
import { getBusinessDisplayName } from "@/lib/business-profile";
import { fadeUp } from "@/lib/animations";
import { parseLocation } from "@/lib/location-time";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { LocationTag } from "@/components/ui/location-tag";
import BusinessDashboardLoading from "./loading";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";

export default function BusinessDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const { data: identity, isLoading: identityLoading } = useMyBusinessProfile(
    user?.id,
  );

  if (authLoading || identityLoading) {
    return <BusinessDashboardLoading />;
  }

  const displayName = getBusinessDisplayName(
    identity ?? { basicProfile: profile, businessProfile: null },
  );

  const storedLocation =
    identity?.businessProfile?.brand_location ||
    identity?.basicProfile?.location ||
    profile?.location ||
    null;
  const { city, country } = parseLocation(storedLocation);

  return (
    <div className="relative h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatedGradientBackground
          Breathing
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={125}
          breathingRange={2.2}
          animationSpeed={0.008}
          topOffset={0}
          containerStyle={GRADIENT_STYLE}
        />
      </div>

      <div className="relative z-10 container flex h-full flex-col py-4 md:py-6">
        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="shrink-0 text-center"
        >
          <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Hey,{" "}
            <span className="heading-mix-accent">{displayName || "there"}</span>
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
              href="/dashboard/business/discover"
              className="flex w-[80vw] max-w-xs items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-[0_4px_24px_rgba(229,185,74,0.28)] transition-all hover:brightness-105 active:scale-95"
            >
              Book Now
            </Link>
          </m.div>
        </div>
      </div>
    </div>
  );
}
