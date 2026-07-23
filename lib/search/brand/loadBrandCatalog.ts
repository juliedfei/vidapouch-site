import {
    prisma,
   } from "@/lib/db";
   
   import type {
    DataConfidence,
   } from "@/lib/generated/prisma/client";
   
   export type CachedBrandAlias = {
    alias:
      string;
   
    normalizedAlias:
      string;
   
    confidence:
      DataConfidence;
   };
   
   export type CachedBrandRecord = {
    id:
      string;
   
    canonicalName:
      string;
   
    normalizedCanonicalName:
      string;
   
    profileConfidence:
      DataConfidence;
   
    aliases:
      CachedBrandAlias[];
   };
   
   const BRAND_CATALOG_CACHE_TTL_MS =
    5 * 60 * 1000;
   
   let cachedCatalog:
    CachedBrandRecord[] | null =
    null;
   
   let cachedAt =
    0;
   
   let inFlightCatalogPromise:
    Promise<CachedBrandRecord[]> | null =
    null;
   
   function normalizeBrandText(
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
   
   function isCacheFresh() {
    return (
      cachedCatalog !==
        null &&
      Date.now() -
        cachedAt <
        BRAND_CATALOG_CACHE_TTL_MS
    );
   }
   
   async function fetchBrandCatalog() {
    const brands =
      await prisma.brand.findMany({
        select: {
          id:
            true,
   
          canonicalName:
            true,
   
          profileConfidence:
            true,
   
          aliases: {
            select: {
              alias:
                true,
   
              normalizedAlias:
                true,
   
              confidence:
                true,
            },
   
            orderBy: {
              normalizedAlias:
                "asc",
            },
          },
        },
   
        orderBy: {
          canonicalName:
            "asc",
        },
      });
   
    const catalog =
      brands.map(
        (
          brand
        ): CachedBrandRecord => ({
          id:
            brand.id,
   
          canonicalName:
            brand.canonicalName,
   
          normalizedCanonicalName:
            normalizeBrandText(
              brand.canonicalName
            ),
   
          profileConfidence:
            brand.profileConfidence,
   
          aliases:
            brand.aliases.map(
              (
                alias
              ): CachedBrandAlias => ({
                alias:
                  alias.alias,
   
                normalizedAlias:
                  alias
                    .normalizedAlias,
   
                confidence:
                  alias.confidence,
              })
            ),
        })
      );
   
    cachedCatalog =
      catalog;
   
    cachedAt =
      Date.now();
   
    console.log(
      "VidaSearch brand catalog cache refreshed:",
      {
        brandCount:
          catalog.length,
   
        aliasCount:
          catalog.reduce(
            (
              total,
              brand
            ) =>
              total +
              brand.aliases.length,
            0
          ),
   
        cacheTtlMs:
          BRAND_CATALOG_CACHE_TTL_MS,
      }
    );
   
    return catalog;
   }
   
   export async function loadBrandCatalog({
    forceRefresh =
      false,
   }: {
    forceRefresh?:
      boolean;
   } = {}) {
    if (
      !forceRefresh &&
      isCacheFresh()
    ) {
      return cachedCatalog as
        CachedBrandRecord[];
    }
   
    if (
      inFlightCatalogPromise
    ) {
      return inFlightCatalogPromise;
    }
   
    inFlightCatalogPromise =
      fetchBrandCatalog();
   
    try {
      return await inFlightCatalogPromise;
    } finally {
      inFlightCatalogPromise =
        null;
    }
   }
   
   export function invalidateBrandCatalogCache() {
    cachedCatalog =
      null;
   
    cachedAt =
      0;
   }