"use client";

import {
  useId,
  useState,
} from "react";

import {
  getSearchPouchPlanOverageFee,
  getSearchPouchPlanOverageTooltip,
} from "./types/searchPouch";

import type {
  SearchPouchPooledPricing,
} from "./types/searchPouch";

type PooledPricingSummaryProps = {
  pricing:
    SearchPouchPooledPricing | null;

  loading:
    boolean;

  error:
    string | null;
};

function formatPrice(
  value:
    number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",

      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    }
  ).format(
    value
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="
        h-[14px]
        w-[14px]
      ">

      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M12 10.5v5M12 7.5h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PriceLine({
  label,
  amount,
  emphasized = false,
  children,
}: {
  label:
    string;

  amount:
    number;

  emphasized?:
    boolean;

  children?:
    React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
      ">

      <div
        className="
          flex
          min-w-0
          items-center
          gap-1
        ">

        <span
          className={
            emphasized
              ? `
                  text-[13px]
                  font-semibold
                  text-[#2A211E]
                `
              : `
                  text-[11px]
                  text-[#6E6862]
                `
          }>

          {label}
        </span>

        {children}
      </div>

      <span
        className={
          emphasized
            ? `
                shrink-0
                text-[20px]
                font-bold
                tabular-nums
                text-[#7D0E1C]
              `
            : `
                shrink-0
                text-[12px]
                font-semibold
                tabular-nums
                text-[#2A211E]
              `
        }>

        {formatPrice(
          amount
        )}
      </span>
    </div>
  );
}

function PlanOverageTooltip({
  message,
}: {
  message:
    string;
}) {
  const tooltipId =
    useId();

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(
      false
    );

  return (
    <span
      className="
        group
        relative
        inline-flex
        shrink-0
        items-center
      ">

      <button
        type="button"
        aria-label="What affects the Plan Overage?"
        aria-describedby={
          tooltipId
        }
        aria-expanded={
          isOpen
        }
        onClick={() =>
          setIsOpen(
            (current) =>
              !current
          )
        }
        onBlur={() =>
          setIsOpen(
            false
          )
        }
        className="
          inline-flex
          h-[18px]
          w-[18px]
          items-center
          justify-center
          rounded-full
          text-[#817A74]
          transition
          hover:bg-[#EEE8E2]
          hover:text-[#4D4640]
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#B69A7A]
          focus-visible:ring-offset-1
        ">

        <InfoIcon />
      </button>

      <span
        id={
          tooltipId
        }
        role="tooltip"
        className={`
          absolute
          bottom-[calc(100%+8px)]
          left-1/2
          z-50
          w-[230px]
          -translate-x-1/2
          rounded-[7px]
          border
          border-[#D9CEC3]
          bg-[#2F2926]
          px-3
          py-2.5
          text-left
          text-[10px]
          font-normal
          leading-[1.5]
          text-white
          shadow-[0_8px_24px_rgba(44,35,30,0.18)]
          transition
          before:absolute
          before:left-1/2
          before:top-full
          before:-translate-x-1/2
          before:border-[6px]
          before:border-transparent
          before:border-t-[#2F2926]
          ${
            isOpen
              ? `
                  visible
                  opacity-100
                `
              : `
                  invisible
                  opacity-0
                  group-hover:visible
                  group-hover:opacity-100
                  group-focus-within:visible
                  group-focus-within:opacity-100
                `
          }
        `}>

        {message}
      </span>
    </span>
  );
}

function PricingBreakdown({
  pricing,
}: {
  pricing:
    SearchPouchPooledPricing;
}) {
  const planOverageFee =
    getSearchPouchPlanOverageFee(
      pricing
    );

  const planOverageTooltip =
    getSearchPouchPlanOverageTooltip(
      pricing
    );

  return (
    <div className="space-y-3">
      <PriceLine
        label={`${pricing.planName} Plan`}
        amount={
          pricing.planMonthlyPrice
        }
      />

      <PriceLine
        label="Plan Overage"
        amount={
          planOverageFee
        }>

        <PlanOverageTooltip
          message={
            planOverageTooltip
          }
        />
      </PriceLine>

      <div
        className="
          border-t
          border-[#E5DCD2]
        "
      />

      <PriceLine
        label="Monthly Total"
        amount={
          pricing.totalMonthlyPrice
        }
        emphasized
      />
    </div>
  );
}

export default function PooledPricingSummary({
  pricing,
  loading:
    _loading,
  error:
    _error,
}: PooledPricingSummaryProps) {
  /*
   * Pricing failures are intentionally not exposed
   * in the customer funnel. The pricing hook supplies
   * the plan-price fallback whenever the richer
   * calculation is unavailable.
   */
  if (
    pricing ===
      null
  ) {
    return null;
  }

  return (
    <PricingBreakdown
      pricing={
        pricing
      }
    />
  );
}
