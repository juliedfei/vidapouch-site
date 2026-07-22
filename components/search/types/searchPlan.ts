export type SearchPlanId =
 | "essential"
 | "complete"
 | "premier";

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

export const DEFAULT_SEARCH_PLAN_ID:
 SearchPlanId =
   "essential";

export function getSearchPlan(
 planId:
   SearchPlanId
) {
 return (
   SEARCH_PLANS.find(
     (plan) =>
       plan.id ===
       planId
   ) ??
   SEARCH_PLANS[0]
 );
}
