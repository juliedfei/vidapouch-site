import type { RetailProduct } from "@/lib/pricing/types";

import type { BrandOption } from "./brandOption";

import { calculateCustomerPrice } from "@/lib/pricing/calculateCustomerPrice";

import { scoreProduct } from "./scoreProduct";

function normalizeBrand(
 brand: string
) {
 return brand
   .toLowerCase()
   .replace(/['’]/g, "")
   .replace(/[^a-z0-9]+/g, "")
   .trim();
}

function groupProductsByBrand(
 products: RetailProduct[]
) {
 const groups =
   new Map<
     string,
     RetailProduct[]
>();

 products.forEach((product) => {
   const key =
     normalizeBrand(
       product.brand
     );

   const existing =
     groups.get(key) ?? [];

   existing.push(product);

   groups.set(
     key,
     existing
   );
 });

 return groups;
}

function chooseRepresentativeProduct(
 products: RetailProduct[],
 capsulesPerDay: number
) {
 return [...products].sort(
   (left, right) => {
     const leftPrice =
       calculateCustomerPrice(
         left,
         capsulesPerDay
       ).customerMonthlyPrice;

     const rightPrice =
       calculateCustomerPrice(
         right,
         capsulesPerDay
       ).customerMonthlyPrice;

     if (leftPrice !== rightPrice) {
       return leftPrice - rightPrice;
     }

     return (
       scoreProduct(right).overall -
       scoreProduct(left).overall
     );
   }
 )[0];
}

export function buildBrandOptions(
 products: RetailProduct[],
 capsulesPerDay: number
): BrandOption[] {

 const grouped =
   groupProductsByBrand(
     products
   );

 return Array.from(
   grouped.values()
 ).map((brandProducts) => {

   const representative =
     chooseRepresentativeProduct(
       brandProducts,
       capsulesPerDay
     );

   const monthlyPrices =
     brandProducts.map((product) =>
       calculateCustomerPrice(
         product,
         capsulesPerDay
       ).customerMonthlyPrice
     );

   const lowestMonthlyCost =
     Math.min(...monthlyPrices);

   const highestMonthlyCost =
     Math.max(...monthlyPrices);

   const averageMonthlyCost =
     monthlyPrices.reduce(
       (sum, value) => sum + value,
       0
     ) / monthlyPrices.length;

   const uniqueRetailers =
     new Set(
       brandProducts.map(
         (product) =>
           product.retailer
       )
     );

   const representativeMonthlyCost =
     calculateCustomerPrice(
       representative,
       capsulesPerDay
     ).customerMonthlyPrice;



const productScore = scoreProduct(representative);

const score = {
 overall: productScore.overall * 10,
 value: productScore.value * 10,
 productQuality: productScore.quality * 10,
 dosageFit: 100,
 retailerConfidence: productScore.evidence * 10,
 dataCompleteness: 100,
};







   /*
    * Temporary confidence calculation.
    * We'll replace this later with a
    * smarter recommendation engine.
    */
   const confidenceScore =
     Math.min(
       100,
       60 +
         brandProducts.length * 10 +
         uniqueRetailers.size * 5
     );

   return {

     brand:
       representative.brand,

     representativeProduct:
       representative,

     products:
       brandProducts,

     productsCompared:
       brandProducts.length,

     retailersCompared:
       uniqueRetailers.size,

     lowestMonthlyCost,

     highestMonthlyCost,

     averageMonthlyCost,

     estimatedMonthlyCost:
       representativeMonthlyCost,

     score,

     confidenceScore,

     confidence:
       confidenceScore >= 90
         ? "high"
         : confidenceScore >= 70
         ? "medium"
         : "low",

     selected: false,

     recommended: false,

     reasons: [],
   };

 });

}