"use client";

import { m, useScroll, useSpring } from "framer-motion";
import styles from "../landing.module.css";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return <m.div className={styles.scrollBar} style={{ scaleX }} aria-hidden />;
}
