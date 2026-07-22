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
 * "premium" means the underlying monthly
 * product cost exceeds the standard
 * allowance.
 *
 * "undetermined" means the product has not
 * yet been classified confidently.
 */
 export type SearchVitaPouchPricingTier =
  | "standard"
  | "premium"
  | "undetermined";
 
 export type SearchVitaPouchPricingSource =
  | "retail-estimate"
  | "wholesale"
  | "catalog"
  | "manual"
  | "undetermined";
 
 /*
 * Optional pricing inputs used by the shared
 * VidaPouch add-on calculator.
 *
 * These are inputs rather than final customer
 * prices. The calculator will determine:
 *
 * - premium-product add-on;
 * - additional daily-quantity add-on;
 * - combined monthly add-on;
 * - whether the product is fully included.
 *
 * Keeping this optional allows current search
 * results to continue building while products
 * are gradually assigned more precise pricing.
 */
 export type SearchVitaPouchPricingInput = {
  /*
   * Product classification before accounting
   * for an increased customer-selected dose.
   */
  tier:
    SearchVitaPouchPricingTier;
 
  /*
   * Monthly quantity included for this product
   * before an extra-quantity charge applies.
   *
   * Example:
   * 30 capsules means one capsule per day.
   */
  includedMonthlyUnitCount:
    number;
 
  /*
   * Underlying monthly product cost at the
   * included quantity.
   */
  includedMonthlyProductCost:
    number;
 
  /*
   * Maximum underlying monthly product cost
   * that the selected plan may absorb before
   * a premium-product add-on applies.
   *
   * The final allowance may later vary by plan.
   */
  standardMonthlyCostAllowance:
    number;
 
  /*
   * Identifies where the pricing input came
   * from for auditing and future manager
   * controls.
   */
  source:
    SearchVitaPouchPricingSource;
 
  /*
   * Optional explanation for why the product
   * was classified as premium or could not be
   * classified.
   */
  reason?:
    string;
 };
 
 export type SearchProductOption = {
  productName:
    string;
 
  brand:
    string;
 
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
   * False means it is explicitly stated
   * for one capsule, tablet, softgel, etc.
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
   * This does not mean VidaPouch currently
   * carries the exact product.
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
   * This remains the underlying product-cost
   * estimate and is not the customer's full
   * VidaPouch subscription price.
   */
  displayedMonthlyCost:
    number;
 
  /*
   * Number of physical capsules, tablets,
   * gummies, or other units required each day
   * for the active Daily Dose filter.
   *
   * Defaults to one when no adjusted daily
   * dose has been applied.
   */
  unitsPerDay?:
    number;
 
  /*
   * Original daily quantity before the active
   * Daily Dose filter changes the product.
   *
   * The add-on engine can compare this with
   * unitsPerDay to identify increased-quantity
   * costs.
   *
   * Optional during the migration.
   */
  baselineUnitsPerDay?:
    number;
 
  /*
   * Original monthly product cost before the
   * active Daily Dose filter changes the
   * quantity.
   *
   * Optional during the migration.
   */
  baselineMonthlyCost?:
    number;
 
  /*
   * Product-level inputs used by the shared
   * VidaPouch add-on pricing engine.
   *
   * Optional until the product has been
   * classified.
   */
  vitaPouchPricing?:
    SearchVitaPouchPricingInput;
 
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
   * Kept separate from testing and
   * certification information.
   */
  dietaryPreferences:
    SearchDietaryPreferences;
 
  /*
   * Product-specific testing and
   * certification information.
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
   * existing ProductCard while the display
   * is migrated to separate sections.
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
 