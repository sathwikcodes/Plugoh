"use client";

import dynamic from "next/dynamic";
import { memo, RefObject, useCallback } from "react";
import type { LottieComponentProps } from "lottie-react";
import fistsData from "../../../public/landing/animations/fists.json";
import styles from "../landing.module.css";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type FistBumpProps = {
  lottieRef: RefObject<any>;
  onLoaded?: () => void;
  useCanvas?: boolean;
};

export const FistBump = memo(function FistBump({
  lottieRef,
  onLoaded,
  useCanvas = false,
}: FistBumpProps) {
  const handleLoaded = useCallback(() => {
    lottieRef.current?.setSubframe?.(true);
    onLoaded?.();
  }, [lottieRef, onLoaded]);

  const props = {
    lottieRef,
    animationData: fistsData,
    loop: false,
    autoplay: false,
    className: styles.fistBumpLottie,
    onDOMLoaded: handleLoaded,
    ...(useCanvas
      ? {
          renderer: "canvas",
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: false,
            clearCanvas: true,
          },
        }
      : {
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: false,
          },
        }),
  } satisfies Record<string, unknown> as LottieComponentProps;

  return <Lottie {...props} />;
});
