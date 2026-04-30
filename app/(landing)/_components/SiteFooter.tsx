"use client";

import type { CSSProperties } from "react";
import styles from "../landing.module.css";
import { Reveal } from "./Reveal";

const ArrowShort = () => (
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" aria-hidden>
    <path d="M17.4 18.07V7.51H6.84" stroke="#1D1C1C" strokeWidth="1.33" />
    <path d="M17.4 7.51L6.74 18.18" stroke="#1D1C1C" strokeWidth="1.33" />
  </svg>
);

export function SiteFooter() {
  return (
    <footer
      id="footer"
      className="relative"
      style={{
        background: "linear-gradient(180deg,#ffd94a 0%,#ffc930 100%)",
        padding:
          "60px clamp(20px, 4vw, 80px) calc(120px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        className="mx-auto grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_1.3fr_90px]"
        style={{
          maxWidth: "1600px",
        }}
      >
        {/* Tile 1: Brand tile — spans full width on sm grid */}
        <Reveal
          className={`${styles.surfaceCard} ${styles.partnerTile} relative overflow-hidden h-full flex flex-col w-[min(100%,520px)] mx-auto sm:w-full sm:col-span-2 lg:col-span-1`}
        >
          <a
            href="/login"
            className="block relative p-4 sm:p-6 lg:p-8 flex-1 min-h-[320px] sm:min-h-[340px] lg:min-h-[460px]"
            style={{ color: "#1d1c1c" }}
          >
            <div
              className={`font-[800] text-[1.65rem] sm:text-3xl xl:text-[2.2rem] uppercase leading-[0.95]`}
            >
              South India&apos;s influencer marketplace
            </div>
            <span
              className={styles.iconBadge}
              style={{
                position: "absolute",
                top: "38%",
                right: 16,
                transform: "translateY(-50%)",
                background: "#ffd94a",
              }}
            >
              <ArrowShort />
            </span>
            <img
              src="/landing/images/footer-banks.svg"
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                bottom: 16,
                transform: "translateX(-50%)",
                width: "min(88%, 520px)",
                height: "auto",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          </a>
        </Reveal>

        {/* Tile 2: Two stacked tiles (mirrors original iDEAL + Wero tiles) */}
        <div
          className="grid gap-3 sm:gap-4 lg:gap-6 w-[min(100%,520px)] mx-auto sm:w-full sm:col-span-2 lg:col-span-1"
          style={{ gridTemplateRows: "1fr 1fr" }}
        >
          <Reveal className={`${styles.surfaceCard} relative bg-white`}>
            <a
              href="/login"
              className="p-4 sm:p-6 h-full min-h-[118px] sm:min-h-[220px] lg:min-h-[218px] flex items-center justify-start relative"
              style={{ color: "#1d1c1c" }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "clamp(1rem, 1.5vw + 0.55rem, 1.8rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                For Brands
              </span>
              <span
                className={styles.iconBadge}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: 16,
                  background: "#ffd94a",
                }}
              >
                <ArrowShort />
              </span>
            </a>
          </Reveal>
          <Reveal className={`${styles.surfaceCard} relative bg-white`}>
            <a
              href="/login"
              className="p-4 sm:p-6 h-full min-h-[118px] sm:min-h-[220px] lg:min-h-[218px] flex items-center justify-start relative"
              style={{ color: "#1d1c1c" }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "clamp(1rem, 1.5vw + 0.55rem, 1.8rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                For Influencers
              </span>
              <span
                className={styles.iconBadge}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: 16,
                  background: "#ffd94a",
                }}
              >
                <ArrowShort />
              </span>
            </a>
          </Reveal>
        </div>

        {/* Tile 3: FAQ tile */}
        <Reveal
          className={`${styles.surfaceCard} ${styles.faqTilePink} relative overflow-hidden h-full flex flex-col w-[min(100%,520px)] mx-auto sm:w-full sm:col-span-2 lg:col-span-1`}
        >
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-faq"))}
            className="block relative p-4 sm:p-6 lg:p-8 flex-1 min-h-[190px] sm:min-h-[340px] lg:min-h-[460px] w-full text-left"
            style={{
              color: "#1d1c1c",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <div
              className="font-[500] text-[0.75rem] sm:text-sm xl:text-base text-center"
              style={{ marginBottom: 14 }}
            >
              Frequently Asked Questions
            </div>
            <div
              className="font-[800] uppercase text-center"
              style={{
                fontSize: "clamp(1.35rem, 2vw + 0.8rem, 3rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.02em",
              }}
            >
              How does Plugoh handle <br />
              <span className={styles.hlCyan}>campaign</span>
              <br />
              payments?
            </div>
            <span
              className={styles.iconBadge}
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                background: "#ffd94a",
              }}
            >
              <ArrowShort />
            </span>
          </button>
        </Reveal>

        {/* Tile 4: Social tile — row on mobile/sm, column on lg */}
        <div
          className={`${styles.surfaceCard} ${styles.faqTileGreen} flex flex-row lg:flex-col items-center justify-center gap-3 sm:gap-6 p-3 sm:p-4 h-full w-[min(100%,520px)] mx-auto sm:w-full sm:col-span-2 lg:col-span-1`}
          style={{ minHeight: 120 }}
        >
          {[
            {
              href: "https://www.instagram.com/weareplugoh/",
              label: "Instagram",
              disabled: false,
              svg: (
                <svg
                  width="20"
                  height="19"
                  viewBox="0 0 24 23"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 2c3 0 3.3 0 4.5.06 1.08.05 1.66.23 2.05.38.52.2.88.44 1.27.83.39.39.63.75.83 1.27.15.39.33.97.38 2.05.06 1.17.06 1.51.06 4.41s0 3.24-.06 4.41c-.05 1.08-.23 1.66-.38 2.05-.2.52-.44.88-.83 1.27-.39.39-.75.63-1.27.83-.39.15-.97.33-2.05.38-1.17.06-1.51.06-4.5.06s-3.24 0-4.41-.06c-1.08-.05-1.66-.23-2.05-.38-.52-.2-.88-.44-1.27-.83-.39-.39-.63-.75-.83-1.27-.15-.39-.33-.97-.38-2.05C3 14.3 3 13.96 3 11.06s0-3.24.06-4.41c.05-1.08.23-1.66.38-2.05.2-.52.44-.88.83-1.27.39-.39.75-.63 1.27-.83.39-.15.97-.33 2.05-.38C8.76 2.06 9.1 2 12 2Z"
                    stroke="#1d1c1c"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="11"
                    r="4"
                    stroke="#1d1c1c"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <circle cx="18" cy="5.5" r="1.2" fill="#1d1c1c" />
                </svg>
              ),
            },
            {
              label: "X",
              disabled: true,
              svg: (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.737-8.835L2.249 2.25H8.08l4.261 5.636 5.903-5.636Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
                    fill="#1d1c1c"
                  />
                </svg>
              ),
            },
            {
              label: "LinkedIn",
              disabled: true,
              svg: (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                    stroke="#1d1c1c"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <rect
                    x="2"
                    y="9"
                    width="4"
                    height="12"
                    stroke="#1d1c1c"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <circle
                    cx="4"
                    cy="4"
                    r="2"
                    stroke="#1d1c1c"
                    strokeWidth="1.8"
                    fill="none"
                  />
                </svg>
              ),
            },
          ].map((s) => {
            const badgeStyle: CSSProperties = {
              width: "52px",
              height: "52px",
              background: "#fff",
              transition: "transform 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...(s.disabled
                ? { opacity: 0.38, pointerEvents: "none", cursor: "default" }
                : {}),
            };
            if (s.disabled) {
              return (
                <span
                  key={s.label}
                  className={styles.iconBadge}
                  style={badgeStyle}
                  aria-disabled="true"
                  aria-label={`${s.label} — unavailable`}
                >
                  {s.svg}
                </span>
              );
            }
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={styles.iconBadge}
                style={badgeStyle}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                {s.svg}
              </a>
            );
          })}
        </div>
      </div>

      {/* Bottom wordmark — "plugoh" replacing "sowieso" */}
      <Reveal className="mt-14">
        <div
          style={{
            fontWeight: 800,
            fontSize: "clamp(3.5rem, 14vw, 14rem)",
            letterSpacing: "-0.047em",
            lineHeight: 0.85,
            color: "#1d1c1c",
            textAlign: "center",
            userSelect: "none",
            overflowWrap: "break-word",
            width: "100%",
          }}
        >
          plugoh.
        </div>
      </Reveal>

      <div
        className="mt-15 text-center"
        style={{ fontSize: 14, color: "#1d1c1c" }}
      >
        © 2026 Plugoh | All rights reserved.{" "}
        <a
          href="/privacy"
          style={{ color: "#1d1c1c", fontWeight: 700, textDecoration: "none" }}
        >
          Privacy Policy
        </a>{" "}
        |{" "}
        <a
          href="/terms"
          style={{ color: "#1d1c1c", fontWeight: 700, textDecoration: "none" }}
        >
          Terms
        </a>
      </div>
    </footer>
  );
}
