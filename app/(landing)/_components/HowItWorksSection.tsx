"use client";

import styles from "../sowieso.module.css";
import { Reveal } from "./Reveal";

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description: "Creators: set up your Instagram, niche, and rates.\nBrands: set up your campaign budget and target niche.",
  },
  {
    number: "02",
    title: "Find your match",
    description: "Brands browse creators by niche, followers, and price.\nCreators get discovered by brands that fit their content.",
  },
  {
    number: "03",
    title: "Collaborate and grow",
    description: "Manage briefs, messaging, deliverables, and payments all in one place.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      className="w-full"
      style={{
        background: "#fff",
        padding: "clamp(48px, 10vw, 120px) clamp(16px, 5vw, 80px)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1400px" }}>
        <Reveal>
          <p
            className={styles.eyebrow + " text-center mb-3"}
            style={{ color: "#1d1c1c" }}
          >
            Simple by design
          </p>
          <h2
            className={styles.airplanesTitle + " text-center"}
            style={{
              color: "#1d1c1c",
              marginBottom: "clamp(32px, 6vw, 64px)",
            }}
          >
            HOW IT WORKS
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step) => (
            <Reveal key={step.number}>
              <div
                className={styles.surfaceCard}
                style={{
                  padding: "clamp(20px, 3vw, 40px)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "clamp(2rem, 5vw, 4rem)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    color: "#1d1c1c",
                    opacity: 0.12,
                    marginBottom: 14,
                  }}
                >
                  {step.number}
                </div>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    color: "#1d1c1c",
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
                    fontWeight: 500,
                    color: "#1d1c1c",
                    lineHeight: 1.55,
                    whiteSpace: "pre-line",
                    opacity: 0.7,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
