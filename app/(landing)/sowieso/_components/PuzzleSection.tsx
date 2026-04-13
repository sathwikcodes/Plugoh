"use client";

import { useRef, useEffect } from "react";
import styles from "../sowieso.module.css";
import { Reveal } from "./Reveal";
import { FistBump } from "./FistBump";

const TOTAL_FRAMES = 401;

export function PuzzleSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  // float accumulator so tiny trackpad deltas don't get lost
  const frameRef = useRef(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const section = sectionRef.current;
      const anim = lottieRef.current;
      if (!section || !anim) return;

      // Only intercept when this section fills the viewport
      const { top, bottom } = section.getBoundingClientRect();
      const fills = top <= 2 && bottom >= window.innerHeight - 2;
      if (!fills) return;

      const goingDown = e.deltaY > 0;

      // At the boundary in the direction of travel → let the page scroll naturally
      if (goingDown && frameRef.current >= TOTAL_FRAMES - 1) return;
      if (!goingDown && frameRef.current <= 0) return;

      // Consume the scroll event — page doesn't move
      e.preventDefault();

      // Scale: a typical mouse-wheel click is ~100 px delta → ~17 frames
      const next = frameRef.current + e.deltaY * 0.17;
      frameRef.current = Math.max(0, Math.min(TOTAL_FRAMES - 1, next));
      anim.goToAndStop(Math.round(frameRef.current), true);
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const section = sectionRef.current;
      const anim = lottieRef.current;
      if (!section || !anim) return;

      const { top, bottom } = section.getBoundingClientRect();
      if (!(top <= 2 && bottom >= window.innerHeight - 2)) return;

      const dy = lastTouchY - e.touches[0].clientY;
      lastTouchY = e.touches[0].clientY;

      const goingDown = dy > 0;
      if (goingDown && frameRef.current >= TOTAL_FRAMES - 1) return;
      if (!goingDown && frameRef.current <= 0) return;

      e.preventDefault();
      const next = frameRef.current + dy * 0.5;
      frameRef.current = Math.max(0, Math.min(TOTAL_FRAMES - 1, next));
      anim.goToAndStop(Math.round(frameRef.current), true);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        height: "100vh",
        background: "linear-gradient(180deg, #ffe87a 0%, #ffd84a 100%)",
      }}
    >
      {/* Fist bump Lottie: centered full-width, behind title */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "100vw",
          aspectRatio: "2483/900",
        }}
      >
        <FistBump lottieRef={lottieRef} />
      </div>

      {/* Title above fists */}
      <div className="relative z-10 flex flex-col items-center w-full px-4">
        <Reveal as="h2" className={styles.airplanesTitle + " text-center"} amount={0.3}>
          <span style={{ display: "block" }}>iDEAL IS BECOMING</span>
          <span style={{ display: "block" }}>THE CORE</span>
          <span style={{ display: "block" }}>MARKETPLACE</span>
        </Reveal>
      </div>
    </div>
  );
}
