import type { BrandProfile } from "./brandProfileTypes";

export type BrandProfileBuildResult = {
 profile: BrandProfile | null;
 source: "database" | "generated" | "none";
};

/*
* If a BrandProfile is supplied,
* a BrandProfile is guaranteed back.
*/
export function buildBrandProfile(
 profile: BrandProfile
): {
 profile: BrandProfile;
 source: "database";
};

/*
* If null is supplied,
* null is returned.
*/
export function buildBrandProfile(
 profile: null
): {
 profile: null;
 source: "none";
};

export function buildBrandProfile(
 profile: BrandProfile | null
): BrandProfileBuildResult {
 if (!profile) {
   return {
     profile: null,
     source: "none",
   };
 }

 return {
   profile,
   source: "database",
 };
}
