"use client";

import styles from "../sowieso.module.css";
import { Reveal } from "./Reveal";

export function PuzzleSection() {
  return (
    <section
      className="relative mx-auto"
      style={{
        maxWidth: 1920,
        padding:
          "clamp(0rem,6.47vw - 1.52rem,6.25rem) clamp(1.875rem,8.41vw - 0.1rem,10rem)",
      }}
    >
      <div className="relative lg:max-w-[680px]">
        <Reveal className={styles.eyebrow + " mb-6 flex items-center gap-3"}>
          <span className={styles.iconBadgeSm}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M17 7H9M17 7V15"
                stroke="#1d1c1c"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Ambition without borders. Sowieso.
        </Reveal>
        <Reveal
          as="h2"
          className={styles.sectionTitle + " mb-6"}
          delay={0.1}
        >
          <span style={{ display: "block" }}>iDEAL IS BECOMING</span>
          <span style={{ display: "block" }}>WERO:</span>
          <span style={{ display: "block" }}>THE NEW EUROPEAN</span>
          <span style={{ display: "block" }}>PAYMENT SYSTEM</span>
        </Reveal>
        <Reveal className={styles.body + " max-w-[560px]"} delay={0.2}>
          We&apos;re going international, baby! With a new platform and the
          backing of all the banks, we&apos;re ready for the future as a payment
          system. Wero offers the same safety and ease of use as iDEAL, but it
          is available across Europe. Plus it offers new payment options and
          services like purchase protection. Sounds good, right? Especially
          since we&apos;re making the transition smooth. So you can focus on
          running your business.
        </Reveal>
      </div>

      {/* Puzzle graphic */}
      <Reveal
        className="pointer-events-none"
        amount={0.25}
      >
        <div
          className={styles.floatY}
          style={{
            position: "absolute",
            right: "3vw",
            top: "-10%",
            width: "min(40%, 520px)",
            aspectRatio: "1/1",
            filter: "drop-shadow(0 12px 0 rgba(29,28,28,0.18))",
          }}
        >
          <PuzzleSvg />
        </div>
      </Reveal>
    </section>
  );
}

function PuzzleSvg() {
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="puz" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7effc5" />
          <stop offset="100%" stopColor="#4ad8a0" />
        </linearGradient>
      </defs>
      <g stroke="#1d1c1c" strokeWidth="4" strokeLinejoin="round" fill="url(#puz)">
        {/* isometric-looking two-piece puzzle */}
        <path d="M60 200 L180 140 L180 210 Q210 210 210 240 Q210 270 180 270 L180 290 L60 230 Z" />
        <path d="M180 210 Q210 210 210 240 Q210 270 180 270 L180 290 L340 210 L340 150 L180 140 Z" />
        <path d="M60 230 L180 290 L180 320 L60 260 Z" fill="#1d1c1c" opacity="0.85" />
        <path d="M180 290 L340 210 L340 240 L180 320 Z" fill="#1d1c1c" opacity="0.7" />
      </g>
    </svg>
  );
}
