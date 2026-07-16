import type {
    RetailProduct,
   } from "@/lib/pricing/types";
   
   import type {
    ProductResearch,
   } from "@/lib/intelligence/productResearch/productResearchTypes";
   
   import type {
    PricingStrategy,
   } from "@/lib/pricing/pricingStrategy";
   
   export type ProductScoreInput = {
   
    representativeProduct: RetailProduct;
   
    listings: RetailProduct[];
   
    research: ProductResearch;
   
    pricingStrategy: PricingStrategy;
   
   };
   