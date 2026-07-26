import {
    prisma,
   } from "@/lib/db";
   
   import type {
    ProductResearch,
   } from "./productResearchTypes";
   
   export type ProductResearchBatchRequest = {
    key:
      string;
   
    productName:
      string;
   
    shoppingProductId?:
      string | null;
   };
   
   function normalizeKey(
    productName:
      string
   ) {
    return productName
      .trim()
      .toLowerCase()
      .replace(
        /['’"]/g,
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
   
   function cleanShoppingProductId(
    value:
      string | null |
      undefined
   ) {
    return (
      value
        ?.trim() ||
      null
    );
   }
   
   /*
   * Loads cached product research for multiple
   * products using one batched database request.
   *
   * Resolution order remains identical to the
   * single-product helper:
   *
   * 1. Google Shopping product ID
   * 2. Normalized product name
   *
   * This function performs no OpenAI calls and
   * creates no new research records.
   */
   export async function
   getCachedProductResearchBatch(
    requests:
      ProductResearchBatchRequest[]
   ): Promise<
    Map<
      string,
      ProductResearch | null
   >
   >{
    const results =
      new Map<
        string,
        ProductResearch | null
   >();
   
    if (
      requests.length ===
        0
    ) {
      return results;
    }
   
    /*
     * Initialize every requested key so callers always
     * receive a predictable result, including when no
     * cached research exists.
     */
    for (
      const request of
      requests
    ) {
      results.set(
        request.key,
        null
      );
    }
   
    const preparedRequests =
      requests.map(
        (
          request
        ) => ({
          ...request,
   
          normalizedProductName:
            normalizeKey(
              request.productName
            ),
   
          normalizedShoppingProductId:
            cleanShoppingProductId(
              request.shoppingProductId
            ),
        })
      );
   
    const shoppingProductIds =
      Array.from(
        new Set(
          preparedRequests
            .map(
              (
                request
              ) =>
                request
                  .normalizedShoppingProductId
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(
                  value
                )
            )
        )
      );
   
    const normalizedProductNames =
      Array.from(
        new Set(
          preparedRequests
            .map(
              (
                request
              ) =>
                request
                  .normalizedProductName
            )
            .filter(
              Boolean
            )
        )
      );
   
    if (
      shoppingProductIds.length ===
        0 &&
      normalizedProductNames.length ===
        0
    ) {
      return results;
    }
   
    const cachedRecords =
      await prisma
        .productResearchCache
        .findMany({
          where: {
            OR: [
              ...(shoppingProductIds.length >
              0
                ? [
                    {
                      shoppingProductId: {
                        in:
                          shoppingProductIds,
                      },
                    },
                  ]
                : []),
   
              ...(normalizedProductNames.length >
              0
                ? [
                    {
                      normalizedKey: {
                        in:
                          normalizedProductNames,
                      },
                    },
                  ]
                : []),
            ],
          },
   
          select: {
            shoppingProductId:
              true,
   
            normalizedKey:
              true,
   
            research:
              true,
          },
        });
   
    const researchByShoppingProductId =
      new Map<
        string,
        ProductResearch
   >();
   
    const researchByNormalizedName =
      new Map<
        string,
        ProductResearch
   >();
   
    for (
      const cachedRecord of
      cachedRecords
    ) {
      if (
        !cachedRecord.research
      ) {
        continue;
      }
   
      const research =
        cachedRecord.research as
          ProductResearch;
   
      const shoppingProductId =
        cleanShoppingProductId(
          cachedRecord
            .shoppingProductId
        );
   
      if (
        shoppingProductId
      ) {
        researchByShoppingProductId.set(
          shoppingProductId,
          research
        );
      }
   
      const normalizedName =
        cachedRecord
          .normalizedKey
          ?.trim();
   
      if (
        normalizedName
      ) {
        researchByNormalizedName.set(
          normalizedName,
          research
        );
      }
    }
   
    for (
      const request of
      preparedRequests
    ) {
      /*
       * Preserve the existing behavior by preferring
       * the stable Google Shopping product ID.
       */
      const researchByShoppingId =
        request
          .normalizedShoppingProductId
          ? researchByShoppingProductId.get(
              request
                .normalizedShoppingProductId
            )
          : undefined;
   
      if (
        researchByShoppingId
      ) {
        results.set(
          request.key,
          researchByShoppingId
        );
   
        continue;
      }
   
      /*
       * Fall back to existing title-based cache records.
       */
      const researchByName =
        request
          .normalizedProductName
          ? researchByNormalizedName.get(
              request
                .normalizedProductName
            )
          : undefined;
   
      results.set(
        request.key,
        researchByName ??
          null
      );
    }
   
    console.log(
      "VidaSearch cached product research batch loaded:",
      {
        requestedProductCount:
          requests.length,
   
        databaseRecordCount:
          cachedRecords.length,
   
        researchMatchCount:
          Array.from(
            results.values()
          ).filter(
            (
              research
            ) =>
              research !==
              null
          ).length,
      }
    );
   
    return results;
   }
   