"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    q: "How do I get started?",
    a: "For brands: sign up, connect your Instagram, set up your brand profile with your niche and campaign budget. Then browse influencers and send your first campaign offer.\n\nFor influencers: sign up, connect your Instagram, complete your profile with your niche, portfolio, and rates. Brands will discover you and send you collaboration offers.",
  },
  {
    q: "How does pricing work for influencers?",
    a: "Influencers set their own rates when building their profile. You choose your price per post, story, reel, or campaign. Brands see your rates and decide if it fits their budget. You're always in control.",
  },
  {
    q: "How do brands pay influencers?",
    a: "Payments are handled in-app through Plugoh. Once an influencer delivers the content, the brand releases payment. Everything is tracked — no chasing invoices, no DM negotiations.",
  },
  {
    q: "Is Plugoh only for South India right now?",
    a: "Yes, for now. We're starting with South India because that's where we're building the strongest influencer community first. We'll expand once we've built something genuinely great here.",
  },
  {
    q: "What types of collaborations are supported?",
    a: "Instagram posts, reels, stories, and full campaigns with multiple deliverables. More content types coming soon.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderBottom: "1px solid #1d1c1c",
        padding: "0",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "24px 0",
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
            fontSize: "clamp(1rem, 1vw + 0.7rem, 1.25rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {q}
        </span>
        <span
          style={{
            flexShrink: 0,
            fontWeight: 400,
            fontSize: "1.5rem",
            lineHeight: 1,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          +
        </span>
      </button>

      {open && (
        <div
          style={{
            paddingBottom: 24,
            fontSize: "clamp(0.875rem, 0.5vw + 0.7rem, 1rem)",
            fontWeight: 500,
            color: "#1d1c1c",
            lineHeight: 1.6,
            opacity: 0.8,
            whiteSpace: "pre-line",
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(121deg, #e5b94a -20.66%, #fff48d 65.83%)",
        padding: "clamp(40px, 8vw, 100px) clamp(20px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "#1d1c1c",
            textDecoration: "none",
            marginBottom: 48,
            opacity: 0.7,
          }}
        >
          ← plugoh
        </Link>

        <h1
          style={{
            fontWeight: 800,
            fontSize: "clamp(2.5rem, 5vw + 1rem, 5rem)",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            color: "#1d1c1c",
            marginBottom: 16,
            textTransform: "uppercase",
          }}
        >
          FAQ
        </h1>
        <p
          style={{
            fontWeight: 500,
            fontSize: "clamp(0.9rem, 0.5vw + 0.7rem, 1.1rem)",
            color: "#1d1c1c",
            opacity: 0.7,
            marginBottom: 48,
          }}
        >
          Got questions? We have answers.
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)",
            borderRadius: 12,
            border: "1px solid #1d1c1c",
            padding: "0 clamp(20px, 3vw, 40px)",
          }}
        >
          {faqs.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        <p
          style={{
            marginTop: 40,
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#1d1c1c",
            opacity: 0.6,
          }}
        >
          Still have questions?{" "}
          <a href="/auth" style={{ fontWeight: 700, color: "#1d1c1c" }}>
            Sign up and reach out →
          </a>
        </p>
      </div>
    </div>
  );
}
