import type {
  PouchTiming,
  Supplement,
 } from "@/components/routine-builder/types";
 
 import type {
  PricingStrategy,
 } from "@/lib/pricing/pricingStrategy";
 
 import type {
  CheckoutIssue,
  CheckoutPouch,
 } from "./checkoutTypes";
 
 import {
  buildSupplementSummary,
 } from "./buildSupplementSummary";
 
 type BuildPouchSummaryInput = {
  timing: PouchTiming;
  supplements: Supplement[];
  pricingStrategy: PricingStrategy;
 };
 
 export type BuildPouchSummaryResult = {
  pouch: CheckoutPouch;
  issues: CheckoutIssue[];
 };
 
 function getPouchLabel(
  timing: PouchTiming
 ) {
  return timing === "morning"
    ? "Morning Pouch"
    : "Evening Pouch";
 }
 
 function roundCurrency(
  value: number
 ) {
  return Math.round(value * 100) / 100;
 }
 
 export async function buildPouchSummary({
  timing,
  supplements,
  pricingStrategy,
 }: BuildPouchSummaryInput): Promise<BuildPouchSummaryResult> {
 
  const checkoutSupplements = [];
 
  const issues: CheckoutIssue[] = [];
 
  for (
    let index = 0;
    index < supplements.length;
    index++
  ) {
    const result =
      await buildSupplementSummary({
        supplement: supplements[index],
        timing,
        index,
        pricingStrategy,
      });
 
    checkoutSupplements.push(
      result.supplement
    );
 
    issues.push(...result.issues);
  }
 
  /*
   * This is intentionally the BASE subtotal.
   *
   * buildCheckoutSummary() performs the
   * concierge allocation later and rebuilds
   * the pouch totals after every supplement
   * has received its share of the hidden
   * concierge fee.
   */
  const supplementSubtotal =
    roundCurrency(
      checkoutSupplements.reduce(
        (total, supplement) =>
          total +
          supplement.customerMonthlyPrice,
        0
      )
    );
 
  const pouch: CheckoutPouch = {
    timing,
 
    label: getPouchLabel(
      timing
    ),
 
    supplements:
      checkoutSupplements,
 
    supplementSubtotal,
  };
 
  return {
    pouch,
    issues,
  };
 }
 