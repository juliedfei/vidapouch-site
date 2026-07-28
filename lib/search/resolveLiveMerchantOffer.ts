import "server-only";


   



const SERP_API_ENDPOINT =
 "https://serpapi.com/search.json";

const LOOKUP_TIMEOUT_MS =
 15000;

type SerpApiStore = {
 name?: unknown;

 title?: unknown;

 link?: unknown;

 price?: unknown;

 extracted_price?: unknown;

 original_price?: unknown;

 extracted_original_price?: unknown;

 details_and_offers?: unknown;

 buying_options?: unknown;

 tag?: unknown;
};

type SerpApiPricingOffer = {
 name?: unknown;

 description?: unknown;

 link?: unknown;

 price?: unknown;

 extracted_price?: unknown;

 original_price?: unknown;

 extracted_original_price?: unknown;

 buying_options?: unknown;

 tag?: unknown;
};

type SerpApiProductResults = {
 title?: unknown;

 stores?: unknown;

 pricing?: unknown;
};

type SerpApiResponse = {
 product_results?: unknown;

 product_result?: unknown;

 error?: unknown;
};






type MerchantOffer = {
 retailer:
   string;

 title:
   string;

 url:
   string;

 price:
   number | null;

 originalPrice:
   number | null;

 details:
   string[];

 tag:
   string;
};

export type ResolveLiveMerchantOfferInput = {
 retailer:
   string;

 productTitle:
   string;




 bottlePrice:
   number | null;

 shoppingProductId:
   string | null;

 immersiveProductPageToken:
   string;
};

export type ResolvedLiveMerchantOffer = {
 url:
   string;

 matchType:
   "immersive-store";

 retailer:
   string;

 productTitle:
   string;


   verifiedBottleUnitCount:
   number | null;


 merchantProductTitle:
   string;

 originalBottlePrice:
   number | null;

 liveBottlePrice:
   number | null;

 originalMerchantPrice:
   number | null;

 priceChanged:
   boolean;

 priceDifferenceAmount:
   number | null;

 priceDifferencePercentage:
   number | null;

 details:
   string[];

 tag:
   string;
};

function stringValue(
 value:
   unknown
) {
 return typeof value ===
   "string"
   ? value.trim()
   : "";
}

function numberValue(
 value:
   unknown
): number | null {
 if (
   typeof value ===
     "number" &&
   Number.isFinite(
     value
   )
 ) {
   return value;
 }

 if (
   typeof value !==
     "string"
 ) {
   return null;
 }

 const parsed =
   Number(
     value.replace(
       /[^0-9.]/g,
       ""
     )
   );

 return Number.isFinite(
   parsed
 )
   ? parsed
   : null;
}

function stringArray(
 value:
   unknown
) {
 if (
   !Array.isArray(
     value
   )
 ) {
   return [];
 }

 return value
   .map(
     stringValue
   )
   .filter(
     Boolean
   );
}


function extractBottleUnitCount(
    values:
      string[]
   ): number | null {
    const searchableText =
      values
        .filter(
          Boolean
        )
        .join(
          " "
        );
   
    const patterns = [
      /\b(\d{1,4})\s*(?:vegetarian\s+capsules?|veggie\s+capsules?|veg\s+capsules?|vegcaps?)\b/i,
   
      /\b(\d{1,4})\s*(?:capsules?|caps)\b/i,
   
      /\b(\d{1,4})\s*(?:tablets?|tabs)\b/i,
   
      /\b(\d{1,4})\s*(?:caplets?)\b/i,
   
      /\b(\d{1,4})\s*(?:soft[\s-]?gels?)\b/i,
   
      /\b(\d{1,4})\s*(?:gummies|gummy)\b/i,
   
      /\b(\d{1,4})\s*(?:servings?)\b/i,
   
      /\b(\d{1,4})\s*(?:count|ct)\b/i,
    ];
   
    for (
      const pattern of
      patterns
    ) {
      const match =
        searchableText.match(
          pattern
        );
   
      if (!match) {
        continue;
      }
   
      const count =
        Number(
          match[1]
        );
   
      if (
        Number.isInteger(
          count
        ) &&
        count >
          0 &&
        count <=
          2000
      ) {
        return count;
      }
    }
   
    return null;
   }
   





