import {
    after,
   } from "next/server";
   
   import {
    DataConfidence,
   } from "@/lib/generated/prisma/client";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import type {
    ProductSearchRequest,
   } from "@/app/api/pricing/providers/providerTypes";
   
   import type {
    SearchRetailProduct,
   } from "@/lib/search/searchRetailProduct";
   
   import type {
    BrandResolution,
    OpenAiBrandResolution,
   } from "../brandResolutionTypes";
   
   import {
    resolveProductBrandBatch,
   } from "./resolveProductBrandBatch";
   
   import {
    resolveBrandsWithOpenAi,
   } from "./resolveBrandsWithOpenAi";
   
   import {
    invalidateBrandCatalogCache,
   } from "./loadBrandCatalog";
   
   const LIVE_ENRICHMENT_TIMEOUT_MS =
    1800;
   
   const MAX_LIVE_UNKNOWN_TITLES =
    24;
   
   const LIVE_DISPLAY_CONFIDENCE =
    0.88;
   
   const AUTO_PERSIST_CONFIDENCE =
    0.97;
   
   const MAX_BRAND_WORDS =
    5;
   
   const GENERIC_BRAND_VALUES =
    new Set([
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
      "gummy",
      "gummies",
      "powder",
      "liquid",
      "formula",
      "blend",
      "support",
      "unknown brand",
    ]);
   
   type KeyedListing = {
    key:
      string;
   
    listing:
      SearchRetailProduct;
   };
   
   type AcceptedLiveBrand = {
    key:
      string;
   
    productTitle:
      string;
   
    canonicalBrand:
      string;
   
    observedAlias:
      string;
   
    confidence:
      number;
   
    existingBrandLikely:
      boolean;
   
    shouldPersist:
      boolean;
   };
   
   function cleanText(
    value:
      string
   ) {
    return value
      .replace(
        /\s+/g,
        " "
      )
      .trim();
   }
   
   function normalizeBrandText(
    value:
      string
   ) {
    return cleanText(
      value
    )
      .toLowerCase()
      .replace(
        /&/g,
        " and "
      )
      .replace(
        /[®™©]/g,
        ""
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
   
   function cleanKeyPart(
    value:
      string | undefined
   ) {
    return (
      value
        ?.toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        )
        .slice(
          0,
          100
        ) ||
      "unknown"
    );
   }
   
   function buildListingKey({
    listing,
    index,
   }: {
    listing:
      SearchRetailProduct;
   
    index:
      number;
   }) {
    const identity =
      listing.shoppingProductId
        ? `shopping-${cleanKeyPart(
            listing.shoppingProductId
          )}`
        : `title-${cleanKeyPart(
            listing.productTitle
          )}`;
   
    return [
      identity,
      cleanKeyPart(
        listing.retailer
      ),
      index,
    ].join(
      "|"
    );
   }
   
   function isUnresolvedResolution(
    resolution:
      BrandResolution | undefined
   ) {
    if (
      !resolution
    ) {
      return true;
    }
   
    return (
      resolution.source ===
        "deterministic-parser" ||
      resolution.source ===
        "unknown"
    );
   }
   
   function titleStartsWithBrand({
    productTitle,
    brand,
   }: {
    productTitle:
      string;
   
    brand:
      string;
   }) {
    const normalizedTitle =
      normalizeBrandText(
        productTitle
      );
   
    const normalizedBrand =
      normalizeBrandText(
        brand
      );
   
    return (
      Boolean(
        normalizedTitle &&
        normalizedBrand
      ) &&
      (
        normalizedTitle ===
          normalizedBrand ||
        normalizedTitle.startsWith(
          `${normalizedBrand} `
        )
      )
    );
   }
   
   function isSafeBrandValue(
    value:
      string
   ) {
    const cleaned =
      cleanText(
        value
      );
   
    const normalized =
      normalizeBrandText(
        cleaned
      );
   
    const wordCount =
      normalized
        .split(
          /\s+/
        )
        .filter(
          Boolean
        )
        .length;
   
    return (
      cleaned.length >=
        2 &&
      cleaned.length <=
        80 &&
      wordCount >=
        1 &&
      wordCount <=
        MAX_BRAND_WORDS &&
      !GENERIC_BRAND_VALUES.has(
        normalized
      )
    );
   }
   
   function chooseObservedPrefix({
    productTitle,
    canonicalBrand,
    observedAlias,
   }: {
    productTitle:
      string;
   
    canonicalBrand:
      string;
   
    observedAlias:
      string | null;
   }) {
    const cleanedAlias =
      observedAlias
        ? cleanText(
            observedAlias
          )
        : "";
   
    if (
      cleanedAlias &&
      titleStartsWithBrand({
        productTitle,
        brand:
          cleanedAlias,
      })
    ) {
      return cleanedAlias;
    }
   
    if (
      titleStartsWithBrand({
        productTitle,
        brand:
          canonicalBrand,
      })
    ) {
      return canonicalBrand;
    }
   
    return null;
   }
   
   function acceptOpenAiBrand({
    key,
    productTitle,
    resolution,
   }: {
    key:
      string;
   
    productTitle:
      string;
   
    resolution:
      OpenAiBrandResolution;
   }): AcceptedLiveBrand | null {
    const canonicalBrand =
      resolution.canonicalBrand
        ? cleanText(
            resolution.canonicalBrand
          )
        : "";
   
    if (
      !resolution.identifiable ||
      resolution.confidence <
        LIVE_DISPLAY_CONFIDENCE ||
      !canonicalBrand ||
      !isSafeBrandValue(
        canonicalBrand
      )
    ) {
      return null;
    }
   
    const observedPrefix =
      chooseObservedPrefix({
        productTitle,
   
        canonicalBrand,
   
        observedAlias:
          resolution.observedAlias,
      });
   
    /*
     * The model result must correspond to text actually
     * present at the beginning of the product title.
     *
     * This prevents a plausible but invented brand from
     * being displayed or persisted.
     */
    if (
      !observedPrefix ||
      !isSafeBrandValue(
        observedPrefix
      )
    ) {
      return null;
    }
   
    return {
      key,
   
      productTitle,
   
      canonicalBrand,
   
      observedAlias:
        observedPrefix,
   
      confidence:
        resolution.confidence,
   
      existingBrandLikely:
        resolution
          .existingBrandLikely,
   
      shouldPersist:
        resolution.confidence >=
          AUTO_PERSIST_CONFIDENCE &&
        resolution
          .existingBrandLikely,
    };
   }
   
   function timeoutResult<T>({
    promise,
    timeoutMs,
   }: {
    promise:
      Promise<T>;
   
    timeoutMs:
      number;
   }): Promise<
    T | null
   >{
    return Promise.race([
      promise,
   
      new Promise<null>(
        (
          resolve
        ) => {
          setTimeout(
            () =>
              resolve(
                null
              ),
            timeoutMs
          );
        }
      ),
    ]);
   }
   
   async function persistAcceptedBrands(
    acceptedBrands:
      AcceptedLiveBrand[]
   ) {
    const persistableBrands =
      acceptedBrands.filter(
        (
          result
        ) =>
          result.shouldPersist
      );
   
    if (
      persistableBrands.length ===
        0
    ) {
      return;
    }
   
    let changedCatalog =
      false;
   
    for (
      const result of
      persistableBrands
    ) {
      try {
        const existingBrand =
          await prisma.brand.findFirst({
            where: {
              canonicalName: {
                equals:
                  result
                    .canonicalBrand,
   
                mode:
                  "insensitive",
              },
            },
   
            select: {
              id:
                true,
   
              canonicalName:
                true,
            },
          });
   
        const brand =
          existingBrand ??
          await prisma.brand.create({
            data: {
              canonicalName:
                result
                  .canonicalBrand,
   
              /*
               * Live enrichment is strong extracted
               * evidence, but it is not independent
               * official-source verification.
               */
              profileConfidence:
                DataConfidence
                  .INFERRED,
            },
   
            select: {
              id:
                true,
   
              canonicalName:
                true,
            },
          });
   
        const aliases =
          Array.from(
            new Set(
              [
                result
                  .canonicalBrand,
   
                result
                  .observedAlias,
              ]
                .map(
                  (
                    alias
                  ) =>
                    cleanText(
                      alias
                    )
                )
                .filter(
                  Boolean
                )
            )
          );
   
        for (
          const alias of
          aliases
        ) {
          const normalizedAlias =
            normalizeBrandText(
              alias
            );
   
          if (
            !normalizedAlias
          ) {
            continue;
          }
   
          const existingAlias =
            await prisma
              .brandAlias
              .findUnique({
                where: {
                  normalizedAlias,
                },
   
                select: {
                  id:
                    true,
   
                  brandId:
                    true,
                },
              });
   
          /*
           * Never silently move an existing alias from
           * one canonical brand to another.
           */
          if (
            existingAlias &&
            existingAlias.brandId !==
              brand.id
          ) {
            console.warn(
              "VidaSearch live brand alias conflict:",
              {
                alias,
   
                normalizedAlias,
   
                attemptedCanonicalBrand:
                  brand.canonicalName,
   
                existingBrandId:
                  existingAlias
                    .brandId,
              }
            );
   
            continue;
          }
   
          await prisma
            .brandAlias
            .upsert({
              where: {
                normalizedAlias,
              },
   
              update: {
                alias,
   
                source:
                  "openai-live-brand-enrichment-v1",
   
                confidence:
                  DataConfidence
                    .INFERRED,
   
                brandId:
                  brand.id,
              },
   
              create: {
                alias,
   
                normalizedAlias,
   
                source:
                  "openai-live-brand-enrichment-v1",
   
                confidence:
                  DataConfidence
                    .INFERRED,
   
                brandId:
                  brand.id,
              },
            });
        }
   
        changedCatalog =
          true;
   
        console.log(
          "VidaSearch live brand persisted:",
          {
            canonicalBrand:
              brand.canonicalName,
   
            observedAlias:
              result
                .observedAlias,
   
            confidence:
              result.confidence,
          }
        );
      } catch (
        error
      ) {
        console.error(
          "VidaSearch live brand persistence failed:",
          {
            canonicalBrand:
              result
                .canonicalBrand,
   
            observedAlias:
              result
                .observedAlias,
   
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
   
    if (
      changedCatalog
    ) {
      invalidateBrandCatalogCache();
    }
   }
   
   function scheduleBrandPersistence(
    acceptedBrands:
      AcceptedLiveBrand[]
   ) {
    const snapshot =
      acceptedBrands.map(
        (
          result
        ) => ({
          ...result,
        })
      );
   
    after(
      async () => {
        await persistAcceptedBrands(
          snapshot
        );
      }
    );
   }
   
   /*
   * Perform narrowly scoped live enrichment for brand
   * names that could not be resolved from Brand or
   * BrandAlias.
   *
   * The live request:
   *
   * 1. Resolves known database brands locally.
   * 2. Sends only a limited number of unique unresolved
   *    titles to one batched OpenAI extraction call.
   * 3. Stops waiting after a strict timeout.
   * 4. Applies safe, high-confidence results to the
   *    current search response.
   * 5. Persists only exceptionally high-confidence
   *    results after the response.
   *
   * Parser guesses remain unchanged when enrichment
   * times out or returns uncertain output.
   */
   export async function enrichUnknownBrandsLive({
    listings,
    request,
   }: {
    listings:
      SearchRetailProduct[];
   
    request:
      ProductSearchRequest;
   }): Promise<
    SearchRetailProduct[]
   >{
    if (
      listings.length ===
        0
    ) {
      return [];
    }
   
    const keyedListings:
      KeyedListing[] =
      listings.map(
        (
          listing,
          index
        ) => ({
          key:
            buildListingKey({
              listing,
              index,
            }),
   
          listing,
        })
      );
   
    const initialResolutions =
      await resolveProductBrandBatch(
        keyedListings.map(
          ({
            key,
            listing,
          }) => ({
            key,
   
            productTitle:
              listing.productTitle,
   
            requestedBrand:
              request.brand,
   
            retailer:
              listing.retailer,
   
            shoppingProductId:
              listing
                .shoppingProductId,
   
            allowOpenAi:
              false,
          })
        )
      );
   
    const uniqueUnknownTitles =
      new Map<
        string,
        {
          key:
            string;
   
          productTitle:
            string;
   
          retailer:
            string;
        }
   >();
   
    for (
      const {
        key,
        listing,
      } of keyedListings
    ) {
      const resolution =
        initialResolutions.get(
          key
        );
   
      if (
        !isUnresolvedResolution(
          resolution
        )
      ) {
        continue;
      }
   
      const normalizedTitle =
        normalizeBrandText(
          listing.productTitle
        );
   
      if (
        !normalizedTitle ||
        uniqueUnknownTitles.has(
          normalizedTitle
        )
      ) {
        continue;
      }
   
      uniqueUnknownTitles.set(
        normalizedTitle,
        {
          key,
   
          productTitle:
            listing.productTitle,
   
          retailer:
            listing.retailer,
        }
      );
   
      if (
        uniqueUnknownTitles.size >=
          MAX_LIVE_UNKNOWN_TITLES
      ) {
        break;
      }
    }
   
    if (
      uniqueUnknownTitles.size ===
        0
    ) {
      return listings;
    }
   
    const openAiInput =
      Array.from(
        uniqueUnknownTitles.values()
      );
   
    const openAiResults =
      await timeoutResult({
        promise:
          resolveBrandsWithOpenAi(
            openAiInput
          ),
   
        timeoutMs:
          LIVE_ENRICHMENT_TIMEOUT_MS,
      });
   
    if (
      !openAiResults
    ) {
      console.warn(
        "VidaSearch live brand enrichment timed out:",
        {
          timeoutMs:
            LIVE_ENRICHMENT_TIMEOUT_MS,
   
          requestedTitleCount:
            openAiInput.length,
        }
      );
   
      return listings;
    }
   
    const acceptedByNormalizedTitle =
      new Map<
        string,
        AcceptedLiveBrand
   >();
   
    for (
      const input of
      openAiInput
    ) {
      const resolution =
        openAiResults.get(
          input.key
        );
   
      if (
        !resolution
      ) {
        continue;
      }
   
      const accepted =
        acceptOpenAiBrand({
          key:
            input.key,
   
          productTitle:
            input.productTitle,
   
          resolution,
        });
   
      if (
        !accepted
      ) {
        continue;
      }
   
      acceptedByNormalizedTitle.set(
        normalizeBrandText(
          input.productTitle
        ),
        accepted
      );
    }
   
    if (
      acceptedByNormalizedTitle.size ===
        0
    ) {
      return listings;
    }
   
    const enrichedListings =
      listings.map(
        (
          listing
        ) => {
          const accepted =
            acceptedByNormalizedTitle.get(
              normalizeBrandText(
                listing.productTitle
              )
            );
   
          if (
            !accepted
          ) {
            return listing;
          }
   
          return {
            ...listing,
   
            brand:
              accepted
                .canonicalBrand,
          };
        }
      );
   
    const acceptedBrands =
      Array.from(
        acceptedByNormalizedTitle.values()
      );
   
    scheduleBrandPersistence(
      acceptedBrands
    );
   
    console.log(
      "VidaSearch live brand enrichment completed:",
      {
        requestedTitleCount:
          openAiInput.length,
   
        acceptedTitleCount:
          acceptedBrands.length,
   
        scheduledPersistenceCount:
          acceptedBrands.filter(
            (
              result
            ) =>
              result.shouldPersist
          ).length,
   
        timeoutMs:
          LIVE_ENRICHMENT_TIMEOUT_MS,
      }
    );
   
    return enrichedListings;
   }
   