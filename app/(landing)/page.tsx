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
      <section
        aria-labelledby="plugoh-purpose"
        className="relative z-10 px-5 py-10 text-center"
        style={{ background: "#f4f0f8", color: "#1d1c1c" }}
      >
        <div className="mx-auto max-w-3xl">
          <h1
            id="plugoh-purpose"
            className="text-3xl font-extrabold tracking-tight sm:text-5xl"
          >
            Plugoh helps brands discover and book Instagram influencers.
          </h1>
          <p className="mt-4 text-base leading-7 text-black/70 sm:text-lg">
            Plugoh is an influencer marketplace for businesses and creators in
            India. Brands use Plugoh to find creators, launch campaigns, manage
            collaborations, and handle campaign payments. Influencers use Plugoh
            to showcase their profiles, connect Instagram, receive campaign
            opportunities, and track brand collaborations.
          </p>
        </div>
      </section>
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
