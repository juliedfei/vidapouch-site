import type { ProductResearch } from "./productResearchTypes";
import type { ResearchSource } from "./researchSource";

type Input = {
 productName: string;
 sources: ResearchSource[];
};

export async function extractProductResearch({
 productName,
 sources,
}: Input): Promise<ProductResearch> {
 console.log(
   "Extracting product research:",
   productName,
   sources.length,
   "sources"
 );

 throw new Error(
   "extractProductResearch() has not been implemented yet."
 );
}
