import { PricingInteraction } from "@/components/ui/pricing-interaction";

export function PricingInteractionDemo() {
  return (
    <PricingInteraction
      starterMonth={9.99}
      starterAnnual={7.49}
      proMonth={19.99}
      proAnnual={17.49}
    />
  );
}
