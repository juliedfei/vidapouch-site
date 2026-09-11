"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import ProductCard from "./ProductCard";

import {
  useSearch,
} from "@/lib/search/useSearch";

import {
  applySearchDailyDose,
} from "@/lib/search/applySearchDailyDose";

import {
  parseSearchDailyDose,
} from "@/lib/search/parseSearchDailyDose";

import type {
  SearchProductOption,
} from "@/lib/search/searchProductOption";

import type {
  SearchFilterState,
  SearchSortOption,
  SearchTestingFilter,
} from "./types/searchFilters";

import type {
  SearchPouchItem,
} from "./types/searchPouch";

import {
  SEARCH_PLANS,
} from "./types/searchPlan";

import type {
  SearchPlan,
} from "./types/searchPlan";

type SearchResultsProps = {
  query:
    string;

  filters:
    SearchFilterState;

  onFiltersChange:
    Dispatch<
      SetStateAction<
        SearchFilterState
      >
    >;

  onAvailableBrandsChange:
    Dispatch<
      SetStateAction<
        string[]
      >
    >;

  pouchItems:
    SearchPouchItem[];

  onAddToPouch: (
    item:
      SearchPouchItem
  ) => void;

  selectedPlan:
    SearchPlan | null;
};

const INITIAL_VISIBLE_RESULTS =
  6;

