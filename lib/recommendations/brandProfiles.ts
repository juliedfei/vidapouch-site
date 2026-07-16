import { prisma } from "@/lib/db";

import { buildBrandProfile } from "./brandProfileBuilder";

import type {
 BrandAvailabilityLevel,
 BrandDataConfidence,
 BrandPriceTier,
 BrandProfile,
 BrandProfileMatch,
} from "./brandProfileTypes";

const CACHE_DURATION_MS =
 15 * 60 * 1000;

type CachedBrandProfile = {
 profile: BrandProfile;
 canonicalKey: string;
 aliasKeys: Map<string, string>;
};

type BrandProfileCache = {
 loadedAt: number;
 byCanonicalName: Map<
   string,
   CachedBrandProfile
>;
 byAnyName: Map<
   string,
   CachedBrandProfile
>;
};

let cache:
 | BrandProfileCache
 | null = null;

let cacheLoadPromise:
 | Promise<BrandProfileCache>
 | null = null;

function normalize(value: string) {
 return value
   .toLowerCase()
   .replace(/['’]/g, "")
   .replace(/[^a-z0-9]+/g, " ")
   .trim();
}

function mapConfidence(
 value:
   | "VERIFIED"
   | "REPORTED"
   | "INFERRED"
   | "UNKNOWN"
   | null
   | undefined
): BrandDataConfidence {
 switch (value) {
   case "VERIFIED":
     return "verified";

   case "REPORTED":
   case "INFERRED":
     return "reported";

   default:
     return "unknown";
 }
}

function mapPriceTier(
 value:
   | "BUDGET"
   | "VALUE"
   | "MIDRANGE"
   | "PREMIUM"
   | "PROFESSIONAL"
   | null
   | undefined
): BrandPriceTier {
 switch (value) {
   case "BUDGET":
     return "budget";

   case "VALUE":
     return "value";

   case "MIDRANGE":
     return "midrange";

   case "PREMIUM":
     return "premium";

   case "PROFESSIONAL":
     return "professional";

   default:
     return "midrange";
 }
}

function mapAvailability(
 value:
   | "LIMITED"
   | "MODERATE"
   | "WIDE"
   | "NATIONAL"
   | null
   | undefined
): BrandAvailabilityLevel {
 switch (value) {
   case "LIMITED":
     return "limited";

   case "MODERATE":
     return "moderate";

   case "WIDE":
     return "wide";

   case "NATIONAL":
     return "national";

   default:
     return "moderate";
 }
}

function cacheIsFresh() {
 if (!cache) {
   return false;
 }

 return (
   Date.now() - cache.loadedAt <
   CACHE_DURATION_MS
 );
}

async function loadBrandProfileCache():
Promise<BrandProfileCache> {
 const brands =
   await prisma.brand.findMany({
     include: {
       aliases: true,

       certifications: {
         include: {
           certification: true,
         },
       },
     },
   });

 const byCanonicalName =
   new Map<
     string,
     CachedBrandProfile
>();

 const byAnyName =
   new Map<
     string,
     CachedBrandProfile
>();

 for (const brand of brands) {
   const profileConfidence =
     mapConfidence(
       brand.profileConfidence
     );

   const rawProfile: BrandProfile = {
     id: brand.id,

     displayName:
       brand.canonicalName,

     aliases:
       brand.aliases.map(
         (alias) => alias.alias
       ),

     certifications:
       brand.certifications.map(
         (link) => ({
           name:
             link.certification.name,

           confidence:
             mapConfidence(
               link.confidence
             ),

           sourceUrl:
             link.sourceUrl ??
             undefined,

           verifiedAt:
             link.verifiedAt
               ?.toISOString(),

           appliesToAllProducts:
             link.appliesToAllProducts,
         })
       ),

     thirdPartyTesting: {
       value:
         brand
           .thirdPartyTestingProgram,

       confidence:
         profileConfidence,
     },

     practitionerGrade: {
       value:
         brand.practitionerGrade,

       confidence:
         profileConfidence,
     },

     cGmpCompliant: {
       value:
         brand.cgmpCertified,

       confidence:
         profileConfidence,
     },

     hypoallergenicFocus: {
       value:
         brand.hypoallergenic,

       confidence:
         profileConfidence,
     },

     veganOptions: {
       value:
         brand.veganOptions,

       confidence:
         profileConfidence,
     },

     priceTier:
       mapPriceTier(
         brand.priceTier
       ),

     availability:
       mapAvailability(
         brand.availability
       ),

     profileConfidence,

     internalNotes: [
       "Loaded from the VidaPouch PostgreSQL brand knowledge database.",
     ],
   };

   const built =
     buildBrandProfile(
       rawProfile
     );

   const canonicalKey =
     normalize(
       brand.canonicalName
     );

   const aliasKeys =
     new Map<string, string>();

   for (
     const alias of brand.aliases
   ) {
     aliasKeys.set(
       normalize(alias.alias),
       alias.alias
     );
   }

   const cachedProfile:
     CachedBrandProfile = {
       profile: built.profile,
       canonicalKey,
       aliasKeys,
     };

   byCanonicalName.set(
     canonicalKey,
     cachedProfile
   );

   byAnyName.set(
     canonicalKey,
     cachedProfile
   );

   for (
     const aliasKey of aliasKeys.keys()
   ) {
     byAnyName.set(
       aliasKey,
       cachedProfile
     );
   }
 }

 return {
   loadedAt: Date.now(),
   byCanonicalName,
   byAnyName,
 };
}

async function getCache() {
 if (cacheIsFresh() && cache) {
   return cache;
 }

 /*
  * If several products request brand
  * information simultaneously, they all
  * share one database-loading promise.
  */
 if (!cacheLoadPromise) {
   cacheLoadPromise =
     loadBrandProfileCache()
       .then((loadedCache) => {
         cache = loadedCache;

         return loadedCache;
       })
       .finally(() => {
         cacheLoadPromise = null;
       });
 }

 return cacheLoadPromise;
}

export function invalidateBrandProfileCache() {
 cache = null;
 cacheLoadPromise = null;
}

export async function getBrandProfile(
 brandName: string
): Promise<BrandProfileMatch> {
 const normalizedInput =
   normalize(brandName);

 const loadedCache =
   await getCache();

 const canonicalMatch =
   loadedCache.byCanonicalName.get(
     normalizedInput
   );

 if (canonicalMatch) {
   return {
     profile:
       canonicalMatch.profile,

     normalizedInput,

     confidence: "exact",
   };
 }

 const aliasMatch =
   loadedCache.byAnyName.get(
     normalizedInput
   );

 if (!aliasMatch) {
   return {
     profile: null,
     normalizedInput,
     confidence: "none",
   };
 }

 return {
   profile:
     aliasMatch.profile,

   normalizedInput,

   matchedAlias:
     aliasMatch.aliasKeys.get(
       normalizedInput
     ),

   confidence: "alias",
 };
}

export async function getCanonicalBrandName(
 brandName: string
) {
 const result =
   await getBrandProfile(
     brandName
   );

 return (
   result.profile?.displayName ??
   brandName
 );
}