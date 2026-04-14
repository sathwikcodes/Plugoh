"use client";

import { useRef } from "react";
import styles from "../sowieso.module.css";
import { Reveal } from "./Reveal";
import { FistBump } from "./FistBump";
import { useScroll, useMotionValueEvent } from "framer-motion";

const TOTAL_FRAMES = 401;

export function PuzzleSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!lottieRef.current) return;
    const frame = latest * (TOTAL_FRAMES - 1);
    lottieRef.current.goToAndStop(Math.round(frame), true);
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
            // On mobile the 2483/900 ratio would be too short in height.
            // Use 100vw width always; height is naturally derived from ratio.
            // But we want it to cover more on mobile so we scale it up.
            width: "max(100vw, 140vh)",
            aspectRatio: "2483/900",
          }}
        >
          <FistBump lottieRef={lottieRef} />
        </div>

        {/* Title — sits above the fists */}
        <div className="relative z-10 flex flex-col items-center w-full px-4">
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
