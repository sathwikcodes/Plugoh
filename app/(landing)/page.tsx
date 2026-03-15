"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { CTASection } from "./_components/cta-section";
import { EtheralShadow } from "@/components/ui/etheral-shadow";
import { Header } from "./_components/hero-section";

// Lazy-load below-the-fold sections for faster initial load
const ClientsSection = dynamic(
  () =>
    import("./_components/clients-section").then((m) => ({
      default: m.ClientsSection,
    })),
  { ssr: false },
);
const Features5 = dynamic(
  () =>
    import("./_components/features-primary-section").then((m) => ({
      default: m.Features5,
    })),
  { ssr: false },
);
const Features = dynamic(
  () =>
    import("./_components/features-alt-section").then((m) => ({
      default: m.Features,
    })),
  { ssr: false },
);
const FeatureCarouselSection = dynamic(
  () =>
    import("./_components/feature-carousel-section").then((m) => ({
      default: m.FeatureCarouselSection,
    })),
  { ssr: false },
);
const FaqSectionWrapper = dynamic(
  () =>
    import("./_components/faq-section").then((m) => ({
      default: m.FaqSectionWrapper,
    })),
  { ssr: false },
);
const MinimalFooter = dynamic(
  () =>
    import("./_components/footer").then((m) => ({ default: m.MinimalFooter })),
  { ssr: false },
);

export default function Home() {
  const { user, role, loading, needsOnboarding } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && role) {
      router.replace(`/dashboard/${role}`);
    } else if (user && needsOnboarding) {
      router.replace("/onboarding");
    } else {
      setShowLanding(true);
    }
  }, [user, role, loading, needsOnboarding, router]);

  if (!showLanding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background">
      {/* Etheral Shadow background effects */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ contain: "strict" }}
      >
        <EtheralShadow
          color="rgba(128, 128, 128, 1)"
          animation={{ scale: 30, speed: 20 }}
          noise={{ opacity: 0.8, scale: 1.2 }}
          sizing="fill"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <Header />
        <CTASection />
        <ClientsSection />
        <Features5 />
        <Features />
        <FeatureCarouselSection />
        <FaqSectionWrapper />
        <MinimalFooter />
      </div>
    </div>
  );
}
