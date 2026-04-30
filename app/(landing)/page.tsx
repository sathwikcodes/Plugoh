import { BackgroundGradient } from "./_components/BackgroundGradient";
import { ScrollProgress } from "./_components/ScrollProgress";
import { SiteHeader } from "./_components/SiteHeader";
import { HeroSection } from "./_components/HeroSection";
import { AirplanesSection } from "./_components/AirplanesSection";
import { HowItWorksSection } from "./_components/HowItWorksSection";
import { PuzzleSection } from "./_components/PuzzleSection";
import { SiteFooter } from "./_components/SiteFooter";
import { BottomNav } from "./_components/BottomNav";
import { FaqDrawer } from "./_components/FaqDrawer";

export default function LandingPage() {
  return (
    <>
      <BackgroundGradient />
      <ScrollProgress />
      <SiteHeader />
      <HeroSection />
      <section id="about">
        <AirplanesSection />
      </section>
      <section id="how-it-works">
        <HowItWorksSection />
      </section>
      <section id="puzzle">
        <PuzzleSection />
      </section>
      <SiteFooter />
      <BottomNav />
      <FaqDrawer />
    </>
  );
}
