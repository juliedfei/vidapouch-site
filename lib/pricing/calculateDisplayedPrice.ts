import type { InternalCost } from "./calculateInternalCost";
import type { PricingStrategy } from "./pricingStrategy";

export type DisplayedPrice = {
 customerMonthlyPrice: number;

 allocatedServiceAmount: number;

 supplementMarginAmount: number;

 inventoryBufferAmount: number;
};

function roundCurrency(value: number) {
 return Math.round(value * 100) / 100;
}

export function calculateDisplayedPrice(
 internalCost: InternalCost,
 strategy: PricingStrategy,
 allocatedServiceAmount = 0
): DisplayedPrice {
 const inventoryBufferAmount =
   internalCost.internalMonthlyCost *
   strategy.inventoryBufferPercent;

 const supplementMarginAmount =
   internalCost.internalMonthlyCost *
   strategy.supplementMarginPercent;

 /*
  * Concierge allocation is calculated by
  * the checkout once it knows how many
  * supplements are in the customer's order.
  *
  * This function simply receives the
  * allocation for THIS supplement.
  */

 const customerMonthlyPrice =
   internalCost.internalMonthlyCost +
   inventoryBufferAmount +
   supplementMarginAmount +
   allocatedServiceAmount;

 return {
   customerMonthlyPrice: roundCurrency(
     customerMonthlyPrice
   ),

   allocatedServiceAmount: roundCurrency(
     allocatedServiceAmount
   ),

   supplementMarginAmount: roundCurrency(
     supplementMarginAmount
   ),

   inventoryBufferAmount: roundCurrency(
     inventoryBufferAmount
   ),
 };
}