import type {
  SearchProductUnitLabel,
  SearchVitaPouchPricingSource,
  SearchVitaPouchPricingTier,
 } from "@/lib/search/searchProductOption";
 
 /*
 * Canonical VidaPouch names.
 *
 * Existing SearchVitaPouch exports remain aliased
 * temporarily so older files continue to compile.
 */
 export type SearchVidaPouchPricingSource =
  SearchVitaPouchPricingSource;
 
 export type SearchVidaPouchPricingTier =
  SearchVitaPouchPricingTier;
 
 export type SearchPouchTiming =
  | "morning"
  | "evening";
 
 export type SearchPouchTimingPreference =
  | "vidapouch"
  | "morning"
  | "evening";
 
 export type SearchPouchPricingStatus =
  | "included"
  | "add-on"
  | "undetermined";
 
 /*
 * Legacy item-level reasons.
 *
 * These remain only for compatibility with files
 * written under the former per-product model.
 *
 * Customer-facing pricing must not display separate
 * charges beside individual products.
 */
 export type SearchPouchAddOnReason =
  | "premium-product"
  | "extra-quantity";
 
 /*
 * Legacy item-level display line.
 *
 * New pooled pricing must leave these lines empty.
 */
 export type SearchPouchAddOnLine = {
  reason:
    SearchPouchAddOnReason;
 
  label:
    string;
 
  monthlyAmount:
    number;
 
  description?:
    string;
 };
 
 /*
 * Legacy per-product pricing record.
 *
 * This now carries only internal product-cost input
 * and audit metadata into the pooled calculation.
 *
 * It does not determine a customer-facing charge for
 * an individual vitamin.
 */
 export type SearchPouchPricing = {
  status:
    SearchPouchPricingStatus;
 
  productTier:
    SearchVidaPouchPricingTier;
 
  /*
   * Estimated monthly cost for this product at the
   * customer's selected daily quantity.
   */
  monthlyProductCost:
    number;
 
  /*
   * Deprecated at the item level.
   *
   * The confidential allowance belongs to the
   * complete selected plan.
   */
  includedCostAllowance:
    number;
 
  /*
   * Baseline monthly quantity before the customer
   * increases the daily quantity.
   */
  includedMonthlyUnitCount:
    number;
 
  /*
   * Deprecated customer-facing item charges.
   *
   * These must remain zero. The complete pouch
   * receives one combined Plan Overage instead.
   */
  premiumProductAddOn:
    number;
 
  extraQuantityAddOn:
    number;
 
  totalMonthlyAddOn:
    number;
 
  addOnLines:
    SearchPouchAddOnLine[];
 
  source:
    SearchVidaPouchPricingSource;
 
  reason?:
    string;
 };
 
 export type SearchPouchItem = {
  /*
   * Stable identity used to prevent the same exact
   * shopping product from being added twice.
   */
  id:
    string;
 
  shoppingProductId:
    string | null;
 
  productName:
    string;
 
  brand:
    string;
 
  dosage:
    string;
 
  form:
    string | null;
 
  unitLabel:
    SearchProductUnitLabel;
 
  unitsPerDay:
    number;
 
  monthlyUnitCount:
    number;
 
  /*
   * Estimated monthly product cost at the selected
   * daily quantity.
   *
   * This is internal calculation input. It is not a
   * customer-facing price for the individual vitamin.
   */
  monthlyPrice:
    number;
 
  /*
   * Daily quantity before the customer changes the
   * active dose selection.
   */
  baselineUnitsPerDay?:
    number;
 
  /*
   * Estimated monthly product cost before a higher
   * daily quantity is selected.
   */
  baselineMonthlyPrice?:
    number;
 
  /*
   * Internal product-cost and audit information.
   *
   * The final customer price is calculated only
   * from the complete pouch and selected plan.
   */
  pricing?:
    SearchPouchPricing;
 
  bottlePrice:
    number;
 
  retailer:
    string;
 
  imageUrl:
    string | null;
 
  vitaPouchScore:
    number | null;
 
  certifications:
    string[];
 
  qualityClaims:
    string[];
 
  timing:
    SearchPouchTiming;
 
  /*
   * Original recommendation from the VidaPouch
   * timing engine.
   */
  recommendedTiming:
    SearchPouchTiming;
 
  /*
   * "vidapouch" means the timing engine selected
   * the current pouch section.
   *
   * "morning" or "evening" means the customer
   * manually changed it.
   */
  timingPreference:
    SearchPouchTimingPreference;
 
  timingReason:
    string;
 };
 
 /*
 * Indicates whether all product-cost inputs needed
 * for a reliable pooled calculation are available.
 */
 export type SearchPouchCostConfidence =
  | "confirmed"
  | "partial"
  | "undetermined";
 
 /*
 * Customer-safe pricing state for the complete
 * selected plan and pouch.
 *
 * "disabled" means real Plan Overage calculations
 * have not yet been activated in the database.
 */
 export type SearchPouchPooledPricingStatus =
  | "included"
  | "adjustment"
  | "undetermined"
  | "disabled";
 
 /*
 * Internal contribution from one selected product
 * to the complete pooled pouch cost.
 *
 * This type contains no plan allowance, individual
 * surcharge, or customer-facing product price.
 */
 export type SearchPouchCostContribution = {
  pouchItemId:
    string;
 
  productName:
    string;
 
  brand:
    string;
 
  unitsPerDay:
    number;
 
  monthlyUnitCount:
    number;
 
  baselineMonthlyCost:
    number;
 
  selectedMonthlyCost:
    number;
 
  /*
   * Internal diagnostic value showing how much of
   * the selected product cost came from a higher
   * daily quantity.
   *
   * It is not shown as a separate customer fee.
   */
  quantityCostIncrease:
    number;
 
  pricingSource:
    SearchVidaPouchPricingSource;
 
  confidence:
    SearchPouchCostConfidence;
 
  reason?:
    string;
 };
 
 /*
 * Customer-facing pricing summary line.
 *
 * The intended visible lines are:
 *
 * - Essential, Complete, or Premier Plan
 * - Plan Overage
 *
 * The Plan Overage information icon is rendered
 * directly beside its label by the summary component.
 */
 export type SearchPouchPooledPricingLine = {
  label:
    string;
 
  monthlyAmount:
    number;
 
  /*
   * Optional general description for a line.
   *
   * Do not use this field for the Plan Overage
   * explanation because that explanation belongs in
   * the dedicated tooltip field below.
   */
  description?:
    string;
 };
 
 /*
 * Customer-safe result for the complete selected
 * VidaPouch plan and all pouch items.
 *
 * Confidential pooled allowances, sourcing buffers,
 * raw product costs, and internal margin calculations
 * are intentionally excluded.
 */
 export type SearchPouchPooledPricing = {
  status:
    SearchPouchPooledPricingStatus;
 
  planKey:
    string;
 
  planName:
    string;
 
  planMonthlyPrice:
    number;
 
  itemCount:
    number;
 
  /*
   * Combined internal monthly product-cost estimate.
   *
   * This should not be displayed as individual
   * vitamin pricing in the customer interface.
   */
  estimatedMonthlyProductCost:
    number;
 
  /*
   * Backward-compatible field used by the current
   * pooled calculator and API response.
   *
   * It represents the same combined amount as
   * planOverageFee.
   */
  monthlyPriceAdjustment:
    number;
 
  /*
   * Canonical customer-facing Plan Overage for the
   * complete pouch.
   *
   * This single amount may reflect:
   *
   * - higher-cost or premium product selections;
   * - increased capsules, tablets, softgels, gummies,
   *   servings, or other daily quantities;
   * - both causes together.
   */
  planOverageFee?:
    number;
 
  /*
   * Explanation revealed through the information
   * icon located immediately beside "Plan Overage."
   *
   * This is not rendered as always-visible text.
   */
  planOverageTooltip?:
    string;
 
  /*
   * Plan price plus the combined Plan Overage.
   */
  totalMonthlyPrice:
    number;
 
  confidence:
    SearchPouchCostConfidence;
 
  unresolvedItemCount:
    number;
 
  lines:
    SearchPouchPooledPricingLine[];
 
  customerMessage:
    string;
 
  /*
   * Identifies the database pricing version used
   * without revealing confidential pricing inputs.
   */
  pricingVersionId:
    string | null;
 
  calculatedAt:
    string;
 };
 
 /*
 * Returns the canonical combined Plan Overage while
 * preserving compatibility with responses created
 * before planOverageFee was added.
 */
 export function getSearchPouchPlanOverageFee(
  pricing:
    SearchPouchPooledPricing
 ) {
  return (
    pricing.planOverageFee ??
    pricing.monthlyPriceAdjustment
  );
 }
 
 /*
 * Returns the customer explanation for the Plan
 * Overage information icon.
 *
 * The icon itself will sit directly beside the
 * "Plan Overage" label.
 */
 export function getSearchPouchPlanOverageTooltip(
  pricing:
    SearchPouchPooledPricing
 ) {
  return (
    pricing.planOverageTooltip ??
    "Higher-cost product selections or increased daily quantities may increase your Plan Overage."
  );
 }