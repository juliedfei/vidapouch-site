import type {
    SearchDietaryPreferences,
    SearchThirdPartyTesting,
   } from "./searchProductOption";
   
   export type SearchProductEnrichment = {
    productName: string;
   
    researchStatus?:
      | "complete"
      | "undetermined";
   
    form?: string | null;
   
    dietaryPreferences?:
      SearchDietaryPreferences;
   
    thirdPartyTesting?:
      SearchThirdPartyTesting;
   
    certifications?: string[];
   
    evidenceCount?: number;
   
    confidence?: number;
   
    durationMs?: number;
   
    research?: null;
   
    error?: string;
   };
   
   export async function enrichSearchProduct({
    productName,
    signal,
   }: {
    productName: string;
    signal?: AbortSignal;
   }): Promise<SearchProductEnrichment> {
    console.log(
      "VitaSearch browser enrichment requested:",
      {
        productName,
      }
    );
   
    const response = await fetch(
      "/api/search/enrich",
      {
        method: "POST",
   
        headers: {
          "Content-Type":
            "application/json",
        },
   
        body: JSON.stringify({
          productName,
        }),
   
        signal,
      }
    );
   
    const body =
      (await response
        .json()
        .catch(() => null)) as
        | SearchProductEnrichment
        | null;
   
    if (!response.ok) {
      const message =
        body?.error ||
        "Product enrichment failed.";
   
      console.error(
        "VitaSearch browser enrichment failed:",
        {
          productName,
          status:
            response.status,
          message,
        }
      );
   
      throw new Error(
        message
      );
    }
   
    if (!body) {
      console.error(
        "VitaSearch browser enrichment returned an empty response:",
        {
          productName,
        }
      );
   
      throw new Error(
        "Product enrichment returned no response."
      );
    }
   
    console.log(
      "VitaSearch browser enrichment completed:",
      {
        productName,
   
        researchStatus:
          body.researchStatus ??
          null,
   
        form:
          body.form ?? null,
   
        dietaryPreferences:
          body.dietaryPreferences ??
          null,
   
        thirdPartyTesting:
          body.thirdPartyTesting ??
          null,
   
        certifications:
          body.certifications ??
          [],
   
        evidenceCount:
          body.evidenceCount ??
          0,
   
        durationMs:
          body.durationMs ??
          null,
      }
    );
   
    return body;
   }
   