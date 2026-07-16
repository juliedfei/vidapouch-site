// This file converts one supplement from the routine into
// a complete checkout item while preserving the internal
// sourcing details for the future manager portal.

import type {
  PouchTiming,
  Supplement,
 } from "@/components/routine-builder/types";
 
 import {
  calculateCustomerPrice,
 } from "@/lib/pricing/calculateCustomerPrice";
 
 import {
  validateSupplement,
 } from "@/lib/pricing/validateSupplement";
 
 import {
  calculateInternalCost,
 } from "@/lib/pricing/calculateInternalCost";
 
 import {
  calculateDisplayedPrice,
 } from "@/lib/pricing/calculateDisplayedPrice";
 
 import type {
  RetailProduct,
 } from "@/lib/pricing/types";
 
 import {
  buildRecommendation,
 } from "@/lib/recommendations/buildRecommendation";
 
 import type {
  ProductOption,
 } from "@/lib/recommendations/productOption";
 
 import {
  findComparisonProducts,
 } from "@/lib/pricing/findComparisonProducts";
 
 import type {
  RecommendationReason,
 } from "@/lib/recommendations/recommendationTypes";
 
 import type {
  CheckoutConfidence,
  CheckoutIssue,
  CheckoutPricingSource,
  CheckoutSelectionSource,
  CheckoutSupplement,
  InternalPricingAudit,
  InternalSourceOption,
 } from "./checkoutTypes";
 
 import type {
  PricingStrategy,
 } from "@/lib/pricing/pricingStrategy";
 
 type BuildSupplementSummaryInput = {
  supplement: Supplement;
  timing: PouchTiming;
  index: number;
  pricingStrategy: PricingStrategy;
 };
 
 export type BuildSupplementSummaryResult = {
  supplement: CheckoutSupplement;
  issues: CheckoutIssue[];
 };
 
 const DAYS_PER_CYCLE = 30;
 
 const CUSTOMER_SELECTED_REASON:
  RecommendationReason = {
    title: "Your selected brand",
 
    description:
      "This brand was selected when you created your routine.",
 
    importance: 100,
  };
 
 const UNAVAILABLE_REASON:
  RecommendationReason = {
    title: "Pricing review needed",
 
    description:
      "VidaPouch could not find a matching product with the current catalog information.",
 
    importance: 100,
  };
 
 function roundCurrency(
  value: number
 ) {
  return Math.round(
    value * 100
  ) / 100;
 }
 
 function roundUnitCost(
  value: number
 ) {
  return Math.round(
    value * 10000
  ) / 10000;
 }
 
 function buildSupplementId(
  supplement: Supplement,
  timing: PouchTiming,
  index: number
 ) {
  if (supplement.id) {
    return supplement.id;
  }
 
  const normalizedName =
    supplement.name
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );
 
  return `${timing}-${normalizedName || "supplement"}-${index}`;
 }
 
 function getRequestedBrand(
  supplement: Supplement
 ): string | undefined {
  if (
    supplement
      .vidapouchChoosesBrand
  ) {
    return undefined;
  }
 
  const customBrand =
    supplement.customBrand
      ?.trim();
 
  if (customBrand) {
    return customBrand;
  }
 
  const selectedBrand =
    supplement.brand
      ?.trim();
 
  return (
    selectedBrand ||
    undefined
  );
 }
 
 function getSelectionSource(
  supplement: Supplement
 ): CheckoutSelectionSource {
  return supplement
    .vidapouchChoosesBrand
    ? "vidapouch"
    : "customer";
 }
 
 function extractCapsulesPerDay(
  dosage: string,
  fallbackServingSize = 1
 ) {
  const normalizedDosage =
    dosage
      .trim()
      .toLowerCase();
 
  const unitPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:capsules?|caps?)\b/,
    /(\d+(?:\.\d+)?)\s*(?:tablets?|tabs?)\b/,
    /(\d+(?:\.\d+)?)\s*(?:softgels?)\b/,
    /(\d+(?:\.\d+)?)\s*(?:pills?)\b/,
  ];
 
  for (
    const pattern of
    unitPatterns
  ) {
    const match =
      normalizedDosage.match(
        pattern
      );
 
    if (!match) {
      continue;
    }
 
    const parsed =
      Number(match[1]);
 
    if (
      Number.isFinite(parsed) &&
      parsed > 0
    ) {
      return parsed;
    }
  }
 
  return Math.max(
    1,
    fallbackServingSize
  );
 }
 
 function normalizeConfidence(
  confidence: unknown
 ): CheckoutConfidence {
  if (
    confidence === "high" ||
    confidence === "medium" ||
    confidence === "low"
  ) {
    return confidence;
  }
 
  if (
    typeof confidence ===
    "number"
  ) {
    if (confidence >= 0.8) {
      return "high";
    }
 
    if (confidence >= 0.5) {
      return "medium";
    }
  }
 
  return "low";
 }
 
 function getPricingSource(
  product: RetailProduct
 ): CheckoutPricingSource {
  const retailer =
    product.retailer
      .trim()
      .toLowerCase();
 
  if (
    retailer === "estimated" ||
    retailer === "catalog"
  ) {
    return "catalog";
  }
 
  if (
    retailer === "inventory" ||
    retailer ===
      "vidapouch inventory"
  ) {
    return "inventory";
  }
 
  if (
    retailer === "wholesale" ||
    retailer === "distributor"
  ) {
    return "wholesale";
  }
 
  return "retailer";
 }
 
 function getLandedBottleCost(
  product: RetailProduct
 ) {
  return (
    product.bottlePrice +
    (
      product
        .estimatedShipping ||
      0
    )
  );
 }
 
 function createPricedProduct(
  product: RetailProduct
 ): RetailProduct {
  return {
    ...product,
 
    bottlePrice:
      getLandedBottleCost(
        product
      ),
  };
 }
 
 /*
 * Converts an already-evaluated ProductOption
 * into the internal option consumed by the
 * comparison card.
 *
 * The score comes from ProductOption. We do
 * not attempt to rescore a raw vendor listing.
 */
 async function buildSourceOption(
  option: ProductOption,
  selectedProduct:
    RetailProduct,
  capsulesPerDay: number
 ): Promise<InternalSourceOption> {
  const product =
    option.representativeProduct;
 
  const landedBottleCost =
    getLandedBottleCost(
      product
    );
 
  const pricedProduct =
    createPricedProduct(
      product
    );
 
  const price =
    calculateCustomerPrice(
      pricedProduct,
      capsulesPerDay
    );
 
  const costPerServing =
    product.servingSize > 0
      ? landedBottleCost /
        (
          product
            .capsulesPerBottle /
          product.servingSize
        )
      : landedBottleCost;
 
  const selected =
    product.retailer ===
      selectedProduct.retailer &&
    product.brand ===
      selectedProduct.brand &&
    product.supplement ===
      selectedProduct.supplement &&
    product.dosage ===
      selectedProduct.dosage &&
    product.bottlePrice ===
      selectedProduct.bottlePrice &&
    product.capsulesPerBottle ===
      selectedProduct
        .capsulesPerBottle;
 
  return {
    product,
 
    costPerCapsule:
      roundUnitCost(
        landedBottleCost /
          product
            .capsulesPerBottle
      ),
 
    costPerServing:
      roundCurrency(
        costPerServing
      ),
 
    estimatedShipping:
      product
        .estimatedShipping ||
      0,
 
    estimatedLandedBottleCost:
      roundCurrency(
        landedBottleCost
      ),
 
    /*
     * Use the product-level displayed cost
     * calculated from all matching listings.
     */
    estimatedMonthlyCost:
      option
        .displayedMonthlyCost,
 
    monthlyCapsuleQuantity:
      price.monthlyCapsules,
 
    bottlesRequired:
      roundUnitCost(
        price.monthlyCapsules /
          product
            .capsulesPerBottle
      ),
 
    /*
     * This is the critical fix.
     *
     * The comparison card now receives the
     * real evaluated product score instead
     * of undefined.
     */
    score:
      option.score,
 
    selected,
 
    rejectionReason:
      selected
        ? undefined
        : "A higher-ranked product was selected.",
  };
 }
 
 async function buildInternalPricingAudit({
  supplement,
  selectedProduct,
  productOptions,
  capsulesPerDay,
  customerMonthlyPrice,
  pricingSource,
 }: {
  supplement: Supplement;
 
  selectedProduct:
    RetailProduct;
 
  productOptions:
    ProductOption[];
 
  capsulesPerDay: number;
 
  customerMonthlyPrice:
    number;
 
  pricingSource:
    CheckoutPricingSource;
 }): Promise<InternalPricingAudit> {
  const shippingCost =
    selectedProduct
      .estimatedShipping ||
    0;
 
  const landedBottleCost =
    getLandedBottleCost(
      selectedProduct
    );
 
  const internalCostPerCapsule =
    landedBottleCost /
    selectedProduct
      .capsulesPerBottle;
 
  const monthlyCapsuleQuantity =
    capsulesPerDay *
    DAYS_PER_CYCLE;
 
  const internalMonthlyCost =
    internalCostPerCapsule *
    monthlyCapsuleQuantity;
 
  const grossMarginAmount =
    customerMonthlyPrice -
    internalMonthlyCost;
 
  const grossMarginPercent =
    customerMonthlyPrice > 0
      ? (
          grossMarginAmount /
          customerMonthlyPrice
        ) * 100
      : 0;
 
  return {
    pricingSource,
 
    calculatedAt:
      new Date()
        .toISOString(),
 
    requestedSupplementName:
      supplement.name.trim(),
 
    requestedBrand:
      getRequestedBrand(
        supplement
      ),
 
    requestedDosage:
      supplement.dosage
        .trim(),
 
    capsulesPerDay,
 
    daysPerCycle:
      DAYS_PER_CYCLE,
 
    monthlyCapsuleQuantity:
      Math.round(
        monthlyCapsuleQuantity
      ),
 
    selectedBottlePrice:
      roundCurrency(
        selectedProduct
          .bottlePrice
      ),
 
    selectedBottleSize:
      selectedProduct
        .capsulesPerBottle,
 
    selectedShippingCost:
      roundCurrency(
        shippingCost
      ),
 
    selectedLandedBottleCost:
      roundCurrency(
        landedBottleCost
      ),
 
    internalCostPerCapsule:
      roundUnitCost(
        internalCostPerCapsule
      ),
 
    internalMonthlyCost:
      roundCurrency(
        internalMonthlyCost
      ),
 
    customerMonthlyPrice:
      roundCurrency(
        customerMonthlyPrice
      ),
 
    grossMarginAmount:
      roundCurrency(
        grossMarginAmount
      ),
 
    grossMarginPercent:
      roundCurrency(
        grossMarginPercent
      ),
 
    selectedRetailer:
      selectedProduct
        .retailer,
 
    selectedProductUrl:
      selectedProduct.url,
 
    alternativesCompared:
      Math.max(
        productOptions.length -
          1,
        0
      ),
 
    sourceOptions:
      await Promise.all(
        productOptions.map(
          (option) =>
            buildSourceOption(
              option,
              selectedProduct,
              capsulesPerDay
            )
        )
      ),
 
    notes: [
      "Retailer and sourcing information are internal and are not intended for the customer checkout.",
 
      "Customer pricing is based on normalized per-unit costs and the estimated monthly capsule quantity.",
 
      "Product scores are calculated once in the recommendation pipeline and passed through to checkout.",
    ],
  };
 }
 
 function buildUnavailableSupplement({
  supplement,
  timing,
  index,
  requestedBrand,
  selectionSource,
 }: BuildSupplementSummaryInput & {
  requestedBrand?: string;
 
  selectionSource:
    CheckoutSelectionSource;
 }): BuildSupplementSummaryResult {
  const supplementId =
    buildSupplementId(
      supplement,
      timing,
      index
    );
 
  const selectedBrand =
    requestedBrand ||
    (
      selectionSource ===
      "vidapouch"
        ? "Pending VidaPouch selection"
        : "Brand unavailable"
    );
 
  const issue:
    CheckoutIssue = {
      supplementId,
 
      code:
        selectionSource ===
        "customer"
          ? "brand_not_found"
          : "recommendation_unavailable",
 
      message:
        selectionSource ===
        "customer"
          ? `${requestedBrand} does not appear to offer ${supplement.name}. Please choose a different brand.`
          : `VidaPouch could not locate a supplier for ${supplement.name}.`,
 
      blocking: true,
    };
 
  const capsulesPerDay =
    extractCapsulesPerDay(
      supplement.dosage
    );
 
  return {
    supplement: {
      id: supplementId,
 
      timing,
 
      name:
        supplement.name
          .trim(),
 
      dosage:
        supplement.dosage
          .trim(),
 
      selectedBrand,
 
      selectionSource,
 
      recommendation: {
        selectedBy:
          selectionSource,
 
        selectedBrand,
 
        customerFacingReasons: [
          UNAVAILABLE_REASON,
        ],
 
        confidence: "low",
 
        alternativesConsidered:
          0,
 
        explanation:
          selectionSource ===
          "vidapouch"
            ? "recommended_by_vidapouch"
            : "customer_selected_brand",
      },
 
      capsulesPerDay,
 
      daysPerCycle:
        DAYS_PER_CYCLE,
 
      monthlyCapsuleQuantity:
        Math.round(
          capsulesPerDay *
            DAYS_PER_CYCLE
        ),
 
      baseCustomerMonthlyPrice:
        0,
 
      customerMonthlyPrice:
        0,
 
      allocatedServiceAmount:
        0,
 
      displayedMonthlyPrice:
        0,
 
      pricingStatus:
        "unavailable",
 
      pricingConfidence:
        "low",
 
      pricingSource:
        "manual",
 
      removable: true,
 
      originalSupplement:
        supplement,
    },
 
    issues: [
      issue,
    ],
  };
 }
 
 export async function buildSupplementSummary({
  supplement,
  timing,
  index,
  pricingStrategy,
 }: BuildSupplementSummaryInput): Promise<BuildSupplementSummaryResult> {
  const requestedBrand =
    getRequestedBrand(
      supplement
    );
 
  const selectionSource =
    getSelectionSource(
      supplement
    );
 
  const validation =
    await validateSupplement({
      supplement:
        supplement.name
          .trim(),
 
      brand:
        requestedBrand,
 
      dosage:
        supplement.dosage
          .trim(),
    });
 
  if (!validation.valid) {
    return buildUnavailableSupplement({
      supplement,
      timing,
      index,
      pricingStrategy,
      requestedBrand,
      selectionSource,
    });
  }
 
  /*
   * These are the validated products for
   * the customer's selected brand, or the
   * products initially selected by VidaPouch.
   */
  const validatedProducts =
    validation.products;
 
  /*
   * Search every brand for the supplement so
   * VidaPouch can compare competing products.
   */
  const comparisonProducts =
    await findComparisonProducts({
      supplement:
        supplement.name
          .trim(),
 
      dosage:
        supplement.dosage
          .trim(),
    });
 
  /*
   * If comparison search fails, fall back to
   * the products returned by validation.
   */
  const products =
    comparisonProducts.length >
    0
      ? comparisonProducts
      : validatedProducts;
 
  const recommendationResult =
    await buildRecommendation(
      products,
      extractCapsulesPerDay(
        supplement.dosage
      )
    );
 
  if (!recommendationResult) {
    return buildUnavailableSupplement({
      supplement,
      timing,
      index,
      pricingStrategy,
      requestedBrand,
      selectionSource,
    });
  }
 
  const {
    recommendation,
    productOptions,
  } = recommendationResult;
 
  const selectedProduct =
    selectionSource ===
    "customer"
      ? validatedProducts[0]
      : recommendation.product;
 
  const capsulesPerDay =
    extractCapsulesPerDay(
      supplement.dosage,
      selectedProduct
        .servingSize
    );
 
  const internalCost =
    calculateInternalCost(
      selectedProduct,
      capsulesPerDay
    );
 
  const displayedPrice =
    calculateDisplayedPrice(
      internalCost,
      pricingStrategy
    );
 
  const pricingSource =
    getPricingSource(
      selectedProduct
    );
 
  const pricingConfidence =
    normalizeConfidence(
      recommendation
        .confidence
    );
 
  const selectedBrand =
    selectedProduct.brand
      .trim();
 
  const customerFacingReasons =
    selectionSource ===
    "customer"
      ? [
          CUSTOMER_SELECTED_REASON,
        ]
      : recommendation.reasons;
 
  const internalAudit =
    await buildInternalPricingAudit({
      supplement,
 
      selectedProduct,
 
      productOptions,
 
      capsulesPerDay,
 
      customerMonthlyPrice:
        displayedPrice
          .customerMonthlyPrice,
 
      pricingSource,
    });
 
  const checkoutSupplement:
    CheckoutSupplement = {
      id:
        buildSupplementId(
          supplement,
          timing,
          index
        ),
 
      timing,
 
      name:
        supplement.name
          .trim(),
 
      dosage:
        supplement.dosage
          .trim(),
 
      selectedBrand,
 
      selectedProduct,
 
      selectionSource,
 
      recommendation: {
        selectedBy:
          selectionSource,
 
        selectedBrand,
 
        customerFacingReasons,
 
        score:
          recommendation.score,
 
        confidence:
          pricingConfidence,
 
        alternativesConsidered:
          Math.max(
            productOptions.length -
              1,
            0
          ),
 
        explanation:
          selectionSource ===
          "vidapouch"
            ? "recommended_by_vidapouch"
            : "customer_selected_brand",
 
        internalAudit,
      },
 
      capsulesPerDay,
 
      daysPerCycle:
        DAYS_PER_CYCLE,
 
      monthlyCapsuleQuantity:
        internalCost
          .monthlyCapsules,
 
      baseCustomerMonthlyPrice:
        displayedPrice
          .customerMonthlyPrice,
 
      customerMonthlyPrice:
        displayedPrice
          .customerMonthlyPrice,
 
      allocatedServiceAmount:
        0,
 
      displayedMonthlyPrice:
        displayedPrice
          .customerMonthlyPrice,
 
      pricingStatus:
        "ready",
 
      pricingConfidence,
 
      pricingSource,
 
      removable: true,
 
      originalSupplement:
        supplement,
    };
 
  return {
    supplement:
      checkoutSupplement,
 
    issues: [],
  };
 }