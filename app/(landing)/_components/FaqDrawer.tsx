"use client";

import { m, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../landing.module.css";

const faqs = [
  {
    q: "How do I get started?",
    a: "For brands: sign up, set up your brand profile with your niche and campaign budget. Then browse creators and send your first campaign offer.\n\nFor creators: sign up, complete your profile with your niche, portfolio, and rates. Brands will discover you and send you collaboration offers.",
  },
  {
    q: "How does pricing work for creators?",
    a: "Creators set their own rates when building their profile. You choose your price per post, story, reel, or campaign. Brands see your rates and decide if it fits their budget. You're always in control.",
  },
  {
    q: "How do brands pay creators?",
    a: "Payments are handled in-app through Plugoh. Once a creator delivers the content, the brand releases payment. Everything is tracked — no chasing invoices, no DM negotiations.",
  },
  {
    q: "Is Plugoh only for South India right now?",
    a: "Yes, for now. We're starting with South India because that's where we're building the strongest creator community first. We'll expand once we've built something genuinely great here.",
  },
  {
    q: "What types of collaborations are supported?",
    a: "Instagram posts, reels, stories, and full campaigns with multiple deliverables. More content types coming soon.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1.5px solid #1d1c1c" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "clamp(16px, 2vw, 24px) 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          color: "#1d1c1c",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: "clamp(1rem, 1vw + 0.6rem, 1.25rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {q}
        </span>
        <span
          className={styles.iconBadge}
          style={{
            flexShrink: 0,
            width: "clamp(32px, 4vw, 40px)",
            height: "clamp(32px, 4vw, 40px)",
            background: "#fff48d",
            transition: "transform 0.25s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 17 18"
            fill="none"
            aria-hidden
          >
            <path
              d="M0.916 8.562l7.467 7.467 7.466-7.467"
              stroke="#1D1C1C"
              strokeWidth="1.5"
            />
            <path d="M8.383 16.03V0.944" stroke="#1D1C1C" strokeWidth="1.5" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                paddingBottom: "clamp(16px, 2vw, 24px)",
                fontSize: "clamp(0.875rem, 0.5vw + 0.7rem, 1rem)",
                fontWeight: 500,
                color: "#1d1c1c",
                lineHeight: 1.65,
                opacity: 0.75,
                whiteSpace: "pre-line",
                margin: 0,
              }}
            >
              {a}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener("open-faq", open);
    return () => window.removeEventListener("open-faq", open);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 280, mass: 1 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "#fff",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          {/* Header row */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "clamp(14px, 2vw, 22px) clamp(16px, 3vw, 32px)",
              background: "#fff",
            }}
          >
            <div
              className={styles.pill}
              style={{
                padding: "10px 24px",
                fontWeight: 800,
                fontSize: "clamp(1rem, 1.2vw + 0.4rem, 1.4rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              <Image
                src="/logo-gold.png"
                alt="Plugoh"
                height={24}
                width={100}
                style={{ objectFit: "contain" }}
              />
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className={styles.pill}
              style={{
                background: "#fff48d",
                padding: "10px 20px",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 700,
                fontSize: "clamp(0.85rem, 1vw + 0.4rem, 1rem)",
                cursor: "pointer",
                border: "none",
              }}
            >
              Close
              <span
                className={styles.iconBadgeSm}
                style={{
                  width: 28,
                  height: 28,
                  background: "#fff",
                  boxShadow: "0 2px 0 0 #1d1c1c",
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 17 18"
                  fill="none"
                  aria-hidden
                >
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
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              maxWidth: 880,
              margin: "0 auto",
              padding:
                "clamp(24px, 4vw, 64px) clamp(16px, 5vw, 80px) clamp(48px, 8vw, 100px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "clamp(16px, 3vw, 32px)",
              }}
            >
              <span
                className={styles.iconBadge}
                style={{ width: 36, height: 36, flexShrink: 0 }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 17 18"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M17 8.562L9.533 1.095 2.067 8.562"
                    stroke="#1D1C1C"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M9.533 1.095v16.085"
                    stroke="#1D1C1C"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "clamp(0.85rem, 1vw + 0.4rem, 1rem)",
                  color: "#1d1c1c",
                  opacity: 0.7,
                }}
              >
                Frequently Asked Questions
              </span>
            </div>

            <h1
              style={{
                fontWeight: 800,
                fontSize: "clamp(2.2rem, 5vw + 0.5rem, 5rem)",
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                color: "#1d1c1c",
                textTransform: "uppercase",
                marginBottom: "clamp(32px, 5vw, 64px)",
              }}
            >
              GOT QUESTIONS?{" "}
              <span
                style={{
                  background: "#fff48d",
                  padding: "0 0.15em",
                  borderRadius: 4,
                  display: "inline-block",
                  lineHeight: 0.95,
                }}
              >
                WE HAVE
              </span>{" "}
              ANSWERS.
            </h1>

            <div>
              {faqs.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>

            <p
              style={{
                marginTop: "clamp(24px, 4vw, 48px)",
                fontSize: "0.9rem",
                color: "#1d1c1c",
                opacity: 0.6,
                textAlign: "center",
              }}
            >
              Still have questions?{" "}
              <a
                href="/login"
                style={{ fontWeight: 700, color: "#1d1c1c", opacity: 1 }}
              >
                Sign up and reach out →
              </a>
            </p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
