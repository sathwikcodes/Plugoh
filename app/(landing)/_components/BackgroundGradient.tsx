"use client";

import { m, useScroll, useTransform, MotionValue } from "framer-motion";
import styles from "../landing.module.css";

export function BackgroundGradient() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.6, 0.8], [1, 0]) as MotionValue<number>;
  const yellow = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]) as MotionValue<number>;

  return (
    <>
      <m.div className={styles.bgGradient} style={{ opacity }} aria-hidden />
      <m.div
        className={styles.bgGradient}
        style={{
          opacity: yellow,
          background: "linear-gradient(180deg, #ffe070 0%, #ffd94a 100%)",
          animation: "none",
        }}
        aria-hidden
      />
    </>
  );
}
