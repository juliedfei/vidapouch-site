export type SearchPlanId =
 | "essential"
 | "complete"
 | "premier";

export type SearchPlanSelection =
 SearchPlanId | null;

export type SearchPlan = {
 id:
   SearchPlanId;

 name:
   string;

 monthlyPrice:
   number;

 supplementLimit:
   number;

 description:
   string;

 selectionDescription:
   string;
};

export const SEARCH_PLANS:
 SearchPlan[] =
 [
   {
     id:
       "essential",

     name:
       "Essential",

     monthlyPrice:
       59.99,

     supplementLimit:
       3,

     description:
       "Up to 3 supplements",

     selectionDescription:
       "Standard selections included",
   },

   {
     id:
       "complete",

     name:
       "Complete",

     monthlyPrice:
       79.99,

     supplementLimit:
       5,

     description:
       "Up to 5 supplements",

     selectionDescription:
       "More brand flexibility included",
   },

   {
     id:
       "premier",

     name:
       "Premier",

     monthlyPrice:
       99.99,

     supplementLimit:
       8,

     description:
       "Up to 8 supplements",

     selectionDescription:
       "Expanded premium access",
   },
 ];

/*
* VidaSearch does not automatically enroll
* someone in VidaPouch when the page first loads.
*/
export const DEFAULT_SEARCH_PLAN_ID:
 SearchPlanSelection =
 null;

export function getSearchPlan(
 planId:
   SearchPlanSelection
): SearchPlan | null {
 if (
   planId ===
   null
 ) {
   return null;
 }

 return (
   SEARCH_PLANS.find(
     (plan) =>
       plan.id ===
       planId
   ) ??
   null
 );
}

/*
* Returns the smallest plan capable of supporting
* the current number of selected supplements.
*
* Zero supplements does not require a plan.
*
* More than eight supplements is not supported by
* the current standard plan structure and should
* be handled by the future custom-plan flow.
*/
export function getRequiredSearchPlan(
 supplementCount:
   number
): SearchPlan | null {
 const normalizedCount =
   Math.max(
     0,
     Math.floor(
       supplementCount
     )
   );

 if (
   normalizedCount ===
   0
 ) {
   return null;
 }

 return (
   SEARCH_PLANS.find(
     (plan) =>
       normalizedCount <=
       plan.supplementLimit
   ) ??
   null
 );
}

export function getNextSearchPlan(
 currentPlanId:
   SearchPlanId
): SearchPlan | null {
 const currentIndex =
   SEARCH_PLANS.findIndex(
     (plan) =>
       plan.id ===
       currentPlanId
   );

 if (
   currentIndex <
   0
 ) {
   return null;
 }

 return (
   SEARCH_PLANS[
     currentIndex + 1
   ] ??
   null
 );
}

export function getPreviousSearchPlan(
 currentPlanId:
   SearchPlanId
): SearchPlan | null {
 const currentIndex =
   SEARCH_PLANS.findIndex(
     (plan) =>
       plan.id ===
       currentPlanId
   );

 if (
   currentIndex <=
   0
 ) {
   return null;
 }

 return (
   SEARCH_PLANS[
     currentIndex - 1
   ] ??
   null
 );
}

export function isSearchPlanAtCapacity({
 plan,
 supplementCount,
}: {
 plan:
   SearchPlan | null;

 supplementCount:
   number;
}) {
 if (
   plan ===
   null
 ) {
   return false;
 }

 return (
   supplementCount >=
   plan.supplementLimit
 );
}

export function canSearchPlanSupportCount({
 plan,
 supplementCount,
}: {
 plan:
   SearchPlan | null;

 supplementCount:
   number;
}) {
 const normalizedCount =
   Math.max(
     0,
     Math.floor(
       supplementCount
     )
   );

 if (
   plan ===
   null
 ) {
   return (
     normalizedCount ===
     0
   );
 }

 return (
   normalizedCount <=
   plan.supplementLimit
 );
}

/*
* Describes how the currently selected plan relates
* to the number of supplements in the pouch.
*/
export type SearchPlanCapacityStatus =
 | "no-plan-needed"
 | "supported"
 | "upgrade-required"
 | "custom-plan-required";

