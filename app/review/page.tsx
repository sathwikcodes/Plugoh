import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AuthShell } from "@/components/auth/auth-shell";
import { isMetaReviewLoginEnabled } from "@/lib/server/meta-review-login-env";

export const metadata: Metadata = {
  title: "App Review access",
  robots: { index: false, follow: false },
};

export default async function MetaReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const enabled = isMetaReviewLoginEnabled();
  const sp = await searchParams;
  const raw = sp?.error;
  const error = Array.isArray(raw) ? raw[0] : raw;

  return (
    <AuthShell hideLogo>
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <Image
          src="/logo-gold.png"
          alt="Plugoh"
          height={72}
          width={260}
          className="h-14 w-auto"
          priority
        />
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-normal tracking-tight text-white sm:text-3xl">
            Meta App Review
          </h1>
          <p className="text-sm leading-relaxed text-white/70">
            Password sign-in for Meta reviewers only. You will complete creator
            onboarding and connect your own Instagram account there. The
            investor demo at /demo is unchanged.
          </p>
        </div>

        {error ? (
          <div
            className="w-full rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {!enabled ? (
          <p className="text-sm text-white/60">
            Reviewer login is off. Set{" "}
            <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-amber-200/90">
              NEXT_PUBLIC_META_REVIEW_ENABLED=true
            </code>{" "}
            and Meta reviewer credentials in the environment.
          </p>
        ) : (
          <form action="/api/review/login" method="post" className="w-full">
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-400 px-4 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
            >
              Sign in as Meta reviewer
            </button>
          </form>
        )}

        <Link
          href="/"
          className="text-sm text-white/45 underline-offset-4 hover:text-white/70 hover:underline"
        >
          Back to home
        </Link>
      </div>
    </AuthShell>
  );
}
