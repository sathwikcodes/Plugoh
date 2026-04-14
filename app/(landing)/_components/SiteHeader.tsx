"use client";

import { m } from "framer-motion";
import styles from "../sowieso.module.css";

export function SiteHeader() {
  return (
    <m.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed left-0 right-0 top-0 z-[1000] flex items-center justify-center"
    >
      <div
        className={styles.pill}
        style={{
          marginTop: "clamp(1.4375rem, 1.458vw + 0.125rem, 1.875rem)",
          padding: "10px 28px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "clamp(1.1rem, 1.3vw + 0.5rem, 1.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        plugoh
      </div>
    </m.header>
  );
}