export function getSearchPlanCapacityStatus({
 selectedPlanId,
 supplementCount,
}: {
 selectedPlanId:
   SearchPlanSelection;

 supplementCount:
   number;
}): SearchPlanCapacityStatus {
 const normalizedCount =
   Math.max(
     0,
     Math.floor(
       supplementCount
     )
   );

 if (
   normalizedCount ===
   0
 ) {
   return "no-plan-needed";
 }

 const requiredPlan =
   getRequiredSearchPlan(
     normalizedCount
   );

 if (
   requiredPlan ===
   null
 ) {
   return "custom-plan-required";
 }

 const selectedPlan =
   getSearchPlan(
     selectedPlanId
   );

 if (
   selectedPlan ===
   null ||
   !canSearchPlanSupportCount({
     plan:
       selectedPlan,

     supplementCount:
       normalizedCount,
   })
 ) {
   return "upgrade-required";
 }

 return "supported";
}

/*
* Resolves the plan that should be used after the
* pouch supplement count changes.
*
* Important pricing behavior:
*
* - Adding a fourth or sixth supplement upgrades
*   the customer to the smallest valid plan.
*
* - Removing supplements does not silently downgrade
*   a customer who intentionally selected a larger
*   tier.
*
* - A customer may still manually select a smaller
*   tier later, provided that tier supports the
*   current supplement count.
*
* - More than eight supplements returns null because
*   the future custom-plan flow must handle it.
*/
export function resolveSearchPlanForSupplementCount({
 selectedPlanId,
 supplementCount,
 automaticallySelectRequiredPlan = true,
 automaticallyDowngrade = false,
}: {
 selectedPlanId:
   SearchPlanSelection;

 supplementCount:
   number;

 automaticallySelectRequiredPlan?:
   boolean;

 automaticallyDowngrade?:
   boolean;
}): SearchPlan | null {
 const normalizedCount =
   Math.max(
     0,
     Math.floor(
       supplementCount
     )
   );

 if (
   normalizedCount ===
   0
 ) {
   return null;
 }

 const requiredPlan =
   getRequiredSearchPlan(
     normalizedCount
   );

 /*
  * More than eight supplements requires the
  * future custom-plan builder.
  */
 if (
   requiredPlan ===
   null
 ) {
   return null;
 }

 const selectedPlan =
   getSearchPlan(
     selectedPlanId
   );

 if (
   selectedPlan ===
   null
 ) {
   return automaticallySelectRequiredPlan
     ? requiredPlan
     : null;
 }

 /*
  * The current selected tier cannot support the
  * pouch, so move to the smallest tier that can.
  */
 if (
   !canSearchPlanSupportCount({
     plan:
       selectedPlan,

     supplementCount:
       normalizedCount,
   })
 ) {
   return requiredPlan;
 }

 /*
  * Preserve an intentionally selected higher tier
  * unless the caller explicitly requests automatic
  * downgrading.
  */
 if (
   !automaticallyDowngrade
 ) {
   return selectedPlan;
 }

 return requiredPlan;
}

/*
* Validates a customer-requested tier change before
* applying it.
*
* The pooled calculator should be rerun using the
* returned plan. It must not carry forward a price
* adjustment calculated for the previous tier.
*/
export function resolveRequestedSearchPlanChange({
 requestedPlanId,
 supplementCount,
}: {
 requestedPlanId:
   SearchPlanSelection;

 supplementCount:
   number;
}): SearchPlan | null {
 const normalizedCount =
   Math.max(
     0,
     Math.floor(
       supplementCount
     )
   );

 if (
   requestedPlanId ===
   null
 ) {
   return normalizedCount ===
     0
     ? null
     : getRequiredSearchPlan(
         normalizedCount
       );
 }

 const requestedPlan =
   getSearchPlan(
     requestedPlanId
   );

 if (
   requestedPlan ===
   null
 ) {
   return null;
 }

 if (
   canSearchPlanSupportCount({
     plan:
       requestedPlan,

     supplementCount:
       normalizedCount,
   })
 ) {
   return requestedPlan;
 }

 /*
  * A customer cannot select a tier that is too
  * small for the current pouch. Return the smallest
  * valid tier instead.
  */
 return getRequiredSearchPlan(
   normalizedCount
 );
}
