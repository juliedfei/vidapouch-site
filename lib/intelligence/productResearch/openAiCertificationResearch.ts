import {
    openai,
   } from "@/lib/openai";
   
   import type {
    ProductClaim,
    ProductClaimSource,
    ProductCertificationResearch,
    ProductDietaryResearch,
   } from "./productResearchTypes";
   
   type CertificationEvidenceResult = {
    title: string;
   
    source: string;
   
    url: string;
   
    evidenceText: string | null;
   
    confidence: number;
   
    sourceType:
      | "official-registry"
      | "manufacturer-page"
      | "product-label"
      | "retailer-page"
      | "structured-data"
      | "third-party-database"
      | "other";
   };
   
   type CertificationFactResult = {
    value:
      boolean | null;
   
    status:
      | "verified"
      | "claimed"
      | "not-verified"
      | "not-found"
      | "conflicting";
   
    confidence: number;
   
    scope:
      | "product"
      | "manufacturer"
      | "facility"
      | "brand"
      | "unknown";
   
    note:
      string | null;
   
    evidenceIndexes:
      number[];
   };
   
   type OpenAiCertificationResearchResult = {
    nsfCertified:
      CertificationFactResult;
   
    nsfCertifiedForSport:
      CertificationFactResult;
   
    uspVerified:
      CertificationFactResult;
   
    nonGmoProjectVerified:
      CertificationFactResult;
   
    informedChoiceCertified:
      CertificationFactResult;
   
    informedSportCertified:
      CertificationFactResult;
   
    bannedSubstanceTested:
      CertificationFactResult;
   
    gmpQualityAssured:
      CertificationFactResult;
   
    cgmpManufactured:
      CertificationFactResult;
   
    npaGmpCertified:
      CertificationFactResult;
   
    thirdPartyTested:
      CertificationFactResult;
   
    vegan:
      CertificationFactResult;
   
    vegetarian:
      CertificationFactResult;
   
    glutenFree:
      CertificationFactResult;
   
    nonGmo:
      CertificationFactResult;
   
    soyFree:
      CertificationFactResult;
   
    dairyFree:
      CertificationFactResult;
   
    sugarFree:
      CertificationFactResult;
   
    kosher:
      CertificationFactResult;
   
    halal:
      CertificationFactResult;
   
    organic:
      CertificationFactResult;
   
    artificialColors:
      CertificationFactResult;
   
    artificialFlavors:
      CertificationFactResult;
   
    artificialSweeteners:
      CertificationFactResult;
   
    preservatives:
      CertificationFactResult;
   
    evidence:
      CertificationEvidenceResult[];
   };
   
   export type CertificationResearchOutput = {
    certificationClaims:
      ProductCertificationResearch;
   
    dietaryClaims:
      ProductDietaryResearch;
   
    certifications:
      string[];
   
    qualityClaims:
      string[];
   
    aiConfidence:
      number;
   };
   
   const CLAIM_SCHEMA = {
    type: "object",
   
    additionalProperties:
      false,
   
    properties: {
      value: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      status: {
        type: "string",
   
        enum: [
          "verified",
          "claimed",
          "not-verified",
          "not-found",
          "conflicting",
        ],
      },
   
      confidence: {
        type: "number",
   
        minimum: 0,
   
        maximum: 1,
      },
   
      scope: {
        type: "string",
   
        enum: [
          "product",
          "manufacturer",
          "facility",
          "brand",
          "unknown",
        ],
      },
   
      note: {
        type: [
          "string",
          "null",
        ],
      },
   
      evidenceIndexes: {
        type: "array",
   
        items: {
          type: "integer",
        },
      },
    },
   
    required: [
      "value",
      "status",
      "confidence",
      "scope",
      "note",
      "evidenceIndexes",
    ],
   } as const;
   
   const CERTIFICATION_RESEARCH_SCHEMA = {
    type: "object",
   
    additionalProperties:
      false,
   
    properties: {
      nsfCertified:
        CLAIM_SCHEMA,
   
      nsfCertifiedForSport:
        CLAIM_SCHEMA,
   
      uspVerified:
        CLAIM_SCHEMA,
   
      nonGmoProjectVerified:
        CLAIM_SCHEMA,
   
      informedChoiceCertified:
        CLAIM_SCHEMA,
   
      informedSportCertified:
        CLAIM_SCHEMA,
   
      bannedSubstanceTested:
        CLAIM_SCHEMA,
   
      gmpQualityAssured:
        CLAIM_SCHEMA,
   
      cgmpManufactured:
        CLAIM_SCHEMA,
   
      npaGmpCertified:
        CLAIM_SCHEMA,
   
      thirdPartyTested:
        CLAIM_SCHEMA,
   
      vegan:
        CLAIM_SCHEMA,
   
      vegetarian:
        CLAIM_SCHEMA,
   
      glutenFree:
        CLAIM_SCHEMA,
   
      nonGmo:
        CLAIM_SCHEMA,
   
      soyFree:
        CLAIM_SCHEMA,
   
      dairyFree:
        CLAIM_SCHEMA,
   
      sugarFree:
        CLAIM_SCHEMA,
   
      kosher:
        CLAIM_SCHEMA,
   
      halal:
        CLAIM_SCHEMA,
   
      organic:
        CLAIM_SCHEMA,
   
      artificialColors:
        CLAIM_SCHEMA,
   
      artificialFlavors:
        CLAIM_SCHEMA,
   
      artificialSweeteners:
        CLAIM_SCHEMA,
   
      preservatives:
        CLAIM_SCHEMA,
   
      evidence: {
        type: "array",
   
        items: {
          type: "object",
   
          additionalProperties:
            false,
   
          properties: {
            title: {
              type: "string",
            },
   
            source: {
              type: "string",
            },
   
            url: {
              type: "string",
            },
   
            evidenceText: {
              type: [
                "string",
                "null",
              ],
            },
   
            confidence: {
              type: "number",
   
              minimum: 0,
   
              maximum: 1,
            },
   
            sourceType: {
              type: "string",
   
              enum: [
                "official-registry",
                "manufacturer-page",
                "product-label",
                "retailer-page",
                "structured-data",
                "third-party-database",
                "other",
              ],
            },
          },
   
          required: [
            "title",
            "source",
            "url",
            "evidenceText",
            "confidence",
            "sourceType",
          ],
        },
      },
    },
   
    required: [
      "nsfCertified",
      "nsfCertifiedForSport",
      "uspVerified",
      "nonGmoProjectVerified",
      "informedChoiceCertified",
      "informedSportCertified",
      "bannedSubstanceTested",
      "gmpQualityAssured",
      "cgmpManufactured",
      "npaGmpCertified",
      "thirdPartyTested",
      "vegan",
      "vegetarian",
      "glutenFree",
      "nonGmo",
      "soyFree",
      "dairyFree",
      "sugarFree",
      "kosher",
      "halal",
      "organic",
      "artificialColors",
      "artificialFlavors",
      "artificialSweeteners",
      "preservatives",
      "evidence",
    ],
   } as const;
   
   function clamp(
    value: number
   ) {
    return Math.max(
      0,
      Math.min(
        1,
        value
      )
    );
   }
   
   function cleanUrl(
    value: string
   ) {
    try {
      const parsed =
        new URL(value);
   
      if (
        parsed.protocol !==
          "https:" &&
        parsed.protocol !==
          "http:"
      ) {
        return null;
      }
   
      return parsed.toString();
    } catch {
      return null;
    }
   }
   





   function buildSources(
 result:
   OpenAiCertificationResearchResult,

 evidenceIndexes:
   number[]
): ProductClaimSource[] {
 return evidenceIndexes.flatMap(
   (
     index
   ): ProductClaimSource[] => {
     const evidence =
       result.evidence[
         index
       ];

     if (!evidence) {
       return [];
     }

     const url =
       cleanUrl(
         evidence.url
       );

     const title =
       evidence.title.trim();

     const source =
       evidence.source.trim();

     if (
       !url ||
       !title ||
       !source
     ) {
       return [];
     }

     return [
       {
         title,

         source,

         url,

         sourceType:
           evidence.sourceType,

         evidenceText:
           evidence.evidenceText
             ?.trim() ||
           undefined,

         confidence:
           clamp(
             evidence.confidence
           ),

         checkedAt:
           new Date()
             .toISOString(),
       },
     ];
   }
 );
}




   
   function mapClaim(
    result:
      OpenAiCertificationResearchResult,
    claim:
      CertificationFactResult
   ): ProductClaim {
    return {
      value:
        claim.value,
   
      status:
        claim.status,
   
      confidence:
        clamp(
          claim.confidence
        ),
   
      scope:
        claim.scope,
   
      sources:
        buildSources(
          result,
          claim.evidenceIndexes
        ),
   
      note:
        claim.note
          ?.trim() ||
        undefined,
    };
   }
   
   function isPositiveProductClaim(
    claim:
      ProductClaim
   ) {
    return (
      claim.value === true &&
      (
        claim.status ===
          "verified" ||
        claim.status ===
          "claimed"
      )
    );
   }
   
   export async function
   researchProductCertificationsWithOpenAi(
    productName: string
   ): Promise<
    CertificationResearchOutput | null>
   {
    if (
      !process.env
        .OPENAI_API_KEY
    ) {
      throw new Error(
        "OPENAI_API_KEY is not configured."
      );
    }
   
    const normalizedProductName =
      productName.trim();
   
    if (
      !normalizedProductName
    ) {
      throw new Error(
        "A product name is required for certification research."
      );
    }
   
    console.log(
      "OpenAI certification research started:",
      normalizedProductName
    );
   
    const response =
      await openai.responses.create({
        /*
         * Use a smaller model for this narrow,
         * structured research task.
         */
        model:
          "gpt-5-mini",
   
        tools: [
          {
            type:
              "web_search",
          },
        ],
   
        instructions: `
   You research certification, manufacturing, and dietary claims for one exact supplement product for VidaPouch.
   
   Research only the claims requested in the output schema. Do not research customer reviews, scientific benefits, prices, or general supplement advice.
   
   SOURCE PRIORITY
   
   1. Official product-level certification registries.
   2. Official manufacturer product pages.
   3. Official product labels or Supplement Facts pages.
   4. Established national retailer pages for the exact product.
   5. Reliable third-party databases only when primary sources are unavailable.
   
   IDENTITY RULES
   
   - Confirm the exact brand, product name, dosage, form, and package variant.
   - Do not mix claims from similarly named products.
   - Do not automatically apply brand-wide claims to the exact product.
   - Do not treat a retailer as the manufacturer.
   - Use null and not-found when identity or evidence is insufficient.
   
   CERTIFICATION RULES
   
   - NSF Certified and NSF Certified for Sport require product-specific evidence.
   - USP Verified requires product-specific evidence.
   - Non-GMO Project Verified requires product-specific evidence.
   - NPA GMP may apply to a manufacturer or facility rather than the exact product.
   - GMP or cGMP manufacturing is not the same as independent finished-product certification.
   - Third-party tested must be explicitly stated by a reliable source.
   - FDA registration is not FDA approval or product certification.
   
   DIETARY CLAIM RULES
   
   - Do not infer vegan, vegetarian, gluten-free, non-GMO, soy-free, dairy-free, sugar-free, kosher, halal, or organic status.
   - Use explicit label or manufacturer evidence.
   - For artificial colors, flavors, sweeteners, and preservatives, rely on explicit claims or a clear ingredient list.
   
   STATUS RULES
   
   - verified: authoritative or official product-level evidence.
   - claimed: an official manufacturer or exact retailer page states the claim, but it is not independently verified.
   - not-verified: a reliable source specifically indicates the claim does not apply.
   - not-found: insufficient evidence.
   - conflicting: reliable sources disagree.
   
   SCOPE RULES
   
   - product: evidence applies to the exact product.
   - manufacturer: applies only to the manufacturer.
   - facility: applies only to a manufacturing facility.
   - brand: applies broadly to the brand.
   - unknown: scope cannot be established.
   
   EVIDENCE RULES
   
   - Include only sources actually used.
   - Keep evidence text brief.
   - Each claim must reference supporting evidence by zero-based evidenceIndexes.
   - Do not fabricate URLs or evidence.
   - Return facts only through the required JSON schema.
   `,
   
        input: `
   Research certification, manufacturing, and dietary claims for this exact supplement product:
   
   ${normalizedProductName}
   `,
   
        text: {
          format: {
            type:
              "json_schema",
   
            name:
              "certification_research",
   
            strict: true,
   
            schema:
              CERTIFICATION_RESEARCH_SCHEMA,
          },
        },
      });
   
    const outputText =
      response.output_text
        ?.trim();
   
    if (!outputText) {
      console.error(
        "OpenAI returned no certification research:",
        normalizedProductName
      );
   
      return null;
    }
   
    let parsed:
      OpenAiCertificationResearchResult;
   
    try {
      parsed =
        JSON.parse(
          outputText
        ) as
          OpenAiCertificationResearchResult;
    } catch (error) {
      console.error(
        "Unable to parse OpenAI certification research:",
        {
          productName:
            normalizedProductName,
   
          error,
        }
      );
   
      return null;
    }
   
    const certificationClaims:
      ProductCertificationResearch = {
        nsfCertified:
          mapClaim(
            parsed,
            parsed.nsfCertified
          ),
   
        nsfCertifiedForSport:
          mapClaim(
            parsed,
            parsed.nsfCertifiedForSport
          ),
   
        uspVerified:
          mapClaim(
            parsed,
            parsed.uspVerified
          ),
   
        nonGmoProjectVerified:
          mapClaim(
            parsed,
            parsed.nonGmoProjectVerified
          ),
   
        informedChoiceCertified:
          mapClaim(
            parsed,
            parsed.informedChoiceCertified
          ),
   
        informedSportCertified:
          mapClaim(
            parsed,
            parsed.informedSportCertified
          ),
   
        bannedSubstanceTested:
          mapClaim(
            parsed,
            parsed.bannedSubstanceTested
          ),
   
        gmpQualityAssured:
          mapClaim(
            parsed,
            parsed.gmpQualityAssured
          ),
   
        cgmpManufactured:
          mapClaim(
            parsed,
            parsed.cgmpManufactured
          ),
   
        npaGmpCertified:
          mapClaim(
            parsed,
            parsed.npaGmpCertified
          ),
   
        thirdPartyTested:
          mapClaim(
            parsed,
            parsed.thirdPartyTested
          ),
      };
   
    const dietaryClaims:
      ProductDietaryResearch = {
        vegan:
          mapClaim(
            parsed,
            parsed.vegan
          ),
   
        vegetarian:
          mapClaim(
            parsed,
            parsed.vegetarian
          ),
   
        glutenFree:
          mapClaim(
            parsed,
            parsed.glutenFree
          ),
   
        nonGmo:
          mapClaim(
            parsed,
            parsed.nonGmo
          ),
   
        soyFree:
          mapClaim(
            parsed,
            parsed.soyFree
          ),
   
        dairyFree:
          mapClaim(
            parsed,
            parsed.dairyFree
          ),
   
        sugarFree:
          mapClaim(
            parsed,
            parsed.sugarFree
          ),
   
        kosher:
          mapClaim(
            parsed,
            parsed.kosher
          ),
   
        halal:
          mapClaim(
            parsed,
            parsed.halal
          ),
   
        organic:
          mapClaim(
            parsed,
            parsed.organic
          ),
   
        artificialColors:
          mapClaim(
            parsed,
            parsed.artificialColors
          ),
   
        artificialFlavors:
          mapClaim(
            parsed,
            parsed.artificialFlavors
          ),
   
        artificialSweeteners:
          mapClaim(
            parsed,
            parsed.artificialSweeteners
          ),
   
        preservatives:
          mapClaim(
            parsed,
            parsed.preservatives
          ),
      };
   
    const certificationLabels = [
      [
        "NSF Certified",
        certificationClaims
          .nsfCertified,
      ],
   
      [
        "NSF Certified for Sport",
        certificationClaims
          .nsfCertifiedForSport,
      ],
   
      [
        "USP Verified",
        certificationClaims
          .uspVerified,
      ],
   
      [
        "Non-GMO Project Verified",
        certificationClaims
          .nonGmoProjectVerified,
      ],
   
      [
        "Informed Choice Certified",
        certificationClaims
          .informedChoiceCertified,
      ],
   
      [
        "Informed Sport Certified",
        certificationClaims
          .informedSportCertified,
      ],
    ] as const;
   
    const certifications =
      certificationLabels
        .filter(
          (
            [, claim]
          ) =>
            isPositiveProductClaim(
              claim
            ) &&
            claim.scope ===
              "product"
        )
        .map(
          ([label]) =>
            label
        );
   
    const qualityLabels = [
      [
        "GMP Quality Assured",
        certificationClaims
          .gmpQualityAssured,
      ],
   
      [
        "cGMP Manufactured",
        certificationClaims
          .cgmpManufactured,
      ],
   
      [
        "NPA GMP Certified",
        certificationClaims
          .npaGmpCertified,
      ],
   
      [
        "Third-Party Tested",
        certificationClaims
          .thirdPartyTested,
      ],
    ] as const;
   
    const qualityClaims =
      qualityLabels
        .filter(
          (
            [, claim]
          ) =>
            isPositiveProductClaim(
              claim
            )
        )
        .map(
          ([label]) =>
            label
        );
   
    const allClaims = [
      ...Object.values(
        certificationClaims
      ),
   
      ...Object.values(
        dietaryClaims
      ),
    ];
   
    const supportedClaims =
      allClaims.filter(
        (claim) =>
          claim.value === true
      );
   
    const aiConfidence =
      supportedClaims.length >
        0
        ? supportedClaims.reduce(
            (
              total,
              claim
            ) =>
              total +
              claim.confidence,
            0
          ) /
          supportedClaims.length
        : 0;
   
    console.log(
      "OpenAI certification research completed:",
      {
        productName:
          normalizedProductName,
   
        certifications,
   
        qualityClaims,
   
        evidenceCount:
          parsed.evidence.length,
   
        confidence:
          aiConfidence,
      }
    );
   
    return {
      certificationClaims,
   
      dietaryClaims,
   
      certifications,
   
      qualityClaims,
   
      aiConfidence:
        clamp(
          aiConfidence
        ),
    };
   }
   