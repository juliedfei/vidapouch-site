import {
  NextResponse,
 } from "next/server";
 
 import {
  researchSearchProductAttributes,
 } from "@/lib/search/researchSearchProductAttributes";
 
 import type {
  ProductResearch,
 } from "@/lib/intelligence/productResearch/productResearchTypes";
 
 export const runtime =
  "nodejs";
 
 export const dynamic =
  "force-dynamic";
 
 type EnrichmentRequest = {
  productName?: string;
 
  brand?: string;
 
  retailer?: string;
 
  bottlePrice?: number;
 
  shoppingProductId?: string;
 
  immersiveProductPageToken?: string;
 
  serpApiImmersiveProductUrl?: string;
 };
 
 function buildResponse({
  productName,
  shoppingProductId,
  research,
  durationMs,
 }: {
  productName: string;
 
  shoppingProductId:
    string | null;
 
  research:
    ProductResearch;
 
  durationMs: number;
 }) {
  const certifications =
    Array.isArray(
      research.certifications
    )
      ? research.certifications
      : [];
 
  const qualityClaims =
    Array.isArray(
      research.qualityClaims
    )
      ? research.qualityClaims
      : [];
 
  return {
    productName,
 
    shoppingProductId:
      research.shoppingProductId ??
      shoppingProductId,
 
    researchStatus:
      research.researchStatus ===
        "not-found"
        ? "undetermined" as const
        : "complete" as const,
 
    form:
      research.form ??
      null,
 
    dietaryPreferences: {
      vegan:
        research.vegan ===
        true,
 
      vegetarian:
        research.vegetarian ===
        true,
 
      glutenFree:
        research.glutenFree ===
        true,
 
      dairyFree:
        research.dairyFree ===
        true,
 
      soyFree:
        research.soyFree ===
        true,
 
      nonGmo:
        research.nonGmo ===
        true,
    },
 
    thirdPartyTesting: {
      thirdPartyTested:
        research
          .thirdPartyTested ===
        true,
 
      uspVerified:
        research.uspVerified ===
        true,
 
      nsfCertified:
        research.nsfCertified ===
        true,
 
      consumerLabTested:
        certifications.some(
          (certification) =>
            /\bconsumer\s*lab\b/i.test(
              certification
            )
        ),
 
      informedChoice:
        certifications.some(
          (certification) =>
            /\binformed\s+(?:choice|sport)\b/i.test(
              certification
            )
        ),
    },
 
    certifications,
 
    qualityClaims,
 
    evidenceCount:
      Array.isArray(
        research.evidence
      )
        ? research.evidence.length
        : 0,
 
    confidence:
      research.aiConfidence ??
      null,
 
    sourceUrl:
      research.officialProductUrl ??
      null,
 
    durationMs,
  };
 }
 
 export async function POST(
  request: Request
 ) {
  const startedAt =
    Date.now();
 
  try {
    const body =
      (await request.json()) as
        EnrichmentRequest;
 
    const productName =
      body.productName
        ?.trim() ||
      "";
 
    const brand =
      body.brand
        ?.trim() ||
      "";
 
    const retailer =
      body.retailer
        ?.trim() ||
      "";
 
    const shoppingProductId =
      body.shoppingProductId
        ?.trim() ||
      null;
 
    const immersiveProductPageToken =
      body
        .immersiveProductPageToken
        ?.trim() ||
      "";
 
    const bottlePrice =
      typeof body.bottlePrice ===
        "number" &&
      Number.isFinite(
        body.bottlePrice
      ) &&
      body.bottlePrice > 0
        ? body.bottlePrice
        : null;
 
    console.log(
      "VidaSearch enrichment route received:",
      {
        productName:
          productName ||
          null,
 
        brand:
          brand ||
          null,
 
        retailer:
          retailer ||
          null,
 
        shoppingProductId,
 
        bottlePrice,
 
        hasImmersiveProductPageToken:
          Boolean(
            immersiveProductPageToken
          ),
      }
    );
 
    if (!productName) {
      return NextResponse.json(
        {
          error:
            "Product name is required.",
        },
        {
          status: 400,
        }
      );
    }
 
    /*
     * The researcher performs:
     *
     * 1. Cache lookup by Shopping ID.
     * 2. Product-name cache fallback.
     * 3. One exact immersive lookup.
     * 4. One representative merchant-page
     *    extraction.
     * 5. Database save.
     *
     * It never calls OpenAI.
     */
    const research =
      await researchSearchProductAttributes({
        productName,
 
        brand,
 
        retailer,
 
        bottlePrice,
 
        shoppingProductId,
 
        immersiveProductPageToken,
 
        serpApiImmersiveProductUrl:
          body
            .serpApiImmersiveProductUrl
            ?.trim() ||
          null,
      });
 
    const durationMs =
      Date.now() -
      startedAt;
 
    if (!research) {
      const response = {
        productName,
 
        shoppingProductId,
 
        researchStatus:
          "undetermined" as const,
 
        form:
          null,
 
        dietaryPreferences: {
          vegan:
            false,
 
          vegetarian:
            false,
 
          glutenFree:
            false,
 
          dairyFree:
            false,
 
          soyFree:
            false,
 
          nonGmo:
            false,
        },
 
        thirdPartyTesting: {
          thirdPartyTested:
            false,
 
          uspVerified:
            false,
 
          nsfCertified:
            false,
 
          consumerLabTested:
            false,
 
          informedChoice:
            false,
        },
 
        certifications:
          [] as string[],
 
        qualityClaims:
          [] as string[],
 
        evidenceCount:
          0,
 
        confidence:
          null,
 
        sourceUrl:
          null,
 
        durationMs,
      };
 
      console.log(
        "VidaSearch enrichment returned no product research:",
        {
          productName,
 
          shoppingProductId,
 
          retailer:
            retailer ||
            null,
 
          durationMs,
        }
      );
 
      return NextResponse.json(
        response
      );
    }
 
    const response =
      buildResponse({
        productName,
 
        shoppingProductId,
 
        research,
 
        durationMs,
      });
 
    console.log(
      "VidaSearch enrichment route completed:",
      {
        productName,
 
        shoppingProductId:
          response.shoppingProductId,
 
        researchStatus:
          response.researchStatus,
 
        certifications:
          response.certifications,
 
        qualityClaims:
          response.qualityClaims,
 
        evidenceCount:
          response.evidenceCount,
 
        sourceUrl:
          response.sourceUrl,
 
        durationMs,
      }
    );
 
    return NextResponse.json(
      response
    );
  } catch (error) {
    const durationMs =
      Date.now() -
      startedAt;
 
    console.error(
      "VidaSearch enrichment route failed:",
      {
        durationMs,
 
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
 
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Product enrichment failed.",
 
        durationMs,
      },
      {
        status: 500,
      }
    );
  }
 }