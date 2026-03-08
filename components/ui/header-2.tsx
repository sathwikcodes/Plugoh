"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Paperclip,
  Sparkles,
  Clock,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { ShimmerButton } from "./shimmer-button";

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navIcons = [
    { icon: Home, href: "/", label: "Home" },
    { icon: Paperclip, href: "/packages", label: "Packages" },
    { icon: Sparkles, href: "#features", label: "Features" },
    { icon: Clock, href: "#how-it-works", label: "How it works" },
  ];

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-4 md:px-6">
      <nav
        className={[
          "grid grid-cols-3 items-center rounded-full transition-all duration-150 ease-out",
          scrolled
            ? "h-16 px-8 border border-white/[0.08] bg-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md"
            : "h-14 px-6 border border-transparent bg-transparent",
        ].join(" ")}
      >
        {/* Left — Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-true.png"
              alt="ReelReach"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Center — Nav icons (perfectly centered) */}
        <div className="hidden md:flex items-center justify-center">
          <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1.5">
            {navIcons.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex items-center justify-center size-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.08]"
                title={item.label}
              >
                <item.icon className="size-[18px]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right — Button */}
        <div className="hidden md:flex items-center justify-end">
          <Link href="/login">
            <ShimmerButton className="px-6 py-2.5 text-sm font-semibold gap-2">
              Get Started
              <ArrowRight className="size-4" />
            </ShimmerButton>
          </Link>
        </div>

        {/* Mobile toggle (spans into right col) */}
        <div className="col-span-2 flex items-center justify-end gap-2 md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center size-10 rounded-full border border-white/[0.1] text-foreground hover:bg-white/[0.06]"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navIcons.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.06]"
              >
                <item.icon className="size-4 text-muted-foreground" />
                {item.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-white/[0.08] pt-3">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <LiquidButton
                  size="default"
                  className="w-full rounded-full px-6 text-sm font-semibold !text-white bg-gradient-to-r from-[#EC4E02] to-[#FF8A50] shadow-[0_0_20px_rgba(236,78,2,0.3)] gap-2"
                >
                  Get Started
                  <ArrowRight className="size-4" />
                </LiquidButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
