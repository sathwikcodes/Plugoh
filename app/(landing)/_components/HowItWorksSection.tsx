"use client";

import { MotionValue, m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../sowieso.module.css";
import { Reveal } from "./Reveal";

const phases = [
  {
    number: 1,
    title: "PHASE 1: CO-BRANDING AND TECHNICAL TRANSITION",
    description:
      "We're kicking off with brand awareness with the co-branded iDEAL | Wero logo. After that transactions will gradually be migrated in the background to the new European Wero technology. Your current iDEAL setup will stay as is. Your iDEAL provider will keep you informed and notify you in case you need to adjust anything.",
    tintClass: styles.phaseCard01,
    visual: <StopwatchVisual />,
    enterStart: 0.08,
    lockAt: 0.26,
    settleY: -88,
    settleX: 0,
    baseTilt: 0,
  },
  {
    number: 2,
    title: "PHASE 2: THE ROLLOUT OF WERO",
    description:
      "We're going all-in. The logo, the technology, everything is now completely Wero. New features like subscriptions, payment at delivery, and flexible payment plans will also become available over time. But no stress, your iDEAL provider will guide you through the transition.",
    tintClass: styles.phaseCard02,
    visual: <SpeedometerVisual />,
    enterStart: 0.36,
    lockAt: 0.54,
    settleY: 42,
    settleX: 0,
    baseTilt: 0,
  },
  {
    number: 3,
    title: "PHASE 3: NEW WERO FEATURES AT SCALE",
    description:
      "After the full rollout, merchants gain access to Europe-wide opportunities and modern payment experiences on one network. Wero keeps the trusted flow while adding richer services that help grow conversion and customer trust over time.",
    tintClass: styles.phaseCard02,
    visual: <EuropeVisual />,
    enterStart: 0.64,
    lockAt: 0.82,
    settleY: 172,
    settleX: 0,
    baseTilt: 0,
  },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={ref}
      className="w-full"
      style={{
        position: "relative",
        height: "520vh",
      }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden flex items-center">
        <div
          className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] items-center"
          style={{
            gap: "clamp(20px, 4vw, 72px)",
            padding: "clamp(16px, 4vw, 40px) clamp(16px, 6vw, 120px)",
          }}
        >
          <Reveal>
            <h2
              className={styles.cardsTitle}
              style={{
                color: "#1d1c1c",
                textTransform: "uppercase",
                maxWidth: "14ch",
                fontSize: "clamp(2.25rem, 3.3vw, 3.95rem)",
                lineHeight: 0.88,
              }}
            >
              WHAT THIS MEANS FOR MERCHANTS
            </h2>
          </Reveal>

          <div
            className="relative"
            style={{
              height: "min(86vh, 820px)",
              minHeight: 560,
            }}
          >
            {phases.map((phase, index) => (
              <PhaseSlide
                key={phase.number}
                phase={phase}
                index={index}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PhaseSlide({
  phase,
  index,
  progress,
}: {
  phase: (typeof phases)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = phase.enterStart;
  const lock = phase.lockAt;
  const x = useTransform(
    progress,
    [0, start, lock, 1],
    [0, 0, phase.settleX, phase.settleX],
  );
  const y = useTransform(
    progress,
    [0, start, lock, 1],
    [860, 860, phase.settleY, phase.settleY],
  );

  return (
    <m.article
      style={{
        x,
        y,
        position: "absolute",
        right: 0,
        top: "50%",
        transformOrigin: "center center",
        translateY: "-50%",
        width: "min(84vw, 790px)",
        zIndex: 40 + index,
        willChange: "transform, opacity",
      }}
    >
      <div
        className={`${styles.surfaceCard} ${phase.tintClass}`}
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: "clamp(16px, 2vw, 28px)",
          padding: "clamp(18px, 2.4vw, 40px)",
          minHeight: "clamp(320px, 38vw, 500px)",
        }}
      >
        <div
          className={styles.iconBadge}
          style={{
            position: "absolute",
            left: "clamp(-22px, -2vw, -30px)",
            top: "clamp(16px, 2.2vw, 30px)",
            width: "clamp(44px, 3.2vw, 60px)",
            height: "clamp(44px, 3.2vw, 60px)",
            fontSize: "clamp(1rem, 1.2vw, 1.25rem)",
            fontWeight: 800,
            boxShadow: "0 4px 0 0 #1d1c1c",
            zIndex: 2,
          }}
        >
          {phase.number}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "clamp(14px, 2vw, 26px)",
          }}
        >
          <div
            style={{
              aspectRatio: "1.45/1",
              position: "relative",
              overflow: "hidden",
              borderRadius: 8,
            }}
          >
            {phase.visual}
          </div>

          <div style={{ maxWidth: 560 }}>
            <h3
              className={styles.sectionTitle}
              style={{
                fontSize: "clamp(1.6rem, 2.3vw, 2.7rem)",
                lineHeight: 0.92,
                textTransform: "uppercase",
                marginBottom: "clamp(10px, 1.2vw, 18px)",
              }}
            >
              {phase.title}
            </h3>
            <p
              className={styles.body}
              style={{
                fontSize: "clamp(0.9rem, 0.75vw, 1.1rem)",
                lineHeight: 1.35,
              }}
            >
              {phase.description}
            </p>
          </div>
        </div>
      </div>
    </m.article>
  );
}

function StopwatchVisual() {
  return (
    <svg viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="hwClockBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7af7f7" />
          <stop offset="100%" stopColor="#83f582" />
        </linearGradient>
        <radialGradient id="hwClockFace" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#f8f1cb" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="700" fill="url(#hwClockBg)" />
      <g transform="translate(240,80)">
        <circle cx="260" cy="280" r="240" fill="#1d1c1c" />
        <circle cx="260" cy="260" r="240" fill="#77dede" stroke="#1d1c1c" strokeWidth="6" />
        <circle cx="260" cy="260" r="180" fill="#72ea95" stroke="#1d1c1c" strokeWidth="4" />
        <circle cx="260" cy="260" r="130" fill="url(#hwClockFace)" stroke="#1d1c1c" strokeWidth="3" />
        <circle cx="260" cy="260" r="54" fill="#ececec" stroke="#1d1c1c" strokeWidth="3" />
        <g stroke="#1d1c1c" strokeWidth="3" strokeLinecap="round">
          <line x1="260" y1="260" x2="310" y2="185" />
          <line x1="260" y1="260" x2="350" y2="340" />
        </g>
      </g>
    </svg>
  );
}

function SpeedometerVisual() {
  return (
    <svg viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="hwSpeedBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9be5" />
          <stop offset="100%" stopColor="#ffb574" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="700" fill="url(#hwSpeedBg)" />
      <g transform="translate(170,118)" stroke="#1d1c1c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M90 360A260 260 0 0 1 610 360" fill="#fff4a0" />
        <path d="M120 360A230 230 0 0 1 580 360" fill="#fff" />
        <circle cx="350" cy="360" r="28" fill="#1d1c1c" />
        <line x1="350" y1="360" x2="500" y2="250" strokeWidth="8" />
        <g strokeWidth="4">
          <line x1="130" y1="360" x2="165" y2="330" />
          <line x1="570" y1="360" x2="535" y2="330" />
          <line x1="220" y1="230" x2="245" y2="265" />
          <line x1="480" y1="230" x2="455" y2="265" />
        </g>
      </g>
    </svg>
  );
}

function EuropeVisual() {
  return (
    <svg viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="hwMapBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffc47a" />
          <stop offset="100%" stopColor="#ff7d6a" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="700" fill="url(#hwMapBg)" />
      <g stroke="#1d1c1c" strokeWidth="4" fill="#fff4a0">
        <path d="M220 350l90-70 105 15 55 72-28 98-110 48-112-58z" />
        <path d="M490 322l58-48 87 4 52 68-18 90-88 22-72-50z" />
        <path d="M430 430l62 30 68-15 35 52-44 59-92 4-54-48z" />
      </g>
      <g stroke="#1d1c1c" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M300 328c68-36 160-36 240 0" />
        <path d="M360 490c62-38 155-41 238-12" />
      </g>
      <g fill="#fff" stroke="#1d1c1c" strokeWidth="4">
        <circle cx="300" cy="328" r="13" />
        <circle cx="540" cy="328" r="13" />
        <circle cx="360" cy="490" r="13" />
        <circle cx="598" cy="478" r="13" />
      </g>
    </svg>
  );
}
