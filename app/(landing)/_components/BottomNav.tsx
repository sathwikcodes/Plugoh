"use client";

import { m, useScroll, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "../sowieso.module.css";

export function BottomNav() {
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => {
      setPastHero(y > 30);
    });
    return unsub;
  }, [scrollY]);

  return (
    <>
      {/* Bottom center — scroll hint → nav links */}
      <div className="fixed bottom-[18px] sm:bottom-[22px] left-1/2 z-[1100] -translate-x-1/2">
        <AnimatePresence mode="wait">
          {!pastHero ? (
            <m.div
              key="scroll-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              <a
                href="#about"
                className={styles.pill}
                style={{
                  padding: "11px 18px 11px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: "clamp(0.8rem, 2vw, 0.9375rem)",
                  whiteSpace: "nowrap",
                }}
              >
                <span>Scroll and discover</span>
                <span
                  className={styles.iconBadgeSm}
                  style={{ width: 26, height: 26, boxShadow: "0 2px 0 0 #1d1c1c", flexShrink: 0 }}
                >
                  <svg width="11" height="11" viewBox="0 0 17 18" fill="none">
                    <path d="M0.916 8.562l7.467 7.467 7.466-7.467" stroke="#1D1C1C" strokeWidth="1.5" />
                    <path d="M8.383 16.03V0.944" stroke="#1D1C1C" strokeWidth="1.5" />
                  </svg>
                </span>
              </a>
            </m.div>
          ) : (
            <m.nav
              key="nav-links"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              <div
                className={styles.pill}
                style={{
                  padding: "9px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "clamp(12px, 3vw, 24px)",
                  fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                  whiteSpace: "nowrap",
                }}
              >
                <a href="#about" style={{ textDecoration: "none", color: "inherit" }}>What is it?</a>
                <a href="#how-it-works" style={{ textDecoration: "none", color: "inherit" }}>How it works</a>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("open-faq"))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit", padding: 0 }}
                >
                  FAQ
                </button>
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom left — FAQ pill (appears after scrolling past hero) */}
      <div className="fixed left-4 bottom-[18px] sm:bottom-[22px] z-[1100]">
        <AnimatePresence>
          {pastHero && (
            <m.button
              onClick={() => window.dispatchEvent(new CustomEvent("open-faq"))}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className={styles.pill}
              style={{
                padding: "8px 14px",
                fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                fontWeight: 600,
                cursor: "pointer",
                color: "inherit",
                background: "none",
                border: "none",
              }}
            >
              FAQ
            </m.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
