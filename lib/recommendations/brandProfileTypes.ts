export type BrandDataConfidence =
 | "verified"
 | "reported"
 | "unknown";

export type BrandPriceTier =
 | "budget"
 | "value"
 | "midrange"
 | "premium"
 | "professional";

export type BrandAvailabilityLevel =
 | "limited"
 | "moderate"
 | "wide"
 | "national";

export type BrandCertification = {
 /*
  * Customer-facing certification name,
  * such as "USP Verified" or
  * "NSF Certified for Sport".
  */
 name: string;

 /*
  * Whether VitaPouch has confirmed the
  * certification from an appropriate
  * authoritative source.
  */
 confidence: BrandDataConfidence;

 /*
  * Optional source reference for future
  * auditing and manager-portal review.
  */
 sourceUrl?: string;

 /*
  * Date on which the fact was checked.
  */
 verifiedAt?: string;

 /*
  * Some certifications apply only to
  * particular products rather than every
  * product sold by the brand.
  */
 appliesToAllProducts: boolean;
};

export type BrandBooleanFact = {
 value: boolean | null;

 confidence: BrandDataConfidence;

 sourceUrl?: string;

 verifiedAt?: string;
};

export type BrandProfile = {
 /*
  * Stable internal identifier.
  */
 id: string;

 /*
  * Canonical name shown to customers.
  */
 displayName: string;

 /*
  * Search-result variations that should
  * map to this canonical brand.
  */
 aliases: string[];

 /*
  * Structured facts, not final scores.
  */
 certifications: BrandCertification[];

 thirdPartyTesting:
   BrandBooleanFact;

 practitionerGrade:
   BrandBooleanFact;

 cGmpCompliant:
   BrandBooleanFact;

 hypoallergenicFocus:
   BrandBooleanFact;

 veganOptions:
   BrandBooleanFact;

 /*
  * General market positioning. This is
  * used only as one input; current live
  * product pricing still determines the
  * actual value score.
  */
 priceTier: BrandPriceTier;

 availability:
   BrandAvailabilityLevel;

 /*
  * Optional factual history fields.
  */
 foundedYear?: number;

 headquartersCountry?: string;

 /*
  * Allows profiles to exist before all
  * evidence has been researched without
  * presenting incomplete facts as certain.
  */
 profileConfidence:
   BrandDataConfidence;

 /*
  * Internal audit notes are never shown
  * directly to customers.
  */
 internalNotes?: string[];
};

export type BrandProfileMatch = {
 profile: BrandProfile | null;

 normalizedInput: string;

 matchedAlias?: string;

 confidence:
   | "exact"
   | "alias"
   | "none";
};