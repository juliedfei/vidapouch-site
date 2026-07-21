import type {
  SearchDosageUnit,
  SearchRetailProduct,
 } from "./searchRetailProduct";
 
 export type SearchProductScore = {
  overall: number | null;
 
  value: number | null;
 
  productQuality: number | null;
 
  dosageFit: number | null;
 
  retailerConfidence:
    number | null;
 
  dataCompleteness:
    number | null;
 };
 
 export type SearchDietaryPreferences = {
  vegan: boolean;
 
  vegetarian: boolean;
 
  glutenFree: boolean;
 
  dairyFree: boolean;
 
  soyFree: boolean;
 
  nonGmo: boolean;
 };
 
 export type SearchThirdPartyTesting = {
  thirdPartyTested: boolean;
 
  uspVerified: boolean;
 
  nsfCertified: boolean;
 
  consumerLabTested: boolean;
 
  informedChoice: boolean;
 };
 
 export type SearchProductClaims = {
  nsfCertified: boolean;
 
  uspVerified: boolean;
 
  thirdPartyTested: boolean;
 
  vegan: boolean;
 
  nonGmo: boolean;
 
  glutenFree: boolean;
 };
 
 export type SearchProductUnitLabel =
  | "capsule"
  | "tablet"
  | "caplet"
  | "softgel"
  | "gummy"
  | "serving"
  | "unit";
 
 export type SearchProductOption = {
  productName: string;
 
  brand: string;
 
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
  dosage: string;
 
  /*
   * Numeric dosage used later for sorting,
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
   * potentially compatible with VitaPouch.
   *
   * This does not mean VitaPouch currently
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
 
  displayedMonthlyCost:
    number;
 
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
  form: string | null;
 
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
 
  selected: boolean;
 
  recommended: boolean;
 
  reasons: {
    title: string;
 
    description: string;
  }[];
 };