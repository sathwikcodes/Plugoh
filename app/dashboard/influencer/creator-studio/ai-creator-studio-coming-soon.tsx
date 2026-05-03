"use client";

import { m } from "framer-motion";
import {
  Clapperboard,
  FileText,
  IndianRupee,
  Languages,
  Lock,
  Mic,
  ShieldCheck,
  Sparkles,
  UserSquare,
} from "lucide-react";
import { fadeUp, stagger } from "@/lib/animations";
import { cn } from "@/lib/utils";

const PHASES = [
  {
    phase: "Phase 1",
    title: "Likeness & capture",
    detail:
      "One-time voice and face registration with consent, revocation, and audit trails—built before any generation ships.",
  },
  {
    phase: "Phase 2",
    title: "Production & scale",
    detail:
      "Composer, multilingual repurposing, and publish-ready packaging so one shoot becomes regional cuts without re-recording.",
  },
  {
    phase: "Phase 3",
    title: "Intelligence & compliance",
    detail:
      "Brief drafting, rate intelligence from live Plugoh deals, and Auto-SGI labeling aligned to Creator Bill 2026.",
  },
] as const;

const MODULES = [
  {
    icon: Mic,
    title: "Voice clone",
    line: "Studio-grade audio in your voice across Indian languages + English—dub overnight, not in a booth.",
  },
  {
    icon: UserSquare,
    title: "Face avatar",
    line: "Campaign-ready stills and integrations from registered likeness—consent-first, revocable.",
  },
  {
    icon: Clapperboard,
    title: "AI video composer",
    line: "Titles, captions, thumbnails, B-roll hints, transitions—the gap between raw clip and publishable.",
  },
  {
    icon: Languages,
    title: "Multilingual repurposing",
    line: "One asset → many regional cuts with matched voice, captions, and face continuity.",
  },
  {
    icon: FileText,
    title: "AI campaign brief",
    line: "Structured briefs from a paragraph of brand intent—deliverables, tone, guardrails, deadlines.",
  },
  {
    icon: IndianRupee,
    title: "AI rate suggestion",
    line: "Suggested pricing from niche, region, follower band, engagement, and comparable Plugoh deals.",
  },
  {
    icon: ShieldCheck,
    title: "Auto-SGI labeling",
    line: "Synthetic outputs tagged by default so compliance is baked in, not bolted on.",
  },
] as const;

export function AICreatorStudioComingSoon() {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      <m.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col gap-10 md:gap-14"
      >
        <m.header variants={fadeUp} className="text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/95">
            <Sparkles
              className="size-3.5 shrink-0 text-amber-300"
              aria-hidden
            />
            Pillar 2 · Plugoh OS
          </div>
          <h1 className="heading-mix font-serif text-3xl font-normal tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.08]">
            AI Creator Studio
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            The studio that lives inside the platform that already pays you—not
            a bolt-on SaaS. We&apos;re sequencing shipping against
            Indian-language model readiness, escrow-backed payouts, and Creator
            Bill timelines so every artifact stays monetizable and compliant
            from day one.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/[0.12] bg-[linear-gradient(165deg,rgba(22,26,36,0.92)_0%,rgba(18,22,32,0.78)_100%)] px-5 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
            <div className="flex items-center gap-3 text-left">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <Lock className="size-[22px] text-amber-300/90" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                  Painted door
                </p>
                <p className="text-base font-semibold tracking-tight text-white">
                  Coming soon
                </p>
              </div>
            </div>
            <p className="text-left text-xs leading-relaxed text-white/50 sm:max-w-[240px] sm:text-right md:text-xs">
              Ship cadence tracks README roadmap: Creator Pro bundles unlimited
              studio access at Indian price points—not USD-priced English-first
              wrappers.
            </p>
          </div>
        </m.header>

        <m.section variants={fadeUp} aria-labelledby="studio-phases-heading">
          <h2 id="studio-phases-heading" className="sr-only">
            Delivery phases
          </h2>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {PHASES.map(({ phase, title, detail }) => (
              <div
                key={phase}
                className={cn(
                  "rounded-2xl border border-white/[0.1] bg-white/[0.03] p-5 backdrop-blur-sm",
                  "transition-colors hover:border-amber-400/20 hover:bg-white/[0.045]",
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/80">
                  {phase}
                </p>
                <h3 className="mt-2 font-serif text-lg font-normal text-white">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/50 md:text-[13px]">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </m.section>

        <m.section variants={fadeUp} aria-labelledby="studio-modules-heading">
          <div className="mb-5 flex flex-col gap-2 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <h2
                id="studio-modules-heading"
                className="heading-mix font-serif text-xl font-normal text-white md:text-2xl"
              >
                Capability matrix
              </h2>
              <p className="mt-1 text-xs text-white/45 md:text-sm">
                Seven modules spec&apos;d in README—frozen scope for investor
                and regulatory reviews.
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 md:pb-0.5">
              Provider stack TBD · languages-first
            </span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {MODULES.map(({ icon: Icon, title, line }) => (
              <li
                key={title}
                className="flex gap-4 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-4 backdrop-blur-md md:px-5 md:py-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                  <Icon className="size-[18px] text-amber-300/85" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="font-semibold tracking-tight text-white">
                      {title}
                    </h3>
                    <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45">
                      Roadmap
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/48 md:text-[13px]">
                    {line}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </m.section>
      </m.div>
    </div>
  );
}
