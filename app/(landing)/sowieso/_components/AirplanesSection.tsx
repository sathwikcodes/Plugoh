"use client";

import { m, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../sowieso.module.css";
import { Airplane } from "./Airplane";

export function AirplanesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Phase 1: text reveals sequentially (0.05 → 0.34), staggered line by line
  const op1 = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const rawY1 = useTransform(scrollYProgress, [0.05, 0.15], [30, 0]);
  const y1 = useSpring(rawY1, { stiffness: 400, damping: 30 });

  const op2 = useTransform(scrollYProgress, [0.13, 0.23], [0, 1]);
  const rawY2 = useTransform(scrollYProgress, [0.13, 0.23], [30, 0]);
  const y2 = useSpring(rawY2, { stiffness: 400, damping: 30 });

  const op3 = useTransform(scrollYProgress, [0.20, 0.30], [0, 1]);
  const rawY3 = useTransform(scrollYProgress, [0.20, 0.30], [30, 0]);
  const y3 = useSpring(rawY3, { stiffness: 400, damping: 30 });

  const op4 = useTransform(scrollYProgress, [0.26, 0.36], [0, 1]);
  const rawY4 = useTransform(scrollYProgress, [0.26, 0.36], [30, 0]);
  const y4 = useSpring(rawY4, { stiffness: 400, damping: 30 });

  // Phase 2: planes animate after text is done (0.38+), anchored by sides so they're visible the whole flight
  // Plane 1 (pink): enters from off-screen left, sweeps to off-screen right, drifts up
  const plane1X = useTransform(scrollYProgress, [0.38, 0.75], ["-110%", "260%"]);
  const plane1Y = useTransform(scrollYProgress, [0.38, 0.75], ["0%", "-90%"]);
  const plane1Op = useTransform(scrollYProgress, [0.38, 0.44], [0, 1]);

  // Plane 2 (green): enters from off-screen right, sweeps to off-screen left, drifts up
  const plane2X = useTransform(scrollYProgress, [0.42, 0.78], ["110%", "-230%"]);
  const plane2Y = useTransform(scrollYProgress, [0.42, 0.78], ["0%", "-80%"]);
  const plane2Op = useTransform(scrollYProgress, [0.42, 0.48], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: "300vh", width: "100%" }}
    >
      <div className="sticky top-0 left-0 w-full h-[100vh] overflow-hidden flex flex-col items-center justify-center">
        {/* Plane 1: anchored left side at ~50% height, sweeps left→right */}
        <m.div
          style={{
            position: "absolute",
            left: 0,
            top: "45%",
            x: plane1X,
            y: plane1Y,
            opacity: plane1Op,
            width: "min(975px, 90vw)",
            zIndex: 0,
            willChange: "transform, opacity",
          }}
        >
          <Airplane variant="pink" />
        </m.div>

        {/* Plane 2: anchored right side at ~65% height, sweeps right→left */}
        <m.div
          style={{
            position: "absolute",
            right: 0,
            top: "60%",
            x: plane2X,
            y: plane2Y,
            opacity: plane2Op,
            width: "min(800px, 75vw)",
            zIndex: 0,
            willChange: "transform, opacity",
          }}
        >
          <Airplane variant="green" />
        </m.div>

        <div className="relative z-[2] flex flex-col items-center justify-center w-full px-4">
          <m.div
            className={styles.eyebrow + " mb-8"}
            style={{ opacity: op1, y: y1 }}
          >
            But what is it actually?
          </m.div>
          <h2 className={styles.airplanesTitle}>
            <m.span style={{ display: "block", opacity: op1, y: y1 }}>PLUGOH IS BECOMING</m.span>

            <m.span style={{ display: "inline-flex", alignItems: "center", gap: "0.3em", opacity: op2, y: y2 }}>
              <span>THE</span>
              <InlineCheck />
              <span>CORE</span>
            </m.span>

            <m.span style={{ display: "block", opacity: op3, y: y3 }}>MARKETPLACE</m.span>

            <m.span style={{ display: "block", opacity: op4, y: y4 }}>FOR CREATORS.</m.span>
          </h2>
        </div>
      </div>
    </section>
  );
}

function InlineCheck() {
  return (
    <m.span
      initial={{ width: 0, opacity: 0 }}
      whileInView={{ width: "clamp(3.1rem, 2.5vw + 2.5rem, 5.5rem)", opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "inline-block",
        height: "clamp(2.5rem, 3.1vw + 1.8rem, 5.6rem)",
        position: "relative",
        verticalAlign: "middle",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          width: "100%",
          height: "100%",
          background: "#ff7ec8",
          border: "2px solid #1d1c1c",
          borderRadius: 18,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12.5L10 17L19 7.5" stroke="#1d1c1c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </m.span>
  );
}
