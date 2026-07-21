import {
    researchProductCertificationsWithOpenAi,
   } from "@/lib/intelligence/productResearch/openAiCertificationResearch";
   
   import type {
    CertificationResearchOutput,
   } from "@/lib/intelligence/productResearch/openAiCertificationResearch";
   
   type SearchOpenAiResearchRequest = {
    productName: string;
   
    brand?: string | null;
   
    dosage?: string | null;
   
    form?: string | null;
   
    retailer?: string | null;
   
    shoppingProductId?:
      string | null;
   };
   
   function cleanValue(
    value:
      string | null | undefined
   ) {
    const cleaned =
      value?.trim();
   
    return cleaned || null;
   }
   
   /*
   * Builds an exact product identity for the
   * VidaSearch fallback.
   *
   * The additional identity fields help
   * prevent OpenAI from mixing claims from
   * similarly named products or variants.
   */
   function buildExactSearchProductName({
    productName,
    brand,
    dosage,
    form,
   }: SearchOpenAiResearchRequest) {
    const cleanedProductName =
      cleanValue(
        productName
      );
   
    if (!cleanedProductName) {
      throw new Error(
        "A product name is required for VidaSearch OpenAI research."
      );
    }
   
    const cleanedBrand =
      cleanValue(
        brand
      );
   
    const cleanedDosage =
      cleanValue(
        dosage
      );
   
    const cleanedForm =
      cleanValue(
        form
      );
   
    const identityParts = [
      cleanedBrand,
      cleanedProductName,
      cleanedDosage,
      cleanedForm,
    ].filter(
      (
        value
      ): value is string =>
        Boolean(value)
    );
   
    return Array.from(
      new Set(
        identityParts
      )
    ).join(" — ");
   }
   
   /*
   * VidaSearch-only final fallback.
   *
   * This function should run only after:
   *
   * 1. The research cache has been checked.
   * 2. Google Immersive data has been checked.
   * 3. The exact merchant page has been checked.
   * 4. An official manufacturer page has been
   *    checked when available.
   *
   * Results must be saved by the calling search
   * workflow so this expensive fallback is not
   * repeatedly invoked.
   */
   export async function
   researchSearchProductWithOpenAi(
    request:
      SearchOpenAiResearchRequest
   ): Promise<
    CertificationResearchOutput | null>
   {
    const exactProductName =
      buildExactSearchProductName(
        request
      );
   
    console.log(
      "VidaSearch OpenAI fallback started:",
      {
        productName:
          request.productName,
   
        brand:
          request.brand ??
          null,
   
        dosage:
          request.dosage ??
          null,
   
        form:
          request.form ??
          null,
   
        retailer:
          request.retailer ??
          null,
   
        shoppingProductId:
          request
            .shoppingProductId ??
          null,
   
        exactProductName,
      }
    );
   
    try {
      const result =
        await researchProductCertificationsWithOpenAi(
          exactProductName
        );
   
      console.log(
        "VidaSearch OpenAI fallback completed:",
        {
          productName:
            request.productName,
   
          shoppingProductId:
            request
              .shoppingProductId ??
            null,
   
          researchFound:
            Boolean(result),
   
          certifications:
            result
              ?.certifications ??
            [],
   
          qualityClaims:
            result
              ?.qualityClaims ??
            [],
        }
      );
   
      return result;
    } catch (error) {
      console.error(
        "VidaSearch OpenAI fallback failed:",
        {
          productName:
            request.productName,
   
          shoppingProductId:
            request
              .shoppingProductId ??
            null,
   
          error:
            error instanceof Error
              ? error.message
              : "Unknown OpenAI research error.",
        }
      );
   
      return null;
    }
   }
   