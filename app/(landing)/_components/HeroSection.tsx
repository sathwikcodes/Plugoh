"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../landing.module.css";
import { Hands } from "./Hands";
import { LinesAnimation } from "./LinesAnimation";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handsY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);

  return (
    <section
      ref={ref}
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: "100svh" }}
    >
      {/* Lines animation with radial mask */}
      <div
        className="absolute pointer-events-none z-0 h-[100vh] w-[100vw] top-1/2 left-1/2 flex justify-center items-center"
        style={{
          transform: "translate(-50%, -50%) scale(1.1)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 30%, black 45%)",
          maskImage: "radial-gradient(circle, transparent 30%, black 45%)",
        }}
      >
        <LinesAnimation />
      </div>

      <BackgroundEffects />

      {/* Hands */}
      <div className="absolute w-[100vw] h-[100vh] pointer-events-none">
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -30%) scale(1)",
            width: "100%",
            maxWidth: 1600,
            aspectRatio: "1527/736",
            overflow: "hidden",
            willChange: "transform",
            zIndex: 1,
          }}
        >
          <Hands />
        </div>
      </div>

      {/* Title */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4 ${styles.floatY}`}
        style={{ animationDuration: "5s" }}
      >
        {/* "the ultimate" */}
        <m.span
          className="text-[#1d1c1c] relative z-10 m-0 p-0 font-[800]"
          style={{
            fontFamily: "'GT Walsheim Wero', sans-serif",
            fontSize: "clamp(2rem, 6vw, 5rem)",
            lineHeight: "0.9",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            opacity: titleOpacity,
            y: titleY,
          }}
        >
          the ultimate
          {/* Phase 1 badge */}
          <m.div
            className="absolute"
            style={{
              right: "2px",
              top: "-50px",
              zIndex: 20,
              transform: "translateX(100%)",
            }}
          >
            <div
              className={`${styles.slowSpin} w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 transform transition-transform hover:scale-110`}
            >
              <img
                src="/landing/images/sticker-phase-1-en.png"
                alt="Now in phase 1"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </m.div>
        </m.span>

        {/* "CREATOR" — fluid, never overflows */}
        <m.span
          className="text-[#1d1c1c] relative z-10 m-0 p-0 font-[800]"
          style={{
            fontFamily: "'GT Walsheim Wero', sans-serif",
            fontSize: "clamp(3.5rem, 16vw, 10rem)",
            lineHeight: "0.9",
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            opacity: titleOpacity,
            y: titleY,
          }}
        >
          INFLUENCER
        </m.span>

        {/* "marketplace" */}
        <m.span
          className="text-[#1d1c1c] relative z-10 m-0 p-0 font-[800]"
          style={{
            fontFamily: "'GT Walsheim Wero', sans-serif",
            fontSize: "clamp(2rem, 6vw, 5rem)",
            lineHeight: "0.9",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            opacity: titleOpacity,
            y: titleY,
          }}
        >
          marketplace
        </m.span>
      </div>
    </section>
  );
}

function BackgroundEffects() {
  const elements = [
    // Top-right of the first line (near the ending letter on the top word)
    { cx: 62, cy: 35, size: 3, delay: 0 },
    // Center between the middle word letters
    { cx: 22, cy: 44, size: 4, delay: 0 },
    { cx: 65, cy: 48, size: 2, delay: 0 },
    // Lower-left near the start of "marketplace"
    { cx: 40, cy: 65, size: 3, delay: 0 },
  ];

  return (
    <svg
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 20,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <g>
        {elements.map((el, i) => (
          <g
            key={i}
            style={{
              transformOrigin: `${el.cx}px ${el.cy}px`,
              animation: `sparkleOrbit 6s linear infinite`,
              animationDelay: `${el.delay}s`,
            }}
          >
            <path
              fill="#ffffff"
              d={`M ${el.cx} ${el.cy - el.size}
                 C ${el.cx} ${el.cy - el.size * 0.2} ${el.cx + el.size * 0.2} ${el.cy} ${el.cx + el.size} ${el.cy}
                 C ${el.cx + el.size * 0.2} ${el.cy} ${el.cx} ${el.cy + el.size * 0.2} ${el.cx} ${el.cy + el.size}
                 C ${el.cx} ${el.cy + el.size * 0.2} ${el.cx - el.size * 0.2} ${el.cy} ${el.cx - el.size} ${el.cy}
                 C ${el.cx - el.size * 0.2} ${el.cy} ${el.cx} ${el.cy - el.size * 0.2} ${el.cx} ${el.cy - el.size} Z`}
            />
          </g>
        ))}
      </g>
      <style>{`
        @keyframes sparkleOrbit {
          0%   { transform: rotate(0deg) scale(0.6); opacity: 0; }
          30%  { transform: rotate(108deg) scale(0.6); opacity: 0; }
          40%  { transform: rotate(144deg) scale(1); opacity: 1; }
          80%  { transform: rotate(288deg) scale(1); opacity: 1; }
          100% { transform: rotate(360deg) scale(0.6); opacity: 0; }
        }
      `}</style>
    </svg>
  );
}
