"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { getDashboardPath } from "@/lib/auth-routing";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AuthShell } from "@/components/auth/auth-shell";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function Login() {
  const {
    user,
    role,
    needsOnboarding,
    signInWithOtp,
    verifyOtp,
    loading: authLoading,
  } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!authLoading && user && needsOnboarding) {
      router.replace("/onboarding");
    } else if (!authLoading && user && role) {
      router.replace(getDashboardPath(role));
    }
  }, [authLoading, user, role, needsOnboarding, router]);

  useEffect(() => {
    if (!sent || timeLeft <= 0) {
      if (timeLeft <= 0) setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [sent, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleOtpChange = useCallback((value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      setOtp((prev) => {
        const updated = [...prev];
        updated[index] = value;
        return updated;
      });
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  }, []);

  const handleOtpKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    },
    [otp],
  );

  const handleSendOtp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithOtp(email);
      setSent(true);
      setTimeLeft(60);
      setCanResend(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send code";
      toast({
        title: "Failed to send verification code",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast({
        title: "Incomplete code",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      });
      return;
    }
    setVerifying(true);
    try {
      await verifyOtp(email, code);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid or expired code";
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      await signInWithOtp(email);
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(60);
      setCanResend(false);
      document.getElementById("otp-0")?.focus();
      toast({
        title: "Code resent",
        description: "A new code has been sent to your email.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to resend code";
      toast({
        title: "Failed to resend code",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=/post-auth`
              : "",
        },
      });
      if (error) {
        toast({
          title: "Google sign-in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google sign-in failed";
      toast({
        title: "Google sign-in failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#08060d]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AuthShell>
      <AnimatePresence mode="wait">
        {sent ? (
          <m.div
            key="otp-verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-3 text-center sm:gap-5"
          >
            {/* Mail image */}
            <div
              className="relative flex items-center justify-center rounded-2xl p-3 sm:p-4"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              <Image
                src="/inbox.png"
                alt="Mail"
                width={56}
                height={56}
                className="h-10 w-10 sm:h-12 sm:w-12"
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1
                className="text-xl font-semibold tracking-tight sm:text-2xl"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                OTP Verification
              </h1>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Enter the 6-digit code sent to
              </p>
              <span
                className="inline-block max-w-full truncate px-3 py-1.5 rounded-full text-xs font-medium sm:text-sm"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {email}
              </span>
            </div>

            {/* OTP Inputs */}
            <div className="flex w-full justify-center gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  maxLength={1}
                  className="h-12 w-10 text-center text-base font-semibold rounded-xl outline-none transition-all duration-200 sm:h-14 sm:w-12 sm:text-lg"
                  style={{
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.5)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.18)")
                  }
                />
              ))}
            </div>

            {/* Timer */}
            {!canResend && (
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Resend code in{" "}
                <strong style={{ color: "rgba(255,255,255,0.6)" }}>
                  {formatTime(timeLeft)}
                </strong>
              </p>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={verifying}
              className="w-full h-12 rounded-2xl text-[15px] font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:h-14"
              style={{
                background: "var(--auth-gradient)",
                color: "var(--auth-accent-fg)",
                boxShadow: "0 4px 20px var(--auth-glow)",
              }}
            >
              {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify OTP
            </button>

            {/* Resend Button */}
            <button
              onClick={handleResend}
              disabled={!canResend}
              className="w-full h-11 rounded-2xl text-[14px] font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 sm:h-12"
              style={{
                color: "#ffffff",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {canResend ? "Send Again" : "Resend OTP"}
              {!canResend && (
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {formatTime(timeLeft)}
                </span>
              )}
            </button>

            <button
              className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70 mx-auto"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onClick={() => {
                setSent(false);
                setOtp(["", "", "", "", "", ""]);
                setEmail("");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Use a different email
            </button>
          </m.div>
        ) : (
          <m.div
            key="login-form"
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5 sm:space-y-7"
          >
            <m.div variants={fadeUp} className="space-y-1.5 text-center">
              <h1
                className="heading-premium text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                Welcome back
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                Sign in to continue to your dashboard
              </p>
            </m.div>

            <m.form
              variants={fadeUp}
              onSubmit={handleSendOtp}
              className="space-y-3 sm:space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-5 rounded-2xl text-[15px] outline-none transition-all duration-200 sm:h-14"
                  style={{
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.5)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.18)")
                  }
                />
                <p
                  className="text-xs pl-1"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  We&apos;ll send you a verification code to sign in.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl text-[15px] font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:h-14"
                style={{
                  background: "var(--auth-gradient)",
                  color: "var(--auth-accent-fg)",
                  boxShadow: "0 4px 20px var(--auth-glow)",
                }}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Continue
              </button>
            </m.form>

            <m.div variants={fadeUp} className="flex items-center gap-3">
              <div
                className="flex-1"
                style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
              />
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                or
              </span>
              <div
                className="flex-1"
                style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
              />
            </m.div>

            <m.div variants={fadeUp}>
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-12 rounded-2xl text-[15px] font-medium transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 sm:h-14"
                style={{
                  color: "#ffffff",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.16)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                }
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Sign in with Google
              </button>
            </m.div>

            <m.p
              variants={fadeUp}
              className="text-xs text-center leading-relaxed"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              By signing in, you agree to our{" "}
              <span
                className="cursor-pointer transition-opacity hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Terms of Use
              </span>{" "}
              and{" "}
              <span
                className="cursor-pointer transition-opacity hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Privacy Policy
              </span>
              .
            </m.p>
          </m.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
