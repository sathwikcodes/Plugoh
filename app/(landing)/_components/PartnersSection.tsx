"use client";

import styles from "../sowieso.module.css";
import { Reveal } from "./Reveal";

const PARTNERS = [
  "abn-amro","adyen","airwallex","alipay","asn-bank","better-world-payments",
  "bluesnap","bng-bank","bnp-paribas","boku","brite","buckaroo",
  "bunq-black-white","ccv","certo-escrow","chase-paymentech","checkout-dot-com",
  "cm","curo-payments","daopay","deutsche-bank","ease2pay","ecommbx","embed",
  "finby","first-data-fiserv","gocredible","hipay","icepay","ing-bank",
  "ingenico","isbank","knab","lyra","mangopay","mollie","monext","multisafepay",
  "mypos","novalnet","nuvei","nwb-bank","online-payment-platform","pay-dot-com",
  "pay-fast-forward","pay","payabl","paycomet","payone","paypal","payplug",
  "paypro","paysafe","pingpong","pprop","rabobank-logo","rootline","shift4",
  "sibs-pagamentos","stripe","sumup","takeaway","thunes","trust-payments",
  "trustly","unified-post-payments","unlimit","unzer","viva-wallet","windcave",
  "worldline","worldpay","xplor","yabandpay","yoursafe","zen",
];

export function PartnersSection() {
  return (
    <section
      id="psp-partners"
      className="relative"
      style={{
        background: "linear-gradient(180deg,#ffe87a 0%,#ffd94a 100%)",
        padding: "clamp(80px, 10vh, 160px) clamp(20px, 4vw, 80px)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <Reveal className={styles.eyebrow + " mb-8 flex items-center gap-3"}>
          <span className={styles.iconBadgeSm}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M17 7H9M17 7V15" stroke="#1d1c1c" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          Our Wero Q&amp;A Series
        </Reveal>

        <Reveal as="h2" className={styles.partnersTitle} amount={0.25}>
          <span style={{ display: "block" }}>ALWAYS AVAILABLE</span>
          <span style={{ display: "block" }}>WITH OUR PSP PARTNERS</span>
        </Reveal>

        <div className="mt-12 flex items-center justify-between flex-wrap gap-4">
          <Reveal className={styles.eyebrow + " flex items-center gap-3"}>
            <span className={styles.iconBadgeSm}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="#1d1c1c" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            All available PSPs
          </Reveal>
          <Reveal className={styles.body + " max-w-[520px] text-right opacity-80"}>
            Your current PSP provider already supports the transition. You don&apos;t need to switch anything.
          </Reveal>
        </div>

        <div
          className="mt-10 grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(110px, 14vw, 170px), 1fr))",
          }}
        >
          {PARTNERS.map((p) => (
            <Reveal key={p} className={styles.surfaceCard} amount={0.1}>
              <div
                style={{
                  aspectRatio: "1/1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                  background: "#fff",
                  borderRadius: 5,
                }}
              >
                <img
                  src={`/sowieso/images/partners/${p}.png`}
                  alt={p.replace(/-/g, " ")}
                  style={{ maxWidth: "80%", maxHeight: "60%", objectFit: "contain" }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
