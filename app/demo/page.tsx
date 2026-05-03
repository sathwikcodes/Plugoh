import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Investor demo",
  robots: { index: false, follow: false },
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const enabled = process.env.NEXT_PUBLIC_DEMO_ENABLED === "true";
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
            Investor demo
          </h1>
          <p className="text-sm leading-relaxed text-white/70">
            Sandbox accounts with seeded campaigns. No real payments.
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
            Demo login is turned off here. Set{" "}
            <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-amber-200/90">
              NEXT_PUBLIC_DEMO_ENABLED=true
            </code>{" "}
            and demo env vars to enable.
          </p>
        ) : (
          <div className="flex w-full flex-col gap-3">
            <form action="/api/demo/login" method="post">
              <input type="hidden" name="role" value="business" />
              <button
                type="submit"
                className="w-full rounded-xl bg-amber-400 px-4 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
              >
                Demo as brand
              </button>
            </form>
            <form action="/api/demo/login" method="post">
              <input type="hidden" name="role" value="influencer" />
              <button
                type="submit"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Demo as creator
              </button>
            </form>
          </div>
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
