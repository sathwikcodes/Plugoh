"use client";

import { m, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../sowieso.module.css";
import { Airplane } from "./Airplane";

const CATEGORY_PILLS = ["Food & Bev", "Fashion", "Tech", "Beauty", "Lifestyle", "Gaming"];

export function AirplanesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Text reveals staggered line by line
  const op1 = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const rawY1 = useTransform(scrollYProgress, [0.05, 0.15], [30, 0]);
  const y1 = useSpring(rawY1, { stiffness: 400, damping: 30 });

  const op2 = useTransform(scrollYProgress, [0.13, 0.23], [0, 1]);
  const rawY2 = useTransform(scrollYProgress, [0.13, 0.23], [30, 0]);
  const y2 = useSpring(rawY2, { stiffness: 400, damping: 30 });

  const op4 = useTransform(scrollYProgress, [0.26, 0.36], [0, 1]);
  const rawY4 = useTransform(scrollYProgress, [0.26, 0.36], [30, 0]);
  const y4 = useSpring(rawY4, { stiffness: 400, damping: 30 });

  // Planes animate after text is done (0.36+)
  // On mobile use smaller travel distances to keep planes visible in frame
  const plane1X = useTransform(scrollYProgress, [0.36, 0.90], ["0vw", "110vw"]);
  const plane1Y = useTransform(scrollYProgress, [0.36, 0.90], ["20vh", "-110vh"]);
  const plane1Op = useTransform(scrollYProgress, [0.36, 0.40], [0, 1]);

  const plane2X = useTransform(scrollYProgress, [0.42, 0.98], ["0vw", "-110vw"]);
  const plane2Y = useTransform(scrollYProgress, [0.42, 0.98], ["20vh", "-110vh"]);
  const plane2Op = useTransform(scrollYProgress, [0.36, 0.42], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: "300vh", width: "100%" }}
    >
      <div className="sticky top-0 left-0 w-full h-[100vh] overflow-hidden flex flex-col items-center justify-center">

        {/* Plane 1: Pink, left → top-right */}
        <m.div
          style={{
            position: "absolute",
            left: "-10%",
            top: "100%",
            x: plane1X,
            y: plane1Y,
            opacity: plane1Op,
            // Smaller on mobile so it fits without clipping weirdly
            width: "min(900px, 95vw)",
            zIndex: 10,
            willChange: "transform, opacity",
          }}
        >
          <div style={{ position: "relative", transform: "translate(-50%, -50%)" }}>
            <Airplane variant="pink" />
          </div>
        </m.div>

        {/* Plane 2: Green, right → top-left */}
        <m.div
          style={{
            position: "absolute",
            right: "-10%",
            top: "100%",
            x: plane2X,
            y: plane2Y,
            opacity: plane2Op,
            width: "min(480px, 48vw)",
            zIndex: 10,
            willChange: "transform, opacity",
          }}
        >
          <div style={{ position: "relative", transform: "translate(50%, -50%) scaleX(-1)" }}>
            <Airplane variant="green" />
          </div>
        </m.div>

        <div className="relative z-[2] flex flex-col items-center justify-center w-full px-4">
          <m.div
            className={styles.eyebrow + " mb-6 sm:mb-8"}
            style={{ opacity: op1, y: y1 }}
          >
            But what is it actually?
          </m.div>

          <h2 className={styles.airplanesTitle} style={{ textAlign: "center" }}>
            <m.span style={{ display: "block", opacity: op1, y: y1 }}>FOR BRANDS.</m.span>

            <m.span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25em",
                opacity: op2,
                y: y2,
              }}
            >
              <span>FOR</span>
              <InlineCheck />
              <span>CREATORS.</span>
            </m.span>

            <m.span style={{ display: "block", opacity: op4, y: y4 }}>ONE PLATFORM.</m.span>
          </h2>

          {/* Category pills */}
          <m.div
            className="flex flex-wrap justify-center gap-2 mt-6 sm:mt-8 px-2"
            style={{ opacity: op4, maxWidth: "min(600px, 90vw)" }}
          >
            {CATEGORY_PILLS.map((pill) => (
              <span
                key={pill}
                style={{
                  border: "1px solid #1d1c1c",
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: "clamp(0.7rem, 1.5vw, 0.875rem)",
                  fontWeight: 600,
                  color: "#1d1c1c",
                  background: "rgba(255,255,255,0.6)",
                  whiteSpace: "nowrap",
                }}
              >
                {pill}
              </span>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  );
}

function InlineCheck() {
  return (
    <m.span
      initial={{ width: 0, opacity: 0 }}
      whileInView={{ width: "clamp(2.2rem, 4vw + 1.5rem, 5.5rem)", opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "inline-block",
        height: "clamp(1.8rem, 3.5vw + 1.2rem, 5.6rem)",
        position: "relative",
        verticalAlign: "middle",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: "100%",
          height: "100%",
          background: "#ff7ec8",
          border: "2px solid #1d1c1c",
          borderRadius: 14,
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
