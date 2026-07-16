import { prisma } from "@/lib/db";

import {
 invalidateBrandProfileCache,
} from "@/lib/recommendations/brandProfiles";

import type {
 BrandResearch,
} from "./brandResearchTypes";

function mapPriceTier(
 value: BrandResearch["priceTier"]
) {
 switch (value) {
   case "budget":
     return "BUDGET";

   case "value":
     return "VALUE";

   case "midrange":
     return "MIDRANGE";

   case "premium":
     return "PREMIUM";

   case "professional":
     return "PROFESSIONAL";

   default:
     return null;
 }
}

function mapAvailability(
 value: BrandResearch["availability"]
) {
 switch (value) {
   case "limited":
     return "LIMITED";

   case "moderate":
     return "MODERATE";

   case "wide":
     return "WIDE";

   case "national":
     return "NATIONAL";

   default:
     return null;
 }
}

function mapConfidence(
 confidence: number
) {
 if (confidence >= 0.90) {
   return "VERIFIED";
 }

 if (confidence >= 0.70) {
   return "REPORTED";
 }

 if (confidence >= 0.40) {
   return "INFERRED";
 }

 return "UNKNOWN";
}

export async function saveResearch(
 brandId: string,
 research: BrandResearch
) {
 await prisma.$transaction(
   async (tx) => {

     await tx.brand.update({
       where: {
         id: brandId,
       },

       data: {

         website:
           research.website,

         practitionerGrade:
           research.practitionerGrade,

         thirdPartyTestingProgram:
           research.thirdPartyTesting,

         cgmpCertified:
           research.cgmpCertified,

         veganOptions:
           research.veganOptions,

         hypoallergenic:
           research.hypoallergenic,

         priceTier:
           mapPriceTier(
             research.priceTier
           ),

         availability:
           mapAvailability(
             research.availability
           ),

         profileConfidence:
           mapConfidence(
             research.confidence
           ),
       },
     });

     /*
      * Save evidence records.
      */

     for (const item of research.evidence) {

       const source =
         await tx.evidenceSource.create({

           data: {

             sourceType:
               "AI_DISCOVERY",

             publisher:
               item.source,

             url:
               item.url,

             title:
               item.notes ??
               item.source,
           },
         });

       await tx.brandEvidence.create({

         data: {

           brandId,

           evidenceSourceId:
             source.id,

           claimType:
             "AI_RESEARCH",

           claimValue:
             item.notes,

           confidence:
             mapConfidence(
               research.confidence
             ),

         },
       });
     }
   }
 );

 /*
  * Force the in-memory cache to reload
  * next time a recommendation is scored.
  */
 invalidateBrandProfileCache();
}