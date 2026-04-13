"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "../sowieso.module.css";
import { Hands } from "./Hands";
import { LinesAnimation } from "./LinesAnimation";

// Dynamic text lines mapping providing logic to the hero messaging
const TITLE_LINES = [
  { text: "the ultimate", size: "max(6vw, 40px)" },
  { text: "CREATOR", size: "max(15vw, 100px)" },
  { text: "marketplace", size: "max(6vw, 40px)" },
];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Title parallaxes up and fades as you scroll
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Hands: scale up slightly + slowly slide DOWN out of view on scroll
  const handsScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const handsY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);

  return (
    <section
      ref={ref}
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: "100svh" }}
    >
      {/* Lines animation explicitly centered with a radial mask to carve an empty radius over the hands */}
      <div 
        className="absolute pointer-events-none z-0 h-[100vh] w-[100vw] top-1/2 left-1/2 flex justify-center items-center"
        style={{ 
          transform: "translate(-50%, -50%) scale(1.1)",
          WebkitMaskImage: "radial-gradient(circle, transparent 30%, black 45%)",
          maskImage: "radial-gradient(circle, transparent 30%, black 45%)"
        }}
      >
        <LinesAnimation />
      </div>

      {/* Dynamic Background Effects: 3 rotating SVG Sparkles + Custom Outward Lines */}
      <BackgroundEffects />

      {/*
        Hands animation holder
        Original CSS:
          aspect-ratio: 1100/1088 (mobile) | here we use 1527/736 (desktop)
          width: 86vw; max-width: ~1100px
          className="absolute w-[100vw] h-[100vh] pointer-events-none"
      */}
      <div className="absolute w-[100vw] h-[100vh] pointer-events-none">
        {/*
          Custom Lottie Hands Integration centered globally
        */}
        <div style={{
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
        }}>
          <Hands />
        </div>
      </div>

      {/* 
        Custom imported Fonts logic for GT Walsheim Wero mapped directly from the website dump.
      */}
      <style>{`
        @font-face {
          font-family: 'GT Walsheim Wero';
          src: url('/sowieso/fonts/GT-Walsheim-wero-Black.woff2') format('woff2');
          font-weight: 900;
        }
        @font-face {
          font-family: 'GT Walsheim Wero';
          src: url('/sowieso/fonts/GT-Walsheim-wero-Medium.woff2') format('woff2');
          font-weight: 500;
        }
      `}</style>

      {/*
        Title layered on top, fading/moving up on scroll
      */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
        {TITLE_LINES.map((line, i) => (
          <m.span
            key={i}
            className={`text-[#1d1c1c] uppercase relative z-10 m-0 p-0 font-black`}
            style={{
              fontFamily: "'GT Walsheim Wero', sans-serif",
              fontSize: line.size,
              lineHeight: "0.9",
              letterSpacing: i === 1 ? "-0.04em" : "-0.02em",
              opacity: titleOpacity,
              y: titleY,
            }}
          >
            {line.text}
            
            {/* Inject sticker precisely attached to the top-right ('e') of the first line */}
            {i === 0 && (
              <m.div
                className="absolute"
                style={{
                  right: "-20px",  // offset visually past the 'e'
                  top: "-30px",    // hover above the top-bound
                  zIndex: 20,
                  transform: "translateX(100%)", // push clearly outside the text
                }}
              >
                <div
                  className={`${styles.slowSpin} w-20 h-20 md:w-28 md:h-28 xl:w-32 xl:h-32 transform transition-transform hover:scale-110`}
                >
                  <img
                    src="/sowieso/images/sticker-phase-1-en.png"
                    alt="Now in phase 1"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              </m.div>
            )}
          </m.span>
        ))}
      </div>

      {/* Scroll button is managed by BottomNav */}
    </section>
  );
}

/**
 * Dynamic background combination.
 * 3 rotating custom SVG sparkles near the text.
 */
function BackgroundEffects() {
  const elements = [
    // --- 3 ROTATING SVG SPARKLES AROUND THE TEXT ---
    // Overlaying 'M'
    { type: "sparkle", cx: 35, cy: 35, size: 5, delay: 0 },
    // Overlaying 'R'
    { type: "sparkle", cx: 65, cy: 35, size: 4, delay: 0 },
    // Overlaying 'A'
    { type: "sparkle", cx: 50, cy: 50, size: 6, delay: 0 },
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
              d={`M ${el.cx} ${el.cy! - el.size!} 
                 C ${el.cx} ${el.cy! - el.size!*0.2} ${el.cx! + el.size!*0.2} ${el.cy} ${el.cx! + el.size!} ${el.cy} 
                 C ${el.cx! + el.size!*0.2} ${el.cy} ${el.cx} ${el.cy! + el.size!*0.2} ${el.cx} ${el.cy! + el.size!} 
                 C ${el.cx} ${el.cy! + el.size!*0.2} ${el.cx! - el.size!*0.2} ${el.cy} ${el.cx! - el.size!} ${el.cy} 
                 C ${el.cx! - el.size!*0.2} ${el.cy} ${el.cx} ${el.cy! - el.size!*0.2} ${el.cx} ${el.cy! - el.size!} Z`}
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
