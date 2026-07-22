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
 
 /*
 * These are established supplement and wellness
 * brands commonly encountered in shopping results.
 *
 * The list is used only to recognize a brand at the
 * beginning of a product title. It does not control
 * which products may appear in search.
 */
 const KNOWN_BRANDS = [
  "21st Century",
  "Advanced Orthomolecular Research",
  "American Health",
  "Ancient Nutrition",
  "Arthur Andrew Medical",
  "Barlean's",
  "Best Naturals",
  "Bluebonnet Nutrition",
  "Bronson",
  "Bulletproof",
  "Carlson Labs",
  "Centrum",
  "ChildLife Essentials",
  "Codeage",
  "Country Life",
  "Designs for Health",
  "Doctor's Best",
  "Douglas Laboratories",
  "Dr. Berg",
  "Dr. Mercola",
  "Emergen-C",
  "Enzymedica",
  "Equate",
  "Flintstones",
  "Garden of Life",
  "Gaia Herbs",
  "GNC",
  "Jarrow Formulas",
  "KAL",
  "Kirkland Signature",
  "Klaire Labs",
  "Life Extension",
  "LifeSeasons",
  "MaryRuth Organics",
  "MegaFood",
  "Metagenics",
  "Nature Made",
  "Nature's Answer",
  "Nature's Bounty",
  "Nature's Plus",
  "Nature's Truth",
  "Nature's Way",
  "Nordic Naturals",
  "NOW Foods",
  "Nutricost",
  "NutraBio",
  "NutraChamps",
  "OLLY",
  "One A Day",
  "Ortho Molecular Products",
  "Pure Encapsulations",
  "Qunol",
  "Rainbow Light",
  "Renew Life",
  "Schiff",
  "Seeking Health",
  "Solgar",
  "Spring Valley",
  "Sports Research",
  "Swanson",
  "Thorne",
  "Trace Minerals",
  "Unisom",
  "Up&Up",
  "Vital Proteins",
  "Vitafusion",
  "Vitamin Shoppe",
  "Viva Naturals",
  "Walgreens",
  "Webber Naturals",
  "Wiley's Finest",
  "Xymogen",
  "Zahler",
  "Zarbee's",
  "Zenwise Health",
 ] as const;
 
 const BRAND_STOP_PHRASES = [
  "sleep aid",
  "sleep aids",
  "sleep support",
  "mood support",
  "mood balance",
  "stress support",
  "calm support",
  "brain support",
  "focus support",
  "immune support",
  "digestive support",
  "joint support",
  "heart support",
  "energy support",
  "hair skin and nails",
  "dietary supplement",
  "vitamin supplement",
  "mineral supplement",
 ] as const;
 
 const BRAND_STOP_WORDS = new Set([
  "supplement",
  "supplements",
  "vitamin",
  "vitamins",
  "mineral",
  "minerals",
  "melatonin",
  "magnesium",
  "calcium",
  "zinc",
  "iron",
  "probiotic",
  "probiotics",
  "ashwagandha",
  "elderberry",
  "collagen",
  "biotin",
  "turmeric",
  "curcumin",
  "coq10",
  "omega",
  "fish",
  "oil",
  "gummy",
  "gummies",
  "capsule",
  "capsules",
  "tablet",
  "tablets",
  "caplet",
  "caplets",
  "softgel",
  "softgels",
  "powder",
  "liquid",
  "drops",
  "sleep",
  "mood",
  "stress",
  "calm",
  "energy",
  "focus",
  "immune",
  "immunity",
  "digestive",
  "joint",
  "heart",
  "support",
  "formula",
  "complex",
  "blend",
 ]);
 
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
 
 type SerpApiPagination = {
  next?: unknown;
 };
 
 type SerpApiResponse = {
  shopping_results?: unknown;
 
  serpapi_pagination?:
    SerpApiPagination;
 
  error?: unknown;
 };
 
 type ShoppingPageResult = {
  results:
    SerpApiShoppingResult[];
 
  nextUrl:
    string | null;
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
   * A direct marketplace query has already
   * been expanded by the intent resolver.
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
      null
 >;
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
 
 function cleanBrandCandidate(
  value:
    string
 ) {
  let cleaned =
    value
      .replace(
        /[®™©]/g,
        ""
      )
      .replace(
        /^[\s,|:;–—-]+/,
        ""
      )
      .replace(
        /[\s,|:;–—-]+$/,
        ""
      )
      .replace(
        /^(?:buy|shop|new|best|official)\s+/i,
        ""
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
 
  for (
    const phrase of
    BRAND_STOP_PHRASES
  ) {
    const normalizedCleaned =
      normalizeText(
        cleaned
      );
 
    const normalizedPhrase =
      normalizeText(
        phrase
      );
 
    const phraseIndex =
      normalizedCleaned.indexOf(
        normalizedPhrase
      );
 
    if (
      phraseIndex >
        0
    ) {
      const originalWords =
        cleaned.split(
          /\s+/
        );
 
      const normalizedWords =
        normalizedCleaned.split(
          /\s+/
        );
 
      const phraseWords =
        normalizedPhrase.split(
          /\s+/
        );
 
      const firstPhraseWord =
        phraseWords[0];
 
      const stopIndex =
        normalizedWords.indexOf(
          firstPhraseWord
        );
 
      if (
        stopIndex >
          0
      ) {
        cleaned =
          originalWords
            .slice(
              0,
              stopIndex
            )
            .join(
              " "
            )
            .trim();
      }
    }
  }
 
  cleaned =
    cleaned
      .replace(
        /\b(?:dietary|supplement|supplements|vitamin|vitamins|mineral|minerals)\b.*$/i,
        ""
      )
      .replace(
        /\b\d+(?:\.\d+)?\s*(?:mcg|mg|g|iu)\b.*$/i,
        ""
      )
      .replace(
        /\b(?:capsules?|caps?|tablets?|tabs?|caplets?|soft[\s-]?gels?|gummies|gummy|chewables?|powder|liquid|drops?)\b.*$/i,
        ""
      )
      .replace(
        /[\s,|:;–—-]+$/,
        ""
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
 
  return cleaned;
 }
 
 function findKnownBrand(
  title:
    string
 ) {
  const normalizedTitle =
    normalizeText(
      title
    );
 
  const sortedBrands =
    [
      ...KNOWN_BRANDS,
    ].sort(
      (
        left,
        right
      ) =>
        right.length -
        left.length
    );
 
  for (
    const brand of
    sortedBrands
  ) {
    const normalizedBrand =
      normalizeText(
        brand
      );
 
    if (
      normalizedTitle ===
        normalizedBrand ||
      normalizedTitle.startsWith(
        `${normalizedBrand} `
      )
    ) {
      return brand;
    }
  }
 
  return null;
 }
 
 function extractBrandBeforeKnownProductWord(
  title:
    string
 ) {
  const cleanedTitle =
    title
      .replace(
        /[®™©]/g,
        ""
      )
      .replace(
        /[|()[\]–—,:;]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
 
  const originalWords =
    cleanedTitle.split(
      /\s+/
    );
 
  const normalizedWords =
    normalizeText(
      cleanedTitle
    ).split(
      /\s+/
    );
 
  const stopIndex =
    normalizedWords.findIndex(
      (word) =>
        BRAND_STOP_WORDS.has(
          word
        ) ||
        /^\d/.test(
          word
        )
    );
 
  if (
    stopIndex <=
      0
  ) {
    return null;
  }
 
  /*
   * Most product-title brands contain between one
   * and four words. Avoid treating a long product
   * description as the brand.
   */
  const candidateWords =
    originalWords.slice(
      0,
      Math.min(
        stopIndex,
        4
      )
    );
 
  const candidate =
    cleanBrandCandidate(
      candidateWords.join(
        " "
      )
    );
 
  return candidate ||
    null;
 }
 
 function extractBrandFromByPhrase(
  title:
    string
 ) {
  const match =
    title.match(
      /\bby\s+(.+?)(?:\s*[|,;–—-]|$)/i
    );
 
  if (
    !match?.[1]
  ) {
    return null;
  }
 
  const candidate =
    cleanBrandCandidate(
      match[1]
    );
 
  return candidate ||
    null;
 }
 
 function extractBrandFromSupplementAlias({
  title,
  supplement,
 }: {
  title:
    string;
 
  supplement:
    string;
 }) {
  const aliases =
    getSupplementAliases(
      supplement
    )
      .map(
        (alias) =>
          alias.trim()
      )
      .filter(
        Boolean
      )
      .sort(
        (
          left,
          right
        ) =>
          right.length -
          left.length
      );
 
  for (
    const alias of
    aliases
  ) {
    const escapedAlias =
      alias
        .replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )
        .replace(
          /\s+/g,
          "\\s+"
        );
 
    const match =
      new RegExp(
        `\\b${escapedAlias}\\b`,
        "i"
      ).exec(
        title
      );
 
    if (
      !match ||
      match.index <=
        0
    ) {
      continue;
    }
 
    const candidate =
      cleanBrandCandidate(
        title.slice(
          0,
          match.index
        )
      );
 
    if (
      candidate
    ) {
      return candidate;
    }
  }
 
  return null;
 }
 
 function extractLikelyBrand(
  title:
    string,
 
  supplement:
    string
 ) {
  /*
   * First prefer a recognized brand appearing at
   * the beginning of the product title.
   *
   * Examples:
   * - "Nature Made Melatonin..." -> "Nature Made"
   * - "Unisom Sleep Aid..." -> "Unisom"
   */
  const knownBrand =
    findKnownBrand(
      title
    );
 
  if (
    knownBrand
  ) {
    return knownBrand;
  }
 
  const byPhraseBrand =
    extractBrandFromByPhrase(
      title
    );
 
  if (
    byPhraseBrand
  ) {
    return byPhraseBrand;
  }
 
  const aliasBrand =
    extractBrandFromSupplementAlias({
      title,
      supplement,
    });
 
  if (
    aliasBrand
  ) {
    return aliasBrand;
  }
 
  /*
   * Direct health-goal searches may use a broad
   * query such as "sleep supplements," so the
   * supplement alias may not appear in the title.
   *
   * In that case, stop at the first recognizable
   * product-category word.
   */
  const prefixBrand =
    extractBrandBeforeKnownProductWord(
      title
    );
 
  if (
    prefixBrand
  ) {
    return prefixBrand;
  }
 
  const firstDelimitedSection =
    title
      .split(
        /[|,;–—:]/
      )[0];
 
  const cleanedFallback =
    cleanBrandCandidate(
      firstDelimitedSection
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
 
  const fallbackWords =
    cleanedFallback.split(
      /\s+/
    );
 
  /*
   * Prevent the full product title from becoming
   * the brand when no reliable boundary was found.
   */
  if (
    fallbackWords.length >
      4
  ) {
    return "Unknown Brand";
  }
 
  return cleanedFallback;
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
 
  const brand =
    request.brand
      ?.trim() ||
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
     * The merchant URL is resolved only when the
     * customer selects Buy Bottle.
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
 
  console.log(
    "VidaSearch retailer listing mapped:",
    {
      productTitle:
        product.productTitle,
 
      retailer:
        product.retailer,
 
      brand:
        product.brand,
 
      searchMode:
        request.searchMode ??
        "supplement",
 
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
 
      googleShoppingUrl:
        googleShoppingUrl ??
        null,
    }
  );
 
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
 * Keep one offer for each exact product and
 * retailer combination.
 *
 * When the same retailer appears more than once
 * for the same Google Shopping product, retain the
 * least expensive total offer.
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
 
    if (
      !parsedUrl.searchParams.has(
        "api_key"
      )
    ) {
      parsedUrl.searchParams.set(
        "api_key",
        apiKey
      );
    }
 
    return parsedUrl.toString();
  } catch {
    return url;
  }
 }
 
 async function fetchShoppingPage({
  url,
  query,
  pageNumber,
 }: {
  url:
    string;
 
  query:
    string;
 
  pageNumber:
    number;
 }): Promise<
  ShoppingPageResult
 >{
  const response =
    await fetch(
      url,
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
 
  const nextUrl =
    stringValue(
      data
        .serpapi_pagination
        ?.next
    ) ||
    null;
 
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
    }
  );
 
  return {
    results,
 
    nextUrl,
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
 
  while (
    nextUrl &&
    pageNumber <=
      maxPages &&
    results.length <
      maxRetailListings
  ) {
    const requestUrl =
      ensureApiKeyOnPaginationUrl({
        url:
          nextUrl,
 
        apiKey,
      });
 
    if (
      visitedUrls.has(
        requestUrl
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
      requestUrl
    );
 
    const page =
      await fetchShoppingPage({
        url:
          requestUrl,
 
        query,
 
        pageNumber,
      });
 
    pagesFetched +=
      1;
 
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
 
      rawResultCount:
        limitedResults.length,
    }
  );
 
  return limitedResults;
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
    }
  );
 
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
 
  const uniqueListings =
    deduplicateListings(
      mappedListings
    ).slice(
      0,
      maxRetailListings
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
 
      duplicateListingCount:
        Math.max(
          0,
          mappedListings.length -
            uniqueListings.length
        ),
 
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