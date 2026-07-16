import type {
    BrandResearch,
   } from "./brandResearchTypes";
   
   export function mergeResearch(
    research: BrandResearch[]
   ): BrandResearch | null {
   
    if (research.length === 0) {
      return null;
    }
   
    return research[0];
   }