import type {
  SearchDosageUnit,
  SearchRetailProduct,
 } from "./searchRetailProduct";
 
 export type SearchProductScore = {
  overall:
    number | null;
 
  value:
    number | null;
 
  productQuality:
    number | null;
 
  dosageFit:
    number | null;
 
  retailerConfidence:
    number | null;
 
  dataCompleteness:
    number | null;
 };
 
 export type SearchDietaryPreferences = {
  vegan:
    boolean;
 
  vegetarian:
    boolean;
 
  glutenFree:
    boolean;
 
  dairyFree:
    boolean;
 
  soyFree:
    boolean;
 
  nonGmo:
    boolean;
 };
 
 export type SearchThirdPartyTesting = {
  thirdPartyTested:
    boolean;
 
  uspVerified:
    boolean;
 
  nsfCertified:
    boolean;
 
  consumerLabTested:
    boolean;
 
  informedChoice:
    boolean;
 };
 
 export type SearchProductClaims = {
  nsfCertified:
    boolean;
 
  uspVerified:
    boolean;
 
  thirdPartyTested:
    boolean;
 
  vegan:
    boolean;
 
  nonGmo:
    boolean;
 
  glutenFree:
    boolean;
 };
 
 export type SearchProductUnitLabel =
  | "capsule"
  | "tablet"
  | "caplet"
  | "softgel"
  | "gummy"
  | "serving"
  | "unit";
 
 /*
 * Customer-facing VidaPouch pricing
 * classification.
 *
 * "standard" means the product can be
 * included without a premium-product
 * surcharge at its baseline daily quantity.
 *
 * "premium" means the buffered underlying
 * monthly product cost exceeds the standard
 * VidaPouch allowance.
 *
 * "undetermined" means the product has not
 * yet been classified confidently.
 */
 export type SearchVidaPouchPricingTier =
  | "standard"
  | "premium"
  | "undetermined";
 
 /*
 * Identifies where the underlying product
 * cost came from.
 */
 export type SearchVidaPouchPricingSource =
  | "retail-estimate"
  | "wholesale"
  | "catalog"
  | "manual"
  | "undetermined";
 
 /*
 * Method used to turn vendor listings into
 * the internal monthly product-cost basis.
 */
 export type SearchVidaPouchCostBasisMethod =
  | "median-exact-listings"
  | "trimmed-average-exact-listings"
  | "average-exact-listings"
  | "lowest-qualified-listing"
  | "wholesale-cost"
  | "catalog-cost"
  | "manual"
  | "undetermined";
 
 /*
 * Optional pricing inputs used by the shared
 * VidaPouch add-on calculator.
 *
 * These are internal pricing inputs rather
 * than the customer's complete subscription
 * price.
 *
 * The calculator determines:
 *
 * - whether the product is included;
 * - premium-product add-on;
 * - higher daily-quantity add-on;
 * - combined monthly add-on.
 */
 export type SearchVidaPouchPricingInput = {
  /*
   * Product classification at its normal
   * included daily quantity.
   */
  tier:
    SearchVidaPouchPricingTier;
 
  /*
   * Monthly quantity considered the product's
   * normal included quantity.
   *
   * Examples:
   *
   * 30 capsules:
   * one capsule per day.
   *
   * 60 capsules:
   * two capsules per day.
   */
  includedMonthlyUnitCount:
    number;
 
  /*
   * Final buffered internal monthly product
   * cost at the normal included quantity.
   *
   * This is the value compared with the
   * standard monthly cost allowance.
   */
  includedMonthlyProductCost:
    number;
 
  /*
   * Maximum buffered monthly product cost
   * absorbed by the VidaPouch plan before a
   * premium-product add-on applies.
   *
   * Recommended initial configuration:
   * $8.00 per selected supplement.
   */
  standardMonthlyCostAllowance:
    number;
 
  /*
   * Cost source used for auditability and
   * future manager controls.
   */
  source:
    SearchVidaPouchPricingSource;
 
  /*
   * Method used to calculate the product's
   * internal baseline cost.
   *
   * Recommended default:
   * median-exact-listings.
   */
  costBasisMethod?:
    SearchVidaPouchCostBasisMethod;
 
  /*
   * Monthly product cost before applying the
   * sourcing buffer.
   *
   * Example:
   *
   * Median exact-listing cost:
   * $8.25
   */
  unbufferedMonthlyProductCost?:
    number;
 
  /*
   * Percentage sourcing buffer applied to the
   * raw listing-derived product cost.
   *
   * Store as a decimal.
   *
   * Example:
   * 0.10 means 10%.
   */
  sourcingBufferRate?:
    number;
 
  /*
   * Dollar amount added by the sourcing
   * buffer.
   *
   * Example:
   *
   * $8.25 × 10% = $0.83
   */
  sourcingBufferAmount?:
    number;
 
  /*
   * Number of qualified exact listings used
   * to establish the baseline monthly cost.
   */
  qualifiedListingCount?:
    number;
 
  /*
   * Optional explanation for the product's
   * pricing classification.
   */
  reason?:
    string;
 };
 
 /*
 * Backward-compatible aliases.
 *
 * Existing files currently import these
 * earlier type names. New code should use
 * the canonical SearchVidaPouch names above.
 *
 * These aliases allow the spelling correction
 * without breaking the current implementation.
 */
 export type SearchVitaPouchPricingTier =
  SearchVidaPouchPricingTier;
 
 export type SearchVitaPouchPricingSource =
  SearchVidaPouchPricingSource;
 
 export type SearchVitaPouchPricingInput =
  SearchVidaPouchPricingInput;
 



 export type SearchProductOption = {
  productName:
    string;
 
  brand:
    string;


/*
  * Primary supplement category assigned to this
  * product for grouped search-result views.
  *
  * This is mainly used for health-goal,
  * health-condition, and life-stage searches.
  */
searchCategoryId:
string | null;

/*
* Priority of the primary search category.
* Lower numbers represent higher-priority
* categories.
*/
searchCategoryPriority:
number | null;



 
  representativeProduct:
    SearchRetailProduct;
 
  listings:
    SearchRetailProduct[];
 
  listingsCompared:
    number;
 
  vendorsCompared:
    number;
 
  /*
   * Dosage shown separately on the card.
   *
   * Examples:
   * 250 mg
   * 400 mg
   * 5,000 IU
   */
  dosage:
    string;
 
  /*
   * Numeric dosage used for sorting,
   * filtering, and normalized comparisons.
   *
   * Example:
   * "250 mg" becomes 250.
   */
  dosageAmount:
    number | null;
 
  /*
   * Unit paired with dosageAmount.
   */
  dosageUnit:
    SearchDosageUnit;
 
  /*
   * True means the dosage is explicitly
   * stated for the full serving.
   *
   * False means it is explicitly stated for
   * one capsule, tablet, softgel, or other
   * physical unit.
   *
   * Null means the listing is unclear.
   */
  dosageIsPerServing:
    boolean | null;
 
  /*
   * Unit used for the primary price display.
   *
   * Examples:
   * $0.07 per tablet
   * $0.05 per capsule
   * $0.32 per gummy
   */
  unitLabel:
    SearchProductUnitLabel;
 
  /*
   * Indicates whether the physical form is
   * potentially compatible with VidaPouch.
   *
   * This does not guarantee that VidaPouch
   * currently carries the exact product.
   */
  vitaPouchFormEligible:
    boolean;
 
  lowestMonthlyCost:
    number;
 
  highestMonthlyCost:
    number;
 
  averageMonthlyCost:
    number;
 
  medianMonthlyCost:
    number;
 
  /*
   * Current monthly cost after applying the
   * active daily-dose selection.
   *
   * This remains the underlying estimated
   * product cost. It is not the complete
   * VidaPouch subscription price.
   */
  displayedMonthlyCost:
    number;
 
  /*
   * Number of physical capsules, tablets,
   * gummies, or other units required each
   * day for the active Daily Dose filter.
   *
   * Defaults to one when an adjusted daily
   * dose has not been applied.
   */
  unitsPerDay?:
    number;
 
  /*
   * Original daily quantity before the active
   * Daily Dose filter changes the product.
   *
   * The add-on engine compares this with
   * unitsPerDay to identify increased-
   * quantity costs.
   */
  baselineUnitsPerDay?:
    number;
 
  /*
   * Original buffered monthly product cost
   * before the active Daily Dose filter
   * changes the quantity.
   */
  baselineMonthlyCost?:
    number;
 
  /*
   * Product-level inputs used by the shared
   * VidaPouch add-on pricing engine.
   *
   * This remains optional until the search
   * result mapper assigns pricing inputs.
   */
  vitaPouchPricing?:
    SearchVidaPouchPricingInput;
 
  score:
    SearchProductScore;
 
  researchStatus:
    | "complete"
    | "undetermined";
 
  /*
   * Product dosage form.
   *
   * Examples:
   * Capsule
   * Softgel
   * Tablet
   * Powder
   * Gummy
   */
  form:
    string | null;
 
  /*
   * Dietary characteristics are kept
   * separate from quality testing and formal
   * certifications.
   */
  dietaryPreferences:
    SearchDietaryPreferences;
 
  /*
   * Product-specific testing information.
   */
  thirdPartyTesting:
    SearchThirdPartyTesting;
 
  /*
   * Formal product-level certifications.
   *
   * Examples:
   * USP Verified
   * NSF Certified
   * NSF Certified for Sport
   * Non-GMO Project Verified
   */
  certifications:
    string[];
 
  /*
   * Testing, manufacturing, and quality
   * claims that are useful to customers but
   * are not necessarily formal product-level
   * certifications.
   *
   * Examples:
   * GMP Quality Assured
   * cGMP Manufactured
   * Third-Party Tested
   */
  qualityClaims:
    string[];
 
  /*
   * Temporary compatibility field for the
   * current ProductCard implementation.
   */
  verifiedClaims:
    SearchProductClaims;
 
  confidenceScore:
    number;
 
  confidence:
    | "high"
    | "medium"
    | "low";
 
  selected:
    boolean;
 
  recommended:
    boolean;
 
  reasons: {
    title:
      string;
 
    description:
      string;
  }[];
 };
 