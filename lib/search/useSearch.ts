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

const SEARCH_DELAY_MS = 700;

const ENABLE_LIVE_ENRICHMENT = false;

/*
* Do not launch research for every result
* simultaneously. OpenAI web research can
* be expensive and slow.
*/
const ENRICHMENT_CONCURRENCY = 2;

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
     "VitaSearch enrichment not merged:",
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
     null,

   dietaryPreferences,

   thirdPartyTesting,

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
       dietaryPreferences.vegan,

     nonGmo:
       dietaryPreferences.nonGmo,

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
   enrichment: Awaited<
     ReturnType<
       typeof enrichSearchProduct
>
>
 ) => void;
}) {
 let nextIndex = 0;

 console.log(
   "VitaSearch enrichment queue started:",
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

     nextIndex += 1;

     const product =
       products[currentIndex];

     console.log(
       "VitaSearch enrichment worker started product:",
       {
         workerNumber,

         currentIndex,

         productName:
           product.productName,
       }
     );

     try {
       const enrichment =
         await enrichSearchProduct({
           productName:
             product.productName,

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
         "VitaSearch enrichment worker completed product:",
         {
           workerNumber,

           currentIndex,

           productName:
             product.productName,

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

           evidenceCount:
             enrichment
               .evidenceCount ??
             0,
         }
       );
     } catch (error) {
       if (
         signal.aborted
       ) {
         return;
       }

       console.error(
         "VitaSearch enrichment worker failed product:",
         {
           workerNumber,

           currentIndex,

           productName:
             product.productName,

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

     (_, index) =>
       worker(index + 1)
   )
 );

 console.log(
   "VitaSearch enrichment queue finished:",
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
 ] = useState<
   SearchProductOption[]
>([]);

 const [
   loading,
   setLoading,
 ] = useState(false);

 const [
   error,
   setError,
 ] = useState<
   string | null>
(null);

 useEffect(() => {
   const trimmed =
     query.trim();

   if (!trimmed) {
     setResults([]);
     setError(null);
     setLoading(false);

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
           setLoading(true);
           setError(null);

           console.log(
             "VitaSearch product search started:",
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
               .signal.aborted
           ) {
             return;
           }

           console.log(
             "VitaSearch product search completed:",
             {
               query:
                 trimmed,

               productCount:
                 products.length,

               productNames:
                 products.map(
                   (product) =>
                     product
                       .productName
                 ),
             }
           );

           /*
            * Display products before any
            * OpenAI enrichment begins.
            */
           setResults(
             products
           );




           if (
            ENABLE_LIVE_ENRICHMENT
           ) {
            void enrichProducts({
              products,
           
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
                      (product) =>
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
              "VitaSearch live OpenAI enrichment is disabled."
            );
           }






         } catch (err) {
           if (
             err instanceof
               DOMException &&
             err.name ===
               "AbortError"
           ) {
             return;
           }

           console.error(
             "VitaSearch product search failed:",
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
               .signal.aborted
           ) {
             setLoading(false);
           }
         }
       },
       SEARCH_DELAY_MS
     );

   return () => {
     window.clearTimeout(
       timeout
     );

     searchController.abort();

     enrichmentController.abort();

     console.log(
       "VitaSearch search and enrichment cancelled:",
       {
         query:
           trimmed,
       }
     );
   };
 }, [query]);

 return {
   results,
   loading,
   error,
 };
}