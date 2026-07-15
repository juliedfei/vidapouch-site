import type { Supplement } from "@/components/routine-builder/types";

export type PriceEstimate = {
 estimatedMonthlyCost: number;
 estimatedBottlePrice: number;
 estimatedBottleCount: number;

 estimatedServingsPerBottle: number;
 estimatedDailyServings: number;

 confidence: "high" | "medium" | "low";

 source:
   | "catalog"
   | "estimated"
   | "retailer";

 notes?: string;
};

export function estimateSupplementPrice(
 supplement: Supplement
): PriceEstimate {

 const monthlyCost =
   supplement.monthlyPrice ?? 0;

 return {
   estimatedMonthlyCost: monthlyCost,

   estimatedBottlePrice:
     monthlyCost * 2,

   estimatedBottleCount: 1,

   estimatedServingsPerBottle: 60,

   estimatedDailyServings: 1,

   confidence:
     supplement.monthlyPrice != null
       ? "high"
       : "low",

   source:
     supplement.monthlyPrice != null
       ? "catalog"
       : "estimated",

   notes:
     supplement.monthlyPrice == null
       ? "Price estimated until retailer lookup is available."
       : undefined,
 };
}
