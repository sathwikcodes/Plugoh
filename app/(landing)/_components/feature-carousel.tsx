"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import Image, { type StaticImageData } from "next/image";
import clsx from "clsx";
import { AnimatePresence, m, type Variants } from "motion/react";
import Balancer from "react-wrap-balancer";

import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  description: string;
  bgClass?: string;
}

interface ImageSet {
  step1dark1?: StaticImageData | string;
  step1dark2?: StaticImageData | string;
  step1light1: StaticImageData | string;
  step1light2: StaticImageData | string;
  step2dark1?: StaticImageData | string;
  step2dark2?: StaticImageData | string;
  step2light1: StaticImageData | string;
  step2light2: StaticImageData | string;
  step3dark?: StaticImageData | string;
  step3light: StaticImageData | string;
  step4light: StaticImageData | string;
  alt: string;
}

export interface ComponentProps extends CardProps {
  step1img1Class?: string;
  step1img2Class?: string;
  step2img1Class?: string;
  step2img2Class?: string;
  step3imgClass?: string;
  step4imgClass?: string;
  image: ImageSet;
}

interface StepImageProps {
  src: StaticImageData | string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

interface Step {
  id: string;
  name: string;
  title: string;
  description: string;
}

const TOTAL_STEPS = 4;

const steps: readonly Step[] = [
  {
    id: "1",
    name: "Step 1",
    title: "Smart Creator Discovery",
    description:
      "Find the perfect creators for your brand using AI-powered matching based on niche, audience demographics, and engagement metrics.",
  },
  {
    id: "2",
    name: "Step 2",
    title: "Campaign Management",
    description:
      "Launch and manage influencer campaigns from a single dashboard with real-time tracking, deliverables, and automated workflows.",
  },
  {
    id: "3",
    name: "Step 3",
    title: "Performance Analytics",
    description:
      "Track ROI, engagement rates, and audience growth with comprehensive analytics dashboards and exportable reports.",
  },
  {
    id: "4",
    name: "Step 4",
    title: "Scale & Optimize",
    description:
      "Leverage data-driven insights to scale winning partnerships and continuously optimize your creator marketing strategy.",
  },
] as const;

const ANIMATION_PRESETS = {
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.5,
    },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.5,
    },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.5,
    },
  },
} as const;

type AnimationPreset = keyof typeof ANIMATION_PRESETS;

interface AnimatedStepImageProps extends StepImageProps {
  preset?: AnimationPreset;
  delay?: number;
  onAnimationComplete?: () => void;
}

function useNumberCycler(
  totalSteps: number = TOTAL_STEPS,
  interval: number = 3000,
) {
  const [currentNumber, setCurrentNumber] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const paramsRef = useRef({ interval, totalSteps });
  useEffect(() => {
    paramsRef.current = { interval, totalSteps };
  }, [interval, totalSteps]);

  const setupTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const tick = () => {
      setCurrentNumber((prev) => (prev + 1) % paramsRef.current.totalSteps);
      timerRef.current = setTimeout(tick, paramsRef.current.interval);
    };
    timerRef.current = setTimeout(tick, paramsRef.current.interval);
  }, []);

  const increment = useCallback(() => {
    setCurrentNumber((prev) => (prev + 1) % totalSteps);
    setupTimer();
  }, [totalSteps, setupTimer]);

  useEffect(() => {
    setupTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [setupTimer]);

  return {
    currentNumber,
    increment,
  };
}

function useIsMobile() {
  const subscribe = useCallback((cb: () => void) => {
    const mql = window.matchMedia("(max-width: 768px)");
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  }, []);
  const getSnapshot = useCallback(() => {
    const isSmall = window.matchMedia("(max-width: 768px)").matches;
    const isMobileUserAgent = Boolean(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent,
      ),
    );
    const isDev = process.env.NODE_ENV !== "production";
    return isDev ? isSmall || isMobileUserAgent : isSmall && isMobileUserAgent;
  }, []);
  const getServerSnapshot = () => false;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function IconCheck({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn("h-4 w-4", className)}
      {...props}
    >
      <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  );
}

const stepVariants: Variants = {
  inactive: {
    scale: 0.8,
    opacity: 0.5,
  },
  active: {
    scale: 1,
    opacity: 1,
  },
};

