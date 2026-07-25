"use client";

import {
 useEffect,
 useState,
} from "react";

import {
 searchProducts,
} from "./searchProducts";

import {
 enrichSearchProduct,
} from "./enrichSearchProduct";

import type {
 SearchProductOption,
} from "./searchProductOption";

const SEARCH_DELAY_MS =
 700;

const ENABLE_LIVE_ENRICHMENT =
 true;

const MAX_LIVE_ENRICHMENT_PRODUCTS =
 20;

const ENRICHMENT_CONCURRENCY =
 4;

type SearchErrorCode =
 | "UNSUPPORTED_SEARCH"
 | "MISSING_SEARCH_QUERY"
 | "SEARCH_FAILED"
 | null;

type SearchErrorDetails = {
 code:
   SearchErrorCode;

 message:
   string | null;

 suggestion:
   string | null;
};

type SearchRequestError = Error & {
 code?:
   string;

 status?:
   number;

 suggestion?:
   string;

 response?:
   {
     status?:
       number;

     data?:
       {
         error?:
           string;

         code?:
           string;

         suggestion?:
           string;
       };
   };
};

function normalizeProductIdentityText(
 value:
   string | null |
   undefined
) {
 return (
   value
     ?.toLowerCase()
     .replace(
       /[’']/g,
       ""
     )
     .replace(
       /[^a-z0-9]+/g,
       " "
     )
     .trim() ??
   ""
 );
}

function buildProductIdentity(
 product:
   SearchProductOption
) {
 /*
  * Product options are grouped products rather
  * than individual retailer listings.
  *
  * Brand and normalized product name are therefore
  * more stable than the selected representative
  * retailer listing, which can change after the
  * expanded search compares more sellers.
  */
 return [
   normalizeProductIdentityText(
     product.brand
   ),

   normalizeProductIdentityText(
     product.productName
   ),
 ].join(
   "::"
 );
}

function mergeProductVersions({
 current,
 incoming,
}: {
 current:
   SearchProductOption;

 incoming:
   SearchProductOption;
}): SearchProductOption {
 /*
  * Prefer the expanded product's pricing, vendor
  * comparisons, representative listing, and score.
  *
  * Preserve completed merchant research when the
  * incoming expanded product has not yet been
  * enriched.
  */
 if (
   current.researchStatus ===
     "complete" &&
   incoming.researchStatus !==
     "complete"
 ) {
   return {
     ...incoming,

     researchStatus:
       current.researchStatus,

     form:
       current.form ??
       incoming.form ??
       null,

     dietaryPreferences:
       current.dietaryPreferences,

     thirdPartyTesting:
       current.thirdPartyTesting,

     certifications:
       current.certifications,

     qualityClaims:
       current.qualityClaims,

     verifiedClaims:
       current.verifiedClaims,
   };
 }

 return incoming;
}

function mergeSearchProducts({
 currentProducts,
 incomingProducts,
}: {
 currentProducts:
   SearchProductOption[];

 incomingProducts:
   SearchProductOption[];
}) {
 const productsByIdentity =
   new Map<
     string,
     SearchProductOption
>();

 const orderedIdentities:
   string[] =
   [];

 for (
   const product of
   currentProducts
 ) {
   const identity =
     buildProductIdentity(
       product
     );

   if (
     !productsByIdentity.has(
       identity
     )
   ) {
     orderedIdentities.push(
       identity
     );
   }

   productsByIdentity.set(
     identity,
     product
   );
 }

 for (
   const product of
   incomingProducts
 ) {
   const identity =
     buildProductIdentity(
       product
     );

   const existing =
     productsByIdentity.get(
       identity
     );

   if (
     existing
   ) {
     productsByIdentity.set(
       identity,
       mergeProductVersions({
         current:
           existing,

         incoming:
           product,
       })
     );

     continue;
   }

   orderedIdentities.push(
     identity
   );

   productsByIdentity.set(
     identity,
     product
   );
 }

 return orderedIdentities.flatMap(
   (identity) => {
     const product =
       productsByIdentity.get(
         identity
       );

     return product
       ? [
           product,
         ]
       : [];
   }
 );
}

function mergeEnrichment({
 product,
 enrichment,
}: {
 product:
   SearchProductOption;

 enrichment:
   Awaited<
     ReturnType<
       typeof enrichSearchProduct
>
>;
}): SearchProductOption {
 if (
   enrichment.researchStatus !==
     "complete" ||
   !enrichment
     .dietaryPreferences ||
   !enrichment
     .thirdPartyTesting
 ) {
   console.log(
     "VidaSearch enrichment not merged:",
     {
       productName:
         product.productName,

       researchStatus:
         enrichment
           .researchStatus ??
         null,

       hasDietaryPreferences:
         Boolean(
           enrichment
             .dietaryPreferences
         ),

       hasThirdPartyTesting:
         Boolean(
           enrichment
             .thirdPartyTesting
         ),
     }
   );

   return product;
 }

 const dietaryPreferences =
   enrichment
     .dietaryPreferences;

 const thirdPartyTesting =
   enrichment
     .thirdPartyTesting;

 return {
   ...product,

   researchStatus:
     "complete",

   form:
     enrichment.form ??
     product.form ??
     null,

   dietaryPreferences,

   thirdPartyTesting,

   certifications:
     enrichment.certifications ??
     product.certifications,

   qualityClaims:
     enrichment.qualityClaims ??
     product.qualityClaims,

   verifiedClaims: {
     nsfCertified:
       thirdPartyTesting
         .nsfCertified,

     uspVerified:
       thirdPartyTesting
         .uspVerified,

     thirdPartyTested:
       thirdPartyTesting
         .thirdPartyTested,

     vegan:
       dietaryPreferences
         .vegan,

     nonGmo:
       dietaryPreferences
         .nonGmo,

     glutenFree:
       dietaryPreferences
         .glutenFree,
   },
 };
}

function normalizeErrorText(
 value:
   string
) {
 return value
   .toLowerCase()
   .replace(
     /[’']/g,
     ""
   )
   .trim();
}

function getSearchErrorDetails(
 error:
   unknown
): SearchErrorDetails {
 if (
   !(error instanceof Error)
 ) {
   return {
     code:
       "SEARCH_FAILED",

     message:
       "Unable to search products.",

     suggestion:
       "Please try the search again.",
   };
 }

 const requestError =
   error as
     SearchRequestError;

 const responseData =
   requestError
     .response
     ?.data;

 const rawCode =
   responseData?.code ??
   requestError.code ??
   "";

 const status =
   requestError.status ??
   requestError
     .response
     ?.status ??
   null;

 const rawMessage =
   responseData?.error ??
   requestError.message ??
   "";

 const normalizedMessage =
   normalizeErrorText(
     rawMessage
   );

 const unsupportedByCode =
   rawCode ===
   "UNSUPPORTED_SEARCH";

 const unsupportedByStatus =
   status ===
   422;

 const unsupportedByMessage =
   normalizedMessage.includes(
     "couldnt identify this as a supplement or health goal"
   ) ||
   normalizedMessage.includes(
     "could not identify this as a supplement or health goal"
   ) ||
   normalizedMessage.includes(
     "not recognized as a supplement or health goal"
   ) ||
   normalizedMessage.includes(
     "unsupported search"
   );

 if (
   unsupportedByCode ||
   unsupportedByStatus ||
   unsupportedByMessage
 ) {
   return {
     code:
       "UNSUPPORTED_SEARCH",

     message:
       "We couldn’t identify this as a supplement or health goal.",

     suggestion:
       responseData
         ?.suggestion ??
       requestError
         .suggestion ??
       "Try searching for Magnesium, Mood Support, Sleep, or Vitamin D.",
   };
 }

 if (
   rawCode ===
     "MISSING_SEARCH_QUERY"
 ) {
   return {
     code:
       "MISSING_SEARCH_QUERY",

     message:
       "Enter a supplement or health goal to search.",

     suggestion:
       "Try Magnesium, Sleep, Energy, or Vitamin D.",
   };
 }

 return {
   code:
     "SEARCH_FAILED",

   message:
     "Unable to search products.",

   suggestion:
     "Please try the search again.",
 };
}

async function enrichProducts({
 products,
 signal,
 onProductEnriched,
}: {
 products:
   SearchProductOption[];

 signal:
   AbortSignal;

 onProductEnriched: (
   productIdentity:
     string,

   enrichment:
     Awaited<
       ReturnType<
         typeof enrichSearchProduct
>
>
 ) => void;
}) {
 let nextIndex =
   0;

 console.log(
   "VidaSearch merchant enrichment queue started:",
   {
     productCount:
       products.length,

     concurrency:
       ENRICHMENT_CONCURRENCY,
   }
 );

 async function worker(
   workerNumber:
     number
 ) {
   while (
     nextIndex <
       products.length &&
     !signal.aborted
   ) {
     const currentIndex =
       nextIndex;

     nextIndex +=
       1;

     const product =
       products[
         currentIndex
       ];

     const representativeProduct =
       product
         .representativeProduct;

     const productIdentity =
       buildProductIdentity(
         product
       );

     console.log(
       "VidaSearch merchant enrichment worker started product:",
       {
         workerNumber,

         currentIndex,

         productName:
           product
             .productName,

         brand:
           product.brand,

         retailer:
           representativeProduct
             .retailer,

         shoppingProductId:
           representativeProduct
             .shoppingProductId ??
           null,

         hasImmersiveProductPageToken:
           Boolean(
             representativeProduct
               .immersiveProductPageToken
           ),
       }
     );

     try {
       const enrichment =
         await enrichSearchProduct({
           productName:
             product
               .productName,

           brand:
             product.brand,

           retailer:
             representativeProduct
               .retailer,

           bottlePrice:
             representativeProduct
               .bottlePrice,

           shoppingProductId:
             representativeProduct
               .shoppingProductId,

           immersiveProductPageToken:
             representativeProduct
               .immersiveProductPageToken,

           serpApiImmersiveProductUrl:
             representativeProduct
               .serpApiImmersiveProductUrl,

           signal,
         });

       if (
         signal.aborted
       ) {
         return;
       }

       onProductEnriched(
         productIdentity,
         enrichment
       );

       console.log(
         "VidaSearch merchant enrichment worker completed product:",
         {
           workerNumber,

           currentIndex,

           productName:
             product
               .productName,

           shoppingProductId:
             enrichment
               .shoppingProductId ??
             representativeProduct
               .shoppingProductId ??
             null,

           researchStatus:
             enrichment
               .researchStatus ??
             null,

           form:
             enrichment.form ??
             null,

           dietaryPreferences:
             enrichment
               .dietaryPreferences ??
             null,

           thirdPartyTesting:
             enrichment
               .thirdPartyTesting ??
             null,

           certifications:
             enrichment
               .certifications ??
             [],

           qualityClaims:
             enrichment
               .qualityClaims ??
             [],

           evidenceCount:
             enrichment
               .evidenceCount ??
             0,

           sourceUrl:
             enrichment
               .sourceUrl ??
             null,

           durationMs:
             enrichment
               .durationMs ??
             null,
         }
       );
     } catch (
       error
     ) {
       if (
         signal.aborted
       ) {
         return;
       }

       console.error(
         "VidaSearch merchant enrichment worker failed product:",
         {
           workerNumber,

           currentIndex,

           productName:
             product
               .productName,

           shoppingProductId:
             representativeProduct
               .shoppingProductId ??
             null,

           error:
             error instanceof
               Error
               ? {
                   name:
                     error.name,

                   message:
                     error.message,
                 }
               : error,
         }
       );
     }
   }
 }

 await Promise.all(
   Array.from(
     {
       length:
         Math.min(
           ENRICHMENT_CONCURRENCY,
           products.length
         ),
     },

     (
       _,
       index
     ) =>
       worker(
         index + 1
       )
   )
 );

 console.log(
   "VidaSearch merchant enrichment queue finished:",
   {
     productCount:
       products.length,

     aborted:
       signal.aborted,
   }
 );
}

function getEnrichmentCandidates(
 products:
   SearchProductOption[]
) {
 return products
   .filter(
     (
       product
     ) =>
       product
         .researchStatus !==
         "complete" &&
       product.brand
         .trim()
         .toLowerCase() !==
         "unknown brand" &&
       Boolean(
         product
           .representativeProduct
           .shoppingProductId
       ) &&
       Boolean(
         product
           .representativeProduct
           .immersiveProductPageToken
       )
   )
   .slice(
     0,
     MAX_LIVE_ENRICHMENT_PRODUCTS
   );
}

export function useSearch(
 query:
   string
) {
 const [
   results,
   setResults,
 ] =
   useState<
     SearchProductOption[]
>(
     []
   );

 const [
   loading,
   setLoading,
 ] =
   useState(
     false
   );

 const [
   loadingMore,
   setLoadingMore,
 ] =
   useState(
     false
   );

 const [
   error,
   setError,
 ] =
   useState<
     string | null
>(
     null
   );

 const [
   errorCode,
   setErrorCode,
 ] =
   useState<
     SearchErrorCode
>(
     null
   );

 const [
   errorSuggestion,
   setErrorSuggestion,
 ] =
   useState<
     string | null
>(
     null
   );

 useEffect(
   () => {
     const trimmed =
       query.trim();

     if (
       !trimmed
     ) {
       setResults(
         []
       );

       setError(
         null
       );

       setErrorCode(
         null
       );

       setErrorSuggestion(
         null
       );

       setLoading(
         false
       );

       setLoadingMore(
         false
       );

       return;
     }

     const searchController =
       new AbortController();

     const enrichmentController =
       new AbortController();

     const timeout =
       window.setTimeout(
         async () => {
           let productsForEnrichment:
             SearchProductOption[] =
             [];

           try {
             setLoading(
               true
             );

             setLoadingMore(
               false
             );

             setResults(
               []
             );

             setError(
               null
             );

             setErrorCode(
               null
             );

             setErrorSuggestion(
               null
             );

             console.log(
               "VidaSearch initial product search started:",
               {
                 query:
                   trimmed,
               }
             );

             const initialProducts =
               await searchProducts({
                 supplement:
                   trimmed,

                 phase:
                   "initial",

                 signal:
                   searchController
                     .signal,
               });

             if (
               searchController
                 .signal
                 .aborted
             ) {
               return;
             }

             console.log(
               "VidaSearch initial product search completed:",
               {
                 query:
                   trimmed,

                 productCount:
                   initialProducts
                     .length,
               }
             );

             /*
              * The first marketplace page becomes
              * visible immediately.
              */
             setResults(
               initialProducts
             );

             setLoading(
               false
             );

             productsForEnrichment =
               initialProducts;

             /*
              * Keep the initial products on screen
              * while the full expansion runs.
              */
             setLoadingMore(
               true
             );

             console.log(
               "VidaSearch expanded product search started:",
               {
                 query:
                   trimmed,

                 initialProductCount:
                   initialProducts
                     .length,
               }
             );

             try {
               const expandedProducts =
                 await searchProducts({
                   supplement:
                     trimmed,

                   phase:
                     "expanded",

                   signal:
                     searchController
                       .signal,
                 });

               if (
                 searchController
                   .signal
                   .aborted
               ) {
                 return;
               }

               const mergedProducts =
                 mergeSearchProducts({
                   currentProducts:
                     initialProducts,

                   incomingProducts:
                     expandedProducts,
                 });

               console.log(
                 "VidaSearch expanded product search completed:",
                 {
                   query:
                     trimmed,

                   initialProductCount:
                     initialProducts
                       .length,

                   expandedProductCount:
                     expandedProducts
                       .length,

                   mergedProductCount:
                     mergedProducts
                       .length,
                 }
               );

               productsForEnrichment =
                 mergedProducts;

               setResults(
                 (
                   currentResults
                 ) =>
                   mergeSearchProducts({
                     currentProducts:
                       currentResults,

                     incomingProducts:
                       expandedProducts,
                   })
               );
             } catch (
               expansionError
             ) {
               if (
                 expansionError instanceof
                   DOMException &&
                 expansionError.name ===
                   "AbortError"
               ) {
                 return;
               }

               /*
                * Expansion failure is nonfatal.
                *
                * The customer keeps the fast initial
                * product collection rather than seeing
                * the entire page change to an error.
                */
               console.error(
                 "VidaSearch expanded product search failed:",
                 {
                   query:
                     trimmed,

                   error:
                     expansionError instanceof
                       Error
                       ? {
                           name:
                             expansionError.name,

                           message:
                             expansionError.message,
                         }
                       : expansionError,
                 }
               );
             } finally {
               if (
                 !searchController
                   .signal
                   .aborted
               ) {
                 setLoadingMore(
                   false
                 );
               }
             }

             if (
               searchController
                 .signal
                 .aborted
             ) {
               return;
             }

             if (
               ENABLE_LIVE_ENRICHMENT
             ) {
               const enrichmentCandidates =
                 getEnrichmentCandidates(
                   productsForEnrichment
                 );

               console.log(
                 "VidaSearch controlled merchant enrichment candidates:",
                 enrichmentCandidates.map(
                   (
                     product
                   ) => ({
                     productName:
                       product
                         .productName,

                     retailer:
                       product
                         .representativeProduct
                         .retailer,

                     shoppingProductId:
                       product
                         .representativeProduct
                         .shoppingProductId ??
                       null,
                   })
                 )
               );

               void enrichProducts({
                 products:
                   enrichmentCandidates,

                 signal:
                   enrichmentController
                     .signal,

                 onProductEnriched: (
                   productIdentity,
                   enrichment
                 ) => {
                   setResults(
                     (
                       currentResults
                     ) =>
                       currentResults.map(
                         (
                           product
                         ) =>
                           buildProductIdentity(
                             product
                           ) ===
                           productIdentity
                             ? mergeEnrichment({
                                 product,
                                 enrichment,
                               })
                             : product
                       )
                   );
                 },
               });
             } else {
               console.log(
                 "VidaSearch live merchant enrichment is disabled."
               );
             }
           } catch (
             caughtError
           ) {
             if (
               caughtError instanceof
                 DOMException &&
               caughtError.name ===
                 "AbortError"
             ) {
               return;
             }

             const details =
               getSearchErrorDetails(
                 caughtError
               );

             if (
               details.code ===
                 "UNSUPPORTED_SEARCH"
             ) {
               console.log(
                 "VidaSearch unsupported search handled:",
                 {
                   query:
                     trimmed,

                   code:
                     details.code,
                 }
               );
             } else {
               console.error(
                 "VidaSearch initial product search failed:",
                 {
                   query:
                     trimmed,

                   code:
                     details.code,

                   message:
                     details.message,

                   error:
                     caughtError instanceof
                       Error
                       ? {
                           name:
                             caughtError.name,

                           message:
                             caughtError.message,
                         }
                       : caughtError,
                 }
               );
             }

             setResults(
               []
             );

             setError(
               details.message
             );

             setErrorCode(
               details.code
             );

             setErrorSuggestion(
               details.suggestion
             );
           } finally {
             if (
               !searchController
                 .signal
                 .aborted
             ) {
               setLoading(
                 false
               );
             }
           }
         },
         SEARCH_DELAY_MS
       );

     return () => {
       window.clearTimeout(
         timeout
       );

       searchController
         .abort();

       enrichmentController
         .abort();

       console.log(
         "VidaSearch search and enrichment cancelled:",
         {
           query:
             trimmed,
         }
       );
     };
   },
   [
     query,
   ]
 );

 return {
   results,
   loading,
   loadingMore,
   error,
   errorCode,
   errorSuggestion,

   isUnsupportedSearch:
     errorCode ===
     "UNSUPPORTED_SEARCH",
 };
}
