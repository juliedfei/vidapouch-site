import type { RetailProduct } from "../types";

import {
  getSupplementAliases,
 } from "../supplementAliases";

import type {
 ProductProvider,
 ProductProviderResult,
 ProductSearchRequest,
} from "@/app/api/pricing/providers/providerTypes";

const SERP_API_ENDPOINT =
 "https://serpapi.com/search.json";

const MAX_PRODUCTS = 20;

type SerpApiShoppingResult = {
 title?: unknown;
 source?: unknown;
 link?: unknown;
 product_link?: unknown;

 price?: unknown;
 extracted_price?: unknown;

 delivery?: unknown;
 snippet?: unknown;
 extensions?: unknown;
};

type SerpApiResponse = {
 shopping_results?: unknown;
 error?: unknown;
};

function normalizeText(value: string) {
 return value
   .toLowerCase()
   .replace(/['’]/g, "")
   .replace(/[^a-z0-9]+/g, " ")
   .trim();
}

function normalizeCompact(value: string) {
 return normalizeText(value).replace(
   /\s+/g,
   ""
 );
}

function stringValue(
 value: unknown
): string {
 return typeof value === "string"
   ? value.trim()
   : "";
}

function numberValue(
 value: unknown
): number | null {
 if (
   typeof value === "number" &&
   Number.isFinite(value)
 ) {
   return value;
 }

 if (typeof value !== "string") {
   return null;
 }

 const parsed = Number(
   value.replace(/[^0-9.]/g, "")
 );

 return Number.isFinite(parsed)
   ? parsed
   : null;
}

function buildSearchQuery({
    supplement,
    brand,
   }: ProductSearchRequest) {
    return [
      brand?.trim(),
      supplement.trim(),
      "supplement",
    ]
      .filter(Boolean)
      .join(" ");
   }
   

function extractCount(
 searchableText: string
): number | null {




  const patterns = [
    /\b(\d{1,4})\s*(?:count|ct)\b/i,
   
    /\b(\d{1,4})\s*(?:capsules?|caps)\b/i,
   
    /\b(\d{1,4})\s*(?:tablets?|tabs)\b/i,
   
    /\b(\d{1,4})\s*(?:softgels?)\b/i,
   
    /\b(\d{1,4})\s*(?:vegcaps?|veggie\s+capsules?|vegetarian\s+capsules?)\b/i,
   
    /\b(\d{1,4})\s*(?:caplets?)\b/i,
   
    /\b(?:bottle of|contains)\s*(\d{1,4})\b/i,
   
    /\b(\d{1,4})\s*(?:servings?)\b/i,
   ];




 for (const pattern of patterns) {
   const match =
     searchableText.match(pattern);

   if (!match) continue;

   const count = Number(match[1]);

   if (
     Number.isInteger(count) &&
     count > 0 &&
     count <= 2000
   ) {
     return count;
   }
 }

 return null;
}

function extractServingSize(
 searchableText: string
) {
 const patterns = [
   /\bserving size[:\s]+(\d+)\s*(?:capsules?|caps|tablets?|tabs|softgels?)\b/i,

   /\b(\d+)\s*(?:capsules?|caps|tablets?|tabs|softgels?)\s+per serving\b/i,

   /\btake\s+(\d+)\s*(?:capsules?|caps|tablets?|tabs|softgels?)\b/i,
 ];

 for (const pattern of patterns) {
   const match =
     searchableText.match(pattern);

   if (!match) continue;

   const servingSize =
     Number(match[1]);

   if (
     Number.isInteger(servingSize) &&
     servingSize > 0 &&
     servingSize <= 20
   ) {
     return servingSize;
   }
 }

 return 1;
}

function extractDosage(
 searchableText: string,
 requestedDosage?: string
) {
 const dosagePatterns = [
   /\b\d+(?:\.\d+)?\s*(?:mcg|mg|g|iu)\b/i,
 ];

 for (
   const pattern of dosagePatterns
 ) {
   const match =
     searchableText.match(pattern);

   if (match?.[0]) {
     return match[0]
       .replace(/\s+/g, " ")
       .toUpperCase()
       .replace("MCG", "mcg")
       .replace("MG", "mg");
   }
 }

 return requestedDosage?.trim() || "";
}

function extractShipping(
 delivery: string
): number {
 if (!delivery) return 0;

 if (
   /\bfree\b/i.test(delivery)
 ) {
   return 0;
 }

 const match = delivery.match(
   /\$([0-9]+(?:\.[0-9]{1,2})?)/
 );

 if (!match) return 0;

 const shipping = Number(match[1]);

 return Number.isFinite(shipping)
   ? shipping
   : 0;
}



function hasSupportedForm(
  searchableText: string
 ) {
  const text = searchableText.toLowerCase();
 
  // Reject forms we don't currently support.
  if (
    /\b(liquid|drops?|spray|powder|drink|gummy|gummies|chew|chewable|effervescent)\b/.test(
      text
    )
  ) {
    return false;
  }
 
  // Explicit capsule / tablet forms.
  if (
    /\b(capsule|capsules|cap|caps|tablet|tablets|tab|tabs|softgel|softgels|vegcap|vegcaps)\b/.test(
      text
    )
  ) {
    return true;
  }
 
  // Google often omits the dosage form.
  if (
    /\b(vitamin|mineral|supplement)\b/.test(
      text
    )
  ) {
    return true;
  }
 
  return false;
 }









function brandMatches(
 searchableText: string,
 requestedBrand?: string
) {
 if (!requestedBrand?.trim()) {
   return true;
 }

 return normalizeCompact(
   searchableText
 ).includes(
   normalizeCompact(requestedBrand)
 );
}






function supplementMatches(
  searchableText: string,
  requestedSupplement: string
 ) {
  const normalizedResult =
    normalizeText(searchableText);
 
  const aliases =
    getSupplementAliases(
      requestedSupplement
    );
 
  return aliases.some((alias) =>
    normalizedResult.includes(
      normalizeText(alias)
    )
  );
 }







function getExtensionsText(
 extensions: unknown
) {
 if (!Array.isArray(extensions)) {
   return "";
 }

 return extensions
   .filter(
     (value): value is string =>
       typeof value === "string"
   )
   .join(" ");
}

function mapShoppingResult(
 result: SerpApiShoppingResult,
 request: ProductSearchRequest
): RetailProduct | null {
 const title =
   stringValue(result.title);

 const snippet =
   stringValue(result.snippet);

 const extensions =
   getExtensionsText(
     result.extensions
   );

 const searchableText = [
   title,
   snippet,
   extensions,
 ]
   .filter(Boolean)
   .join(" ");


   console.log("================================");
   console.log("TITLE:", title);
   console.log("SEARCHABLE:", searchableText);
   console.log("REQUESTED BRAND:", request.brand);
   console.log("REQUESTED SUPPLEMENT:", request.supplement);





   if (!title) {
    console.log("Rejected: no title");
    return null;
   }
   






   const supportedForm =
   hasSupportedForm(searchableText);
  
  if (!supportedForm) {
   console.log("❌ Rejected: unsupported dosage form");
   console.log({
     title,
     searchableText,
   });
   return null;
  }
  
  const supplementMatched =
   supplementMatches(
     searchableText,
     request.supplement
   );
  
  if (!supplementMatched) {
   console.log("❌ Rejected: supplement mismatch");
   console.log({
     title,
     searchableText,
     requestedSupplement:
       request.supplement,
   });
   return null;
  }
  
  const brandMatched =
   brandMatches(
     searchableText,
     request.brand
   );
  
  if (!brandMatched) {
   console.log("❌ Rejected: brand mismatch");
   console.log({
     title,
     searchableText,
     requestedBrand:
       request.brand,
   });
   return null;
  }
  
  const bottlePrice =
   numberValue(result.extracted_price) ??
   numberValue(result.price);
  
  if (
   bottlePrice == null ||
   bottlePrice <= 0
  ) {
   console.log("❌ Rejected: missing price");
   console.log({
     title,
     extractedPrice:
       result.extracted_price,
     rawPrice:
       result.price,
   });
   return null;
  }
  



  let capsulesPerBottle =
  extractCount(searchableText);
 
 if (!capsulesPerBottle) {
  /*
   * Google sometimes omits the bottle size
   * from Shopping results even though the
   * product is valid.
   *
   * Use a conservative default so the
   * recommendation engine can still compare
   * brands instead of discarding them.
   */
  capsulesPerBottle = 100;
 
  console.log(
    "⚠️ Missing bottle count. Using default of 100."
  );
 
  console.log({
    title,
    searchableText,
  });
 }



  
  console.log("✅ Accepted product");
  console.log({
   brand:
     request.brand ??
     extractLikelyBrand(
       title,
       request.supplement
     ),
   title,
   bottlePrice,
   capsulesPerBottle,
  });








 if (!capsulesPerBottle) {
  console.log("Rejected: no capsule count");
  console.log(searchableText);
  return null;
 }






 const retailer =
   stringValue(result.source) ||
   "Google Shopping";

 const url =
   stringValue(
     result.product_link
   ) ||
   stringValue(result.link) ||
   undefined;

 const dosage =
   extractDosage(
     searchableText,
     request.dosage
   );

 return {
   retailer,

   brand:
     request.brand?.trim() ||
     extractLikelyBrand(
       title,
       request.supplement
     ),

   supplement:
     request.supplement.trim(),

   dosage,

   bottlePrice,

   capsulesPerBottle,

   servingSize:
     extractServingSize(
       searchableText
     ),

   estimatedShipping:
     extractShipping(
       stringValue(
         result.delivery
       )
     ),

   url,
 };
}










function extractLikelyBrand(
  title: string,
  supplement: string
 ) {
  const normalizedTitle =
    normalizeText(title);
 
  /*
   * Include all known names for the
   * supplement, not merely the words in
   * the customer's requested name.
   *
   * Example:
   * Vitamin C → "vitamin c", "ascorbic acid"
   */
  const supplementAliases =
    getSupplementAliases(supplement)
      .map((alias) =>
        normalizeText(alias)
      )
      .filter(Boolean)
      .sort(
        (left, right) =>
          right.length - left.length
      );
 
  /*
   * Find the earliest point at which the
   * actual supplement name begins.
   *
   * Example:
   * "Thorne Ascorbic Acid 500 mg"
   * becomes the prefix "Thorne".
   */
  let supplementStartIndex =
    normalizedTitle.length;
 
  for (
    const alias of supplementAliases
  ) {
    const aliasIndex =
      normalizedTitle.indexOf(alias);
 
    if (
      aliasIndex >= 0 &&
      aliasIndex <
        supplementStartIndex
    ) {
      supplementStartIndex =
        aliasIndex;
    }
  }
 
  let brandCandidate =
    normalizedTitle
      .slice(
        0,
        supplementStartIndex
      )
      .trim();
 
  /*
   * If no full alias appeared, fall back
   * to detecting dosage and product-form
   * language.
   */
  if (!brandCandidate) {
    brandCandidate =
      normalizedTitle
        .split(
          /\b(?:\d+(?:\.\d+)?\s*(?:mcg|mg|g|iu)|capsules?|caps?|tablets?|tabs?|softgels?|caplets?|vegcaps?)\b/i
        )[0]
        .trim();
  }
 
  /*
   * Google titles sometimes begin with
   * commerce language rather than a brand.
   */
  brandCandidate =
    brandCandidate
      .replace(
        /^(?:buy|shop|new|best|official)\s+/i,
        ""
      )
      .trim();
 
  /*
   * Avoid returning a meaningless article
   * as the entire brand.
   */
  if (
    /^(?:the|a|an)$/i.test(
      brandCandidate
    )
  ) {
    return "Unknown Brand";
  }
 
  /*
   * Restore readable capitalization from
   * the original title whenever possible.
   */
  const originalWords =
    title
      .replace(
        /[|,()[\]–—]/g,
        " "
      )
      .split(/\s+/)
      .filter(Boolean);
 
  const candidateWordCount =
    brandCandidate
      .split(/\s+/)
      .filter(Boolean)
      .length;
 
  const originalCandidate =
    originalWords
      .slice(
        0,
        candidateWordCount
      )
      .join(" ")
      .replace(
        /^(?:Buy|Shop|New|Best|Official)\s+/i,
        ""
      )
      .trim();
 
  return (
    originalCandidate ||
    brandCandidate ||
    "Unknown Brand"
  );
 }








function deduplicateProducts(
 products: RetailProduct[]
) {
 const uniqueProducts =
   new Map<string, RetailProduct>();

 products.forEach((product) => {
   const key = [
     normalizeCompact(product.retailer),
     normalizeCompact(product.brand),
     normalizeCompact(
       product.supplement
     ),
     normalizeCompact(product.dosage),
     product.bottlePrice.toFixed(2),
     product.capsulesPerBottle,
   ].join("|");

   if (!uniqueProducts.has(key)) {
     uniqueProducts.set(
       key,
       product
     );
   }
 });

 return Array.from(
   uniqueProducts.values()
 );
}

export class SerpApiProvider
 implements ProductProvider
{
 readonly name = "SerpApi Google Shopping";

 async search(
   request: ProductSearchRequest
 ): Promise<ProductProviderResult> {
   const apiKey =
     process.env.SERPAPI_API_KEY;

console.log("SERPAPI=", apiKey);

   if (!apiKey) {
     throw new Error(
       'SERPAPI_API_KEY is not configured. Value: ${String(apiKey)}'
     );
   }

   const query =
     buildSearchQuery(request);


console.log("SEARCH QUERY:");
console.log(query);


   const params =
     new URLSearchParams({
       engine: "google_shopping",
       q: query,
       api_key: apiKey,
       gl: "us",
       hl: "en",
       direct_link: "true",
     });

   const response = await fetch(
     `${SERP_API_ENDPOINT}?${params.toString()}`,
     {
       method: "GET",
       cache: "no-store",

       headers: {
         Accept: "application/json",
       },
     }
   );

   let data: SerpApiResponse;

   try {
     data =
       (await response.json()) as SerpApiResponse;
   } catch {
     throw new Error(
       "SerpApi returned an invalid JSON response."
     );
   }

   if (!response.ok) {
     throw new Error(
       stringValue(data.error) ||
         `SerpApi search failed with status ${response.status}.`
     );
   }

   if (
     typeof data.error === "string" &&
     data.error.trim()
   ) {
     throw new Error(
       data.error.trim()
     );
   }

   const rawResults =
     Array.isArray(
       data.shopping_results
     )
       ? (
           data.shopping_results as SerpApiShoppingResult[]
         )
       : [];

       console.log("GOOGLE RETURNED", rawResults.length, "RESULTS");

rawResults.forEach((item, index) => {
 console.log(index, item.title);
});







   const products =
     deduplicateProducts(
       rawResults
         .map((result) =>
           mapShoppingResult(
             result,
             request
           )
         )
         .filter(
           (
             product
           ): product is RetailProduct =>
             Boolean(product)
         )
     ).slice(0, MAX_PRODUCTS);


     console.log("FINAL PRODUCTS:");
     products.forEach((product) => {
      console.log({
        brand: product.brand,
        retailer: product.retailer,
        price: product.bottlePrice,
        count: product.capsulesPerBottle,
      });
     });




   return {
     provider: this.name,
     products,
   };
 }
}
