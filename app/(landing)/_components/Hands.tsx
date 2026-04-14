"use client";

import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// We'll load the JSON at runtime via fetch to keep the bundle lean,
// but since Next.js can serve from /public we just import directly.
import handsData from "../../../public/landing/animations/hands.json";

export function Hands() {
  return (
    <Lottie
      animationData={handsData}
      loop={false}
      autoplay={true}
      initialSegment={[0, 61]}
      style={{ width: "100%", height: "100%" }}
      rendererSettings={{
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: true,
      }}
    />
  );
}
