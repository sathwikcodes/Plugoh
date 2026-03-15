"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { CTASection } from "./_components/cta-section";
import { EtheralShadow } from "@/components/ui/etheral-shadow";
import { ClientsSection } from "./_components/clients-section";
import { Features5 } from "./_components/features-primary-section";
import { Features } from "./_components/features-alt-section";
import { FeatureCarouselSection } from "./_components/feature-carousel-section";
import { MinimalFooter } from "./_components/footer";
import { FaqSectionWrapper } from "./_components/faq-section";
import { Header } from "./_components/hero-section";

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
        {/* <MapSection /> */}
        <FaqSectionWrapper />
        <MinimalFooter />
      </div>
    </div>
  );
}
