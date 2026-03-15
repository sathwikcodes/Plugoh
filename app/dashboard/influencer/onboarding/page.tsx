"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { getGradientConfig } from "@/components/auth/auth-gradient-config";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function InfluencerOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { resolvedTheme } = useTheme();
  const gradientConfig = getGradientConfig(
    "influencer",
    resolvedTheme === "dark",
  );

  const handleConnect = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/instagram/connect?userId=${encodeURIComponent(user.id)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start OAuth");
      window.location.href = data.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      toast({ title: "Error", description: message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div
      data-auth-theme="influencer"
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "var(--auth-bg)" }}
    >
      <AnimatedGradientBackground
        Breathing
        {...gradientConfig}
        containerClassName="fixed inset-0 pointer-events-none"
        containerStyle={{ opacity: 0.4 }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-8 text-center relative z-10"
      >
        <motion.div variants={fadeUp} className="flex justify-center">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "var(--auth-glow)",
                animation: "glow-pulse 2.5s ease-in-out infinite",
                transform: "scale(2.5)",
              }}
            />
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
                boxShadow: "0 8px 30px rgba(221,42,123,0.3)",
              }}
            >
              <Instagram className="w-10 h-10 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-3">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--auth-text)" }}
          >
            Connect your Instagram
          </h1>
          <p
            className="text-sm leading-relaxed max-w-xs mx-auto"
            style={{ color: "var(--auth-text-secondary)" }}
          >
            We&apos;ll automatically import your profile, content, and analytics
            — no manual entry needed.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-3 gap-3 text-center"
        >
          {[
            { label: "Auto-import", desc: "Profile & media" },
            { label: "Analytics", desc: "Engagement data" },
            { label: "Discovery", desc: "Get found by brands" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl py-3 px-2"
              style={{
                background: "var(--auth-card)",
                border: "1px solid var(--auth-card-border)",
                boxShadow: "0 2px 8px var(--auth-shadow, rgba(0,0,0,0.06))",
              }}
            >
              <p
                className="text-xs font-medium"
                style={{ color: "var(--auth-text)" }}
              >
                {item.label}
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: "var(--auth-text-tertiary)" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full h-14 rounded-2xl text-[15px] font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
              boxShadow: "0 4px 20px var(--auth-glow)",
            }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Instagram className="h-5 w-5" />
            )}
            Connect with Instagram
          </button>

          <p className="text-xs" style={{ color: "var(--auth-text-tertiary)" }}>
            Your account must be a{" "}
            <span
              className="font-medium"
              style={{ color: "var(--auth-text-secondary)" }}
            >
              Creator or Business
            </span>{" "}
            account.
          </p>

          <Link
            href="/dashboard/influencer"
            className="inline-block text-sm transition-colors"
            style={{ color: "var(--auth-text-tertiary)" }}
          >
            Skip for now
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
