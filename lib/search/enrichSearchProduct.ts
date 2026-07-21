import type {
  SearchDietaryPreferences,
  SearchThirdPartyTesting,
 } from "./searchProductOption";
 
 export type SearchProductEnrichmentRequest = {
  productName: string;
 
  brand?: string;
 
  retailer?: string;
 
  bottlePrice?: number;
 
  shoppingProductId?: string;
 
  immersiveProductPageToken?: string;
 
  serpApiImmersiveProductUrl?: string;
 
  signal?: AbortSignal;
 };
 
 export type SearchProductEnrichment = {
  productName: string;
 
  shoppingProductId?: string | null;
 
  researchStatus?:
    | "complete"
    | "undetermined";
 
  form?: string | null;
 
  dietaryPreferences?:
    SearchDietaryPreferences;
 
  thirdPartyTesting?:
    SearchThirdPartyTesting;
 
  certifications?: string[];
 
  qualityClaims?: string[];
 
  evidenceCount?: number;
 
  confidence?: number;
 
  durationMs?: number;
 
  sourceUrl?: string | null;
 
  research?: null;
 
  error?: string;
 };
 
 export async function
 enrichSearchProduct({
  productName,
  brand,
  retailer,
  bottlePrice,
  shoppingProductId,
  immersiveProductPageToken,
  serpApiImmersiveProductUrl,
  signal,
 }: SearchProductEnrichmentRequest): Promise<SearchProductEnrichment> {
  console.log(
    "VidaSearch browser enrichment requested:",
    {
      productName,
 
      brand:
        brand || null,
 
      retailer:
        retailer || null,
 
      shoppingProductId:
        shoppingProductId ||
        null,
 
      hasImmersiveProductPageToken:
        Boolean(
          immersiveProductPageToken
        ),
    }
  );
 
  const response =
    await fetch(
      "/api/search/enrich",
      {
        method:
          "POST",
 
        headers: {
          "Content-Type":
            "application/json",
        },
 
        body:
          JSON.stringify({
            productName,
 
            brand:
              brand ||
              undefined,
 
            retailer:
              retailer ||
              undefined,
 
            bottlePrice:
              typeof bottlePrice ===
                "number" &&
              Number.isFinite(
                bottlePrice
              )
                ? bottlePrice
                : undefined,
 
            shoppingProductId:
              shoppingProductId ||
              undefined,
 
            immersiveProductPageToken:
              immersiveProductPageToken ||
              undefined,
 
            serpApiImmersiveProductUrl:
              serpApiImmersiveProductUrl ||
              undefined,
          }),
 
        signal,
      }
    );
 
  const body =
    (await response
      .json()
      .catch(
        () => null
      )) as
      | SearchProductEnrichment
      | null;
 
  if (!response.ok) {
    const message =
      body?.error ||
      "Product enrichment failed.";
 
    console.error(
      "VidaSearch browser enrichment failed:",
      {
        productName,
 
        shoppingProductId:
          shoppingProductId ||
          null,
 
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
      "VidaSearch browser enrichment returned an empty response:",
      {
        productName,
 
        shoppingProductId:
          shoppingProductId ||
          null,
      }
    );
 
    throw new Error(
      "Product enrichment returned no response."
    );
  }
 
  console.log(
    "VidaSearch browser enrichment completed:",
    {
      productName,
 
      shoppingProductId:
        body.shoppingProductId ??
        shoppingProductId ??
        null,
 
      researchStatus:
        body.researchStatus ??
        null,
 
      form:
        body.form ??
        null,
 
      dietaryPreferences:
        body.dietaryPreferences ??
        null,
 
      thirdPartyTesting:
        body.thirdPartyTesting ??
        null,
 
      certifications:
        body.certifications ??
        [],
 
      qualityClaims:
        body.qualityClaims ??
        [],
 
      evidenceCount:
        body.evidenceCount ??
        0,
 
      sourceUrl:
        body.sourceUrl ??
        null,
 
      durationMs:
        body.durationMs ??
        null,
    }
  );
 
  return body;
 }
 