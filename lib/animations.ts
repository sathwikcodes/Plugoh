export const GRADIENT_COLORS = [
  "#0A0A0A",
  "#dd2a7b",
  "#8134af",
  "#f58529",
  "#515bd4",
  "#dd2a7b",
  "#0A0A0A",
];

export const GRADIENT_STOPS = [20, 40, 55, 65, 75, 85, 100];

export const GRADIENT_STYLE = { opacity: 0.08 } as const;

export const INSTAGRAM_GRADIENT =
  "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)";

export const FILTER_PILL_STYLE = {
  background: INSTAGRAM_GRADIENT,
} as const;

export const FILTER_PILL_TRANSITION = {
  type: "spring" as const,
  bounce: 0.2,
  duration: 0.4,
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};
