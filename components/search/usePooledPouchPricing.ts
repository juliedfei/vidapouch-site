"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  SearchPouchItem,
  SearchPouchPooledPricing,
} from "./types/searchPouch";

import {
  getSearchPlan,
} from "./types/searchPlan";

import type {
  SearchPlanSelection,
} from "./types/searchPlan";

type UsePooledPouchPricingInput = {
  selectedPlanId:
    SearchPlanSelection;

  pouchItems:
    SearchPouchItem[];
};

type UsePooledPouchPricingResult = {
  pricing:
    SearchPouchPooledPricing | null;

  loading:
    boolean;

  error:
    string | null;

  refresh:
    () => void;
};

type PricingApiErrorResponse = {
  error?:
    unknown;
};

function isRecord(
  value:
    unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function isFiniteNumber(
  value:
    unknown
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value
    )
  );
}

function isNullableString(
  value:
    unknown
): value is string | null {
  return (
    typeof value ===
      "string" ||
    value ===
      null
  );
}

function isPooledPricingStatus(
  value:
    unknown
): value is SearchPouchPooledPricing["status"] {
  return (
    value ===
      "included" ||
    value ===
      "adjustment" ||
    value ===
      "undetermined" ||
    value ===
      "disabled"
  );
}

function isPricingConfidence(
  value:
    unknown
): value is SearchPouchPooledPricing["confidence"] {
  return (
    value ===
      "confirmed" ||
    value ===
      "partial" ||
    value ===
      "undetermined"
  );
}

function isPricingLine(
  value:
    unknown
): value is SearchPouchPooledPricing["lines"][number] {
  if (
    !isRecord(
      value
    )
  ) {
    return false;
  }

  return (
    typeof value.label ===
      "string" &&
    isFiniteNumber(
      value.monthlyAmount
    ) &&
    (
      value.description ===
        undefined ||
      typeof value.description ===
        "string"
    )
  );
}

function isSearchPouchPooledPricing(
  value:
    unknown
): value is SearchPouchPooledPricing {
  if (
    !isRecord(
      value
    )
  ) {
    return false;
  }

  return (
    isPooledPricingStatus(
      value.status
    ) &&
    typeof value.planKey ===
      "string" &&
    typeof value.planName ===
      "string" &&
    isFiniteNumber(
      value.planMonthlyPrice
    ) &&
    isFiniteNumber(
      value.itemCount
    ) &&
    isFiniteNumber(
      value.estimatedMonthlyProductCost
    ) &&
    isFiniteNumber(
      value.monthlyPriceAdjustment
    ) &&
    isFiniteNumber(
      value.totalMonthlyPrice
    ) &&
    isPricingConfidence(
      value.confidence
    ) &&
    isFiniteNumber(
      value.unresolvedItemCount
    ) &&
    Array.isArray(
      value.lines
    ) &&
    value.lines.every(
      isPricingLine
    ) &&
    typeof value.customerMessage ===
      "string" &&
    isNullableString(
      value.pricingVersionId
    ) &&
    typeof value.calculatedAt ===
      "string"
  );
}

function getApiErrorMessage({
  responseStatus,
  responseBody,
}: {
  responseStatus:
    number;

  responseBody:
    unknown;
}) {
  if (
    isRecord(
      responseBody
    )
  ) {
    const candidate =
      (
        responseBody as
          PricingApiErrorResponse
      ).error;

    if (
      typeof candidate ===
        "string" &&
      candidate.trim().length >
        0
    ) {
      return candidate;
    }
  }

  if (
    responseStatus ===
      409
  ) {
    return "The selected plan no longer supports the current number of supplements.";
  }

  if (
    responseStatus >=
      500
  ) {
    return "Pricing is temporarily unavailable.";
  }

  return "The current pouch could not be priced.";
}

