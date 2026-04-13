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
  const plane1X = useTransform(scrollYProgress, [0, 1], ["-30%", "120%"]);
  const plane1Y = useTransform(scrollYProgress, [0, 1], ["40%", "-40%"]);
  const plane2X = useTransform(scrollYProgress, [0, 1], ["120%", "-30%"]);
  const plane2Y = useTransform(scrollYProgress, [0, 1], ["80%", "10%"]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{
        minHeight: "125dvh",
        padding: "clamp(0rem,6.47vw - 1.52rem,6.25rem) 30px",
        width: "100%",
      }}
    >
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

      <div className="relative z-[2] flex flex-col items-center justify-center pt-[18vh] pb-[30vh]">
        <Reveal className={styles.eyebrow + " mb-8"}>But what is it actually?</Reveal>
        <Reveal
          as="h2"
          className={styles.airplanesTitle}
          amount={0.25}
        >
          <span style={{ display: "block" }}>iDEAL IS BECOMING</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3em" }}>
            <span>WERO</span>
            <InlineCheck />
            <span>THE</span>
          </span>
          <span style={{ display: "block" }}>NEW EUROPEAN</span>
          <span style={{ display: "block" }}>WAY TO PAY.</span>
        </Reveal>
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
