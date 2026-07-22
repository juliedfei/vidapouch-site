import "server-only";

import type {
 SearchPlan,
} from "@/components/search/types/searchPlan";

import type {
 SearchPouchCostConfidence,
 SearchPouchCostContribution,
 SearchPouchItem,
 SearchPouchPooledPricing,
 SearchPouchPooledPricingLine,
} from "@/components/search/types/searchPouch";

import {
 getVidaPouchPricingConfig,
} from "./getVidaPouchPricingConfig";

type CalculatePooledPouchPricingInput = {
 /*
  * The currently selected plan after any automatic
  * upgrade or customer-requested tier change.
  */
 selectedPlan:
   SearchPlan;

 /*
  * The complete current pouch.
  *
  * Pricing is recalculated from every selected
  * supplement whenever the pouch or plan changes.
  */
 pouchItems:
   SearchPouchItem[];
};

const PLAN_OVERAGE_TOOLTIP =
 "Higher-cost product selections or increased daily quantities may increase your Plan Overage.";

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
 if (
   !Number.isFinite(
     value
   )
 ) {
   return 0;
 }

 return Math.max(
   0,
   value
 );
}

function roundToIncrement({
 value,
 increment,
}: {
 value:
   number;

 increment:
   number;
}) {
 const safeValue =
   clampNonNegative(
     value
   );

 const safeIncrement =
   Number.isFinite(
     increment
   ) &&
   increment >
     0
     ? increment
     : 0.01;

 return roundCurrency(
   Math.ceil(
     (
       safeValue -
       Number.EPSILON
     ) /
       safeIncrement
   ) *
     safeIncrement
 );
}

function getSelectedMonthlyCost(
 item:
   SearchPouchItem
) {
 if (
   item.pricing &&
   Number.isFinite(
     item.pricing
       .monthlyProductCost
   )
 ) {
   return roundCurrency(
     clampNonNegative(
       item.pricing
         .monthlyProductCost
     )
   );
 }

 return roundCurrency(
   clampNonNegative(
     item.monthlyPrice
   )
 );
}

function getBaselineMonthlyCost(
 item:
   SearchPouchItem
) {
 if (
   typeof item
     .baselineMonthlyPrice ===
     "number" &&
   Number.isFinite(
     item
       .baselineMonthlyPrice
   )
 ) {
   return roundCurrency(
     clampNonNegative(
       item
         .baselineMonthlyPrice
     )
   );
 }

 return getSelectedMonthlyCost(
   item
 );
}

function getMonthlyUnitCount(
 item:
   SearchPouchItem
) {
 if (
   Number.isFinite(
     item.monthlyUnitCount
   ) &&
   item.monthlyUnitCount >
     0
 ) {
   return item
     .monthlyUnitCount;
 }

 return Math.max(
   0,
   item.unitsPerDay *
     30
 );
}




function getItemConfidence(
    item:
      SearchPouchItem
   ): SearchPouchCostConfidence {
    /*
     * Pooled pricing needs a reliable monthly cost,
     * not a completed legacy item-level surcharge
     * classification.
     *
     * Search products already carry a monthlyPrice
     * estimate even when the older pricing source
     * field remains "undetermined."
     */
    const selectedMonthlyCost =
      getSelectedMonthlyCost(
        item
      );
   
    if (
      !Number.isFinite(
        selectedMonthlyCost
      ) ||
      selectedMonthlyCost <=
        0
    ) {
      return "undetermined";
    }
   
    return "confirmed";
   }
   





function buildContribution(
 item:
   SearchPouchItem
): SearchPouchCostContribution {
 const baselineMonthlyCost =
   getBaselineMonthlyCost(
     item
   );

 const selectedMonthlyCost =
   getSelectedMonthlyCost(
     item
   );

 return {
   pouchItemId:
     item.id,

   productName:
     item.productName,

   brand:
     item.brand,

   unitsPerDay:
     Math.max(
       0,
       item.unitsPerDay
     ),

   monthlyUnitCount:
     getMonthlyUnitCount(
       item
     ),

   baselineMonthlyCost,

   selectedMonthlyCost,

   quantityCostIncrease:
     roundCurrency(
       clampNonNegative(
         selectedMonthlyCost -
           baselineMonthlyCost
       )
     ),

   pricingSource:
     item.pricing
       ?.source ??
     "undetermined",

   confidence:
     getItemConfidence(
       item
     ),

   reason:
     item.pricing
       ?.reason,
 };
}

