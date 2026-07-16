import type {
    RetailProduct,
   } from "../types";
   
   import {
    calculateRepresentativePrice,
   } from "./calculateRepresentativePrice";
   
   import {
    selectDisplayedPrice,
   } from "./selectDisplayedPrice";
   
   import type {
    PricingStrategy,
   } from "../pricingStrategy";
   
   export function calculateDisplayedMonthlyCost(
    listings: RetailProduct[],
    capsulesPerDay: number,
    strategy: PricingStrategy
   ) {
   
    const pricing =
      calculateRepresentativePrice(
        listings
      );
   
    const perCapsulePrice =
      selectDisplayedPrice(
        pricing,
        strategy
      );
   
    const monthlyCapsules =
      capsulesPerDay * 30;
   
    return {
   
      monthlyCapsules,
   
      perCapsulePrice,
   
      monthlyCost:
        perCapsulePrice *
        monthlyCapsules,
   
      pricing,
   
    };
   
   }
   