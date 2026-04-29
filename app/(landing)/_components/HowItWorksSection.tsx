"use client";

import { MotionValue, m, useScroll, useTransform } from "framer-motion";
import type { CSSProperties } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "../landing.module.css";
import { Reveal } from "./Reveal";

const MOBILE_HEADER_CLEARANCE = [
  "env(safe-area-inset-top,0px)",
  "+ clamp(1.5rem, 1.5vw + 0.35rem, 2rem)",
  "+ var(--landing-header-logo-size)",
  "+ clamp(10px, 2vw, 14px)",
  "+ 0.875rem",
].join(" ");

function useBelowLg() {
  const [v, setV] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setV(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return v;
}

const phases = [
  {
    number: 1,
    title: "BUILD YOUR PROFILE & CONNECT INSTAGRAM",
    description:
      "Sign up and link your Instagram in seconds. Brands set their campaign goals and budget. Influencers list their rates, niche, city, and portfolio. Your profile is your pitch — and it's live immediately.",
    tintClass: styles.phaseCard01,
    visual: <ProfileVisual />,
    enterStart: 0.05,
    lockAt: 0.2,
    settleY: -135,
    settleX: 0,
    baseTilt: 0,
  },
  {
    number: 2,
    title: "DISCOVER & MATCH INSTANTLY",
    description:
      "Brands browse hundreds of South India's most engaged influencers — filtered by category, city, follower count, and engagement rate. Find your perfect match and send a campaign offer in seconds. No cold DMs, no middle man.",
    tintClass: styles.phaseCard02,
    visual: <DiscoverVisual />,
    enterStart: 0.3,
    lockAt: 0.45,
    settleY: -45,
    settleX: 0,
    baseTilt: 0,
  },
  {
    number: 3,
    title: "CREATE, UPLOAD & DELIVER",
    description:
      "Influencers create content and upload directly on Plugoh. Our in-house servers store your work permanently — every file accessible forever, owned by you. Brands track every deliverable in real time from their dashboard.",
    tintClass: styles.phaseCardOrange,
    visual: <UploadVisual />,
    enterStart: 0.55,
    lockAt: 0.7,
    settleY: 45,
    settleX: 0,
    baseTilt: 0,
  },
  {
    number: 4,
    title: "GET PAID INSTANTLY",
    description:
      "Content approved? Payment releases to the influencer's account in seconds. No waiting weeks, no chasing invoices. Every rupee is tracked, every deal is protected — instant payouts, every time.",
    tintClass: styles.phaseCard01,
    visual: <PayoutVisual />,
    enterStart: 0.78,
    lockAt: 0.93,
    settleY: 135,
    settleX: 0,
    baseTilt: 0,
  },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={ref}
      className="w-full"
      style={{
        position: "relative",
        height: "660vh",
      }}
    >
      <div
        className={cn(
          "relative sticky top-0 flex h-[100svh] min-h-[100dvh] w-full flex-col",
          "max-lg:overflow-x-clip max-lg:overflow-y-visible lg:overflow-hidden",
          "gap-2 pt-[calc(var(--hw-header-clearance))]",
          "lg:grid lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-center lg:gap-[clamp(20px,4vw,72px)] lg:pt-[clamp(16px,4vw,40px)]",
        )}
        style={
          {
            "--hw-header-clearance": `calc(${MOBILE_HEADER_CLEARANCE})`,
            paddingLeft:
              "max(clamp(16px, 6vw, 120px), env(safe-area-inset-left, 0px))",
            paddingRight:
              "max(clamp(16px, 6vw, 120px), env(safe-area-inset-right, 0px))",
            paddingBottom:
              "max(clamp(16px, 4vw, 40px), env(safe-area-inset-bottom, 0px))",
          } as CSSProperties
        }
      >
        <h2
          aria-label="How Plugoh works"
          className={cn(
            "pointer-events-none font-extrabold uppercase text-[#1d1c1c]",
            "absolute left-0 right-0 z-[999] mx-auto flex max-w-none flex-row flex-nowrap",
            "items-center justify-center gap-0 whitespace-nowrap text-center leading-none",
            "text-[clamp(0.8125rem,3.15vw+0.48rem,1.0625rem)] tracking-[0.03em]",
            "lg:hidden",
          )}
          style={{
            top: "var(--landing-header-logo-offset-y)",
            transform: "translateY(-50%)",
            paddingLeft:
              "max(clamp(16px, 6vw, 120px), env(safe-area-inset-left, 0px))",
            paddingRight:
              "max(clamp(16px, 6vw, 120px), env(safe-area-inset-right, 0px))",
          }}
        >
          <span className="pointer-events-auto mr-0 shrink-0">HOW</span>
          <span
            className={cn("shrink-0", styles.howItWorksTitleLogoSlot)}
            aria-hidden
          />
          <span className="pointer-events-auto ml-[0.76em] shrink-0">
            WORKS
          </span>
        </h2>

        <Reveal
          className="relative z-[35] hidden w-full shrink-0 lg:z-auto lg:block lg:w-auto"
          amount={0.25}
        >
          <h2
            aria-label="How Plugoh works"
            className={cn(
              "font-extrabold uppercase text-[#1d1c1c]",
              "mx-0 max-w-[14ch] text-left leading-[0.88]",
              "whitespace-normal text-[clamp(2.25rem,3.3vw,3.95rem)] tracking-[-0.047em]",
            )}
          >
            HOW PLUGOH WORKS
          </h2>
        </Reveal>

        <div
          className={cn(
            "relative z-[10] w-full min-h-0 flex-1",
            "lg:z-auto lg:h-[min(86vh,820px)] lg:min-h-[560px] lg:flex-none",
          )}
        >
          {phases.map((phase, index) => (
            <PhaseSlide
              key={phase.number}
              phase={phase}
              index={index}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PhaseSlide({
  phase,
  index,
  progress,
}: {
  phase: (typeof phases)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const belowLg = useBelowLg();
  const start = phase.enterStart;
  const lock = phase.lockAt;
  const settleY = belowLg ? 0 : phase.settleY;
  const enterY = belowLg ? 520 : 860;
  const x = useTransform(
    progress,
    [0, start, lock, 1],
    [0, 0, phase.settleX, phase.settleX],
  );
  const y = useTransform(
    progress,
    [0, start, lock, 1],
    [enterY, enterY, settleY, settleY],
  );

  return (
    <m.article
      style={{
        x,
        y,
        position: "absolute",
        left: 0,
        right: 0,
        top: belowLg ? 0 : "50%",
        marginLeft: "auto",
        marginRight: "auto",
        transformOrigin: "center center",
        translateY: belowLg ? "0%" : "-50%",
        width: "100%",
        maxWidth: "min(790px, 100%)",
        zIndex: 40 + index,
        willChange: "transform, opacity",
      }}
    >
      <div
        className={cn(
          styles.surfaceCard,
          phase.tintClass,
          "relative grid min-h-0 w-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden",
          "h-[min(500px,62dvh)] lg:h-[620px]",
        )}
        style={{
          gap: "clamp(12px, 2vw, 28px)",
          padding: "clamp(14px, 2.4vw, 40px)",
        }}
      >
        <div
          className={cn(
            styles.iconBadge,
            "absolute left-3 top-3 z-[2] lg:left-[clamp(-22px,-2vw,-30px)] lg:top-[clamp(16px,2.2vw,30px)]",
          )}
          style={{
            width: "clamp(40px, 3.2vw, 60px)",
            height: "clamp(40px, 3.2vw, 60px)",
            fontSize: "clamp(0.9375rem, 1.2vw, 1.25rem)",
            fontWeight: 800,
          }}
        >
          {phase.number}
        </div>

        <div
          className={cn(
            "relative w-full shrink-0 overflow-hidden rounded-[8px]",
            "h-[min(32dvh,198px)]",
            "lg:aspect-[1.45/1] lg:h-auto lg:max-h-[240px] lg:min-h-0",
          )}
        >
          {phase.visual}
        </div>

        <div
          className={cn(
            "mx-auto flex min-h-0 w-full max-w-[560px] flex-col gap-[clamp(10px,1.5vw,18px)] lg:mx-0",
          )}
        >
          <h3
            className={cn(
              "shrink-0 font-extrabold uppercase tracking-[-0.026em]",
              "text-[clamp(0.9rem,3.85vw+0.42rem,2.7rem)] lg:text-[clamp(1.6rem,2.3vw,2.7rem)]",
            )}
            style={{
              lineHeight: 0.92,
              textTransform: "uppercase",
            }}
          >
            {phase.title}
          </h3>
          <p
            className={cn(
              styles.body,
              "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 [-webkit-overflow-scrolling:touch]",
              "text-[clamp(0.8125rem,2.1vw+0.5rem,1.1rem)] lg:text-[clamp(0.9rem,0.75vw,1.1rem)]",
            )}
            style={{
              lineHeight: 1.35,
            }}
          >
            {phase.description}
          </p>
        </div>
      </div>
    </m.article>
  );
}

function ProfileVisual() {
  return (
    <svg
      viewBox="0 0 1000 700"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="hwProfileBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7af7f7" />
          <stop offset="100%" stopColor="#4fe0a3" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="700" fill="url(#hwProfileBg)" />
      {/* Phone body */}
      <rect
        x="330"
        y="60"
        width="340"
        height="580"
        rx="38"
        ry="38"
        fill="#1d1c1c"
      />
      <rect
        x="340"
        y="70"
        width="320"
        height="560"
        rx="30"
        ry="30"
        fill="#fff"
        stroke="#1d1c1c"
        strokeWidth="5"
      />
      {/* Notch */}
      <rect x="440" y="70" width="120" height="28" rx="14" fill="#1d1c1c" />
      {/* Avatar */}
      <circle
        cx="500"
        cy="230"
        r="72"
        fill="#7af7f7"
        stroke="#1d1c1c"
        strokeWidth="5"
      />
      <circle cx="500" cy="210" r="30" fill="#1d1c1c" />
      <path d="M440 280 Q440 255 500 255 Q560 255 560 280" fill="#1d1c1c" />
      {/* Instagram badge */}
      <rect
        x="542"
        y="282"
        width="44"
        height="44"
        rx="12"
        fill="#ff5ecb"
        stroke="#1d1c1c"
        strokeWidth="4"
      />
      <rect
        x="549"
        y="289"
        width="30"
        height="30"
        rx="8"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
      />
      <circle
        cx="564"
        cy="304"
        r="8"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
      />
      <circle cx="576" cy="293" r="3" fill="#fff" />
      {/* Name bar */}
      <rect
        x="400"
        y="330"
        width="200"
        height="22"
        rx="6"
        fill="#1d1c1c"
        opacity="0.85"
      />
      {/* Tag pills */}
      <rect
        x="390"
        y="368"
        width="90"
        height="20"
        rx="10"
        fill="#fff48d"
        stroke="#1d1c1c"
        strokeWidth="3"
      />
      <rect
        x="492"
        y="368"
        width="118"
        height="20"
        rx="10"
        fill="#7af7f7"
        stroke="#1d1c1c"
        strokeWidth="3"
      />
      {/* Stats row */}
      <rect
        x="360"
        y="408"
        width="280"
        height="54"
        rx="14"
        fill="#f0fdf4"
        stroke="#1d1c1c"
        strokeWidth="4"
      />
      <line
        x1="500"
        y1="412"
        x2="500"
        y2="458"
        stroke="#1d1c1c"
        strokeWidth="3"
      />
      <rect
        x="376"
        y="422"
        width="60"
        height="10"
        rx="4"
        fill="#1d1c1c"
        opacity="0.3"
      />
      <rect
        x="376"
        y="436"
        width="40"
        height="10"
        rx="4"
        fill="#1d1c1c"
        opacity="0.7"
      />
      <rect
        x="516"
        y="422"
        width="60"
        height="10"
        rx="4"
        fill="#1d1c1c"
        opacity="0.3"
      />
      <rect
        x="516"
        y="436"
        width="40"
        height="10"
        rx="4"
        fill="#1d1c1c"
        opacity="0.7"
      />
      {/* CTA button */}
      <rect
        x="374"
        y="488"
        width="260"
        height="44"
        rx="22"
        fill="#fff48d"
        stroke="#1d1c1c"
        strokeWidth="4"
      />
      <rect x="410" y="503" width="120" height="14" rx="6" fill="#1d1c1c" />
    </svg>
  );
}

function DiscoverVisual() {
  const avatarColors = [
    "#7af7f7",
    "#ff8dd3",
    "#fff48d",
    "#4fe0a3",
    "#d5a8ff",
    "#ffc47a",
  ];
  return (
    <svg
      viewBox="0 0 1000 700"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="hwDiscoverBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9be5" />
          <stop offset="100%" stopColor="#d5a8ff" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="700" fill="url(#hwDiscoverBg)" />
      {/* Search bar */}
      <rect
        x="180"
        y="60"
        width="500"
        height="64"
        rx="32"
        fill="#fff"
        stroke="#1d1c1c"
        strokeWidth="5"
      />
      <circle
        cx="232"
        cy="92"
        r="20"
        fill="none"
        stroke="#1d1c1c"
        strokeWidth="5"
      />
      <line
        x1="246"
        y1="106"
        x2="264"
        y2="124"
        stroke="#1d1c1c"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect
        x="280"
        y="83"
        width="160"
        height="12"
        rx="5"
        fill="#1d1c1c"
        opacity="0.18"
      />
      {/* Filter chip */}
      <rect
        x="700"
        y="68"
        width="100"
        height="48"
        rx="24"
        fill="#fff48d"
        stroke="#1d1c1c"
        strokeWidth="4"
      />
      <rect
        x="718"
        y="85"
        width="64"
        height="12"
        rx="5"
        fill="#1d1c1c"
        opacity="0.6"
      />
      {/* 3x2 influencer card grid */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 160 + col * 226;
        const y = 165 + row * 230;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={200}
              height={200}
              rx={18}
              fill="#fff"
              stroke="#1d1c1c"
              strokeWidth="4"
            />
            <circle
              cx={x + 100}
              cy={y + 68}
              r={42}
              fill={avatarColors[i]}
              stroke="#1d1c1c"
              strokeWidth="4"
            />
            <circle cx={x + 100} cy={y + 56} r={17} fill="#1d1c1c" />
            <path
              d={`M${x + 64} ${y + 100} Q${x + 64} ${y + 85} ${x + 100} ${y + 85} Q${x + 136} ${y + 85} ${x + 136} ${y + 100}`}
              fill="#1d1c1c"
            />
            <rect
              x={x + 44}
              y={y + 126}
              width={112}
              height={12}
              rx={5}
              fill="#1d1c1c"
              opacity="0.75"
            />
            <rect
              x={x + 52}
              y={y + 148}
              width={96}
              height={20}
              rx={10}
              fill={avatarColors[(i + 2) % 6]}
              stroke="#1d1c1c"
              strokeWidth="3"
            />
            <circle
              cx={x + 68}
              cy={y + 182}
              r={5}
              fill="#1d1c1c"
              opacity="0.4"
            />
            <circle
              cx={x + 88}
              cy={y + 182}
              r={5}
              fill="#1d1c1c"
              opacity="0.7"
            />
            <circle
              cx={x + 108}
              cy={y + 182}
              r={5}
              fill="#1d1c1c"
              opacity="1"
            />
            <circle
              cx={x + 128}
              cy={y + 182}
              r={5}
              fill="#1d1c1c"
              opacity="0.4"
            />
          </g>
        );
      })}
    </svg>
  );
}

function UploadVisual() {
  return (
    <svg
      viewBox="0 0 1000 700"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="hwUploadBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffc47a" />
          <stop offset="100%" stopColor="#ff7d6a" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="700" fill="url(#hwUploadBg)" />
      {/* Cloud */}
      <ellipse
        cx="460"
        cy="280"
        rx="160"
        ry="110"
        fill="#fff"
        stroke="#1d1c1c"
        strokeWidth="6"
      />
      <ellipse
        cx="340"
        cy="320"
        rx="100"
        ry="80"
        fill="#fff"
        stroke="#1d1c1c"
        strokeWidth="6"
      />
      <ellipse
        cx="580"
        cy="320"
        rx="110"
        ry="85"
        fill="#fff"
        stroke="#1d1c1c"
        strokeWidth="6"
      />
      <rect x="258" y="330" width="414" height="80" fill="#fff" />
      <line
        x1="258"
        y1="400"
        x2="672"
        y2="400"
        stroke="#1d1c1c"
        strokeWidth="6"
      />
      {/* Upload arrow */}
      <line
        x1="460"
        y1="390"
        x2="460"
        y2="220"
        stroke="#1d1c1c"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <polyline
        points="420,260 460,210 500,260"
        fill="none"
        stroke="#1d1c1c"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* File cards */}
      {[0, 1, 2].map((i) => {
        const x = 220 + i * 190;
        const y = 440;
        const colors = ["#7af7f7", "#fff48d", "#ff8dd3"];
        return (
          <g key={i}>
            <rect
              x={x + 5}
              y={y + 5}
              width={160}
              height={200}
              rx={14}
              fill="#1d1c1c"
              opacity="0.18"
            />
            <rect
              x={x}
              y={y}
              width={160}
              height={200}
              rx={14}
              fill={colors[i]}
              stroke="#1d1c1c"
              strokeWidth="5"
            />
            <polygon
              points={`${x + 120},${y} ${x + 160},${y + 40} ${x + 120},${y + 40}`}
              fill="#1d1c1c"
              opacity="0.25"
            />
            <rect
              x={x + 18}
              y={y + 60}
              width={100}
              height={12}
              rx={5}
              fill="#1d1c1c"
              opacity="0.5"
            />
            <rect
              x={x + 18}
              y={y + 82}
              width={80}
              height={10}
              rx={4}
              fill="#1d1c1c"
              opacity="0.35"
            />
            <rect
              x={x + 18}
              y={y + 102}
              width={90}
              height={10}
              rx={4}
              fill="#1d1c1c"
              opacity="0.35"
            />
            <circle
              cx={x + 80}
              cy={y + 154}
              r={22}
              fill="#fff"
              stroke="#1d1c1c"
              strokeWidth="4"
            />
            <polygon
              points={`${x + 72},${y + 144} ${x + 94},${y + 154} ${x + 72},${y + 164}`}
              fill="#1d1c1c"
            />
          </g>
        );
      })}
      {/* Checkmark badge */}
      <circle
        cx="660"
        cy="200"
        r="36"
        fill="#4fe0a3"
        stroke="#1d1c1c"
        strokeWidth="5"
      />
      <polyline
        points="644,200 656,214 678,188"
        fill="none"
        stroke="#1d1c1c"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PayoutVisual() {
  return (
    <svg
      viewBox="0 0 1000 700"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="hwPayoutBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7effc5" />
          <stop offset="100%" stopColor="#4fe0a3" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="700" fill="url(#hwPayoutBg)" />
      {/* Coin shadow */}
      <circle cx="465" cy="375" r="208" fill="#1d1c1c" opacity="0.2" />
      {/* Coin body */}
      <circle
        cx="460"
        cy="368"
        r="208"
        fill="#fff48d"
        stroke="#1d1c1c"
        strokeWidth="6"
      />
      <circle
        cx="460"
        cy="368"
        r="164"
        fill="none"
        stroke="#1d1c1c"
        strokeWidth="5"
      />
      {/* Rupee ₹ symbol */}
      <line
        x1="390"
        y1="290"
        x2="530"
        y2="290"
        stroke="#1d1c1c"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <line
        x1="390"
        y1="326"
        x2="530"
        y2="326"
        stroke="#1d1c1c"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M390 326 Q390 390 460 390 Q530 390 530 326"
        fill="none"
        stroke="#1d1c1c"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <line
        x1="390"
        y1="326"
        x2="530"
        y2="470"
        stroke="#1d1c1c"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Checkmark badge */}
      <circle
        cx="638"
        cy="200"
        r="52"
        fill="#4fe0a3"
        stroke="#1d1c1c"
        strokeWidth="6"
      />
      <polyline
        points="614,200 632,220 664,176"
        fill="none"
        stroke="#1d1c1c"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkles */}
      <g stroke="#1d1c1c" strokeWidth="4" strokeLinecap="round">
        <line x1="240" y1="160" x2="240" y2="190" />
        <line x1="225" y1="175" x2="255" y2="175" />
        <line x1="228" y1="163" x2="252" y2="187" />
        <line x1="252" y1="163" x2="228" y2="187" />
      </g>
      <g stroke="#1d1c1c" strokeWidth="4" strokeLinecap="round">
        <line x1="720" y1="500" x2="720" y2="524" />
        <line x1="708" y1="512" x2="732" y2="512" />
        <line x1="711" y1="503" x2="729" y2="521" />
        <line x1="729" y1="503" x2="711" y2="521" />
      </g>
      <g stroke="#1d1c1c" strokeWidth="3" strokeLinecap="round">
        <line x1="760" y1="280" x2="760" y2="298" />
        <line x1="751" y1="289" x2="769" y2="289" />
      </g>
      {/* Instant pill */}
      <rect
        x="364"
        y="544"
        width="200"
        height="44"
        rx="22"
        fill="#fff"
        stroke="#1d1c1c"
        strokeWidth="4"
      />
      <rect
        x="398"
        y="559"
        width="128"
        height="14"
        rx="6"
        fill="#1d1c1c"
        opacity="0.6"
      />
    </svg>
  );
}
