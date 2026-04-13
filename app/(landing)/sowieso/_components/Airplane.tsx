"use client";

export function Airplane({
  variant = "pink",
}: {
  variant?: "pink" | "green";
}) {
  const gradient =
    variant === "pink"
      ? "url(#paperPink)"
      : "url(#paperGreen)";
  return (
    <svg viewBox="0 0 975 468" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "auto" }} aria-hidden>
      <defs>
        <linearGradient id="paperPink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff3d8a" />
          <stop offset="100%" stopColor="#ff9b4a" />
        </linearGradient>
        <linearGradient id="paperGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7effc5" />
          <stop offset="100%" stopColor="#3dd6a0" />
        </linearGradient>
      </defs>
      <g stroke="#1d1c1c" strokeWidth="3" strokeLinejoin="round">
        <polygon points="10,260 950,30 420,330" fill={gradient} />
        <polygon points="420,330 950,30 600,370" fill={gradient} opacity="0.85" />
        <polygon points="420,330 600,370 470,440" fill={gradient} opacity="0.9" />
      </g>
    </svg>
  );
}
