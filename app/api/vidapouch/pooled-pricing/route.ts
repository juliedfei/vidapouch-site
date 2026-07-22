import {
    NextResponse,
   } from "next/server";
   
   import {
    calculatePooledPouchPricing,
   } from "@/lib/pricing/calculatePooledPouchPricing";
   
   import {
    getSearchPlan,
   } from "@/components/search/types/searchPlan";
   
   import type {
    SearchPlanId,
   } from "@/components/search/types/searchPlan";
   
   import type {
    SearchPouchItem,
    SearchPouchPricing,
    SearchPouchTiming,
    SearchPouchTimingPreference,
   } from "@/components/search/types/searchPouch";
   
   import type {
    SearchProductUnitLabel,
    SearchVitaPouchPricingSource,
    SearchVitaPouchPricingTier,
   } from "@/lib/search/searchProductOption";
   
   export const runtime =
    "nodejs";
   
   export const dynamic =
    "force-dynamic";
   
   const MAX_POUCH_ITEMS =
    8;
   
   const ALLOWED_PLAN_IDS:
    SearchPlanId[] =
    [
      "essential",
      "complete",
      "premier",
    ];
   
   const ALLOWED_TIMINGS:
    SearchPouchTiming[] =
    [
      "morning",
      "evening",
    ];
   
   const ALLOWED_TIMING_PREFERENCES:
    SearchPouchTimingPreference[] =
    [
      "vidapouch",
      "morning",
      "evening",
    ];
   
   const ALLOWED_UNIT_LABELS:
    SearchProductUnitLabel[] =
    [
      "capsule",
      "tablet",
      "caplet",
      "softgel",
      "gummy",
      "serving",
      "unit",
    ];
   
   const ALLOWED_PRICING_TIERS:
    SearchVitaPouchPricingTier[] =
    [
      "standard",
      "premium",
      "undetermined",
    ];
   
   const ALLOWED_PRICING_SOURCES:
    SearchVitaPouchPricingSource[] =
    [
      "retail-estimate",
      "wholesale",
      "catalog",
      "manual",
      "undetermined",
    ];
   
   type PooledPricingRequestBody = {
    selectedPlanId?:
      unknown;
   
    pouchItems?:
      unknown;
   };
   
   function isRecord(
    value:
      unknown
   ): value is Record<
    string,
    unknown
  > {
    return (
      typeof value ===
        "object" &&
      value !==
        null &&
      !Array.isArray(
        value
      )
    );
   }
   
   function isFiniteNumber(
    value:
      unknown
   ): value is number {
    return (
      typeof value ===
        "number" &&
      Number.isFinite(
        value
      )
    );
   }
   
   function isNonNegativeNumber(
    value:
      unknown
   ): value is number {
    return (
      isFiniteNumber(
        value
      ) &&
      value >=
        0
    );
   }
   
   function isPositiveNumber(
    value:
      unknown
   ): value is number {
    return (
      isFiniteNumber(
        value
      ) &&
      value >
        0
    );
   }
   
   function isStringArray(
    value:
      unknown
   ): value is string[] {
    return (
      Array.isArray(
        value
      ) &&
      value.every(
        (entry) =>
          typeof entry ===
          "string"
      )
    );
   }
   
   function isAllowedValue<
    TValue extends string,
   >(
    value:
      unknown,
   
    allowedValues:
      readonly TValue[]
   ): value is TValue {
    return (
      typeof value ===
        "string" &&
      allowedValues.includes(
        value as TValue
      )
    );
   }
   
   function sanitizeOptionalString(
    value:
      unknown
   ) {
    return typeof value ===
      "string"
      ? value
      : null;
   }
   
   function sanitizeOptionalNumber(
    value:
      unknown
   ) {
    return isNonNegativeNumber(
      value
    )
      ? value
      : undefined;
   }
   
   function sanitizePricing(
    value:
      unknown
   ): SearchPouchPricing | undefined {
    if (
      !isRecord(
        value
      )
    ) {
      return undefined;
    }
   
    const allowedStatuses:
      SearchPouchPricing["status"][] =
      [
        "included",
        "add-on",
        "undetermined",
      ];
   
    if (
      !isAllowedValue(
        value.status,
        allowedStatuses
      )
    ) {
      return undefined;
    }
   
    if (
      !isAllowedValue(
        value.productTier,
        ALLOWED_PRICING_TIERS
      )
    ) {
      return undefined;
    }
   
    if (
      !isNonNegativeNumber(
        value.monthlyProductCost
      ) ||
      !isNonNegativeNumber(
        value.includedCostAllowance
      ) ||
      !isNonNegativeNumber(
        value.includedMonthlyUnitCount
      ) ||
      !isNonNegativeNumber(
        value.premiumProductAddOn
      ) ||
      !isNonNegativeNumber(
        value.extraQuantityAddOn
      ) ||
      !isNonNegativeNumber(
        value.totalMonthlyAddOn
      )
    ) {
      return undefined;
    }
   
    if (
      !Array.isArray(
        value.addOnLines
      )
    ) {
      return undefined;
    }
   
    if (
      !isAllowedValue(
        value.source,
        ALLOWED_PRICING_SOURCES
      )
    ) {
      return undefined;
    }
   
    return {
      status:
        value.status,
   
      productTier:
        value.productTier,
   
      monthlyProductCost:
        value.monthlyProductCost,
   
      /*
       * These item-level fields remain only for
       * compatibility with the older pricing model.
       *
       * The final customer adjustment is calculated
       * once for the complete pouch.
       */
      includedCostAllowance:
        value.includedCostAllowance,
   
      includedMonthlyUnitCount:
        value.includedMonthlyUnitCount,
   
      premiumProductAddOn:
        0,
   
      extraQuantityAddOn:
        0,
   
      totalMonthlyAddOn:
        0,
   
      addOnLines:
        [],
   
      source:
        value.source,
   
      reason:
        typeof value.reason ===
        "string"
          ? value.reason
          : undefined,
    };
   }
   
   function sanitizePouchItem(
    value:
      unknown
   ): SearchPouchItem | null {
    if (
      !isRecord(
        value
      )
    ) {
      return null;
    }
   
    if (
      typeof value.id !==
        "string" ||
      value.id.trim().length ===
        0 ||
      typeof value.productName !==
        "string" ||
      typeof value.brand !==
        "string" ||
      typeof value.dosage !==
        "string"
    ) {
      return null;
    }
   
    if (
      !isAllowedValue(
        value.unitLabel,
        ALLOWED_UNIT_LABELS
      )
    ) {
      return null;
    }
   
    if (
      !isPositiveNumber(
        value.unitsPerDay
      ) ||
      !isPositiveNumber(
        value.monthlyUnitCount
      ) ||
      !isNonNegativeNumber(
        value.monthlyPrice
      ) ||
      !isNonNegativeNumber(
        value.bottlePrice
      )
    ) {
      return null;
    }
   
    if (
      typeof value.retailer !==
        "string" ||
      !isStringArray(
        value.certifications
      ) ||
      !isStringArray(
        value.qualityClaims
      )
    ) {
      return null;
    }
   
    if (
      !isAllowedValue(
        value.timing,
        ALLOWED_TIMINGS
      ) ||
      !isAllowedValue(
        value.recommendedTiming,
        ALLOWED_TIMINGS
      ) ||
      !isAllowedValue(
        value.timingPreference,
        ALLOWED_TIMING_PREFERENCES
      ) ||
      typeof value.timingReason !==
        "string"
    ) {
      return null;
    }
   
    const pricing =
      sanitizePricing(
        value.pricing
      );
   
    return {
      id:
        value.id.trim(),
   
      shoppingProductId:
        sanitizeOptionalString(
          value.shoppingProductId
        ),
   
      productName:
        value.productName,
   
      brand:
        value.brand,
   
      dosage:
        value.dosage,
   
      form:
        sanitizeOptionalString(
          value.form
        ),
   
      unitLabel:
        value.unitLabel,
   
      unitsPerDay:
        value.unitsPerDay,
   
      monthlyUnitCount:
        value.monthlyUnitCount,
   
      monthlyPrice:
        value.monthlyPrice,
   
      baselineUnitsPerDay:
        sanitizeOptionalNumber(
          value.baselineUnitsPerDay
        ),
   
      baselineMonthlyPrice:
        sanitizeOptionalNumber(
          value.baselineMonthlyPrice
        ),
   
      pricing,
   
      bottlePrice:
        value.bottlePrice,
   
      retailer:
        value.retailer,
   
      imageUrl:
        sanitizeOptionalString(
          value.imageUrl
        ),
   
      vitaPouchScore:
        isFiniteNumber(
          value.vitaPouchScore
        )
          ? value.vitaPouchScore
          : null,
   
      certifications:
        value.certifications,
   
      qualityClaims:
        value.qualityClaims,
   
      timing:
        value.timing,
   
      recommendedTiming:
        value.recommendedTiming,
   
      timingPreference:
        value.timingPreference,
   
      timingReason:
        value.timingReason,
    };
   }
   
   function sanitizePouchItems(
    value:
      unknown
   ) {
    if (
      !Array.isArray(
        value
      ) ||
      value.length >
        MAX_POUCH_ITEMS
    ) {
      return null;
    }
   
    const sanitizedItems:
      SearchPouchItem[] =
      [];
   
    const seenItemIds =
      new Set<string>();
   
    for (
      const candidate of
      value
    ) {
      const item =
        sanitizePouchItem(
          candidate
        );
   
      if (
        item ===
        null
      ) {
        return null;
      }
   
      if (
        seenItemIds.has(
          item.id
        )
      ) {
        return null;
      }
   
      seenItemIds.add(
        item.id
      );
   
      sanitizedItems.push(
        item
      );
    }
   
    return sanitizedItems;
   }
   
   export async function POST(
    request:
      Request
   ) {
    let body:
      PooledPricingRequestBody;
   
    try {
      body =
        await request.json() as
          PooledPricingRequestBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "The pricing request body is not valid JSON.",
        },
        {
          status:
            400,
        }
      );
    }
   
    if (
      !isAllowedValue(
        body.selectedPlanId,
        ALLOWED_PLAN_IDS
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid VidaPouch plan is required.",
        },
        {
          status:
            400,
        }
      );
    }
   
    /*
     * Resolve the plan on the server rather than
     * trusting a browser-supplied price or limit.
     */
    const selectedPlan =
      getSearchPlan(
        body.selectedPlanId
      );
   
    if (
      selectedPlan ===
      null
    ) {
      return NextResponse.json(
        {
          error:
            "The selected VidaPouch plan could not be found.",
        },
        {
          status:
            400,
        }
      );
    }
   
    const pouchItems =
      sanitizePouchItems(
        body.pouchItems
      );
   
    if (
      pouchItems ===
      null
    ) {
      return NextResponse.json(
        {
          error:
            "One or more pouch items are invalid.",
        },
        {
          status:
            400,
        }
      );
    }
   
    if (
      pouchItems.length >
      selectedPlan
        .supplementLimit
    ) {
      return NextResponse.json(
        {
          error:
            `The ${selectedPlan.name} Plan supports up to ${selectedPlan.supplementLimit} supplements.`,
        },
        {
          status:
            409,
        }
      );
    }
   
    try {
      const pricing =
        await calculatePooledPouchPricing({
          selectedPlan,
   
          pouchItems,
        });
   
      return NextResponse.json(
        pricing,
        {
          status:
            200,
   
          headers: {
            /*
             * This response depends on the customer's
             * current pouch and should not be shared
             * or cached publicly.
             */
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        }
      );
    } catch (
      error
    ) {
      console.error(
        "Unable to calculate pooled VidaPouch pricing:",
        error
      );
   
      return NextResponse.json(
        {
          error:
            "VidaPouch pricing could not be calculated right now.",
        },
        {
          status:
            500,
        }
      );
    }
   }