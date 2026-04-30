import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Plugoh, an influencer marketplace for brands and creators.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f4f0f8] px-5 py-12 text-[#1d1c1c]">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-semibold text-black/60">
          Back to Plugoh
        </Link>

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-black/55">
          Last updated: April 30, 2026
        </p>

        <div className="mt-8 space-y-6 text-base leading-7 text-black/75">
          <p>
            Plugoh is an influencer marketplace that helps brands discover,
            book, and manage collaborations with creators. This Privacy Policy
            explains what information we collect, how we use it, and the choices
            available to you.
          </p>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">
              Information we collect
            </h2>
            <p className="mt-2">
              We may collect account details such as your name, email address,
              phone number, role, location, brand details, creator profile
              details, Instagram profile information you choose to connect,
              campaign activity, messages, and payment-related records needed to
              operate the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">
              How we use information
            </h2>
            <p className="mt-2">
              We use information to authenticate users, create and maintain
              profiles, connect brands with influencers, manage campaigns,
              process collaboration workflows, improve product reliability, and
              protect accounts from misuse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">
              Third-party services
            </h2>
            <p className="mt-2">
              Plugoh may use trusted service providers for authentication,
              database hosting, analytics, email delivery, payments, and
              Instagram integrations. These providers process information only
              as needed to support the product.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">
              Data retention and security
            </h2>
            <p className="mt-2">
              We retain information for as long as needed to provide Plugoh,
              meet legal obligations, resolve disputes, and enforce agreements.
              We use reasonable technical and organizational safeguards to
              protect account and campaign data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">Your choices</h2>
            <p className="mt-2">
              You can request access, correction, or deletion of your personal
              information by contacting us. Some information may be retained
              where required for legal, security, or transaction recordkeeping
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">Contact</h2>
            <p className="mt-2">
              For privacy questions, contact the Plugoh team at{" "}
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