function normalizeText(
 value:
   string
) {
 return value
   .toLowerCase()
   .replace(
     /['’]/g,
     ""
   )
   .replace(
     /[^a-z0-9]+/g,
     " "
   )
   .trim();
}





function getValidMerchantUrl(
    value:
      string
   ): URL | null {
    try {
      const parsedUrl =
        new URL(
          value
        );
   
      if (
        parsedUrl.protocol !==
          "https:"
      ) {
        return null;
      }
   
      const hostname =
        parsedUrl.hostname
          .toLowerCase()
          .replace(
            /^www\./,
            ""
          );
   
      if (
        !hostname ||
        hostname ===
          "google.com" ||
        hostname.endsWith(
          ".google.com"
        ) ||
        hostname ===
          "serpapi.com" ||
        hostname.endsWith(
          ".serpapi.com"
        )
      ) {
        return null;
      }
   
      return parsedUrl;
    } catch {
      return null;
    }
   }
   
   function merchantNamesMatch(
    requestedRetailer:
      string,
   
    liveRetailer:
      string
   ) {
    const requested =
      normalizeText(
        requestedRetailer
      );
   
    const live =
      normalizeText(
        liveRetailer
      );
   
    if (
      !requested ||
      !live
    ) {
      return false;
    }
   
    return (
      requested ===
        live ||
      requested.includes(
        live
      ) ||
      live.includes(
        requested
      )
    );
   }






function mapStore(
 store:
   SerpApiStore
): MerchantOffer | null {
 const retailer =
   stringValue(
     store.name
   );

 const url =
   stringValue(
     store.link
   );

 if (
   !retailer ||
   !url
 ) {
   return null;
 }

 return {
   retailer,

   title:
     stringValue(
       store.title
     ),

   url,

   price:
     numberValue(
       store.extracted_price
     ) ??
     numberValue(
       store.price
     ),

   originalPrice:
     numberValue(
       store
         .extracted_original_price
     ) ??
     numberValue(
       store.original_price
     ),

   details: [
     ...stringArray(
       store.details_and_offers
     ),

     ...stringArray(
       store.buying_options
     ),
   ],

   tag:
     stringValue(
       store.tag
     ),
 };
}

function mapPricingOffer(
 offer:
   SerpApiPricingOffer
): MerchantOffer | null {
 const retailer =
   stringValue(
     offer.name
   );

 const url =
   stringValue(
     offer.link
   );

 if (
   !retailer ||
   !url
 ) {
   return null;
 }

 return {
   retailer,

   title:
     stringValue(
       offer.description
     ),

   url,

   price:
     numberValue(
       offer.extracted_price
     ) ??
     numberValue(
       offer.price
     ),

   originalPrice:
     numberValue(
       offer
         .extracted_original_price
     ) ??
     numberValue(
       offer.original_price
     ),

   details:
     stringArray(
       offer.buying_options
     ),

   tag:
     stringValue(
       offer.tag
     ),
 };
}

function extractMerchantOffers(
 data:
   SerpApiResponse
) {
 const pluralProductResults =
   data.product_results &&
   typeof data.product_results ===
     "object"
     ? (
         data.product_results as
           SerpApiProductResults
       )
     : null;

 const singularProductResult =
   data.product_result &&
   typeof data.product_result ===
     "object"
     ? (
         data.product_result as
           SerpApiProductResults
       )
     : null;

 const productResults =
   pluralProductResults ??
   singularProductResult;

 if (!productResults) {
   return {
     productTitle:
       "",

     offers:
       [] as MerchantOffer[],
   };
 }

 const stores =
   Array.isArray(
     productResults.stores
   )
     ? (
         productResults.stores as
           SerpApiStore[]
       )
         .map(
           mapStore
         )
         .filter(
           (
             offer
           ): offer is MerchantOffer =>
             offer !==
             null
         )
     : [];

 const pricing =
   Array.isArray(
     productResults.pricing
   )
     ? (
         productResults.pricing as
           SerpApiPricingOffer[]
       )
         .map(
           mapPricingOffer
         )
         .filter(
           (
             offer
           ): offer is MerchantOffer =>
             offer !==
             null
         )
     : [];

 const uniqueOffers =
   new Map<
     string,
     MerchantOffer
>();

 for (
   const offer of
   [
     ...stores,
     ...pricing,
   ]
 ) {
   const key = [
     normalizeText(
       offer.retailer
     ),

     offer.url,

     offer.price ??
       "",
   ].join(
     "|"
   );

   if (
     !uniqueOffers.has(
       key
     )
   ) {
     uniqueOffers.set(
       key,
       offer
     );
   }
 }

 return {
   productTitle:
     stringValue(
       productResults.title
     ),

   offers:
     Array.from(
       uniqueOffers.values()
     ),
 };
}

function calculatePriceDifference({
 originalPrice,
 livePrice,
}: {
 originalPrice:
   number | null;

 livePrice:
   number | null;
}) {
 if (
   originalPrice ===
     null ||
   originalPrice <=
     0 ||
   livePrice ===
     null ||
   livePrice <=
     0
 ) {
   return {
     amount:
       null,

     percentage:
       null,

     changed:
       false,
   };
 }

 const amount =
   livePrice -
   originalPrice;

 const percentage =
   amount /
   originalPrice;

 return {
   amount,

   percentage,

   changed:
     Math.abs(
       amount
     ) >
       0.5 ||
     Math.abs(
       percentage
     ) >
       0.05,
 };
}

export async function resolveLiveMerchantOffer({
 retailer,
 productTitle,
 bottlePrice,
 shoppingProductId,
 immersiveProductPageToken,
}: ResolveLiveMerchantOfferInput):
 Promise<ResolvedLiveMerchantOffer> {
 const normalizedRetailer =
   retailer.trim();

 const normalizedProductTitle =
   productTitle.trim();

 const normalizedShoppingProductId =
   shoppingProductId
     ?.trim() ||
   null;

 const normalizedToken =
   immersiveProductPageToken
     .trim();

 if (!normalizedRetailer) {
   throw new Error(
     "Retailer is required."
   );
 }

 if (!normalizedToken) {
   throw new Error(
     "The exact Google Shopping product token is missing."
   );
 }






 const apiKey =
   process.env
     .SERPAPI_API_KEY;

 if (!apiKey) {
   throw new Error(
     "SERPAPI_API_KEY is not configured."
   );
 }

 console.log(
   "VidaSearch live merchant lookup started:",
   {
     retailer:
       normalizedRetailer,

     productTitle:
       normalizedProductTitle,

     shoppingProductId:
       normalizedShoppingProductId,

     originalBottlePrice:
       bottlePrice,
   }
 );

 const params =
   new URLSearchParams({
     engine:
       "google_immersive_product",

     page_token:
       normalizedToken,

     more_stores:
       "true",

     api_key:
       apiKey,

     output:
       "json",
   });

 const abortController =
   new AbortController();

 const timeoutId =
   setTimeout(
     () =>
       abortController.abort(),
     LOOKUP_TIMEOUT_MS
   );

 let response:
   Response;

 try {
   response =
     await fetch(
       `${SERP_API_ENDPOINT}?${params.toString()}`,
       {
         method:
           "GET",

         cache:
           "no-store",

         headers: {
           Accept:
             "application/json",
         },

         signal:
           abortController.signal,
       }
     );
 } catch (
   error
 ) {
   if (
     error instanceof Error &&
     error.name ===
       "AbortError"
   ) {
     throw new Error(
       "The exact product lookup took too long. Please try again."
     );
   }

   throw error;
 } finally {
   clearTimeout(
     timeoutId
   );
 }

 let data:
   SerpApiResponse;

 try {
   data =
     (await response.json()) as
       SerpApiResponse;
 } catch {
   throw new Error(
     "SerpApi returned an invalid immersive-product response."
   );
 }

 if (!response.ok) {
   throw new Error(
     stringValue(
       data.error
     ) ||
     `Immersive product lookup failed with status ${response.status}.`
   );
 }

 if (
   typeof data.error ===
     "string" &&
   data.error.trim()
 ) {
   throw new Error(
     data.error.trim()
   );
 }

 const {
   productTitle:
     immersiveProductTitle,

   offers,
 } =
   extractMerchantOffers(
     data
   );




   const matchingOffers =
   offers.filter(
     (offer) => {
       const validUrl =
         getValidMerchantUrl(
           offer.url
         );
  
       return (
         validUrl !==
           null &&
         offer.price !==
           null &&
         offer.price >
           0 &&
         merchantNamesMatch(
           normalizedRetailer,
           offer.retailer
         )
       );
     }
   );






 const selectedOffer =
   [
     ...matchingOffers,
   ].sort(
     (
       left,
       right
     ) => {
       if (
         bottlePrice ===
         null
       ) {
         return 0;
       }

       const leftDifference =
         left.price ===
         null
           ? Number
               .POSITIVE_INFINITY
           : Math.abs(
               left.price -
               bottlePrice
             );

       const rightDifference =
         right.price ===
         null
           ? Number
               .POSITIVE_INFINITY
           : Math.abs(
               right.price -
               bottlePrice
             );

       return (
         leftDifference -
         rightDifference
       );
     }
   )[0];

 if (!selectedOffer) {
   
   
   
    throw new Error(
        `No current purchasable ${normalizedRetailer} offer was found for ${normalizedProductTitle}.`
       );




 }

 const priceDifference =
   calculatePriceDifference({
     originalPrice:
       bottlePrice,

     livePrice:
       selectedOffer.price,
   });

 return {
   url:
     selectedOffer.url,

   matchType:
     "immersive-store",

   retailer:
     selectedOffer.retailer,




     productTitle:
     immersiveProductTitle ||
     normalizedProductTitle,
    
    verifiedBottleUnitCount:
     extractBottleUnitCount([
       immersiveProductTitle,
       normalizedProductTitle,
       selectedOffer.title,
       ...selectedOffer.details,
     ]),
    
    merchantProductTitle:
     selectedOffer.title,




   originalBottlePrice:
     bottlePrice,

   liveBottlePrice:
     selectedOffer.price,

   originalMerchantPrice:
     selectedOffer
       .originalPrice,

   priceChanged:
     priceDifference.changed,

   priceDifferenceAmount:
     priceDifference.amount,

   priceDifferencePercentage:
     priceDifference.percentage,

   details:
     selectedOffer.details,

   tag:
     selectedOffer.tag,
 };
}
