import {
  NextResponse,
 } from "next/server";
 
 import {
  findSearchProducts,
 } from "@/lib/search/findSearchProducts";
 
 import {
  buildSearchProductOptions,
 } from "@/lib/search/buildSearchProductOptions";
 
 import {
  normalizeSearchIntentText,
  resolveSearchIntent,
 } from "@/lib/search/resolveSearchIntent";
 
 import {
  scheduleBrandDiscoveryRecording,
 } from "@/lib/search/brand/scheduleBrandDiscoveryRecording";
 
 import {
  scheduleUnknownBrandEnrichment,
 } from "@/lib/search/brand/scheduleUnknownBrandEnrichment";
 
 import type {
  SearchRetailProduct,
 } from "@/lib/search/searchRetailProduct";
 
 import type {
  ProductSearchMode,
 } from "@/app/api/pricing/providers/providerTypes";
 
 export const runtime =
  "nodejs";
 
 export const dynamic =
  "force-dynamic";
 
 /*
 * The primary marketplace search receives two pages.
 *
 * Related expansion searches receive one page each.
 * This provides broad results without making every
 * search wait for several pages from every expansion.
 */
 const PRIMARY_SEARCH_MAX_PAGES =
  2;
 
 const EXPANSION_SEARCH_MAX_PAGES =
  1;
 
 /*
 * This limits marketplace query expansion, not the
 * number of products returned to the customer.
 *
 * The final product list is not sliced or capped.
 */
 const MAX_SEARCH_JOBS =
  8;
 
 const MAX_RETAIL_LISTINGS_PER_SEARCH =
  250;
 
 type SearchJob = {
  id:
    string;
 
  displayName:
    string;
 
  searchTerm:
    string;
 
  normalizedSearchTerm:
    string;
 
  reason:
    string | null;
 
  searchMode:
    ProductSearchMode;
 
  expandAliases:
    boolean;
 
  maxPages:
    number;
 
  priority:
    number;
 
  kind:
    string;
 };
 
 type CompletedSearchJob = {
  job:
    SearchJob;
 
  listings:
    SearchRetailProduct[];
 };
 
 function cleanText(
  value:
    string | null |
    undefined
 ) {
  const cleaned =
    value
      ?.replace(
        /\s+/g,
        " "
      )
      .trim();
 
  return cleaned ||
    null;
 }
 
 function containsShoppingContext(
  value:
    string
 ) {
  const normalized =
    normalizeSearchIntentText(
      value
    );
 
  return [
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
  ].some(
    (word) =>
      normalized ===
        word ||
      normalized.startsWith(
        `${word} `
      ) ||
      normalized.endsWith(
        ` ${word}`
      ) ||
      normalized.includes(
        ` ${word} `
      )
  );
 }
 
 function buildFallbackMarketplaceQuery({
  originalQuery,
  intentType,
 }: {
  originalQuery:
    string;
 
  intentType:
    string;
 }) {
  const cleaned =
    originalQuery.trim();
 
  if (
    containsShoppingContext(
      cleaned
    )
  ) {
    return cleaned;
  }
 
  if (
    intentType ===
      "HEALTH_GOAL"
  ) {
    return `${cleaned} supplements`;
  }
 
  if (
    intentType ===
      "SUPPLEMENT"
  ) {
    return `${cleaned} supplement`;
  }
 
  return cleaned;
 }
 
 function buildSearchJobs({
  originalQuery,
  intentType,
  displayName,
  expansions,
 }: {
  originalQuery:
    string;
 
  intentType:
    string;
 
  displayName:
    string;
 
  expansions:
    Awaited<
      ReturnType<
        typeof resolveSearchIntent
 >
 >["expansions"];
 }) {
  const jobs:
    SearchJob[] = [];
 
  /*
   * A direct supplement search keeps strict
   * supplement validation and controlled aliases.
   */
  if (
    intentType ===
      "SUPPLEMENT"
  ) {
    const searchTerm =
      originalQuery.trim();
 
    jobs.push({
      id:
        "primary-supplement",
 
      displayName,
 
      searchTerm,
 
      normalizedSearchTerm:
        normalizeSearchIntentText(
          searchTerm
        ),
 
      reason:
        "Direct supplement search matching the customer’s request.",
 
      searchMode:
        "supplement",
 
      expandAliases:
        true,
 
      maxPages:
        PRIMARY_SEARCH_MAX_PAGES,
 
      priority:
        0,
 
      kind:
        "PRIMARY_SUPPLEMENT",
    });
  }
 
  for (
    const expansion of
    expansions
  ) {
    const searchTerm =
      expansion.searchTerm
        .trim();
 
    if (
      !searchTerm
    ) {
      continue;
    }
 
    jobs.push({
      id:
        expansion.id ??
        [
          expansion.kind,
          expansion
            .normalizedSearchTerm,
        ].join(
          ":"
        ),
 
      displayName:
        cleanText(
          expansion.displayName
        ) ??
        searchTerm,
 
      searchTerm,
 
      normalizedSearchTerm:
        expansion
          .normalizedSearchTerm ||
        normalizeSearchIntentText(
          searchTerm
        ),
 
      reason:
        cleanText(
          expansion.reason
        ),
 
      searchMode:
        "direct-marketplace",
 
      expandAliases:
        false,
 
      maxPages:
        expansion.kind ===
          "DIRECT_QUERY"
          ? PRIMARY_SEARCH_MAX_PAGES
          : EXPANSION_SEARCH_MAX_PAGES,
 
      priority:
        expansion.priority,
 
      kind:
        expansion.kind,
    });
  }
 
  if (
    jobs.length ===
      0
  ) {
    const searchTerm =
      buildFallbackMarketplaceQuery({
        originalQuery,
 
        intentType,
      });
 
    jobs.push({
      id:
        "fallback-direct-query",
 
      displayName,
 
      searchTerm,
 
      normalizedSearchTerm:
        normalizeSearchIntentText(
          searchTerm
        ),
 
      reason:
        "Direct marketplace search matching the customer’s request.",
 
      searchMode:
        intentType ===
          "SUPPLEMENT"
          ? "supplement"
          : "direct-marketplace",
 
      expandAliases:
        intentType ===
          "SUPPLEMENT",
 
      maxPages:
        PRIMARY_SEARCH_MAX_PAGES,
 
      priority:
        0,
 
      kind:
        "DIRECT_QUERY",
    });
  }
 
  const uniqueJobs =
    new Map<
      string,
      SearchJob
 >();
 
  for (
    const job of
    jobs.sort(
      (
        left,
        right
      ) =>
        left.priority -
        right.priority
    )
  ) {
    const key =
      normalizeSearchIntentText(
        job.searchTerm
      );
 
    const existing =
      uniqueJobs.get(
        key
      );
 
    if (
      !existing ||
      job.maxPages >
        existing.maxPages
    ) {
      uniqueJobs.set(
        key,
        job
      );
    }
  }
 
  /*
   * This limits external provider calls only.
   * It does not limit the number of products
   * eventually returned from those searches.
   */
  return Array.from(
    uniqueJobs.values()
  ).slice(
    0,
    MAX_SEARCH_JOBS
  );
 }
 
 function normalizeListingsForCombinedGrouping({
  listings,
  canonicalSupplement,
 }: {
  listings:
    SearchRetailProduct[];
 
  canonicalSupplement:
    string;
 }) {
  return listings.map(
    (listing) => ({
      ...listing,
 
      supplement:
        canonicalSupplement,
    })
  );
 }
 
 async function runSearchJob({
  job,
  brand,
 }: {
  job:
    SearchJob;
 
  brand:
    string | undefined;
 }): Promise<
  CompletedSearchJob
 >{
  const listings =
    await findSearchProducts({
      supplement:
        job.searchTerm,
 
      brand,
 
      searchMode:
        job.searchMode,
 
      expandAliases:
        job.expandAliases,
 
      maxPages:
        job.maxPages,
 
      maxRetailListings:
        MAX_RETAIL_LISTINGS_PER_SEARCH,
    });
 
  console.log(
    "VidaSearch intent expansion completed:",
    {
      searchTerm:
        job.searchTerm,
 
      kind:
        job.kind,
 
      searchMode:
        job.searchMode,
 
      maxPages:
        job.maxPages,
 
      retailerListingCount:
        listings.length,
    }
  );
 
  /*
   * Do not build product cards here.
   *
   * Previously each expansion built its own product
   * collection and the entire combined collection
   * was then built again. That repeated grouping,
   * pricing, research-cache reads, and scoring.
   */
  return {
    job,
 
    listings,
  };
 }
 
 function getSearchSuggestion(
  intentType:
    string
 ) {
  if (
    intentType ===
      "DOCTOR_TYPE"
  ) {
    return "Practitioner search is not available yet. Try searching for Magnesium, Mood Support, Sleep, or Vitamin D.";
  }
 
  return "Try searching for Magnesium, Mood Support, Sleep, or Vitamin D.";
 }
 
 export async function POST(
  request:
    Request
 ) {
  try {
    const body =
      (await request.json()) as {
        supplement?:
          string;
 
        brand?:
          string;
 
        capsulesPerDay?:
          number;
      };
 
    const originalQuery =
      body.supplement
        ?.trim();
 
    if (
      !originalQuery
    ) {
      return NextResponse.json(
        {
          error:
            "Supplement or health goal is required.",
 
          code:
            "MISSING_SEARCH_QUERY",
        },
        {
          status:
            400,
        }
      );
    }
 
    const resolvedIntent =
      await resolveSearchIntent(
        originalQuery
      );
 
    console.log(
      "VidaSearch resolved intent:",
      {
        query:
          originalQuery,
 
        normalizedKey:
          resolvedIntent
            .normalizedKey,
 
        intentType:
          resolvedIntent
            .intentType,
 
        cacheStatus:
          resolvedIntent
            .cacheStatus,
 
        source:
          resolvedIntent.source,
 
        confidence:
          resolvedIntent
            .confidence,
 
        expansionCount:
          resolvedIntent
            .expansions
            .length,
      }
    );
 
    if (
      resolvedIntent
        .intentType ===
        "INVALID" ||
      resolvedIntent
        .intentType ===
        "DOCTOR_TYPE"
    ) {
      return NextResponse.json(
        {
          error:
            resolvedIntent
              .intentType ===
              "DOCTOR_TYPE"
              ? "Practitioner search is not available yet."
              : "We couldn’t identify this as a supplement or health goal.",
 
          code:
            resolvedIntent
              .intentType ===
              "DOCTOR_TYPE"
              ? "PRACTITIONER_SEARCH_UNAVAILABLE"
              : "UNSUPPORTED_SEARCH",
 
          query:
            originalQuery,
 
          suggestion:
            getSearchSuggestion(
              resolvedIntent
                .intentType
            ),
 
          intent: {
            type:
              resolvedIntent
                .intentType,
 
            normalizedKey:
              resolvedIntent
                .normalizedKey,
 
            displayName:
              resolvedIntent
                .displayName,
 
            cacheStatus:
              resolvedIntent
                .cacheStatus,
          },
        },
        {
          status:
            422,
        }
      );
    }
 
    const capsulesPerDay =
      typeof body
        .capsulesPerDay ===
        "number" &&
      Number.isFinite(
        body.capsulesPerDay
      ) &&
      body.capsulesPerDay >
        0
        ? body.capsulesPerDay
        : 1;
 
    const brand =
      body.brand
        ?.trim() ||
      undefined;
 
    const searchJobs =
      buildSearchJobs({
        originalQuery,
 
        intentType:
          resolvedIntent
            .intentType,
 
        displayName:
          resolvedIntent
            .displayName,
 
        expansions:
          resolvedIntent
            .expansions,
      });
 
    console.log(
      "VidaSearch marketplace jobs prepared:",
      {
        query:
          originalQuery,
 
        intentType:
          resolvedIntent
            .intentType,
 
        searchJobCount:
          searchJobs.length,
 
        jobs:
          searchJobs.map(
            (job) => ({
              searchTerm:
                job.searchTerm,
 
              kind:
                job.kind,
 
              searchMode:
                job.searchMode,
 
              maxPages:
                job.maxPages,
            })
          ),
      }
    );
 
    const settledJobs =
      await Promise.allSettled(
        searchJobs.map(
          (job) =>
            runSearchJob({
              job,
 
              brand,
            })
        )
      );
 
    const completedJobs:
      CompletedSearchJob[] =
      [];
 
    const failedJobs:
      Array<{
        searchTerm:
          string;
 
        error:
          string;
      }> = [];
 
    settledJobs.forEach(
      (
        result,
        index
      ) => {
        if (
          result.status ===
            "fulfilled"
        ) {
          completedJobs.push(
            result.value
          );
 
          return;
        }
 
        failedJobs.push({
          searchTerm:
            searchJobs[index]
              ?.searchTerm ??
            "Unknown search",
 
          error:
            result.reason instanceof
              Error
              ? result.reason.message
              : String(
                  result.reason
                ),
        });
      }
    );
 
    if (
      failedJobs.length >
        0
    ) {
      console.error(
        "VidaSearch marketplace jobs failed:",
        failedJobs
      );
    }
 
    if (
      completedJobs.length ===
        0
    ) {
      throw new Error(
        failedJobs[0]
          ?.error ||
        "All marketplace searches failed."
      );
    }
 
    const canonicalSupplement =
      resolvedIntent
        .displayName
        .trim() ||
      originalQuery;
 
    const combinedListings =
      completedJobs.flatMap(
        (completedJob) =>
          normalizeListingsForCombinedGrouping({
            listings:
              completedJob
                .listings,
 
            canonicalSupplement,
          })
      );
 
    const combinedBrandRequest = {
      supplement:
        originalQuery,
 
      brand,
 
      searchMode:
        "direct-marketplace" as const,
 
      expandAliases:
        false,
    };
 
    /*
     * Schedule exactly one capped OpenAI brand
     * enrichment job for the complete customer search.
     *
     * Known brands are skipped. Recently attempted
     * unresolved titles are skipped by the configured
     * cooldown.
     */
    scheduleUnknownBrandEnrichment({
      listings:
        combinedListings,
 
      request:
        combinedBrandRequest,
    });
 
    /*
     * Record unresolved and parser-only brands once for
     * the complete customer search.
     *
     * This replaces separate discovery runs for each
     * marketplace expansion such as saffron, SAM-e,
     * 5-HTP, and L-theanine.
     */
    scheduleBrandDiscoveryRecording({
      listings:
        combinedListings,
 
      request:
        combinedBrandRequest,
 
      searchQuery:
        originalQuery,
 
      sourceProvider:
        "serpapi-google-shopping-combined",
    });
 
    /*
     * Group, price, score, and load cached research
     * only once for the final combined collection.
     */
    const products =
      await buildSearchProductOptions(
        combinedListings,
        capsulesPerDay
      );
 
    const categories =
      completedJobs.map(
        (
          completedJob
        ) => ({
          id:
            completedJob
              .job.id,
 
          displayName:
            completedJob
              .job
              .displayName,
 
          searchTerm:
            completedJob
              .job
              .searchTerm,
 
          reason:
            completedJob
              .job.reason,
 
          kind:
            completedJob
              .job.kind,
 
          retailerListingCount:
            completedJob
              .listings
              .length,
        })
      );
 
    console.log(
      "VidaSearch combined products built:",
      {
        query:
          originalQuery,
 
        intentType:
          resolvedIntent
            .intentType,
 
        successfulSearchCount:
          completedJobs.length,
 
        failedSearchCount:
          failedJobs.length,
 
        combinedRetailerListingCount:
          combinedListings.length,
 
        combinedProductCount:
          products.length,
      }
    );
 
    return NextResponse.json({
      intent:
        resolvedIntent
          .intentType ===
          "HEALTH_GOAL"
          ? "health-goal"
          : resolvedIntent
              .intentType ===
              "BRAND"
            ? "brand"
            : "supplement",
 
      originalQuery,
 
      normalizedQuery:
        resolvedIntent
          .normalizedKey,
 
      displayName:
        resolvedIntent
          .displayName,
 
      goalId:
        resolvedIntent
          .intentType ===
          "HEALTH_GOAL"
          ? resolvedIntent.id
          : null,
 
      categories,
 
      products,
 
      metadata: {
        intentId:
          resolvedIntent.id,
 
        intentType:
          resolvedIntent
            .intentType,
 
        intentSource:
          resolvedIntent.source,
 
        reviewStatus:
          resolvedIntent
            .reviewStatus,
 
        confidence:
          resolvedIntent
            .confidence,
 
        cacheStatus:
          resolvedIntent
            .cacheStatus,
 
        includeOriginalMarketplaceQuery:
          resolvedIntent
            .includeOriginalMarketplaceQuery,
 
        searchCount:
          searchJobs.length,
 
        successfulSearchCount:
          completedJobs.length,
 
        failedSearches:
          failedJobs,
 
        retailerListingCount:
          combinedListings.length,
 
        productCount:
          products.length,
      },
    });
  } catch (
    error
  ) {
    console.error(
      "VidaSearch route failed:",
      error
    );
 
    return NextResponse.json(
      {
        error:
          error instanceof
            Error
            ? error.message
            : "Search failed.",
 
        code:
          "SEARCH_FAILED",
      },
      {
        status:
          500,
      }
    );
  }
 }