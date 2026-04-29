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
      className="fixed left-0 right-0 top-0 z-[1000] flex items-center justify-center pt-[env(safe-area-inset-top,0px)]"
    >
      <div
        style={{
          marginTop: "clamp(1.5rem, 1.5vw + 0.35rem, 2rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src="/logo-gold.png"
          alt="Plugoh"
          width={2048}
          height={2048}
          quality={100}
          priority
          className={styles.headerLogoMark}
        />
      </div>
    </m.header>
  );
}
