import type {
    SearchProductOption,
    SearchVidaPouchPricingTier,
   } from "./searchProductOption";
   
   import type {
    SearchPlan,
   } from "@/components/search/types/searchPlan";
   
   import type {
    SearchPouchPricing,
   } from "@/components/search/types/searchPouch";
   
   type CalculateVidaPouchAddOnInput = {
    product:
      SearchProductOption;
   
    selectedPlan:
      SearchPlan;
   
    /*
     * Retained temporarily for compatibility
     * with code written for the earlier
     * per-product allowance model.
     *
     * This value is intentionally ignored.
     * Final allowances now belong to the entire
     * selected plan and are evaluated only after
     * all pouch items have been combined.
     */
    includedCostAllowanceOverride?:
      number;
   };
   
   function roundCurrency(
    value:
      number
   ) {
    return Math.round(
      (
        value +
        Number.EPSILON
      ) *
        100
    ) / 100;
   }
   
   function clampNonNegative(
    value:
      number
   ) {
    return Math.max(
      0,
      value
    );
   }
   
   function getSelectedUnitsPerDay(
    product:
      SearchProductOption
   ) {
    return Math.max(
      0,
      product.unitsPerDay ??
        product.baselineUnitsPerDay ??
        1
    );
   }
   
   function getBaselineUnitsPerDay(
    product:
      SearchProductOption
   ) {
    return Math.max(
      0,
      product.baselineUnitsPerDay ??
        product.unitsPerDay ??
        1
    );
   }
   
   function getSelectedMonthlyUnitCount(
    product:
      SearchProductOption
   ) {
    return getSelectedUnitsPerDay(
      product
    ) * 30;
   }
   
   function getBaselineMonthlyUnitCount(
    product:
      SearchProductOption
   ) {
    const pricingInput =
      product.vitaPouchPricing;
   
    if (
      pricingInput &&
      pricingInput
        .includedMonthlyUnitCount >
        0
    ) {
      return pricingInput
        .includedMonthlyUnitCount;
    }
   
    return getBaselineUnitsPerDay(
      product
    ) * 30;
   }
   
   function getBaselineMonthlyProductCost(
    product:
      SearchProductOption
   ) {
    const pricingInput =
      product.vitaPouchPricing;
   
    if (
      pricingInput
    ) {
      return roundCurrency(
        clampNonNegative(
          pricingInput
            .includedMonthlyProductCost
        )
      );
    }
   
    if (
      typeof product
        .baselineMonthlyCost ===
        "number" &&
      Number.isFinite(
        product
          .baselineMonthlyCost
      )
    ) {
      return roundCurrency(
        clampNonNegative(
          product
            .baselineMonthlyCost
        )
      );
    }
   
    return roundCurrency(
      clampNonNegative(
        product
          .displayedMonthlyCost
      )
    );
   }
   
   function getSelectedMonthlyProductCost(
    product:
      SearchProductOption
   ) {
    return roundCurrency(
      clampNonNegative(
        product
          .displayedMonthlyCost
      )
    );
   }
   
   function getProductTier(
    product:
      SearchProductOption
   ): SearchVidaPouchPricingTier {
    const configuredTier =
      product
        .vitaPouchPricing
        ?.tier;
   
    if (
      configuredTier
    ) {
      return configuredTier;
    }
   
    return "undetermined";
   }
   
   function buildUndeterminedPricing({
    product,
    selectedPlan,
   }: {
    product:
      SearchProductOption;
   
    selectedPlan:
      SearchPlan;
   }): SearchPouchPricing {
    const selectedMonthlyProductCost =
      getSelectedMonthlyProductCost(
        product
      );
   
    const baselineMonthlyUnitCount =
      getBaselineMonthlyUnitCount(
        product
      );
   
    return {
      status:
        "undetermined",
   
      productTier:
        "undetermined",
   
      /*
       * This cost is still useful to the pooled
       * pouch calculator even though the product
       * has not been fully classified.
       */
      monthlyProductCost:
        selectedMonthlyProductCost,
   
      /*
       * Item-level allowances are no longer used.
       * The confidential allowance belongs to the
       * selected plan as a whole.
       */
      includedCostAllowance:
        0,
   
      includedMonthlyUnitCount:
        baselineMonthlyUnitCount,
   
      /*
       * Final add-ons are never calculated here.
       */
      premiumProductAddOn:
        0,
   
      extraQuantityAddOn:
        0,
   
      totalMonthlyAddOn:
        0,
   
      addOnLines:
        [],
   
      source:
        "undetermined",
   
      reason:
        `This product will contribute ${formatCurrency(
          selectedMonthlyProductCost
        )} to the combined product-cost calculation for the ${selectedPlan.name} Plan. Final pooled pricing is still being confirmed.`,
    };
   }
   
   function formatCurrency(
    value:
      number
   ) {
    return `$${value.toFixed(
      2
    )}`;
   }
   
   /*
   * Temporary compatibility export.
   *
   * Despite the historical function name, this
   * function no longer calculates a customer
   * add-on for an individual product.
   *
   * It prepares product-cost information for the
   * later pooled pouch-level pricing calculation.
   */
   export function calculateVitaPouchAddOn({
    product,
    selectedPlan,
    includedCostAllowanceOverride,
   }: CalculateVidaPouchAddOnInput): SearchPouchPricing {
    /*
     * Explicitly acknowledge the deprecated
     * argument so strict TypeScript settings do
     * not report it as unused.
     */
    void includedCostAllowanceOverride;
   
    const pricingInput =
      product.vitaPouchPricing;
   
    if (
      !pricingInput
    ) {
      return buildUndeterminedPricing({
        product,
        selectedPlan,
      });
    }
   
    const baselineMonthlyUnitCount =
      getBaselineMonthlyUnitCount(
        product
      );
   
    const selectedMonthlyUnitCount =
      getSelectedMonthlyUnitCount(
        product
      );
   
    const baselineMonthlyProductCost =
      getBaselineMonthlyProductCost(
        product
      );
   
    const selectedMonthlyProductCost =
      getSelectedMonthlyProductCost(
        product
      );
   
    const quantityIncreased =
      selectedMonthlyUnitCount >
        baselineMonthlyUnitCount ||
      selectedMonthlyProductCost >
        baselineMonthlyProductCost;
   
    const productTier =
      getProductTier(
        product
      );
   
    return {
      /*
       * A single product cannot be declared
       * included or charged an add-on by itself.
       *
       * Its cost must first be combined with all
       * other pouch items and compared with the
       * selected plan's pooled allowance.
       */
      status:
        "undetermined",
   
      productTier,
   
      /*
       * This is the adjusted monthly cost used in
       * the pooled pouch total.
       */
      monthlyProductCost:
        selectedMonthlyProductCost,
   
      /*
       * The allowance is intentionally zero here.
       * It will be supplied once at the plan level
       * by the pooled pouch calculator.
       */
      includedCostAllowance:
        0,
   
      includedMonthlyUnitCount:
        baselineMonthlyUnitCount,
   
      /*
       * These fields remain zero because the final
       * customer charge must be calculated once for
       * the combined pouch.
       */
      premiumProductAddOn:
        0,
   
      extraQuantityAddOn:
        0,
   
      totalMonthlyAddOn:
        0,
   
      addOnLines:
        [],
   
      source:
        pricingInput.source,
   
      reason:
        quantityIncreased
          ? `The selected quantity increases this product's monthly cost from ${formatCurrency(
              baselineMonthlyProductCost
            )} to ${formatCurrency(
              selectedMonthlyProductCost
            )}. It will be evaluated as part of the combined ${selectedPlan.name} Plan product cost.`
          : `This product contributes ${formatCurrency(
              selectedMonthlyProductCost
            )} to the combined ${selectedPlan.name} Plan product cost. Final pricing is determined from the complete pouch rather than this product alone.`,
    };
   }