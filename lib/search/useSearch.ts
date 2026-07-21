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

/*
* Controlled merchant-page test.
*
* Only one uncached product is enriched
* during each search.
*/



const ENABLE_LIVE_ENRICHMENT =
 true;

/*
* Enrich every uncached product returned
* in the current 20-card search result.
*/
const MAX_LIVE_ENRICHMENT_PRODUCTS =
 20;

/*
* Process four products concurrently.
*
* All 20 are queued, but we avoid sending
* 20 simultaneous requests to SerpApi and
* merchant websites.
*/
const ENRICHMENT_CONCURRENCY =
 4;




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
   productName: string,

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
   workerNumber: number
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
         product.productName,
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

export function useSearch(
 query: string
) {
 const [
   results,
   setResults,
 ] =
   useState<
     SearchProductOption[]>
([]);

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
(null);

 useEffect(
   () => {
     const trimmed =
       query.trim();

     if (!trimmed) {
       setResults(
         []
       );

       setError(
         null
       );

       setLoading(
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
           try {
             setLoading(
               true
             );

             setError(
               null
             );

             console.log(
               "VidaSearch product search started:",
               {
                 query:
                   trimmed,
               }
             );

             const products =
               await searchProducts({
                 supplement:
                   trimmed,

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
               "VidaSearch product search completed:",
               {
                 query:
                   trimmed,

                 productCount:
                   products
                     .length,

                 productNames:
                   products.map(
                     (
                       product
                     ) =>
                       product
                         .productName
                   ),
               }
             );

             /*
              * Display all products immediately.
              *
              * The enrichment queue below does
              * not filter the visible results.
              */
             setResults(
               products
             );

             if (
               ENABLE_LIVE_ENRICHMENT
             ) {
               const enrichmentCandidates =
                 products
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
                   productName,
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
                           product
                             .productName ===
                           productName
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
             err
           ) {
             if (
               err instanceof
                 DOMException &&
               err.name ===
                 "AbortError"
             ) {
               return;
             }

             console.error(
               "VidaSearch product search failed:",
               {
                 query:
                   trimmed,

                 error:
                   err instanceof
                     Error
                     ? {
                         name:
                           err.name,

                         message:
                           err.message,
                       }
                     : err,
               }
             );

             setError(
               "Unable to search products."
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
   error,
 };
}