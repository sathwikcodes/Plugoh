"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../landing.module.css";
import { Hands } from "./Hands";

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
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] sm:px-8 md:px-12 lg:px-16 ${styles.floatY}`}
        style={{ animationDuration: "5s" }}
      >
        <m.div
          className="relative flex w-full max-w-[72rem] flex-col items-center gap-1 [container-type:inline-size] sm:gap-0"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <div className="z-10 flex w-full justify-center">
            <span
              className="relative z-10 m-0 inline-block max-w-full p-0 text-center font-[800] text-[#fff8e1]"
              style={{
                fontFamily: "'GT Walsheim Wero', sans-serif",
                fontSize: "clamp(1.75rem, 5.5vw, 5rem)",
                lineHeight: "0.95",
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                paddingInline: "clamp(0px, 2vw, 0.25rem)",
              }}
            >
              the ultimate
              <m.div
                className="pointer-events-auto absolute z-40 w-12 max-[480px]:w-[2.625rem] sm:w-20 md:w-28"
                style={{
                  left: "100%",
                  top: "-0.12em",
                  transform: "translate(-44%, -52%) rotate(20deg)",
                  transformOrigin: "42% 48%",
                }}
              >
                <div
                  className={`${styles.slowSpin} transition-transform hover:scale-110`}
                >
                  <img
                    src="/landing/images/sticker-phase-1-en.png"
                    alt="Now in phase 1"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              </m.div>
            </span>
          </div>

          <span
            className="relative z-10 m-0 w-full max-w-full p-0 text-center font-[800] text-[#fff8e1] max-[480px]:tracking-[-0.025em] tracking-[-0.04em]"
            style={{
              fontFamily: "'GT Walsheim Wero', sans-serif",
              fontSize:
                "clamp(2.5rem, min(14vw, calc((100cqi - 3.5rem) / 8)), 10rem)",
              lineHeight: "0.92",
              textTransform: "uppercase",
              paddingInline: "clamp(0px, 1.5vw, 0.125rem)",
            }}
          >
            INFLUENCER
          </span>

          <span
            className="relative z-10 m-0 w-full max-w-full p-0 text-center font-[800] text-[#fff8e1]"
            style={{
              fontFamily: "'GT Walsheim Wero', sans-serif",
              fontSize: "clamp(1.75rem, 5.5vw, 5rem)",
              lineHeight: "0.95",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              paddingInline: "clamp(0px, 2vw, 0.25rem)",
            }}
          >
            marketplace
          </span>
        </m.div>
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
