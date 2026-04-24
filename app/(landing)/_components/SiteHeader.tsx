"use client";

import { m } from "framer-motion";
import Image from "next/image";
import styles from "../landing.module.css";

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
          padding: "2px 18px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--surface)",
        }}
      >
        <Image
          src="/logo-gold.png"
          alt="Plugoh"
          height={48}
          width={114}
          quality={100}
          priority
          style={{
            width: "114px",
            height: "48px",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
    </m.header>
  );
}
