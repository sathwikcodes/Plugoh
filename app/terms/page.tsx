import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Plugoh, an influencer marketplace for brands and creators.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f4f0f8] px-5 py-12 text-[#1d1c1c]">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-semibold text-black/60">
          Back to Plugoh
        </Link>

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-black/55">
          Last updated: April 30, 2026
        </p>

        <div className="mt-8 space-y-6 text-base leading-7 text-black/75">
          <p>
            These Terms govern your use of Plugoh, an influencer marketplace for
            brands and creators. By using Plugoh, you agree to use the service
            responsibly and in compliance with applicable laws.
          </p>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">Using Plugoh</h2>
            <p className="mt-2">
              Brands may use Plugoh to discover creators, create campaigns, and
              manage collaborations. Influencers may use Plugoh to maintain a
              creator profile, connect supported social accounts, review
              opportunities, and participate in campaigns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">
              Account responsibilities
            </h2>
            <p className="mt-2">
              You are responsible for keeping your account information accurate,
              protecting your login credentials, and ensuring that content,
              campaign details, and communications you provide are lawful and
              truthful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">
              Campaigns and payments
            </h2>
            <p className="mt-2">
              Campaign terms, deliverables, compensation, and timelines should
              be reviewed before accepting or launching a collaboration. Plugoh
              may facilitate campaign workflows, but users remain responsible
              for honoring agreed campaign commitments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">
              Service availability
            </h2>
            <p className="mt-2">
              We work to keep Plugoh reliable, but the service may change,
              pause, or experience interruptions. We may update these Terms as
              the product evolves.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">Contact</h2>
            <p className="mt-2">
              For questions about these Terms, contact the Plugoh team at{" "}
              <a
                className="font-semibold text-[#1d1c1c]"
                href="mailto:hello@plugoh.com"
              >
                hello@plugoh.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
