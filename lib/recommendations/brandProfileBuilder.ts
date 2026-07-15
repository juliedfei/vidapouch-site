import type { BrandProfile } from "./brandProfileTypes";

export type BrandProfileBuildResult = {
 profile: BrandProfile | null;
 source: "database" | "generated" | "none";
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