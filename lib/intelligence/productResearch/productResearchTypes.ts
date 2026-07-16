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

export type ProductResearchEvidence = {
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
  * iHerb
  */
 source: string;

 url: string;

 /*
  * Confidence in this particular source,
  * expressed from 0 through 1.
  */
 confidence: number;

 /*
  * Facts extracted from this source.
  */
 extractedFacts: string[];
};

export type ProductResearch = {
 /*
  * Product identity
  */

 supplement: string;

 brand: string;

 productName: string;

 dosage?: string;

 servingSize?: string;

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

 inactiveIngredients: string[];

 allergens: string[];

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
  * Testing and manufacturing facts
  */

 thirdPartyTested: ProductFact;

 uspVerified: ProductFact;

 nsfCertified: ProductFact;

 cgmpManufactured: ProductFact;

 /*
  * Product-specific certifications.
  *
  * Brand-wide programs should not be
  * automatically applied to every product.
  */
 certifications: string[];

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
  * AI synthesis
  */

 aiSummary: string;

 /*
  * Confidence in the complete research
  * record, expressed from 0 through 1.
  */
 aiConfidence: number;

 evidence: ProductResearchEvidence[];
};