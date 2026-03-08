"use client";

import { ArrowRight } from "lucide-react";
import { useState, Suspense, lazy } from "react";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({
    default: mod.Dithering,
  })),
);

export function CTASection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="min-h-screen w-full flex justify-center items-center px-4 md:px-6">
      <div
        className="w-full max-w-7xl relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[36px] md:rounded-[48px] border border-border bg-card shadow-sm min-h-[500px] sm:min-h-[550px] md:min-h-[600px] flex flex-col items-center justify-center duration-500">
          <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen">
              <Dithering
                colorBack="#00000000"
                colorFront="#EC4E02"
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.4 : 0.15}
                className="size-full"
                minPixelRatio={2}
              />
            </div>
          </Suspense>

          <div className="relative z-10 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Creator Matching
            </div>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground mb-6 sm:mb-8 leading-[1.05]">
              Your brand, <br />
              <span className="text-foreground/80">amplified by creators.</span>
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mb-8 sm:mb-12 leading-relaxed px-2">
              Connect with the perfect creators for your brand. AI-powered
              matching that delivers authentic reach and real engagement.
            </p>

            {/* Button */}
            <button className="group relative inline-flex h-12 sm:h-14 items-center justify-center gap-2 sm:gap-3 overflow-hidden rounded-full bg-primary px-8 sm:px-12 text-sm sm:text-base font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-95 hover:ring-4 hover:ring-primary/20">
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
