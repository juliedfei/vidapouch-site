import { PRODUCT_CATALOG } from "./catalog";
import type { RetailProduct } from "./types";

export async function retailerLookup(
 supplement: string,
 brand?: string
): Promise<RetailProduct[]> {

 const matches = PRODUCT_CATALOG.filter((product) => {

   if (
     product.supplement.toLowerCase() !==
     supplement.toLowerCase()
   ) {
     return false;
   }

   if (!brand) return true;

   return (
     product.brand.toLowerCase() ===
     brand.toLowerCase()
   );
 });

 return matches;
}
