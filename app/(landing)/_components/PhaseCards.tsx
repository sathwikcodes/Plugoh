"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../sowieso.module.css";
import { Reveal } from "./Reveal";

export function PhaseCards() {
  return (
    <section
      className="relative w-full"
      style={{ paddingTop: "10vw", paddingBottom: "10vw", marginTop: "-20vh" }}
    >
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start px-[clamp(1.875rem,8vw,10rem)] mb-10 lg:mb-20">
        <Reveal as="h2" className={styles.cardsTitle + " lg:w-1/3"}>
          HOW IS THIS <br /> GOING TO WORK?
        </Reveal>
      </div>

      <div className="flex flex-col items-center gap-[14vw] lg:gap-[8vw]">
        <PhaseCard
          num={1}
          tint="phase01"
          title="PHASE 1: CO-BRANDING AND TECHNICAL TRANSITION"
          body="We're kicking off with brand awareness with the co-branded iDEAL | Wero logo. After that, transactions will gradually be migrated in the background to the new European Wero technology. Your current iDEAL setup will stay as is. Your iDEAL provider will keep you informed and notify you in case you need to adjust anything."
          visual={<ClockArt />}
          offset="left"
        />
        <PhaseCard
          num={2}
          tint="phase02"
          title="PHASE 2: THE ROLLOUT OF WERO"
          body="We're going all-in. The logo, the technology — everything is now completely Wero. You and your customers will get access to new features like subscriptions, payment protection, and flexible payment plans. Your business becomes part of a pan-European payment network."
          visual={<CardsArt />}
          offset="right"
        />
      </div>
    </section>
  );
}

function PhaseCard({
  num,
  title,
  body,
  visual,
  tint,
  offset,
}: {
  num: number;
  title: string;
  body: string;
  visual: React.ReactNode;
  tint: "phase01" | "phase02";
  offset: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const rot = useTransform(scrollYProgress, [0, 1], [offset === "left" ? -1.6 : 1.6, offset === "left" ? 1.6 : -1.6]);
  const bg = tint === "phase01" ? styles.phaseCard01 : styles.phaseCard02;

  return (
    <m.div
      ref={ref}
      style={{ y, rotate: rot }}
      className="relative"
    >
      <div
        className={`${styles.surfaceCard} ${bg} relative`}
        style={{
          width: "min(1060px, 88vw)",
          padding: "clamp(24px, 3vw, 56px)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
          gap: "clamp(20px, 3vw, 60px)",
          alignItems: "center",
        }}
      >
        {/* number badge */}
        <div
          className={styles.iconBadge}
          style={{
            position: "absolute",
            top: -18,
            left: 20,
            width: 44,
            height: 44,
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          {num}
        </div>

        <div style={{ aspectRatio: "1/1", minHeight: 240 }}>{visual}</div>
        <div className="flex flex-col gap-5 py-3">
          <h3
            className={styles.sectionTitle}
            style={{ fontSize: "clamp(1.5rem, 1.8vw + 1rem, 2.5rem)", textTransform: "uppercase" }}
          >
            {title}
          </h3>
          <p className={styles.body} style={{ fontSize: "clamp(0.95rem, 0.2vw + 0.9rem, 1.0625rem)" }}>
            {body}
          </p>
        </div>
      </div>
    </m.div>
  );
}

function ClockArt() {
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="clockFace" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#fff48d" />
          <stop offset="100%" stopColor="#ffd94a" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="210" r="140" fill="#1d1c1c" />
      <circle cx="200" cy="200" r="140" fill="url(#clockFace)" stroke="#1d1c1c" strokeWidth="6" />
      <g stroke="#1d1c1c" strokeWidth="8" strokeLinecap="round">
        <line x1="200" y1="200" x2="200" y2="100" />
        <line x1="200" y1="200" x2="280" y2="230" />
      </g>
      <circle cx="200" cy="200" r="10" fill="#1d1c1c" />
      <rect x="190" y="40" width="20" height="26" fill="#1d1c1c" rx="3" />
      <rect x="186" y="30" width="28" height="14" fill="#1d1c1c" rx="3" />
    </svg>
  );
}

function CardsArt() {
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#ffe0f0" />
        </linearGradient>
      </defs>
      <g stroke="#1d1c1c" strokeWidth="5" strokeLinejoin="round">
        <rect x="80" y="140" width="220" height="140" rx="14" fill="url(#cardGrad)" transform="rotate(-8 190 210)" />
        <rect x="110" y="110" width="220" height="140" rx="14" fill="#fff" transform="rotate(6 220 180)" />
        <circle cx="260" cy="170" r="18" fill="#ff7ec8" />
        <circle cx="285" cy="170" r="18" fill="#a66cff" opacity="0.85" />
      </g>
    </svg>
  );
}
