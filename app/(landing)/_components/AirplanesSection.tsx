"use client";

import { m, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../landing.module.css";
import { Airplane } from "./Airplane";

export function AirplanesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const op1 = useTransform(scrollYProgress, [0.12, 0.22], [0, 1]);
  const rawY1 = useTransform(scrollYProgress, [0.12, 0.22], [30, 0]);
  const y1 = useSpring(rawY1, { stiffness: 400, damping: 30 });

  const op2 = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const rawY2 = useTransform(scrollYProgress, [0.2, 0.3], [30, 0]);
  const y2 = useSpring(rawY2, { stiffness: 400, damping: 30 });

  const op4 = useTransform(scrollYProgress, [0.28, 0.38], [0, 1]);
  const rawY4 = useTransform(scrollYProgress, [0.28, 0.38], [30, 0]);
  const y4 = useSpring(rawY4, { stiffness: 400, damping: 30 });

  const plane1X = useTransform(scrollYProgress, [0.4, 0.9], ["0vw", "110vw"]);
  const plane1Y = useTransform(scrollYProgress, [0.4, 0.9], ["20vh", "-110vh"]);
  const plane1Op = useTransform(scrollYProgress, [0.4, 0.44], [0, 1]);

  const plane2X = useTransform(
    scrollYProgress,
    [0.46, 0.98],
    ["0vw", "-110vw"],
  );
  const plane2Y = useTransform(
    scrollYProgress,
    [0.46, 0.98],
    ["20vh", "-110vh"],
  );
  const plane2Op = useTransform(scrollYProgress, [0.4, 0.46], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: "300vh", width: "100%" }}
    >
      <div className="sticky top-0 left-0 w-full h-[100svh] min-h-[100dvh] overflow-hidden flex flex-col items-center justify-center">
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
          <div
            style={{ position: "relative", transform: "translate(-50%, -50%)" }}
          >
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
          <div
            style={{
              position: "relative",
              transform: "translate(50%, -50%) scaleX(-1)",
            }}
          >
            <Airplane variant="green" />
          </div>
        </m.div>

        <div
          className="relative z-[2] flex flex-col items-center justify-center w-full max-w-[100vw] box-border text-[#f4f0f8]"
          style={{
            paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
            paddingRight: "max(1.25rem, env(safe-area-inset-right))",
            paddingTop: "max(0.75rem, env(safe-area-inset-top))",
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <m.div
            className={styles.eyebrow + " mb-5 sm:mb-8 text-center"}
            style={{ opacity: op1, y: y1 }}
          >
            But what is it actually?
          </m.div>

          <h2
            className={styles.airplanesTitle}
            style={{
              textAlign: "center",
              width: "100%",
              maxWidth: "min(22em, 100%)",
              margin: 0,
              fontSize: "clamp(1.5rem, 3.85vw + 0.65rem, 8.125rem)",
              lineHeight: 0.88,
            }}
          >
            <m.span style={{ display: "block", opacity: op1, y: y1 }}>
              FOR BRANDS.
            </m.span>

            <m.span
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.2em",
                opacity: op2,
                y: y2,
              }}
            >
              <span>FOR</span>
              <img
                src="/notifyheart.png"
                alt=""
                aria-hidden
                style={{
                  height: "0.95em",
                  width: "auto",
                  display: "block",
                  flexShrink: 0,
                }}
              />
              <span>INFLUENCERS.</span>
            </m.span>

            <m.span style={{ display: "block", opacity: op4, y: y4 }}>
              ONE PLATFORM.
            </m.span>
          </h2>
        </div>
      </div>
    </section>
  );
}
