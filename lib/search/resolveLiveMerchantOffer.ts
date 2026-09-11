import "server-only";

const SERP_API_ENDPOINT =
  "https://serpapi.com/search.json";

const IMMERSIVE_TIMEOUT_MS =
  5500;

const IMMERSIVE_NEXT_PAGE_TIMEOUT_MS =
  3000;

type SerpApiStore = {
  name?: unknown;
  title?: unknown;
  link?: unknown;
  price?: unknown;
  extracted_price?: unknown;
  original_price?: unknown;
  extracted_original_price?: unknown;
  details_and_offers?: unknown;
  tag?: unknown;
};

type SerpApiProductResults = {
  title?: unknown;
  stores?: unknown;
  stores_next_page_token?: unknown;
};

type SerpApiImmersiveResponse = {
  product_results?: unknown;
  product_result?: unknown;
  error?: unknown;
};

type MerchantOffer = {
  retailer: string;
  title: string;
  url: string;
  price: number | null;
  originalPrice: number | null;
  details: string[];
  tag: string;
};

type RetailerConfig = {
  aliases: string[];
  domains: string[];
  buildSearchUrl: (query: string) => string;
};

const RETAILER_CONFIGS: RetailerConfig[] = [
  {
    aliases: ["walmart", "walmart.com"],
    domains: ["walmart.com"],
    buildSearchUrl: query =>
      `https://www.walmart.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    aliases: ["cvs", "cvs pharmacy", "cvs.com"],
    domains: ["cvs.com"],
    buildSearchUrl: query =>
      `https://www.cvs.com/search?searchTerm=${encodeURIComponent(query)}`,
  },
  {
    aliases: ["gnc", "gnc.com"],
    domains: ["gnc.com"],
    buildSearchUrl: query =>
      `https://www.gnc.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    aliases: ["walgreens", "walgreens.com"],
    domains: ["walgreens.com"],
    buildSearchUrl: query =>
      `https://www.walgreens.com/search/results.jsp?Ntt=${encodeURIComponent(query)}`,
  },
  {
    aliases: ["target", "target.com"],
    domains: ["target.com"],
    buildSearchUrl: query =>
      `https://www.target.com/s?searchTerm=${encodeURIComponent(query)}`,
  },
  {
    aliases: ["amazon", "amazon.com"],
    domains: ["amazon.com"],
    buildSearchUrl: query =>
      `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
  },
  {
    aliases: ["iherb", "iherb.com"],
    domains: ["iherb.com"],
    buildSearchUrl: query =>
      `https://www.iherb.com/search?kw=${encodeURIComponent(query)}`,
  },
  {
    aliases: ["the vitamin shoppe", "vitamin shoppe", "vitaminshoppe"],
    domains: ["vitaminshoppe.com"],
    buildSearchUrl: query =>
      `https://www.vitaminshoppe.com/search?search=${encodeURIComponent(query)}`,
  },
  {
    aliases: ["swanson", "swanson vitamins", "swanson health products"],
    domains: ["swansonvitamins.com"],
    buildSearchUrl: query =>
      `https://www.swansonvitamins.com/q?kw=${encodeURIComponent(query)}`,
  },
  {
    aliases: ["vitacost", "vitacost.com"],
    domains: ["vitacost.com"],
    buildSearchUrl: query =>
      `https://www.vitacost.com/productsearch.aspx?t=${encodeURIComponent(query)}`,
  },
];

export type ResolveLiveMerchantOfferInput = {
  retailer: string;
  productTitle: string;
  bottlePrice: number | null;
  shoppingProductId: string | null;
  immersiveProductPageToken: string | null;
  serpApiImmersiveProductUrl?: string | null;
};

export type ResolvedLiveMerchantOffer = {
  url: string;
  matchType:
    | "immersive-store"
    | "retailer-search-fallback";
  retailer: string;
  productTitle: string;
  verifiedBottleUnitCount: number | null;
  merchantProductTitle: string;
  originalBottlePrice: number | null;
  liveBottlePrice: number | null;
  originalMerchantPrice: number | null;
  priceChanged: boolean;
  priceDifferenceAmount: number | null;
  priceDifferencePercentage: number | null;
  details: string[];
  tag: string;
};

