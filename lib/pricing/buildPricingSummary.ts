import type { Supplement } from "@/components/routine-builder/types";

import { retailerLookup } from "./retailerLookup";
import { selectBestProduct } from "./selectBestProduct";
import { calculateMonthlyCost } from "./calculateMonthlyCost";

export type SupplementPricing = {
 supplement: Supplement;

 recommendation: Awaited<
   ReturnType<typeof retailerLookup>
>[number] | null;

 alternatives: Awaited<
   ReturnType<typeof retailerLookup>
>;

 estimatedMonthlyCost: number;
};

export async function buildPricingSummary(
 supplements: Supplement[]
): Promise<SupplementPricing[]> {

 const results: SupplementPricing[] = [];

 for (const supplement of supplements) {

   const products =
     await retailerLookup(
       supplement.name,
       supplement.brand
     );

   const recommendation =
     selectBestProduct(products);

   let estimatedMonthlyCost = 0;

   if (recommendation) {

     estimatedMonthlyCost =
       calculateMonthlyCost({

         bottlePrice:
           recommendation.bottlePrice,

         capsulesPerBottle:
           recommendation.capsulesPerBottle,

         capsulesPerDay: 1,

       }).monthlyCost;

   }

   results.push({

     supplement,

     recommendation,

     alternatives: products,

     estimatedMonthlyCost,

   });

 }

 return results;
}
