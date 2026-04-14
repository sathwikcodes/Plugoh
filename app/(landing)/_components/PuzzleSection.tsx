"use client";

import { useRef, useEffect } from "react";
import styles from "../sowieso.module.css";
import { Reveal } from "./Reveal";
import { FistBump } from "./FistBump";
import { m, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const TOTAL_FRAMES = 401;

export function PuzzleSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!lottieRef.current) return;
    
    // Convert 0 -> 1 progress to 0 -> TOTAL_FRAMES
    const frame = latest * (TOTAL_FRAMES - 1);
    lottieRef.current.goToAndStop(Math.round(frame), true);
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        height: "350vh", // Extra scroll area for the locked animation
        background: "linear-gradient(180deg, #ffe87a 0%, #ffd84a 100%)",
      }}
    >
      <div 
        className="sticky top-0 w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Fist bump Lottie: centered full-width, behind title */}
        <div
          className="pointer-events-none"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "100vw",
            aspectRatio: "2483/900",
          }}
        >
          <FistBump lottieRef={lottieRef} />
        </div>

        {/* Title above fists */}
        <div className="relative z-10 flex flex-col items-center w-full px-4">
          <Reveal as="h2" className={styles.airplanesTitle + " text-center"} amount={0.3}>
            <span style={{ display: "block" }}>iDEAL IS BECOMING</span>
            <span style={{ display: "block" }}>THE CORE</span>
            <span style={{ display: "block" }}>MARKETPLACE</span>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
