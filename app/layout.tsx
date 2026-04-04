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
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://plugoh.com"),
  title: {
    default: "Plugoh – Connect Brands with Creators",
    template: "%s | Plugoh",
  },
  description:
    "The fastest way for businesses to discover and book Instagram influencers for reels, posts, and stories in India.",
  keywords: [
    "influencer marketing",
    "brand collaborations",
    "Instagram influencers",
    "creator marketplace",
    "influencer platform India",
    "reels marketing",
  ],
  openGraph: {
    title: "Plugoh – Connect Brands with Creators",
    description:
      "The fastest way for businesses to discover and book Instagram influencers for reels, posts, and stories in India.",
    url: "https://plugoh.com",
    siteName: "Plugoh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plugoh – Connect Brands with Creators",
    description:
      "The fastest way for businesses to discover and book Instagram influencers for reels, posts, and stories in India.",
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
