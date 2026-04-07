export const GRADIENT_COLORS = [
  "#0F1115",
  "#20B8A8",
  "#169A8D",
  "#FF7A59",
  "#20B8A8",
  "#169A8D",
  "#0F1115",
];

export const GRADIENT_STOPS = [20, 40, 55, 65, 75, 85, 100];

export const GRADIENT_STYLE = { opacity: 0.07 } as const;

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
