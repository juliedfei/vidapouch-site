import {
    CandidateReviewStatus,
    DataConfidence,
   } from "@/lib/generated/prisma/client";
   
   import {
    normalizeSearchIntentText,
   } from "@/lib/search/resolveSearchIntent";
   
   import {
    findCachedBrand,
   } from "./findCachedBrand";
   
   import {
    parseBrandFromTitle,
   } from "./parseBrandFromTitle";
   
   import type {
    BrandResolution,
    DatabaseBrandMatch,
    ResolveProductBrandInput,
   } from "../brandResolutionTypes";
   
   const GENERIC_RETAILER_NAMES =
    new Set([
      "amazon",
      "amazon com",
      "ebay",
      "google",
      "google shopping",
      "iherb",
      "macys",
      "pure formulas",
      "pureformulas",
      "pureformulas com",
      "rei",
      "target",
      "the vitamin shoppe",
      "vitacost",
      "vitacost com",
      "walgreens",
      "walmart",
      "walmart com",
      "whole foods",
    ]);
   
   const RETAILER_SUFFIX_WORDS =
    new Set([
      "com",
      "inc",
      "llc",
      "ltd",
      "official",
      "official store",
      "shop",
      "store",
    ]);
   
   function cleanText(
    value:
      string
   ) {
    return value
      .replace(
        /[®™©]/g,
        ""
      )
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
    return normalizeSearchIntentText(
      cleanText(
        value
      )
    );
   }
   
   function buildUnknownResolution():
    BrandResolution {
    return {
      canonicalBrandId:
        null,
   
      canonicalName:
        "Unknown Brand",
   
      observedAlias:
        null,
   
      normalizedObservedAlias:
        null,
   
      source:
        "unknown",
   
      status:
        "unknown",
   
      confidence:
        null,
   
      dataConfidence:
        DataConfidence.UNKNOWN,
   
      reviewStatus:
        null,
   
      shouldPersistAlias:
        false,
   
      shouldCreateDiscoveryCandidate:
        false,
    };
   }
   
   function buildRequestedBrandResolution(
    requestedBrand:
      string
   ): BrandResolution {
    const cleanedBrand =
      cleanText(
        requestedBrand
      );
   
    return {
      canonicalBrandId:
        null,
   
      canonicalName:
        cleanedBrand,
   
      observedAlias:
        cleanedBrand,
   
      normalizedObservedAlias:
        normalizeBrandText(
          cleanedBrand
        ),
   
      source:
        "requested-brand",
   
      status:
        "resolved",
   
      confidence:
        1,
   
      dataConfidence:
        DataConfidence.REPORTED,
   
      reviewStatus:
        null,
   
      shouldPersistAlias:
        false,
   
      shouldCreateDiscoveryCandidate:
        false,
    };
   }
   
   function getDatabaseMatchConfidence(
    confidence:
      DataConfidence
   ) {
    switch (
      confidence
    ) {
      case DataConfidence.VERIFIED:
        return 1;
   
      case DataConfidence.REPORTED:
        return 0.9;
   
      case DataConfidence.INFERRED:
        return 0.8;
   
      case DataConfidence.UNKNOWN:
      default:
        return 0.7;
    }
   }
   
   function buildDatabaseResolution({
    databaseMatch,
    source,
    confidenceAdjustment,
   }: {
    databaseMatch:
      DatabaseBrandMatch;
   
    source:
      "database-canonical" |
      "database-alias";
   
    confidenceAdjustment?:
      number;
   }): BrandResolution {
    const baseConfidence =
      getDatabaseMatchConfidence(
        databaseMatch.confidence
      );
   
    const confidence =
      Math.max(
        0,
        Math.min(
          1,
          baseConfidence -
            (
              confidenceAdjustment ??
              0
            )
        )
      );
   
    return {
      canonicalBrandId:
        databaseMatch.brandId,
   
      canonicalName:
        databaseMatch.canonicalName,
   
      observedAlias:
        databaseMatch.matchedValue,
   
      normalizedObservedAlias:
        databaseMatch
          .normalizedMatchedValue,
   
      source,
   
      status:
        "resolved",
   
      confidence,
   
      dataConfidence:
        databaseMatch.confidence,
   
      reviewStatus:
        null,
   
      shouldPersistAlias:
        false,
   
      shouldCreateDiscoveryCandidate:
        false,
    };
   }
   
   function titleContainsWholePhrase({
    normalizedTitle,
    normalizedPhrase,
   }: {
    normalizedTitle:
      string;
   
    normalizedPhrase:
      string;
   }) {
    if (
      !normalizedTitle ||
      !normalizedPhrase
    ) {
      return false;
    }
   
    return (
      normalizedTitle ===
        normalizedPhrase ||
      normalizedTitle.startsWith(
        `${normalizedPhrase} `
      ) ||
      normalizedTitle.endsWith(
        ` ${normalizedPhrase}`
      ) ||
      normalizedTitle.includes(
        ` ${normalizedPhrase} `
      )
    );
   }
   
   function removeRetailerMarketplacePrefix(
    value:
      string
   ) {
    return value
      .replace(
        /^(?:walmart|amazon|target|ebay)\s*[-–—:|]\s*/i,
        ""
      )
      .trim();
   }
   
   function removeRetailerDomainSuffix(
    value:
      string
   ) {
    return value
      .replace(
        /\.(?:com|co|net|org)$/i,
        ""
      )
      .trim();
   }
   
   function removeGenericRetailerSuffixes(
    value:
      string
   ) {
    const words =
      value
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );
   
    while (
      words.length >
        1
    ) {
      const finalWord =
        normalizeBrandText(
          words[
            words.length -
              1
          ]
        );
   
      if (
        !RETAILER_SUFFIX_WORDS.has(
          finalWord
        )
      ) {
        break;
      }
   
      words.pop();
    }
   
    return words.join(
      " "
    );
   }
   
   function buildRetailerCandidates(
    retailer:
      string | null |
      undefined
   ) {
    if (
      !retailer?.trim()
    ) {
      return [];
    }
   
    const cleanedRetailer =
      cleanText(
        retailer
      );
   
    const withoutMarketplacePrefix =
      removeRetailerMarketplacePrefix(
        cleanedRetailer
      );
   
    const candidates =
      [
        cleanedRetailer,
   
        withoutMarketplacePrefix,
   
        removeRetailerDomainSuffix(
          withoutMarketplacePrefix
        ),
   
        removeGenericRetailerSuffixes(
          removeRetailerDomainSuffix(
            withoutMarketplacePrefix
          )
        ),
      ]
        .map(
          (
            candidate
          ) =>
            cleanText(
              candidate
            )
        )
        .filter(
          Boolean
        );
   
    return Array.from(
      new Set(
        candidates
      )
    );
   }
   
   function isGenericRetailer(
    value:
      string
   ) {
    const normalized =
      normalizeBrandText(
        value
      );
   
    if (
      !normalized
    ) {
      return true;
    }
   
    return (
      GENERIC_RETAILER_NAMES.has(
        normalized
      ) ||
      normalized.startsWith(
        "walmart "
      ) ||
      normalized.startsWith(
        "amazon "
      ) ||
      normalized.startsWith(
        "target "
      )
    );
   }
   
   /*
   * Retailer evidence is only accepted when:
   *
   * 1. The retailer itself resolves to a known database
   *    brand.
   * 2. The canonical brand or observed alias also
   *    appears as a complete phrase in the product title.
   *
   * This prevents marketplaces such as Walmart, Target,
   * iHerb, and PureFormulas from becoming product brands.
   */
   async function findBrandFromRetailer({
    productTitle,
    retailer,
   }: {
    productTitle:
      string;
   
    retailer:
      string | null |
      undefined;
   }) {
    const normalizedTitle =
      normalizeBrandText(
        productTitle
      );
   
    if (
      !normalizedTitle
    ) {
      return null;
    }
   
    const retailerCandidates =
      buildRetailerCandidates(
        retailer
      );
   
    for (
      const retailerCandidate of
      retailerCandidates
    ) {
      if (
        isGenericRetailer(
          retailerCandidate
        )
      ) {
        continue;
      }
   
      const retailerMatch =
        await findCachedBrand(
          retailerCandidate
        );
   
      if (
        !retailerMatch
      ) {
        continue;
      }
   
      const normalizedCanonicalName =
        normalizeBrandText(
          retailerMatch.canonicalName
        );
   
      const normalizedMatchedValue =
        normalizeBrandText(
          retailerMatch.matchedValue
        );
   
      const canonicalAppearsInTitle =
        titleContainsWholePhrase({
          normalizedTitle,
   
          normalizedPhrase:
            normalizedCanonicalName,
        });
   
      const aliasAppearsInTitle =
        titleContainsWholePhrase({
          normalizedTitle,
   
          normalizedPhrase:
            normalizedMatchedValue,
        });
   
      if (
        !canonicalAppearsInTitle &&
        !aliasAppearsInTitle
      ) {
        continue;
      }
   
      return retailerMatch;
    }
   
    return null;
   }
   
   function parserCandidateEndsWithFragment(
    candidate:
      string
   ) {
    const normalizedWords =
      normalizeBrandText(
        candidate
      )
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );
   
    const finalWord =
      normalizedWords[
        normalizedWords.length -
          1
      ];
   
    if (
      !finalWord
    ) {
      return true;
    }
   
    /*
     * Reject obvious fragments left behind when a
     * hyphenated product phrase is split:
     *
     * De-Stress → De
     * L-Theanine → L
     * 5-HTP → 5
     * SAM-e → SAM
     */
    return (
      finalWord ===
        "de" ||
      finalWord ===
        "l" ||
      finalWord ===
        "sam" ||
      finalWord ===
        "5" ||
      /^\d+$/.test(
        finalWord
      )
    );
   }
   
   export async function resolveProductBrand({
    productTitle,
    requestedBrand,
    retailer,
   }: ResolveProductBrandInput): Promise<
    BrandResolution
   >{
    const cleanedTitle =
      cleanText(
        productTitle
      );
   
    if (
      requestedBrand
        ?.trim()
    ) {
      return buildRequestedBrandResolution(
        requestedBrand
      );
    }
   
    if (
      !cleanedTitle
    ) {
      return buildUnknownResolution();
    }
   
    /*
     * Database records matching the title are the
     * primary source of truth.
     *
     * findCachedBrand performs longest-prefix matching
     * across canonical names and aliases.
     */
    const databaseMatch =
      await findCachedBrand(
        cleanedTitle
      );
   
    if (
      databaseMatch
    ) {
      return buildDatabaseResolution({
        databaseMatch,
   
        source:
          databaseMatch
            .matchType ===
            "alias"
            ? "database-alias"
            : "database-canonical",
      });
    }
   
    /*
     * The seller or retailer sometimes represents the
     * actual manufacturer:
     *
     * • Lemme
     * • Momentous.com
     * • Nootropics Depot
     * • Best Naturals
     *
     * Only accept this evidence when it maps to an
     * existing Brand record and that brand also appears
     * in the product title.
     */
    const retailerMatch =
      await findBrandFromRetailer({
        productTitle:
          cleanedTitle,
   
        retailer,
      });
   
    if (
      retailerMatch
    ) {
      return buildDatabaseResolution({
        databaseMatch:
          retailerMatch,
   
        source:
          retailerMatch
            .matchType ===
            "alias"
            ? "database-alias"
            : "database-canonical",
   
        /*
         * Retailer evidence is strong but slightly less
         * direct than a title-prefix database match.
         */
        confidenceAdjustment:
          0.05,
      });
    }
   
    /*
     * The deterministic parser is only a fallback.
     *
     * Parsed values are not automatically written into
     * Brand or BrandAlias because they have not yet been
     * independently verified.
     */
    const parsed =
      parseBrandFromTitle(
        cleanedTitle
      );
   
    if (
      !parsed.candidate ||
      !parsed.normalizedCandidate ||
      parserCandidateEndsWithFragment(
        parsed.candidate
      )
    ) {
      return {
        ...buildUnknownResolution(),
   
        shouldCreateDiscoveryCandidate:
          true,
   
        reviewStatus:
          CandidateReviewStatus
            .NEEDS_REVIEW,
      };
    }
   
    return {
      canonicalBrandId:
        null,
   
      canonicalName:
        parsed.candidate,
   
      observedAlias:
        parsed.candidate,
   
      normalizedObservedAlias:
        parsed
          .normalizedCandidate,
   
      source:
        "deterministic-parser",
   
      status:
        parsed.confidence >=
          0.75
          ? "resolved"
          : "needs-review",
   
      confidence:
        parsed.confidence,
   
      dataConfidence:
        DataConfidence.INFERRED,
   
      reviewStatus:
        parsed.confidence >=
          0.75
          ? null
          : CandidateReviewStatus
              .NEEDS_REVIEW,
   
      /*
       * Do not persist parser-only aliases directly.
       * OpenAI or a manual review must verify them.
       */
      shouldPersistAlias:
        false,
   
      shouldCreateDiscoveryCandidate:
        true,
    };
   }
   