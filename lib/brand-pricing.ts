import { PLATFORM_FEE_RATE } from "@/lib/constants";

export function platformFeeFromInfluencerPrice(price: number): number {
  const p = Math.max(0, price);
  return Math.round(p * PLATFORM_FEE_RATE * 100) / 100;
}

export function brandTotalFromInfluencerPrice(price: number): number {
  const p = Math.max(0, price);
  const fee = platformFeeFromInfluencerPrice(p);
  return Math.round((p + fee) * 100) / 100;
}

export type CampaignBrandPricingInput = {
  price_offered: number | null;
  platform_fee_amount?: number | null;
  total_charged_amount?: number | null;
};

export function brandDisplayAmountFromCampaign(
  campaign: CampaignBrandPricingInput,
): number {
  const total = campaign.total_charged_amount;
  if (typeof total === "number" && total > 0) return total;

  const base = campaign.price_offered ?? 0;
  if (base <= 0) return 0;

  const feeFromDb = campaign.platform_fee_amount;
  const fee =
    typeof feeFromDb === "number" && feeFromDb >= 0
      ? feeFromDb
      : platformFeeFromInfluencerPrice(base);

  return Math.round((base + fee) * 100) / 100;
}
