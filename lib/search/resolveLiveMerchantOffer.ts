import "server-only";

const SERP_API_ENDPOINT =
 "https://serpapi.com/search.json";

const PRIMARY_LOOKUP_TIMEOUT_MS =
 7000;

const FALLBACK_SEARCH_TIMEOUT_MS =
 5000;

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
 stores_next_page_token?: unknown;
};

type SerpApiImmersiveResponse = {
 product_results?: unknown;
 product_result?: unknown;
 error?: unknown;
};

type SerpApiSeller = {
 name?: unknown;
 title?: unknown;
 link?: unknown;
 price?: unknown;
 extracted_price?: unknown;
 original_price?: unknown;
 extracted_original_price?: unknown;
 details?: unknown;
 tag?: unknown;
};

type SerpApiGoogleProductResponse = {
 product_results?: unknown;
 sellers_results?: {
 online_sellers?: unknown;
 } | unknown;
 error?: unknown;
};

type SerpApiShoppingResult = {
 title?: unknown;
 source?: unknown;
 price?: unknown;
 extracted_price?: unknown;
 old_price?: unknown;
 extracted_old_price?: unknown;
 product_link?: unknown;
 product_id?: unknown;
 immersive_product_page_token?: unknown;
 serpapi_immersive_product_api?: unknown;
};

type SerpApiShoppingResponse = {
 shopping_results?: unknown;
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

 source:
 "immersive" | "google-product" | "shopping-direct";
};

type OfferBundle = {
 productTitle:
 string;

 offers:
 MerchantOffer[];

 resolutionMethod:
 ResolvedLiveMerchantOffer["matchType"];
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
 string | null;

 serpApiImmersiveProductUrl?:
 string | null;
};

