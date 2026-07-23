import {
    after,
   } from "next/server";
   
   import {
    CandidateReviewStatus,
    DataConfidence,
    DiscoveryCandidateType,
    DiscoveryStatus,
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
   } from "../brandResolutionTypes";
   
   import {
    invalidateBrandCatalogCache,
   } from "./loadBrandCatalog";
   
   import {
    resolveProductBrandBatch,
   } from "./resolveProductBrandBatch";
   
   const MAX_BACKGROUND_TITLES =
    20;
   
   const MIN_DISPLAY_CONFIDENCE =
    0.88;
   
   const MIN_AUTO_PERSIST_CONFIDENCE =
    0.97;
   
   /*
   * An unresolved title will not be submitted to OpenAI
   * again until this cooldown expires.
   *
   * This prevents separate customers from repeatedly
   * generating the same model request.
   */
   const BRAND_RESEARCH_COOLDOWN_DAYS =
    30;
   
   const BACKGROUND_PROVIDER =
    "openai-background-brand-enrichment-v1";
   
   const ATTEMPT_PROVIDER =
    "openai-background-brand-attempt-v1";
   
   type BackgroundBrandResult = {
    productTitle:
      string;
   
    retailer:
      string;
   
    shoppingProductId:
      string | null;
   
    canonicalBrand:
      string;
   
    observedAlias:
      string;
   
    confidence:
      number;
   };
   
   type KeyedListing = {
    key:
      string;
   
    listing:
      SearchRetailProduct;
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
          120
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
    const productIdentity =
      listing.shoppingProductId
        ? `shopping-${cleanKeyPart(
            listing.shoppingProductId
          )}`
        : `title-${cleanKeyPart(
            listing.productTitle
          )}`;
   
    return [
      productIdentity,
   
      cleanKeyPart(
        listing.retailer
      ),
   
      index,
    ].join(
      "|"
    );
   }
   
   function buildDiscoveryFingerprint({
    listing,
   }: {
    listing:
      SearchRetailProduct;
   }) {
    if (
      listing.shoppingProductId
        ?.trim()
    ) {
      return [
        "brand",
        "shopping-product",
        normalizeBrandText(
          listing.shoppingProductId
        ),
      ].join(
        "|"
      );
    }
   
    return [
      "brand",
      "title",
      normalizeBrandText(
        listing.productTitle
      ),
      "retailer",
      normalizeBrandText(
        listing.retailer
      ),
    ].join(
      "|"
    );
   }
   
   /*
   * Attempt fingerprints intentionally use a separate
   * namespace from review candidates.
   *
   * This allows VidaSearch to track cooldown attempts
   * without overwriting the existing DiscoveryCandidate
   * created by the review workflow.
   */
   function buildAttemptFingerprint({
    listing,
   }: {
    listing:
      SearchRetailProduct;
   }) {
    if (
      listing.shoppingProductId
        ?.trim()
    ) {
      return [
        "brand-enrichment-attempt",
        "shopping-product",
        normalizeBrandText(
          listing.shoppingProductId
        ),
      ].join(
        "|"
      );
    }
   
    return [
      "brand-enrichment-attempt",
      "title",
      normalizeBrandText(
        listing.productTitle
      ),
      "retailer",
      normalizeBrandText(
        listing.retailer
      ),
    ].join(
      "|"
    );
   }
   
   function getCooldownStartDate() {
    const cutoff =
      new Date();
   
    cutoff.setDate(
      cutoff.getDate() -
        BRAND_RESEARCH_COOLDOWN_DAYS
    );
   
    return cutoff;
   }
   
   function isKnownDatabaseResolution(
    resolution:
      BrandResolution | undefined
   ) {
    if (
      !resolution
    ) {
      return false;
    }
   
    return (
      resolution.source ===
        "requested-brand" ||
      resolution.source ===
        "database-canonical" ||
      resolution.source ===
        "database-alias"
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
   
   function titleEndsWithBrand({
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
        normalizedTitle.endsWith(
          ` ${normalizedBrand}`
        )
      )
    );
   }
   
   function titleContainsBrand({
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
        ) ||
        normalizedTitle.endsWith(
          ` ${normalizedBrand}`
        ) ||
        normalizedTitle.includes(
          ` ${normalizedBrand} `
        )
      )
    );
   }
   
   function chooseObservedAlias({
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
    const cleanedObservedAlias =
      observedAlias
        ? cleanText(
            observedAlias
          )
        : "";
   
    if (
      cleanedObservedAlias &&
      titleContainsBrand({
        productTitle,
   
        brand:
          cleanedObservedAlias,
      })
    ) {
      return cleanedObservedAlias;
    }
   
    if (
      titleContainsBrand({
        productTitle,
   
        brand:
          canonicalBrand,
      })
    ) {
      return canonicalBrand;
    }
   
    return null;
   }
   
   function isSafeBrandName(
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
   
    const words =
      normalized
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );
   
    return (
      cleaned.length >=
        2 &&
      cleaned.length <=
        80 &&
      words.length >=
        1 &&
      words.length <=
        5 &&
      normalized !==
        "unknown brand"
    );
   }
   
   async function persistAcceptedBrand(
    result:
      BackgroundBrandResult
   ) {
    const existingBrand =
      await prisma.brand.findFirst({
        where: {
          canonicalName: {
            equals:
              result.canonicalBrand,
   
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
            result.canonicalBrand,
   
          /*
           * This was extracted automatically and has
           * not yet been independently verified through
           * an official source.
           */
          profileConfidence:
            DataConfidence.INFERRED,
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
            result.canonicalBrand,
            result.observedAlias,
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
       * Never silently move an existing alias from one
       * canonical brand to another.
       */
      if (
        existingAlias &&
        existingAlias.brandId !==
          brand.id
      ) {
        console.warn(
          "VidaSearch background brand alias conflict:",
          {
            alias,
   
            canonicalBrand:
              brand.canonicalName,
   
            existingBrandId:
              existingAlias.brandId,
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
   
            brandId:
              brand.id,
   
            source:
              BACKGROUND_PROVIDER,
   
            confidence:
              DataConfidence.INFERRED,
          },
   
          create: {
            alias,
   
            normalizedAlias,
   
            brandId:
              brand.id,
   
            source:
              BACKGROUND_PROVIDER,
   
            confidence:
              DataConfidence.INFERRED,
          },
        });
    }
   
    console.log(
      "VidaSearch background brand persisted:",
      {
        canonicalBrand:
          brand.canonicalName,
   
        observedAlias:
          result.observedAlias,
   
        confidence:
          result.confidence,
      }
    );
   }
   
   async function recordNeedsReviewCandidate({
    listing,
    canonicalBrand,
    observedAlias,
    confidence,
    searchQuery,
   }: {
    listing:
      SearchRetailProduct;
   
    canonicalBrand:
      string | null;
   
    observedAlias:
      string | null;
   
    confidence:
      number | null;
   
    searchQuery:
      string;
   }) {
    const fingerprint =
      buildDiscoveryFingerprint({
        listing,
      });
   
    const existingCandidate =
      await prisma
        .discoveryCandidate
        .findUnique({
          where: {
            fingerprint,
          },
   
          select: {
            id:
              true,
   
            status:
              true,
          },
        });
   
    const discoveryRun =
      await prisma
        .discoveryRun
        .create({
          data: {
            status:
              DiscoveryStatus.COMPLETED,
   
            sourceProvider:
              BACKGROUND_PROVIDER,
   
            searchScope:
              searchQuery ||
              null,
   
            recordsDiscovered:
              1,
   
            recordsAccepted:
              1,
   
            completedAt:
              new Date(),
          },
   
          select: {
            id:
              true,
          },
        });
   
    const rawPayload = {
      productTitle:
        listing.productTitle,
   
      retailer:
        listing.retailer,
   
      shoppingProductId:
        listing.shoppingProductId ??
        null,
   
      currentDisplayBrand:
        listing.brand,
   
      extractedCanonicalBrand:
        canonicalBrand,
   
      extractedObservedAlias:
        observedAlias,
   
      confidence,
   
      searchQuery:
        searchQuery ||
        null,
    };
   
    const normalizedPayload = {
      normalizedProductTitle:
        normalizeBrandText(
          listing.productTitle
        ),
   
      normalizedRetailer:
        normalizeBrandText(
          listing.retailer
        ),
   
      normalizedExtractedBrand:
        canonicalBrand
          ? normalizeBrandText(
              canonicalBrand
            )
          : null,
   
      normalizedObservedAlias:
        observedAlias
          ? normalizeBrandText(
              observedAlias
            )
          : null,
    };
   
    if (
      existingCandidate
    ) {
      await prisma
        .discoveryCandidate
        .update({
          where: {
            id:
              existingCandidate.id,
          },
   
          data: {
            discoveryRunId:
              discoveryRun.id,
   
            occurrenceCount: {
              increment:
                1,
            },
   
            lastSeenAt:
              new Date(),
   
            rawPayload,
   
            normalizedPayload,
   
            confidenceScore:
              confidence ===
                null
                ? null
                : Math.round(
                    confidence *
                      100
                  ),
   
            /*
             * Preserve final review decisions.
             */
            ...(
              existingCandidate
                .status ===
                  CandidateReviewStatus
                    .PENDING ||
              existingCandidate
                .status ===
                  CandidateReviewStatus
                    .NEEDS_REVIEW
                ? {
                    status:
                      CandidateReviewStatus
                        .NEEDS_REVIEW,
                  }
                : {}
            ),
          },
        });
   
      return;
    }
   
    await prisma
      .discoveryCandidate
      .create({
        data: {
          discoveryRunId:
            discoveryRun.id,
   
          candidateType:
            DiscoveryCandidateType
              .BRAND,
   
          fingerprint,
   
          occurrenceCount:
            1,
   
          firstSeenAt:
            new Date(),
   
          lastSeenAt:
            new Date(),
   
          rawPayload,
   
          normalizedPayload,
   
          confidenceScore:
            confidence ===
              null
              ? null
              : Math.round(
                  confidence *
                    100
                ),
   
          status:
            CandidateReviewStatus
              .NEEDS_REVIEW,
        },
      });
   }
   
   async function findRecentlyAttemptedFingerprints(
    keyedListings:
      KeyedListing[]
   ) {
    if (
      keyedListings.length ===
        0
    ) {
      return new Set<string>();
    }
   
    const fingerprints =
      keyedListings.map(
        ({
          listing,
        }) =>
          buildAttemptFingerprint({
            listing,
          })
      );
   
    const recentAttempts =
      await prisma
        .discoveryCandidate
        .findMany({
          where: {
            fingerprint: {
              in:
                fingerprints,
            },
   
            candidateType:
              DiscoveryCandidateType
                .BRAND,
   
            lastSeenAt: {
              gte:
                getCooldownStartDate(),
            },
   
            discoveryRun: {
              sourceProvider:
                ATTEMPT_PROVIDER,
            },
          },
   
          select: {
            fingerprint:
              true,
          },
        });
   
    return new Set(
      recentAttempts.map(
        (
          attempt
        ) =>
          attempt.fingerprint
      )
    );
   }
   
   /*
   * Record attempts before calling OpenAI.
   *
   * This is important because quota failures and network
   * failures would otherwise be retried by every future
   * customer search.
   */
   async function recordBrandResearchAttempts({
    keyedListings,
    searchQuery,
   }: {
    keyedListings:
      KeyedListing[];
   
    searchQuery:
      string;
   }) {
    if (
      keyedListings.length ===
        0
    ) {
      return;
    }
   
    const now =
      new Date();
   
    const discoveryRun =
      await prisma
        .discoveryRun
        .create({
          data: {
            status:
              DiscoveryStatus.COMPLETED,
   
            sourceProvider:
              ATTEMPT_PROVIDER,
   
            searchScope:
              searchQuery ||
              null,
   
            recordsDiscovered:
              keyedListings.length,
   
            recordsAccepted:
              0,
   
            completedAt:
              now,
          },
   
          select: {
            id:
              true,
          },
        });
   
    await prisma.$transaction(
      keyedListings.map(
        ({
          listing,
        }) => {
          const fingerprint =
            buildAttemptFingerprint({
              listing,
            });
   
          return prisma
            .discoveryCandidate
            .upsert({
              where: {
                fingerprint,
              },
   
              update: {
                discoveryRunId:
                  discoveryRun.id,
   
                occurrenceCount: {
                  increment:
                    1,
                },
   
                lastSeenAt:
                  now,
   
                rawPayload: {
                  productTitle:
                    listing.productTitle,
   
                  retailer:
                    listing.retailer,
   
                  shoppingProductId:
                    listing
                      .shoppingProductId ??
                    null,
   
                  displayedBrand:
                    listing.brand,
   
                  searchQuery:
                    searchQuery ||
                    null,
   
                  attemptProvider:
                    ATTEMPT_PROVIDER,
   
                  cooldownDays:
                    BRAND_RESEARCH_COOLDOWN_DAYS,
                },
   
                normalizedPayload: {
                  normalizedProductTitle:
                    normalizeBrandText(
                      listing.productTitle
                    ),
   
                  normalizedRetailer:
                    normalizeBrandText(
                      listing.retailer
                    ),
                },
   
                status:
                  CandidateReviewStatus
                    .PENDING,
              },
   
              create: {
                discoveryRunId:
                  discoveryRun.id,
   
                candidateType:
                  DiscoveryCandidateType
                    .BRAND,
   
                fingerprint,
   
                occurrenceCount:
                  1,
   
                firstSeenAt:
                  now,
   
                lastSeenAt:
                  now,
   
                rawPayload: {
                  productTitle:
                    listing.productTitle,
   
                  retailer:
                    listing.retailer,
   
                  shoppingProductId:
                    listing
                      .shoppingProductId ??
                    null,
   
                  displayedBrand:
                    listing.brand,
   
                  searchQuery:
                    searchQuery ||
                    null,
   
                  attemptProvider:
                    ATTEMPT_PROVIDER,
   
                  cooldownDays:
                    BRAND_RESEARCH_COOLDOWN_DAYS,
                },
   
                normalizedPayload: {
                  normalizedProductTitle:
                    normalizeBrandText(
                      listing.productTitle
                    ),
   
                  normalizedRetailer:
                    normalizeBrandText(
                      listing.retailer
                    ),
                },
   
                status:
                  CandidateReviewStatus
                    .PENDING,
              },
            });
        }
      )
    );
   
    console.log(
      "VidaSearch background brand attempts recorded:",
      {
        searchQuery:
          searchQuery ||
          null,
   
        attemptCount:
          keyedListings.length,
   
        cooldownDays:
          BRAND_RESEARCH_COOLDOWN_DAYS,
   
        discoveryRunId:
          discoveryRun.id,
      }
    );
   }
   
   async function runUnknownBrandEnrichment({
    listings,
    request,
   }: {
    listings:
      SearchRetailProduct[];
   
    request:
      ProductSearchRequest;
   }) {
    const uniqueListings =
      new Map<
        string,
        SearchRetailProduct
  > ();
   
    for (
      const listing of
      listings
    ) {
      const normalizedTitle =
        normalizeBrandText(
          listing.productTitle
        );
   
      if (
        !normalizedTitle ||
        uniqueListings.has(
          normalizedTitle
        )
      ) {
        continue;
      }
   
      uniqueListings.set(
        normalizedTitle,
        listing
      );
    }
   
    const allKeyedListings:
      KeyedListing[] =
      Array.from(
        uniqueListings.values()
      ).map(
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
   
    if (
      allKeyedListings.length ===
        0
    ) {
      return;
    }
   
    /*
     * First run only the database and deterministic
     * resolver.
     *
     * This lets us remove known brands before checking
     * cooldowns or calling OpenAI.
     */
    const localResolutions =
      await resolveProductBrandBatch(
        allKeyedListings.map(
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
   
    const unresolvedListings =
      allKeyedListings.filter(
        ({
          key,
        }) => {
          const resolution =
            localResolutions.get(
              key
            );
   
          return (
            !isKnownDatabaseResolution(
              resolution
            ) &&
            isUnresolvedResolution(
              resolution
            )
          );
        }
      );
   
    if (
      unresolvedListings.length ===
        0
    ) {
      console.log(
        "VidaSearch background brand enrichment skipped because all brands were already known:",
        {
          receivedTitleCount:
            allKeyedListings.length,
        }
      );
   
      return;
    }
   
    const recentlyAttemptedFingerprints =
      await findRecentlyAttemptedFingerprints(
        unresolvedListings
      );
   
    const cooldownEligibleListings =
      unresolvedListings
        .filter(
          ({
            listing,
          }) =>
            !recentlyAttemptedFingerprints
              .has(
                buildAttemptFingerprint({
                  listing,
                })
              )
        )
        .slice(
          0,
          MAX_BACKGROUND_TITLES
        );
   
    const cooldownSkippedCount =
      unresolvedListings.length -
      cooldownEligibleListings.length;
   
    if (
      cooldownEligibleListings.length ===
        0
    ) {
      console.log(
        "VidaSearch background brand enrichment skipped by cooldown:",
        {
          unresolvedTitleCount:
            unresolvedListings.length,
   
          cooldownSkippedCount:
            unresolvedListings.length,
   
          cooldownDays:
            BRAND_RESEARCH_COOLDOWN_DAYS,
        }
      );
   
      return;
    }
   
    const searchQuery =
      [
        request.brand
          ?.trim(),
   
        request.supplement
          .trim(),
      ]
        .filter(
          Boolean
        )
        .join(
          " "
        );
   
    /*
     * Record the attempt before calling OpenAI so a 429
     * or network failure still activates the cooldown.
     */
    await recordBrandResearchAttempts({
      keyedListings:
        cooldownEligibleListings,
   
      searchQuery,
    });
   
    const resolutions =
      await resolveProductBrandBatch(
        cooldownEligibleListings.map(
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
              true,
          })
        )
      );
   
    let persistedCount =
      0;
   
    let reviewCount =
      0;
   
    for (
      const {
        key,
        listing,
      } of cooldownEligibleListings
    ) {
      const resolution =
        resolutions.get(
          key
        );
   
      /*
       * A title may have become database-resolvable
       * between the local pass and the OpenAI pass.
       */
      if (
        !resolution ||
        isKnownDatabaseResolution(
          resolution
        )
      ) {
        continue;
      }
   
      const canonicalBrand =
        resolution.canonicalName
          ? cleanText(
              resolution.canonicalName
            )
          : "";
   
      const observedAlias =
        chooseObservedAlias({
          productTitle:
            listing.productTitle,
   
          canonicalBrand,
   
          observedAlias:
            resolution.observedAlias,
        });
   
      const confidence =
        resolution.confidence ??
        0;
   
      const canPersist =
        resolution.source ===
          "openai" &&
        confidence >=
          MIN_AUTO_PERSIST_CONFIDENCE &&
        isSafeBrandName(
          canonicalBrand
        ) &&
        Boolean(
          observedAlias
        );
   
      if (
        canPersist &&
        observedAlias
      ) {
        await persistAcceptedBrand({
          productTitle:
            listing.productTitle,
   
          retailer:
            listing.retailer,
   
          shoppingProductId:
            listing.shoppingProductId ??
            null,
   
          canonicalBrand,
   
          observedAlias,
   
          confidence,
        });
   
        persistedCount +=
          1;
   
        continue;
      }
   
      /*
       * A useful but not sufficiently certain result is
       * retained for review rather than written into the
       * canonical Brand catalog.
       */
      if (
        resolution.source ===
          "openai" &&
        confidence >=
          MIN_DISPLAY_CONFIDENCE
      ) {
        await recordNeedsReviewCandidate({
          listing,
   
          canonicalBrand:
            canonicalBrand ||
            null,
   
          observedAlias,
   
          confidence,
   
          searchQuery,
        });
   
        reviewCount +=
          1;
      }
    }
   
    if (
      persistedCount >
        0
    ) {
      invalidateBrandCatalogCache();
    }
   
    console.log(
      "VidaSearch background brand enrichment completed:",
      {
        receivedTitleCount:
          allKeyedListings.length,
   
        unresolvedTitleCount:
          unresolvedListings.length,
   
        researchedTitleCount:
          cooldownEligibleListings.length,
   
        cooldownSkippedCount,
   
        cooldownDays:
          BRAND_RESEARCH_COOLDOWN_DAYS,
   
        persistedCount,
   
        reviewCount,
   
        searchQuery:
          searchQuery ||
          null,
      }
    );
   }
   
   /*
   * Start unknown-brand enrichment after the customer
   * response has been generated.
   *
   * The first search continues using the fast parser
   * result. High-confidence results are then persisted,
   * allowing later searches to resolve immediately from
   * Brand and BrandAlias without another model call.
   */
   export function scheduleUnknownBrandEnrichment({
    listings,
    request,
   }: {
    listings:
      SearchRetailProduct[];
   
    request:
      ProductSearchRequest;
   }) {
    if (
      listings.length ===
        0
    ) {
      return;
    }
   
    const listingSnapshot =
      listings.map(
        (
          listing
        ) => ({
          ...listing,
        })
      );
   
    const requestSnapshot = {
      ...request,
    };
   
    after(
      async () => {
        try {
          await runUnknownBrandEnrichment({
            listings:
              listingSnapshot,
   
            request:
              requestSnapshot,
          });
        } catch (
          error
        ) {
          console.error(
            "VidaSearch scheduled background brand enrichment failed:",
            {
              listingCount:
                listingSnapshot.length,
   
              supplement:
                requestSnapshot
                  .supplement,
   
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
    );
   }
   