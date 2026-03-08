"use client";

import { cn } from "@/lib/utils";
import { FeatureCarousel } from "@/components/ui/feature-carousel";

export function FeatureCarouselSection() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4">
        <div className="rounded-[34px] bg-neutral-700/40 p-2">
          <div className="relative z-10 grid w-full gap-8 rounded-[28px] bg-neutral-950/80 p-2">
            <FeatureCarousel
              title="Platform Features"
              description="Everything you need to discover, connect, and grow with creators"
              step1img1Class={cn(
                "pointer-events-none w-[50%] border border-stone-100/10 transition-all duration-500 dark:border-stone-700/50",
                "rounded-[16px] sm:rounded-[24px] left-[3%] top-[35%] md:left-[35px] md:top-[29%]",
                "md:group-hover:translate-y-2",
              )}
              step1img2Class={cn(
                "pointer-events-none w-[48%] border border-stone-100/10 dark:border-stone-700/50 transition-all duration-500 overflow-hidden",
                "rounded-[16px] sm:rounded-[24px] left-[50%] top-[38%] md:top-[21%] md:left-[calc(50%+35px+1rem)] md:w-[60%]",
                "md:group-hover:-translate-y-6",
              )}
              step2img1Class={cn(
                "pointer-events-none w-[50%] rounded-t-[16px] sm:rounded-t-[24px] overflow-hidden border border-stone-100/10 transition-all duration-500 dark:border-stone-700",
                "left-[3%] top-[35%] md:left-[35px] md:top-[30%]",
                "md:group-hover:translate-y-2",
              )}
              step2img2Class={cn(
                "pointer-events-none w-[45%] rounded-t-[16px] sm:rounded-t-[24px] border border-stone-100/10 dark:border-stone-700 transition-all duration-500 rounded-2xl overflow-hidden",
                "left-[52%] top-[38%] md:top-[25%] md:left-[calc(50%+27px+1rem)] md:w-[40%]",
                "md:group-hover:-translate-y-6",
              )}
              step3imgClass={cn(
                "pointer-events-none w-[92%] border border-stone-100/10 dark:border-stone-700 rounded-t-[16px] sm:rounded-t-[24px] transition-all duration-500 overflow-hidden",
                "left-[4%] top-[32%] md:top-[30%] md:left-[68px]",
              )}
              step4imgClass={cn(
                "pointer-events-none w-[92%] border border-stone-100/10 dark:border-stone-700 rounded-t-[16px] sm:rounded-t-[24px] transition-all duration-500 overflow-hidden",
                "left-[4%] top-[32%] md:top-[30%] md:left-[68px]",
              )}
              image={{
                step1light1:
                  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=2074&auto=format&fit=crop",
                step1light2:
                  "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=2074&auto=format&fit=crop",
                step2light1:
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
                step2light2:
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
                step3light:
                  "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop",
                step4light:
                  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop",
                alt: "ReelReach platform feature",
              }}
              bgClass="bg-gradient-to-tr from-neutral-900/90 to-neutral-800/90"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
