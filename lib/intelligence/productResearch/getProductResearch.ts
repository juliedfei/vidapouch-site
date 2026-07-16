import { getCachedProductResearch } from "./getCachedProductResearch";

import type {
 ProductResearch,
} from "./productResearchTypes";

import {
 researchProduct,
} from "./researchProduct";

export async function getProductResearch(
 productName: string
): Promise<ProductResearch> {

 const cached =
   await getCachedProductResearch(
     productName
   );

 if (cached) {
   return cached;
 }

 return researchProduct(productName);
}