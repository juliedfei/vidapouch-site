import type { ProductResearch } from
"@/lib/intelligence/productResearch/productResearchTypes";

import type { ProductScoringInput } from
"./productScoringInput";

import {
 calculateReviewScore,
} from "./evaluators/calculateReviewScore";

import {
 calculateAvailabilityScore,
} from "./evaluators/calculateAvailabilityScore";

import {
 calculateCertificationScore,
} from "./evaluators/calculateCertificationScore";

import {
 calculateCleanIngredientScore,
} from "./evaluators/calculateCleanIngredientScore";

import {
 calculateEvidenceScore,
} from "./evaluators/calculateEvidenceScore";

export function evaluateProduct(
 research: ProductResearch
): ProductScoringInput {

 /*
  * Temporary until the AI formulation
  * evaluator is implemented.
  */
 const quality = 75;

 const reviews =
   calculateReviewScore({

     averageRating:
       research.averageRating,

     reviewCount:
       research.reviewCount,

   });

 /*
  * Temporary.
  *
  * The pricing engine will replace this
  * once scoreProduct() is connected to
  * the vendor listings.
  */
 const value = 50;

 const evidence =
   calculateEvidenceScore({

     aiConfidence:
       research.aiConfidence ?? 0.5,

     evidenceCount:
       research.evidence.length,

   });

 /*
  * Temporary.
  *
  * Availability will use real vendor
  * listing statistics shortly.
  */
 const availability =
   calculateAvailabilityScore({

     vendorCount: 1,

     listingCount: 1,

   });

 const cleanIngredients =
   calculateCleanIngredientScore({

     artificialColors:
       research.artificialColors,

     artificialSweeteners:
       research.artificialSweeteners,

     preservatives:
       research.preservatives,

     soyFree:
       research.soyFree,

     dairyFree:
       research.dairyFree,

     glutenFree:
       research.glutenFree,

     vegan:
       research.vegan,

   });

 const certifications =
   calculateCertificationScore({

     thirdPartyTested:
       research.thirdPartyTested,

     uspVerified:
       research.uspVerified,

     nsfCertified:
       research.nsfCertified,

     certifications:
       research.certifications,

   });

 const aiConfidence =
   Math.round(
     (research.aiConfidence ?? 0.5) *
     100
   );

 const completenessFields = [

   research.ingredients.length > 0,

   research.certifications.length > 0,

   research.commonBenefits.length > 0,

   research.averageRating !== undefined,

   research.reviewCount !== undefined,

   research.aiSummary.length > 0,

 ];

 const knownFields =
   completenessFields.filter(
     Boolean
   ).length;

 const dataCompleteness =
   Math.round(
     (knownFields /
       completenessFields.length) *
     100
   );

 return {

   quality,

   reviews,

   value,

   evidence,

   availability,

   cleanIngredients,

   certifications,

   aiConfidence,

   dataCompleteness,

 };

}