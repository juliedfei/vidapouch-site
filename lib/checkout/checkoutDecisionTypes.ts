import type {
    CatalogListing,
    CatalogProduct,
   } from "@/lib/catalog/types";
   
   export type CheckoutScoreBreakdown = {
    /*
     * All scores use a customer-facing
     * 0–100 scale.
     */
    quality: number;
   
    reviews: number;
   
    reviewConfidence: number;
   
    value: number;
   
    dosageFit: number;
   
    availability: number;
   
    dataCompleteness: number;
   
    overall: number;
   };
   
   export type CheckoutOptionBadge =
    | "BEST_OVERALL"
    | "BEST_VALUE"
    | "STRONGEST_REVIEWS"
    | "PREMIUM_PICK"
    | "PRACTITIONER_GRADE"
    | "THIRD_PARTY_TESTED"
    | "CUSTOMER_SELECTION";
   
   export type CheckoutPurchaseOption = {
    /*
     * The exact product being compared.
     */
    product: CatalogProduct;
   
    /*
     * The best retailer listing currently
     * available for this product.
     */
    selectedListing: CatalogListing | null;
   
    /*
     * Every usable listing discovered for
     * the same product.
     */
    alternativeListings: CatalogListing[];
   
    brandName: string;
   
    productTitle: string;
   
    monthlyUnitQuantity: number;
   
    unitsPerDay: number;
   
    daysPerCycle: number;
   
    costPerUnit: number | null;
   
    estimatedMonthlyCost: number | null;
   
    score: CheckoutScoreBreakdown;
   
    badges: CheckoutOptionBadge[];
   
    strengths: string[];
   
    tradeoffs: string[];
   
    selected: boolean;
   
    recommended: boolean;
   };
   
   export type CheckoutRecommendationExplanation = {
    summary: string;
   
    strengths: string[];
   
    tradeoffs: string[];
   
    confidence: number;
   };
   
   export type CheckoutSupplementDecision = {
    supplementName: string;
   
    requestedDosage?: string;
   
    unitsPerDay: number;
   
    daysPerCycle: number;
   
    monthlyUnitQuantity: number;
   
    /*
     * The option VidaPouch recommends.
     */
    recommendedOption:
      | CheckoutPurchaseOption
      | null;
   
    /*
     * Every brand/product row shown in the
     * checkout comparison table.
     */
    comparisonOptions:
      CheckoutPurchaseOption[];
   
    explanation:
      CheckoutRecommendationExplanation;
   
    status:
      | "ready"
      | "needs_review"
      | "unavailable";
   };