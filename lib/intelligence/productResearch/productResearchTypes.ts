/*
* Research for one specific product.
*
* Terminology:
*
* Supplement:
* Vitamin C
*
* Brand:
* NOW
*
* Product:
* NOW Vitamin C 1000 mg Capsules
*
* Vendor listing:
* That exact product offered by iHerb,
* Walmart, Amazon, or another vendor.
*
* Vendor-specific price, shipping, stock,
* and seller data do not belong here.
*/

export type ProductFact =
 boolean | null;

export type ProductResearchStatus =
 | "pending"
 | "partial"
 | "verified"
 | "not-found"
 | "failed";

export type ProductClaimStatus =
 | "verified"
 | "claimed"
 | "not-verified"
 | "not-found"
 | "conflicting";

export type ProductEvidenceType =
 | "official-registry"
 | "manufacturer-page"
 | "product-label"
 | "retailer-page"
 | "structured-data"
 | "third-party-database"
 | "manual-review"
 | "ai-extraction"
 | "other";

export type ProductClaimSource = {
 /*
  * Human-readable page or record title.
  */
 title: string;

 /*
  * Source organization or website.
  *
  * Examples:
  * NOW Foods
  * NSF
  * USP
  * NPA
  * NIH DSLD
  * Walmart
  */
 source: string;

 url: string;

 sourceType:
   ProductEvidenceType;

 /*
  * Exact supporting language when
  * available.
  *
  * Keep this brief. It is evidence,
  * not a complete page copy.
  */
 evidenceText?: string;

 /*
  * Confidence in this source and its
  * relationship to this exact product.
  *
  * Expressed from 0 through 1.
  */
 confidence: number;

 /*
  * Date the source was checked.
  *
  * ISO 8601 date-time string.
  */
 checkedAt?: string;
};

export type ProductClaim = {
 /*
  * True:
  * Evidence supports the claim.
  *
  * False:
  * Reliable evidence specifically
  * shows the claim does not apply.
  *
  * Null:
  * The claim is unknown.
  */
 value: ProductFact;

 /*
  * A verified claim is supported by an
  * authoritative product-level source.
  *
  * A claimed value may appear on a
  * manufacturer or retailer page but has
  * not been independently verified.
  */
 status:
   ProductClaimStatus;

 /*
  * Confidence in the claim as it applies
  * to this exact product.
  *
  * Expressed from 0 through 1.
  */
 confidence: number;

 /*
  * Product-level means the exact product
  * was verified.
  *
  * Manufacturer-level means the evidence
  * applies to the company or facility and
  * must not be presented as certification
  * of the exact product.
  */
 scope:
   | "product"
   | "manufacturer"
   | "facility"
   | "brand"
   | "unknown";

 sources:
   ProductClaimSource[];

 /*
  * Optional human-readable clarification.
  *
  * Example:
  * "The manufacturer participates in an
  * NPA GMP program, but this is not a
  * product-level certification."
  */
 note?: string;
};

export type ProductResearchEvidence = {
 /*
  * Human-readable page or record title.
  */
 title: string;

 /*
  * Source organization or website.
  */
 source: string;

 url: string;

 sourceType?:
   ProductEvidenceType;

 /*
  * Confidence in this particular source,
  * expressed from 0 through 1.
  */
 confidence: number;

 /*
  * Facts extracted from this source.
  */
 extractedFacts: string[];

 /*
  * Date the source was checked.
  *
  * ISO 8601 date-time string.
  */
 checkedAt?: string;
};

export type ProductCertificationResearch = {
 /*
  * Formal product-level certifications.
  */

 nsfCertified:
   ProductClaim;

 nsfCertifiedForSport:
   ProductClaim;

 uspVerified:
   ProductClaim;

 nonGmoProjectVerified:
   ProductClaim;

 informedChoiceCertified:
   ProductClaim;

 informedSportCertified:
   ProductClaim;

 bannedSubstanceTested:
   ProductClaim;

 /*
  * Manufacturing and quality programs.
  *
  * These may apply to the manufacturer or
  * facility rather than the exact product.
  */

 gmpQualityAssured:
   ProductClaim;

 cgmpManufactured:
   ProductClaim;

 npaGmpCertified:
   ProductClaim;

 thirdPartyTested:
   ProductClaim;
};

