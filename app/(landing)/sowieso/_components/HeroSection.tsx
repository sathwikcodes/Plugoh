"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../sowieso.module.css";
import { Hands } from "./Hands";

const TITLE_LINES = ["iDEAL IS", "BECOMING", "WERO"];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const handsScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const handsY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex items-center justify-center"
      style={{ height: "100svh" }}
    >
      {/* decorative lines */}
      <Lines />
      {/* stars */}
      <Stars />

      {/* hands */}
      <m.div
        style={{
          scale: handsScale,
          y: handsY,
          width: "86vw",
          maxWidth: 1100,
          aspectRatio: "1100/1088",
          position: "absolute",
          left: "50%",
          top: "50%",
          translateX: "-50%",
          translateY: "-45%",
          willChange: "transform",
          zIndex: 1,
        }}
      >
        <Hands />
      </m.div>

      {/* title */}
      <m.h1
        className={styles.heroTitle}
        style={{
          y: titleY,
          opacity: titleOpacity,
          position: "relative",
          zIndex: 2,
          willChange: "transform",
          marginTop: "-4vh",
        }}
      >
        {TITLE_LINES.map((line, i) => (
          <m.span
            key={line}
            style={{ display: "block" }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </m.span>
        ))}
      </m.h1>

      {/* Sticker */}
      <m.div
        initial={{ scale: 0, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 12, opacity: 1 }}
        transition={{ delay: 1.1, type: "spring", stiffness: 140, damping: 12 }}
        className={styles.slowSpin}
        style={{
          position: "absolute",
          top: "18%",
          right: "16%",
          width: "clamp(5.5rem, 6.2vw + 2.5rem, 9.875rem)",
          zIndex: 3,
        }}
      >
        <img
          src="/sowieso/images/sticker-phase-1-en.png"
          alt="Now in phase 1"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </m.div>

      {/* Scroll button */}
      <m.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="fixed left-0 right-0 flex items-center justify-center z-20"
        style={{ bottom: 25 }}
      >
        <button
          className={styles.pill}
          style={{
            padding: "14px 22px 14px 18px",
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            fontSize: 15,
          }}
        >
          <span>Scroll and discover what this means</span>
          <span
            className={styles.iconBadgeSm}
            style={{ width: 28, height: 28, boxShadow: "0 2px 0 0 #1d1c1c" }}
          >
            <svg width="12" height="12" viewBox="0 0 17 18" fill="none">
              <path d="M0.916 8.562l7.467 7.467 7.466-7.467" stroke="#1D1C1C" strokeWidth="1.5" />
              <path d="M8.383 16.03V0.944" stroke="#1D1C1C" strokeWidth="1.5" />
            </svg>
          </span>
        </button>
      </m.div>
    </section>
  );
}

function Lines() {
  return (
    <svg
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
    >
      <g stroke="#1d1c1c" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M120 160 L260 240" />
        <path d="M1180 180 L1320 250" />
        <path d="M80 720 L220 660" />
        <path d="M1220 680 L1360 760" />
        <path d="M200 860 L320 790" />
        <path d="M1100 860 L1240 790" />
        <path d="M60 440 L160 500" />
        <path d="M1280 440 L1380 500" />
      </g>
    </svg>
  );
}

function Stars() {
  return (
    <svg
      aria-hidden
      style={{
        position: "absolute",
        left: "4%",
        top: "8%",
        width: "14vw",
        height: "auto",
        pointerEvents: "none",
        zIndex: 0,
      }}
      viewBox="0 0 100 100"
    >
      <g fill="#1d1c1c">
        <circle cx="20" cy="30" r="2" />
        <circle cx="70" cy="20" r="1.5" />
        <circle cx="45" cy="70" r="2.5" />
      </g>
    </svg>
  );
}
