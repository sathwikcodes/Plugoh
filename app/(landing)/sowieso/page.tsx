import { BackgroundGradient } from "./_components/BackgroundGradient";
import { ScrollProgress } from "./_components/ScrollProgress";
import { SiteHeader } from "./_components/SiteHeader";
import { HeroSection } from "./_components/HeroSection";
import { AirplanesSection } from "./_components/AirplanesSection";
import { PuzzleSection } from "./_components/PuzzleSection";
import { PhaseCards } from "./_components/PhaseCards";
import { FaqSection } from "./_components/FaqSection";
import { PageTransition } from "./_components/PageTransition";
import { PartnersSection } from "./_components/PartnersSection";
import { SiteFooter } from "./_components/SiteFooter";
import { BottomNav } from "./_components/BottomNav";

export default function SowiesoMerchantPage() {
  return (
    <>
      <BackgroundGradient />
      <ScrollProgress />
      <SiteHeader />
      <HeroSection />
      <section id="puzzle">
        <AirplanesSection />
        <PuzzleSection />
      </section>
      <section id="cards">
        <PhaseCards />
      </section>
      <section id="faq">
        <FaqSection />
      </section>
      <PageTransition />
      <PartnersSection />
      <SiteFooter />
      <BottomNav />
    </>
  );
}
