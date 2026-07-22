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
 SearchPlan[] = [
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
* someone in VidaPouch when the page loads.
*/
export const DEFAULT_SEARCH_PLAN_ID:
 SearchPlanSelection =
   null;

export function getSearchPlan(
 planId:
   SearchPlanSelection
): SearchPlan | null {
 if (
   planId === null
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
* Returns the smallest plan capable of
* supporting the selected supplement count.
*
* A count of zero does not require a plan.
* More than eight supplements is not
* supported by the current plan structure.
*/
export function getRequiredSearchPlan(
 supplementCount:
   number
): SearchPlan | null {
 if (
   supplementCount <= 0
 ) {
   return null;
 }

 return (
   SEARCH_PLANS.find(
     (plan) =>
       supplementCount <=
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
   currentIndex < 0
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
   plan === null
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
 if (
   plan === null
 ) {
   return (
     supplementCount ===
     0
   );
 }

 return (
   supplementCount <=
   plan.supplementLimit
 );
}
