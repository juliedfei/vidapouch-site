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
 
 const INITIAL_SEARCH_MAX_PAGES =
  1;
 
 /*
 * The expanded search intentionally explores
 * multiple product forms and two marketplace pages
 * per query.
 */
 const EXPANDED_SEARCH_MAX_PAGES =
  2;
 
 const MAX_SEARCH_JOBS =
  8;
 
 /*
 * This is a per-job limit, not a combined limit.
 *
 * Eight expanded jobs can therefore collect far
 * more than 250 retailer listings in total.
 */
 const MAX_RETAIL_LISTINGS_PER_SEARCH =
  400;
 
 type SearchPhase =
  | "initial"
  | "expanded"
  | "complete";
 
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
 
 type FailedSearchJob = {
  searchTerm:
    string;
 
  error:
    string;
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
 
 function normalizeSearchPhase(
  value:
    unknown
 ): SearchPhase {
  if (
    value ===
      "initial" ||
    value ===
      "expanded" ||
    value ===
      "complete"
  ) {
    return value;
  }
 
  return "complete";
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
    "gummy",
    "gummies",
    "powder",
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
 
 function createSearchJob({
  id,
  displayName,
  searchTerm,
  reason,
  searchMode,
  expandAliases,
  maxPages,
  priority,
  kind,
 }: {
  id:
    string;
 
  displayName:
    string;
 
  searchTerm:
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
 }): SearchJob {
  return {
    id,
 
    displayName,
 
    searchTerm:
      searchTerm.trim(),
 
    normalizedSearchTerm:
      normalizeSearchIntentText(
        searchTerm
      ),
 
    reason,
 
    searchMode,
 
    expandAliases,
 
    maxPages,
 
    priority,
 
    kind,
  };
 }
 
 function buildSupplementExpansionJobs({
  originalQuery,
  displayName,
 }: {
  originalQuery:
    string;
 
  displayName:
    string;
 }) {
  const cleanedOriginalQuery =
    originalQuery.trim();
 
  const canonicalName =
    displayName.trim() ||
    cleanedOriginalQuery;
 
  /*
   * These are deliberately distinct Google
   * Shopping searches.
   *
   * Relying only on resolveSearchIntent.expansions
   * was the reason the expanded phase could still
   * return approximately the same 36 products.
   */
  const variations = [
    {
      id:
        "supplement-primary",
 
      searchTerm:
        cleanedOriginalQuery,
 
      reason:
        "Direct search using the customer’s exact supplement query.",
 
      priority:
        -1000,
 
      kind:
        "PRIMARY_SUPPLEMENT",
 
      searchMode:
        "supplement" as const,
 
      expandAliases:
        true,
    },
    {
      id:
        "supplement-general",
 
      searchTerm:
        `${canonicalName} supplement`,
 
      reason:
        "General supplement listings for the requested ingredient.",
 
      priority:
        -900,
 
      kind:
        "SUPPLEMENT_GENERAL",
 
      searchMode:
        "direct-marketplace" as const,
 
      expandAliases:
        false,
    },
    {
      id:
        "supplement-capsules",
 
      searchTerm:
        `${canonicalName} capsules`,
 
      reason:
        "Capsule products containing the requested supplement.",
 
      priority:
        -800,
 
      kind:
        "SUPPLEMENT_CAPSULES",
 
      searchMode:
        "direct-marketplace" as const,
 
      expandAliases:
        false,
    },
    {
      id:
        "supplement-tablets",
 
      searchTerm:
        `${canonicalName} tablets`,
 
      reason:
        "Tablet products containing the requested supplement.",
 
      priority:
        -700,
 
      kind:
        "SUPPLEMENT_TABLETS",
 
      searchMode:
        "direct-marketplace" as const,
 
      expandAliases:
        false,
    },
    {
      id:
        "supplement-softgels",
 
      searchTerm:
        `${canonicalName} softgels`,
 
      reason:
        "Softgel products containing the requested supplement.",
 
      priority:
        -600,
 
      kind:
        "SUPPLEMENT_SOFTGELS",
 
      searchMode:
        "direct-marketplace" as const,
 
      expandAliases:
        false,
    },
    {
      id:
        "supplement-powder",
 
      searchTerm:
        `${canonicalName} powder supplement`,
 
      reason:
        "Powder products containing the requested supplement.",
 
      priority:
        -500,
 
      kind:
        "SUPPLEMENT_POWDER",
 
      searchMode:
        "direct-marketplace" as const,
 
      expandAliases:
        false,
    },
    {
      id:
        "supplement-gummies",
 
      searchTerm:
        `${canonicalName} gummies`,
 
      reason:
        "Gummy products containing the requested supplement.",
 
      priority:
        -400,
 
      kind:
        "SUPPLEMENT_GUMMIES",
 
      searchMode:
        "direct-marketplace" as const,
 
      expandAliases:
        false,
    },
    {
      id:
        "supplement-vitamin-shop",
 
      searchTerm:
        `${canonicalName} vitamins supplements`,
 
      reason:
        "Broader vitamin and supplement marketplace listings.",
 
      priority:
        -300,
 
      kind:
        "SUPPLEMENT_BROAD",
 
      searchMode:
        "direct-marketplace" as const,
 
      expandAliases:
        false,
    },
  ];
 
  return variations.map(
    (
      variation
    ) =>
      createSearchJob({
        id:
          variation.id,
 
        displayName:
          canonicalName,
 
        searchTerm:
          variation.searchTerm,
 
        reason:
          variation.reason,
 
        searchMode:
          variation.searchMode,
 
        expandAliases:
          variation.expandAliases,
 
        maxPages:
          EXPANDED_SEARCH_MAX_PAGES,
 
        priority:
          variation.priority,
 
        kind:
          variation.kind,
      })
  );
 }
 
 function buildResolvedExpansionJobs({
  expansions,
 }: {
  expansions:
    Awaited<
      ReturnType<
        typeof resolveSearchIntent
 >
 >["expansions"];
 }) {
  return expansions.flatMap(
    (
      expansion,
      index
    ) => {
      const searchTerm =
        expansion.searchTerm
          .trim();
 
      if (
        !searchTerm
      ) {
        return [];
      }
 
      return [
        createSearchJob({
          id:
            expansion.id ??
            [
              expansion.kind,
              index,
            ].join(
              ":"
            ),
 
          displayName:
            cleanText(
              expansion.displayName
            ) ??
            searchTerm,
 
          searchTerm,
 
          reason:
            cleanText(
              expansion.reason
            ),
 
          searchMode:
            "direct-marketplace",
 
          expandAliases:
            false,
 
          maxPages:
            EXPANDED_SEARCH_MAX_PAGES,
 
          priority:
            expansion.priority,
 
          kind:
            expansion.kind,
        }),
      ];
    }
  );
 }
 
 function deduplicateSearchJobs(
  jobs:
    SearchJob[]
 ) {
  const uniqueJobs =
    new Map<
      string,
      SearchJob
 >();
 
  for (
    const job of
    [...jobs].sort(
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
 
    if (
      !key
    ) {
      continue;
    }
 
    const existing =
      uniqueJobs.get(
        key
      );
 
    if (
      !existing
    ) {
      uniqueJobs.set(
        key,
        job
      );
 
      continue;
    }
 
    uniqueJobs.set(
      key,
      {
        ...existing,
 
        maxPages:
          Math.max(
            existing.maxPages,
            job.maxPages
          ),
 
        expandAliases:
          existing.expandAliases ||
          job.expandAliases,
 
        priority:
          Math.min(
            existing.priority,
            job.priority
          ),
      }
    );
  }
 
  return Array.from(
    uniqueJobs.values()
  )
    .sort(
      (
        left,
        right
      ) =>
        left.priority -
        right.priority
    )
    .slice(
      0,
      MAX_SEARCH_JOBS
    );
 }
 
 function buildCompleteSearchJobs({
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
  const resolvedExpansionJobs =
    buildResolvedExpansionJobs({
      expansions,
    });
 
  if (
    intentType ===
      "SUPPLEMENT"
  ) {
    /*
     * Supplement searches always receive the full
     * marketplace variation set, even when the
     * intent resolver returns no expansions.
     */
    return deduplicateSearchJobs([
      ...buildSupplementExpansionJobs({
        originalQuery,
 
        displayName,
      }),
 
      ...resolvedExpansionJobs,
    ]);
  }
 
  const jobs:
    SearchJob[] = [
      ...resolvedExpansionJobs,
    ];
 
  /*
   * Health-goal searches retain their resolver
   * categories. Add the original broad query as a
   * fallback so the search is never empty.
   */
  const fallbackSearchTerm =
    buildFallbackMarketplaceQuery({
      originalQuery,
 
      intentType,
    });
 
  jobs.push(
    createSearchJob({
      id:
        "fallback-direct-query",
 
      displayName,
 
      searchTerm:
        fallbackSearchTerm,
 
      reason:
        "Broad marketplace search matching the customer’s request.",
 
      searchMode:
        "direct-marketplace",
 
      expandAliases:
        false,
 
      maxPages:
        EXPANDED_SEARCH_MAX_PAGES,
 
      priority:
        -1000,
 
      kind:
        "DIRECT_QUERY",
    })
  );
 
  return deduplicateSearchJobs(
    jobs
  );
 }
 
 function buildInitialSearchJob({
  originalQuery,
  intentType,
  displayName,
 }: {
  originalQuery:
    string;
 
  intentType:
    string;
 
  displayName:
    string;
 }): SearchJob {
  const searchTerm =
    originalQuery.trim();
 
  return createSearchJob({
    id:
      "initial-fast-search",
 
    displayName,
 
    searchTerm,
 
    reason:
      "Fast initial marketplace results matching the customer’s request.",
 
    searchMode:
      intentType ===
        "SUPPLEMENT"
        ? "supplement"
        : "direct-marketplace",
 
    /*
     * The initial request must remain fast.
     */
    expandAliases:
      false,
 
    maxPages:
      INITIAL_SEARCH_MAX_PAGES,
 
    priority:
      -1000,
 
    kind:
      "INITIAL_QUERY",
  });
 }
 
 function selectSearchJobsForPhase({
  phase,
  initialJob,
  completeJobs,
 }: {
  phase:
    SearchPhase;
 
  initialJob:
    SearchJob;
 
  completeJobs:
    SearchJob[];
 }) {
  if (
    phase ===
      "initial"
  ) {
    return [
      initialJob,
    ];
  }
 
  return completeJobs;
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
    (
      listing
    ) => ({
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
  const startedAt =
    Date.now();
 
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
    "VidaSearch marketplace job completed:",
    {
      searchTerm:
        job.searchTerm,
 
      kind:
        job.kind,
 
      searchMode:
        job.searchMode,
 
      expandAliases:
        job.expandAliases,
 
      maxPages:
        job.maxPages,
 
      retailerListingCount:
        listings.length,
 
      durationMs:
        Date.now() -
        startedAt,
    }
  );
 
  return {
    job,
 
    listings,
  };
 }
 
 async function runSearchJobs({
  jobs,
  brand,
 }: {
  jobs:
    SearchJob[];
 
  brand:
    string | undefined;
 }) {
  const settledJobs =
    await Promise.allSettled(
      jobs.map(
        (
          job
        ) =>
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
    FailedSearchJob[] =
    [];
 
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
          jobs[index]
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
 
  return {
    completedJobs,
 
    failedJobs,
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
  const routeStartedAt =
    Date.now();
 
  try {
    const body =
      (await request.json()) as {
        supplement?:
          string;
 
        brand?:
          string;
 
        capsulesPerDay?:
          number;
 
        phase?:
          SearchPhase;
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
 
    const phase =
      normalizeSearchPhase(
        body.phase
      );
 
    const intentStartedAt =
      Date.now();
 
    const resolvedIntent =
      await resolveSearchIntent(
        originalQuery
      );
 
    console.log(
      "VidaSearch resolved intent:",
      {
        query:
          originalQuery,
 
        phase,
 
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
 
        durationMs:
          Date.now() -
          intentStartedAt,
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
 
    const completeJobs =
      buildCompleteSearchJobs({
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
 
    const initialJob =
      buildInitialSearchJob({
        originalQuery,
 
        intentType:
          resolvedIntent
            .intentType,
 
        displayName:
          resolvedIntent
            .displayName,
      });
 
    const searchJobs =
      selectSearchJobsForPhase({
        phase,
 
        initialJob,
 
        completeJobs,
      });
 
    console.log(
      "VidaSearch marketplace jobs prepared:",
      {
        query:
          originalQuery,
 
        phase,
 
        intentType:
          resolvedIntent
            .intentType,
 
        searchJobCount:
          searchJobs.length,
 
        jobs:
          searchJobs.map(
            (
              job
            ) => ({
              searchTerm:
                job.searchTerm,
 
              kind:
                job.kind,
 
              searchMode:
                job.searchMode,
 
              expandAliases:
                job.expandAliases,
 
              maxPages:
                job.maxPages,
 
              priority:
                job.priority,
            })
          ),
      }
    );
 
    const marketplaceStartedAt =
      Date.now();
 
    const {
      completedJobs,
      failedJobs,
    } =
      await runSearchJobs({
        jobs:
          searchJobs,
 
        brand,
      });
 
    if (
      failedJobs.length >
        0
    ) {
      console.error(
        "VidaSearch marketplace jobs failed:",
        {
          query:
            originalQuery,
 
          phase,
 
          failedJobs,
        }
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
 
    /*
     * There is deliberately no combined listing
     * cap here.
     */
    const combinedListings =
      completedJobs.flatMap(
        (
          completedJob
        ) =>
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
 
    scheduleUnknownBrandEnrichment({
      listings:
        combinedListings,
 
      request:
        combinedBrandRequest,
    });
 
    scheduleBrandDiscoveryRecording({
      listings:
        combinedListings,
 
      request:
        combinedBrandRequest,
 
      searchQuery:
        originalQuery,
 
      sourceProvider:
        phase ===
          "initial"
          ? "serpapi-google-shopping-initial"
          : "serpapi-google-shopping-expanded",
    });
 
    const productBuildStartedAt =
      Date.now();
 
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
 
        phase,
 
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
 
        marketplaceDurationMs:
          Date.now() -
          marketplaceStartedAt,
 
        productBuildDurationMs:
          Date.now() -
          productBuildStartedAt,
 
        totalDurationMs:
          Date.now() -
          routeStartedAt,
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
        phase,
 
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
 
        durationMs:
          Date.now() -
          routeStartedAt,
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
 