export const GRADIENT_COLORS = [
  "#0C0A0E",
  "#1A0E1A",
  "#C94B8A",
  "#B5602A",
  "#C49510",
  "#5C3808",
  "#1A0E05",
  "#0A0808",
];

export const GRADIENT_STOPS = [20, 34, 48, 58, 68, 78, 88, 100];

export const GRADIENT_STYLE = {
  opacity: 0.72,
  filter: "blur(70px) saturate(130%)",
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
