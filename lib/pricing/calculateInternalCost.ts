import type { RetailProduct } from "./types";

export type InternalCost = {
 monthlyCapsules: number;

 monthlyBottleFraction: number;

 landedBottleCost: number;

 internalMonthlyCost: number;

 costPerCapsule: number;
};

export function calculateInternalCost(
 product: RetailProduct,
 capsulesPerDay: number
): InternalCost {
 const monthlyCapsules =
   capsulesPerDay * 30;

 const landedBottleCost =
   product.bottlePrice +
   (product.estimatedShipping ?? 0);

 const costPerCapsule =
   landedBottleCost /
   product.capsulesPerBottle;

 const monthlyBottleFraction =
   monthlyCapsules /
   product.capsulesPerBottle;

 const internalMonthlyCost =
   monthlyBottleFraction *
   landedBottleCost;

 return {
   monthlyCapsules,

   monthlyBottleFraction,

   landedBottleCost,

   internalMonthlyCost,

   costPerCapsule,
 };
}
