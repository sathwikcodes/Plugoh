"use client";

import { m } from "framer-motion";
import styles from "../sowieso.module.css";

export function SiteHeader() {
  return (
    <>
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
            padding: "6px 14px 8px 10px",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            width: "clamp(11.3125rem, 12.5vw + 0.0625rem, 15.0625rem)",
            justifyContent: "space-between",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              background: "linear-gradient(135deg,#ff4aa0,#ff8aff)",
              border: "1px solid #1d1c1c",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1d1c1c",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "-0.02em",
            }}
          >
            iD
          </span>
          <span
            aria-hidden
            style={{
              width: 1,
              height: 22,
              background: "#1d1c1c",
            }}
          />
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em" }}>
            wero
          </span>
        </div>
      </m.header>

      <div
        className="fixed z-[999] flex items-center gap-3"
        style={{ right: 28, top: 30 }}
      >
        <span className={styles.pill} style={pillSm}>NL</span>
        <span
          className={styles.pill}
          style={{ ...pillSm, background: "#fff48d", fontWeight: 800 }}
        >
          EN
        </span>
        <button
          className={styles.pill}
          aria-label="Contact"
          style={{
            width: 40,
            height: 40,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* speech bubble icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6Z"
              stroke="#1d1c1c"
              strokeWidth="1.5"
            />
            <circle cx="9" cy="10" r="1" fill="#1d1c1c" />
            <circle cx="13" cy="10" r="1" fill="#1d1c1c" />
            <circle cx="17" cy="10" r="1" fill="#1d1c1c" />
          </svg>
        </button>
      </div>
    </>
  );
}

const pillSm: React.CSSProperties = {
  width: 40,
  height: 40,
  padding: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 700,
};
