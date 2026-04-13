"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import styles from "../sowieso.module.css";
import { Reveal } from "./Reveal";

type Block = {
  hl: "green" | "cyan";
  words: [string, string, string];
  videoPoster?: string;
  videoSrc: string;
  art: React.ReactNode;
};

const blocks: Block[] = [
  {
    hl: "green",
    words: ["WILL WERO BE ", "AS RELIABLE", " AS iDEAL?"],
    videoPoster: "/sowieso/images/video-01-poster.jpg",
    videoSrc:
      "https://sowieso-wero-assets.s3.eu-central-1.amazonaws.com/videos/q-and-a-en.mp4",
    art: <LockArt />,
  },
  {
    hl: "cyan",
    words: ["ARE ", "ALL", " THE DUTCH BANKS PARTICIPATING?"],
    videoPoster: "/sowieso/images/video-02-poster.jpg",
    videoSrc:
      "https://sowieso-wero-assets.s3.eu-central-1.amazonaws.com/videos/aankoopbescherming-en.mp4",
    art: <PiggyArt />,
  },
  {
    hl: "green",
    words: ["WILL WERO BE ", "JUST AS EASY", " FOR MY CUSTOMERS TO USE?"],
    videoPoster: "/sowieso/images/video-03-poster.jpg",
    videoSrc:
      "https://sowieso-wero-assets.s3.eu-central-1.amazonaws.com/videos/transactiekosten-en.mp4",
    art: <ClockArt />,
  },
];

export function FaqSection() {
  return (
    <section className="relative z-[2] flex flex-col items-center" style={{ padding: "10vh 24px" }}>
      {blocks.map((b, i) => (
        <FaqBlock key={i} block={b} />
      ))}
    </section>
  );
}

function FaqBlock({ block }: { block: Block }) {
  const [open, setOpen] = useState(false);
  const hlClass = block.hl === "green" ? styles.hlGreen : styles.hlCyan;

  return (
    <div
      className="relative w-full max-w-[900px] mx-auto flex flex-col items-center"
      style={{ marginBottom: "clamp(64px, 8vw, 160px)" }}
    >
      <Reveal className={styles.eyebrow + " mb-6 opacity-80"}>
        We understand there are questions:
      </Reveal>
      <Reveal as="h2" className={styles.faqTitle} amount={0.3}>
        {block.words[0]}
        <span className={hlClass}>{block.words[1]}</span>
        {block.words[2]}
      </Reveal>

      <div className="relative mt-10" style={{ width: 280, aspectRatio: "1/1" }}>
        {block.art}
      </div>

      <m.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={styles.pill}
        style={{
          marginTop: 24,
          padding: "14px 20px",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          fontSize: 15,
        }}
      >
        <span>We have the answer</span>
        <span
          className={styles.iconBadgeSm}
          style={{
            width: 28,
            height: 28,
            background: "#fff48d",
            boxShadow: "0 2px 0 0 #1d1c1c",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="#1d1c1c" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </span>
      </m.button>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full overflow-hidden flex justify-center mt-8"
          >
            <div
              className={styles.surfaceCard}
              style={{ width: "min(680px, 94%)", overflow: "hidden" }}
            >
              <video
                src={block.videoSrc}
                poster={block.videoPoster}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LockArt() {
  return (
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="lockBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="100%" stopColor="#ff3d8a" />
        </linearGradient>
        <linearGradient id="lockFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a66cff" />
          <stop offset="100%" stopColor="#ff7ec8" />
        </linearGradient>
      </defs>
      <g stroke="#1d1c1c" strokeWidth="5" strokeLinejoin="round">
        <path d="M110 110 q40 -60 80 0" fill="none" />
        <rect x="80" y="110" width="140" height="130" rx="14" fill="url(#lockBody)" />
        <rect x="100" y="130" width="100" height="90" rx="8" fill="url(#lockFace)" />
        <circle cx="150" cy="175" r="6" fill="#1d1c1c" />
      </g>
    </svg>
  );
}

function PiggyArt() {
  return (
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="pig" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9be0" />
          <stop offset="100%" stopColor="#d060c2" />
        </linearGradient>
      </defs>
      <g stroke="#1d1c1c" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="150" cy="170" rx="100" ry="70" fill="url(#pig)" />
        <circle cx="120" cy="160" r="6" fill="#1d1c1c" />
        <path d="M210 170 q20 -10 20 20 q-20 10 -20 -20" fill="url(#pig)" />
        <path d="M80 190 q-10 30 10 40" fill="none" />
        <rect x="120" y="110" width="60" height="10" rx="3" fill="#1d1c1c" />
      </g>
    </svg>
  );
}

function ClockArt() {
  return (
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ width: "100%", height: "100%" }}>
      <circle cx="150" cy="155" r="100" fill="#7effc5" stroke="#1d1c1c" strokeWidth="5" />
      <g stroke="#1d1c1c" strokeWidth="6" strokeLinecap="round">
        <line x1="150" y1="155" x2="150" y2="95" />
        <line x1="150" y1="155" x2="200" y2="175" />
      </g>
      <circle cx="150" cy="155" r="8" fill="#1d1c1c" />
    </svg>
  );
}
