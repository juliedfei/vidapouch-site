import type { RetailProduct } from "@/lib/pricing/types";

import type { BrandProfile } from "../brandProfileTypes";

export type RecommendationCandidate = {

 /*
  * Product currently being scored.
  */
 product: RetailProduct;

 /*
  * Brand knowledge from PostgreSQL.
  */
 brandProfile:
   BrandProfile | null;

 /*
  * Every competing product for the
  * same supplement.
  */
 competingProducts:
   RetailProduct[];
};