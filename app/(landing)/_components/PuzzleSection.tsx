"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import styles from "../landing.module.css";
import { Reveal } from "./Reveal";
import { FistBump } from "./FistBump";
import { LinesAnimation } from "./LinesAnimation";
import { useScroll } from "framer-motion";

const TOTAL_FRAMES = 401;
const IMPACT_TRIGGER_FRAME = 133;
const IMPACT_TRIGGER_WINDOW = 3;
const BURST_DURATION_MS = 4500;

function frameFromProgress(progress: number) {
  return Math.max(0, Math.min(TOTAL_FRAMES - 1, progress * (TOTAL_FRAMES - 1)));
}

function usePrefersDesktopCanvas() {
  const [useCanvas, setUseCanvas] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches,
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const sync = () => setUseCanvas(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return useCanvas;
}

const ImpactBurst = memo(function ImpactBurst({
  burstKey,
  linesLottieRef,
}: {
  burstKey: number;
  linesLottieRef: RefObject<any>;
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage:
            "radial-gradient(circle, transparent 30%, black 45%)",
          maskImage: "radial-gradient(circle, transparent 30%, black 45%)",
        }}
      >
        <LinesAnimation
          lottieRef={linesLottieRef}
          autoplay={false}
          loop={false}
        />
      </div>

      <svg
        key={`impact-sparkles-${burstKey}`}
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        style={{
          position: "absolute",
          inset: 0,
          animation: `impactSparklesOnce ${BURST_DURATION_MS}ms ease-out forwards`,
        }}
      >
        <g
          style={{
            transformOrigin: "500px 500px",
            animation: `sparkleSpinOnce ${BURST_DURATION_MS}ms linear forwards`,
          }}
        >
          <path
            fill="#ffffff"
            d="M 500 452 C 500 485 503 497 536 500 C 503 503 500 515 500 548 C 497 515 485 503 452 500 C 485 497 497 485 500 452 Z"
          />
        </g>

        <g
          style={{
            transformOrigin: "690px 360px",
            animation: `sparkleSpinOnce ${BURST_DURATION_MS}ms linear forwards`,
          }}
        >
          <path
            fill="#ffffff"
            d="M 690 332 C 690 354 692 362 714 364 C 692 366 690 374 690 396 C 688 374 680 366 658 364 C 680 362 688 354 690 332 Z"
          />
        </g>

        <g
          style={{
            transformOrigin: "340px 620px",
            animation: `sparkleSpinOnce ${BURST_DURATION_MS}ms linear forwards`,
          }}
        >
          <path
            fill="#ffffff"
            d="M 340 596 C 340 614 342 620 360 622 C 342 624 340 630 340 648 C 338 630 332 624 314 622 C 332 620 338 614 340 596 Z"
          />
        </g>
      </svg>
    </>
  );
});

export function PuzzleSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const linesLottieRef = useRef<any>(null);
  const burstOverlayRef = useRef<HTMLDivElement>(null);
  const lastFrameRef = useRef(0);
  const inImpactRef = useRef(false);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayedFrameRef = useRef(-1);
  const [burstKey, setBurstKey] = useState(0);
  const [fistReady, setFistReady] = useState(false);
  const useCanvas = usePrefersDesktopCanvas();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const seekFist = useCallback(
    (progress: number) => {
      const anim = lottieRef.current;
      if (!anim) return;

      const frame = frameFromProgress(progress);

      if (useCanvas) {
        if (Math.abs(frame - displayedFrameRef.current) > 0.02) {
          anim.goToAndStop(frame, true);
          displayedFrameRef.current = frame;
        }
      } else {
        const rounded = Math.round(frame);
        if (rounded !== displayedFrameRef.current) {
          anim.goToAndStop(rounded, true);
          displayedFrameRef.current = rounded;
        }
      }

      const rounded = Math.round(frame);
      const inImpact =
        Math.abs(rounded - IMPACT_TRIGGER_FRAME) <= IMPACT_TRIGGER_WINDOW;
      const enteredImpact = inImpact && !inImpactRef.current;
      const jumpedForwardIntoImpact =
        lastFrameRef.current < IMPACT_TRIGGER_FRAME - IMPACT_TRIGGER_WINDOW &&
        rounded > IMPACT_TRIGGER_FRAME + IMPACT_TRIGGER_WINDOW;

      if (enteredImpact || jumpedForwardIntoImpact) {
        setBurstKey((k) => k + 1);
        if (burstOverlayRef.current) {
          burstOverlayRef.current.style.opacity = "1";
        }

        const linesAnim = linesLottieRef.current;
        if (linesAnim?.goToAndPlay) {
          linesAnim.setLoop?.(true);
          linesAnim.goToAndPlay(61, true);
        }

        if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
        burstTimerRef.current = setTimeout(() => {
          if (burstOverlayRef.current) {
            burstOverlayRef.current.style.opacity = "0";
          }
          const lines = linesLottieRef.current;
          if (lines?.goToAndStop) {
            lines.setLoop?.(false);
            lines.goToAndStop(0, true);
          }
        }, BURST_DURATION_MS);
      }

      inImpactRef.current = inImpact;
      lastFrameRef.current = rounded;
    },
    [useCanvas],
  );

  const handleFistLoaded = useCallback(() => {
    setFistReady(true);
    displayedFrameRef.current = -1;
    seekFist(scrollYProgress.get());
  }, [scrollYProgress, seekFist]);

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!fistReady) return;

    let rafId = 0;
    let scheduled = false;

    const flush = () => {
      scheduled = false;
      seekFist(scrollYProgress.get());
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      rafId = requestAnimationFrame(flush);
    };

    const unsubscribe = scrollYProgress.on("change", schedule);
    schedule();

    return () => {
      unsubscribe();
      cancelAnimationFrame(rafId);
    };
  }, [fistReady, scrollYProgress, seekFist]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${styles.puzzleScrollTrack}`}
      style={{
        background: "linear-gradient(180deg, #ffe87a 0%, #ffd84a 100%)",
      }}
    >
      <div
        className="sticky top-0 w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ height: "100vh" }}
      >
        <div className={styles.fistBumpStage}>
          <FistBump
            lottieRef={lottieRef}
            onLoaded={handleFistLoaded}
            useCanvas={useCanvas}
          />

          <div
            ref={burstOverlayRef}
            className={styles.fistBurstOverlay}
            aria-hidden
          >
            <ImpactBurst burstKey={burstKey} linesLottieRef={linesLottieRef} />
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

        <div className="relative z-[5] flex flex-col items-center w-full px-4">
          <Reveal
            as="h2"
            className={styles.airplanesTitle + " text-center"}
            amount={0.3}
          >
            <span style={{ display: "block" }}>EVERY GREAT</span>
            <span style={{ display: "block" }}>COLLAB STARTS</span>
            <span style={{ display: "block" }}>WITH PLUGOH.</span>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
