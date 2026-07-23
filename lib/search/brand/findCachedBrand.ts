import {
    DataConfidence,
   } from "@/lib/generated/prisma/client";
   
   import {
    normalizeSearchIntentText,
   } from "@/lib/search/resolveSearchIntent";
   
   import {
    loadBrandCatalog,
   } from "./loadBrandCatalog";
   
   import type {
    CachedBrandRecord,
   } from "./loadBrandCatalog";
   
   import type {
    DatabaseBrandMatch,
   } from "../brandResolutionTypes";
   
   function normalizeBrandText(
    value:
      string
   ) {
    return normalizeSearchIntentText(
      value
    );
   }
   
   function titleStartsWithCandidate({
    normalizedTitle,
    normalizedCandidate,
   }: {
    normalizedTitle:
      string;
   
    normalizedCandidate:
      string;
   }) {
    return (
      normalizedTitle ===
        normalizedCandidate ||
      normalizedTitle.startsWith(
        `${normalizedCandidate} `
      )
    );
   }
   
   function mapCanonicalBrandMatch(
    brand:
      CachedBrandRecord
   ): DatabaseBrandMatch {
    return {
      brandId:
        brand.id,
   
      canonicalName:
        brand.canonicalName,
   
      matchedValue:
        brand.canonicalName,
   
      normalizedMatchedValue:
        brand
          .normalizedCanonicalName,
   
      matchType:
        "canonical",
   
      confidence:
        brand.profileConfidence,
    };
   }
   
   function mapAliasBrandMatch({
    brand,
    alias,
   }: {
    brand:
      CachedBrandRecord;
   
    alias:
      CachedBrandRecord[
        "aliases"
      ][number];
   }): DatabaseBrandMatch {
    return {
      brandId:
        brand.id,
   
      canonicalName:
        brand.canonicalName,
   
      matchedValue:
        alias.alias,
   
      normalizedMatchedValue:
        alias.normalizedAlias,
   
      matchType:
        "alias",
   
      confidence:
        alias.confidence,
    };
   }
   
   function getConfidenceRank(
    confidence:
      DataConfidence
   ) {
    switch (
      confidence
    ) {
      case DataConfidence
        .VERIFIED:
        return 4;
   
      case DataConfidence
        .REPORTED:
        return 3;
   
      case DataConfidence
        .INFERRED:
        return 2;
   
      case DataConfidence
        .UNKNOWN:
      default:
        return 1;
    }
   }
   
   export async function findCachedBrand(
    productTitle:
      string
   ): Promise<
    DatabaseBrandMatch | null
   >{
    const normalizedTitle =
      normalizeBrandText(
        productTitle
      );
   
    if (
      !normalizedTitle
    ) {
      return null;
    }
   
    const catalog =
      await loadBrandCatalog();
   
    const matches:
      Array<{
        length:
          number;
   
        confidenceRank:
          number;
   
        matchTypeRank:
          number;
   
        result:
          DatabaseBrandMatch;
      }> = [];
   
    for (
      const brand of
      catalog
    ) {
      if (
        brand
          .normalizedCanonicalName &&
        titleStartsWithCandidate({
          normalizedTitle,
   
          normalizedCandidate:
            brand
              .normalizedCanonicalName,
        })
      ) {
        matches.push({
          length:
            brand
              .normalizedCanonicalName
              .length,
   
          confidenceRank:
            getConfidenceRank(
              brand
                .profileConfidence
            ),
   
          matchTypeRank:
            1,
   
          result:
            mapCanonicalBrandMatch(
              brand
            ),
        });
      }
   
      for (
        const alias of
        brand.aliases
      ) {
        const normalizedAlias =
          normalizeBrandText(
            alias.normalizedAlias
          );
   
        if (
          !normalizedAlias
        ) {
          continue;
        }
   
        if (
          !titleStartsWithCandidate({
            normalizedTitle,
   
            normalizedCandidate:
              normalizedAlias,
          })
        ) {
          continue;
        }
   
        matches.push({
          length:
            normalizedAlias.length,
   
          confidenceRank:
            getConfidenceRank(
              alias.confidence
            ),
   
          /*
           * Prefer an explicit alias over a canonical
           * name when both match the same number of
           * characters. An alias often represents the
           * exact title prefix observed in commerce.
           */
          matchTypeRank:
            2,
   
          result:
            mapAliasBrandMatch({
              brand,
   
              alias: {
                ...alias,
   
                normalizedAlias,
              },
            }),
        });
      }
    }
   
    if (
      matches.length ===
        0
    ) {
      return null;
    }
   
    matches.sort(
      (
        left,
        right
      ) =>
        right.length -
          left.length ||
        right.confidenceRank -
          left.confidenceRank ||
        right.matchTypeRank -
          left.matchTypeRank ||
        left.result
          .canonicalName
          .localeCompare(
            right.result
              .canonicalName
          )
    );
   
    return matches[0]
      .result;
   }