export type ProductDietaryResearch = {
 vegan:
   ProductClaim;

 vegetarian:
   ProductClaim;

 glutenFree:
   ProductClaim;

 nonGmo:
   ProductClaim;

 soyFree:
   ProductClaim;

 dairyFree:
   ProductClaim;

 sugarFree:
   ProductClaim;

 kosher:
   ProductClaim;

 halal:
   ProductClaim;

 organic:
   ProductClaim;

 artificialColors:
   ProductClaim;

 artificialFlavors:
   ProductClaim;

 artificialSweeteners:
   ProductClaim;

 preservatives:
   ProductClaim;
};

export type ProductResearch = {
 /*
  * Product identity
  */

 supplement: string;

 brand: string;

 productName: string;

 /*
  * Stable product identifiers used to
  * match cached research to a search
  * result.
  */

 shoppingProductId?: string;

 upc?: string;

 ndc?: string;

 sku?: string;

 manufacturerProductId?: string;

 dosage?: string;

 dosageAmount?: number;

 dosageUnit?: string;

 dosageIsPerServing?:
   boolean | null;

 servingSize?: string;

 servingsPerContainer?: number;

 unitsPerContainer?: number;

 form?: string;

 capsuleType?: string;

 manufacturer?: string;

 countryOfOrigin?: string;

 officialProductUrl?: string;

 imageUrl?: string;

 /*
  * Ingredient and formulation facts
  */

 ingredientForm?: string;

 ingredients: string[];

 activeIngredients?: string[];

 inactiveIngredients: string[];

 allergens: string[];

 /*
  * Legacy fact fields.
  *
  * Keep these fields so existing search
  * and card code continues to compile.
  *
  * New enrichment code should use the
  * detailed dietaryClaims and
  * certificationClaims objects below.
  */

 vegan: ProductFact;

 vegetarian: ProductFact;

 nonGmo: ProductFact;

 glutenFree: ProductFact;

 soyFree: ProductFact;

 dairyFree: ProductFact;

 artificialColors: ProductFact;

 artificialSweeteners: ProductFact;

 preservatives: ProductFact;

 /*
  * Legacy testing and manufacturing
  * fields.
  */

 thirdPartyTested:
   ProductFact;

 uspVerified:
   ProductFact;

 nsfCertified:
   ProductFact;

 cgmpManufactured:
   ProductFact;

 /*
  * Detailed claim records.
  *
  * These preserve whether a statement is
  * verified, merely claimed, unknown, or
  * tied only to a manufacturer or facility.
  */

 certificationClaims?:
   ProductCertificationResearch;

 dietaryClaims?:
   ProductDietaryResearch;

 /*
  * Product-specific certification names.
  *
  * Brand-wide or facility-wide programs
  * should not be automatically applied to
  * every product.
  */
 certifications: string[];

 /*
  * Quality or manufacturing statements
  * that are not formal product-level
  * certifications.
  *
  * Examples:
  * GMP Quality Assured
  * Manufactured in a cGMP facility
  */
 qualityClaims?: string[];

 /*
  * Filter values that have enough evidence
  * to be safely used by the customer-facing
  * search filters.
  *
  * These should be derived from the
  * detailed claim objects rather than from
  * unverified title text.
  */
 filterableClaims?: {
   nsfCertified: boolean;

   nsfCertifiedForSport:
     boolean;

   uspVerified: boolean;

   nonGmoProjectVerified:
     boolean;

   gmpQualityAssured:
     boolean;

   npaGmpCertified:
     boolean;

   thirdPartyTested:
     boolean;

   vegan: boolean;

   vegetarian: boolean;

   glutenFree: boolean;

   nonGmo: boolean;

   soyFree: boolean;

   dairyFree: boolean;

   sugarFree: boolean;

   organic: boolean;
 };

 /*
  * Review intelligence aggregated across
  * vendor listings when reliable review
  * data is available.
  */

 commonBenefits: string[];

 commonComplaints: string[];

 averageRating?: number;

 reviewCount?: number;

 reviewSummary?: string;

 /*
  * Research lifecycle
  */

 researchStatus?:
   ProductResearchStatus;

 researchedAt?: string;

 lastVerifiedAt?: string;

 researchVersion?: number;

 /*
  * AI synthesis
  */

 aiSummary: string;

 /*
  * Confidence in the complete research
  * record, expressed from 0 through 1.
  */
 aiConfidence: number;

 evidence:
   ProductResearchEvidence[];
};
