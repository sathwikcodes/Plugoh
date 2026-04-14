"use client";

import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import linesData from "../../../public/sowieso/animations/lines.json";

export function LinesAnimation() {
  return (
    <Lottie
      animationData={linesData}
      loop={true}
      autoplay={true}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