function buildBasePlanFallback({
  selectedPlanId,
  pouchItems,
}: {
  selectedPlanId:
    SearchPlanSelection;

  pouchItems:
    SearchPouchItem[];
}): SearchPouchPooledPricing | null {
  const plan =
    getSearchPlan(
      selectedPlanId
    );

  if (
    plan ===
      null
  ) {
    return null;
  }

  return {
    status:
      "included",

    planKey:
      plan.id,

    planName:
      plan.name,

    planMonthlyPrice:
      plan.monthlyPrice,

    itemCount:
      pouchItems.length,

    estimatedMonthlyProductCost:
      0,

    monthlyPriceAdjustment:
      0,

    planOverageFee:
      0,

    planOverageTooltip:
      "Higher-cost product selections or increased daily quantities may increase your Plan Overage.",

    totalMonthlyPrice:
      plan.monthlyPrice,

    confidence:
      "undetermined",

    unresolvedItemCount:
      0,

    lines: [
      {
        label:
          `${plan.name} Plan`,

        monthlyAmount:
          plan.monthlyPrice,
      },

      {
        label:
          "Plan Overage",

        monthlyAmount:
          0,
      },
    ],

    customerMessage:
      "",

    pricingVersionId:
      null,

    calculatedAt:
      new Date()
        .toISOString(),
  };
}

/*
 * Loads pooled pricing without ever leaving the
 * customer with no usable monthly total.
 *
 * If the pricing endpoint fails, the UI falls back
 * to the selected plan price with a $0 Plan Overage.
 * Checkout performs its own server-side attempt and
 * applies the same fail-open pricing policy.
 */
export function usePooledPouchPricing({
  selectedPlanId,
  pouchItems,
}: UsePooledPouchPricingInput):
  UsePooledPouchPricingResult {
  const [
    pricing,
    setPricing,
  ] =
    useState<
      SearchPouchPooledPricing | null
    >(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    refreshVersion,
    setRefreshVersion,
  ] =
    useState(
      0
    );

  const latestRequestId =
    useRef(
      0
    );

  function refresh() {
    setRefreshVersion(
      (current) =>
        current +
        1
    );
  }

  useEffect(
    () => {
      if (
        selectedPlanId ===
          null
      ) {
        latestRequestId
          .current +=
          1;

        setPricing(
          null
        );

        setLoading(
          false
        );

        setError(
          null
        );

        return;
      }

      const fallbackPricing =
        buildBasePlanFallback({
          selectedPlanId,

          pouchItems,
        });

      /*
       * Keep a usable price visible immediately while
       * the richer overage calculation refreshes.
       */
      setPricing(
        fallbackPricing
      );

      const controller =
        new AbortController();

      const requestId =
        latestRequestId
          .current +
        1;

      latestRequestId.current =
        requestId;

      async function loadPricing() {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await fetch(
              "/api/vidapouch/pooled-pricing",
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    selectedPlanId,

                    pouchItems,
                  }),

                cache:
                  "no-store",

                signal:
                  controller.signal,
              }
            );

          let responseBody:
            unknown;

          try {
            responseBody =
              await response
                .json();
          } catch {
            responseBody =
              null;
          }

          if (
            requestId !==
            latestRequestId
              .current
          ) {
            return;
          }

          if (
            !response.ok
          ) {
            throw new Error(
              getApiErrorMessage({
                responseStatus:
                  response.status,

                responseBody,
              })
            );
          }

          if (
            !isSearchPouchPooledPricing(
              responseBody
            )
          ) {
            throw new Error(
              "The pricing service returned an invalid response."
            );
          }

          setPricing(
            responseBody
          );

          setError(
            null
          );
        } catch (
          requestError
        ) {
          if (
            controller.signal
              .aborted
          ) {
            return;
          }

          if (
            requestId !==
            latestRequestId
              .current
          ) {
            return;
          }

          console.error(
            "Unable to refresh pooled VidaPouch pricing; using base plan fallback:",
            requestError
          );

          setPricing(
            fallbackPricing
          );

          /*
           * Do not surface an internal pricing failure
           * to the customer or disable the funnel.
           */
          setError(
            null
          );
        } finally {
          if (
            !controller.signal
              .aborted &&
            requestId ===
              latestRequestId
                .current
          ) {
            setLoading(
              false
            );
          }
        }
      }

      void loadPricing();

      return () => {
        controller.abort();
      };
    },
    [
      selectedPlanId,
      pouchItems,
      refreshVersion,
    ]
  );

  return {
    pricing,

    loading,

    error,

    refresh,
  };
}
