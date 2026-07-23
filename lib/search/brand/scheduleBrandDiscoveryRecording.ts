import {
    after,
   } from "next/server";
   
   import type {
    ProductSearchRequest,
   } from "@/app/api/pricing/providers/providerTypes";
   
   import type {
    SearchRetailProduct,
   } from "@/lib/search/searchRetailProduct";
   
   import {
    recordBrandDiscoveryCandidates,
   } from "./recordBrandDiscoveryCandidates";
   
   import {
    resolveProductBrandBatch,
   } from "./resolveProductBrandBatch";
   
   const MAX_DISCOVERY_LISTINGS =
    100;
   
   type ScheduleBrandDiscoveryRecordingInput = {
    listings:
      SearchRetailProduct[];
   
    request:
      ProductSearchRequest;
   
    searchQuery?:
      string;
   
    sourceProvider?:
      string;
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
   
   function normalizeText(
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
   
   /*
   * Consolidate duplicate listings before discovery
   * recording.
   *
   * Prefer Google Shopping product ID when available.
   * Otherwise, use the normalized title and retailer.
   */
   function deduplicateListings(
    listings:
      SearchRetailProduct[]
   ) {
    const uniqueListings =
      new Map<
        string,
        SearchRetailProduct
   >();
   
    for (
      const listing of
      listings
    ) {
      const productIdentity =
        listing.shoppingProductId
          ?.trim()
          ? [
              "shopping-product",
              normalizeText(
                listing.shoppingProductId
              ),
            ].join(
              "|"
            )
          : [
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
   
      if (
        uniqueListings.has(
          productIdentity
        )
      ) {
        continue;
      }
   
      uniqueListings.set(
        productIdentity,
        listing
      );
   
      if (
        uniqueListings.size >=
          MAX_DISCOVERY_LISTINGS
      ) {
        break;
      }
    }
   
    return Array.from(
      uniqueListings.values()
    );
   }
   
   function buildSearchQuery({
    request,
    explicitSearchQuery,
   }: {
    request:
      ProductSearchRequest;
   
    explicitSearchQuery:
      string | undefined;
   }) {
    const cleanedExplicitQuery =
      explicitSearchQuery
        ?.trim();
   
    if (
      cleanedExplicitQuery
    ) {
      return cleanedExplicitQuery;
    }
   
    return [
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
   }
   
   /*
   * Schedule one consolidated unresolved-brand
   * discovery recording job for an entire customer
   * search.
   *
   * This function:
   *
   * 1. Receives listings from all marketplace expansion
   *    searches.
   * 2. Deduplicates the combined collection.
   * 3. Runs only database and deterministic brand
   *    resolution.
   * 4. Records parser-only and unresolved candidates in
   *    one discovery batch.
   *
   * OpenAI is deliberately disabled here. Brand AI is
   * handled separately by scheduleUnknownBrandEnrichment.
   */
   export function
   scheduleBrandDiscoveryRecording({
    listings,
    request,
    searchQuery,
    sourceProvider,
   }: ScheduleBrandDiscoveryRecordingInput) {
    if (
      listings.length ===
        0
    ) {
      return;
    }
   
    const listingSnapshot =
      deduplicateListings(
        listings
      ).map(
        (
          listing
        ) => ({
          ...listing,
        })
      );
   
    if (
      listingSnapshot.length ===
        0
    ) {
      return;
    }
   
    const requestSnapshot = {
      ...request,
    };
   
    const resolvedSearchQuery =
      buildSearchQuery({
        request:
          requestSnapshot,
   
        explicitSearchQuery:
          searchQuery,
      });
   
    const resolvedSourceProvider =
      sourceProvider
        ?.trim() ||
      "serpapi-google-shopping-combined";
   
    after(
      async () => {
        try {
          const keyedListings:
            KeyedListing[] =
            listingSnapshot.map(
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
   
          const resolutions =
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
                    requestSnapshot
                      .brand,
   
                  retailer:
                    listing.retailer,
   
                  shoppingProductId:
                    listing
                      .shoppingProductId,
   
                  /*
                   * Discovery recording must never make
                   * an OpenAI request.
                   */
                  allowOpenAi:
                    false,
                })
              )
            );
   
          await recordBrandDiscoveryCandidates({
            listings:
              keyedListings.map(
                ({
                  listing,
                }) =>
                  listing
              ),
   
            resolutions,
   
            listingKeys:
              keyedListings.map(
                ({
                  key,
                }) =>
                  key
              ),
   
            searchQuery:
              resolvedSearchQuery,
   
            sourceProvider:
              resolvedSourceProvider,
          });
   
          console.log(
            "VidaSearch combined brand discovery recording completed:",
            {
              receivedListingCount:
                listings.length,
   
              deduplicatedListingCount:
                keyedListings.length,
   
              resolutionCount:
                resolutions.size,
   
              searchQuery:
                resolvedSearchQuery ||
                null,
   
              sourceProvider:
                resolvedSourceProvider,
            }
          );
        } catch (
          error
        ) {
          console.error(
            "VidaSearch scheduled combined brand discovery recording failed:",
            {
              listingCount:
                listingSnapshot
                  .length,
   
              searchQuery:
                resolvedSearchQuery ||
                null,
   
              sourceProvider:
                resolvedSourceProvider,
   
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
   