"use client";

import dynamic from "next/dynamic";
import { RefObject } from "react";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import linesData from "../../../public/sowieso/animations/lines.json";

type LinesAnimationProps = {
  lottieRef?: RefObject<any>;
  autoplay?: boolean;
  loop?: boolean;
};

export function LinesAnimation({ lottieRef, autoplay = true, loop = true }: LinesAnimationProps) {
  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={linesData}
      loop={loop}
      autoplay={autoplay}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
