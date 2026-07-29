import {
  createHash,
 } from "node:crypto";
 
 import {
  Prisma,
 } from "@/lib/generated/prisma/client";
 
 import {
  prisma,
 } from "@/lib/db";
 
 import type {
  SearchDosageUnit,
  SearchProductForm,
  SearchRetailProduct,
 } from "./searchRetailProduct";
 
 import {
  getSupplementAliases,
  getSupplementSearchTerms,
 } from "@/lib/pricing/supplementAliases";
 
 import {
  resolveSearchListingBrands,
 } from "@/lib/search/brand/resolveSearchListingBrands";
 
 import type {
  ProductSearchRequest,
 } from "@/app/api/pricing/providers/providerTypes";
 
 const SERP_API_ENDPOINT =
  "https://serpapi.com/search.json";
 
 const SERP_API_SOURCE_PROVIDER =
  "serpapi";
 
 const SERP_API_SEARCH_ENGINE =
  "google_shopping";
 
 const SERP_API_COUNTRY_CODE =
  "us";
 
 const SERP_API_LANGUAGE =
  "en";
 
 const SERP_API_CACHE_VERSION =
  "serpapi-google-shopping-page-v1";
 
 /*
 * Search browsing results are reused briefly to
 * reduce paid SerpApi usage.
 *
 * Checkout must still revalidate the selected offer
 * before creating the final customer charge.
 */
 const DEFAULT_CACHE_TTL_MINUTES =
  60;
 
 const MIN_CACHE_TTL_MINUTES =
  1;
 
 const MAX_CACHE_TTL_MINUTES =
  1440;
 
 const DEFAULT_MAX_PAGES =
  3;
 
 const MAX_ALLOWED_PAGES =
  10;
 
 const DEFAULT_MAX_RETAIL_LISTINGS =
  400;
 
 const MAX_ALLOWED_RETAIL_LISTINGS =
  1000;
 
 const MAX_INTERNAL_ALIAS_QUERIES =
  4;
 
 type SerpApiShoppingResult = {
  title?:
    unknown;
 
  source?:
    unknown;
 
  /*
   * Google Shopping destination links frequently
   * point to Google rather than directly to the
   * merchant, so they must not be treated as
   * merchant URLs.
   */
  link?:
    unknown;
 
  product_link?:
    unknown;
 
  product_id?:
    unknown;
 
  immersive_product_page_token?:
    unknown;
 
  serpapi_immersive_product_api?:
    unknown;
 
  multiple_sources?:
    unknown;
 
  thumbnail?:
    unknown;
 
  serpapi_thumbnail?:
    unknown;
 
  price?:
    unknown;
 
  extracted_price?:
    unknown;
 
  rating?:
    unknown;
 
  reviews?:
    unknown;
 
  delivery?:
    unknown;
 
  snippet?:
    unknown;
 
  extensions?:
    unknown;
 };
 
 type SerpApiPagination = {
  next?:
    unknown;
 };
 
 type SerpApiResponse = {
  shopping_results?:
    unknown;
 
  serpapi_pagination?:
    SerpApiPagination;
 
  error?:
    unknown;
 };
 
 type ShoppingPageResult = {
  results:
    SerpApiShoppingResult[];
 
  nextUrl:
    string | null;
 
  cacheStatus:
    "HIT" | "MISS" | "BYPASS";
 };
 
 type ShoppingQueryResult = {
  results:
    SerpApiShoppingResult[];
 
  cacheHits:
    number;
 
  cacheMisses:
    number;
 
  cacheBypasses:
    number;
 
  serpApiRequests:
    number;
 
  pagesFetched:
    number;
 };
 
 function normalizeText(
  value:
    string
 ) {
  return value
    .toLowerCase()
    .replace(
      /[®™©]/g,
      " "
    )
    .replace(
      /['’]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
 }
 
 function normalizeCompact(
  value:
    string
 ) {
  return normalizeText(
    value
  ).replace(
    /\s+/g,
    ""
  );
 }
 
 function stringValue(
  value:
    unknown
 ): string {
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
 
 function booleanValue(
  value:
    unknown
 ) {
  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }
 
  if (
    typeof value ===
      "number"
  ) {
    return value >
      0;
  }
 
  if (
    typeof value ===
      "string"
  ) {
    const normalized =
      value
        .trim()
        .toLowerCase();
 
    return (
      normalized ===
        "true" ||
      normalized ===
        "1" ||
      normalized ===
        "yes"
    );
  }
 
  if (
    Array.isArray(
      value
    )
  ) {
    return value.length >
      1;
  }
 
  return false;
 }
 
 function clampInteger({
  value,
  fallback,
  minimum,
  maximum,
 }: {
  value:
    number | undefined;
 
  fallback:
    number;
 
  minimum:
    number;
 
  maximum:
    number;
 }) {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value
    )
  ) {
    return fallback;
  }
 
  return Math.max(
    minimum,
    Math.min(
      maximum,
      Math.round(
        value
      )
    )
  );
 }
 
 function parsePositiveInteger(
  value:
    string | undefined
 ) {
  if (
    !value
  ) {
    return undefined;
  }
 
  const parsed =
    Number(
      value
    );
 
  if (
    !Number.isFinite(
      parsed
    ) ||
    parsed <=
      0
  ) {
    return undefined;
  }
 
  return Math.round(
    parsed
  );
 }
 
 function getCacheTtlMinutes() {
  return clampInteger({
    value:
      parsePositiveInteger(
        process.env
          .SERPAPI_SEARCH_CACHE_TTL_MINUTES
      ),
 
    fallback:
      DEFAULT_CACHE_TTL_MINUTES,
 
    minimum:
      MIN_CACHE_TTL_MINUTES,
 
    maximum:
      MAX_CACHE_TTL_MINUTES,
  });
 }
 
 function isSearchCacheBypassed() {
  const configuredValue =
    process.env
      .SERPAPI_SEARCH_CACHE_BYPASS
      ?.trim()
      .toLowerCase();
 
  return (
    configuredValue ===
      "true" ||
    configuredValue ===
      "1" ||
    configuredValue ===
      "yes"
  );
 }
 
 function containsSupplementShoppingWord(
  value:
    string
 ) {
  const normalized =
    normalizeText(
      value
    );
 
  return [
    "supplement",
    "supplements",
    "vitamin",
    "vitamins",
    "mineral",
    "minerals",
    "capsule",
    "capsules",
    "tablet",
    "tablets",
    "softgel",
    "softgels",
  ].some(
    (word) =>
      normalized ===
        word ||
      normalized.startsWith(
        `${word} `
      ) ||
      normalized.endsWith(
        ` ${word}`
      ) ||
      normalized.includes(
        ` ${word} `
      )
  );
 }
 
 function buildRequestedQuery({
  supplement,
  brand,
  searchMode,
 }: ProductSearchRequest) {
  const cleanedSupplement =
    supplement.trim();
 
  const supplementQuery =
    searchMode ===
      "direct-marketplace" ||
    containsSupplementShoppingWord(
      cleanedSupplement
    )
      ? cleanedSupplement
      : `${cleanedSupplement} supplement`;
 
  return [
    brand?.trim(),
    supplementQuery,
  ]
    .filter(
      Boolean
    )
    .join(
      " "
    );
 }
 
 function buildSearchQueries(
  request:
    ProductSearchRequest
 ) {
  const requestedQuery =
    buildRequestedQuery(
      request
    );
 
  /*
   * Direct marketplace searches have already been
   * expanded by the search-intent resolver.
   */
  if (
    request.searchMode ===
      "direct-marketplace" ||
    request.expandAliases ===
      false
  ) {
    return [
      requestedQuery,
    ];
  }
 
  const expandedQueries =
    getSupplementSearchTerms(
      request.supplement
    ).map(
      (searchTerm) =>
        [
          request.brand?.trim(),
          searchTerm,
        ]
          .filter(
            Boolean
          )
          .join(
            " "
          )
    );
 
  return Array.from(
    new Set(
      [
        requestedQuery,
        ...expandedQueries,
      ].filter(
        Boolean
      )
    )
  ).slice(
    0,
    MAX_INTERNAL_ALIAS_QUERIES
  );
 }
 
 function getExtensionsText(
  extensions:
    unknown
 ) {
  if (
    !Array.isArray(
      extensions
    )
  ) {
    return "";
  }
 
  return extensions
    .filter(
      (
        value
      ): value is string =>
        typeof value ===
        "string"
    )
    .join(
      " "
    );
 }
 
 function extractForm(
  searchableText:
    string
 ): SearchProductForm {
  const text =
    searchableText
      .toLowerCase();
 
  if (
    /\bsoft[\s-]?gels?\b/.test(
      text
    )
  ) {
    return "Softgel";
  }
 
  if (
    /\b(?:gummy|gummies)\b/.test(
      text
    )
  ) {
    return "Gummy";
  }
 
  if (
    /\b(?:chewable|chewables|chews?)\b/.test(
      text
    )
  ) {
    return "Chewable";
  }
 
  if (
    /\b(?:liquid|drops?|dropper|spray)\b/.test(
      text
    )
  ) {
    return "Liquid";
  }
 
  if (
    /\b(?:powder|powdered|drink mix|stick packs?|sachets?)\b/.test(
      text
    )
  ) {
    return "Powder";
  }
 
  if (
    /\bcaplets?\b/.test(
      text
    )
  ) {
    return "Caplet";
  }
 
  if (
    /\b(?:tablets?|tabs?)\b/.test(
      text
    )
  ) {
    return "Tablet";
  }
 
  if (
    /\b(?:vegcaps?|veg\s+caps?|vegetarian\s+capsules?|veggie\s+capsules?|capsules?|caps?)\b/.test(
      text
    )
  ) {
    return "Capsule";
  }
 
  return "Unknown";
 }
 
 function getUnitLabel(
  form:
    SearchProductForm
 ): SearchRetailProduct[
  "unitLabel"
 ] {
  switch (
    form
  ) {
    case "Capsule":
      return "capsule";
 
    case "Tablet":
      return "tablet";
 
    case "Caplet":
      return "caplet";
 
    case "Softgel":
      return "softgel";
 
    case "Gummy":
      return "gummy";
 
    case "Powder":
    case "Liquid":
    case "Chewable":
      return "serving";
 
    case "Other":
    case "Unknown":
    default:
      return "unit";
  }
 }
 
 function isVitaPouchFormEligible(
  form:
    SearchProductForm
 ) {
  return (
    form ===
      "Capsule" ||
    form ===
      "Tablet" ||
    form ===
      "Caplet" ||
    form ===
      "Gummy"
  );
 }
 
 function extractCount(
  searchableText:
    string
 ): number | null {
  const patterns = [
    /\b(\d{1,4})\s*(?:veg\s+capsules?|veg\s+caps?|veggie\s+capsules?|vegetarian\s+capsules?|vegcaps?)\b/i,
 
    /\b(\d{1,4})\s*(?:soft[\s-]?gels?)\b/i,
 
    /\b(\d{1,4})\s*(?:caplets?)\b/i,
 
    /\b(\d{1,4})\s*(?:capsules?|caps)\b/i,
 
    /\b(\d{1,4})\s*(?:tablets?|tabs)\b/i,
 
    /\b(\d{1,4})\s*(?:gummies|gummy)\b/i,
 
    /\b(\d{1,4})\s*(?:chewables?|chews?)\b/i,
 
    /\b(\d{1,4})\s*(?:packets?|sticks?|sachets?)\b/i,
 
    /\b(\d{1,4})\s*(?:servings?)\b/i,
 
    /\b(\d{1,4})\s*(?:count|ct)\b/i,
 
    /\b(?:bottle of|contains)\s*(\d{1,4})\b/i,
  ];
 
  for (
    const pattern of
    patterns
  ) {
    const match =
      searchableText.match(
        pattern
      );
 
    if (
      !match
    ) {
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
 
 function extractServingSize(
  searchableText:
    string
 ) {
  const patterns = [
    /\bserving size[:\s]+(\d+)\s*(?:capsules?|caps|tablets?|tabs|soft[\s-]?gels?|caplets?|gummies|gummy|chewables?|chews?)\b/i,
 
    /\b(\d+)\s*(?:capsules?|caps|tablets?|tabs|soft[\s-]?gels?|caplets?|gummies|gummy|chewables?|chews?)\s+per serving\b/i,
 
    /\btake\s+(\d+)\s*(?:capsules?|caps|tablets?|tabs|soft[\s-]?gels?|caplets?|gummies|gummy|chewables?|chews?)\b/i,
 
    /\b(?:one|1)\s+scoop\s+per serving\b/i,
 
    /\bserving size[:\s]+(\d+)\s*(?:scoops?|packets?|sticks?|teaspoons?|tablespoons?|ml)\b/i,
  ];
 
  for (
    const pattern of
    patterns
  ) {
    const match =
      searchableText.match(
        pattern
      );
 
    if (
      !match
    ) {
      continue;
    }
 
    const servingSize =
      match[1]
        ? Number(
            match[1]
          )
        : 1;
 
    if (
      Number.isInteger(
        servingSize
      ) &&
      servingSize >
        0 &&
      servingSize <=
        20
    ) {
      return servingSize;
    }
  }
 
  return 1;
 }
 
 type ExtractedDosage = {
  displayValue:
    string;
 
  amount:
    number | null;
 
  unit:
    SearchDosageUnit;
 
  isPerServing:
    boolean | null;
 };
 
 function normalizeDosageUnit(
  unit:
    string
 ): SearchDosageUnit {
  switch (
    unit.toLowerCase()
  ) {
    case "mg":
      return "mg";
 
    case "mcg":
      return "mcg";
 
    case "g":
      return "g";
 
    case "iu":
      return "IU";
 
    default:
      return null;
  }
 }
 
 function formatDosageDisplay({
  amount,
  unit,
 }: {
  amount:
    number;
 
  unit:
    Exclude<
      SearchDosageUnit,
      null>
 ;
 }) {
  const formattedAmount =
    Number.isInteger(
      amount
    )
      ? String(
          amount
        )
      : String(
          amount
        ).replace(
          /\.0+$/,
          ""
        );
 
  return `${formattedAmount} ${unit}`;
 }
 
 function extractDosage(
  searchableText:
    string,
 
  requestedDosage?:
    string
 ): ExtractedDosage {
  const perServingMatch =
    searchableText.match(
      /\b(\d[\d,]*(?:\.\d+)?)\s*(mcg|mg|g|iu)\s+per\s+serving\b/i
    );
 
  if (
    perServingMatch
  ) {
    const amount =
      Number(
        perServingMatch[1]
          .replace(
            /,/g,
            ""
          )
      );
 
    const unit =
      normalizeDosageUnit(
        perServingMatch[2]
      );
 
    if (
      Number.isFinite(
        amount
      ) &&
      amount >
        0 &&
      unit
    ) {
      return {
        displayValue:
          formatDosageDisplay({
            amount,
            unit,
          }),
 
        amount,
 
        unit,
 
        isPerServing:
          true,
      };
    }
  }
 
  const dosageMatch =
    searchableText.match(
      /\b(\d[\d,]*(?:\.\d+)?)\s*(mcg|mg|g|iu)\b/i
    );
 
  if (
    dosageMatch
  ) {
    const amount =
      Number(
        dosageMatch[1]
          .replace(
            /,/g,
            ""
          )
      );
 
    const unit =
      normalizeDosageUnit(
        dosageMatch[2]
      );
 
    if (
      Number.isFinite(
        amount
      ) &&
      amount >
        0 &&
      unit
    ) {
      const amountPattern =
        dosageMatch[1]
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );
 
      const unitPattern =
        dosageMatch[2]
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );
 
      const explicitlyPerUnit =
        new RegExp(
          `\\b${amountPattern}\\s*${unitPattern}\\s+(?:per\\s+)?(?:capsule|tablet|caplet|softgel|gummy)\\b`,
          "i"
        ).test(
          searchableText
        );
 
      return {
        displayValue:
          formatDosageDisplay({
            amount,
            unit,
          }),
 
        amount,
 
        unit,
 
        isPerServing:
          explicitlyPerUnit
            ? false
            : null,
      };
    }
  }
 
  const requested =
    requestedDosage
      ?.trim() ||
    "";
 
  const requestedMatch =
    requested.match(
      /^(\d[\d,]*(?:\.\d+)?)\s*(mcg|mg|g|iu)$/i
    );
 
  if (
    requestedMatch
  ) {
    const amount =
      Number(
        requestedMatch[1]
          .replace(
            /,/g,
            ""
          )
      );
 
    const unit =
      normalizeDosageUnit(
        requestedMatch[2]
      );
 
    if (
      Number.isFinite(
        amount
      ) &&
      amount >
        0 &&
      unit
    ) {
      return {
        displayValue:
          formatDosageDisplay({
            amount,
            unit,
          }),
 
        amount,
 
        unit,
 
        isPerServing:
          null,
      };
    }
  }
 
  return {
    displayValue:
      requested,
 
    amount:
      null,
 
    unit:
      null,
 
    isPerServing:
      null,
  };
 }
 
 function extractShipping(
  delivery:
    string
 ) {
  if (
    !delivery
  ) {
    return 0;
  }
 
  if (
    /\bfree\b/i.test(
      delivery
    )
  ) {
    return 0;
  }
 
  const match =
    delivery.match(
      /\$([0-9]+(?:\.[0-9]{1,2})?)/
    );
 
  if (
    !match
  ) {
    return 0;
  }
 
  const shipping =
    Number(
      match[1]
    );
 
  return Number.isFinite(
    shipping
  )
    ? shipping
    : 0;
 }
 
 function supplementMatches(
  searchableText:
    string,
 
  requestedSupplement:
    string
 ) {
  const normalizedResult =
    normalizeText(
      searchableText
    );
 
  const aliases =
    getSupplementAliases(
      requestedSupplement
    );
 
  return aliases.some(
    (alias) => {
      const normalizedAlias =
        normalizeText(
          alias
        );
 
      return (
        normalizedAlias.length >
          0 &&
        normalizedResult.includes(
          normalizedAlias
        )
      );
    }
  );
 }
 
 function shouldKeepMarketplaceResult({
  searchableText,
  request,
 }: {
  searchableText:
    string;
 
  request:
    ProductSearchRequest;
 }) {
  /*
   * Direct marketplace mode deliberately preserves
   * broad, purchasable products associated with a
   * health goal or commercial search phrase.
   */
  if (
    request.searchMode ===
      "direct-marketplace"
  ) {
    return true;
  }
 
  return supplementMatches(
    searchableText,
    request.supplement
  );
 }
 
 function brandMatches(
  searchableText:
    string,
 
  requestedBrand?:
    string
 ) {
  if (
    !requestedBrand
      ?.trim()
  ) {
    return true;
  }
 
  return normalizeCompact(
    searchableText
  ).includes(
    normalizeCompact(
      requestedBrand
    )
  );
 }
 
 function extractListingClaims(
  searchableText:
    string
 ) {
  return {
    nsfCertified:
      /\bnsf(?:\s+certified|\s+certification)?\b/i.test(
        searchableText
      )
        ? true
        : undefined,
 
    uspVerified:
      /\busp(?:\s+verified|\s+certified)?\b/i.test(
        searchableText
      )
        ? true
        : undefined,
 
    thirdPartyTested:
      /\bthird[\s-]?party\s+(?:tested|verified|certified)\b/i.test(
        searchableText
      )
        ? true
        : undefined,
 
    vegan:
      /\bvegan\b/i.test(
        searchableText
      )
        ? true
        : undefined,
 
    nonGmo:
      /\bnon[\s-]?gmo\b/i.test(
        searchableText
      )
        ? true
        : undefined,
 
    glutenFree:
      /\bgluten[\s-]?free\b/i.test(
        searchableText
      )
        ? true
        : undefined,
  };
 }
 
 /*
 * This stage converts the SerpApi payload into the
 * internal product structure but deliberately leaves
 * the brand unresolved.
 *
 * Brand resolution is asynchronous and occurs after
 * all valid listings have been mapped.
 */
 function mapShoppingResult(
  result:
    SerpApiShoppingResult,
 
  request:
    ProductSearchRequest
 ): SearchRetailProduct | null {
  const title =
    stringValue(
      result.title
    );
 
  if (
    !title
  ) {
    return null;
  }
 
  const snippet =
    stringValue(
      result.snippet
    );
 
  const extensions =
    getExtensionsText(
      result.extensions
    );
 
  const searchableText =
    [
      title,
      snippet,
      extensions,
    ]
      .filter(
        Boolean
      )
      .join(
        " "
      );
 
  if (
    !shouldKeepMarketplaceResult({
      searchableText,
      request,
    })
  ) {
    return null;
  }
 
  if (
    !brandMatches(
      searchableText,
      request.brand
    )
  ) {
    return null;
  }
 
  const bottlePrice =
    numberValue(
      result.extracted_price
    ) ??
    numberValue(
      result.price
    );
 
  if (
    bottlePrice ===
      null ||
    bottlePrice <=
      0
  ) {
    return null;
  }
 
  const form =
    extractForm(
      searchableText
    );
 
  const extractedDosage =
    extractDosage(
      searchableText,
      request.dosage
    );
 
  const capsulesPerBottle =
    extractCount(
      searchableText
    ) ??
    100;
 
  const retailer =
    stringValue(
      result.source
    ) ||
    "Google Shopping";
 
  const imageUrl =
    stringValue(
      result.thumbnail
    ) ||
    stringValue(
      result
        .serpapi_thumbnail
    ) ||
    undefined;
 
  const listingClaims =
    extractListingClaims(
      searchableText
    );
 
  const shoppingProductId =
    stringValue(
      result.product_id
    ) ||
    undefined;
 
  const immersiveProductPageToken =
    stringValue(
      result
        .immersive_product_page_token
    ) ||
    undefined;
 
  const serpApiImmersiveProductUrl =
    stringValue(
      result
        .serpapi_immersive_product_api
    ) ||
    undefined;
 
  const googleShoppingUrl =
    stringValue(
      result.product_link
    ) ||
    stringValue(
      result.link
    ) ||
    undefined;
 
  const product = {
    productTitle:
      title,
 
    form,
 
    unitLabel:
      getUnitLabel(
        form
      ),
 
    vitaPouchFormEligible:
      isVitaPouchFormEligible(
        form
      ),
 
    retailer,
 
    /*
     * This temporary value is replaced by the
     * database-first brand resolver before the
     * listing is returned.
     */
    brand:
      request.brand
        ?.trim() ||
      "Unknown Brand",
 
    supplement:
      request.supplement
        .trim(),
 
    dosage:
      extractedDosage
        .displayValue,
 
    dosageAmount:
      extractedDosage.amount,
 
    dosageUnit:
      extractedDosage.unit,
 
    dosageIsPerServing:
      extractedDosage
        .isPerServing,
 
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
 
    /*
     * The direct merchant URL is resolved only when
     * the customer selects Buy Bottle.
     */
    url:
      undefined,
 
    imageUrl,
 
    shoppingProductId,
 
    immersiveProductPageToken,
 
    serpApiImmersiveProductUrl,
 
    multipleSourcesAvailable:
      booleanValue(
        result.multiple_sources
      ),
 
    rating:
      numberValue(
        result.rating
      ) ??
      undefined,
 
    reviewCount:
      numberValue(
        result.reviews
      ) ??
      undefined,
 
    ...listingClaims,
  } satisfies SearchRetailProduct;
 








 
  return product;
 }
 
 function getListingTotalPrice(
  product:
    SearchRetailProduct
 ) {
  return (
    product.bottlePrice +
    (
      product.estimatedShipping ??
      0
    )
  );
 }
 
 function normalizeRetailer(
  retailer:
    string
 ) {
  return normalizeText(
    retailer
  )
    .replace(
      /\b(?:com|inc|llc|online|marketplace|store|stores|shop)\b/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
 }
 
 function buildFallbackProductIdentity(
  product:
    SearchRetailProduct
 ) {
  return [
    normalizeCompact(
      product.productTitle
    ),
 
    normalizeCompact(
      product.brand
    ),
 
    normalizeCompact(
      product.dosage
    ),
 
    normalizeCompact(
      product.form
    ),
 
    product.capsulesPerBottle,
  ].join(
    "|"
  );
 }
 
 /*
 * Keep one offer for each exact product and retailer
 * combination.
 *
 * When the same retailer appears multiple times for
 * the same Google Shopping product, retain the least
 * expensive landed-price offer.
 */
 function deduplicateListings(
  products:
    SearchRetailProduct[]
 ) {
  const uniqueProducts =
    new Map<
      string,
      SearchRetailProduct
 >();
 
  for (
    const product of
    products
  ) {
    const productIdentity =
      product.shoppingProductId
        ? `shopping:${product.shoppingProductId}`
        : buildFallbackProductIdentity(
            product
          );
 
    const key =
      [
        productIdentity,
 
        normalizeRetailer(
          product.retailer
        ),
      ].join(
        "|"
      );
 
    const current =
      uniqueProducts.get(
        key
      );
 
    if (
      !current ||
      getListingTotalPrice(
        product
      ) <
        getListingTotalPrice(
          current
        )
    ) {
      uniqueProducts.set(
        key,
        product
      );
    }
  }
 
  return Array.from(
    uniqueProducts.values()
  );
 }
 
 function sanitizeProviderUrl(
  url:
    string
 ) {
  try {
    const parsedUrl =
      new URL(
        url
      );
 
    /*
     * Never place the private SerpApi key inside the
     * cache key or database response payload.
     */
    parsedUrl.searchParams.delete(
      "api_key"
    );
 
    parsedUrl.hash =
      "";
 
    parsedUrl.searchParams.sort();
 
    return parsedUrl.toString();
  } catch {
    return url
      .replace(
        /([?&])api_key=[^&]*/gi,
        "$1"
      )
      .replace(
        /\?&/,
        "?"
      )
      .replace(
        /[?&]$/,
        ""
      );
  }
 }
 
 function ensureApiKeyOnPaginationUrl({
  url,
  apiKey,
 }: {
  url:
    string;
 
  apiKey:
    string;
 }) {
  try {
    const parsedUrl =
      new URL(
        url
      );
 
    parsedUrl.searchParams.set(
      "api_key",
      apiKey
    );
 
    return parsedUrl.toString();
  } catch {
    return url;
  }
 }
 
 function buildCacheKey({
  url,
  pageNumber,
 }: {
  url:
    string;
 
  pageNumber:
    number;
 }) {
  const sanitizedUrl =
    sanitizeProviderUrl(
      url
    );
 
  const identity =
    [
      SERP_API_CACHE_VERSION,
      SERP_API_SOURCE_PROVIDER,
      SERP_API_SEARCH_ENGINE,
      SERP_API_COUNTRY_CODE,
      SERP_API_LANGUAGE,
      pageNumber,
      sanitizedUrl,
    ].join(
      "|"
    );
 
  return createHash(
    "sha256"
  )
    .update(
      identity
    )
    .digest(
      "hex"
    );
 }
 
 function getCacheExpiration(
  fetchedAt =
    new Date()
 ) {
  const ttlMilliseconds =
    getCacheTtlMinutes() *
    60 *
    1000;
 
  return new Date(
    fetchedAt.getTime() +
      ttlMilliseconds
  );
 }
 
 function parseCachedShoppingPage(
  payload:
    Prisma.JsonValue
 ): {
  results:
    SerpApiShoppingResult[];
 
  nextUrl:
    string | null;
 } | null {
  if (
    !payload ||
    typeof payload !==
      "object" ||
    Array.isArray(
      payload
    )
  ) {
    return null;
  }
 
  const candidate =
    payload as Record<
      string,
      unknown
 >;
 
  const shoppingResults =
    candidate
      .shopping_results;
 
  if (
    !Array.isArray(
      shoppingResults
    )
  ) {
    return null;
  }
 
  const pagination =
    candidate
      .serpapi_pagination;
 
  let nextUrl:
    string | null =
    null;
 
  if (
    pagination &&
    typeof pagination ===
      "object" &&
    !Array.isArray(
      pagination
    )
  ) {
    nextUrl =
      stringValue(
        (
          pagination as Record<
            string,
            unknown>
 
        ).next
      ) ||
      null;
  }
 
  return {
    results:
      shoppingResults as
        SerpApiShoppingResult[],
 
    nextUrl:
      nextUrl
        ? sanitizeProviderUrl(
            nextUrl
          )
        : null,
  };
 }
 


 function buildCachePayload({
  results,
  nextUrl,
 }: {
  results:
    SerpApiShoppingResult[];
 
  nextUrl:
    string | null;
 }): Prisma.InputJsonObject {
  /*
   * SerpApi results originate from parsed JSON, but
   * their local TypeScript fields are typed as
   * unknown. Convert them into Prisma's JSON input
   * type before writing them to PostgreSQL.
   */
  const jsonResults =
    results as unknown as
      Prisma.InputJsonArray;
 
  return {
    shopping_results:
      jsonResults,
 
    serpapi_pagination:
      nextUrl
        ? {
            next:
              sanitizeProviderUrl(
                nextUrl
              ),
          }
        : {},
  };
 }
 



 
 async function readCachedShoppingPage({
  cacheKey,
  query,
  pageNumber,
 }: {
  cacheKey:
    string;
 
  query:
    string;
 
  pageNumber:
    number;
 }): Promise<
  ShoppingPageResult | null
 >{
  try {
    const cachedPage =
      await prisma
        .marketplaceSearchCache
        .findUnique({
          where: {
            cacheKey,
          },
        });
 
    if (
      !cachedPage
    ) {
      return null;
    }
 
    const now =
      new Date();
 
    if (
      cachedPage
        .expiresAt <=
      now
    ) {
      console.log(
        "VidaSearch SerpApi cache entry expired:",
        {
          query,
 
          pageNumber,
 
          fetchedAt:
            cachedPage
              .fetchedAt,
 
          expiresAt:
            cachedPage
              .expiresAt,
        }
      );
 
      return null;
    }
 
    const parsedPayload =
      parseCachedShoppingPage(
        cachedPage
          .responsePayload
      );
 
    if (
      !parsedPayload
    ) {
      console.warn(
        "VidaSearch SerpApi cache payload was invalid:",
        {
          query,
 
          pageNumber,
 
          cacheKey,
        }
      );
 
      return null;
    }
 
    /*
     * Cache access accounting is useful for measuring
     * actual SerpApi savings. It must never block or
     * fail the customer search.
     */
    void prisma
      .marketplaceSearchCache
      .update({
        where: {
          cacheKey,
        },
 
        data: {
          lastAccessedAt:
            now,
 
          accessCount: {
            increment:
              1,
          },
        },
      })
      .catch(
        (error) => {
          console.warn(
            "VidaSearch SerpApi cache access update failed:",
            {
              query,
 
              pageNumber,
 
              error:
                error instanceof
                  Error
                  ? error.message
                  : String(
                      error
                    ),
            }
          );
        }
      );
 
    console.log(
      "VidaSearch SerpApi cache hit:",
      {
        query,
 
        pageNumber,
 
        rawResultCount:
          parsedPayload
            .results
            .length,
 
        hasNextPage:
          Boolean(
            parsedPayload
              .nextUrl
          ),
 
        fetchedAt:
          cachedPage
            .fetchedAt,
 
        expiresAt:
          cachedPage
            .expiresAt,
 
        previousAccessCount:
          cachedPage
            .accessCount,
      }
    );
 
    return {
      results:
        parsedPayload
          .results,
 
      nextUrl:
        parsedPayload
          .nextUrl,
 
      cacheStatus:
        "HIT",
    };
  } catch (
    error
  ) {
    /*
     * The cache is an optimization only. Database
     * cache errors must fall through to live SerpApi.
     */
    console.error(
      "VidaSearch SerpApi cache lookup failed:",
      {
        query,
 
        pageNumber,
 
        error:
          error instanceof
            Error
            ? error.message
            : String(
                error
              ),
      }
    );
 
    return null;
  }
 }
 
 async function writeCachedShoppingPage({
  cacheKey,
  query,
  pageNumber,
  results,
  nextUrl,
 }: {
  cacheKey:
    string;
 
  query:
    string;
 
  pageNumber:
    number;
 
  results:
    SerpApiShoppingResult[];
 
  nextUrl:
    string | null;
 }) {
  const fetchedAt =
    new Date();
 
  const expiresAt =
    getCacheExpiration(
      fetchedAt
    );
 
  const responsePayload =
    buildCachePayload({
      results,
 
      nextUrl,
    });
 
  try {
    await prisma
      .marketplaceSearchCache
      .upsert({
        where: {
          cacheKey,
        },
 
        create: {
          cacheKey,
 
          sourceProvider:
            SERP_API_SOURCE_PROVIDER,
 
          searchEngine:
            SERP_API_SEARCH_ENGINE,
 
          query,
 
          normalizedQuery:
            normalizeText(
              query
            ),
 
          countryCode:
            SERP_API_COUNTRY_CODE,
 
          language:
            SERP_API_LANGUAGE,
 
          pageNumber,
 
          responsePayload,
 
          rawResultCount:
            results.length,
 
          fetchedAt,
 
          expiresAt,
 
          lastAccessedAt:
            fetchedAt,
 
          accessCount:
            0,
        },
 
        update: {
          query,
 
          normalizedQuery:
            normalizeText(
              query
            ),
 
          pageNumber,
 
          responsePayload,
 
          rawResultCount:
            results.length,
 
          fetchedAt,
 
          expiresAt,
 
          lastAccessedAt:
            fetchedAt,
 
          accessCount:
            0,
        },
      });
 
    console.log(
      "VidaSearch SerpApi cache stored:",
      {
        query,
 
        pageNumber,
 
        rawResultCount:
          results.length,
 
        hasNextPage:
          Boolean(
            nextUrl
          ),
 
        expiresAt,
      }
    );
  } catch (
    error
  ) {
    /*
     * A cache write failure must not discard the live
     * marketplace response already obtained.
     */
    console.error(
      "VidaSearch SerpApi cache write failed:",
      {
        query,
 
        pageNumber,
 
        error:
          error instanceof
            Error
            ? error.message
            : String(
                error
              ),
      }
    );
  }
 }
 
 async function fetchShoppingPage({
  url,
  query,
  pageNumber,
  apiKey,
 }: {
  url:
    string;
 
  query:
    string;
 
  pageNumber:
    number;
 
  apiKey:
    string;
 }): Promise<
  ShoppingPageResult
 >{
  const sanitizedUrl =
    sanitizeProviderUrl(
      url
    );
 
  const cacheKey =
    buildCacheKey({
      url:
        sanitizedUrl,
 
      pageNumber,
    });
 
  const bypassCache =
    isSearchCacheBypassed();
 
  if (
    !bypassCache
  ) {
    const cachedPage =
      await readCachedShoppingPage({
        cacheKey,
 
        query,
 
        pageNumber,
      });
 
    if (
      cachedPage
    ) {
      return cachedPage;
    }
  }
 
  console.log(
    bypassCache
      ? "VidaSearch SerpApi cache bypassed:"
      : "VidaSearch SerpApi cache miss:",
    {
      query,
 
      pageNumber,
 
      cacheTtlMinutes:
        getCacheTtlMinutes(),
    }
  );
 
  const requestUrl =
    ensureApiKeyOnPaginationUrl({
      url:
        sanitizedUrl,
 
      apiKey,
    });
 
  const response =
    await fetch(
      requestUrl,
      {
        method:
          "GET",
 
        cache:
          "no-store",
 
        headers: {
          Accept:
            "application/json",
        },
      }
    );
 
  let data:
    SerpApiResponse;
 
  try {
    data =
      (await response.json()) as
        SerpApiResponse;
  } catch {
    throw new Error(
      `SerpApi returned invalid JSON for "${query}" on page ${pageNumber}.`
    );
  }
 
  if (
    !response.ok
  ) {
    throw new Error(
      stringValue(
        data.error
      ) ||
      `SerpApi search failed with status ${response.status} for "${query}" on page ${pageNumber}.`
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
 
  const results =
    Array.isArray(
      data.shopping_results
    )
      ? data.shopping_results as
          SerpApiShoppingResult[]
      : [];
 
  const rawNextUrl =
    stringValue(
      data
        .serpapi_pagination
        ?.next
    ) ||
    null;
 
  const nextUrl =
    rawNextUrl
      ? sanitizeProviderUrl(
          rawNextUrl
        )
      : null;
 
  if (
    !bypassCache
  ) {
    
    
    
    void writeCachedShoppingPage({
      cacheKey,
     
      query,
     
      pageNumber,
     
      results,
     
      nextUrl,
     });




  }
 
  console.log(
    "VidaSearch shopping page completed:",
    {
      query,
 
      pageNumber,
 
      rawResultCount:
        results.length,
 
      hasNextPage:
        Boolean(
          nextUrl
        ),
 
      cacheStatus:
        bypassCache
          ? "BYPASS"
          : "MISS",
    }
  );
 
  return {
    results,
 
    nextUrl,
 
    cacheStatus:
      bypassCache
        ? "BYPASS"
        : "MISS",
  };
 }
 
 async function fetchShoppingResults({
  query,
  apiKey,
  maxPages,
  maxRetailListings,
 }: {
  query:
    string;
 
  apiKey:
    string;
 
  maxPages:
    number;
 
  maxRetailListings:
    number;
 }): Promise<
  ShoppingQueryResult
 >{
  const params =
    new URLSearchParams({
      engine:
        SERP_API_SEARCH_ENGINE,
 
      q:
        query,
 
      gl:
        SERP_API_COUNTRY_CODE,
 
      hl:
        SERP_API_LANGUAGE,
 
      direct_link:
        "true",
    });
 
  let nextUrl:
    string | null =
    `${SERP_API_ENDPOINT}?${params.toString()}`;
 
  const results:
    SerpApiShoppingResult[] =
    [];
 
  const visitedUrls =
    new Set<string>();
 
  let pageNumber =
    1;
 
  let pagesFetched =
    0;
 
  let cacheHits =
    0;
 
  let cacheMisses =
    0;
 
  let cacheBypasses =
    0;
 
  let serpApiRequests =
    0;
 
  while (
    nextUrl &&
    pageNumber <=
      maxPages &&
    results.length <
      maxRetailListings
  ) {
    const sanitizedRequestUrl =
      sanitizeProviderUrl(
        nextUrl
      );
 
    if (
      visitedUrls.has(
        sanitizedRequestUrl
      )
    ) {
      console.warn(
        "VidaSearch pagination stopped because SerpApi returned a repeated next-page URL:",
        {
          query,
 
          pageNumber,
        }
      );
 
      break;
    }
 
    visitedUrls.add(
      sanitizedRequestUrl
    );
 
    const page =
      await fetchShoppingPage({
        url:
          sanitizedRequestUrl,
 
        query,
 
        pageNumber,
 
        apiKey,
      });
 
    pagesFetched +=
      1;
 
    if (
      page.cacheStatus ===
        "HIT"
    ) {
      cacheHits +=
        1;
    }
 
    if (
      page.cacheStatus ===
        "MISS"
    ) {
      cacheMisses +=
        1;
 
      serpApiRequests +=
        1;
    }
 
    if (
      page.cacheStatus ===
        "BYPASS"
    ) {
      cacheBypasses +=
        1;
 
      serpApiRequests +=
        1;
    }
 
    results.push(
      ...page.results
    );
 
    nextUrl =
      page.nextUrl;
 
    if (
      page.results.length ===
        0
    ) {
      break;
    }
 
    pageNumber +=
      1;
  }
 
  const limitedResults =
    results.slice(
      0,
      maxRetailListings
    );
 
  console.log(
    "VidaSearch paginated query completed:",
    {
      query,
 
      requestedMaxPages:
        maxPages,
 
      pagesFetched,
 
      cacheHits,
 
      cacheMisses,
 
      cacheBypasses,
 
      serpApiRequests,
 
      rawResultCount:
        limitedResults.length,
    }
  );
 
  return {
    results:
      limitedResults,
 
    cacheHits,
 
    cacheMisses,
 
    cacheBypasses,
 
    serpApiRequests,
 
    pagesFetched,
  };
 }
 
 export async function findSearchProducts(
  request:
    ProductSearchRequest
 ): Promise<
  SearchRetailProduct[]
 >{
  const apiKey =
    process.env
      .SERPAPI_API_KEY;
 
  if (
    !apiKey
  ) {
    throw new Error(
      "SERPAPI_API_KEY is not configured."
    );
  }
 
  const maxPages =
    clampInteger({
      value:
        request.maxPages,
 
      fallback:
        DEFAULT_MAX_PAGES,
 
      minimum:
        1,
 
      maximum:
        MAX_ALLOWED_PAGES,
    });
 
  const maxRetailListings =
    clampInteger({
      value:
        request
          .maxRetailListings,
 
      fallback:
        DEFAULT_MAX_RETAIL_LISTINGS,
 
      minimum:
        20,
 
      maximum:
        MAX_ALLOWED_RETAIL_LISTINGS,
    });
 
  const queries =
    buildSearchQueries(
      request
    );
 
  console.log(
    "VidaSearch expanded retailer search started:",
    {
      queries,
 
      supplement:
        request.supplement,
 
      brand:
        request.brand ??
        null,
 
      searchMode:
        request.searchMode ??
        "supplement",
 
      expandAliases:
        request.expandAliases ??
        true,
 
      maxPages,
 
      maxRetailListings,
 
      searchCacheBypassed:
        isSearchCacheBypassed(),
 
      searchCacheTtlMinutes:
        getCacheTtlMinutes(),
    }
  );
 
  /*
   * Pages within one query are fetched sequentially.
   * Distinct search queries may run concurrently.
   */
  const queryResults =
    await Promise.allSettled(
      queries.map(
        (query) =>
          fetchShoppingResults({
            query,
 
            apiKey,
 
            maxPages,
 
            maxRetailListings,
          })
      )
    );
 
  const successfulQueries =
    queryResults.flatMap(
      (result) =>
        result.status ===
          "fulfilled"
          ? [
              result.value,
            ]
          : []
    );
 
  const successfulResults =
    successfulQueries.flatMap(
      (result) =>
        result.results
    );
 
  const failedQueries =
    queryResults.flatMap(
      (
        result,
        index
      ) =>
        result.status ===
          "rejected"
          ? [
              {
                query:
                  queries[index],
 
                error:
                  result.reason instanceof
                    Error
                    ? result.reason
                        .message
                    : String(
                        result.reason
                      ),
              },
            ]
          : []
    );
 
  if (
    failedQueries.length >
      0
  ) {
    console.error(
      "VidaSearch expanded queries failed:",
      failedQueries
    );
  }
 
  if (
    successfulResults.length ===
      0 &&
    failedQueries.length ===
      queries.length
  ) {
    throw new Error(
      failedQueries[0]
        ?.error ||
      "All supplement searches failed."
    );
  }
 
  const totalCacheHits =
    successfulQueries.reduce(
      (
        total,
        result
      ) =>
        total +
        result.cacheHits,
      0
    );
 
  const totalCacheMisses =
    successfulQueries.reduce(
      (
        total,
        result
      ) =>
        total +
        result.cacheMisses,
      0
    );
 
  const totalCacheBypasses =
    successfulQueries.reduce(
      (
        total,
        result
      ) =>
        total +
        result.cacheBypasses,
      0
    );
 
  const totalSerpApiRequests =
    successfulQueries.reduce(
      (
        total,
        result
      ) =>
        total +
        result.serpApiRequests,
      0
    );
 
  const totalPagesProcessed =
    successfulQueries.reduce(
      (
        total,
        result
      ) =>
        total +
        result.pagesFetched,
      0
    );
 
  const rawResults =
    successfulResults;
 
  const mappedListings =
    rawResults
      .map(
        (result) =>
          mapShoppingResult(
            result,
            request
          )
      )
      .filter(
        (
          product
        ): product is SearchRetailProduct =>
          product !==
          null
      );
 
  /*
   * Remove duplicate retailer listings before any
   * optional live enrichment. This keeps the number
   * of titles sent for enrichment as small as
   * possible.
   */
  const initiallyUniqueListings =
    deduplicateListings(
      mappedListings
    ).slice(
      0,
      maxRetailListings
    );
 
  /*
   * Apply fast database and parser-based resolution.
   * This does not call OpenAI.
   */
  const brandResolvedListings =
    await resolveSearchListingBrands({
      listings:
        initiallyUniqueListings,
 
      request,
    });
 
  /*
   * Resolve database-backed canonical brand names
   * before final deduplication and product grouping.
   *
   * This ensures aliases such as "NOW Foods" can be
   * converted to the canonical database name "NOW"
   * before product identities are constructed.
   */
  const uniqueListings =
    deduplicateListings(
      brandResolvedListings
    ).slice(
      0,
      maxRetailListings
    );
 
  const brandSourceCounts =
    uniqueListings.reduce(
      (
        counts:
          Record<
            string,
            number
 >,
 
        listing
      ) => {
        const brand =
          listing.brand ||
          "Unknown Brand";
 
        counts[
          brand
        ] =
          (
            counts[
              brand
            ] ??
            0
          ) +
          1;
 
        return counts;
      },
      {}
    );
 
  console.log(
    "VidaSearch retailer search completed:",
    {
      queries,
 
      searchMode:
        request.searchMode ??
        "supplement",
 
      rawResultCount:
        rawResults.length,
 
      mappedResultCount:
        mappedListings.length,
 
      brandResolvedResultCount:
        brandResolvedListings.length,
 
      duplicateListingCount:
        Math.max(
          0,
          mappedListings.length -
            uniqueListings.length
        ),
 
      uniqueRetailerListingCount:
        uniqueListings.length,
 
      unknownBrandCount:
        uniqueListings.filter(
          (listing) =>
            listing.brand ===
              "Unknown Brand"
        ).length,
 
      listingsWithImmersiveToken:
        uniqueListings.filter(
          (listing) =>
            Boolean(
              listing
                .immersiveProductPageToken
            )
        ).length,
 
      listingsWithMultipleSources:
        uniqueListings.filter(
          (listing) =>
            listing
              .multipleSourcesAvailable
        ).length,
 
      cacheSummary: {
        pagesProcessed:
          totalPagesProcessed,
 
        cacheHits:
          totalCacheHits,
 
        cacheMisses:
          totalCacheMisses,
 
        cacheBypasses:
          totalCacheBypasses,
 
        serpApiRequests:
          totalSerpApiRequests,
 
        serpApiRequestsAvoided:
          totalCacheHits,
      },
 
      brandCounts:
        brandSourceCounts,
 
      retailerCounts:
        uniqueListings.reduce(
          (
            counts:
              Record<
                string,
                number
 >,
 
            listing
          ) => {
            counts[
              listing.retailer
            ] =
              (
                counts[
                  listing.retailer
                ] ??
                0
              ) +
              1;
 
            return counts;
          },
          {}
        ),
    }
  );
 
  return uniqueListings;
 }
 