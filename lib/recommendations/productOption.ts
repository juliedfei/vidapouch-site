import type {
  RetailProduct,
 } from "@/lib/pricing/types";
 
 export type ProductScoreBreakdown = {
  /*
   * Final customer-facing score.
   * Always normalized from 0 to 100.
   */
  overall: number;
 
  /*
   * Value relative to competing products.
   */
  value: number;
 
  /*
   * Overall product quality.
   */
  productQuality: number;
 
  /*
   * How closely the product matches the
   * requested supplement.
   */
  dosageFit: number;
 
  /*
   * Confidence in the vendor listings.
   */
  retailerConfidence: number;
 
  /*
   * Confidence that enough data exists.
   */
  dataCompleteness: number;
 };
 
 export type ProductOption = {
 
  /*
   * Product identity.
   *
   * Example:
   * NOW Vitamin D
   */
  productName: string;
 
  /*
   * Brand.
   *
   * Example:
   * NOW Foods
   */
  brand: string;
 
  /*
   * Representative product selected from
   * the available vendor listings.
   */
  representativeProduct: RetailProduct;
 
  /*
   * Every vendor listing discovered for
   * this product.
   */
  listings: RetailProduct[];
 
  /*
   * Number of listings discovered.
   */
  listingsCompared: number;
 
  /*
   * Number of unique vendors carrying
   * this product.
   */
  vendorsCompared: number;
 
  /*
   * Lowest normalized monthly cost.
   */
  lowestMonthlyCost: number;
 
  /*
   * Highest normalized monthly cost.
   */
  highestMonthlyCost: number;
 
  /*
   * Average normalized monthly cost.
   */
  averageMonthlyCost: number;
 
  /*
   * Median normalized monthly cost.
   *
   * This will become configurable from
   * PricingStrategy.
   */
  medianMonthlyCost: number;
 
  /*
   * Price currently selected according to
   * the PricingStrategy.
   */
  displayedMonthlyCost: number;
 
  /*
   * Customer-facing score.
   */
  score: ProductScoreBreakdown;
 
  /*
   * Confidence score.
   */
  confidenceScore: number;
 
  confidence:
    | "high"
    | "medium"
    | "low";
 
  selected: boolean;
 
  recommended: boolean;
 
  reasons: {
    title: string;
    description: string;
  }[];
 };
 