const StepImage = forwardRef<HTMLImageElement, StepImageProps>(
  (
    { src, alt, className, style, width = 1200, height = 630, ...props },
    ref,
  ) => {
    return (
      <Image
        ref={ref}
        alt={alt}
        className={className}
        src={src}
        width={width}
        height={height}
        style={{
          position: "absolute",
          userSelect: "none",
          maxWidth: "unset",
          ...style,
        }}
        {...props}
      />
    );
  },
);
StepImage.displayName = "StepImage";

const MotionStepImage = m.create(StepImage);

const AnimatedStepImage = ({
  preset = "fadeInScale",
  delay = 0,
  onAnimationComplete,
  ...props
}: AnimatedStepImageProps) => {
  const presetConfig = ANIMATION_PRESETS[preset];
  return (
    <MotionStepImage
      {...props}
      {...presetConfig}
      transition={{
        ...presetConfig.transition,
        delay,
      }}
      onAnimationComplete={onAnimationComplete}
    />
  );
};

function FeatureCard({
  bgClass,
  children,
  step,
}: CardProps & {
  children: React.ReactNode;
  step: number;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    if (isMobile || !cardRef.current) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    cardRef.current.style.setProperty("--x", `${clientX - left}px`);
    cardRef.current.style.setProperty("--y", `${clientY - top}px`);
  }

  return (
    <div
      ref={cardRef}
      className="animated-cards relative w-full rounded-[16px]"
      onMouseMove={handleMouseMove}
    >
      <div
        className={clsx(
          "group relative w-full overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-b from-neutral-900/90 to-stone-800 transition duration-300 dark:from-neutral-950/90 dark:to-neutral-800/90",
          "md:hover:border-transparent",
          bgClass,
        )}
      >
        <div className="m-4 sm:m-6 md:m-10 min-h-[350px] sm:min-h-[400px] md:min-h-[450px] w-full pt-14 md:pt-0">
          <AnimatePresence mode="wait">
            <m.div
              key={step}
              className="flex w-full md:w-4/6 flex-col gap-2 sm:gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <m.h2
                className="text-xl font-bold tracking-tight text-white md:text-2xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.1,
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {steps[step].title}
              </m.h2>
              <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <p className="text-sm leading-5 text-neutral-300 sm:text-base sm:leading-5 dark:text-zinc-400">
                  <Balancer>{steps[step].description}</Balancer>
                </p>
              </m.div>
            </m.div>
          </AnimatePresence>
          {mounted ? children : null}
        </div>
      </div>
    </div>
  );
}

function Steps({
  steps: stepData,
  current,
  onChange,
}: {
  steps: readonly Step[];
  current: number;
  onChange: (index: number) => void;
}) {
  return (
    <nav aria-label="Progress" className="flex justify-center px-2 sm:px-4">
      <ol
        className="flex w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:w-10/12 md:divide-y-0"
        role="list"
      >
        {stepData.map((step, stepIdx) => {
          const isCompleted = current > stepIdx;
          const isCurrent = current === stepIdx;
          const isFuture = !isCompleted && !isCurrent;

          return (
            <m.li
              key={`${step.name}-${stepIdx}`}
              initial="inactive"
              animate={isCurrent ? "active" : "inactive"}
              variants={stepVariants}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative z-50 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 transition-all duration-300 ease-in-out md:flex",
                isCompleted ? "bg-neutral-500/20" : "bg-neutral-500/10",
              )}
            >
              <div
                className={cn(
                  "group flex w-full cursor-pointer items-center focus:outline-none focus-visible:ring-2",
                  (isFuture || isCurrent) && "pointer-events-none",
                )}
                onClick={() => onChange(stepIdx)}
              >
                <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
                  <m.span
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.2 : 1,
                    }}
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full duration-300",
                      isCompleted && "bg-orange-500 text-white",
                      isCurrent &&
                        "bg-orange-400/80 text-neutral-400 dark:bg-neutral-500/50",
                      isFuture && "bg-neutral-500/20",
                    )}
                  >
                    {isCompleted ? (
                      <m.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <IconCheck className="h-3 w-3 stroke-white stroke-[3] text-white dark:stroke-black" />
                      </m.div>
                    ) : (
                      <span
                        className={cn(
                          "text-xs",
                          !isCurrent && "text-orange-400",
                        )}
                      >
                        {stepIdx + 1}
                      </span>
                    )}
                  </m.span>
                  <m.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={clsx(
                      "text-sm font-medium duration-300",
                      isCompleted && "text-muted-foreground",
                      isCurrent && "text-orange-300 dark:text-orange-400",
                      isFuture && "text-neutral-500",
                    )}
                  >
                    {step.name}
                  </m.span>
                </span>
              </div>
            </m.li>
          );
        })}
      </ol>
    </nav>
  );
}

