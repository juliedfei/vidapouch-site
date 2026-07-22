"use client";

import {
 useEffect,
 useRef,
 useState,
} from "react";

import type {
 SearchPouchItem,
 SearchPouchPooledPricing,
} from "./types/searchPouch";

import type {
 SearchPlanSelection,
} from "./types/searchPlan";

type UsePooledPouchPricingInput = {
 selectedPlanId:
   SearchPlanSelection;

 pouchItems:
   SearchPouchItem[];
};

type UsePooledPouchPricingResult = {
 pricing:
   SearchPouchPooledPricing | null;

 loading:
   boolean;

 error:
   string | null;

 refresh:
   () => void;
};

type PricingApiErrorResponse = {
 error?:
   unknown;
};

function isRecord(
 value:
   unknown
): value is Record<
 string,
 unknown
>{
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

function isNullableString(
 value:
   unknown
): value is string | null {
 return (
   typeof value ===
     "string" ||
   value ===
     null
 );
}

function isPooledPricingStatus(
 value:
   unknown
): value is SearchPouchPooledPricing["status"] {
 return (
   value ===
     "included" ||
   value ===
     "adjustment" ||
   value ===
     "undetermined" ||
   value ===
     "disabled"
 );
}

function isPricingConfidence(
 value:
   unknown
): value is SearchPouchPooledPricing["confidence"] {
 return (
   value ===
     "confirmed" ||
   value ===
     "partial" ||
   value ===
     "undetermined"
 );
}

function isPricingLine(
 value:
   unknown
): value is SearchPouchPooledPricing["lines"][number] {
 if (
   !isRecord(
     value
   )
 ) {
   return false;
 }

 return (
   typeof value.label ===
     "string" &&
   isFiniteNumber(
     value.monthlyAmount
   ) &&
   (
     value.description ===
       undefined ||
     typeof value.description ===
       "string"
   )
 );
}

function isSearchPouchPooledPricing(
 value:
   unknown
): value is SearchPouchPooledPricing {
 if (
   !isRecord(
     value
   )
 ) {
   return false;
 }

 return (
   isPooledPricingStatus(
     value.status
   ) &&
   typeof value.planKey ===
     "string" &&
   typeof value.planName ===
     "string" &&
   isFiniteNumber(
     value.planMonthlyPrice
   ) &&
   isFiniteNumber(
     value.itemCount
   ) &&
   isFiniteNumber(
     value.estimatedMonthlyProductCost
   ) &&
   isFiniteNumber(
     value.monthlyPriceAdjustment
   ) &&
   isFiniteNumber(
     value.totalMonthlyPrice
   ) &&
   isPricingConfidence(
     value.confidence
   ) &&
   isFiniteNumber(
     value.unresolvedItemCount
   ) &&
   Array.isArray(
     value.lines
   ) &&
   value.lines.every(
     isPricingLine
   ) &&
   typeof value.customerMessage ===
     "string" &&
   isNullableString(
     value.pricingVersionId
   ) &&
   typeof value.calculatedAt ===
     "string"
 );
}

function getApiErrorMessage({
 responseStatus,
 responseBody,
}: {
 responseStatus:
   number;

 responseBody:
   unknown;
}) {
 if (
   isRecord(
     responseBody
   )
 ) {
   const candidate =
     (
       responseBody as
         PricingApiErrorResponse
     ).error;

   if (
     typeof candidate ===
       "string" &&
     candidate.trim().length >
       0
   ) {
     return candidate;
   }
 }

 if (
   responseStatus ===
   409
 ) {
   return "The selected plan no longer supports the current number of supplements.";
 }

 if (
   responseStatus >=
   500
 ) {
   return "Pricing is temporarily unavailable. Please try again.";
 }

 return "The current pouch could not be priced.";
}

/*
* Loads customer-safe pooled pricing from the
* server whenever the current plan or complete
* pouch changes.
*
* The API performs the actual calculation using
* confidential settings stored in Neon.
*/
export function usePooledPouchPricing({
 selectedPlanId,
 pouchItems,
}: UsePooledPouchPricingInput):
 UsePooledPouchPricingResult {
 const [
   pricing,
   setPricing,
 ] =
   useState<
     SearchPouchPooledPricing | null>
(
     null
   );

 const [
   loading,
   setLoading,
 ] =
   useState(
     false
   );

 const [
   error,
   setError,
 ] =
   useState<
     string | null>
(
     null
   );

 const [
   refreshVersion,
   setRefreshVersion,
 ] =
   useState(
     0
   );

 /*
  * Each request receives an increasing identifier.
  *
  * This prevents a slower response from an earlier
  * tier or pouch state from replacing a newer
  * calculation.
  */
 const latestRequestId =
   useRef(
     0
   );

 function refresh() {
   setRefreshVersion(
     (current) =>
       current +
       1
   );
 }

 useEffect(
   () => {
     /*
      * There is no pooled VidaPouch price when no
      * plan is selected.
      */
     if (
       selectedPlanId ===
       null
     ) {
       latestRequestId
         .current +=
         1;

       setPricing(
         null
       );

       setLoading(
         false
       );

       setError(
         null
       );

       return;
     }

     const controller =
       new AbortController();

     const requestId =
       latestRequestId
         .current +
       1;

     latestRequestId.current =
       requestId;

     async function loadPricing() {
       setLoading(
         true
       );

       setError(
         null
       );

       try {
         const response =
           await fetch(
             "/api/vidapouch/pooled-pricing",
             {
               method:
                 "POST",

               headers: {
                 "Content-Type":
                   "application/json",
               },

               body:
                 JSON.stringify({
                   selectedPlanId,

                   /*
                    * Send the complete current pouch.
                    * The server validates every field
                    * before using it.
                    */
                   pouchItems,
                 }),

               cache:
                 "no-store",

               signal:
                 controller.signal,
             }
           );

         let responseBody:
           unknown;

         try {
           responseBody =
             await response
               .json();
         } catch {
           responseBody =
             null;
         }

         /*
          * Ignore responses that belong to an older
          * plan or pouch state.
          */
         if (
           requestId !==
           latestRequestId
             .current
         ) {
           return;
         }

         if (
           !response.ok
         ) {
           throw new Error(
             getApiErrorMessage({
               responseStatus:
                 response.status,

               responseBody,
             })
           );
         }

         if (
           !isSearchPouchPooledPricing(
             responseBody
           )
         ) {
           throw new Error(
             "The pricing service returned an invalid response."
           );
         }

         setPricing(
           responseBody
         );
       } catch (
         requestError
       ) {
         if (
           controller.signal
             .aborted
         ) {
           return;
         }

         if (
           requestId !==
           latestRequestId
             .current
         ) {
           return;
         }

         console.error(
           "Unable to refresh pooled VidaPouch pricing:",
           requestError
         );

         setPricing(
           null
         );

         setError(
           requestError instanceof
             Error
             ? requestError.message
             : "Pricing could not be refreshed."
         );
       } finally {
         if (
           !controller.signal
             .aborted &&
           requestId ===
             latestRequestId
               .current
         ) {
           setLoading(
             false
           );
         }
       }
     }

     void loadPricing();

     return () => {
       controller.abort();
     };
   },
   [
     selectedPlanId,
     pouchItems,
     refreshVersion,
   ]
 );

 return {
   pricing,

   loading,

   error,

   refresh,
 };
}