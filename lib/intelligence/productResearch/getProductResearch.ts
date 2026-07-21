import { getCachedProductResearch } from "./getCachedProductResearch";

import type {
 ProductResearch,
} from "./productResearchTypes";

import {
 researchProduct,
} from "./researchProduct";

import {
 saveProductResearch,
} from "./saveProductResearch";

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

 const research =
   await researchProduct(
     productName
   );

 await saveProductResearch(
   productName,
   research
 );

 return research;
}
