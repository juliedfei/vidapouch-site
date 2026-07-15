import type {
    AvailabilityLevel,
    DataConfidence,
    PriceTier,
   } from "../../../lib/generated/prisma/enums";
   
   export type BrandSeed = {
    canonicalName: string;
   
    aliases: string[];
   
    website?: string;
   
    manufacturer: string;
   
    practitionerGrade?: boolean;
   
    thirdPartyTested?: boolean;
   
    cgmpCertified?: boolean;
   
    veganOptions?: boolean;
   
    hypoallergenic?: boolean;
   
    priceTier?: PriceTier;
   
    availability?: AvailabilityLevel;
   
    profileConfidence?: DataConfidence;
   };
   