export type ResolvedLiveMerchantOffer = {
 url:
 string;

 matchType:
 "immersive-store" |
 "google-product-seller" |
 "shopping-fallback";

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

function unwrapGoogleRedirect(
 parsedUrl:
 URL
): URL | null {
 const hostname =
 parsedUrl.hostname
   .toLowerCase()
   .replace(
 /^www\./,
 ""
   );

 if (
 hostname !==
 "google.com" &&
 !hostname.endsWith(
 ".google.com"
   )
 ) {
 return parsedUrl;
 }

 const redirectKeys = [
 "q",
 "url",
 "adurl",
 ];

 for (
 const key of
 redirectKeys
 ) {
 const target =
 parsedUrl.searchParams.get(
 key
   );

 if (!target) {
 continue;
   }

 try {
 return new URL(
 target
   );
   } catch {
 // Ignore malformed redirect targets.
   }
 }

 return null;
}

function getValidMerchantUrl(
 value:
 string
): URL | null {
 try {
 let parsedUrl =
 new URL(
 value
   );

 const unwrapped =
 unwrapGoogleRedirect(
 parsedUrl
   );

 if (!unwrapped) {
 return null;
 }

 parsedUrl =
 unwrapped;

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

function titleSimilarity(
 requestedTitle:
 string,

 candidateTitle:
 string
) {
 const requestedTokens =
 new Set(
 normalizeText(
 requestedTitle
   )
   .split(
 " "
   )
   .filter(
 token =>
 token.length >=
 3
   )
 );

 const candidateTokens =
 new Set(
 normalizeText(
 candidateTitle
   )
   .split(
 " "
   )
   .filter(
 token =>
 token.length >=
 3
   )
 );

 if (
 requestedTokens.size ===
 0 ||
 candidateTokens.size ===
 0
 ) {
 return 0;
 }

 let overlap =
 0;

 for (
 const token of
 requestedTokens
 ) {
 if (
 candidateTokens.has(
 token
   )
 ) {
 overlap +=
 1;
   }
 }

 return overlap /
 requestedTokens.size;
}

function mapStore(
 store:
 SerpApiStore
): MerchantOffer | null {
 const retailer =
 stringValue(
 store.name
   );

 const rawUrl =
 stringValue(
 store.link
   );

 const validUrl =
 getValidMerchantUrl(
 rawUrl
   );

 if (
 !retailer ||
 !validUrl
 ) {
 return null;
 }

 return {
 retailer,

 title:
 stringValue(
 store.title
   ),

 url:
 validUrl.toString(),

 price:
 numberValue(
 store.extracted_price
   ) ??
 numberValue(
 store.price
   ),

 originalPrice:
 numberValue(
 store.extracted_original_price
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

 source:
 "immersive",
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

 const rawUrl =
 stringValue(
 offer.link
   );

 const validUrl =
 getValidMerchantUrl(
 rawUrl
   );

 if (
 !retailer ||
 !validUrl
 ) {
 return null;
 }

 return {
 retailer,

 title:
 stringValue(
 offer.description
   ),

 url:
 validUrl.toString(),

 price:
 numberValue(
 offer.extracted_price
   ) ??
 numberValue(
 offer.price
   ),

 originalPrice:
 numberValue(
 offer.extracted_original_price
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

 source:
 "immersive",
 };
}

function mapGoogleProductSeller(
 seller:
 SerpApiSeller
): MerchantOffer | null {
 const retailer =
 stringValue(
 seller.name
   );

 const rawUrl =
 stringValue(
 seller.link
   );

 const validUrl =
 getValidMerchantUrl(
 rawUrl
   );

 if (
 !retailer ||
 !validUrl
 ) {
 return null;
 }

 return {
 retailer,

 title:
 stringValue(
 seller.title
   ),

 url:
 validUrl.toString(),

 price:
 numberValue(
 seller.extracted_price
   ) ??
 numberValue(
 seller.price
   ),

 originalPrice:
 numberValue(
 seller.extracted_original_price
   ) ??
 numberValue(
 seller.original_price
   ),

 details:
 stringArray(
 seller.details
   ),

 tag:
 stringValue(
 seller.tag
   ),

 source:
 "google-product",
 };
}

function dedupeOffers(
 offers:
 MerchantOffer[]
) {
 const uniqueOffers =
 new Map<
 string,
 MerchantOffer
 >();

 for (
 const offer of
 offers
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

 return Array.from(
 uniqueOffers.values()
 );
}

function extractImmersiveOffers(
 data:
 SerpApiImmersiveResponse
): OfferBundle {
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
 [],
 resolutionMethod:
 "immersive-store",
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

 return {
 productTitle:
 stringValue(
 productResults.title
   ),

 offers:
 dedupeOffers([
 ...stores,
 ...pricing,
 ]),

 resolutionMethod:
 "immersive-store",
 };
}

function extractGoogleProductOffers(
 data:
 SerpApiGoogleProductResponse
): OfferBundle {
 const productResults =
 data.product_results &&
 typeof data.product_results ===
 "object"
 ? (
 data.product_results as
 SerpApiProductResults
   )
 : null;

 const sellersResults =
 data.sellers_results &&
 typeof data.sellers_results ===
 "object"
 ? (
 data.sellers_results as {
 online_sellers?: unknown;
     }
   )
 : null;

 const sellers =
 Array.isArray(
 sellersResults?.online_sellers
 )
 ? (
 sellersResults
     ?.online_sellers as
 SerpApiSeller[]
   )
   .map(
 mapGoogleProductSeller
   )
   .filter(
     (
 offer
     ): offer is MerchantOffer =>
 offer !==
 null
   )
 : [];

 return {
 productTitle:
 stringValue(
 productResults?.title
   ),

 offers:
 dedupeOffers(
 sellers
   ),

 resolutionMethod:
 "google-product-seller",
 };
}

function scoreOffer({
 offer,
 retailer,
 productTitle,
 bottlePrice,
}: {
 offer:
 MerchantOffer;

 retailer:
 string;

 productTitle:
 string;

 bottlePrice:
 number | null;
}) {
 let score =
 0;

 if (
 merchantNamesMatch(
 retailer,
 offer.retailer
   )
 ) {
 score +=
 1000;
 }

 score +=
 titleSimilarity(
 productTitle,
 offer.title
   ) *
 120;

 if (
 bottlePrice !==
 null &&
 bottlePrice >
 0 &&
 offer.price !==
 null &&
 offer.price >
 0
 ) {
 const relativeDifference =
 Math.abs(
 offer.price -
 bottlePrice
   ) /
 bottlePrice;

 score +=
 Math.max(
 0,
 80 -
 relativeDifference *
 80
   );
 }

 if (
 offer.price !==
 null &&
 offer.price >
 0
 ) {
 score +=
 10;
 }

 return score;
}

function selectBestOffer({
 offers,
 retailer,
 productTitle,
 bottlePrice,
 requireRequestedRetailer,
}: {
 offers:
 MerchantOffer[];

 retailer:
 string;

 productTitle:
 string;

 bottlePrice:
 number | null;

 requireRequestedRetailer:
 boolean;
}) {
 return offers
   .filter(
     (
 offer
     ) =>
 !requireRequestedRetailer ||
 merchantNamesMatch(
 retailer,
 offer.retailer
     )
   )
   .sort(
     (
 left,
 right
     ) =>
 scoreOffer({
 offer:
 right,
 retailer,
 productTitle,
 bottlePrice,
     }) -
 scoreOffer({
 offer:
 left,
 retailer,
 productTitle,
 bottlePrice,
     })
   )[0] ??
 null;
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

function extractTokenFromSerpApiUrl(
 value:
 string | null | undefined
) {
 if (!value) {
 return "";
 }

 try {
 const parsed =
 new URL(
 value
   );

 return parsed.searchParams.get(
 "page_token"
   )
   ?.trim() ??
 "";
 } catch {
 return "";
 }
}

async function fetchSerpApiJson<T>({
 apiKey,
 params,
 timeoutMs,
 label,
}: {
 apiKey:
 string;

 params:
 URLSearchParams;

 timeoutMs:
 number;

 label:
 string;
}): Promise<T> {
 const abortController =
 new AbortController();

 const timeoutId =
 setTimeout(
     () =>
 abortController.abort(),
 timeoutMs
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
 `${label} took too long.`
   );
   }

 throw error;
 } finally {
 clearTimeout(
 timeoutId
   );
 }

 let data:
 T & {
 error?: unknown;
 };

 try {
 data =
   (await response.json()) as
 T & {
 error?: unknown;
   };
 } catch {
 throw new Error(
 `${label} returned an invalid JSON response.`
   );
 }

 if (!response.ok) {
 throw new Error(
 stringValue(
 data.error
   ) ||
 `${label} failed with status ${response.status}.`
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

 return data;
}

async function lookupImmersiveProduct({
 apiKey,
 token,
}: {
 apiKey:
 string;

 token:
 string;
}) {
 const params =
 new URLSearchParams({
 engine:
 "google_immersive_product",

 page_token:
 token,

 more_stores:
 "true",

 api_key:
 apiKey,

 output:
 "json",
 });

 const data =
 await fetchSerpApiJson<
 SerpApiImmersiveResponse
 >({
 apiKey,
 params,
 timeoutMs:
 PRIMARY_LOOKUP_TIMEOUT_MS,
 label:
 "Immersive product lookup",
 });

 return extractImmersiveOffers(
 data
 );
}

async function lookupGoogleProduct({
 apiKey,
 productId,
}: {
 apiKey:
 string;

 productId:
 string;
}) {
 const params =
 new URLSearchParams({
 engine:
 "google_product",

 product_id:
 productId,

 gl:
 "us",

 hl:
 "en",

 api_key:
 apiKey,

 output:
 "json",
 });

 const data =
 await fetchSerpApiJson<
 SerpApiGoogleProductResponse
 >({
 apiKey,
 params,
 timeoutMs:
 PRIMARY_LOOKUP_TIMEOUT_MS,
 label:
 "Google product lookup",
 });

 return extractGoogleProductOffers(
 data
 );
}

function shoppingResultScore({
 result,
 retailer,
 productTitle,
}: {
 result:
 SerpApiShoppingResult;

 retailer:
 string;

 productTitle:
 string;
}) {
 let score =
 titleSimilarity(
 productTitle,
 stringValue(
 result.title
   )
 ) *
 500;

 if (
 merchantNamesMatch(
 retailer,
 stringValue(
 result.source
   )
 )
 ) {
 score +=
 250;
 }

 return score;
}

async function searchExactShoppingProduct({
 apiKey,
 retailer,
 productTitle,
}: {
 apiKey:
 string;

 retailer:
 string;

 productTitle:
 string;
}) {
 const query =
 [
 retailer,
 productTitle,
 ]
   .filter(
 Boolean
   )
   .join(
 " "
   );

 if (!query) {
 return null;
 }

 const params =
 new URLSearchParams({
 engine:
 "google_shopping",

 q:
 query,

 gl:
 "us",

 hl:
 "en",

 api_key:
 apiKey,

 output:
 "json",
 });

 const data =
 await fetchSerpApiJson<
 SerpApiShoppingResponse
 >({
 apiKey,
 params,
 timeoutMs:
 FALLBACK_SEARCH_TIMEOUT_MS,
 label:
 "Exact product shopping lookup",
 });

 const results =
 Array.isArray(
 data.shopping_results
 )
 ? (
 data.shopping_results as
 SerpApiShoppingResult[]
   )
 : [];

 const rankedResults =
 [...results]
   .sort(
     (
 left,
 right
     ) =>
 shoppingResultScore({
 result:
 right,
 retailer,
 productTitle,
     }) -
 shoppingResultScore({
 result:
 left,
 retailer,
 productTitle,
     })
   );

 return rankedResults[0] ??
 null;
}

function buildDirectShoppingOffer(
 result:
 SerpApiShoppingResult
): MerchantOffer | null {
 const rawUrl =
 stringValue(
 result.product_link
   );

 const validUrl =
 getValidMerchantUrl(
 rawUrl
   );

 const retailer =
 stringValue(
 result.source
   );

 if (
 !validUrl ||
 !retailer
 ) {
 return null;
 }

 return {
 retailer,

 title:
 stringValue(
 result.title
   ),

 url:
 validUrl.toString(),

 price:
 numberValue(
 result.extracted_price
   ) ??
 numberValue(
 result.price
   ),

 originalPrice:
 numberValue(
 result.extracted_old_price
   ) ??
 numberValue(
 result.old_price
   ),

 details:
 [],

 tag:
 "",

 source:
 "shopping-direct",
 };
}

function buildResolvedOffer({
 selectedOffer,
 productTitle,
 fallbackProductTitle,
 bottlePrice,
 matchType,
}: {
 selectedOffer:
 MerchantOffer;

 productTitle:
 string;

 fallbackProductTitle:
 string;

 bottlePrice:
 number | null;

 matchType:
 ResolvedLiveMerchantOffer["matchType"];
}): ResolvedLiveMerchantOffer {
 const priceDifference =
 calculatePriceDifference({
 originalPrice:
 bottlePrice,

 livePrice:
 selectedOffer.price,
   });

 const resolvedProductTitle =
 productTitle ||
 fallbackProductTitle;

 return {
 url:
 selectedOffer.url,

 matchType,

 retailer:
 selectedOffer.retailer,

 productTitle:
 resolvedProductTitle,

 verifiedBottleUnitCount:
 extractBottleUnitCount([
 resolvedProductTitle,
 fallbackProductTitle,
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
 selectedOffer.originalPrice,

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

async function resolveFromBundles({
 bundlePromises,
 retailer,
 productTitle,
 bottlePrice,
}: {
 bundlePromises:
 Array<
 Promise<OfferBundle>
 >;

 retailer:
 string;

 productTitle:
 string;

 bottlePrice:
 number | null;
}) {
 const successfulBundles:
 OfferBundle[] = [];

 if (
 bundlePromises.length ===
 0
 ) {
 return null;
 }

 try {
 const exactMatch =
 await Promise.any(
 bundlePromises.map(
 async (
 bundlePromise
       ) => {
 const bundle =
 await bundlePromise;

 successfulBundles.push(
 bundle
         );

 const selectedOffer =
 selectBestOffer({
 offers:
 bundle.offers,

 retailer,

 productTitle,

 bottlePrice,

 requireRequestedRetailer:
 true,
         });

 if (!selectedOffer) {
 throw new Error(
 "Requested retailer not present in this lookup."
           );
         }

 return buildResolvedOffer({
 selectedOffer,

 productTitle:
 bundle.productTitle,

 fallbackProductTitle:
 productTitle,

 bottlePrice,

 matchType:
 bundle.resolutionMethod,
         });
       }
     )
   );

 return exactMatch;
 } catch {
 /*
  * Promise.any only rejects after every primary lookup either
  * fails or returns no requested-retailer offer. At that point
  * all successful bundles have been collected, so safely fall
  * back to another legitimate merchant for the same product.
  */
 }

 const alternativeOffers =
 successfulBundles.flatMap(
   (
 bundle
   ) =>
 bundle.offers
 );

 const selectedAlternative =
 selectBestOffer({
 offers:
 alternativeOffers,

 retailer,

 productTitle,

 bottlePrice,

 requireRequestedRetailer:
 false,
   });

 if (!selectedAlternative) {
 return null;
 }

 const sourceBundle =
 successfulBundles.find(
   (
 bundle
   ) =>
 bundle.offers.includes(
 selectedAlternative
   )
 ) ??
 successfulBundles[0];

 return buildResolvedOffer({
 selectedOffer:
 selectedAlternative,

 productTitle:
 sourceBundle?.productTitle ??
 "",

 fallbackProductTitle:
 productTitle,

 bottlePrice,

 matchType:
 sourceBundle?.resolutionMethod ??
 "shopping-fallback",
 });
}

export async function resolveLiveMerchantOffer({
 retailer,
 productTitle,
 bottlePrice,
 shoppingProductId,
 immersiveProductPageToken,
 serpApiImmersiveProductUrl,
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
   ?.trim() ||
 extractTokenFromSerpApiUrl(
 serpApiImmersiveProductUrl
   ) ||
 "";

 if (!normalizedRetailer) {
 throw new Error(
 "Retailer is required."
   );
 }

 if (
 !normalizedToken &&
 !normalizedShoppingProductId &&
 !normalizedProductTitle
 ) {
 throw new Error(
 "Not enough product information is available to locate a current bottle offer."
   );
 }

 const apiKey =
 process.env
   .SERPAPI_API_KEY ??
 process.env
   .SERP_API_KEY;

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

 hasImmersiveToken:
 Boolean(
 normalizedToken
   ),

 originalBottlePrice:
 bottlePrice,
 }
 );

 const primaryLookups:
 Array<
 Promise<OfferBundle>
 > = [];

 if (normalizedToken) {
 primaryLookups.push(
 lookupImmersiveProduct({
 apiKey,

 token:
 normalizedToken,
   })
 );
 }

 if (
 normalizedShoppingProductId
 ) {
 primaryLookups.push(
 lookupGoogleProduct({
 apiKey,

 productId:
 normalizedShoppingProductId,
   })
 );
 }

 const primaryResolved =
 await resolveFromBundles({
 bundlePromises:
 primaryLookups,

 retailer:
 normalizedRetailer,

 productTitle:
 normalizedProductTitle,

 bottlePrice,
 });

 if (primaryResolved) {
 return primaryResolved;
 }

 /*
  * Final fallback:
  * search Google Shopping by the exact product title + retailer,
  * then use the result's current product ID/token to resolve the
  * merchant purchase page. This path is intentionally used only
  * after the identifiers supplied by the original search result
  * have failed.
  */
 const shoppingResult =
 await searchExactShoppingProduct({
 apiKey,

 retailer:
 normalizedRetailer,

 productTitle:
 normalizedProductTitle,
   });

 if (!shoppingResult) {
 throw new Error(
 `No current purchase offer was found for ${normalizedProductTitle || normalizedRetailer}.`
   );
 }

 const directShoppingOffer =
 buildDirectShoppingOffer(
 shoppingResult
   );

 if (directShoppingOffer) {
 return buildResolvedOffer({
 selectedOffer:
 directShoppingOffer,

 productTitle:
 stringValue(
 shoppingResult.title
   ),

 fallbackProductTitle:
 normalizedProductTitle,

 bottlePrice,

 matchType:
 "shopping-fallback",
   });
 }

 const fallbackToken =
 stringValue(
 shoppingResult
   .immersive_product_page_token
 ) ||
 extractTokenFromSerpApiUrl(
 stringValue(
 shoppingResult
     .serpapi_immersive_product_api
   )
 );

 const fallbackProductId =
 stringValue(
 shoppingResult.product_id
 );

 const fallbackLookups:
 Array<
 Promise<OfferBundle>
 > = [];

 if (fallbackToken) {
 fallbackLookups.push(
 lookupImmersiveProduct({
 apiKey,

 token:
 fallbackToken,
   })
 );
 }

 if (fallbackProductId) {
 fallbackLookups.push(
 lookupGoogleProduct({
 apiKey,

 productId:
 fallbackProductId,
   })
 );
 }

 const fallbackResolved =
 await resolveFromBundles({
 bundlePromises:
 fallbackLookups,

 retailer:
 normalizedRetailer,

 productTitle:
 normalizedProductTitle,

 bottlePrice,
 });

 if (fallbackResolved) {
 return {
 ...fallbackResolved,

 matchType:
 fallbackResolved.matchType ===
 "immersive-store"
 ? "shopping-fallback"
 : fallbackResolved.matchType,
   };
 }

 throw new Error(
 `No current purchasable merchant offer was found for ${normalizedProductTitle || normalizedRetailer}.`
 );
}