function stringValue(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function numberValue(value: unknown): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed =
    Number(
      value.replace(
        /[^0-9.]/g,
        ""
      )
    );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(stringValue)
    .filter(Boolean);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compactRetailerName(value: string) {
  return normalizeText(value)
    .replace(/\bpharmacy\b/g, "")
    .replace(/\bstore\b/g, "")
    .replace(/\bonline\b/g, "")
    .replace(/\bseller\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function merchantNamesMatch(
  requestedRetailer: string,
  liveRetailer: string
) {
  const requested =
    compactRetailerName(requestedRetailer);

  const live =
    compactRetailerName(liveRetailer);

  if (!requested || !live) {
    return false;
  }

  return (
    requested === live ||
    requested.includes(live) ||
    live.includes(requested)
  );
}

function getRetailerConfig(
  retailer: string
): RetailerConfig | null {
  const normalized =
    compactRetailerName(retailer);

  for (const config of RETAILER_CONFIGS) {
    if (
      config.aliases.some(alias => {
        const normalizedAlias =
          compactRetailerName(alias);

        return (
          normalized === normalizedAlias ||
          normalized.includes(normalizedAlias) ||
          normalizedAlias.includes(normalized)
        );
      })
    ) {
      return config;
    }
  }

  return null;
}

function hostnameMatchesDomains(
  hostname: string,
  domains: string[]
) {
  const normalizedHostname =
    hostname
      .toLowerCase()
      .replace(/^www\./, "");

  return domains.some(domain => {
    const normalizedDomain =
      domain
        .toLowerCase()
        .replace(/^www\./, "");

    return (
      normalizedHostname === normalizedDomain ||
      normalizedHostname.endsWith(
        `.${normalizedDomain}`
      )
    );
  });
}

function getValidMerchantUrl(
  value: string,
  requestedRetailer: string
): URL | null {
  try {
    const parsedUrl =
      new URL(value);

    if (
      parsedUrl.protocol !== "https:"
    ) {
      return null;
    }

    const hostname =
      parsedUrl.hostname
        .toLowerCase()
        .replace(/^www\./, "");

    if (
      !hostname ||
      hostname === "google.com" ||
      hostname.endsWith(".google.com") ||
      hostname === "serpapi.com" ||
      hostname.endsWith(".serpapi.com")
    ) {
      return null;
    }

    const config =
      getRetailerConfig(requestedRetailer);

    /*
     * For known supplement retailers, never allow a URL
     * outside the retailer's own domain. This prevents a
     * "Buy at Walmart" button from ever opening Macy's,
     * RadioShack, or another unrelated merchant.
     */
    if (
      config &&
      !hostnameMatchesDomains(
        hostname,
        config.domains
      )
    ) {
      return null;
    }

    return parsedUrl;
  } catch {
    return null;
  }
}

function extractBottleUnitCount(
  values: string[]
): number | null {
  const searchableText =
    values
      .filter(Boolean)
      .join(" ");

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

  for (const pattern of patterns) {
    const match =
      searchableText.match(pattern);

    if (!match) {
      continue;
    }

    const count =
      Number(match[1]);

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

function mapStore(
  store: SerpApiStore,
  requestedRetailer: string
): MerchantOffer | null {
  const retailer =
    stringValue(store.name);

  if (
    !merchantNamesMatch(
      requestedRetailer,
      retailer
    )
  ) {
    return null;
  }

  const rawUrl =
    stringValue(store.link);

  const validUrl =
    getValidMerchantUrl(
      rawUrl,
      requestedRetailer
    );

  if (!validUrl) {
    return null;
  }

  return {
    retailer,
    title:
      stringValue(store.title),
    url:
      validUrl.toString(),
    price:
      numberValue(
        store.extracted_price
      ) ??
      numberValue(store.price),
    originalPrice:
      numberValue(
        store.extracted_original_price
      ) ??
      numberValue(
        store.original_price
      ),
    details:
      stringArray(
        store.details_and_offers
      ),
    tag:
      stringValue(store.tag),
  };
}

function extractImmersivePage(
  data: SerpApiImmersiveResponse,
  requestedRetailer: string
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
    plural ?? singular;

  const stores =
    productResults &&
    Array.isArray(
      productResults.stores
    )
      ? (
          productResults.stores as
            SerpApiStore[]
        )
          .map(store =>
            mapStore(
              store,
              requestedRetailer
            )
          )
          .filter(
            (
              offer
            ): offer is MerchantOffer =>
              offer !== null
          )
      : [];

  return {
    productTitle:
      stringValue(
        productResults?.title
      ),
    offers:
      stores,
    nextPageToken:
      stringValue(
        productResults
          ?.stores_next_page_token
      ),
  };
}

function calculatePriceDifference({
  originalPrice,
  livePrice,
}: {
  originalPrice: number | null;
  livePrice: number | null;
}) {
  if (
    originalPrice === null ||
    originalPrice <= 0 ||
    livePrice === null ||
    livePrice <= 0
  ) {
    return {
      amount: null,
      percentage: null,
      changed: false,
    };
  }

  const amount =
    livePrice - originalPrice;

  const percentage =
    amount / originalPrice;

  return {
    amount,
    percentage,
    changed:
      Math.abs(amount) > 0.5 ||
      Math.abs(percentage) > 0.05,
  };
}

function extractTokenFromSerpApiUrl(
  value: string | null | undefined
) {
  if (!value) {
    return "";
  }

  try {
    const parsed =
      new URL(value);

    return (
      parsed.searchParams
        .get("page_token")
        ?.trim() ?? ""
    );
  } catch {
    return "";
  }
}

async function fetchSerpApiJson<T>({
  params,
  timeoutMs,
  label,
}: {
  params: URLSearchParams;
  timeoutMs: number;
  label: string;
}): Promise<T> {
  const abortController =
    new AbortController();

  const timeoutId =
    setTimeout(
      () =>
        abortController.abort(),
      timeoutMs
    );

  let response: Response;

  try {
    response =
      await fetch(
        `${SERP_API_ENDPOINT}?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept:
              "application/json",
          },
          signal:
            abortController.signal,
        }
      );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        `${label} took too long.`
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  let data:
    T & {
      error?: unknown;
    };

  try {
    data =
      await response.json() as
        T & {
          error?: unknown;
        };
  } catch {
    throw new Error(
      `${label} returned invalid JSON.`
    );
  }

  if (!response.ok) {
    throw new Error(
      stringValue(data.error) ||
      `${label} failed with status ${response.status}.`
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

  return data;
}

async function lookupImmersivePage({
  apiKey,
  pageToken,
  nextPageToken,
  requestedRetailer,
  timeoutMs,
}: {
  apiKey: string;
  pageToken: string;
  nextPageToken?: string;
  requestedRetailer: string;
  timeoutMs: number;
}) {
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

  if (nextPageToken) {
    params.set(
      "next_page_token",
      nextPageToken
    );
  }

  const data =
    await fetchSerpApiJson<
      SerpApiImmersiveResponse
    >({
      params,
      timeoutMs,
      label:
        nextPageToken
          ? "Additional store lookup"
          : "Immersive product lookup",
    });

  return extractImmersivePage(
    data,
    requestedRetailer
  );
}

function buildResolvedOffer({
  selectedOffer,
  resolvedProductTitle,
  fallbackProductTitle,
  bottlePrice,
}: {
  selectedOffer: MerchantOffer;
  resolvedProductTitle: string;
  fallbackProductTitle: string;
  bottlePrice: number | null;
}): ResolvedLiveMerchantOffer {
  const title =
    resolvedProductTitle ||
    fallbackProductTitle;

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
      title,
    verifiedBottleUnitCount:
      extractBottleUnitCount([
        title,
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

function buildRetailerSearchFallback({
  retailer,
  productTitle,
  bottlePrice,
}: {
  retailer: string;
  productTitle: string;
  bottlePrice: number | null;
}): ResolvedLiveMerchantOffer | null {
  const config =
    getRetailerConfig(retailer);

  if (
    !config ||
    !productTitle.trim()
  ) {
    return null;
  }

  return {
    url:
      config.buildSearchUrl(
        productTitle.trim()
      ),
    matchType:
      "retailer-search-fallback",
    retailer,
    productTitle,
    verifiedBottleUnitCount:
      extractBottleUnitCount([
        productTitle,
      ]),
    merchantProductTitle:
      productTitle,
    originalBottlePrice:
      bottlePrice,
    liveBottlePrice:
      null,
    originalMerchantPrice:
      null,
    priceChanged:
      false,
    priceDifferenceAmount:
      null,
    priceDifferencePercentage:
      null,
    details: [],
    tag:
      "Retailer search",
  };
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

  if (!normalizedProductTitle) {
    throw new Error(
      "Product title is required."
    );
  }

  const apiKey =
    process.env.SERPAPI_API_KEY ??
    process.env.SERP_API_KEY;

  console.log(
    "VidaSearch merchant lookup started:",
    {
      retailer:
        normalizedRetailer,
      productTitle:
        normalizedProductTitle,
      hasImmersiveToken:
        Boolean(normalizedToken),
      /*
       * shoppingProductId is intentionally not used:
       * Google Product has been shut down. We keep it
       * in the request shape for backward compatibility.
       */
      hasLegacyShoppingProductId:
        Boolean(
          shoppingProductId?.trim()
        ),
    }
  );

  /*
   * Exact product path:
   * Use only the Google Immersive Product token, which is
   * the supported product-store API. Never substitute a
   * different merchant: "Buy at Walmart" must resolve to
   * Walmart or fall back to a Walmart product search.
   */
  if (
    apiKey &&
    normalizedToken
  ) {
    try {
      const firstPage =
        await lookupImmersivePage({
          apiKey,
          pageToken:
            normalizedToken,
          requestedRetailer:
            normalizedRetailer,
          timeoutMs:
            IMMERSIVE_TIMEOUT_MS,
        });

      const exactOffer =
        firstPage.offers[0] ??
        null;

      if (exactOffer) {
        return buildResolvedOffer({
          selectedOffer:
            exactOffer,
          resolvedProductTitle:
            firstPage.productTitle,
          fallbackProductTitle:
            normalizedProductTitle,
          bottlePrice,
        });
      }

      /*
       * SerpApi returns up to 13 stores with more_stores=true.
       * If the requested retailer is not there and another page
       * exists, check one additional page before falling back.
       */
      if (
        firstPage.nextPageToken
      ) {
        try {
          const secondPage =
            await lookupImmersivePage({
              apiKey,
              pageToken:
                normalizedToken,
              nextPageToken:
                firstPage.nextPageToken,
              requestedRetailer:
                normalizedRetailer,
              timeoutMs:
                IMMERSIVE_NEXT_PAGE_TIMEOUT_MS,
            });

          const pagedOffer =
            secondPage.offers[0] ??
            null;

          if (pagedOffer) {
            return buildResolvedOffer({
              selectedOffer:
                pagedOffer,
              resolvedProductTitle:
                secondPage.productTitle ||
                firstPage.productTitle,
              fallbackProductTitle:
                normalizedProductTitle,
              bottlePrice,
            });
          }
        } catch (error) {
          console.warn(
            "VidaSearch additional store lookup failed:",
            error
          );
        }
      }
    } catch (error) {
      console.warn(
        "VidaSearch immersive merchant lookup failed:",
        error
      );
    }
  }

  /*
   * Reliable fallback:
   * Do not return an error for common supplement retailers.
   * Send the customer to that retailer's own search results
   * for the exact product title. This is deliberately less
   * precise than an exact product page, but it cannot send a
   * Walmart click to Macy's or an unrelated product.
   */
  const retailerSearchFallback =
    buildRetailerSearchFallback({
      retailer:
        normalizedRetailer,
      productTitle:
        normalizedProductTitle,
      bottlePrice,
    });

  if (retailerSearchFallback) {
    return retailerSearchFallback;
  }

  throw new Error(
    `A verified ${normalizedRetailer} bottle link is not available for ${normalizedProductTitle}.`
  );
}
