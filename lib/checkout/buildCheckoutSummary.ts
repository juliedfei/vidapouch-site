import {
  getPricingStrategy,
 } from "@/lib/pricing/getPricingStrategy";
 
 import {
  buildPouchSummary,
 } from "./buildPouchSummary";
 
 import {
  calculateServiceFee,
 } from "./calculateServiceFee";
 
 import type {
  CheckoutIssue,
  CheckoutPlan,
  CheckoutPouch,
  CheckoutSummary,
  CheckoutSupplement,
 } from "./checkoutTypes";
 
 function roundCurrency(
  value: number
 ) {
  return Math.round(
    value * 100
  ) / 100;
 }
 
 function clampAmount({
  value,
  minimum,
  maximum,
 }: {
  value: number;
  minimum: number;
  maximum: number;
 }) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
 }
 
 function getHiddenServiceAmount({
  serviceFee,
  serviceAllocationMode,
  fixedServiceAllocation,
  serviceAllocationPercent,
 }: {
  serviceFee: number;
  serviceAllocationMode:
    | "transparent"
    | "fixed"
    | "percentage"
    | "fully_bundled";
  fixedServiceAllocation: number;
  serviceAllocationPercent: number;
 }) {
  let requestedAmount = 0;
 
  switch (
    serviceAllocationMode
  ) {
    case "fixed":
      requestedAmount =
        fixedServiceAllocation;
      break;
 
    case "percentage":
      requestedAmount =
        serviceFee *
        serviceAllocationPercent;
      break;
 
    case "fully_bundled":
      requestedAmount =
        serviceFee;
      break;
 
    case "transparent":
    default:
      requestedAmount = 0;
      break;
  }
 
  /*
   * Never move more money into supplement
   * pricing than the actual concierge fee.
   */
  return roundCurrency(
    clampAmount({
      value:
        requestedAmount,
 
      minimum: 0,
 
      maximum:
        serviceFee,
    })
  );
 }
 
 function allocateServiceAmount({
  supplements,
  hiddenServiceAmount,
 }: {
  supplements:
    CheckoutSupplement[];
 
  hiddenServiceAmount:
    number;
 }) {
  if (
    supplements.length === 0 ||
    hiddenServiceAmount <= 0
  ) {
    return supplements.map(
      (supplement) => ({
        ...supplement,
 
        allocatedServiceAmount:
          0,
 
        customerMonthlyPrice:
          supplement
            .baseCustomerMonthlyPrice,
 
        displayedMonthlyPrice:
          supplement
            .baseCustomerMonthlyPrice,
      })
    );
  }
 
  /*
   * Work in cents so rounding does not
   * accidentally create or lose money.
   */
  const totalAllocationCents =
    Math.round(
      hiddenServiceAmount * 100
    );
 
  const baseAllocationCents =
    Math.floor(
      totalAllocationCents /
      supplements.length
    );
 
  const remainingCents =
    totalAllocationCents -
    (
      baseAllocationCents *
      supplements.length
    );
 
  return supplements.map(
    (
      supplement,
      index
    ) => {
      /*
       * Any leftover cents are distributed
       * one at a time across the first
       * supplements.
       *
       * Example:
       * $30 split across 7 supplements
       * remains exactly $30 after rounding.
       */
      const allocationCents =
        baseAllocationCents +
        (
          index <
          remainingCents
            ? 1
            : 0
        );
 
      const allocatedServiceAmount =
        allocationCents / 100;
 
      const displayedMonthlyPrice =
        roundCurrency(
          supplement
            .baseCustomerMonthlyPrice +
          allocatedServiceAmount
        );
 
      return {
        ...supplement,
 
        allocatedServiceAmount,
 
        customerMonthlyPrice:
          displayedMonthlyPrice,
 
        displayedMonthlyPrice,
      };
    }
  );
 }
 
 function rebuildPouch({
  pouch,
  allocatedSupplements,
 }: {
  pouch: CheckoutPouch;
  allocatedSupplements:
    CheckoutSupplement[];
 }): CheckoutPouch {
  const supplementById =
    new Map(
      allocatedSupplements.map(
        (supplement) => [
          supplement.id,
          supplement,
        ]
      )
    );
 
  const supplements =
    pouch.supplements.map(
      (supplement) =>
        supplementById.get(
          supplement.id
        ) ??
        supplement
    );
 
  const supplementSubtotal =
    roundCurrency(
      supplements.reduce(
        (
          total,
          supplement
        ) =>
          total +
          supplement
            .displayedMonthlyPrice,
        0
      )
    );
 
  return {
    ...pouch,
 
    supplements,
 
    supplementSubtotal,
  };
 }
 
 export async function buildCheckoutSummary(
  plan: CheckoutPlan
 ): Promise<CheckoutSummary> {
  /*
   * Load one pricing strategy for the
   * entire order.
   */
  const pricingStrategy =
    await getPricingStrategy();
 
  const [
    morningResult,
    eveningResult,
  ] = await Promise.all([
    buildPouchSummary({
      timing:
        "morning",
 
      supplements:
        plan.morning,
 
      pricingStrategy,
    }),
 
    buildPouchSummary({
      timing:
        "evening",
 
      supplements:
        plan.evening,
 
      pricingStrategy,
    }),
  ]);
 
  const originalService =
    calculateServiceFee(
      plan
    );
 
  const originalSupplements:
    CheckoutSupplement[] = [
      ...morningResult
        .pouch
        .supplements,
 
      ...eveningResult
        .pouch
        .supplements,
    ];
 
  const issues:
    CheckoutIssue[] = [
      ...morningResult.issues,
      ...eveningResult.issues,
    ];
 
  const hiddenServiceAmount =
    getHiddenServiceAmount({
      serviceFee:
        originalService.fee,
 
      serviceAllocationMode:
        pricingStrategy
          .serviceAllocationMode,
 
      fixedServiceAllocation:
        pricingStrategy
          .fixedServiceAllocation,
 
      serviceAllocationPercent:
        pricingStrategy
          .serviceAllocationPercent,
    });
 
  /*
   * Split the hidden amount evenly across
   * every active supplement in both pouches.
   */
  const activeSupplements =
    allocateServiceAmount({
      supplements:
        originalSupplements,
 
      hiddenServiceAmount,
    });
 
  const morning =
    rebuildPouch({
      pouch:
        morningResult.pouch,
 
      allocatedSupplements:
        activeSupplements,
    });
 
  const evening =
    rebuildPouch({
      pouch:
        eveningResult.pouch,
 
      allocatedSupplements:
        activeSupplements,
    });
 
  const visibleServiceFee =
    roundCurrency(
      originalService.fee -
      hiddenServiceAmount
    );
 
  const service = {
    ...originalService,
 
    fee:
      visibleServiceFee,
  };
 
  const supplementSubtotal =
    roundCurrency(
      morning
        .supplementSubtotal +
      evening
        .supplementSubtotal
    );
 
  const totalDue =
    roundCurrency(
      supplementSubtotal +
      visibleServiceFee
    );
 
  const canCheckout =
    activeSupplements.length >
      0 &&
    !issues.some(
      (issue) =>
        issue.blocking
    );
 
  return {
    morning,
 
    evening,
 
    activeSupplements,
 
    removedSupplements: [],
 
    service,
 
    costs: {
      supplementSubtotal,
 
      serviceFee:
        visibleServiceFee,
 
      totalDue,
 
      currency:
        "USD",
    },
 
    issues,
 
    canCheckout,
 
    calculatedAt:
      new Date()
        .toISOString(),
  };
 }
 