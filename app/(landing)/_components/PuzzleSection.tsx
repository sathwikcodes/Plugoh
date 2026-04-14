"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../landing.module.css";
import { Reveal } from "./Reveal";
import { FistBump } from "./FistBump";
import { LinesAnimation } from "./LinesAnimation";
import { useScroll, useMotionValueEvent } from "framer-motion";

const TOTAL_FRAMES = 401;
const IMPACT_TRIGGER_FRAME = 133;
const IMPACT_TRIGGER_WINDOW = 3;
const IMPACT_CENTER_Y = "43%";
const BURST_DURATION_MS = 4500;

export function PuzzleSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const linesLottieRef = useRef<any>(null);
  const lastFrameRef = useRef(0);
  const inImpactRef = useRef(false);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!lottieRef.current) return;
    const frame = Math.max(0, Math.min(TOTAL_FRAMES - 1, latest * (TOTAL_FRAMES - 1)));
    lottieRef.current.goToAndStop(Math.round(frame), true);

    const rounded = Math.round(frame);
    const inImpact = Math.abs(rounded - IMPACT_TRIGGER_FRAME) <= IMPACT_TRIGGER_WINDOW;
    const enteredImpact = inImpact && !inImpactRef.current;
    const jumpedForwardIntoImpact =
      lastFrameRef.current < IMPACT_TRIGGER_FRAME - IMPACT_TRIGGER_WINDOW
      && rounded > IMPACT_TRIGGER_FRAME + IMPACT_TRIGGER_WINDOW;

    if (enteredImpact || jumpedForwardIntoImpact) {
      setBurstKey((k) => k + 1);
      setShowBurst(true);

      // lines.json has visible strokes mainly around frame ~61..112 (of 150),
      // so we seek there on impact to avoid delayed first visibility.
      if (linesLottieRef.current?.goToAndPlay) {
        linesLottieRef.current.goToAndPlay(61, true);
      }

      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
      burstTimerRef.current = setTimeout(() => setShowBurst(false), BURST_DURATION_MS);
    }

    inImpactRef.current = inImpact;
    lastFrameRef.current = rounded;
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        height: "350vh",
        background: "linear-gradient(180deg, #ffe87a 0%, #ffd84a 100%)",
      }}
    >
      <div
        className="sticky top-0 w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Fist bump — full width, vertically centered */}
        <div
          className="pointer-events-none"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 30,
            // On mobile the 2483/900 ratio would be too short in height.
            // Use 100vw width always; height is naturally derived from ratio.
            // But we want it to cover more on mobile so we scale it up.
            width: "max(100vw, 140vh)",
            aspectRatio: "2483/900",
          }}
        >
          <FistBump lottieRef={lottieRef} />

          <div
            className="pointer-events-none"
            style={{
              position: "absolute",
              left: "50%",
              top: IMPACT_CENTER_Y,
              width: "min(110vw, 1700px)",
              height: "min(110vh, 1700px)",
              transform: "translate(-50%, -50%)",
              zIndex: 40,
              opacity: showBurst ? 1 : 0,
              transition: "opacity 90ms linear",
            }}
            aria-hidden
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                WebkitMaskImage: "radial-gradient(circle, transparent 30%, black 45%)",
                maskImage: "radial-gradient(circle, transparent 30%, black 45%)",
              }}
            >
              <LinesAnimation lottieRef={linesLottieRef} autoplay={true} loop={true} />
            </div>

            <svg
              key={`impact-sparkles-${burstKey}`}
              width="100%"
              height="100%"
              viewBox="0 0 1000 1000"
              style={{ position: "absolute", inset: 0, animation: `impactSparklesOnce ${BURST_DURATION_MS}ms ease-out forwards` }}
            >
              <g style={{ transformOrigin: "500px 500px", animation: `sparkleSpinOnce ${BURST_DURATION_MS}ms linear forwards` }}>
                <path
                  fill="#ffffff"
                  d="M 500 452 C 500 485 503 497 536 500 C 503 503 500 515 500 548 C 497 515 485 503 452 500 C 485 497 497 485 500 452 Z"
                />
              </g>

              <g style={{ transformOrigin: "690px 360px", animation: `sparkleSpinOnce ${BURST_DURATION_MS}ms linear forwards` }}>
                <path
                  fill="#ffffff"
                  d="M 690 332 C 690 354 692 362 714 364 C 692 366 690 374 690 396 C 688 374 680 366 658 364 C 680 362 688 354 690 332 Z"
                />
              </g>

              <g style={{ transformOrigin: "340px 620px", animation: `sparkleSpinOnce ${BURST_DURATION_MS}ms linear forwards` }}>
                <path
                  fill="#ffffff"
                  d="M 340 596 C 340 614 342 620 360 622 C 342 624 340 630 340 648 C 338 630 332 624 314 622 C 332 620 338 614 340 596 Z"
                />
              </g>
            </svg>
          </div>
        </div>

        <style>{`
          @keyframes impactSparklesOnce {
            0% { opacity: 1; }
            88% { opacity: 1; }
            100% { opacity: 0; }
          }

          @keyframes sparkleSpinOnce {
            0% { transform: rotate(0deg) scale(0.72); opacity: 1; }
            12% { transform: rotate(65deg) scale(1.02); opacity: 1; }
            88% { transform: rotate(275deg) scale(0.98); opacity: 1; }
            100% { transform: rotate(360deg) scale(0.55); opacity: 0; }
          }
        `}</style>

        {/* Title — sits above the fists */}
        <div className="relative z-[5] flex flex-col items-center w-full px-4">
          <Reveal
            as="h2"
            className={styles.airplanesTitle + " text-center"}
            amount={0.3}
          >
            <span style={{ display: "block" }}>EVERY GREAT</span>
            <span style={{ display: "block" }}>COLLAB STARTS</span>
            <span style={{ display: "block" }}>WITH A HANDSHAKE.</span>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
