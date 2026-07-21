import {
  NextResponse,
 } from "next/server";
 
 export const runtime =
  "nodejs";
 
 export const dynamic =
  "force-dynamic";
 
 const SERP_API_ENDPOINT =
  "https://serpapi.com/search.json";
 
 const LOOKUP_TIMEOUT_MS =
  15000;
 
 type VendorLinkRequest = {
  retailer?: string;
 
  productTitle?: string;
 
  bottlePrice?: number;
 
  shoppingProductId?: string;
 
  immersiveProductPageToken?: string;
 
  serpApiImmersiveProductUrl?: string;
 };
 
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
 
 type MerchantConfiguration = {
  normalizedNames: string[];
 
  domains: string[];
 };
 
 type MerchantOffer = {
  retailer: string;
 
  title: string;
 
  url: string;
 
  price: number | null;
 
  originalPrice:
    number | null;
 
  details: string[];
 
  tag: string;
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
 
 function stringArray(
  value: unknown
 ) {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }
 
  return value
    .map(
      stringValue
    )
    .filter(Boolean);
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
 
 function getMerchantConfiguration(
  retailer: string
 ): MerchantConfiguration | null {
  const normalized =
    normalizeText(
      retailer
    );
 
  if (
    normalized.includes(
      "walmart"
    )
  ) {
    return {
      normalizedNames: [
        "walmart",
      ],
 
      domains: [
        "walmart.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "target"
    )
  ) {
    return {
      normalizedNames: [
        "target",
      ],
 
      domains: [
        "target.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "cvs"
    )
  ) {
    return {
      normalizedNames: [
        "cvs",
        "cvs pharmacy",
      ],
 
      domains: [
        "cvs.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "walgreens"
    )
  ) {
    return {
      normalizedNames: [
        "walgreens",
        "walgreens com",
      ],
 
      domains: [
        "walgreens.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "amazon"
    )
  ) {
    return {
      normalizedNames: [
        "amazon",
        "amazon com",
      ],
 
      domains: [
        "amazon.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "gnc"
    )
  ) {
    return {
      normalizedNames: [
        "gnc",
      ],
 
      domains: [
        "gnc.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "iherb"
    )
  ) {
    return {
      normalizedNames: [
        "iherb",
      ],
 
      domains: [
        "iherb.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "thrive market"
    )
  ) {
    return {
      normalizedNames: [
        "thrive market",
      ],
 
      domains: [
        "thrivemarket.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "pureformulas"
    )
  ) {
    return {
      normalizedNames: [
        "pureformulas",
        "pureformulas com",
      ],
 
      domains: [
        "pureformulas.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "life extension"
    )
  ) {
    return {
      normalizedNames: [
        "life extension",
      ],
 
      domains: [
        "lifeextension.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "puritan"
    )
  ) {
    return {
      normalizedNames: [
        "puritans pride",
        "puritan",
      ],
 
      domains: [
        "puritan.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "thorne"
    )
  ) {
    return {
      normalizedNames: [
        "thorne",
      ],
 
      domains: [
        "thorne.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "megafood"
    )
  ) {
    return {
      normalizedNames: [
        "megafood",
        "megafood com",
      ],
 
      domains: [
        "megafood.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "olly"
    )
  ) {
    return {
      normalizedNames: [
        "olly",
      ],
 
      domains: [
        "olly.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "irwin naturals"
    )
  ) {
    return {
      normalizedNames: [
        "irwin naturals",
      ],
 
      domains: [
        "irwinnaturals.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "whole foods"
    )
  ) {
    return {
      normalizedNames: [
        "whole foods",
        "whole foods market",
        "amazon",
      ],
 
      domains: [
        "wholefoodsmarket.com",
        "amazon.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "macys"
    ) ||
    normalized.includes(
      "macy s"
    )
  ) {
    return {
      normalizedNames: [
        "macys",
        "macy s",
      ],
 
      domains: [
        "macys.com",
      ],
    };
  }
 
  if (
    normalized.includes(
      "hy vee"
    )
  ) {
    return {
      normalizedNames: [
        "hy vee",
      ],
 
      domains: [
        "hy-vee.com",
      ],
    };
  }
 
  return null;
 }
 
 function isAllowedMerchantUrl(
  url: string,
  domains: string[]
 ) {
  try {
    const parsedUrl =
      new URL(url);
 
    const hostname =
      parsedUrl.hostname
        .toLowerCase()
        .replace(
          /^www\./,
          ""
        );
 
    return domains.some(
      (domain) =>
        hostname === domain ||
        hostname.endsWith(
          `.${domain}`
        )
    );
  } catch {
    return false;
  }
 }
 
 function merchantNameMatches(
  merchantName: string,
  configuration:
    MerchantConfiguration
 ) {
  const normalizedName =
    normalizeText(
      merchantName
    );
 
  return configuration
    .normalizedNames
    .some(
      (acceptedName) => {
        const normalizedAcceptedName =
          normalizeText(
            acceptedName
          );
 
        return (
          normalizedName ===
            normalizedAcceptedName ||
          normalizedName.includes(
            normalizedAcceptedName
          ) ||
          normalizedAcceptedName.includes(
            normalizedName
          )
        );
      }
    );
 }
 
 function mapStore(
  store: SerpApiStore
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
  offer: SerpApiPricingOffer
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
  data: SerpApiResponse
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
 
  const uniqueOffers =
    new Map<
      string,
      MerchantOffer
 >();
 
  for (
    const offer of
    [...stores, ...pricing]
  ) {
    const key = [
      normalizeText(
        offer.retailer
      ),
 
      offer.url,
 
      offer.price ??
        "",
    ].join("|");
 
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
    originalPrice == null ||
    originalPrice <= 0 ||
    livePrice == null ||
    livePrice <= 0
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
 
    /*
     * Treat a difference over $0.50 or 5%
     * as a meaningful price change.
     */
    changed:
      Math.abs(
        amount
      ) > 0.5 ||
      Math.abs(
        percentage
      ) > 0.05,
  };
 }
 
 export async function POST(
  request: Request
 ) {
  try {
    const body =
      (await request.json()) as
        VendorLinkRequest;
 
    const retailer =
      body.retailer?.trim() ||
      "";
 
    const productTitle =
      body.productTitle?.trim() ||
      "";
 
    const shoppingProductId =
      body.shoppingProductId
        ?.trim() ||
      "";
 
    const immersiveProductPageToken =
      body
        .immersiveProductPageToken
        ?.trim() ||
      "";
 
    const originalBottlePrice =
      typeof body.bottlePrice ===
        "number" &&
      Number.isFinite(
        body.bottlePrice
      ) &&
      body.bottlePrice > 0
        ? body.bottlePrice
        : null;
 
    if (!retailer) {
      return NextResponse.json(
        {
          error:
            "Retailer is required.",
        },
        {
          status: 400,
        }
      );
    }
 
    if (
      !immersiveProductPageToken
    ) {
      return NextResponse.json(
        {
          error:
            "The exact Google Shopping product token is missing.",
        },
        {
          status: 400,
        }
      );
    }
 
    const merchantConfiguration =
      getMerchantConfiguration(
        retailer
      );
 
    if (
      !merchantConfiguration
    ) {
      return NextResponse.json(
        {
          error:
            `Direct links are not configured for ${retailer}.`,
        },
        {
          status: 422,
        }
      );
    }
 
    const apiKey =
      process.env
        .SERPAPI_API_KEY;
 
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "SERPAPI_API_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }
 
    console.log(
      "VitaSearch immersive vendor lookup started:",
      {
        retailer,
 
        productTitle,
 
        shoppingProductId:
          shoppingProductId ||
          null,
 
        originalBottlePrice,
 
        hasImmersiveToken:
          true,
      }
    );
 
    const params =
      new URLSearchParams({
        engine:
          "google_immersive_product",
 
        page_token:
          immersiveProductPageToken,
 
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
        return NextResponse.json(
          {
            error:
              "The exact product lookup took too long. Please try again.",
          },
          {
            status: 504,
          }
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
      return NextResponse.json(
        {
          error:
            "SerpApi returned an invalid immersive-product response.",
        },
        {
          status: 502,
        }
      );
    }
 
    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            stringValue(
              data.error
            ) ||
            `Immersive product lookup failed with status ${response.status}.`,
        },
        {
          status: 502,
        }
      );
    }
 
    if (
      typeof data.error ===
        "string" &&
      data.error.trim()
    ) {
      return NextResponse.json(
        {
          error:
            data.error.trim(),
        },
        {
          status: 502,
        }
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
        (offer) =>
          merchantNameMatches(
            offer.retailer,
            merchantConfiguration
          ) &&
          isAllowedMerchantUrl(
            offer.url,
            merchantConfiguration
              .domains
          )
      );
 
    /*
     * Prefer an offer whose price matches
     * the original headline Shopping price.
     * If the price changed, the closest
     * current offer from the exact product
     * grouping is selected.
     */
    const selectedOffer =
      [...matchingOffers]
        .sort(
          (
            left,
            right
          ) => {
            if (
              originalBottlePrice ==
              null
            ) {
              return 0;
            }
 
            const leftDifference =
              left.price == null
                ? Number
                    .POSITIVE_INFINITY
                : Math.abs(
                    left.price -
                    originalBottlePrice
                  );
 
            const rightDifference =
              right.price == null
                ? Number
                    .POSITIVE_INFINITY
                : Math.abs(
                    right.price -
                    originalBottlePrice
                  );
 
            return (
              leftDifference -
              rightDifference
            );
          }
        )[0];
 
    console.log(
      "VitaSearch immersive vendor lookup completed:",
      {
        requestedRetailer:
          retailer,
 
        requestedProductTitle:
          productTitle,
 
        immersiveProductTitle:
          immersiveProductTitle ||
          null,
 
        shoppingProductId:
          shoppingProductId ||
          null,
 
        totalStoreOffers:
          offers.length,
 
        matchingStoreOffers:
          matchingOffers.map(
            (offer) => ({
              retailer:
                offer.retailer,
 
              title:
                offer.title,
 
              price:
                offer.price,
 
              url:
                offer.url,
            })
          ),
 
        selectedOffer:
          selectedOffer
            ? {
                retailer:
                  selectedOffer
                    .retailer,
 
                title:
                  selectedOffer
                    .title,
 
                price:
                  selectedOffer
                    .price,
 
                url:
                  selectedOffer
                    .url,
              }
            : null,
      }
    );
 
    if (!selectedOffer) {
      return NextResponse.json(
        {
          error:
            `The exact ${retailer} offer could not be found for this Google Shopping product.`,
        },
        {
          status: 404,
        }
      );
    }
 
    const priceDifference =
      calculatePriceDifference({
        originalPrice:
          originalBottlePrice,
 
        livePrice:
          selectedOffer.price,
      });
 
    return NextResponse.json({
      url:
        selectedOffer.url,
 
      matchType:
        "immersive-store",
 
      retailer:
        selectedOffer.retailer,
 
      productTitle:
        immersiveProductTitle ||
        productTitle,
 
      merchantProductTitle:
        selectedOffer.title,
 
      originalBottlePrice,
 
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
    });
  } catch (
    error
  ) {
    console.error(
      "VitaSearch immersive vendor lookup failed:",
      error
    );
 
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Exact vendor lookup failed.",
      },
      {
        status: 500,
      }
    );
  }
 }