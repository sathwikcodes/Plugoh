"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../sowieso.module.css";
import { Airplane } from "./Airplane";
import { Reveal } from "./Reveal";

export function AirplanesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Text scrub timeline (0.0 -> 0.25)
  const op1 = useTransform(scrollYProgress, [0.0, 0.1], [0, 1]);
  const y1 = useTransform(scrollYProgress, [0.0, 0.1], [24, 0]);

  const op2 = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const y2 = useTransform(scrollYProgress, [0.05, 0.15], [24, 0]);

  const op3 = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  const y3 = useTransform(scrollYProgress, [0.1, 0.2], [24, 0]);

  const op4 = useTransform(scrollYProgress, [0.15, 0.25], [0, 1]);
  const y4 = useTransform(scrollYProgress, [0.15, 0.25], [24, 0]);

  // Airplane triggers delayed until after text completes (0.4 -> 0.8)
  const plane1X = useTransform(scrollYProgress, [0.4, 0.8], ["-80%", "150%"]);
  const plane1Y = useTransform(scrollYProgress, [0.4, 0.8], ["30%", "-50%"]);
  
  const plane2X = useTransform(scrollYProgress, [0.45, 0.85], ["150%", "-80%"]);
  const plane2Y = useTransform(scrollYProgress, [0.45, 0.85], ["90%", "-10%"]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{
        height: "300vh", // Force extended scroll distance while pinned
        width: "100%",
      }}
    >
      <div className="sticky top-0 left-0 w-full h-[100vh] overflow-hidden flex flex-col items-center justify-center">
        <m.div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            x: plane1X,
            y: plane1Y,
            width: "min(975px, 90vw)",
            zIndex: 0,
            willChange: "transform",
          }}
        >
          <Airplane variant="pink" />
        </m.div>
        
        <m.div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            x: plane2X,
            y: plane2Y,
            width: "min(800px, 75vw)",
            zIndex: 0,
            willChange: "transform",
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
