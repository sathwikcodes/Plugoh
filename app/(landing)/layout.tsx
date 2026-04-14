import type { Metadata } from "next";
import localFont from "next/font/local";
import styles from "./landing.module.css";

const walsheim = localFont({
  src: [
    {
      path: "../../public/landing/fonts/GT-Walsheim-wero-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/landing/fonts/GT-Walsheim-wero-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/landing/fonts/GT-Walsheim-wero-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/landing/fonts/GT-Walsheim-wero-Black.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-walsheim",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plugoh - Wero",
  description:
    "iDEAL is becoming Wero — the new European way to pay. Always available with our PSP partners.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${walsheim.variable} ${styles.scope}`} data-theme="landing">
      {children}
    </div>
  );
}
