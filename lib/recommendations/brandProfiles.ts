import { buildBrandProfile } from "./brandProfileBuilder";

import type {
    BrandProfile,
    BrandProfileMatch,
   } from "./brandProfileTypes";
   
   function normalize(value: string) {
    return value
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
   }

   const BRAND_PROFILES: BrandProfile[] = [
    {
      id: "nature-made",
   
      displayName: "Nature Made",
   
      aliases: [
        "Nature Made",
        "NatureMade",
      ],
   
      certifications: [],
   
      thirdPartyTesting: {
        value: true,
        confidence: "verified",
      },
   
      practitionerGrade: {
        value: false,
        confidence: "reported",
      },
   
      cGmpCompliant: {
        value: true,
        confidence: "verified",
      },
   
      hypoallergenicFocus: {
        value: false,
        confidence: "reported",
      },
   
      veganOptions: {
        value: true,
        confidence: "reported",
      },
   
      priceTier: "value",
   
      availability: "national",
   
      profileConfidence: "verified",
    },
   
    {
      id: "now",
   
      displayName: "NOW",
   
      aliases: [
        "NOW",
        "NOW Foods",
        "Now Foods",
      ],
   
      certifications: [],
   
      thirdPartyTesting: {
        value: true,
        confidence: "reported",
      },
   
      practitionerGrade: {
        value: false,
        confidence: "reported",
      },
   
      cGmpCompliant: {
        value: true,
        confidence: "verified",
      },
   
      hypoallergenicFocus: {
        value: false,
        confidence: "reported",
      },
   
      veganOptions: {
        value: true,
        confidence: "reported",
      },
   
      priceTier: "budget",
   
      availability: "national",
   
      profileConfidence: "verified",
    },
   ];

   export function getBrandProfile(
    brand: string
   ): BrandProfileMatch {
    const normalized =
      normalize(brand);
   
    for (const profile of BRAND_PROFILES) {
      if (
        normalize(profile.displayName) ===
        normalized
      ) {



const built = buildBrandProfile(profile);

return {
 profile: built.profile,
 normalizedInput: normalized,
 confidence: "exact",
};




      }
   
      for (const alias of profile.aliases) {
        if (
          normalize(alias) === normalized
        ) {



const built = buildBrandProfile(profile);

return {
 profile: built.profile,
 normalizedInput: normalized,
 matchedAlias: alias,
 confidence: "alias",
};




        }
      }
    }
   
    return {
      profile: null,
      normalizedInput: normalized,
      confidence: "none",
    };
   }

   export function getCanonicalBrandName(
    brand: string
   ) {
    const result =
      getBrandProfile(brand);
   
    return (
      result.profile?.displayName ??
      brand
    );
   }
   