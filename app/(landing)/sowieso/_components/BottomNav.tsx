"use client";

import styles from "../sowieso.module.css";

export function BottomNav() {
  return (
    <>
      <nav
        className="fixed bottom-[22px] left-1/2 z-[1100] -translate-x-1/2"
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
      </nav>

      {/* FAQ floating round button */}
      <div className="hidden lg:flex fixed right-6 top-1/2 z-[1100] -translate-y-1/2">
        <button
          className={styles.pill}
          aria-label="FAQ"
          style={{
            width: 66,
            height: 66,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff48d",
            fontWeight: 800,
          }}
        >
          <span>FAQ</span>
        </button>
      </div>

      {/* CO cookies bottom-left */}
      <div className="fixed left-4 bottom-4 z-[1100]">
        <button
          aria-label="Cookies"
          className={styles.iconBadge}
          style={{ background: "#1d1c1c", color: "#fff48d", fontWeight: 800, fontSize: 12 }}
        >
          CO
        </button>
      </div>

      {/* Right-bottom smiley chat widget */}
      <div className="fixed right-4 bottom-4 z-[1100]">
        <button
          aria-label="Help"
          className={styles.pill}
          style={{
            width: 44,
            height: 44,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#1d1c1c" strokeWidth="1.5" />
            <circle cx="9" cy="10" r="1" fill="#1d1c1c" />
            <circle cx="15" cy="10" r="1" fill="#1d1c1c" />
            <path d="M8 14.5c1.2 1.6 2.6 2.2 4 2.2s2.8-.6 4-2.2" stroke="#1d1c1c" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </>
  );
}
