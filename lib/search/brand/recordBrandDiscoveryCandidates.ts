import {
    CandidateReviewStatus,
    DiscoveryCandidateType,
    DiscoveryStatus,
   } from "@/lib/generated/prisma/client";
   
   import {
    prisma,
   } from "@/lib/db";
   
   import type {
    SearchRetailProduct,
   } from "@/lib/search/searchRetailProduct";
   
   import type {
    BrandResolution,
   } from "../brandResolutionTypes";
   
   type RecordBrandDiscoveryCandidatesInput = {
    listings:
      SearchRetailProduct[];
   
    resolutions:
      Map<
        string,
        BrandResolution
   >;
   
    listingKeys:
      string[];
   
    searchQuery?:
      string;
   
    sourceProvider?:
      string;
   };
   
   function normalizeText(
    value:
      string
   ) {
    return value
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
   
   function buildFingerprint({
    listing,
   }: {
    listing:
      SearchRetailProduct;
   }) {
    const shoppingProductId =
      listing.shoppingProductId
        ?.trim();
   
    if (
      shoppingProductId
    ) {
      return [
        "brand",
        "shopping-product",
        normalizeText(
          shoppingProductId
        ),
      ].join(
        "|"
      );
    }
   
    return [
      "brand",
      "title",
      normalizeText(
        listing.productTitle
      ),
      "retailer",
      normalizeText(
        listing.retailer
      ),
    ].join(
      "|"
    );
   }
   
   function shouldRecordResolution(
    resolution:
      BrandResolution | undefined
   ) {
    if (
      !resolution
    ) {
      return false;
    }
   
    if (
      resolution.source ===
        "requested-brand" ||
      resolution.source ===
        "database-canonical" ||
      resolution.source ===
        "database-alias"
    ) {
      return false;
    }
   
    return (
      resolution
        .shouldCreateDiscoveryCandidate ||
      resolution.source ===
        "deterministic-parser" ||
      resolution.source ===
        "unknown"
    );
   }
   
   function toConfidenceScore(
    confidence:
      number | null
   ) {
    if (
      confidence ===
        null ||
      !Number.isFinite(
        confidence
      )
    ) {
      return null;
    }
   
    return Math.round(
      Math.max(
        0,
        Math.min(
          1,
          confidence
        )
      ) *
        100
    );
   }
   
   function buildRawPayload({
    listing,
    resolution,
    searchQuery,
   }: {
    listing:
      SearchRetailProduct;
   
    resolution:
      BrandResolution;
   
    searchQuery?:
      string;
   }) {
    return {
      productTitle:
        listing.productTitle,
   
      retailer:
        listing.retailer,
   
      shoppingProductId:
        listing.shoppingProductId ??
        null,
   
      supplement:
        listing.supplement,
   
      currentDisplayBrand:
        listing.brand,
   
      parserOrResolverBrand:
        resolution
          .canonicalName,
   
      observedAlias:
        resolution
          .observedAlias,
   
      source:
        resolution.source,
   
      status:
        resolution.status,
   
      confidence:
        resolution.confidence,
   
      searchQuery:
        searchQuery ??
        null,
    };
   }
   
   function buildNormalizedPayload({
    listing,
    resolution,
   }: {
    listing:
      SearchRetailProduct;
   
    resolution:
      BrandResolution;
   }) {
    return {
      normalizedProductTitle:
        normalizeText(
          listing.productTitle
        ),
   
      normalizedRetailer:
        normalizeText(
          listing.retailer
        ),
   
      normalizedCurrentDisplayBrand:
        normalizeText(
          listing.brand
        ),
   
      normalizedCandidateBrand:
        normalizeText(
          resolution
            .canonicalName
        ),
   
      normalizedObservedAlias:
        resolution
          .normalizedObservedAlias,
    };
   }
   
   function shouldRefreshCandidateStatus(
    status:
      CandidateReviewStatus
   ) {
    return (
      status ===
        CandidateReviewStatus
          .PENDING ||
      status ===
        CandidateReviewStatus
          .NEEDS_REVIEW
    );
   }
   
   /*
   * Record unresolved or parser-only brands for later
   * enrichment and verification.
   *
   * This function is best-effort. Database failures are
   * logged and must never break customer-facing search.
   */
   export async function recordBrandDiscoveryCandidates({
    listings,
    resolutions,
    listingKeys,
    searchQuery,
    sourceProvider =
      "serpapi-google-shopping",
   }: RecordBrandDiscoveryCandidatesInput) {
    if (
      listings.length ===
        0
    ) {
      return;
    }
   
    const candidates =
      listings.flatMap(
        (
          listing,
          index
        ) => {
          const key =
            listingKeys[index];
   
          const resolution =
            key
              ? resolutions.get(
                  key
                )
              : undefined;
   
          if (
            !shouldRecordResolution(
              resolution
            )
          ) {
            return [];
          }
   
          return [
            {
              listing,
   
              resolution:
                resolution as
                  BrandResolution,
   
              fingerprint:
                buildFingerprint({
                  listing,
                }),
            },
          ];
        }
      );
   
    if (
      candidates.length ===
        0
    ) {
      return;
    }
   
    let discoveryRunId:
      string | null =
      null;
   
    try {
      const discoveryRun =
        await prisma
          .discoveryRun
          .create({
            data: {
              status:
                DiscoveryStatus
                  .RUNNING,
   
              sourceProvider,
   
              searchScope:
                searchQuery
                  ?.trim() ||
                null,
   
              recordsDiscovered:
                candidates.length,
            },
   
            select: {
              id:
                true,
            },
          });
   
      discoveryRunId =
        discoveryRun.id;
   
      let acceptedCount =
        0;
   
      let skippedReviewedCount =
        0;
   
      for (
        const candidate of
        candidates
      ) {
        const existingCandidate =
          await prisma
            .discoveryCandidate
            .findUnique({
              where: {
                fingerprint:
                  candidate
                    .fingerprint,
              },
   
              select: {
                id:
                  true,
   
                status:
                  true,
              },
            });
   
        const rawPayload =
          buildRawPayload({
            listing:
              candidate.listing,
   
            resolution:
              candidate.resolution,
   
            searchQuery,
          });
   
        const normalizedPayload =
          buildNormalizedPayload({
            listing:
              candidate.listing,
   
            resolution:
              candidate.resolution,
          });
   
        const confidenceScore =
          toConfidenceScore(
            candidate
              .resolution
              .confidence
          );
   
        if (
          existingCandidate
        ) {
          const canRefreshStatus =
            shouldRefreshCandidateStatus(
              existingCandidate
                .status
            );
   
          await prisma
            .discoveryCandidate
            .update({
              where: {
                id:
                  existingCandidate.id,
              },
   
              data: {
                occurrenceCount: {
                  increment:
                    1,
                },
   
                lastSeenAt:
                  new Date(),
   
                rawPayload,
   
                normalizedPayload,
   
                confidenceScore,
   
                discoveryRunId:
                  discoveryRun.id,
   
                ...(canRefreshStatus
                  ? {
                      status:
                        CandidateReviewStatus
                          .PENDING,
                    }
                  : {}),
              },
            });
   
          if (
            !canRefreshStatus
          ) {
            skippedReviewedCount +=
              1;
          }
   
          acceptedCount +=
            1;
   
          continue;
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
   
              fingerprint:
                candidate
                  .fingerprint,
   
              occurrenceCount:
                1,
   
              firstSeenAt:
                new Date(),
   
              lastSeenAt:
                new Date(),
   
              rawPayload,
   
              normalizedPayload,
   
              confidenceScore,
   
              status:
                CandidateReviewStatus
                  .PENDING,
            },
          });
   
        acceptedCount +=
          1;
      }
   
      await prisma
        .discoveryRun
        .update({
          where: {
            id:
              discoveryRun.id,
          },
   
          data: {
            status:
              DiscoveryStatus
                .COMPLETED,
   
            recordsAccepted:
              acceptedCount,
   
            completedAt:
              new Date(),
          },
        });
   
      console.log(
        "VidaSearch brand discovery candidates recorded:",
        {
          searchQuery:
            searchQuery ??
            null,
   
          candidateCount:
            candidates.length,
   
          acceptedCount,
   
          preservedReviewedCount:
            skippedReviewedCount,
   
          discoveryRunId:
            discoveryRun.id,
        }
      );
    } catch (
      error
    ) {
      if (
        discoveryRunId
      ) {
        try {
          await prisma
            .discoveryRun
            .update({
              where: {
                id:
                  discoveryRunId,
              },
   
              data: {
                status:
                  DiscoveryStatus
                    .FAILED,
   
                errorMessage:
                  error instanceof
                    Error
                    ? error.message
                    : String(
                        error
                      ),
   
                completedAt:
                  new Date(),
              },
            });
        } catch (
          updateError
        ) {
          console.error(
            "VidaSearch failed to mark brand discovery run as failed:",
            {
              discoveryRunId,
   
              error:
                updateError instanceof
                  Error
                  ? updateError.message
                  : String(
                      updateError
                    ),
            }
          );
        }
      }
   
      console.error(
        "VidaSearch brand discovery recording failed:",
        {
          candidateCount:
            candidates.length,
   
          searchQuery:
            searchQuery ??
            null,
   
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
   