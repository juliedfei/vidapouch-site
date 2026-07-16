import type {
  BrandResearch,
 } from "./brandResearchTypes";
 
 import {
  researchBrandWithOpenAi,
 } from "./openAiBrandResearch";
 
 export async function researchBrand(
  brandName: string
 ): Promise<BrandResearch[]> {
  console.log(
    "Researching brand:",
    brandName
  );
 
  const results:
    BrandResearch[] = [];
 
  try {
    const openAiResearch =
      await researchBrandWithOpenAi(
        brandName
      );
 
    if (openAiResearch) {
      results.push(
        openAiResearch
      );
    }
  } catch (error) {
    console.error(
      "OpenAI brand research failed:",
      {
        brandName,
        error,
      }
    );
  }
 
  return results;
 }