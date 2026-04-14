"use client";

import { AnimatePresence, m, useScroll } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../landing.module.css";

export function BottomNav() {
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => {
      setPastHero(y > 30);
    });

    return unsub;
  }, [scrollY]);

  return (
    <>
      <AnimatePresence>
        {!pastHero && (
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 bottom-[18px] z-[1100] sm:hidden pointer-events-none"
          >
            <div className="mx-auto flex max-w-[560px] justify-center px-3 pointer-events-none">
              <a
                href="#about"
                className={styles.pill}
                style={{
                  padding: "14px 18px 14px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                }}
              >
                <span>Scroll and discover what this means.</span>
                <span
                  className={styles.iconBadgeSm}
                  style={{
                    width: 34,
                    height: 34,
                    background: "#fff48d",
                    boxShadow: "0 2px 0 0 #1d1c1c",
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 17 18" fill="none">
                    <path
                      d="M0.916 8.562l7.467 7.467 7.466-7.467"
                      stroke="#1D1C1C"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8.383 16.03V0.944"
                      stroke="#1D1C1C"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              </a>
            </div>
          </m.div>
        )}

        {pastHero && (
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 bottom-0 z-[1100] sm:hidden pointer-events-none"
          >
            <div className="relative mx-auto flex max-w-[560px] items-end justify-between gap-3 px-3 pb-3 pointer-events-none">
              <m.button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-faq"))
                }
                className="pointer-events-auto inline-flex items-center justify-between rounded-full border-2 border-[#1d1c1c] bg-[#fff48d] px-5 py-4 text-[1.05rem] font-[700] text-[#1d1c1c]"
                style={{
                  boxShadow: "0 6px 0 0 #1d1c1c",
                  minWidth: "clamp(136px, 42vw, 180px)",
                  gap: 18,
                  flex: "0 0 auto",
                }}
              >
                <span style={{ letterSpacing: "-0.03em" }}>FAQ</span>
                <span
                  className={styles.iconBadgeSm}
                  style={{
                    width: 28,
                    height: 28,
                    background: "#fff",
                    border: "2px solid #1d1c1c",
                    boxShadow: "0 0 0 0 transparent",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12 20V5"
                      stroke="#1D1C1C"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5 12L12 5L19 12"
                      stroke="#1D1C1C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </m.button>

              <div className="relative pointer-events-auto">
                <m.button
                  onClick={() => setMobileMenuOpen((value) => !value)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-nav-drawer"
                  className="inline-flex items-center justify-between rounded-full border-2 border-[#1d1c1c] bg-white px-5 py-4 text-[1.05rem] font-[700] text-[#1d1c1c]"
                  style={{
                    boxShadow: "0 6px 0 0 #1d1c1c",
                    minWidth: "clamp(136px, 42vw, 180px)",
                    gap: 18,
                  }}
                >
                  <span style={{ letterSpacing: "-0.03em" }}>Menu</span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                    }}
                  >
                    <svg
                      width="28"
                      height="20"
                      viewBox="0 0 28 20"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M3 4H25"
                        stroke="#1D1C1C"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M3 10H25"
                        stroke="#1D1C1C"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M3 16H25"
                        stroke="#1D1C1C"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </m.button>

                <AnimatePresence>
                  {mobileMenuOpen && (
                    <m.div
                      id="mobile-nav-drawer"
                      initial={{ opacity: 0, y: 14, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 14, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 bottom-[calc(100%+12px)] w-[min(92vw,320px)] overflow-hidden rounded-[28px] border-2 border-[#1d1c1c] bg-[#fff48d]"
                      style={{ boxShadow: "0 10px 0 0 #1d1c1c" }}
                    >
                      {[
                        {
                          label: "What is it?",
                          href: "#about",
                          kind: "scroll" as const,
                        },
                        {
                          label: "How it works",
                          href: "#how-it-works",
                          kind: "scroll" as const,
                        },
                        {
                          label: "Log in",
                          href: "/login",
                          kind: "link" as const,
                        },
                      ].map((item) => {
                        if (item.kind === "link") {
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex w-full items-center justify-between border-b-2 border-[#1d1c1c] bg-transparent px-5 py-4 text-left text-[1rem] font-[700] text-[#1d1c1c] last:border-b-0"
                              style={{
                                letterSpacing: "-0.03em",
                                textDecoration: "none",
                              }}
                            >
                              <span>{item.label}</span>
                              <span
                                className={styles.iconBadgeSm}
                                style={{
                                  width: 30,
                                  height: 30,
                                  background: "#fff",
                                  border: "2px solid #1d1c1c",
                                  boxShadow: "0 0 0 0 transparent",
                                  flexShrink: 0,
                                }}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  aria-hidden
                                >
                                  <path
                                    d="M6 12h12M12 6l6 6-6 6"
                                    stroke="#1D1C1C"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </Link>
                          );
                        }

                        return (
                          <button
                            key={item.label}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              document
                                .getElementById(item.href.slice(1))
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            }}
                            className="flex w-full items-center justify-between border-b-2 border-[#1d1c1c] bg-transparent px-5 py-4 text-left text-[1rem] font-[700] text-[#1d1c1c] last:border-b-0"
                            style={{ letterSpacing: "-0.03em" }}
                          >
                            <span>{item.label}</span>
                            <span
                              className={styles.iconBadgeSm}
                              style={{
                                width: 30,
                                height: 30,
                                background: "#fff",
                                border: "2px solid #1d1c1c",
                                boxShadow: "0 0 0 0 transparent",
                                flexShrink: 0,
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden
                              >
                                <path
                                  d="M6 12h12M12 6l6 6-6 6"
                                  stroke="#1D1C1C"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </button>
                        );
                      })}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <div className="hidden sm:block fixed bottom-[22px] sm:bottom-[30px] left-1/2 z-[1100] -translate-x-1/2">
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
                  padding: "18px 30px 18px 22px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 18,
                  fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                  whiteSpace: "nowrap",
                }}
              >
                <span>Scroll and discover what this means.</span>
                <span
                  className={styles.iconBadgeSm}
                  style={{
                    width: 40,
                    height: 40,
                    background: "#fff48d",
                    boxShadow: "0 2px 0 0 #1d1c1c",
                    flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 17 18" fill="none">
                    <path
                      d="M0.916 8.562l7.467 7.467 7.466-7.467"
                      stroke="#1D1C1C"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8.383 16.03V0.944"
                      stroke="#1D1C1C"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              </a>
            </m.div>
          ) : (
            <m.nav
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              <div
                className={styles.pill}
                style={{
                  padding: "16px 30px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "clamp(18px, 3.8vw, 34px)",
                  fontSize: "clamp(0.95rem, 2.3vw, 1.15rem)",
                  whiteSpace: "nowrap",
                }}
              >
                <a
                  href="#about"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  What is it?
                </a>
                <a
                  href="#how-it-works"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  How it works
                </a>
                <a
                  href="/login"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Log in
                </a>
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden sm:block fixed left-4 sm:left-5 bottom-[76px] sm:bottom-[30px] z-[1100]">
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
                padding: "8px 9px 8px 14px",
                fontSize: "clamp(0.95rem, 2.3vw, 1.15rem)",
                fontWeight: 600,
                lineHeight: 1,
                cursor: "pointer",
                color: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#fff48d",
                border: "none",
              }}
            >
              <span style={{ letterSpacing: "-0.03em", lineHeight: 1 }}>
                FAQ
              </span>
              <span
                className={styles.iconBadgeSm}
                style={{
                  width: 40,
                  height: 40,
                  background: "#ececec",
                  border: "2px solid #1d1c1c",
                  boxShadow: "0 0 0 0 transparent",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 20V5"
                    stroke="#1D1C1C"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 12L12 5L19 12"
                    stroke="#1D1C1C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </m.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
