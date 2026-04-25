"use client";

import { m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useMyBusinessProfile } from "@/hooks/queries/use-business-profiles";
import { useMyProfile } from "@/hooks/queries/use-my-identity";
import { getBusinessDisplayName } from "@/lib/business-profile";
import { fadeUp } from "@/lib/animations";
import { parseLocation } from "@/lib/location-time";
import { ThreeDButton } from "@/components/ui/3d-button";
import { LocationTag } from "@/components/ui/location-tag";
import BusinessDashboardLoading from "./loading";

export default function BusinessDashboard() {
  const { user, authReady } = useAuth();
  const { data: profile } = useMyProfile();
  const { data: identity, isLoading: identityLoading } = useMyBusinessProfile(
    user?.id,
  );

  if (!authReady || identityLoading) {
    return <BusinessDashboardLoading />;
  }

  const displayName = getBusinessDisplayName(
    identity ?? { basicProfile: profile ?? null, businessProfile: null },
  );

  const storedLocation =
    identity?.businessProfile?.brand_location ||
    identity?.basicProfile?.location ||
    profile?.location ||
    null;
  const { city, country } = parseLocation(storedLocation);

  return (
    <div className="relative h-dvh overflow-hidden">
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
            <ThreeDButton asChild label="Book Now">
              <Link href="/dashboard/business/discover">Book Now</Link>
            </ThreeDButton>
          </m.div>
        </div>
      </div>
    </div>
  );
}
