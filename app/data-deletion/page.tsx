import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion Instructions",
  description:
    "How to request deletion of your Plugoh account and connected data.",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-[#f4f0f8] px-5 py-12 text-[#1d1c1c]">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-semibold text-black/60">
          Back to Plugoh
        </Link>

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
          Data deletion instructions
        </h1>
        <p className="mt-3 text-sm text-black/55">
          Last updated: April 30, 2026
        </p>

        <div className="mt-8 space-y-6 text-base leading-7 text-black/75">
          <p>
            Plugoh users can request deletion of their account and personal data
            at any time. When you delete your Plugoh account, we remove or
            anonymize profile information, campaign records tied to your
            account, and Instagram connection tokens stored for your connected
            account.
          </p>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">
              How to request deletion
            </h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                Email{" "}
                <a
                  className="font-semibold text-[#1d1c1c]"
                  href="mailto:hello@plugoh.com?subject=Data%20deletion%20request"
                >
                  hello@plugoh.com
                </a>{" "}
                from the address associated with your Plugoh account.
              </li>
              <li>
                Include your full name and the email you use to sign in to
                Plugoh.
              </li>
              <li>
                We will confirm receipt and complete deletion within 30 days,
                unless a longer period is required by law.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1d1c1c]">Instagram data</h2>
            <p className="mt-2">
              If you connected Instagram through Plugoh, you can also revoke
              Plugoh&apos;s access in your Instagram account settings. Revoking
              access stops future syncs; email us to delete historical Instagram
              data we already stored.
            </p>
          </section>

          <p>
            See our{" "}
            <Link href="/privacy" className="font-semibold underline">
              Privacy Policy
            </Link>{" "}
            for more detail on retention and security.
          </p>
        </div>
      </article>
    </main>
  );
}
