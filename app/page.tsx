import { CTASection } from "@/components/ui/hero-dithering-card";
import { EtheralShadow } from "@/components/ui/etheral-shadow";
import { ClientsSection } from "@/components/landing/clients-section";
import { Features5 } from "@/components/ui/features-5";
import { Features } from "@/components/ui/features-8";
import { FeatureCarouselSection } from "@/components/landing/feature-carousel-section";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { MapSection } from "@/components/landing/map-section";
import { FaqSectionWrapper } from "@/components/landing/faq-section-wrapper";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background">
      {/* Etheral Shadow background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <EtheralShadow
          color="rgba(128, 128, 128, 1)"
          animation={{ scale: 100, speed: 90 }}
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
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
