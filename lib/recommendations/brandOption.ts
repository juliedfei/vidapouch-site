import type {
    RetailProduct,
   } from "@/lib/pricing/types";
   
   export type BrandScoreBreakdown = {
    /*
     * Final customer-facing score.
     * Always normalized from 0 to 100.
     */
    overall: number;
   
    /*
     * Price and monthly value compared
     * with the other discovered brands.
     */
    value: number;
   
    /*
     * Strength of the product listing,
     * including package size, dosage,
     * and available product information.
     */
    productQuality: number;
   
    /*
     * How closely the discovered product
     * matches the customer's requested
     * supplement and dosage.
     */
    dosageFit: number;
   
    /*
     * Confidence in the retailer and
     * purchasing information found.
     */
    retailerConfidence: number;
   
    /*
     * Whether the data required for an
     * accurate comparison was available.
     */
    dataCompleteness: number;
   };
   




   export type BrandOption = {
    /*
     * Normalized customer-facing brand
     * name, such as "NOW Foods".
     */
    brand: string;
   
    /*
     * The best purchasable listing found
     * for this brand.
     */
    representativeProduct: RetailProduct;
   
    /*
     * Every qualifying retailer listing
     * found for this brand.
     */
    products: RetailProduct[];
   
    /*
     * Number of unique retailer listings
     * discovered for this brand.
     */
    productsCompared: number;
   
    /*
     * Number of unique retailers that
     * carried this brand.
     */
    retailersCompared: number;
   
    /*
     * Lowest estimated monthly cost found.
     */
    lowestMonthlyCost: number;
   
    /*
     * Highest estimated monthly cost found.
     */
    highestMonthlyCost: number;
   
    /*
     * Average monthly cost across all
     * discovered retailer listings.
     */
    averageMonthlyCost: number;
   
    /*
     * Estimated monthly customer price
     * for the representative product.
     */
    estimatedMonthlyCost: number;
   
    /*
     * Detailed 0–100 recommendation score.
     */
    score: BrandScoreBreakdown;
   
    /*
     * 0–100 confidence that enough
     * information exists to recommend
     * this brand.
     */
    confidenceScore: number;
   
    /*
     * Customer-facing confidence label.
     */
    confidence:
      | "high"
      | "medium"
      | "low";
   
    /*
     * True when this is the brand currently
     * selected.
     */
    selected: boolean;
   
    /*
     * True when VidaPouch recommends it.
     */
    recommended: boolean;
   
    /*
     * Reasons shown to the customer.
     */
    reasons: {
      title: string;
      description: string;
    }[];
   };
   