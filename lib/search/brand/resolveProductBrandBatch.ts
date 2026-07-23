import {
    CandidateReviewStatus,
    DataConfidence,
   } from "@/lib/generated/prisma/client";
   
   import {
    resolveBrandsWithOpenAi,
   } from "./resolveBrandsWithOpenAi";
   
   import {
    resolveProductBrand,
   } from "./resolveProductBrand";
   
   import type {
    BrandResolution,
    ResolveProductBrandInput,
   } from "../brandResolutionTypes";
   
   const OPENAI_BATCH_SIZE =
    50;
   
   const OPENAI_ACCEPTANCE_CONFIDENCE =
    0.8;
   
   export type ResolveProductBrandBatchInput =
    ResolveProductBrandInput & {
      key:
        string;
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
   
   function shouldRequestOpenAi({
    resolution,
    allowOpenAi,
   }: {
    resolution:
      BrandResolution;
   
    allowOpenAi:
      boolean;
   }) {
    if (
      !allowOpenAi
    ) {
      return false;
    }
   
    /*
     * Requested brands and database matches already
     * have a sufficiently authoritative source.
     */
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
   
    /*
     * Parser-only and unknown results are sent through
     * the batch extractor because the deterministic
     * parser may include product-line words.
     */
    return (
      resolution.source ===
        "deterministic-parser" ||
      resolution.source ===
        "unknown"
    );
   }
   
   function buildOpenAiResolution({
    previousResolution,
    canonicalBrand,
    observedAlias,
    confidence,
    identifiable,
    existingBrandLikely,
   }: {
    previousResolution:
      BrandResolution;
   
    canonicalBrand:
      string | null;
   
    observedAlias:
      string | null;
   
    confidence:
      number;
   
    identifiable:
      boolean;
   
    existingBrandLikely:
      boolean;
   }): BrandResolution {
    const cleanedCanonicalBrand =
      canonicalBrand
        ? cleanText(
            canonicalBrand
          )
        : "";
   
    const cleanedObservedAlias =
      observedAlias
        ? cleanText(
            observedAlias
          )
        : "";
   
    if (
      !identifiable ||
      !cleanedCanonicalBrand ||
      confidence <
        OPENAI_ACCEPTANCE_CONFIDENCE
    ) {
      return {
        ...previousResolution,
   
        status:
          previousResolution.source ===
            "unknown"
            ? "unknown"
            : "needs-review",
   
        reviewStatus:
          CandidateReviewStatus
            .NEEDS_REVIEW,
   
        shouldPersistAlias:
          false,
   
        shouldCreateDiscoveryCandidate:
          true,
      };
    }
   
    const normalizedCanonicalBrand =
      normalizeBrandText(
        cleanedCanonicalBrand
      );
   
    const normalizedObservedAlias =
      normalizeBrandText(
        cleanedObservedAlias ||
        cleanedCanonicalBrand
      );
   
    const aliasDiffersFromCanonical =
      Boolean(
        normalizedObservedAlias &&
        normalizedCanonicalBrand &&
        normalizedObservedAlias !==
          normalizedCanonicalBrand
      );
   
    return {
      /*
       * OpenAI extraction does not establish a database
       * relationship. The canonical Brand record must
       * still be matched or reviewed separately.
       */
      canonicalBrandId:
        null,
   
      canonicalName:
        cleanedCanonicalBrand,
   
      observedAlias:
        cleanedObservedAlias ||
        cleanedCanonicalBrand,
   
      normalizedObservedAlias:
        normalizedObservedAlias ||
        normalizedCanonicalBrand ||
        null,
   
      source:
        "openai",
   
      status:
        "resolved",
   
      confidence,
   
      dataConfidence:
        DataConfidence.INFERRED,
   
      /*
       * Model extraction is useful evidence but is not
       * independent factual verification.
       */
      reviewStatus:
        CandidateReviewStatus
          .NEEDS_REVIEW,
   
      /*
       * Do not automatically persist aliases here.
       *
       * The extracted canonical brand has not yet been
       * linked to an existing Brand database record.
       */
      shouldPersistAlias:
        false,
   
      /*
       * Unknown OpenAI-extracted brands should enter the
       * review workflow instead of silently becoming
       * canonical database records.
       */
      shouldCreateDiscoveryCandidate:
        true,
   
      /*
       * This value is intentionally not stored directly,
       * but calculating it here documents why even a
       * likely alias still requires a database match.
       */
      ...(existingBrandLikely &&
      aliasDiffersFromCanonical
        ? {}
        : {}),
    };
   }
   
   function splitIntoBatches<T>(
    values:
      T[],
   
    batchSize:
      number
   ) {
    const batches:
      T[][] =
      [];
   
    for (
      let index =
        0;
   
      index <
        values.length;
   
      index +=
        batchSize
    ) {
      batches.push(
        values.slice(
          index,
          index +
            batchSize
        )
      );
    }
   
    return batches;
   }
   
   export async function resolveProductBrandBatch(
    inputs:
      ResolveProductBrandBatchInput[]
   ): Promise<
    Map<
      string,
      BrandResolution
   >
   >{
    const resolutions =
      new Map<
        string,
        BrandResolution
   >();
   
    if (
      inputs.length ===
        0
    ) {
      return resolutions;
    }
   
    /*
     * Resolve the requested-brand and database-first
     * paths before deciding which listings need OpenAI.
     *
     * The underlying Brand catalog is shared through
     * the short-lived in-memory cache.
     */
    const initialResults =
      await Promise.all(
        inputs.map(
          async (
            input
          ) => {
            const resolution =
              await resolveProductBrand({
                productTitle:
                  input.productTitle,
   
                requestedBrand:
                  input.requestedBrand,
   
                retailer:
                  input.retailer,
   
                shoppingProductId:
                  input.shoppingProductId,
   
                /*
                 * OpenAI is orchestrated here in batches,
                 * not inside the individual resolver.
                 */
                allowOpenAi:
                  false,
              });
   
            return {
              input,
              resolution,
            };
          }
        )
      );
   
    const openAiCandidates:
      Array<{
        key:
          string;
   
        productTitle:
          string;
   
        retailer?:
          string;
      }> = [];
   
    for (
      const {
        input,
        resolution,
      } of initialResults
    ) {
      resolutions.set(
        input.key,
        resolution
      );
   
      if (
        shouldRequestOpenAi({
          resolution,
   
          allowOpenAi:
            input.allowOpenAi ===
              true,
        })
      ) {
        openAiCandidates.push({
          key:
            input.key,
   
          productTitle:
            input.productTitle,
   
          retailer:
            input.retailer,
        });
      }
    }
   
    if (
      openAiCandidates.length ===
        0
    ) {
      return resolutions;
    }
   
    /*
     * The OpenAI helper accepts up to 50 unique titles.
     * Chunking here ensures larger searches are fully
     * covered without silently truncating candidates.
     */
    const batches =
      splitIntoBatches(
        openAiCandidates,
        OPENAI_BATCH_SIZE
      );
   
    for (
      const batch of
      batches
    ) {
      const openAiResults =
        await resolveBrandsWithOpenAi(
          batch
        );
   
      for (
        const candidate of
        batch
      ) {
        const openAiResolution =
          openAiResults.get(
            candidate.key
          );
   
        if (
          !openAiResolution
        ) {
          continue;
        }
   
        const previousResolution =
          resolutions.get(
            candidate.key
          );
   
        if (
          !previousResolution
        ) {
          continue;
        }
   
        resolutions.set(
          candidate.key,
          buildOpenAiResolution({
            previousResolution,
   
            canonicalBrand:
              openAiResolution
                .canonicalBrand,
   
            observedAlias:
              openAiResolution
                .observedAlias,
   
            confidence:
              openAiResolution
                .confidence,
   
            identifiable:
              openAiResolution
                .identifiable,
   
            existingBrandLikely:
              openAiResolution
                .existingBrandLikely,
          })
        );
      }
    }
   
    console.log(
      "VidaSearch product brand batch resolved:",
      {
        inputCount:
          inputs.length,
   
        openAiCandidateCount:
          openAiCandidates.length,
   
        resolutionCount:
          resolutions.size,
   
        sourceCounts:
          Array.from(
            resolutions.values()
          ).reduce(
            (
              counts:
                Record<
                  string,
                  number>
   ,
   
              resolution
            ) => {
              counts[
                resolution.source
              ] =
                (
                  counts[
                    resolution.source
                  ] ??
                  0
                ) +
                1;
   
              return counts;
            },
            {}
          ),
   
        needsReviewCount:
          Array.from(
            resolutions.values()
          ).filter(
            (
              resolution
            ) =>
              resolution
                .shouldCreateDiscoveryCandidate
          ).length,
      }
    );
   
    return resolutions;
   }
   