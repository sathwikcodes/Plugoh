"use client";

export function Airplane({
  variant = "pink",
}: {
  variant?: "pink" | "green";
}) {
  return (
    <img
      src="/sowieso/images/airplane1.png"
      alt={`${variant} airplane`}
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        filter: variant === "green" ? "hue-rotate(180deg) saturate(1.2)" : "none"
      }}
    />
  );
}
