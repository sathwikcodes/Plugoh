"use client";

import { m, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "../sowieso.module.css";

export function BottomNav() {
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => {
      // Trigger down bar aggressively the exact instant the user begins to push down from the absolute top
      setPastHero(y > 30);
    });
    return unsub;
  }, [scrollY]);

  return (
    <>
      {/* Bottom center — toggles between scroll hint and nav links */}
      <div className="fixed bottom-[22px] left-1/2 z-[1100] -translate-x-1/2">
        <AnimatePresence mode="wait">
          {!pastHero ? (
            /* Hero state: "Scroll and discover" */
            <m.div
              key="scroll-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              <a
                href="#puzzle"
                className={styles.pill}
                style={{
                  padding: "14px 22px 14px 18px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 15,
                }}
              >
                <span>Scroll and discover</span>
                <span
                  className={styles.iconBadgeSm}
                  style={{ width: 28, height: 28, boxShadow: "0 2px 0 0 #1d1c1c" }}
                >
                  <svg width="12" height="12" viewBox="0 0 17 18" fill="none">
                    <path d="M0.916 8.562l7.467 7.467 7.466-7.467" stroke="#1D1C1C" strokeWidth="1.5" />
                    <path d="M8.383 16.03V0.944" stroke="#1D1C1C" strokeWidth="1.5" />
                  </svg>
                </span>
              </a>
            </m.div>
          ) : (
            /* Post-hero state: nav links */
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
                  padding: "10px 18px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 24,
                  fontSize: 14,
                }}
              >
                <a href="#puzzle">What is it?</a>
                <a href="#cards">When?</a>
                <a href="#faq">FAQ</a>
                <a href="#psp-partners">Your PSP Partners</a>
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom left utilities block: FAQ button matching source layout natively */}
      <div className="fixed left-4 bottom-[22px] z-[1100] flex items-center gap-3">
        <button
          aria-label="Cookies"
          className={styles.iconBadge}
          style={{ background: "#1d1c1c", color: "#fff48d", fontWeight: 800, fontSize: 12, border: "1px solid #1d1c1c" }}
        >
          CO
        </button>
        <AnimatePresence>
          {pastHero && (
            <m.a
              href="#faq"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className={styles.pill}
              style={{
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              FAQ
            </m.a>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
