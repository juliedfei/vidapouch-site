import {
    NextResponse,
   } from "next/server";
   
   import {
    researchSearchProductAttributes,
   } from "@/lib/search/researchSearchProductAttributes";
   
   export const runtime =
    "nodejs";
   
   export const dynamic =
    "force-dynamic";
   
   export async function POST(
    request: Request
   ) {
    const startedAt =
      Date.now();
   
    try {
      const body =
        (await request.json()) as {
          productName?: string;
        };
   
      const productName =
        body.productName?.trim();
   
      console.log(
        "VitaSearch enrichment route received:",
        {
          productName:
            productName || null,
        }
      );
   
      if (!productName) {
        console.error(
          "VitaSearch enrichment route rejected: missing product name"
        );
   
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
   
      const research =
        await researchSearchProductAttributes(
          productName
        );
   
      const durationMs =
        Date.now() - startedAt;
   
      if (!research) {
        console.error(
          "VitaSearch enrichment route returned no research:",
          {
            productName,
            durationMs,
          }
        );
   
        return NextResponse.json(
          {
            productName,
            research: null,
            durationMs,
          }
        );
      }
   
      const response = {
        productName,
   
        researchStatus:
          "complete" as const,
   
        form:
          research.form ?? null,
   
        dietaryPreferences: {
          vegan:
            research.vegan === true,
   
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
            research.soyFree === true,
   
          nonGmo:
            research.nonGmo === true,
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
            research.certifications.some(
              (certification) =>
                /\bconsumer\s*lab\b/i.test(
                  certification
                )
            ),
   
          informedChoice:
            research.certifications.some(
              (certification) =>
                /\binformed\s+(?:choice|sport)\b/i.test(
                  certification
                )
            ),
        },
   
        certifications:
          research.certifications,
   
        evidenceCount:
          research.evidence.length,
   
        confidence:
          research.aiConfidence,
   
        durationMs,
      };
   
      console.log(
        "VitaSearch enrichment route completed:",
        response
      );
   
      return NextResponse.json(
        response
      );
    } catch (error) {
      const durationMs =
        Date.now() - startedAt;
   
      console.error(
        "VitaSearch enrichment route failed:",
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
   