export type BrandResearch = {
    canonicalName: string;
   
    website?: string;
   
    practitionerGrade?: boolean;
   
    thirdPartyTesting?: boolean;
   
    cgmpCertified?: boolean;
   
    veganOptions?: boolean;
   
    hypoallergenic?: boolean;
   
    certifications: string[];
   
    priceTier?:
      | "budget"
      | "value"
      | "midrange"
      | "premium"
      | "professional";
   
    availability?:
      | "limited"
      | "moderate"
      | "wide"
      | "national";
   
    confidence: number;
   
    evidence: {
      source: string;
      url?: string;
      notes?: string;
    }[];
   };