function getOverallConfidence(
 contributions:
   SearchPouchCostContribution[]
): SearchPouchCostConfidence {
 if (
   contributions.length ===
   0
 ) {
   return "confirmed";
 }

 const unresolvedCount =
   contributions.filter(
     (contribution) =>
       contribution.confidence ===
       "undetermined"
   ).length;

 if (
   unresolvedCount ===
   0
 ) {
   return "confirmed";
 }

 if (
   unresolvedCount ===
   contributions.length
 ) {
   return "undetermined";
 }

 return "partial";
}

function getUnresolvedItemCount(
 contributions:
   SearchPouchCostContribution[]
) {
 return contributions.filter(
   (contribution) =>
     contribution.confidence ===
     "undetermined"
 ).length;
}

function getSelectedProductCostTotal(
 contributions:
   SearchPouchCostContribution[]
) {
 return roundCurrency(
   contributions.reduce(
     (
       total,
       contribution
     ) =>
       total +
       contribution
         .selectedMonthlyCost,
     0
   )
 );
}

/*
* Builds the two customer-facing price rows:
*
* 1. Selected plan
* 2. One combined Plan Overage
*
* The tooltip explanation is stored separately and
* should be displayed only from the information icon.
*/
function buildPricingLines({
 planName,
 planMonthlyPrice,
 planOverageFee,
}: {
 planName:
   string;

 planMonthlyPrice:
   number;

 planOverageFee:
   number;
}): SearchPouchPooledPricingLine[] {
 return [
   {
     label:
       `${planName} Plan`,

     monthlyAmount:
       roundCurrency(
         planMonthlyPrice
       ),
   },

   {
     label:
       "Plan Overage",

     monthlyAmount:
       roundCurrency(
         planOverageFee
       ),
   },
 ];
}

function buildBaseResult({
 selectedPlan,
 itemCount,
 estimatedMonthlyProductCost,
 confidence,
 unresolvedItemCount,
 pricingVersionId,
 status,
 customerMessage,
}: {
 selectedPlan:
   SearchPlan;

 itemCount:
   number;

 estimatedMonthlyProductCost:
   number;

 confidence:
   SearchPouchCostConfidence;

 unresolvedItemCount:
   number;

 pricingVersionId:
   string | null;

 status:
   SearchPouchPooledPricing["status"];

 customerMessage:
   string;
}): SearchPouchPooledPricing {
 const planMonthlyPrice =
   roundCurrency(
     selectedPlan.monthlyPrice
   );

 return {
   status,

   planKey:
     selectedPlan.id,

   planName:
     selectedPlan.name,

   planMonthlyPrice,

   itemCount,

   estimatedMonthlyProductCost,

   monthlyPriceAdjustment:
     0,

   planOverageFee:
     0,

   planOverageTooltip:
     PLAN_OVERAGE_TOOLTIP,

   totalMonthlyPrice:
     planMonthlyPrice,

   confidence,

   unresolvedItemCount,

   lines:
     buildPricingLines({
       planName:
         selectedPlan.name,

       planMonthlyPrice,

       planOverageFee:
         0,
     }),

   customerMessage,

   pricingVersionId,

   calculatedAt:
     new Date()
       .toISOString(),
 };
}

function buildDisabledResult({
 selectedPlan,
 itemCount,
 estimatedMonthlyProductCost,
 confidence,
 unresolvedItemCount,
 pricingVersionId,
}: {
 selectedPlan:
   SearchPlan;

 itemCount:
   number;

 estimatedMonthlyProductCost:
   number;

 confidence:
   SearchPouchCostConfidence;

 unresolvedItemCount:
   number;

 pricingVersionId:
   string | null;
}): SearchPouchPooledPricing {
 return buildBaseResult({
   selectedPlan,

   itemCount,

   estimatedMonthlyProductCost,

   confidence,

   unresolvedItemCount,

   pricingVersionId,

   status:
     "disabled",

   customerMessage:
     "Plan Overage calculations are not yet active.",
 });
}

