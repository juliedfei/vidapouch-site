import {
    getCachedProductResearch,
   } from "@/lib/intelligence/productResearch/getCachedProductResearch";
   
   import {
    researchProductWithOpenAi,
   } from "@/lib/intelligence/productResearch/openAiProductResearch";
   
   import {
    saveProductResearch,
   } from "@/lib/intelligence/productResearch/saveProductResearch";
   
   import type {
    ProductResearch,
   } from "@/lib/intelligence/productResearch/productResearchTypes";
   
   export async function researchSearchProductAttributes(
    productName: string
   ): Promise<ProductResearch | null> {
    const normalizedProductName =
      productName.trim();
   
    if (!normalizedProductName) {
      console.error(
        "VitaSearch enrichment rejected: missing product name"
      );
   
      return null;
    }
   
    console.log(
      "VitaSearch enrichment started:",
      normalizedProductName
    );
   
    const cached =
      await getCachedProductResearch(
        normalizedProductName
      );
   
    if (cached) {
      console.log(
        "VitaSearch enrichment cache hit:",
        {
          productName:
            normalizedProductName,
   
          form:
            cached.form ?? null,
   
          thirdPartyTested:
            cached.thirdPartyTested,
   
          uspVerified:
            cached.uspVerified,
   
          nsfCertified:
            cached.nsfCertified,
   
          certifications:
            cached.certifications,
   
          evidenceCount:
            cached.evidence.length,
        }
      );
   
      return cached;
    }
   
    console.log(
      "VitaSearch enrichment cache miss:",
      normalizedProductName
    );
   
    try {
      const research =
        await researchProductWithOpenAi(
          normalizedProductName
        );
   
      if (!research) {
        console.error(
          "VitaSearch enrichment returned no research:",
          normalizedProductName
        );
   
        return null;
      }
   
      await saveProductResearch(
        normalizedProductName,
        research
      );
   
      console.log(
        "VitaSearch enrichment completed:",
        {
          requestedProduct:
            normalizedProductName,
   
          researchedProduct:
            research.productName,
   
          brand:
            research.brand,
   
          supplement:
            research.supplement,
   
          form:
            research.form ?? null,
   
          dietaryPreferences: {
            vegan:
              research.vegan,
   
            vegetarian:
              research.vegetarian,
   
            glutenFree:
              research.glutenFree,
   
            dairyFree:
              research.dairyFree,
   
            soyFree:
              research.soyFree,
   
            nonGmo:
              research.nonGmo,
          },
   
          thirdPartyTesting: {
            thirdPartyTested:
              research.thirdPartyTested,
   
            uspVerified:
              research.uspVerified,
   
            nsfCertified:
              research.nsfCertified,
          },
   
          certifications:
            research.certifications,
   
          evidenceCount:
            research.evidence.length,
   
          confidence:
            research.aiConfidence,
        }
      );
   
      return research;
    } catch (error) {
      console.error(
        "VitaSearch enrichment failed:",
        {
          productName:
            normalizedProductName,
   
          error:
            error instanceof Error
              ? {
                  name:
                    error.name,
   
                  message:
                    error.message,
   
                  stack:
                    error.stack,
                }
              : error,
        }
      );
   
      return null;
    }
   }