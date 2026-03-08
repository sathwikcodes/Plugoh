"use client";

import { FaqSection } from "@/components/ui/faq-section";

const REELREACH_FAQS = [
  {
    question: "How does ReelReach match creators with brands?",
    answer:
      "Our smart matching algorithm analyzes creator niches, audience demographics, engagement rates, and brand requirements to suggest ideal partnerships. You can also use filters to manually search and discover perfect matches.",
  },
  {
    question: "What types of creators can join ReelReach?",
    answer:
      "We welcome creators across all platforms and niches - from micro-influencers with 1K followers to established creators with millions. Whether you specialize in lifestyle, tech, fashion, gaming, or any other niche, ReelReach helps you find brand partnerships.",
  },
  {
    question: "How much does it cost to use ReelReach?",
    answer:
      "Creators can join and create profiles for free. Brands can browse creator profiles at no cost. We offer flexible pricing plans for advanced features like campaign management, analytics dashboards, and priority matching.",
  },
  {
    question: "How are payments handled on the platform?",
    answer:
      "ReelReach provides secure escrow payments to protect both creators and brands. Funds are held safely until deliverables are approved, ensuring peace of mind for all parties involved in collaborations.",
  },
  {
    question: "Can I manage multiple campaigns simultaneously?",
    answer:
      "Absolutely! Our dashboard allows you to manage multiple campaigns, track deliverables, communicate with partners, and monitor performance metrics all in one place. Scale your influencer marketing effortlessly.",
  },
];

export function FaqSectionWrapper() {
  return (
    <FaqSection
      title="Frequently Asked Questions"
      description="Everything you need to know about ReelReach"
      items={REELREACH_FAQS}
    />
  );
}
