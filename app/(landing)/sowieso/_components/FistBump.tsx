"use client";

import dynamic from "next/dynamic";
import { RefObject } from "react";
import fistsData from "../../../../public/sowieso/animations/fists.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function FistBump({ lottieRef }: { lottieRef: RefObject<any> }) {
  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={fistsData}
      loop={false}
      autoplay={false}
      style={{ width: "100%", height: "100%" }}
      rendererSettings={{
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: true,
      }}
    />
  );
}
