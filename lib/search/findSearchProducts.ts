{/* import {
  writeFileSync,
 } from "node:fs";
 
 import {
  join,
 } from "node:path"; */}


import type {
  SearchDosageUnit,
  SearchProductForm,
  SearchRetailProduct,
 } from "./searchRetailProduct";
 


import {
 getSupplementAliases,
 getSupplementSearchTerms,
} from "@/lib/pricing/supplementAliases";




 
 import type {
  ProductSearchRequest,
 } from "@/app/api/pricing/providers/providerTypes";
 
 const SERP_API_ENDPOINT =
  "https://serpapi.com/search.json";
 
 const MAX_RETAIL_LISTINGS = 80;
 
 type SerpApiShoppingResult = {
  title?: unknown;
  source?: unknown;
 
  /*
   * Google Shopping destination links.
   *
   * These frequently point to Google rather
   * than directly to the merchant, so they
   * must not be treated as merchant URLs.
   */
  link?: unknown;
  product_link?: unknown;
 
  product_id?: unknown;
 
  immersive_product_page_token?:
    unknown;
 
  serpapi_immersive_product_api?:
    unknown;
 
  multiple_sources?: unknown;
 
  thumbnail?: unknown;
  serpapi_thumbnail?: unknown;
 
  price?: unknown;
  extracted_price?: unknown;
 
  rating?: unknown;
  reviews?: unknown;
 
  delivery?: unknown;
  snippet?: unknown;
  extensions?: unknown;
 };
 
 type SerpApiResponse = {
  shopping_results?: unknown;
  error?: unknown;
 };
 
 function normalizeText(
  value: string
 ) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .trim();
 }
 
 function normalizeCompact(
  value: string
 ) {
  return normalizeText(
    value
  ).replace(/\s+/g, "");
 }
 
 function stringValue(
  value: unknown
 ): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
 }
 
 function numberValue(
  value: unknown
 ): number | null {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(value)
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
  value: unknown
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
    return value > 0;
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
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes"
    );
  }
 
  /*
   * Some SerpApi results may represent
   * multiple sources as an array.
   */
  if (
    Array.isArray(value)
  ) {
    return value.length > 1;
  }
 
  return false;
 }
 



 function buildSearchQueries({
  supplement,
  brand,
 }: ProductSearchRequest) {
  const requestedQuery = [
    brand?.trim(),
    supplement.trim(),
    "supplement",
  ]
    .filter(Boolean)
    .join(" ");
 
  const expandedQueries =
    getSupplementSearchTerms(
      supplement
    ).map(
      (searchTerm) =>
        [
          brand?.trim(),
          searchTerm,
        ]
          .filter(Boolean)
          .join(" ")
    );
 
  /*
   * Keep the user's original request first,
   * then supplement it with controlled
   * alias searches.
   *
   * Four total SerpApi searches provides
   * breadth without issuing every possible
   * alias query.
   */
  return Array.from(
    new Set([
      requestedQuery,
      ...expandedQueries,
    ])
  ).slice(
    0,
    4
  );
 }
 





 
 function getExtensionsText(
  extensions: unknown
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
    .join(" ");
 }
 
 function extractForm(
  searchableText: string
 ): SearchProductForm {
  const text =
    searchableText.toLowerCase();
 
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
  form: SearchProductForm
 ): SearchRetailProduct["unitLabel"] {
  switch (form) {
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
  form: SearchProductForm
 ) {
  /*
   * Unknown and unspecified forms are not
   * considered eligible.
   *
   * Softgels are also excluded for launch.
   */
  return (
    form === "Capsule" ||
    form === "Tablet" ||
    form === "Caplet" ||
    form === "Gummy"
  );
 }
 
 function extractCount(
  searchableText: string
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
 
    if (!match) {
      continue;
    }
 
    const count =
      Number(match[1]);
 
    if (
      Number.isInteger(
        count
      ) &&
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
 
    if (!match) {
      continue;
    }
 
    const servingSize =
      match[1]
        ? Number(match[1])
        : 1;
 
    if (
      Number.isInteger(
        servingSize
      ) &&
      servingSize > 0 &&
      servingSize <= 20
    ) {
      return servingSize;
    }
  }
 
  return 1;
 }
 
 type ExtractedDosage = {
  displayValue: string;
 
  amount: number | null;
 
  unit: SearchDosageUnit;
 
  isPerServing:
    boolean | null;
 };
 
 function normalizeDosageUnit(
  unit: string
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
  amount: number;
 
  unit:
    Exclude<
      SearchDosageUnit,
      null
 >;
 }) {
  const formattedAmount =
    Number.isInteger(
      amount
    )
      ? String(amount)
      : String(amount).replace(
          /\.0+$/,
          ""
        );
 
  return `${formattedAmount} ${unit}`;
 }
 
 function extractDosage(
  searchableText: string,
  requestedDosage?: string
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
        perServingMatch[1].replace(
          /,/g,
          ""
        )
      );
 
    const unit =
      normalizeDosageUnit(
        perServingMatch[2]
      );
 
    if (
      Number.isFinite(amount) &&
      amount > 0 &&
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
 
        isPerServing: true,
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
        dosageMatch[1].replace(
          /,/g,
          ""
        )
      );
 
    const unit =
      normalizeDosageUnit(
        dosageMatch[2]
      );
 
    if (
      Number.isFinite(amount) &&
      amount > 0 &&
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
    requestedDosage?.trim() ||
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
        requestedMatch[1].replace(
          /,/g,
          ""
        )
      );
 
    const unit =
      normalizeDosageUnit(
        requestedMatch[2]
      );
 
    if (
      Number.isFinite(amount) &&
      amount > 0 &&
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
 
        isPerServing: null,
      };
    }
  }
 
  return {
    displayValue:
      requested,
 
    amount: null,
 
    unit: null,
 
    isPerServing: null,
  };
 }
 
 function extractShipping(
  delivery: string
 ) {
  if (!delivery) {
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
 
  if (!match) {
    return 0;
  }
 
  const shipping =
    Number(match[1]);
 
  return Number.isFinite(
    shipping
  )
    ? shipping
    : 0;
 }
 
 function supplementMatches(
  searchableText: string,
  requestedSupplement: string
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
    (alias) =>
      normalizedResult.includes(
        normalizeText(alias)
      )
  );
 }
 
 function brandMatches(
  searchableText: string,
  requestedBrand?: string
 ) {
  if (
    !requestedBrand?.trim()
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
 
 function removeTrailingDescriptors(
  candidate: string
 ) {
  const descriptorPattern =
    /\b(?:triple|double|advanced|premium|complete|complex|blend|formula|high absorption|maximum strength|max strength|extra strength|ultra strength|high potency|chelated|buffered|glycinate|citrate|oxide|pure|liposomal|zero sugar|magtein)\s*$/i;
 
  let cleaned =
    candidate.trim();
 
  let previous = "";
 
  while (
    cleaned &&
    cleaned !== previous
  ) {
    previous = cleaned;
 
    cleaned = cleaned
      .replace(
        descriptorPattern,
        ""
      )
      .trim();
  }
 
  return cleaned;
 }
 
 function extractLikelyBrand(
  title: string,
  supplement: string
 ) {
  const cleanedTitle =
    title
      .replace(
        /[|()[\]–—]/g,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();
 
  const byBrandMatch =
    cleanedTitle.match(
      /\bby\s+(.+?)\s*$/i
    );
 
  if (
    byBrandMatch?.[1]
  ) {
    return byBrandMatch[1]
      .replace(/[®™]/g, "")
      .trim();
  }
 
  const aliases =
    getSupplementAliases(
      supplement
    )
      .map((alias) =>
        alias.trim()
      )
      .filter(Boolean)
      .sort(
        (left, right) =>
          right.length -
          left.length
      );
 
  let earliestMatch:
    {
      index: number;
      length: number;
    } | null = null;
 
  for (
    const alias of
    aliases
  ) {
    const escapedAlias =
      alias.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
 
    const aliasPattern =
      escapedAlias.replace(
        /\s+/g,
        "\\s+"
      );
 
    const match =
      new RegExp(
        `\\b${aliasPattern}\\b`,
        "i"
      ).exec(
        cleanedTitle
      );
 
    if (
      match &&
      (
        !earliestMatch ||
        match.index <
          earliestMatch.index
      )
    ) {
      earliestMatch = {
        index:
          match.index,
 
        length:
          match[0].length,
      };
    }
  }
 
  if (
    earliestMatch &&
    earliestMatch.index > 0
  ) {
    let candidate =
      cleanedTitle
        .slice(
          0,
          earliestMatch.index
        )
        .replace(
          /^(?:buy|shop|new|best|official)\s+/i,
          ""
        )
        .trim();
 
    candidate =
      removeTrailingDescriptors(
        candidate
      );
 
    if (
      candidate &&
      !/^(?:the|a|an|new)$/i.test(
        candidate
      )
    ) {
      return candidate;
    }
  }
 
  if (
    earliestMatch &&
    earliestMatch.index === 0
  ) {
    const afterSupplement =
      cleanedTitle
        .slice(
          earliestMatch.length
        )
        .replace(
          /^[,\s]+/,
          ""
        )
        .replace(
          /^(?:oxide|glycinate|citrate|bisglycinate|complex|l[\s-]?threonate)\b\s*/i,
          ""
        )
        .replace(
          /^\d+(?:\.\d+)?\s*(?:mcg|mg|g|iu)\b\s*/i,
          ""
        )
        .replace(
          /^(?:capsules?|caps?|tablets?|tabs?|soft[\s-]?gels?|caplets?|vegcaps?)\b\s*/i,
          ""
        )
        .replace(/[®™]/g, "")
        .trim();
 
    /*
     * Do not interpret dosage or dosage-form
     * text as a brand.
     */
    if (
      !afterSupplement ||
      /^\d/.test(
        afterSupplement
      ) ||
      /^(?:mcg|mg|g|iu|capsules?|caps?|tablets?|tabs?|soft[\s-]?gels?|caplets?|vegcaps?)\b/i.test(
        afterSupplement
      )
    ) {
      return "Unknown Brand";
    }
 
    return afterSupplement;
  }
 
  const fallback =
    cleanedTitle
      .split(
        /\b(?:\d+(?:\.\d+)?\s*(?:mcg|mg|g|iu)|capsules?|caps?|tablets?|tabs?|soft[\s-]?gels?|caplets?|vegcaps?|gummies|gummy|powder|liquid)\b/i
      )[0]
      .replace(
        /^(?:buy|shop|new|best|official)\s+/i,
        ""
      )
      .trim();
 
  const cleanedFallback =
    removeTrailingDescriptors(
      fallback
    );
 
  if (
    !cleanedFallback ||
    normalizeCompact(
      cleanedFallback
    ) ===
      normalizeCompact(
        supplement
      )
  ) {
    return "Unknown Brand";
  }
 
  return cleanedFallback;
 }
 
 function extractListingClaims(
  searchableText: string
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
 
 function mapShoppingResult(
  result: SerpApiShoppingResult,
  request: ProductSearchRequest
 ): SearchRetailProduct | null {
  const title =
    stringValue(
      result.title
    );
 
  if (!title) {
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
 
  const searchableText = [
    title,
    snippet,
    extensions,
  ]
    .filter(Boolean)
    .join(" ");
 
  if (
    !supplementMatches(
      searchableText,
      request.supplement
    )
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
    bottlePrice == null ||
    bottlePrice <= 0
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
    ) ?? 100;
 
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
      result.serpapi_thumbnail
    ) ||
    undefined;
 
  const brand =
    request.brand?.trim() ||
    extractLikelyBrand(
      title,
      request.supplement
    );
 
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
 
    brand,
 
    supplement:
      request.supplement.trim(),
 
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
     * Do not expose the Google Shopping page
     * as though it were a direct vendor URL.
     *
     * The direct merchant URL will be
     * resolved from the immersive product
     * stores API when Buy Bottle is clicked.
     */
    url: undefined,
 
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
      ) ?? undefined,
 
    reviewCount:
      numberValue(
        result.reviews
      ) ?? undefined,
 
    ...listingClaims,
  } satisfies SearchRetailProduct;
 
  console.log(
    "VitaSearch retailer listing mapped:",
    {
      productTitle:
        product.productTitle,
 
      retailer:
        product.retailer,
 
      brand:
        product.brand,
 
      dosage:
        product.dosage,
 
      dosageAmount:
        product.dosageAmount,
 
      dosageUnit:
        product.dosageUnit,
 
      dosageIsPerServing:
        product
          .dosageIsPerServing,
 
      form:
        product.form,
 
      unitLabel:
        product.unitLabel,
 
      vitaPouchFormEligible:
        product
          .vitaPouchFormEligible,
 
      bottlePrice:
        product.bottlePrice,
 
      count:
        product
          .capsulesPerBottle,
 
      shoppingProductId:
        product
          .shoppingProductId ??
        null,
 
      hasImmersiveProductPageToken:
        Boolean(
          product
            .immersiveProductPageToken
        ),
 
      hasSerpApiImmersiveProductUrl:
        Boolean(
          product
            .serpApiImmersiveProductUrl
        ),
 
      multipleSourcesAvailable:
        product
          .multipleSourcesAvailable,
 
      /*
       * Diagnostic only. This is deliberately
       * not assigned to product.url.
       */
      googleShoppingUrl:
        googleShoppingUrl ??
        null,
    }
  );
 
  return product;
 }
 
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
    const key = [
      normalizeCompact(
        product.retailer
      ),
 
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
 
      product.bottlePrice.toFixed(
        2
      ),
 
      product.capsulesPerBottle,
 
      product.shoppingProductId ??
        "",
 
      product
        .immersiveProductPageToken ??
        "",
    ].join("|");
 
    if (
      !uniqueProducts.has(key)
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
 

 async function fetchShoppingResults({
  query,
  apiKey,
 }: {
  query: string;
  apiKey: string;
 }): Promise<
  SerpApiShoppingResult[]
 >{
  const params =
    new URLSearchParams({
      engine:
        "google_shopping",
 
      q:
        query,
 
      api_key:
        apiKey,
 
      gl:
        "us",
 
      hl:
        "en",
 
      direct_link:
        "true",
    });
 
  const response =
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
      `SerpApi returned invalid JSON for "${query}".`
    );
  }
 
  if (!response.ok) {
    throw new Error(
      stringValue(
        data.error
      ) ||
        `SerpApi search failed with status ${response.status} for "${query}".`
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
      ? (
          data.shopping_results as
            SerpApiShoppingResult[]
        )
      : [];
 
  console.log(
    "VidaSearch expanded query completed:",
    {
      query,
 
      rawResultCount:
        results.length,
    }
  );
 
  return results;
 }


 export async function findSearchProducts(
  request: ProductSearchRequest
 ): Promise<
  SearchRetailProduct[]
 >{
  const apiKey =
    process.env.SERPAPI_API_KEY;
 
  if (!apiKey) {
    throw new Error(
      "SERPAPI_API_KEY is not configured."
    );
  }
 




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
  }
);

const queryResults =
  await Promise.allSettled(
    queries.map(
      (query) =>
        fetchShoppingResults({
          query,
          apiKey,
        })
    )
  );

const successfulResults =
  queryResults.flatMap(
    (result) =>
      result.status ===
      "fulfilled"
        ? result.value
        : []
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

/*
 * Results from all successful query
 * expansions are validated against the
 * original requested supplement below.
 */
const rawResults =
  successfulResults;










       

      


 
  const mappedListings =
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
        ): product is SearchRetailProduct =>
          product !== null
      );
 
  const uniqueListings =
    deduplicateListings(
      mappedListings
    ).slice(
      0,
      MAX_RETAIL_LISTINGS
    );
 



    console.log(
      "VitaSearch retailer search completed:",
      {
        queries,
     
        rawResultCount:
          rawResults.length,
     
        mappedResultCount:
          mappedListings.length,
     
        uniqueRetailerListingCount:
          uniqueListings.length,
     
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
     
        retailerCounts:
          uniqueListings.reduce(
            (
              counts:
                Record<
                  string,
                  number>
     ,
              listing
            ) => {
              counts[
                listing.retailer
              ] =
                (
                  counts[
                    listing.retailer
                  ] ?? 0
                ) + 1;
     
              return counts;
            },
            {}
          ),
      }
     );
     


     {/* const rawVendorDiagnostics =
      rawResults.filter(
        (result) => {
          const title =
            normalizeText(
              stringValue(
                result.title
              )
            );
     
          const source =
            normalizeText(
              stringValue(
                result.source
              )
            );
     
          return (
            title.includes(
              "magnesium"
            ) &&
            (
              title.includes(
                "now"
              ) ||
              source.includes(
                "walmart"
              ) ||
              source.includes(
                "cvs"
              )
            )
          );
        }
      );
     
     const debugFilePath =
      join(
        process.cwd(),
        "serpapi-shopping-debug.json"
      );
     
     writeFileSync(
      debugFilePath,
      JSON.stringify(
        {
          generatedAt:
            new Date().toISOString(),
     
          query,
     
          matchingResultCount:
            rawVendorDiagnostics.length,
     
          matchingResults:
            rawVendorDiagnostics,
        },
        null,
        2
      ),
      "utf8"
     );
     
     console.log(
      "VitaSearch raw shopping diagnostics written:",
      debugFilePath
     );*/}
     
     return uniqueListings;
     
     






 }