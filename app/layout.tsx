import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Providers } from "@/components/shared/providers";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://plugoh.com"),
  title: {
    default: "Plugoh",
    template: "%s | Plugoh",
  },
  description:
    "The fastest way for businesses to discover and book Instagram influencers for reels, posts, and stories in India.",
  keywords: [
    "influencer marketing",
    "brand collaborations",
    "Instagram influencers",
    "influencer marketplace",
    "influencer platform India",
    "reels marketing",
  ],
  openGraph: {
    title: "Plugoh – Connect Brands with Influencers",
    description:
      "The fastest way for businesses to discover and book Instagram influencers for reels, posts, and stories in India.",
    url: "https://plugoh.com",
    siteName: "Plugoh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plugoh – Connect Brands with Influencers",
    description:
      "The fastest way for businesses to discover and book Instagram influencers for reels, posts, and stories in India.",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
