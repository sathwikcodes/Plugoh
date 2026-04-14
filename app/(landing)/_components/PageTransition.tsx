"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function PageTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const leftX = useTransform(scrollYProgress, [0.1, 0.6], ["-60%", "0%"]);
  const rightX = useTransform(scrollYProgress, [0.1, 0.6], ["60%", "0%"]);
  const textScale = useTransform(scrollYProgress, [0.2, 0.7], [0.6, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.9], [0, 1, 1]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ height: "90vh", background: "linear-gradient(180deg,#ffe87a 0%,#ffd94a 100%)" }}
    >
      <m.h3
        style={{ scale: textScale, opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center text-[28vw] font-[800] leading-none"
      >
        iDEAL
      </m.h3>

      <m.div
        style={{ x: leftX }}
        className="absolute bottom-0 left-0"
      >
        <HandHalf side="left" />
      </m.div>
      <m.div
        style={{ x: rightX }}
        className="absolute bottom-0 right-0"
      >
        <HandHalf side="right" />
      </m.div>
    </section>
  );
}

function HandHalf({ side }: { side: "left" | "right" }) {
  const fillL = "linear-gradient(135deg,#ff3b66,#ff9b4a)";
  const fillR = "linear-gradient(135deg,#a33dff,#ff3dc8)";
  return (
    <svg
      viewBox="0 0 550 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "60vw",
        maxWidth: 720,
        height: "auto",
        display: "block",
        transform: side === "right" ? "scaleX(-1)" : undefined,
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`halfGrad-${side}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={side === "left" ? "#ff3b66" : "#a33dff"} />
          <stop offset="100%" stopColor={side === "left" ? "#ff9b4a" : "#ff3dc8"} />
        </linearGradient>
      </defs>
      <path
        d="M20 400 L20 240 C20 160 70 100 150 100 L210 40 C230 20 270 30 280 60 L260 110 C300 70 350 70 380 100 L400 160 C430 130 480 140 500 180 L540 280 L540 400 Z"
        fill={`url(#halfGrad-${side})`}
        stroke="#1d1c1c"
        strokeWidth="5"
      />
    </svg>
  );
}
