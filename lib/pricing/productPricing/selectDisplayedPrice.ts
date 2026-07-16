import type { PricingStrategy }
 from "../pricingStrategy";

import type {
 RepresentativePricing,
} from "./calculateRepresentativePrice";

export function selectDisplayedPrice(
 pricing: RepresentativePricing,
 strategy: PricingStrategy
) {

 /*
  * Temporary.
  *
  * Until PricingStrategy gains
  * pricingBasis, we default to
  * Average.
  */
 return pricing.averagePerCapsuleCost;

}

