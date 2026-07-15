import type { RetailProduct } from "./types";

import { SerpApiProvider } from "./providers/serpApiProvider";

export type FindProductsInput = {
 supplement: string;
 brand?: string;
 dosage?: string;
};

const providers = [
 new SerpApiProvider(),
];

export async function findProducts({
 supplement,
 brand,
 dosage,
}: FindProductsInput): Promise<RetailProduct[]> {

 const normalizedSupplement =
   supplement.trim();

 if (!normalizedSupplement) {
   return [];
 }

 const allProducts: RetailProduct[] = [];

 for (const provider of providers) {
   try {
     const result =
       await provider.search({
         supplement: normalizedSupplement,
         brand: brand?.trim() || undefined,
         dosage: dosage?.trim() || undefined,
       });

     allProducts.push(
       ...result.products
     );
   } catch (error) {
     console.error(
       `${provider.name} search failed:`,
       error
     );
   }
 }

 return allProducts;
}