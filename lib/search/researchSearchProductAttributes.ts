import {
  researchSearchProductWithOpenAi,
 } from "./researchSearchProductWithOpenAi";

import {
  getCachedProductResearch,
 } from "@/lib/intelligence/productResearch/getCachedProductResearch";
 
 import {
  saveProductResearch,
 } from "@/lib/intelligence/productResearch/saveProductResearch";
 
 import type {
  ProductCertificationResearch,
  ProductClaim,
  ProductClaimSource,
  ProductDietaryResearch,
  ProductResearch,
  ProductResearchEvidence,
 } from "@/lib/intelligence/productResearch/productResearchTypes";
 
 const SERP_API_ENDPOINT =
  "https://serpapi.com/search.json";
 
 const IMMERSIVE_TIMEOUT_MS =
  15000;
 
 const MERCHANT_PAGE_TIMEOUT_MS =
  12000;
 
 type ResearchSearchProductRequest = {
  productName: string;
 
  brand?: string | null;
 
  retailer?: string | null;
 
  bottlePrice?: number | null;
 
  shoppingProductId?: string | null;
 
  immersiveProductPageToken?:
    string | null;
 
  serpApiImmersiveProductUrl?:
    string | null;
 };
 
 type SerpApiStore = {
  name?: unknown;
 
  title?: unknown;
 
  link?: unknown;
 
  price?: unknown;
 
  extracted_price?: unknown;
 };
 
 type SerpApiPricingOffer = {
  name?: unknown;
 
  description?: unknown;
 
  link?: unknown;
 
  price?: unknown;
 
  extracted_price?: unknown;
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
  retailer: string;
 
  title: string;
 
  url: string;
 
  price: number | null;
 };
 


 type ExtractedPage = {
  url: string;
 
  title: string;
 
  sourceName: string;
 
  sourceType:
    ProductClaimSource["sourceType"];
 
  text: string;
 };
 
 type ImmersiveProductLookup = {
  productTitle: string;
 
  offers:
    MerchantOffer[];
 
  page:
    ExtractedPage;
 };



 
 function stringValue(
  value: unknown
 ) {
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

 function sanitizeSourceUrl(
  value: string
 ) {
  try {
    const url =
      new URL(value);
 
    url.searchParams.delete(
      "api_key"
    );
 
    return url.toString();
  } catch {
    return value;
  }
 }
 
 function jsonToSearchableText(
  value: unknown
 ) {
  return JSON.stringify(
    value
  )
    .replace(
      /\\u0026/gi,
      "&"
    )
    .replace(
      /\\u0027/gi,
      "'"
    )
    .replace(
      /\\u0022/gi,
      "\""
    )
    .replace(
      /\\n|\\r|\\t/g,
      " "
    )
    .replace(
      /[{}[\]",:]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
 }


 
 function merchantNamesMatch(
  left: string,
  right: string
 ) {
  const normalizedLeft =
    normalizeText(left);
 
  const normalizedRight =
    normalizeText(right);
 
  if (
    !normalizedLeft ||
    !normalizedRight
  ) {
    return false;
  }
 
  return (
    normalizedLeft ===
      normalizedRight ||
    normalizedLeft.includes(
      normalizedRight
    ) ||
    normalizedRight.includes(
      normalizedLeft
    )
  );
 }
 
 function mapStore(
  value: SerpApiStore
 ): MerchantOffer | null {
  const retailer =
    stringValue(
      value.name
    );
 
  const url =
    stringValue(
      value.link
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
        value.title
      ),
 
    url,
 
    price:
      numberValue(
        value.extracted_price
      ) ??
      numberValue(
        value.price
      ),
  };
 }
 
 function mapPricingOffer(
  value:
    SerpApiPricingOffer
 ): MerchantOffer | null {
  const retailer =
    stringValue(
      value.name
    );
 
  const url =
    stringValue(
      value.link
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
        value.description
      ),
 
    url,
 
    price:
      numberValue(
        value.extracted_price
      ) ??
      numberValue(
        value.price
      ),
  };
 }
 
 function extractMerchantOffers(
  data: SerpApiResponse
 ) {
  const plural =
    data.product_results &&
    typeof data.product_results ===
      "object"
      ? data.product_results as
          SerpApiProductResults
      : null;
 
  const singular =
    data.product_result &&
    typeof data.product_result ===
      "object"
      ? data.product_result as
          SerpApiProductResults
      : null;
 
  const productResults =
    plural ??
    singular;
 
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
          .map(mapStore)
          .filter(
            (
              offer
            ): offer is MerchantOffer =>
              offer !== null
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
              offer !== null
          )
      : [];
 
  const unique =
    new Map<
      string,
      MerchantOffer
 >();
 
  for (
    const offer of
    [...stores, ...pricing]
  ) {
    if (
      !/^https?:\/\//i.test(
        offer.url
      )
    ) {
      continue;
    }
 
    const key = [
      normalizeText(
        offer.retailer
      ),
 
      offer.url,
    ].join("|");
 
    if (
      !unique.has(key)
    ) {
      unique.set(
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
        unique.values()
      ),
  };
 }
 




 function selectMerchantOffer({
  offers,
  preferredRetailer,
  bottlePrice,
 }: {
  offers:
    MerchantOffer[];
 
  preferredRetailer:
    string;
 
  bottlePrice:
    number | null;
 }) {
  if (
    offers.length === 0
  ) {
    return null;
  }
 
  const preferredOffers =
    preferredRetailer
      ? offers.filter(
          (offer) =>
            merchantNamesMatch(
              offer.retailer,
              preferredRetailer
            )
        )
      : [];
 
  const candidates =
    preferredOffers.length > 0
      ? preferredOffers
      : offers;
 
  return [...candidates]
    .sort(
      (
        left,
        right
      ) => {
        if (
          bottlePrice == null
        ) {
          return 0;
        }
 
        const leftDifference =
          left.price == null
            ? Number
                .POSITIVE_INFINITY
            : Math.abs(
                left.price -
                bottlePrice
              );
 
        const rightDifference =
          right.price == null
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
 }
 
 function selectManufacturerOffer({
  offers,
  brand,
  excludedUrl,
 }: {
  offers:
    MerchantOffer[];
 
  brand:
    string;
 
  excludedUrl?:
    string | null;
 }) {
  const normalizedBrand =
    normalizeText(
      brand
    );
 
  if (!normalizedBrand) {
    return null;
  }
 
  const matchingOffers =
    offers.filter(
      (offer) => {
        if (
          excludedUrl &&
          offer.url ===
            excludedUrl
        ) {
          return false;
        }
 
        return merchantNamesMatch(
          offer.retailer,
          brand
        );
      }
    );
 
  return (
    matchingOffers[0] ??
    null
  );
 }
 



 async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  headers?: HeadersInit
 ) {
  const controller =
    new AbortController();
 
  const timeoutId =
    setTimeout(
      () =>
        controller.abort(),
      timeoutMs
    );
 
  try {
    return await fetch(
      url,
      {
        method:
          "GET",
 
        cache:
          "no-store",
 
        redirect:
          "follow",
 
        headers,
 
        signal:
          controller.signal,
      }
    );
  } finally {
    clearTimeout(
      timeoutId
    );
  }
 }
 




 async function lookupImmersiveProduct({
  pageToken,
  productName,
  serpApiImmersiveProductUrl,
 }: {
  pageToken: string;
 
  productName: string;
 
  serpApiImmersiveProductUrl:
    string | null;
 }): Promise<ImmersiveProductLookup> {
  const apiKey =
    process.env
      .SERPAPI_API_KEY;
 
  if (!apiKey) {
    throw new Error(
      "SERPAPI_API_KEY is not configured."
    );
  }
 
  const params =
    new URLSearchParams({
      engine:
        "google_immersive_product",
 
      page_token:
        pageToken,
 
      more_stores:
        "true",
 
      api_key:
        apiKey,
 
      output:
        "json",
    });
 
  const requestUrl =
    `${SERP_API_ENDPOINT}?${params.toString()}`;
 
  const response =
    await fetchWithTimeout(
      requestUrl,
      IMMERSIVE_TIMEOUT_MS,
      {
        Accept:
          "application/json",
      }
    );
 
  let data:
    SerpApiResponse;
 
  try {
    data =
      await response.json() as
        SerpApiResponse;
  } catch {
    throw new Error(
      "SerpApi returned invalid immersive-product JSON."
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
 
  const extracted =
    extractMerchantOffers(
      data
    );
 
  const sourceUrl =
    sanitizeSourceUrl(
      serpApiImmersiveProductUrl ||
      `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
        productName
      )}`
    );
 
  return {
    ...extracted,
 
    page: {
      url:
        sourceUrl,
 
      title:
        extracted.productTitle ||
        productName,
 
      sourceName:
        "Google Immersive Product",
 
      sourceType:
        "structured-data",
 
      text:
        jsonToSearchableText(
          data
        ),
    },
  };
 }
 








 
 function decodeHtml(
  value: string
 ) {
  return value
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      "\""
    )
    .replace(
      /&#39;|&apos;/gi,
      "'"
    )
    .replace(
      /&lt;/gi,
      "<"
    )
    .replace(
      /&gt;/gi,
      ">"
    )
    .replace(
      /&#(\d+);/g,
      (
        _match,
        code: string
      ) =>
        String.fromCharCode(
          Number(code)
        )
    );
 }
 
 function extractTitleFromHtml(
  html: string
 ) {
  const titleMatch =
    html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    );
 
  return titleMatch
    ? decodeHtml(
        titleMatch[1]
      )
        .replace(
          /\s+/g,
          " "
        )
        .trim()
    : "";
 }
 
 function htmlToSearchableText(
  html: string
 ) {
  const withoutStyles =
    html.replace(
      /<style\b[^>]*>[\s\S]*?<\/style>/gi,
      " "
    );
 
  const withoutScripts =
    withoutStyles.replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      (
        script
      ) => {
        /*
         * Preserve JSON-LD and embedded
         * product data as searchable text.
         */
        if (
          /application\/ld\+json/i.test(
            script
          ) ||
          /product/i.test(
            script
          )
        ) {
          return script;
        }
 
        return " ";
      }
    );
 
  return decodeHtml(
    withoutScripts
      .replace(
        /<[^>]+>/g,
        " "
      )
      .replace(
        /\\u0026/g,
        "&"
      )
      .replace(
        /\\u0027/g,
        "'"
      )
      .replace(
        /\\u0022/g,
        "\""
      )
      .replace(
        /\\n|\\r|\\t/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim()
  );
 }
 
 function getSourceName(
  url: string,
  fallback: string
 ) {
  try {
    return new URL(url)
      .hostname
      .replace(
        /^www\./,
        ""
      );
  } catch {
    return fallback;
  }
 }
 




 async function fetchMerchantPage(
  offer: MerchantOffer
 ): Promise<ExtractedPage> {
  const response =
    await fetchWithTimeout(
      offer.url,
      MERCHANT_PAGE_TIMEOUT_MS,
      {
        Accept:
          "text/html,application/xhtml+xml",
 
        "Accept-Language":
          "en-US,en;q=0.9",
 
        "User-Agent":
          "Mozilla/5.0 (compatible; VidaSearchProductResearch/1.0)",
      }
    );
 
  if (!response.ok) {
    throw new Error(
      `Merchant page returned status ${response.status}.`
    );
  }
 
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";
 
  if (
    !contentType.includes(
      "text/html"
    ) &&
    !contentType.includes(
      "application/xhtml+xml"
    )
  ) {
    throw new Error(
      `Merchant page returned unsupported content type: ${contentType || "unknown"}.`
    );
  }
 
  const html =
    await response.text();
 
  if (!html.trim()) {
    throw new Error(
      "Merchant page returned no content."
    );
  }
 
  const finalUrl =
    response.url ||
    offer.url;
 




    return {
      url:
        finalUrl,
     
      title:
        extractTitleFromHtml(
          html
        ) ||
        offer.title,
     
      sourceName:
        offer.retailer ||
        getSourceName(
          finalUrl,
          "Merchant"
        ),
     
      sourceType:
        "retailer-page",
     
      text:
        htmlToSearchableText(
          html
        ),
     };





 }
 
 function unknownClaim():
  ProductClaim {
  return {
    value:
      null,
 
    status:
      "not-found",
 
    confidence:
      0,
 
    scope:
      "unknown",
 
    sources:
      [],
  };
 }
 
 function buildClaimSource({
  page,
  evidenceText,
  confidence,
 }: {
  page:
    ExtractedPage;
 
  evidenceText:
    string;
 
  confidence:
    number;
 }): ProductClaimSource {
  return {
    title:
      page.title ||
      "Merchant product page",
 
    source:
      page.sourceName,
 
    url:
      page.url,
 
    sourceType:
      page.sourceType,
 
    evidenceText,
 
    confidence,
 
    checkedAt:
      new Date()
        .toISOString(),
  };
 }
 
 function positiveClaim({
  page,
  evidenceText,
  confidence = 0.72,
  scope = "product",
 }: {
  page:
    ExtractedPage;
 
  evidenceText:
    string;
 
  confidence?:
    number;
 
  scope?:
    ProductClaim["scope"];
 }): ProductClaim {
  return {
    value:
      true,
 
    status:
      "claimed",
 
    confidence,
 
    scope,
 
    sources: [
      buildClaimSource({
        page,
 
        evidenceText,
 
        confidence,
      }),
    ],
  };
 }
 
 function negativeClaim({
  page,
  evidenceText,
  confidence = 0.72,
 }: {
  page:
    ExtractedPage;
 
  evidenceText:
    string;
 
  confidence?:
    number;
 }): ProductClaim {
  return {
    value:
      false,
 
    status:
      "claimed",
 
    confidence,
 
    scope:
      "product",
 
    sources: [
      buildClaimSource({
        page,
 
        evidenceText,
 
        confidence,
      }),
    ],
  };
 }
 
 function findMatchingPhrase(
  text: string,
  patterns: RegExp[]
 ) {
  for (
    const pattern of
    patterns
  ) {
    const match =
      text.match(pattern);
 
    if (match?.[0]) {
      return match[0]
        .replace(
          /\s+/g,
          " "
        )
        .trim();
    }
  }
 
  return null;
 }
 
 function extractPositiveClaim({
  page,
  patterns,
  confidence,
  scope,
 }: {
  page:
    ExtractedPage;
 
  patterns:
    RegExp[];
 
  confidence?:
    number;
 
  scope?:
    ProductClaim["scope"];
 }) {
  const evidenceText =
    findMatchingPhrase(
      page.text,
      patterns
    );
 
  return evidenceText
    ? positiveClaim({
        page,
 
        evidenceText,
 
        confidence,
 
        scope,
      })
    : unknownClaim();
 }
 
 function extractNegativeIngredientClaim({
  page,
  patterns,
 }: {
  page:
    ExtractedPage;
 
  patterns:
    RegExp[];
 }) {
  const evidenceText =
    findMatchingPhrase(
      page.text,
      patterns
    );
 
  return evidenceText
    ? negativeClaim({
        page,
 
        evidenceText,
      })
    : unknownClaim();
 }
 
 function extractCertificationClaims(
  page: ExtractedPage
 ): ProductCertificationResearch {
  return {
    nsfCertified:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bNSF Certified\b.{0,80}/i,
          /\bcertified by NSF\b.{0,80}/i,
        ],
      }),
 
    nsfCertifiedForSport:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bNSF Certified for Sport\b.{0,80}/i,
        ],
 
        confidence:
          0.82,
      }),
 
    uspVerified:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bUSP Verified\b.{0,80}/i,
          /\bUSP Dietary Supplement Verified\b.{0,80}/i,
        ],
 
        confidence:
          0.82,
      }),
 
    nonGmoProjectVerified:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bNon[- ]GMO Project Verified\b.{0,80}/i,
        ],
 
        confidence:
          0.82,
      }),
 
    informedChoiceCertified:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bInformed Choice Certified\b.{0,80}/i,
          /\bInformed[- ]Choice\b.{0,80}/i,
        ],
 
        confidence:
          0.8,
      }),
 
    informedSportCertified:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bInformed Sport Certified\b.{0,80}/i,
          /\bInformed[- ]Sport\b.{0,80}/i,
        ],
 
        confidence:
          0.8,
      }),
 
    bannedSubstanceTested:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\btested for banned substances\b.{0,100}/i,
          /\bbanned substance tested\b.{0,100}/i,
          /\bdrug[- ]tested athletes\b.{0,100}/i,
        ],
      }),
 
    gmpQualityAssured:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bGMP Quality Assured\b.{0,100}/i,
          /\bGMP quality assurance\b.{0,100}/i,
        ],
 
        scope:
          "manufacturer",
      }),
 
    cgmpManufactured:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bmanufactured in an? (?:FDA[- ]registered )?cGMP.{0,100}/i,
          /\bmade in an? cGMP.{0,100}/i,
          /\bcGMP compliant facility\b.{0,100}/i,
          /\bcGMP certified facility\b.{0,100}/i,
        ],
 
        scope:
          "facility",
      }),
 
    npaGmpCertified:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bNPA GMP Certified\b.{0,100}/i,
          /\bNatural Products Association GMP\b.{0,100}/i,
        ],
 
        confidence:
          0.8,
 
        scope:
          "facility",
      }),
 
    thirdPartyTested:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bthird[- ]party tested\b.{0,100}/i,
          /\bindependently tested\b.{0,100}/i,
          /\btested by an independent (?:lab|laboratory)\b.{0,100}/i,
        ],
      }),
  };
 }
 
 function extractDietaryClaims(
  page: ExtractedPage
 ): ProductDietaryResearch {
  return {
    vegan:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bcertified vegan\b.{0,60}/i,
          /\bsuitable for vegans\b.{0,60}/i,
          /\bvegan capsules?\b.{0,60}/i,
          /\bvegan product\b.{0,60}/i,
        ],
      }),
 
    vegetarian:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bsuitable for vegetarians\b.{0,60}/i,
          /\bvegetarian capsules?\b.{0,60}/i,
          /\bvegetarian product\b.{0,60}/i,
        ],
      }),
 
    glutenFree:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bcertified gluten[- ]free\b.{0,60}/i,
          /\bgluten[- ]free\b.{0,60}/i,
          /\bfree from gluten\b.{0,60}/i,
        ],
      }),
 
    nonGmo:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bNon[- ]GMO Project Verified\b.{0,60}/i,
          /\bnon[- ]GMO\b.{0,60}/i,
          /\bmade without genetically modified\b.{0,80}/i,
        ],
      }),
 
    soyFree:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bsoy[- ]free\b.{0,60}/i,
          /\bfree from soy\b.{0,60}/i,
          /\bcontains no soy\b.{0,60}/i,
        ],
      }),
 
    dairyFree:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bdairy[- ]free\b.{0,60}/i,
          /\bfree from dairy\b.{0,60}/i,
          /\bcontains no dairy\b.{0,60}/i,
        ],
      }),
 
    sugarFree:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bsugar[- ]free\b.{0,60}/i,
          /\bcontains no sugar\b.{0,60}/i,
          /\bzero sugar\b.{0,60}/i,
        ],
      }),
 
    kosher:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bcertified kosher\b.{0,60}/i,
          /\bkosher certified\b.{0,60}/i,
        ],
      }),
 
    halal:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bcertified halal\b.{0,60}/i,
          /\bhalal certified\b.{0,60}/i,
        ],
      }),
 
    organic:
      extractPositiveClaim({
        page,
 
        patterns: [
          /\bUSDA Organic\b.{0,60}/i,
          /\bcertified organic\b.{0,60}/i,
        ],
      }),
 
    artificialColors:
      extractNegativeIngredientClaim({
        page,
 
        patterns: [
          /\bno artificial colors?\b.{0,60}/i,
          /\bfree from artificial colors?\b.{0,60}/i,
          /\bwithout artificial colors?\b.{0,60}/i,
        ],
      }),
 
    artificialFlavors:
      extractNegativeIngredientClaim({
        page,
 
        patterns: [
          /\bno artificial flavors?\b.{0,60}/i,
          /\bfree from artificial flavors?\b.{0,60}/i,
          /\bwithout artificial flavors?\b.{0,60}/i,
        ],
      }),
 
    artificialSweeteners:
      extractNegativeIngredientClaim({
        page,
 
        patterns: [
          /\bno artificial sweeteners?\b.{0,60}/i,
          /\bfree from artificial sweeteners?\b.{0,60}/i,
          /\bwithout artificial sweeteners?\b.{0,60}/i,
        ],
      }),
 
    preservatives:
      extractNegativeIngredientClaim({
        page,
 
        patterns: [
          /\bno preservatives?\b.{0,60}/i,
          /\bpreservative[- ]free\b.{0,60}/i,
          /\bfree from preservatives?\b.{0,60}/i,
        ],
      }),
  };
 }
 
 function collectEvidence(
  claims:
    ProductClaim[]
 ) {
  const evidenceByKey =
    new Map<
      string,
      ProductResearchEvidence
 >();
 
  for (
    const claim of claims
  ) {
    for (
      const source of
      claim.sources
    ) {
      const key = [
        source.url,
        source.title,
      ].join("|");
 
      const existing =
        evidenceByKey.get(
          key
        );
 
      const facts =
        source.evidenceText
          ? [
              source.evidenceText,
            ]
          : [];
 
      if (existing) {
        existing.extractedFacts =
          Array.from(
            new Set([
              ...existing
                .extractedFacts,
 
              ...facts,
            ])
          );
 
        existing.confidence =
          Math.max(
            existing.confidence,
            source.confidence
          );
 
        continue;
      }
 
      evidenceByKey.set(
        key,
        {
          title:
            source.title,
 
          source:
            source.source,
 
          url:
            source.url,
 
          sourceType:
            source.sourceType,
 
          confidence:
            source.confidence,
 
          extractedFacts:
            facts,
 
          checkedAt:
            source.checkedAt,
        }
      );
    }
  }
 
  return Array.from(
    evidenceByKey.values()
  );
 }
 
 function isPositive(
  claim: ProductClaim
 ) {
  return (
    claim.value ===
      true &&
    (
      claim.status ===
        "verified" ||
      claim.status ===
        "claimed"
    )
  );
 }
 
 function buildResearch({
  request,
  productTitle,
  page,
 }: {
  request:
    ResearchSearchProductRequest;
 
  productTitle:
    string;
 
  page:
    ExtractedPage;
 }): ProductResearch {
  const certificationClaims =
    extractCertificationClaims(
      page
    );
 
  const dietaryClaims =
    extractDietaryClaims(
      page
    );
 
  const allClaims = [
    ...Object.values(
      certificationClaims
    ),
 
    ...Object.values(
      dietaryClaims
    ),
  ];
 
  const evidence =
    collectEvidence(
      allClaims
    );
 
  const nsfCertified =
    isPositive(
      certificationClaims
        .nsfCertified
    );
 
  const nsfCertifiedForSport =
    isPositive(
      certificationClaims
        .nsfCertifiedForSport
    );
 
  const uspVerified =
    isPositive(
      certificationClaims
        .uspVerified
    );
 
  const nonGmoProjectVerified =
    isPositive(
      certificationClaims
        .nonGmoProjectVerified
    );
 
  const gmpQualityAssured =
    isPositive(
      certificationClaims
        .gmpQualityAssured
    );
 
  const npaGmpCertified =
    isPositive(
      certificationClaims
        .npaGmpCertified
    );
 
  const thirdPartyTested =
    isPositive(
      certificationClaims
        .thirdPartyTested
    );
 
  const cgmpManufactured =
    isPositive(
      certificationClaims
        .cgmpManufactured
    );
 
  const vegan =
    isPositive(
      dietaryClaims.vegan
    );
 
  const vegetarian =
    isPositive(
      dietaryClaims
        .vegetarian
    );
 
  const glutenFree =
    isPositive(
      dietaryClaims
        .glutenFree
    );
 
  const nonGmo =
    isPositive(
      dietaryClaims.nonGmo
    );
 
  const soyFree =
    isPositive(
      dietaryClaims.soyFree
    );
 
  const dairyFree =
    isPositive(
      dietaryClaims.dairyFree
    );
 
  const sugarFree =
    isPositive(
      dietaryClaims.sugarFree
    );
 
  const organic =
    isPositive(
      dietaryClaims.organic
    );
 
  const certifications = [
    nsfCertified
      ? "NSF Certified"
      : null,
 
    nsfCertifiedForSport
      ? "NSF Certified for Sport"
      : null,
 
    uspVerified
      ? "USP Verified"
      : null,
 
    nonGmoProjectVerified
      ? "Non-GMO Project Verified"
      : null,
 
    isPositive(
      certificationClaims
        .informedChoiceCertified
    )
      ? "Informed Choice Certified"
      : null,
 
    isPositive(
      certificationClaims
        .informedSportCertified
    )
      ? "Informed Sport Certified"
      : null,
  ].filter(
    (
      value
    ): value is string =>
      value !== null
  );
 
  const qualityClaims = [
    gmpQualityAssured
      ? "GMP Quality Assured"
      : null,
 
    cgmpManufactured
      ? "cGMP Manufactured"
      : null,
 
    npaGmpCertified
      ? "NPA GMP Certified"
      : null,
 
    thirdPartyTested
      ? "Third-Party Tested"
      : null,
  ].filter(
    (
      value
    ): value is string =>
      value !== null
  );
 
  const confidence =
    evidence.length > 0
      ? Math.min(
          0.85,
          evidence.reduce(
            (
              total,
              item
            ) =>
              total +
              item.confidence,
            0
          ) /
            evidence.length
        )
      : 0.25;
 
  return {
    supplement:
      "",
 
    brand:
      request.brand
        ?.trim() ||
      "",
 
    productName:
      productTitle ||
      request.productName,
 
    shoppingProductId:
      request.shoppingProductId
        ?.trim() ||
      undefined,
 
    officialProductUrl:
      page.url,
 
    ingredients:
      [],
 
    inactiveIngredients:
      [],
 
    allergens:
      [],
 
    vegan:
      vegan
        ? true
        : null,
 
    vegetarian:
      vegetarian
        ? true
        : null,
 
    nonGmo:
      nonGmo
        ? true
        : null,
 
    glutenFree:
      glutenFree
        ? true
        : null,
 
    soyFree:
      soyFree
        ? true
        : null,
 
    dairyFree:
      dairyFree
        ? true
        : null,
 
    artificialColors:
      dietaryClaims
        .artificialColors
        .value,
 
    artificialSweeteners:
      dietaryClaims
        .artificialSweeteners
        .value,
 
    preservatives:
      dietaryClaims
        .preservatives
        .value,
 
    thirdPartyTested:
      thirdPartyTested
        ? true
        : null,
 
    uspVerified:
      uspVerified
        ? true
        : null,
 
    nsfCertified:
      nsfCertified
        ? true
        : null,
 
    cgmpManufactured:
      cgmpManufactured
        ? true
        : null,
 
    certificationClaims,
 
    dietaryClaims,
 
    certifications,
 
    qualityClaims,
 
    filterableClaims: {
      nsfCertified,
 
      nsfCertifiedForSport,
 
      uspVerified,
 
      nonGmoProjectVerified,
 
      gmpQualityAssured,
 
      npaGmpCertified,
 
      thirdPartyTested,
 
      vegan,
 
      vegetarian,
 
      glutenFree,
 
      nonGmo,
 
      soyFree,
 
      dairyFree,
 
      sugarFree,
 
      organic,
    },
 
    commonBenefits:
      [],
 
    commonComplaints:
      [],
 
    researchStatus:
      evidence.length > 0
        ? "partial"
        : "not-found",
 
    researchedAt:
      new Date()
        .toISOString(),
 
    lastVerifiedAt:
      new Date()
        .toISOString(),
 
    researchVersion:
      3,
 
    aiSummary:
      evidence.length > 0
        ? "Product attributes extracted from one exact merchant product page."
        : "The merchant page was checked, but no supported certification or dietary claims were found.",
 
    aiConfidence:
      confidence,
 
    evidence,
  };
 }
 




 export async function
 researchSearchProductAttributes(
  request:
    ResearchSearchProductRequest
 ): Promise<ProductResearch | null> {
  const productName =
    request.productName
      .trim();
 
  const shoppingProductId =
    request.shoppingProductId
      ?.trim() ||
    null;
 
  const pageToken =
    request
      .immersiveProductPageToken
      ?.trim() ||
    "";
 
  if (!productName) {
    console.error(
      "VidaSearch merchant enrichment rejected: missing product name"
    );
 
    return null;
  }
 
  const cached =
    await getCachedProductResearch(
      productName,
      shoppingProductId
    );
 


    const shouldUpgradeExistingMerchantResearch =
    cached?.researchVersion ===
      3 ||
    (
      cached?.researchVersion ===
        4 &&
      cached.researchStatus ===
        "not-found"
    );
 






 
  if (
    cached &&
    !shouldUpgradeExistingMerchantResearch
  ) {
    console.log(
      "VidaSearch merchant enrichment cache hit:",
      {
        productName,
 
        shoppingProductId,
 
        researchStatus:
          cached.researchStatus ??
          null,
 
        researchVersion:
          cached.researchVersion ??
          null,
 
        evidenceCount:
          cached.evidence.length,
      }
    );
 
    return cached;
  }
 
  if (
    shouldUpgradeExistingMerchantResearch
  ) {
    console.log(
      "VidaSearch upgrading existing merchant research with manufacturer fallback:",
      {
        productName,
 
        shoppingProductId,
 
        existingResearchStatus:
          cached?.researchStatus ??
          null,
 
        existingEvidenceCount:
          cached?.evidence.length ??
          0,
      }
    );
  }
 




 
  if (!pageToken) {
    console.log(
      "VidaSearch merchant enrichment skipped: missing immersive product token",
      {
        productName,
 
        shoppingProductId,
      }
    );
 
    return null;
  }
 
  console.log(
    "VidaSearch merchant enrichment started:",
    {
      productName,
 
      shoppingProductId,
 
      retailer:
        request.retailer ||
        null,
    }
  );
 
  try {
    const immersive =
      await lookupImmersiveProduct({
        pageToken,
 
        productName,
 
        serpApiImmersiveProductUrl:
          request
            .serpApiImmersiveProductUrl
            ?.trim() ||
          null,
      });
 
    const selectedOffer =
      selectMerchantOffer({
        offers:
          immersive.offers,
 
        preferredRetailer:
          request.retailer
            ?.trim() ||
          "",
 
        bottlePrice:
          typeof request
            .bottlePrice ===
              "number" &&
          Number.isFinite(
            request.bottlePrice
          )
            ? request.bottlePrice
            : null,
      });
 



      let extractionPage =
      immersive.page;
 
    let merchantPageError:
      string | null =
      null;
 
    let manufacturerPageError:
      string | null =
      null;
 
    let extractionMethod:
      | "immersive"
      | "merchant"
      | "manufacturer" =
      "immersive";
 
    /*
     * First try the representative merchant
     * selected for the visible product card.
     */
    if (selectedOffer) {
      try {
        extractionPage =
          await fetchMerchantPage(
            selectedOffer
          );
 
        extractionMethod =
          "merchant";
      } catch (error) {
        merchantPageError =
          error instanceof Error
            ? error.message
            : "Merchant page extraction failed.";
 
        console.log(
          "VidaSearch merchant page unavailable; using immersive product data:",
          {
            productName,
 
            shoppingProductId,
 
            selectedRetailer:
              selectedOffer.retailer,
 
            selectedUrl:
              selectedOffer.url,
 
            merchantPageError,
          }
        );
      }
    } else {
      merchantPageError =
        "No usable merchant offer was found in the immersive product response.";
 
      console.log(
        "VidaSearch found no usable merchant offer; using immersive product data:",
        {
          productName,
 
          shoppingProductId,
 
          offersFound:
            immersive.offers.length,
        }
      );
    }
 
    let research =
      buildResearch({
        request,
 
        productTitle:
          immersive.productTitle ||
          productName,
 
        page:
          extractionPage,
      });
 
    /*
     * If the merchant page was blocked or
     * produced no useful evidence, look for
     * an official brand/manufacturer offer
     * already present in the same Immersive
     * Product response.
     *
     * This does not require another SerpAPI
     * lookup.
     */
    if (
      research.evidence.length ===
        0 &&
      request.brand?.trim()
    ) {
      const manufacturerOffer =
        selectManufacturerOffer({
          offers:
            immersive.offers,
 
          brand:
            request.brand.trim(),
 
          excludedUrl:
            selectedOffer?.url ??
            null,
        });
 
      if (
        manufacturerOffer
      ) {
        try {
          const manufacturerPage =
            await fetchMerchantPage(
              manufacturerOffer
            );
 
          const manufacturerResearch =
            buildResearch({
              request,
 
              productTitle:
                immersive.productTitle ||
                productName,
 
              page:
                manufacturerPage,
            });
 
          /*
           * Use the manufacturer page when it
           * provides more evidence than the
           * merchant or Immersive source.
           */
          if (
            manufacturerResearch
              .evidence.length >
            research.evidence.length
          ) {
            extractionPage =
              manufacturerPage;
 
            extractionMethod =
              "manufacturer";
 
            research =
              manufacturerResearch;
          }
 
          console.log(
            "VidaSearch manufacturer fallback completed:",
            {
              productName,
 
              shoppingProductId,
 
              manufacturer:
                manufacturerOffer
                  .retailer,
 
              manufacturerUrl:
                manufacturerPage.url,
 
              evidenceCount:
                manufacturerResearch
                  .evidence.length,
 
              usedManufacturerResult:
                extractionMethod ===
                "manufacturer",
            }
          );
        } catch (error) {
          manufacturerPageError =
            error instanceof Error
              ? error.message
              : "Manufacturer page extraction failed.";
 
          console.log(
            "VidaSearch manufacturer fallback unavailable:",
            {
              productName,
 
              shoppingProductId,
 
              manufacturer:
                manufacturerOffer
                  .retailer,
 
              manufacturerUrl:
                manufacturerOffer.url,
 
              manufacturerPageError,
            }
          );
        }
      } else {
        manufacturerPageError =
          "No official brand offer was available in the immersive product response.";
      }
    }
 
    /*
     * Preserve the source URL from the page
     * that actually supplied the research.
     *
     * When no readable page was available,
     * preserve the selected merchant URL.
     */
    if (
      extractionMethod ===
        "merchant" ||
      extractionMethod ===
        "manufacturer"
    ) {
      research.officialProductUrl =
        extractionPage.url;
    } else if (
      selectedOffer
    ) {
      research.officialProductUrl =
        selectedOffer.url;
    }
 
    research.researchVersion =
      4;
 
    if (
      extractionMethod ===
      "manufacturer"
    ) {
      research.aiSummary =
        research.evidence.length > 0
          ? "Product attributes were extracted from an official brand or manufacturer product page."
          : "The official brand or manufacturer page was checked, but no supported certification or dietary claims were found.";
    } else if (
      extractionMethod ===
      "merchant"
    ) {
      research.aiSummary =
        research.evidence.length > 0
          ? "Product attributes were extracted from one exact merchant product page."
          : "The exact merchant product page was checked, but no supported certification or dietary claims were found.";
    } else {
      const sourceErrors = [
        merchantPageError,
 
        manufacturerPageError,
      ]
        .filter(Boolean)
        .join(" ");
 
      research.aiSummary =
        research.evidence.length > 0
          ? `Product attributes were extracted from Google Immersive Product data. ${sourceErrors}`.trim()
          : `Google Immersive Product data was checked, but no supported certification or dietary claims were found. ${sourceErrors}`.trim();
    }
 
 

/*
    * Final VidaSearch-only fallback.
    *
    * OpenAI runs only when Google
    * Immersive data, the merchant page,
    * and the manufacturer page produced
    * no supported evidence.
    *
    * The result, including a not-found
    * result, is saved below as research
    * version 5 so it does not run again
    * on every search.
    */
if (
  research.evidence.length ===
  0
) {
  const openAiResearch =
    await researchSearchProductWithOpenAi({
      productName,

      brand:
        request.brand ??
        null,

      retailer:
        request.retailer ??
        null,

      shoppingProductId,

      /*
       * Dosage and form are already
       * normally included in the exact
       * Google Shopping product title.
       */
      dosage:
        null,

      form:
        null,
    });

  if (openAiResearch) {
    research.certificationClaims =
      openAiResearch
        .certificationClaims;

    research.dietaryClaims =
      openAiResearch
        .dietaryClaims;

    research.certifications =
      openAiResearch
        .certifications;

    research.qualityClaims =
      openAiResearch
        .qualityClaims;

    const openAiClaims = [
      ...Object.values(
        openAiResearch
          .certificationClaims
      ),

      ...Object.values(
        openAiResearch
          .dietaryClaims
      ),
    ];

    research.evidence =
      collectEvidence(
        openAiClaims
      );

    const certificationClaims =
      openAiResearch
        .certificationClaims;

    const dietaryClaims =
      openAiResearch
        .dietaryClaims;

    research.nsfCertified =
      isPositive(
        certificationClaims
          .nsfCertified
      )
        ? true
        : null;

    research.uspVerified =
      isPositive(
        certificationClaims
          .uspVerified
      )
        ? true
        : null;

    research.thirdPartyTested =
      isPositive(
        certificationClaims
          .thirdPartyTested
      )
        ? true
        : null;

    research.cgmpManufactured =
      isPositive(
        certificationClaims
          .cgmpManufactured
      )
        ? true
        : null;

    research.vegan =
      isPositive(
        dietaryClaims.vegan
      )
        ? true
        : null;

    research.vegetarian =
      isPositive(
        dietaryClaims
          .vegetarian
      )
        ? true
        : null;

    research.glutenFree =
      isPositive(
        dietaryClaims
          .glutenFree
      )
        ? true
        : null;

    research.nonGmo =
      isPositive(
        dietaryClaims.nonGmo
      )
        ? true
        : null;

    research.soyFree =
      isPositive(
        dietaryClaims.soyFree
      )
        ? true
        : null;

    research.dairyFree =
      isPositive(
        dietaryClaims.dairyFree
      )
        ? true
        : null;

    research.artificialColors =
      dietaryClaims
        .artificialColors
        .value;

    research.artificialSweeteners =
      dietaryClaims
        .artificialSweeteners
        .value;

    research.preservatives =
      dietaryClaims
        .preservatives
        .value;

    research.filterableClaims = {
      nsfCertified:
        isPositive(
          certificationClaims
            .nsfCertified
        ),

      nsfCertifiedForSport:
        isPositive(
          certificationClaims
            .nsfCertifiedForSport
        ),

      uspVerified:
        isPositive(
          certificationClaims
            .uspVerified
        ),

      nonGmoProjectVerified:
        isPositive(
          certificationClaims
            .nonGmoProjectVerified
        ),

      gmpQualityAssured:
        isPositive(
          certificationClaims
            .gmpQualityAssured
        ),

      npaGmpCertified:
        isPositive(
          certificationClaims
            .npaGmpCertified
        ),

      thirdPartyTested:
        isPositive(
          certificationClaims
            .thirdPartyTested
        ),

      vegan:
        isPositive(
          dietaryClaims.vegan
        ),

      vegetarian:
        isPositive(
          dietaryClaims
            .vegetarian
        ),

      glutenFree:
        isPositive(
          dietaryClaims
            .glutenFree
        ),

      nonGmo:
        isPositive(
          dietaryClaims.nonGmo
        ),

      soyFree:
        isPositive(
          dietaryClaims.soyFree
        ),

      dairyFree:
        isPositive(
          dietaryClaims.dairyFree
        ),

      sugarFree:
        isPositive(
          dietaryClaims.sugarFree
        ),

      organic:
        isPositive(
          dietaryClaims.organic
        ),
    };

    research.aiConfidence =
      openAiResearch
        .aiConfidence;

    research.researchStatus =
      research.evidence.length >
        0
        ? "partial"
        : "not-found";

    research.aiSummary =
      research.evidence.length >
        0
        ? "Product attributes were found through the final VidaSearch OpenAI research fallback after deterministic sources produced no supported evidence."
        : "The final VidaSearch OpenAI research fallback was completed, but no supported certification or dietary claims were found.";
  } else {
    research.aiSummary =
      "The deterministic research sources produced no supported evidence, and the final VidaSearch OpenAI fallback did not return a usable result.";
  }
}

/*
 * Version 5 means the complete
 * VidaSearch fallback chain has been
 * attempted.
 *
 * This is set even when OpenAI finds
 * nothing so the product is not charged
 * and researched repeatedly.
 */
research.researchVersion =
  5;

research.researchedAt =
  new Date()
    .toISOString();

research.lastVerifiedAt =
  new Date()
    .toISOString();




    /*
     * Save partial and not-found outcomes.
     *
     * A not-found cache record prevents the
     * same paid lookup from repeating on the
     * next customer search.
     */
    await saveProductResearch(
      productName,
      research,
      shoppingProductId
    );
 
    console.log(
      "VidaSearch merchant enrichment completed and saved:",
      {
        productName,
 
        shoppingProductId,
 
        selectedRetailer:
          selectedOffer
            ?.retailer ??
          null,
 
        selectedUrl:
          selectedOffer
            ?.url ??
          null,
 

          extractionSource:
          extractionPage
            .sourceName,
 
        extractionMethod,
 
        merchantPageError,
 
        manufacturerPageError,





 
        certifications:
          research.certifications,
 
        qualityClaims:
          research.qualityClaims,
 
        evidenceCount:
          research.evidence.length,
 
        researchStatus:
          research.researchStatus,
      }
    );
 
    return research;
  } catch (error) {
    console.error(
      "VidaSearch immersive enrichment failed before a cacheable result was available:",
      {
        productName,
 
        shoppingProductId,
 
        error:
          error instanceof Error
            ? {
                name:
                  error.name,
 
                message:
                  error.message,
              }
            : error,
      }
    );
 
    return null;
  }
 }
 
