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
