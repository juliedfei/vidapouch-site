import type {
    PouchTiming,
    Supplement,
   } from "@/components/routine-builder/types";
   
   import type { RetailProduct } from "@/lib/pricing/types";
   


   import type {
 RecommendationReason,
} from "@/lib/recommendations/recommendationTypes";

import type {
 BrandScoreBreakdown,
} from "@/lib/recommendations/brandOption";



   
   export type CheckoutPlan = {
    morning: Supplement[];
    evening: Supplement[];
   };
   
   export type CheckoutSelectionSource =
    | "customer"
    | "vidapouch";
   
   export type CheckoutPricingStatus =
    | "ready"
    | "needs_review"
    | "unavailable";
   
   export type CheckoutPricingSource =
    | "retailer"
    | "catalog"
    | "inventory"
    | "wholesale"
    | "manual";
   
   export type CheckoutConfidence =
    | "high"
    | "medium"
    | "low";
   
   export type InternalSourceOption = {
    product: RetailProduct;
   
    costPerCapsule: number;
   
    costPerServing: number;
   
    estimatedShipping: number;
   
    estimatedLandedBottleCost: number;
   
    estimatedMonthlyCost: number;
   
    monthlyCapsuleQuantity: number;
   
    bottlesRequired: number;
   
    score?: BrandScoreBreakdown;
   
    selected: boolean;
   
    rejectionReason?: string;
   };
   
   export type InternalPricingAudit = {
    pricingSource: CheckoutPricingSource;
   
    calculatedAt: string;
   
    requestedSupplementName: string;
   
    requestedBrand?: string;
   
    requestedDosage: string;
   
    capsulesPerDay: number;
   
    daysPerCycle: number;
   
    monthlyCapsuleQuantity: number;
   
    selectedBottlePrice: number;
   
    selectedBottleSize: number;
   
    selectedShippingCost: number;
   
    selectedLandedBottleCost: number;
   
    internalCostPerCapsule: number;
   
    internalMonthlyCost: number;
   
    customerMonthlyPrice: number;
   
    grossMarginAmount: number;
   
    grossMarginPercent: number;
   
    selectedRetailer?: string;
   
    selectedProductUrl?: string;
   
    alternativesCompared: number;
   
    sourceOptions: InternalSourceOption[];
   
    notes?: string[];
   };
   
   export type CheckoutRecommendation = {
    selectedBy: CheckoutSelectionSource;
   
    selectedBrand: string;
   
    customerFacingReasons: RecommendationReason[];
   
    score?: BrandScoreBreakdown;
   
    confidence: CheckoutConfidence;
   
    alternativesConsidered: number;
   
    explanation:
      | "customer_selected_brand"
      | "recommended_by_vidapouch";
   
    internalAudit?: InternalPricingAudit;
   };
   
   export type CheckoutSupplement = {
    id: string;
   
    timing: PouchTiming;
   
    name: string;
   
    dosage: string;
   
    /*
     * Brand currently selected for checkout.
     */
    selectedBrand: string;
   
    /*
     * The exact product currently selected.
     *
     * This makes it easy to:
     * - switch brands
     * - recalculate pricing
     * - display retailer information internally
     * - preserve manager portal sourcing
     */
    selectedProduct?: RetailProduct;
   
    selectionSource: CheckoutSelectionSource;
   
    recommendation: CheckoutRecommendation;
   
    capsulesPerDay: number;
   
    daysPerCycle: number;
   
    monthlyCapsuleQuantity: number;
   
    
    
    customerMonthlyPrice: number;

    baseCustomerMonthlyPrice: number;

    allocatedServiceAmount: number;


    displayedMonthlyPrice: number;

   
    pricingStatus: CheckoutPricingStatus;
   
    pricingConfidence: CheckoutConfidence;
   
    pricingSource: CheckoutPricingSource;
   
    removable: boolean;
   
    originalSupplement: Supplement;
   };
   




   
   export type RemovedCheckoutSupplement = {
    supplement: CheckoutSupplement;
   
    removedAt: string;
   };
   
   export type CheckoutPouch = {
    timing: PouchTiming;
   
    label: string;
   
    supplements: CheckoutSupplement[];
   
    supplementSubtotal: number;
   };
   
   export type CheckoutServiceSummary = {
    planType:
        "none"
      | "morning_only"
      | "evening_only"
      | "morning_and_evening";
   
    label: string;
   
    fee: number;
   
    includedServices: string[];
   };
   
   export type CheckoutCostSummary = {
    supplementSubtotal: number;
   
    serviceFee: number;
   
    totalDue: number;
   
    currency: "USD";
   };
   
   export type CheckoutIssue = {
    supplementId?: string;
   
    code:
      | "missing_brand"
      | "brand_not_found"
      | "missing_dosage"
      | "price_unavailable"
      | "recommendation_unavailable"
      | "invalid_dosage";
   
    message: string;
   
    blocking: boolean;
   };
   
   export type CheckoutSummary = {
    morning: CheckoutPouch;
   
    evening: CheckoutPouch;
   
    activeSupplements: CheckoutSupplement[];
   
    removedSupplements: RemovedCheckoutSupplement[];
   
    service: CheckoutServiceSummary;
   
    costs: CheckoutCostSummary;
   
    issues: CheckoutIssue[];
   
    canCheckout: boolean;
   
    calculatedAt: string;
   };
   