"use client";

import styles from "../sowieso.module.css";
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
      id="veelgestelde-vragen"
      className="relative"
      style={{
        background: "linear-gradient(180deg,#ffd94a 0%,#ffc930 100%)",
        padding: "60px clamp(20px, 4vw, 80px) 60px",
      }}
    >
      <div
        className="mx-auto grid gap-4 lg:gap-6 lg:grid-cols-[1.1fr_1.1fr_1.3fr_90px]"
        style={{
          maxWidth: "1600px",
        }}
      >
        <Reveal
          className={`${styles.surfaceCard} ${styles.partnerTile} relative overflow-hidden h-full flex flex-col`}
        >
          <a
            href="#psp-partners"
            className="block relative p-6 lg:p-8 flex-1 min-h-[380px]"
            style={{ color: "#1d1c1c" }}
          >
            <div className={`font-[800] text-3xl xl:text-[2.2rem] uppercase leading-[0.95]`}>
              Always available <br /> with our psp <br /> partners
            </div>
            <span
              className={styles.iconBadge}
              style={{ position: "absolute", top: "40%", right: 24, transform: "translateY(-50%)" }}
            >
              <ArrowShort />
            </span>
            <img
              src="/sowieso/images/footer-banks.svg"
              alt=""
              style={{
                position: "absolute",
                left: "-5%",
                bottom: -2,
                width: "110%",
                height: "auto",
              }}
            />
          </a>
        </Reveal>

        <div className="grid gap-4 lg:gap-6" style={{ gridTemplateRows: "1fr 1fr" }}>
          <Reveal className={`${styles.surfaceCard} relative bg-white`}>
            <a
              href="https://ideal.nl/en"
              target="_blank"
              rel="noreferrer"
              className="p-6 h-full min-h-[160px] flex items-center justify-start relative"
            >
              <img
                src="/sowieso/images/footer-ideal.svg"
                alt="iDEAL"
                style={{ maxWidth: "60%", height: "auto" }}
              />
              <span
                className={styles.iconBadge}
                style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: 24 }}
              >
                <ArrowShort />
              </span>
            </a>
          </Reveal>
          <Reveal className={`${styles.surfaceCard} relative bg-white`}>
            <a
              href="https://wero-wallet.eu/"
              target="_blank"
              rel="noreferrer"
              className="p-6 h-full min-h-[160px] flex items-center justify-start relative"
            >
              <img
                src="/sowieso/images/footer-wero-logo.svg"
                alt="Wero"
                style={{ maxWidth: "60%", height: "auto" }}
              />
              <span
                className={styles.iconBadge}
                style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: 24 }}
              >
                <ArrowShort />
              </span>
            </a>
          </Reveal>
        </div>

        <Reveal
          className={`${styles.surfaceCard} ${styles.faqTilePink} relative overflow-hidden h-full flex flex-col`}
        >
          <a
            href="#veelgestelde-vragen"
            className="block relative p-6 lg:p-8 flex-1 min-h-[380px]"
            style={{ color: "#1d1c1c" }}
          >
            <div className="font-[500] text-sm xl:text-base text-center" style={{ marginBottom: 24 }}>
              Frequently Asked Questions
            </div>
            <div
              className="font-[800] uppercase text-center"
              style={{
                fontSize: "clamp(1.8rem, 2vw + 1rem, 3rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.02em",
              }}
            >
              Will Wero be <br />
              <span className={styles.hlCyan}>just as easy</span>
              <br />
              for my
              <br />
              customers to use?
            </div>
            <span
              className={styles.iconBadge}
              style={{ position: "absolute", bottom: 24, right: 24 }}
            >
              <ArrowShort />
            </span>
          </a>
        </Reveal>

        <div 
          className={`${styles.surfaceCard} ${styles.faqTileGreen} flex flex-row lg:flex-col items-center justify-center gap-6 p-4 h-full`}
        >
          {[
            { href: "https://www.facebook.com/wero.eu/", label: "FB", svg: (
              <svg width="14" height="20" viewBox="0 0 12 21" fill="none" aria-hidden>
                <path d="M10.93 11.73L11.5 7.95H7.92V5.5c0-1.03.5-2.04 2.1-2.04h1.63V.25S10.17 0 8.76 0C5.8 0 3.88 1.81 3.88 5.08v2.88H.6v3.77h3.28V20.85c.66.1 1.33.16 2.02.16s1.36-.06 2.02-.16V11.73h3.01Z" fill="#1D1C1C" />
              </svg>
            )},
            { href: "https://www.instagram.com/wero_eu/", label: "IG", svg: (
              <svg width="20" height="19" viewBox="0 0 24 23" fill="none" aria-hidden>
                <path d="M12 2c3 0 3.3 0 4.5.06 1.08.05 1.66.23 2.05.38.52.2.88.44 1.27.83.39.39.63.75.83 1.27.15.39.33.97.38 2.05.06 1.17.06 1.51.06 4.41s0 3.24-.06 4.41c-.05 1.08-.23 1.66-.38 2.05-.2.52-.44.88-.83 1.27-.39.39-.75.63-1.27.83-.39.15-.97.33-2.05.38-1.17.06-1.51.06-4.5.06s-3.24 0-4.41-.06c-1.08-.05-1.66-.23-2.05-.38-.52-.2-.88-.44-1.27-.83-.39-.39-.63-.75-.83-1.27-.15-.39-.33-.97-.38-2.05C3 14.3 3 13.96 3 11.06s0-3.24.06-4.41c.05-1.08.23-1.66.38-2.05.2-.52.44-.88.83-1.27.39-.39.75-.63 1.27-.83.39-.15.97-.33 2.05-.38C8.76 2.06 9.1 2 12 2Z" stroke="#1d1c1c" strokeWidth="1.8" fill="none" />
                <circle cx="12" cy="11" r="4" stroke="#1d1c1c" strokeWidth="1.8" fill="none" />
                <circle cx="18" cy="5.5" r="1.2" fill="#1d1c1c" />
              </svg>
            )},
            { href: "https://www.tiktok.com/@wero_eu", label: "TT", svg: (
              <svg width="18" height="20" viewBox="0 0 20 23" fill="none" aria-hidden>
                <path d="M14.25 0h-3.82v15.06c0 1.8-1.47 3.27-3.3 3.27a3.28 3.28 0 0 1-3.29-3.27c0-1.76 1.44-3.2 3.2-3.27V8c-3.88.07-7.02 3.18-7.02 7.06 0 3.91 3.2 7.05 7.15 7.05 3.95 0 7.15-3.17 7.15-7.05V7.34A8.7 8.7 0 0 0 19.37 9V5.22a6.1 6.1 0 0 1-5.12-5.22Z" fill="#1D1C1C" />
              </svg>
            )},
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className={styles.iconBadge}
              style={{ width: "64px", height: "64px", background: "#fff", transition: "transform 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              {s.svg}
            </a>
          ))}
        </div>
      </div>

      <Reveal className="mt-14">
        <svg
          viewBox="0 0 1750 268"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
          aria-label="sowieso"
        >
          <path
            d="M105.82 267.62c-65.69 0-105.54-33.74-105.54-90.1h74.67c0 21.53 11.85 34.82 31.95 34.82 16.16 0 25.13-7.54 25.13-20.82 0-11.49-6.82-17.59-23.7-24.05l-49.9-18.31C22.54 135.87 4.59 111.82 4.59 78.07 4.59 31.41 41.92.53 102.95.53c61.03 0 100.88 30.51 100.88 80.41h-74.67c0-18.67-9.7-29.44-26.93-29.44-14 0-22.62 7.18-22.62 19.03 0 10.05 6.83 16.51 27.65 24.4l45.95 17.6c37.69 14.72 53.49 38.77 53.49 72.51 0 50.98-39.13 82.58-100.88 82.58Zm235.98 0c-87.24 0-138.57-62.1-138.57-133.54 0-71.44 51.33-133.54 138.57-133.54 87.23 0 138.57 62.1 138.57 133.54 0 71.44-51.34 133.54-138.57 133.54Zm-60.67-133.54c0 35.9 20.47 66.77 60.67 66.77 40.56 0 61.03-30.87 60.67-66.77.36-35.9-20.11-66.77-60.67-66.77-40.2 0-60.67 30.87-60.67 66.77Zm262.62 125.64L453.28 8.43h79.34l45.23 151.49L621.29 8.43h59.23l43.44 151.49L769.19 8.43h79.34l-90.47 251.29h-65.34l-41.64-136.77-42 136.77h-65.34ZM841.55 259.72V8.43h74.67v251.29h-74.67Zm222.59-258.83c82.2 0 133.18 59.23 133.18 131.03v24.41h-191.7c5.03 29.8 26.21 47.75 58.52 47.75 29.07 0 43.43-13.29 50.25-27.28h80.42c-9.34 43.79-53.13 91.18-131.39 91.18-86.52 0-135.34-61.75-135.34-133.54 0-72.52 49.18-133.55 136.06-133.55Zm-57.8 106.62H1119c-6.1-26.57-25.5-43.44-56-43.44-29.8 0-50.26 16.15-56.73 43.44Zm289.82 160.11c-65.7 0-105.54-33.74-105.54-90.1h74.67c0 21.53 11.84 34.82 31.95 34.82 16.15 0 25.13-7.54 25.13-20.82 0-11.49-6.83-17.59-23.7-24.05l-49.9-18.31c-35.9-13.28-53.85-37.33-53.85-71.08 0-46.66 37.34-77.54 98.37-77.54 61.02 0 100.88 30.51 100.88 80.41h-74.67c0-18.67-9.7-29.44-26.93-29.44-14 0-22.62 7.18-22.62 19.03 0 10.05 6.83 16.51 27.65 24.4l45.95 17.6c37.69 14.72 53.49 38.77 53.49 72.51 0 50.98-39.13 82.58-100.88 82.58Zm235.97 0c-87.24 0-138.57-62.1-138.57-133.54 0-71.44 51.33-133.54 138.57-133.54 87.23 0 138.57 62.1 138.57 133.54 0 71.44-51.34 133.54-138.57 133.54Zm-60.67-133.54c0 35.9 20.47 66.77 60.67 66.77 40.56 0 61.03-30.87 60.67-66.77.36-35.9-20.11-66.77-60.67-66.77-40.2 0-60.67 30.87-60.67 66.77Zm237.43 130.31c-23.7 0-41.28-18.67-41.28-40.57 0-21.54 17.59-40.21 41.28-40.21 22.97 0 40.92 18.67 40.92 40.21 0 21.9-17.95 40.57-40.92 40.57Z"
            fill="#1d1c1c"
          />
        </svg>
      </Reveal>

      <div className="mt-8 text-center" style={{ fontSize: 14, color: "#1d1c1c" }}>
        © 2026 EPI Company SE |{" "}
        <a
          href="https://wero-wallet.eu/storage/files/ENGLISH-TC-Wero-Wallet-Website-2024.pdf"
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "underline" }}
        >
          Website Terms of Use
        </a>
      </div>
    </footer>
  );
}
