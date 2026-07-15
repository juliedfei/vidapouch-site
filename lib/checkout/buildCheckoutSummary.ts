import {
    buildPouchSummary,
   } from "./buildPouchSummary";
   
   import {
    calculateServiceFee,
   } from "./calculateServiceFee";
   
   import type {
    CheckoutPlan,
    CheckoutSummary,
    CheckoutIssue,
    CheckoutSupplement,
   } from "./checkoutTypes";
   
   function roundCurrency(
    value: number
   ) {
    return Math.round(value * 100) / 100;
   }
   
   export async function buildCheckoutSummary(
    plan: CheckoutPlan
   ): Promise<CheckoutSummary> {
   
    const morningResult =
      await buildPouchSummary({
        timing: "morning",
        supplements: plan.morning,
      });
   
    const eveningResult =
      await buildPouchSummary({
        timing: "evening",
        supplements: plan.evening,
      });
   
    const service =
      calculateServiceFee(plan);
   
    const activeSupplements: CheckoutSupplement[] = [
      ...morningResult.pouch.supplements,
      ...eveningResult.pouch.supplements,
    ];
   
    const issues: CheckoutIssue[] = [
      ...morningResult.issues,
      ...eveningResult.issues,
    ];
   
    const supplementSubtotal =
      roundCurrency(
        morningResult.pouch
          .supplementSubtotal +
          eveningResult.pouch
            .supplementSubtotal
      );
   
    const totalDue =
      roundCurrency(
        supplementSubtotal +
          service.fee
      );
   
    const canCheckout =
      activeSupplements.length > 0 &&
      !issues.some(
        (issue) => issue.blocking
      );
   
    return {
   
      morning:
        morningResult.pouch,
   
      evening:
        eveningResult.pouch,
   
      activeSupplements,
   
      removedSupplements: [],
   
      service,
   
      costs: {
   
        supplementSubtotal,
   
        serviceFee:
          service.fee,
   
        totalDue,
   
        currency: "USD",
   
      },
   
      issues,
   
      canCheckout,
   
      calculatedAt:
        new Date().toISOString(),
   
    };
   
   }