function normalizeText(
  value:
    string
) {
  return value
    .toLowerCase()
    .replace(
      /['’]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .trim();
}

function parsePrice(
  value:
    string,

  fallback:
    number
) {
  const cleaned =
    value.replace(
      /[^0-9.]/g,
      ""
    );

  if (
    !cleaned
  ) {
    return fallback;
  }

  const parsed =
    Number(
      cleaned
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : fallback;
}

function containsClaim(
  claims:
    string[],

  expectedClaim:
    string
) {
  const normalizedExpected =
    normalizeText(
      expectedClaim
    );

  return claims.some(
    (claim) =>
      normalizeText(
        claim
      ).includes(
        normalizedExpected
      )
  );
}

function matchesTestingFilter(
  product:
    SearchProductOption,

  filter:
    SearchTestingFilter
) {
  switch (
    filter
  ) {
    case "USP Verified":
      return (
        product
          .thirdPartyTesting
          .uspVerified ||
        containsClaim(
          product.certifications,
          "USP Verified"
        )
      );

    case "NSF Certified":
      return (
        product
          .thirdPartyTesting
          .nsfCertified ||
        containsClaim(
          product.certifications,
          "NSF Certified"
        )
      );

    case "ConsumerLab Tested":
      return (
        product
          .thirdPartyTesting
          .consumerLabTested ||
        containsClaim(
          product.certifications,
          "ConsumerLab"
        ) ||
        containsClaim(
          product.qualityClaims,
          "ConsumerLab"
        )
      );

    case "Informed Choice":
      return (
        product
          .thirdPartyTesting
          .informedChoice ||
        containsClaim(
          product.certifications,
          "Informed Choice"
        ) ||
        containsClaim(
          product.certifications,
          "Informed Sport"
        )
      );

    case "Third-Party Tested":
      return (
        product
          .thirdPartyTesting
          .thirdPartyTested ||
        containsClaim(
          product.qualityClaims,
          "Third-Party Tested"
        )
      );

    case "GMP Quality Assured":
      return containsClaim(
        product.qualityClaims,
        "GMP Quality Assured"
      );

    case "cGMP Manufactured":
      return containsClaim(
        product.qualityClaims,
        "cGMP Manufactured"
      );

    case "NPA GMP Certified":
      return containsClaim(
        product.qualityClaims,
        "NPA GMP Certified"
      );

    default:
      return false;
  }
}

function matchesDietaryFilters(
  product:
    SearchProductOption,

  filters:
    SearchFilterState
) {
  return filters
    .dietaryPreferences
    .every(
      (preference) => {
        switch (
          preference
        ) {
          case "Vegan":
            return product
              .dietaryPreferences
              .vegan;

          case "Vegetarian":
            return product
              .dietaryPreferences
              .vegetarian;

          case "Gluten Free":
            return product
              .dietaryPreferences
              .glutenFree;

          case "Dairy Free":
            return product
              .dietaryPreferences
              .dairyFree;

          case "Soy Free":
            return product
              .dietaryPreferences
              .soyFree;

          case "Non-GMO":
            return product
              .dietaryPreferences
              .nonGmo;

          default:
            return true;
        }
      }
    );
}

function filterProducts({
  products,
  filters,
}: {
  products:
    SearchProductOption[];

  filters:
    SearchFilterState;
}) {
  const minimumPrice =
    parsePrice(
      filters.minimumPrice,
      0
    );

  const maximumPrice =
    parsePrice(
      filters.maximumPrice,
      Number
        .POSITIVE_INFINITY
    );

  const selectedBrand =
    normalizeText(
      filters.brand
    );

  return products.filter(
    (product) => {
      const matchesForm =
        filters.forms.length ===
          0 ||
        filters.forms.some(
          (form) =>
            normalizeText(
              product.form ??
                ""
            ) ===
            normalizeText(
              form
            )
        );

      if (
        !matchesForm
      ) {
        return false;
      }

      if (
        !matchesDietaryFilters(
          product,
          filters
        )
      ) {
        return false;
      }

      const matchesTesting =
        filters.testing.length ===
          0 ||
        filters.testing.some(
          (
            testingFilter
          ) =>
            matchesTestingFilter(
              product,
              testingFilter
            )
        );

      if (
        !matchesTesting
      ) {
        return false;
      }

      const matchesBrand =
        selectedBrand ===
          "all" ||
        normalizeText(
          product.brand
        ) ===
          selectedBrand;

      if (
        !matchesBrand
      ) {
        return false;
      }

      if (
        filters
          .vitaPouchEligibleOnly &&
        !product
          .vitaPouchFormEligible
      ) {
        return false;
      }

      const monthlyPrice =
        product
          .displayedMonthlyCost;

      return (
        monthlyPrice >=
          minimumPrice &&
        monthlyPrice <=
          maximumPrice
      );
    }
  );
}

function getBottlePrice(
  product:
    SearchProductOption
) {
  const bottlePrice =
    Number(
      product
        .representativeProduct
        .bottlePrice
    );

  return Number.isFinite(
    bottlePrice
  ) &&
  bottlePrice >=
    0
    ? bottlePrice
    : Number
      .POSITIVE_INFINITY;
}

function sortProducts({
  products,
  sort,
}: {
  products:
    SearchProductOption[];

  sort:
    SearchSortOption;
}) {
  const sorted =
    [...products];

  switch (
    sort
  ) {
    case "quality":
      return sorted.sort(
        (
          left,
          right
        ) =>
          (
            right.score
              .productQuality ??
            -1
          ) -
            (
              left.score
                .productQuality ??
              -1
            ) ||
          (
            right.score.overall ??
            -1
          ) -
            (
              left.score.overall ??
              -1
            )
      );

    case "price-low":
      return sorted.sort(
        (
          left,
          right
        ) =>
          left
            .displayedMonthlyCost -
            right
              .displayedMonthlyCost ||
          getBottlePrice(
            left
          ) -
            getBottlePrice(
              right
            )
      );

    case "bottle-price-low":
      return sorted.sort(
        (
          left,
          right
        ) =>
          getBottlePrice(
            left
          ) -
            getBottlePrice(
              right
            ) ||
          left
            .displayedMonthlyCost -
            right
              .displayedMonthlyCost
      );

    case "value":
      return sorted.sort(
        (
          left,
          right
        ) =>
          (
            right.score.value ??
            -1
          ) -
          (
            left.score.value ??
            -1
          )
      );

    case "best-match":
    default:
      return sorted.sort(
        (
          left,
          right
        ) =>
          (
            right.score.overall ??
            -1
          ) -
            (
              left.score.overall ??
              -1
            ) ||
          right.vendorsCompared -
            left.vendorsCompared
      );
  }
}

function ChevronUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[15px] w-[15px]">

      <path
        d="m7 14.5 5-5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[15px] w-[15px]">

      <path
        d="m7 9.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchQuestionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[27px] w-[27px]">

      <circle
        cx="10.5"
        cy="10.5"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="m15.5 15.5 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M8.8 8.8a2 2 0 0 1 3.8.9c0 1.4-1.7 1.7-1.7 3M10.9 15.7h.01"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchLoadingSpinner() {
  return (
    <span
      aria-hidden="true"
      className="
        inline-block
        h-[16px]
        w-[16px]
        shrink-0
        animate-spin
        rounded-full
        border-2
        border-[#E2D7CC]
        border-t-[#8C1D40]
      "
    />
  );
}

type SupplementSectionHeaderProps = {
  name:
    string;

  reason:
    string | null;

  productCount:
    number;

  expanded:
    boolean;

  onToggle:
    () => void;
};

function SupplementSectionHeader({
  name,
  reason,
  productCount,
  expanded,
  onToggle,
}: SupplementSectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={
        onToggle
      }
      aria-expanded={
        expanded
      }
      className="
        flex
        w-full
        items-center
        justify-between
        gap-4
        border-b
        border-[#EEE7DF]
        bg-[#FCFAF8]
        px-5
        py-3
        text-left
        transition
        hover:bg-[#F9F6F2]
      ">

      <div className="min-w-0">
        <div
          className="
            flex
            items-center
            gap-2
          ">

          <h3
            className="
              text-[15px]
              font-semibold
              text-[#172127]
            ">

            {name}
          </h3>

          <span
            className="
              text-[10px]
              font-medium
              text-[#8A9193]
            ">

            {productCount}{" "}
            {productCount ===
            1
              ? "product"
              : "products"}
          </span>
        </div>

        {reason && (
          <p
            className="
              mt-0.5
              max-w-[760px]
              text-[10.5px]
              leading-[1.45]
              text-[#6B7477]
            ">

            {reason}
          </p>
        )}
      </div>

      <span
        className="
          shrink-0
          text-[#6B7477]
        ">

        {expanded
          ? <ChevronUpIcon />
          : <ChevronDownIcon />}
      </span>
    </button>
  );
}

export default function SearchResults({
  query,
  filters,
  onFiltersChange,
  onAvailableBrandsChange,
  pouchItems,
  onAddToPouch,
  selectedPlan,
}: SearchResultsProps) {
  const {
    results:
      searchProducts,

    metadata,

    loading,

    loadingMore,

    error,

    errorCode,

    errorSuggestion,

    isUnsupportedSearch,
  } =
    useSearch(
      query
    );

  const [
    showAllLoadedResults,
    setShowAllLoadedResults,
  ] =
    useState(
      false
    );

  const [
    groupBySupplement,
    setGroupBySupplement,
  ] =
    useState(
      true
    );

  const [
    expandedSupplementSections,
    setExpandedSupplementSections,
  ] =
    useState<
      Set<string>
    >(
      () =>
        new Set()
    );

  const [
    showAllSupplementResults,
    setShowAllSupplementResults,
  ] =
    useState<
      Set<string>
    >(
      () =>
        new Set()
    );

  /*
   * Product cards always receive a usable plan.
   *
   * When the pouch is empty, Essential is used only
   * as the prospective starting tier. SearchWorkspace
   * formally assigns the tier when the first item is added.
   */
  const productCardPlan =
    selectedPlan ??
    SEARCH_PLANS[0] ??
    null;

  useEffect(
    () => {
      const brands =
        Array.from(
          new Set(
            searchProducts
              .map(
                (product) =>
                  product.brand
                    .trim()
              )
              .filter(
                (brand) =>
                  brand.length >
                    0 &&
                  brand
                    .toLowerCase() !==
                    "unknown brand"
              )
          )
        ).sort(
          (
            left,
            right
          ) =>
            left.localeCompare(
              right
            )
        );

      onAvailableBrandsChange(
        brands
      );

      onFiltersChange(
        (current) => {
          if (
            current.brand ===
              "all" ||
            brands.some(
              (brand) =>
                normalizeText(
                  brand
                ) ===
                normalizeText(
                  current.brand
                )
            )
          ) {
            return current;
          }

          return {
            ...current,

            brand:
              "all",
          };
        }
      );
    },
    [
      searchProducts,
      onAvailableBrandsChange,
      onFiltersChange,
    ]
  );

  const filteredProducts =
    useMemo(
      () => {
        const parsedDailyDose =
          parseSearchDailyDose(
            filters.dailyDose
          );

        const doseAdjustedProducts =
          searchProducts.flatMap(
            (product) => {
              const adjusted =
                applySearchDailyDose({
                  product,

                  dailyDose:
                    parsedDailyDose,
                });

              return adjusted
                ? [
                    adjusted.product,
                  ]
                : [];
            }
          );

        const matchingProducts =
          filterProducts({
            products:
              doseAdjustedProducts,

            filters,
          });

        return sortProducts({
          products:
            matchingProducts,

          sort:
            filters.sort,
        });
      },
      [
        searchProducts,
        filters,
      ]
    );

  const supportsSupplementGrouping =
    metadata?.intent ===
      "health-goal" ||
    metadata?.intent ===
      "health-condition" ||
    metadata?.intent ===
      "life-stage";

  const shouldGroupBySupplement =
    supportsSupplementGrouping &&
    groupBySupplement;

  const groupedProducts =
    useMemo(
      () => {
        if (
          !shouldGroupBySupplement ||
          !metadata ||
          metadata.categories.length ===
            0
        ) {
          return [];
        }

        return metadata.categories.flatMap(
          (
            category
          ) => {
            if (
              category.kind !==
                "RELATED_SUPPLEMENT" &&
              category.kind !==
                "INITIAL_RELATED_SUPPLEMENT"
            ) {
              return [];
            }

            const products =
              filteredProducts.filter(
                (
                  product
                ) =>
                  product.searchCategoryId ===
                  category.id
              );

            if (
              products.length ===
              0
            ) {
              return [];
            }

            return [
              {
                category,
                products,
              },
            ];
          }
        );
      },
      [
        filteredProducts,
        metadata,
        shouldGroupBySupplement,
      ]
    );

  /*
   * Resilient fallback marketplace jobs can return valid products
   * whose category kind is not RELATED_SUPPLEMENT. Those products
   * are part of the total count, so keep them visible instead of
   * silently hiding them in grouped mode.
   */
  const otherGroupedProducts =
    useMemo(
      () => {
        if (
          !shouldGroupBySupplement
        ) {
          return [];
        }

        const namedGroupedProductSet =
          new Set(
            groupedProducts.flatMap(
              (
                group
              ) =>
                group.products
            )
          );

        return filteredProducts.filter(
          (
            product
          ) =>
            !namedGroupedProductSet.has(
              product
            )
        );
      },
      [
        filteredProducts,
        groupedProducts,
        shouldGroupBySupplement,
      ]
    );

  const allGroupedProducts =
    useMemo(
      () => {
        if (
          !shouldGroupBySupplement
        ) {
          return groupedProducts;
        }

        if (
          otherGroupedProducts.length ===
          0
        ) {
          return groupedProducts;
        }

        const safeGroupQuery =
          typeof query ===
            "string"
            ? query.trim()
            : "";

        return [
          ...groupedProducts,
          {
            category: {
              id:
                "__other-results__",

              displayName:
                safeGroupQuery.length >
                0
                  ? `Other ${safeGroupQuery} results`
                  : "Other results",

              searchTerm:
                safeGroupQuery,

              reason:
                "Additional relevant supplement products found for this search.",

              kind:
                "OTHER_RESULTS",

              retailerListingCount:
                otherGroupedProducts.length,
            },
            products:
              otherGroupedProducts,
          },
        ];
      },
      [
        groupedProducts,
        otherGroupedProducts,
        shouldGroupBySupplement,
        query,
      ]
    );

  useEffect(
    () => {
      setShowAllLoadedResults(
        false
      );
    },
    [
      query,
      filters,
    ]
  );

  const safeQuery =
    typeof query ===
      "string"
      ? query.trim()
      : "";

  const resultLabel =
    safeQuery.length >
    0
      ? safeQuery
      : "";

  const visibleProducts =
    showAllLoadedResults
      ? filteredProducts
      : filteredProducts.slice(
          0,
          INITIAL_VISIBLE_RESULTS
        );

  const hiddenResultCount =
    showAllLoadedResults
      ? 0
      : Math.max(
          0,
          filteredProducts.length -
            visibleProducts.length
        );

  function showAllResults() {
    setShowAllLoadedResults(
      true
    );
  }

  function changeSort(
    sort:
      SearchSortOption
  ) {
    onFiltersChange(
      (current) => ({
        ...current,

        sort,
      })
    );
  }

  if (
    loading
  ) {
    return (
      <div
        className="
          w-full
          rounded-[10px]
          border
          border-[#EEE7DF]
          bg-white
          px-8
          py-16
          text-center
        ">

        <div
          className="
            mx-auto
            mb-5
            flex
            justify-center
          ">

          <span
            aria-hidden="true"
            className="
              inline-block
              h-[28px]
              w-[28px]
              animate-spin
              rounded-full
              border-[3px]
              border-[#E2D7CC]
              border-t-[#8C1D40]
            "
          />
        </div>

        <h3
          className="
            text-[26px]
            text-[#081620]
          "
          style={{
            fontFamily:
              'Georgia, "Times New Roman", serif',
          }}>

          Searching products
        </h3>

        <p
          className="
            mt-3
            text-[#667074]
          ">

          Comparing available products and
          retailers.
        </p>
      </div>
    );
  }

  if (
    isUnsupportedSearch
  ) {
    return (
      <div
        className="
          w-full
          overflow-hidden
          rounded-[12px]
          border
          border-[#E8DED4]
          bg-[#FCF9F5]
          px-6
          py-14
          text-center
          shadow-[0_2px_10px_rgba(54,38,20,0.025)]
          sm:px-10
          sm:py-16
        ">

        <span
          className="
            mx-auto
            flex
            h-[58px]
            w-[58px]
            items-center
            justify-center
            rounded-full
            bg-[#F3E8DE]
            text-[#8C1D40]
          ">

          <SearchQuestionIcon />
        </span>

        <p
          className="
            mt-5
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-[#8C6B55]
          ">

          Search not recognized
        </p>

        <h3
          className="
            mx-auto
            mt-2
            max-w-[650px]
            text-[25px]
            leading-tight
            text-[#172127]
            sm:text-[29px]
          "
          style={{
            fontFamily:
              'Georgia, "Times New Roman", serif',
          }}>

          “{resultLabel}” doesn’t appear to be a
          supplement or health goal
        </h3>

        <p
          className="
            mx-auto
            mt-4
            max-w-[590px]
            text-[13px]
            leading-[1.65]
            text-[#626C70]
          ">

          VidaSearch currently searches recognized
          supplements and health goals. We won’t send
          unrelated shopping terms to the product
          search engine.
        </p>

        <div
          className="
            mx-auto
            mt-6
            max-w-[610px]
            rounded-[9px]
            border
            border-[#E5D9CE]
            bg-white
            px-5
            py-4
          ">

          <p
            className="
              text-[11px]
              font-semibold
              text-[#342F2B]
            ">

            Try a search such as:
          </p>

          <div
            className="
              mt-3
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
            ">

            {[
              "Magnesium",
              "Mood Support",
              "Sleep",
              "Energy",
              "Vitamin D",
            ].map(
              (example) => (
                <span
                  key={
                    example
                  }
                  className="
                    rounded-full
                    border
                    border-[#DED2C7]
                    bg-[#FBF8F4]
                    px-3
                    py-1.5
                    text-[10.5px]
                    font-medium
                    text-[#5D554F]
                  ">

                  {example}
                </span>
              )
            )}
          </div>
        </div>

        {errorSuggestion && (
          <p
            className="
              mx-auto
              mt-4
              max-w-[600px]
              text-[11px]
              leading-[1.55]
              text-[#77706A]
            ">

            {errorSuggestion}
          </p>
        )}
      </div>
    );
  }

  if (
    error
  ) {
    return (
      <div
        className="
          w-full
          rounded-[10px]
          border
          border-[#EEE7DF]
          bg-white
          px-8
          py-16
          text-center
        ">

        <h3
          className="
            text-[26px]
            text-[#081620]
          "
          style={{
            fontFamily:
              'Georgia, "Times New Roman", serif',
          }}>

          Unable to load products
        </h3>

        <p
          className="
            mt-3
            text-[#667074]
          ">

          {errorCode ===
          "MISSING_SEARCH_QUERY"
            ? error
            : errorSuggestion ??
              "Please try the search again."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div
        className="
          flex
          flex-wrap
          items-start
          justify-between
          gap-5
          pb-4
        ">

        <div>
          <h2
            className="
              text-[26px]
              leading-tight
              text-[#081620]
              lg:text-[29px]
            "
            style={{
              fontFamily:
                'Georgia, "Times New Roman", serif',
            }}>

            Results for:{" "}

            <span className="text-[#71162F]">
              {resultLabel}
            </span>
          </h2>

          <div className="mt-2">
            <p
              className="
                text-[13px]
                text-[#667074]
              ">

              {filteredProducts.length}{" "}
              {loadingMore
                ? "products loaded"
                : `result${
                    filteredProducts.length !==
                    1
                      ? "s"
                      : ""
                  } found`}
            </p>

            {loadingMore && (
              <div
                role="status"
                aria-live="polite"
                className="
                  mt-2
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  font-medium
                  text-[#7B6556]
                ">

                <SearchLoadingSpinner />

                <span>
                  Searching more brands, retailers,
                  and prices…
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          ">

          {supportsSupplementGrouping && (
            <label
              className="
                flex
                h-[44px]
                items-center
                gap-2
                rounded-[8px]
                border
                border-[#E7DFD6]
                bg-white
                px-4
                text-[13px]
                text-[#667074]
                shadow-[0_1px_4px_rgba(36,49,53,0.03)]
              ">

              <span>
                Group by:
              </span>

              <select
                value={
                  groupBySupplement
                    ? "supplement"
                    : "all"
                }
                onChange={
                  (event) =>
                    setGroupBySupplement(
                      event.target.value ===
                        "supplement"
                    )
                }
                aria-label="Group search results"
                className="
                  cursor-pointer
                  appearance-none
                  bg-transparent
                  pr-6
                  font-semibold
                  text-[#081620]
                  outline-none
                "
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, transparent 50%, #667074 50%), linear-gradient(135deg, #667074 50%, transparent 50%)",

                  backgroundPosition:
                    "calc(100% - 8px) 50%, calc(100% - 3px) 50%",

                  backgroundSize:
                    "5px 5px, 5px 5px",

                  backgroundRepeat:
                    "no-repeat",
                }}>

                <option value="supplement">
                  Supplement
                </option>

                <option value="all">
                  All Products
                </option>
              </select>
            </label>
          )}

          <label
            className="
              flex
              h-[44px]
              items-center
              gap-2
              rounded-[8px]
              border
              border-[#E7DFD6]
              bg-white
              px-4
              text-[13px]
              text-[#667074]
              shadow-[0_1px_4px_rgba(36,49,53,0.03)]
            ">

            <span>
              Sort by:
            </span>

            <select
              value={
                filters.sort
              }
              onChange={
                (event) =>
                  changeSort(
                    event.target
                      .value as
                      SearchSortOption
                  )
              }
              aria-label="Sort products"
              className="
                cursor-pointer
                appearance-none
                bg-transparent
                pr-6
                font-semibold
                text-[#081620]
                outline-none
              "
              style={{
                backgroundImage:
                  "linear-gradient(45deg, transparent 50%, #667074 50%), linear-gradient(135deg, #667074 50%, transparent 50%)",

                backgroundPosition:
                  "calc(100% - 8px) 50%, calc(100% - 3px) 50%",

                backgroundSize:
                  "5px 5px, 5px 5px",

                backgroundRepeat:
                  "no-repeat",
              }}>

              <option value="best-match">
                Best Match
              </option>

              <option value="quality">
                Highest Quality
              </option>

              <option value="value">
                Best Value
              </option>

              <option value="price-low">
                Lowest Monthly Cost
              </option>

              <option value="bottle-price-low">
                Lowest Bottle Price
              </option>
            </select>
          </label>
        </div>
      </div>

      {filteredProducts.length >
      0 ? (
        <div
          className="
            overflow-hidden
            rounded-[10px]
            border
            border-[#EEE7DF]
            bg-white
          ">

          <div
            className="
              hidden
              min-h-[48px]
              grid-cols-[minmax(0,1.65fr)_minmax(155px,0.68fr)_minmax(190px,0.82fr)]
              items-center
              border-b
              border-[#EEE7DF]
              bg-white
              lg:grid
            ">

            <div
              className="
                pl-[128px]
                pr-5
                text-[13px]
                font-semibold
                text-[#081620]
              ">

              Product &amp; Quality
            </div>

            <div
              className="
                border-l
                border-[#F0E9E1]
                px-5
                text-[13px]
                font-semibold
                text-[#081620]
              ">

              Buy Bottle

              <span
                className="
                  ml-1
                  font-medium
                  text-[#596366]
                ">

                <br />
                Other Retailers
              </span>
            </div>

            <div
              className="
                border-l
                border-[#F0E9E1]
                px-5
                text-[13px]
                font-semibold
                text-[#8C1D40]
              ">

              Add to VidaPouch

              <span
                className="
                  block
                  text-[10px]
                  font-medium
                  text-[#6A7174]
                ">

                Ships in your daily pouch
              </span>
            </div>
          </div>

          <div>
            {shouldGroupBySupplement &&
            allGroupedProducts.length >
              0 ? (
              allGroupedProducts.map(
                (
                  group
                ) => (
                  <div
                    key={
                      group.category.id
                    }>

                    <SupplementSectionHeader
                      name={
                        group.category
                          .displayName
                      }
                      reason={
                        group.category
                          .reason
                      }
                      productCount={
                        group.products
                          .length
                      }
                      expanded={
                        expandedSupplementSections.has(
                          group.category.id
                        )
                      }
                      onToggle={
                        () => {
                          setExpandedSupplementSections(
                            (
                              current
                            ) => {
                              const next =
                                new Set(
                                  current
                                );

                              if (
                                next.has(
                                  group.category.id
                                )
                              ) {
                                next.delete(
                                  group.category.id
                                );
                              } else {
                                next.add(
                                  group.category.id
                                );
                              }

                              return next;
                            }
                          );
                        }
                      }
                    />

                    {expandedSupplementSections.has(
                      group.category.id
                    ) && (
                      <>
                        {(
                          showAllSupplementResults.has(
                            group.category.id
                          )
                            ? group.products
                            : group.products.slice(
                                0,
                                INITIAL_VISIBLE_RESULTS
                              )
                        ).map(
                          (
                            product
                          ) => (
                            <ProductCard
                              key={`${product.brand}-${product.productName}`}
                              product={
                                product
                              }
                              isInPouch={
                                pouchItems.some(
                                  (
                                    item
                                  ) =>
                                    item.id ===
                                    (
                                      product
                                        .representativeProduct
                                        .shoppingProductId ??
                                      `${product.brand}-${product.productName}`
                                    )
                                )
                              }
                              selectedPlan={
                                productCardPlan
                              }
                              selectedSupplementCount={
                                pouchItems.length
                              }
                              onAddToPouch={
                                onAddToPouch
                              }
                            />
                          )
                        )}

                        {group.products.length >
                          INITIAL_VISIBLE_RESULTS &&
                          !showAllSupplementResults.has(
                            group.category.id
                          ) && (
                            <div
                              className="
                                border-t
                                border-[#EEE7DF]
                                bg-white
                                px-5
                                py-4
                                text-center
                              ">

                              <button
                                type="button"
                                onClick={
                                  () => {
                                    setShowAllSupplementResults(
                                      (
                                        current
                                      ) => {
                                        const next =
                                          new Set(
                                            current
                                          );

                                        next.add(
                                          group.category.id
                                        );

                                        return next;
                                      }
                                    );
                                  }
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  text-[13px]
                                  font-semibold
                                  text-[#081620]
                                  transition
                                  hover:text-[#8C1D40]
                                ">

                                See{" "}
                                {group.products.length -
                                  INITIAL_VISIBLE_RESULTS}{" "}
                                more{" "}
                                {group.category.displayName}{" "}
                                results

                                <span
                                  aria-hidden="true"
                                  className="text-[17px]">

                                  ↓
                                </span>
                              </button>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                )
              )
            ) : (
              visibleProducts.map(
                (
                  product
                ) => (
                  <ProductCard
                    key={`${product.brand}-${product.productName}`}
                    product={
                      product
                    }
                    isInPouch={
                      pouchItems.some(
                        (
                          item
                        ) =>
                          item.id ===
                          (
                            product
                              .representativeProduct
                              .shoppingProductId ??
                            `${product.brand}-${product.productName}`
                          )
                      )
                    }
                    selectedPlan={
                      productCardPlan
                    }
                    selectedSupplementCount={
                      pouchItems.length
                    }
                    onAddToPouch={
                      onAddToPouch
                    }
                  />
                )
              )
            )}
          </div>

          {loadingMore && (
            <div
              role="status"
              aria-live="polite"
              className="
                flex
                items-center
                justify-center
                gap-3
                border-t
                border-[#EEE7DF]
                bg-[#FCFAF8]
                px-5
                py-5
              ">

              <SearchLoadingSpinner />

              <div className="text-left">
                <p
                  className="
                    text-[12px]
                    font-semibold
                    text-[#384145]
                  ">

                  Loading more products
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10.5px]
                    text-[#737C7F]
                  ">

                  New results will appear automatically
                  when the remaining searches finish.
                </p>
              </div>
            </div>
          )}

          {!shouldGroupBySupplement &&
            hiddenResultCount >
              0 && (
              <div
                className="
                  border-t
                  border-[#EEE7DF]
                  bg-white
                  px-5
                  py-4
                  text-center
                ">

                <button
                  type="button"
                  onClick={
                    showAllResults
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-[13px]
                    font-semibold
                    text-[#081620]
                    transition
                    hover:text-[#8C1D40]
                  ">

                  See all{" "}
                  {filteredProducts.length}{" "}
                  {loadingMore
                    ? "loaded results"
                    : "results"}

                  <span
                    aria-hidden="true"
                    className="text-[17px]">

                    ↓
                  </span>
                </button>

                <p
                  className="
                    mt-1
                    text-[10px]
                    text-[#7A8386]
                  ">

                  {hiddenResultCount} more product
                  {hiddenResultCount !==
                  1
                    ? "s"
                    : ""}
                </p>
              </div>
            )}
        </div>
      ) : loadingMore ? (
        <div
          role="status"
          aria-live="polite"
          className="
            flex
            min-h-[180px]
            items-center
            justify-center
            gap-3
            rounded-[10px]
            border
            border-[#EEE7DF]
            bg-[#FCFAF8]
            px-8
            py-12
          ">

          <SearchLoadingSpinner />

          <div>
            <p
              className="
                text-[13px]
                font-semibold
                text-[#384145]
              ">

              Loading more products
            </p>

            <p
              className="
                mt-1
                text-[11px]
                text-[#737C7F]
              ">

              Searching more brands, retailers,
              and prices…
            </p>
          </div>
        </div>
      ) : (
        <div
          className="
            rounded-[10px]
            border
            border-[#EEE7DF]
            bg-white
            px-8
            py-16
            text-center
          ">

          <h3
            className="
              text-[26px]
              text-[#081620]
            "
            style={{
              fontFamily:
                'Georgia, "Times New Roman", serif',
            }}>

            No matching products
          </h3>

          <p
            className="
              mt-3
              text-[#667074]
            ">

            Clear one or more filters to see
            additional products.
          </p>
        </div>
      )}
    </div>
  );
}