const defaultClasses = {
  step1img1:
    "pointer-events-none w-[50%] border border-stone-100/10 transition-all duration-500 dark:border-stone-700/50 rounded-2xl",
  step1img2:
    "pointer-events-none w-[60%] border border-stone-100/10 dark:border-stone-700/50 transition-all duration-500 overflow-hidden rounded-2xl",
  step2img1:
    "pointer-events-none w-[50%] border border-stone-100/10 transition-all duration-500 dark:border-stone-700 rounded-2xl overflow-hidden",
  step2img2:
    "pointer-events-none w-[40%] border border-stone-100/10 dark:border-stone-700 transition-all duration-500 rounded-2xl overflow-hidden",
  step3img:
    "pointer-events-none w-[90%] border border-stone-100/10 dark:border-stone-700 rounded-2xl transition-all duration-500 overflow-hidden",
  step4img:
    "pointer-events-none w-[90%] border border-stone-100/10 dark:border-stone-700 rounded-2xl transition-all duration-500 overflow-hidden",
} as const;

export const FeatureCarousel = ({
  image,
  step1img1Class = defaultClasses.step1img1,
  step1img2Class = defaultClasses.step1img2,
  step2img1Class = defaultClasses.step2img1,
  step2img2Class = defaultClasses.step2img2,
  step3imgClass = defaultClasses.step3img,
  step4imgClass = defaultClasses.step4img,
  ...props
}: ComponentProps) => {
  const { currentNumber: step, increment } = useNumberCycler();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleIncrement = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    increment();
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const renderStepContent = () => {
    const content = () => {
      switch (step) {
        case 0:
          return (
            <m.div
              className="relative w-full h-full"
              onAnimationComplete={handleAnimationComplete}
            >
              <AnimatedStepImage
                alt={image.alt}
                className={clsx(step1img1Class)}
                src={image.step1light1}
                preset="slideInLeft"
              />
              <AnimatedStepImage
                alt={image.alt}
                className={clsx(step1img2Class)}
                src={image.step1light2}
                preset="slideInRight"
                delay={0.1}
              />
            </m.div>
          );
        case 1:
          return (
            <m.div
              className="relative w-full h-full"
              onAnimationComplete={handleAnimationComplete}
            >
              <AnimatedStepImage
                alt={image.alt}
                className={clsx(step2img1Class, "rounded-2xl")}
                src={image.step2light1}
                preset="fadeInScale"
              />
              <AnimatedStepImage
                alt={image.alt}
                className={clsx(step2img2Class, "rounded-2xl")}
                src={image.step2light2}
                preset="fadeInScale"
                delay={0.1}
              />
            </m.div>
          );
        case 2:
          return (
            <AnimatedStepImage
              alt={image.alt}
              className={clsx(step3imgClass, "rounded-2xl")}
              src={image.step3light}
              preset="fadeInScale"
              onAnimationComplete={handleAnimationComplete}
            />
          );
        case 3:
          return (
            <AnimatedStepImage
              alt={image.alt}
              className={clsx(step4imgClass, "rounded-2xl")}
              src={image.step4light}
              preset="fadeInScale"
              onAnimationComplete={handleAnimationComplete}
            />
          );
        default:
          return null;
      }
    };

    return (
      <AnimatePresence mode="wait">
        <m.div
          key={step}
          {...ANIMATION_PRESETS.fadeInScale}
          className="w-full h-full absolute"
        >
          {content()}
        </m.div>
      </AnimatePresence>
    );
  };

  return (
    <FeatureCard {...props} step={step}>
      {renderStepContent()}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute left-0 top-3 md:top-5 z-50 w-full cursor-pointer"
      >
        <Steps current={step} onChange={() => {}} steps={steps} />
      </m.div>
      <div
        className="absolute right-0 top-0 z-50 h-full w-full cursor-pointer"
        onClick={handleIncrement}
      />
    </FeatureCard>
  );
};

FeatureCarousel.displayName = "FeatureCarousel";
