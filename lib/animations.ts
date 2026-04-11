export const GRADIENT_COLORS = [
  "#08060d",
  "#180e22",
  "#c22e8a",
  "#e05a10",
  "#c9a000",
  "#6b1e48",
  "#170c1e",
  "#060408",
];

export const GRADIENT_STOPS = [20, 34, 48, 58, 68, 78, 88, 100];

export const GRADIENT_STYLE = {
  opacity: 0.78,
  filter: "blur(70px) saturate(140%)",
} as const;

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
