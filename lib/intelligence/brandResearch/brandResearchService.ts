import {
    mergeResearch,
   } from "./mergeResearch";
   
   import {
    researchBrand,
   } from "./researchProviders";
   
   import {
    saveResearch,
   } from "./saveResearch";
   
   export async function enrichBrand({
   
    brandId,
   
    brandName,
   
   }: {
   
    brandId: string;
   
    brandName: string;
   
   }) {
   
    const research =
      await researchBrand(
        brandName
      );
   
    const merged =
      mergeResearch(
        research
      );
   
    if (!merged) {
      return false;
    }
   
    await saveResearch(
      brandId,
      merged
    );
   
    return true;
   }
   