function buildUndeterminedResult({
 selectedPlan,
 itemCount,
 estimatedMonthlyProductCost,
 confidence,
 unresolvedItemCount,
 pricingVersionId,
}: {
 selectedPlan:
   SearchPlan;

 itemCount:
   number;

 estimatedMonthlyProductCost:
   number;

 confidence:
   SearchPouchCostConfidence;

 unresolvedItemCount:
   number;

 pricingVersionId:
   string | null;
}): SearchPouchPooledPricing {
 return buildBaseResult({
   selectedPlan,

   itemCount,

   estimatedMonthlyProductCost,

   confidence,

   unresolvedItemCount,

   pricingVersionId,

   status:
     "undetermined",

   customerMessage:
     "The current Plan Overage could not be calculated.",
 });
}

/*
* Calculates one combined Plan Overage for the
* complete current pouch.
*
* Higher-cost products and increased daily
* quantities are intentionally blended into this
* single customer-facing amount.
*/
export async function calculatePooledPouchPricing({
 selectedPlan,
 pouchItems,
}: CalculatePooledPouchPricingInput):
 Promise<SearchPouchPooledPricing> {
 const pricingConfig =
   await getVidaPouchPricingConfig();

 const configuredPlan =
   pricingConfig
     .plans
     .find(
       (plan) =>
         plan.planKey ===
         selectedPlan.id &&
         plan.active
     );

 const contributions =
   pouchItems.map(
     buildContribution
   );

 const itemCount =
   contributions.length;

 const confidence =
   getOverallConfidence(
     contributions
   );

 const unresolvedItemCount =
   getUnresolvedItemCount(
     contributions
   );

 const unbufferedProductCost =
   getSelectedProductCostTotal(
     contributions
   );

 /*
  * The sourcing buffer protects against listing
  * volatility and actual sourcing-cost differences.
  *
  * It remains confidential and is not returned in
  * the customer-facing response.
  */
 const bufferedProductCost =
   roundCurrency(
     unbufferedProductCost *
       (
         1 +
         pricingConfig
           .settings
           .sourcingBufferRate
       )
   );

 const estimatedMonthlyProductCost =
   unbufferedProductCost;

 if (
   !configuredPlan
 ) {
   return buildUndeterminedResult({
     selectedPlan,

     itemCount,

     estimatedMonthlyProductCost,

     confidence,

     unresolvedItemCount:
       Math.max(
         1,
         unresolvedItemCount
       ),

     pricingVersionId:
       pricingConfig
         .pricingVersionId,
   });
 }

 /*
  * The currently selected tier must support the
  * complete pouch. A tier change triggers a fresh
  * calculation using that tier's own allowance.
  */
 if (
   itemCount >
   configuredPlan
     .supplementLimit
 ) {
   return buildBaseResult({
     selectedPlan,

     itemCount,

     estimatedMonthlyProductCost,

     confidence,

     unresolvedItemCount,

     pricingVersionId:
       pricingConfig
         .pricingVersionId,

     status:
       "undetermined",

     customerMessage:
       `The ${configuredPlan.name} Plan supports up to ${configuredPlan.supplementLimit} supplements. Select a larger plan to recalculate.`,
   });
 }

 /*
  * Real overages remain disabled until the database
  * setting is enabled and all active plans have a
  * validated pooled allowance.
  */
 if (
   !pricingConfig
     .settings
     .pooledPlanOveragesEnabled
 ) {
   return buildDisabledResult({
     selectedPlan: {
       ...selectedPlan,

       name:
         configuredPlan.name,

       monthlyPrice:
         configuredPlan.monthlyPrice,

       supplementLimit:
         configuredPlan
           .supplementLimit,
     },

     itemCount,

     estimatedMonthlyProductCost,

     confidence,

     unresolvedItemCount,

     pricingVersionId:
       pricingConfig
         .pricingVersionId,
   });
 }

 const pooledCostAllowance =
   configuredPlan
     .pooledCostAllowance;

 if (
   pooledCostAllowance ===
   null
 ) {
   return buildDisabledResult({
     selectedPlan,

     itemCount,

     estimatedMonthlyProductCost,

     confidence,

     unresolvedItemCount,

     pricingVersionId:
       pricingConfig
         .pricingVersionId,
   });
 }

 /*
  * Do not finalize a Plan Overage when a required
  * product-cost input is still unresolved.
  */
 if (
   unresolvedItemCount >
     0 &&
   (
     pricingConfig
       .settings
       .uncertainPricingBehavior ===
       "confirm-before-checkout" ||
     pricingConfig
       .settings
       .uncertainPricingBehavior ===
       "block-selection"
   )
 ) {
   return buildUndeterminedResult({
     selectedPlan,

     itemCount,

     estimatedMonthlyProductCost,

     confidence,

     unresolvedItemCount,

     pricingVersionId:
       pricingConfig
         .pricingVersionId,
   });
 }

 /*
  * Raw pooled overage:
  *
  * total buffered cost of all selected products at
  * the selected daily quantities
  * minus
  * the confidential allowance for the current tier.
  */
 const rawOverage =
   roundCurrency(
     clampNonNegative(
       bufferedProductCost -
         pooledCostAllowance
     )
   );

 const configuredMonthlyPrice =
   roundCurrency(
     configuredPlan
       .monthlyPrice
   );

 if (
   rawOverage <=
   0
 ) {
   return {
     status:
       "included",

     planKey:
       configuredPlan
         .planKey,

     planName:
       configuredPlan
         .name,

     planMonthlyPrice:
       configuredMonthlyPrice,

     itemCount,

     estimatedMonthlyProductCost,

     monthlyPriceAdjustment:
       0,

     planOverageFee:
       0,

     planOverageTooltip:
       PLAN_OVERAGE_TOOLTIP,

     totalMonthlyPrice:
       configuredMonthlyPrice,

     confidence,

     unresolvedItemCount,

     lines:
       buildPricingLines({
         planName:
           configuredPlan.name,

         planMonthlyPrice:
           configuredMonthlyPrice,

         planOverageFee:
           0,
       }),

     customerMessage:
       `Your current selections are included in the ${configuredPlan.name} Plan.`,

     pricingVersionId:
       pricingConfig
         .pricingVersionId,

     calculatedAt:
       new Date()
         .toISOString(),
   };
 }

 const marginRate =
   Math.min(
     0.95,
     Math.max(
       0,
       pricingConfig
         .settings
         .overageMarginRate
     )
   );

 /*
  * Preserve the target margin on the product cost
  * exceeding the plan allowance.
  */
 const unroundedPlanOverage =
   rawOverage /
   (
     1 -
     marginRate
   );

 const planOverageFee =
   roundToIncrement({
     value:
       unroundedPlanOverage,

     increment:
       pricingConfig
         .settings
         .overageRoundingIncrement,
   });

 const totalMonthlyPrice =
   roundCurrency(
     configuredMonthlyPrice +
       planOverageFee
   );

 return {
   status:
     "adjustment",

   planKey:
     configuredPlan
       .planKey,

   planName:
     configuredPlan
       .name,

   planMonthlyPrice:
     configuredMonthlyPrice,

   itemCount,

   estimatedMonthlyProductCost,

   /*
    * Retained for compatibility with existing API
    * and client validation.
    */
   monthlyPriceAdjustment:
     planOverageFee,

   planOverageFee,

   planOverageTooltip:
     PLAN_OVERAGE_TOOLTIP,

   totalMonthlyPrice,

   confidence,

   unresolvedItemCount,

   lines:
     buildPricingLines({
       planName:
         configuredPlan.name,

       planMonthlyPrice:
         configuredMonthlyPrice,

       planOverageFee,
     }),

   customerMessage:
     `Your current selections result in a monthly Plan Overage of ${planOverageFee.toFixed(
       2
     )}.`,

   pricingVersionId:
     pricingConfig
       .pricingVersionId,

   calculatedAt:
     new Date()
       .toISOString(),
 };
}