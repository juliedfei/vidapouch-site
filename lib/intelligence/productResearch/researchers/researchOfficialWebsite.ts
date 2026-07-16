import type {
  ProductResearch,
 } from "../productResearchTypes";
 
 import {
  researchProductWithOpenAi,
 } from "../openAiProductResearch";
 
 /*
 * Researches the official manufacturer website.
 *
 * Uses GPT with web search to retrieve
 * structured product information.
 */
 export async function researchOfficialWebsite(
  productName: string
 ): Promise<Partial<ProductResearch>> {
 
  console.log(
    "Researching official website:",
    productName
  );
 
  const research =
    await researchProductWithOpenAi(
      productName
    );
 
  if (!research) {
    return {};
  }
 
  return research;
 }
 
 