import type {
  SearchProductOption,
 } from "@/lib/search/searchProductOption";
 
 export type SearchIntentType =
  | "supplement"
  | "health-goal"
  | "health-condition"
  | "life-stage"
  | "brand"
  | "invalid";
 
 export type SearchRequestPhase =
  | "initial"
  | "expanded"
  | "complete";
 
 export type SearchProductCategory = {
  id:
    string;
 
  displayName:
    string;
 
  searchTerm:
    string;
 
  reason:
    string | null;
 
  kind:
    string | null;
 
  retailerListingCount:
    number;
 };
 
 export type SearchProductsMetadata = {
  intent:
    SearchIntentType;
 
  originalQuery:
    string;
 
  normalizedQuery:
    string;
 
  displayName:
    string | null;
 
  goalId:
    string | null;
 
  topicId:
    string | null;
 
  requiresMedicalNotice:
    boolean;
 
  categories:
    SearchProductCategory[];
 };
 
 export type SearchProductsResult = {
  products:
    SearchProductOption[];
 
  metadata:
    SearchProductsMetadata | null;
 };
 
 type SearchApiErrorBody = {
  error?:
    string;
 
  code?:
    string;
 
  suggestion?:
    string;
 
  query?:
    string;
 };
 
 type StructuredSearchApiResponse = {
  products?:
    SearchProductOption[];
 
  intent?:
    SearchIntentType;
 
  originalQuery?:
    string;
 
  normalizedQuery?:
    string;
 
  displayName?:
    string | null;
 
  goalId?:
    string | null;
 
  topicId?:
    string | null;
 
  requiresMedicalNotice?:
    boolean;
 
  categories?:
    Array<{
      id?:
        string;
 
      displayName?:
        string;
 
      searchTerm?:
        string;
 
      reason?:
        string | null;
 
      kind?:
        string;
 
      retailerListingCount?:
        number;
    }>;
 };
 
 export class SearchProductsError extends Error {
  readonly code:
    string | null;
 
  readonly status:
    number;
 
  readonly suggestion:
    string | null;
 
  readonly query:
    string | null;
 
  constructor({
    message,
    code,
    status,
    suggestion,
    query,
  }: {
    message:
      string;
 
    code?:
      string | null;
 
    status:
      number;
 
    suggestion?:
      string | null;
 
    query?:
      string | null;
  }) {
    super(
      message
    );
 
    this.name =
      "SearchProductsError";
 
    this.code =
      code ??
      null;
 
    this.status =
      status;
 
    this.suggestion =
      suggestion ??
      null;
 
    this.query =
      query ??
      null;
  }
 }
 
 function isSearchProductArray(
  value:
    unknown
 ): value is SearchProductOption[] {
  return Array.isArray(
    value
  );
 }
 
 function normalizeSearchIntentType(
  value:
    unknown
 ): SearchIntentType {
  switch (
    value
  ) {
    case "health-goal":
      return "health-goal";
 
    case "health-condition":
      return "health-condition";
 
    case "life-stage":
      return "life-stage";
 
    case "brand":
      return "brand";
 
    case "invalid":
      return "invalid";
 
    case "supplement":
    default:
      return "supplement";
  }
 }
 
 function normalizeCategory(
  category:
    NonNullable<
      StructuredSearchApiResponse[
        "categories"
      ]
 >[number],
 
  index:
    number
 ): SearchProductCategory {
  const fallbackId =
    `category-${index + 1}`;
 
  const displayName =
    category
      .displayName
      ?.trim() ||
    category
      .searchTerm
      ?.trim() ||
    `Supplement ${index + 1}`;
 
  const retailerListingCount =
    typeof category
      .retailerListingCount ===
      "number" &&
    Number.isFinite(
      category
        .retailerListingCount
    )
      ? Math.max(
          0,
          Math.round(
            category
              .retailerListingCount
          )
        )
      : 0;
 
  return {
    id:
      category
        .id
        ?.trim() ||
      fallbackId,
 
    displayName,
 
    searchTerm:
      category
        .searchTerm
        ?.trim() ||
      displayName,
 
    reason:
      category.reason ??
      null,
 
    kind:
      category
        .kind
        ?.trim() ||
      null,
 
    retailerListingCount,
  };
 }
 
 function parseStructuredResponse({
  data,
  originalQuery,
 }: {
  data:
    StructuredSearchApiResponse;
 
  originalQuery:
    string;
 }): SearchProductsResult {
  const categories =
    Array.isArray(
      data.categories
    )
      ? data.categories.map(
          normalizeCategory
        )
      : [];
 
  const products =
    Array.isArray(
      data.products
    )
      ? data.products
      : [];
 
  return {
    products,
 
    metadata: {
      intent:
        normalizeSearchIntentType(
          data.intent
        ),
 
      originalQuery:
        data
          .originalQuery
          ?.trim() ||
        originalQuery,
 
      normalizedQuery:
        data
          .normalizedQuery
          ?.trim() ||
        originalQuery
          .trim()
          .toLowerCase(),
 
      displayName:
        data.displayName ??
        null,
 
      goalId:
        data.goalId ??
        null,
 
      topicId:
        data.topicId ??
        data.goalId ??
        null,
 
      requiresMedicalNotice:
        data
          .requiresMedicalNotice ===
        true,
 
      categories,
    },
  };
 }
 
 export async function searchProductsWithMetadata({
  supplement,
  brand,
  capsulesPerDay = 1,
  phase = "complete",
  signal,
 }: {
  supplement:
    string;
 
  brand?:
    string;
 
  capsulesPerDay?:
    number;
 
  phase?:
    SearchRequestPhase;
 
  signal?:
    AbortSignal;
 }): Promise<SearchProductsResult> {
  const response =
    await fetch(
      "/api/search",
      {
        method:
          "POST",
 
        headers: {
          "Content-Type":
            "application/json",
        },
 
        body:
          JSON.stringify({
            supplement,
            brand,
            capsulesPerDay,
            phase,
          }),
 
        signal,
      }
    );
 
  let responseBody:
    unknown;
 
  try {
    responseBody =
      await response.json();
  } catch {
    responseBody =
      null;
  }
 
  if (
    !response.ok
  ) {
    const errorBody =
      (
        responseBody &&
        typeof responseBody ===
          "object"
          ? responseBody
          : null
      ) as
        SearchApiErrorBody |
        null;
 
    throw new SearchProductsError({
      message:
        errorBody?.error ||
        "Search failed.",
 
      code:
        errorBody?.code ??
        null,
 
      status:
        response.status,
 
      suggestion:
        errorBody
          ?.suggestion ??
        null,
 
      query:
        errorBody?.query ??
        supplement,
    });
  }
 
  if (
    isSearchProductArray(
      responseBody
    )
  ) {
    return {
      products:
        responseBody,
 
      metadata:
        null,
    };
  }
 
  if (
    responseBody &&
    typeof responseBody ===
      "object"
  ) {
    return parseStructuredResponse({
      data:
        responseBody as
          StructuredSearchApiResponse,
 
      originalQuery:
        supplement,
    });
  }
 
  throw new SearchProductsError({
    message:
      "The search service returned an invalid response.",
 
    code:
      "INVALID_SEARCH_RESPONSE",
 
    status:
      500,
 
    suggestion:
      "Please try the search again.",
 
    query:
      supplement,
  });
 }
 
 export async function searchProducts({
  supplement,
  brand,
  capsulesPerDay = 1,
  phase = "complete",
  signal,
 }: {
  supplement:
    string;
 
  brand?:
    string;
 
  capsulesPerDay?:
    number;
 
  phase?:
    SearchRequestPhase;
 
  signal?:
    AbortSignal;
 }): Promise<SearchProductOption[]> {
  const result =
    await searchProductsWithMetadata({
      supplement,
      brand,
      capsulesPerDay,
      phase,
      signal,
    });
 
  return result.products;
 }
 