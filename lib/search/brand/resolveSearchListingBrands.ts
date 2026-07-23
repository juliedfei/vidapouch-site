import type {
    ProductSearchRequest,
   } from "@/app/api/pricing/providers/providerTypes";
   
   import type {
    SearchRetailProduct,
   } from "@/lib/search/searchRetailProduct";
   
   import {
    resolveProductBrandBatch,
   } from "./resolveProductBrandBatch";
   
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
    const productIdentity =
      listing.shoppingProductId
        ? `shopping-${cleanKeyPart(
            listing.shoppingProductId
          )}`
        : [
            "title",
            cleanKeyPart(
              listing.productTitle
            ),
          ].join(
            "-"
          );
   
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
   
   function getDisplayBrand({
    existingBrand,
    canonicalName,
   }: {
    existingBrand:
      string;
   
    canonicalName:
      string;
   }) {
    const cleanedCanonicalName =
      canonicalName.trim();
   
    /*
     * Prefer a database-backed canonical brand when
     * available.
     *
     * Otherwise, continue displaying the deterministic
     * parser's best guess. This is more useful than
     * displaying Unknown Brand throughout the results.
     */
    if (
      cleanedCanonicalName &&
      cleanedCanonicalName !==
        "Unknown Brand"
    ) {
      return cleanedCanonicalName;
    }
   
    if (
      existingBrand &&
      existingBrand !==
        "Unknown Brand"
    ) {
      return existingBrand;
    }
   
    return "Unknown Brand";
   }
   
   /*
   * Resolve brands using only the fast customer-facing
   * paths:
   *
   * 1. Explicitly requested brand
   * 2. Brand/BrandAlias database match
   * 3. Deterministic parser fallback
   *
   * This function deliberately performs no discovery
   * recording and no OpenAI work.
   *
   * Discovery recording and background enrichment must
   * be scheduled once at the combined customer-search
   * level after all marketplace expansion searches have
   * completed.
   */
   export async function
   resolveSearchListingBrands({
    listings,
    request,
   }: {
    listings:
      SearchRetailProduct[];
   
    request:
      ProductSearchRequest;
   }): Promise<
    SearchRetailProduct[]
  > {
    if (
      listings.length ===
        0
    ) {
      return [];
    }
   
    const keyedListings =
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
   
    try {
      const resolutions =
        await resolveProductBrandBatch(
          keyedListings.map(
            ({
              key,
              listing,
            }) => ({
              key,
   
              productTitle:
                listing
                  .productTitle,
   
              requestedBrand:
                request.brand,
   
              retailer:
                listing.retailer,
   
              shoppingProductId:
                listing
                  .shoppingProductId,
   
              /*
               * Never call OpenAI while the customer
               * waits for search results.
               */
              allowOpenAi:
                false,
            })
          )
        );
   
      const resolvedListings =
        keyedListings.map(
          ({
            key,
            listing,
          }): SearchRetailProduct => {
            const resolution =
              resolutions.get(
                key
              );
   
            if (
              !resolution
            ) {
              return listing;
            }
   
            const displayBrand =
              getDisplayBrand({
                existingBrand:
                  listing.brand,
   
                canonicalName:
                  resolution
                    .canonicalName,
              });
   
            console.log(
              "VidaSearch fast brand resolution completed:",
              {
                productTitle:
                  listing
                    .productTitle,
   
                retailer:
                  listing.retailer,
   
                displayBrand,
   
                resolutionSource:
                  resolution.source,
   
                canonicalBrandId:
                  resolution
                    .canonicalBrandId,
   
                parserCandidate:
                  resolution.source ===
                    "deterministic-parser"
                    ? resolution
                        .canonicalName
                    : null,
   
                needsReview:
                  resolution
                    .shouldCreateDiscoveryCandidate,
              }
            );
   
            return {
              ...listing,
   
              brand:
                displayBrand,
            };
          }
        );
   
      console.log(
        "VidaSearch fast listing-brand resolution completed:",
        {
          listingCount:
            listings.length,
   
          resolutionCount:
            resolutions.size,
   
          databaseResolvedCount:
            Array.from(
              resolutions.values()
            ).filter(
              (
                resolution
              ) =>
                resolution.source ===
                  "database-canonical" ||
                resolution.source ===
                  "database-alias"
            ).length,
   
          parserResolvedCount:
            Array.from(
              resolutions.values()
            ).filter(
              (
                resolution
              ) =>
                resolution.source ===
                  "deterministic-parser"
            ).length,
   
          unknownBrandCount:
            resolvedListings.filter(
              (
                listing
              ) =>
                listing.brand ===
                  "Unknown Brand"
            ).length,
   
          discoveryRecordingScheduled:
            false,
   
          openAiEnabled:
            false,
        }
      );
   
      return resolvedListings;
    } catch (
      error
    ) {
      console.error(
        "VidaSearch fast listing-brand resolution failed:",
        {
          listingCount:
            listings.length,
   
          error:
            error instanceof
              Error
              ? error.message
              : String(
                  error
                ),
        }
      );
   
      /*
       * Brand resolution must never stop valid shopping
       * results from being returned.
       */
      return listings;
    }
   }