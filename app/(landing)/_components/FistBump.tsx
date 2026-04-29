"use client";

import dynamic from "next/dynamic";
import { RefObject } from "react";
import fistsData from "../../../public/landing/animations/fists.json";
import styles from "../landing.module.css";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function FistBump({ lottieRef }: { lottieRef: RefObject<any> }) {
  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={fistsData}
      loop={false}
      autoplay={false}
      className={styles.fistBumpLottie}
      rendererSettings={{
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: true,
      }}
    />
  );
}
