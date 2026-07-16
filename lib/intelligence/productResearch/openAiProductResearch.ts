import {
    openai,
   } from "@/lib/openai";
   
   import type {
    ProductResearch,
   } from "./productResearchTypes";
   
   type OpenAiProductResearchEvidence = {
    title: string;
   
    source: string;
   
    url: string;
   
    confidence: number;
   
    extractedFacts: string[];
   };
   
   type OpenAiProductResearchResult = {
    supplement: string;
   
    brand: string;
   
    productName: string;
   
    dosage: string | null;
   
    servingSize: string | null;
   
    unitsPerContainer: number | null;
   
    form: string | null;
   
    capsuleType: string | null;
   
    manufacturer: string | null;
   
    countryOfOrigin: string | null;
   
    officialProductUrl: string | null;
   
    imageUrl: string | null;
   
    ingredientForm: string | null;
   
    ingredients: string[];
   
    inactiveIngredients: string[];
   
    allergens: string[];
   
    vegan: boolean | null;
   
    vegetarian: boolean | null;
   
    nonGmo: boolean | null;
   
    glutenFree: boolean | null;
   
    soyFree: boolean | null;
   
    dairyFree: boolean | null;
   
    artificialColors: boolean | null;
   
    artificialSweeteners:
      boolean | null;
   
    preservatives: boolean | null;
   
    thirdPartyTested:
      boolean | null;
   
    uspVerified: boolean | null;
   
    nsfCertified: boolean | null;
   
    cgmpManufactured:
      boolean | null;
   
    certifications: string[];
   
    commonBenefits: string[];
   
    commonComplaints: string[];
   
    averageRating: number | null;
   
    reviewCount: number | null;
   
    reviewSummary: string | null;
   
    aiSummary: string;
   
    aiConfidence: number;
   
    evidence:
      OpenAiProductResearchEvidence[];
   };
   
   const PRODUCT_RESEARCH_SCHEMA = {
    type: "object",
   
    additionalProperties: false,
   
    properties: {
      supplement: {
        type: "string",
      },
   
      brand: {
        type: "string",
      },
   
      productName: {
        type: "string",
      },
   
      dosage: {
        type: [
          "string",
          "null",
        ],
      },
   
      servingSize: {
        type: [
          "string",
          "null",
        ],
      },
   
      unitsPerContainer: {
        type: [
          "number",
          "null",
        ],
      },
   
      form: {
        type: [
          "string",
          "null",
        ],
      },
   
      capsuleType: {
        type: [
          "string",
          "null",
        ],
      },
   
      manufacturer: {
        type: [
          "string",
          "null",
        ],
      },
   
      countryOfOrigin: {
        type: [
          "string",
          "null",
        ],
      },
   
      officialProductUrl: {
        type: [
          "string",
          "null",
        ],
      },
   
      imageUrl: {
        type: [
          "string",
          "null",
        ],
      },
   
      ingredientForm: {
        type: [
          "string",
          "null",
        ],
      },
   
      ingredients: {
        type: "array",
   
        items: {
          type: "string",
        },
      },
   
      inactiveIngredients: {
        type: "array",
   
        items: {
          type: "string",
        },
      },
   
      allergens: {
        type: "array",
   
        items: {
          type: "string",
        },
      },
   
      vegan: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      vegetarian: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      nonGmo: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      glutenFree: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      soyFree: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      dairyFree: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      artificialColors: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      artificialSweeteners: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      preservatives: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      thirdPartyTested: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      uspVerified: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      nsfCertified: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      cgmpManufactured: {
        type: [
          "boolean",
          "null",
        ],
      },
   
      certifications: {
        type: "array",
   
        items: {
          type: "string",
        },
      },
   
      commonBenefits: {
        type: "array",
   
        items: {
          type: "string",
        },
      },
   
      commonComplaints: {
        type: "array",
   
        items: {
          type: "string",
        },
      },
   
      averageRating: {
        type: [
          "number",
          "null",
        ],
      },
   
      reviewCount: {
        type: [
          "number",
          "null",
        ],
      },
   
      reviewSummary: {
        type: [
          "string",
          "null",
        ],
      },
   
      aiSummary: {
        type: "string",
      },
   
      aiConfidence: {
        type: "number",
   
        minimum: 0,
   
        maximum: 1,
      },
   
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
   
            confidence: {
              type: "number",
   
              minimum: 0,
   
              maximum: 1,
            },
   
            extractedFacts: {
              type: "array",
   
              items: {
                type: "string",
              },
            },
          },
   
          required: [
            "title",
            "source",
            "url",
            "confidence",
            "extractedFacts",
          ],
        },
      },
    },
   
    required: [
      "supplement",
      "brand",
      "productName",
      "dosage",
      "servingSize",
      "unitsPerContainer",
      "form",
      "capsuleType",
      "manufacturer",
      "countryOfOrigin",
      "officialProductUrl",
      "imageUrl",
      "ingredientForm",
      "ingredients",
      "inactiveIngredients",
      "allergens",
      "vegan",
      "vegetarian",
      "nonGmo",
      "glutenFree",
      "soyFree",
      "dairyFree",
      "artificialColors",
      "artificialSweeteners",
      "preservatives",
      "thirdPartyTested",
      "uspVerified",
      "nsfCertified",
      "cgmpManufactured",
      "certifications",
      "commonBenefits",
      "commonComplaints",
      "averageRating",
      "reviewCount",
      "reviewSummary",
      "aiSummary",
      "aiConfidence",
      "evidence",
    ],
   } as const;
   
   function clamp(
    value: number,
    minimum: number,
    maximum: number
   ) {
    return Math.max(
      minimum,
      Math.min(
        maximum,
        value
      )
    );
   }
   
   function nullableString(
    value: string | null
   ): string | undefined {
    const normalized =
      value?.trim();
   
    return normalized
      ? normalized
      : undefined;
   }
   
   function nullableNumber(
    value: number | null
   ): number | undefined {
    if (
      value === null ||
      !Number.isFinite(value)
    ) {
      return undefined;
    }
   
    return value;
   }
   
   function cleanUrl(
    value: string | null
   ): string | undefined {
    if (!value) {
      return undefined;
    }
   
    try {
      const parsed =
        new URL(value);
   
      if (
        parsed.protocol !== "https:" &&
        parsed.protocol !== "http:"
      ) {
        return undefined;
      }
   
      return parsed.toString();
    } catch {
      return undefined;
    }
   }
   
   function cleanRequiredUrl(
    value: string
   ): string | undefined {
    return cleanUrl(value);
   }
   
   function cleanStrings(
    values: string[]
   ) {
    const normalized =
      values
        .map(
          (value) =>
            value.trim()
        )
        .filter(Boolean);
   
    return Array.from(
      new Set(normalized)
    );
   }
   
   function mapResearchResult(
    result:
      OpenAiProductResearchResult,
    requestedProductName: string
   ): ProductResearch {
    const evidence =
      result.evidence
        .map((item) => {
          const url =
            cleanRequiredUrl(
              item.url
            );
   
          if (!url) {
            return null;
          }
   
          const title =
            item.title.trim();
   
          const source =
            item.source.trim();
   
          if (
            !title ||
            !source
          ) {
            return null;
          }
   
          return {
            title,
   
            source,
   
            url,
   
            confidence:
              clamp(
                item.confidence,
                0,
                1
              ),
   
            extractedFacts:
              cleanStrings(
                item.extractedFacts
              ),
          };
        })
        .filter(
          (
            item
          ): item is NonNullable<
            typeof item
  > =>
            item !== null
        );
   
    const averageRating =
      nullableNumber(
        result.averageRating
      );
   
    const reviewCount =
      nullableNumber(
        result.reviewCount
      );
   
    return {
      supplement:
        result.supplement
          .trim(),
   
      brand:
        result.brand
          .trim(),
   
      productName:
        result.productName
          .trim() ||
        requestedProductName.trim(),
   
      dosage:
        nullableString(
          result.dosage
        ),
   
      servingSize:
        nullableString(
          result.servingSize
        ),
   
      unitsPerContainer:
        result.unitsPerContainer ===
          null
          ? undefined
          : Math.max(
              0,
              Math.round(
                result.unitsPerContainer
              )
            ),
   
      form:
        nullableString(
          result.form
        ),
   
      capsuleType:
        nullableString(
          result.capsuleType
        ),
   
      manufacturer:
        nullableString(
          result.manufacturer
        ),
   
      countryOfOrigin:
        nullableString(
          result.countryOfOrigin
        ),
   
      officialProductUrl:
        cleanUrl(
          result.officialProductUrl
        ),
   
      imageUrl:
        cleanUrl(
          result.imageUrl
        ),
   
      ingredientForm:
        nullableString(
          result.ingredientForm
        ),
   
      ingredients:
        cleanStrings(
          result.ingredients
        ),
   
      inactiveIngredients:
        cleanStrings(
          result.inactiveIngredients
        ),
   
      allergens:
        cleanStrings(
          result.allergens
        ),
   
      vegan:
        result.vegan,
   
      vegetarian:
        result.vegetarian,
   
      nonGmo:
        result.nonGmo,
   
      glutenFree:
        result.glutenFree,
   
      soyFree:
        result.soyFree,
   
      dairyFree:
        result.dairyFree,
   
      artificialColors:
        result.artificialColors,
   
      artificialSweeteners:
        result.artificialSweeteners,
   
      preservatives:
        result.preservatives,
   
      thirdPartyTested:
        result.thirdPartyTested,
   
      uspVerified:
        result.uspVerified,
   
      nsfCertified:
        result.nsfCertified,
   
      cgmpManufactured:
        result.cgmpManufactured,
   
      certifications:
        cleanStrings(
          result.certifications
        ),
   
      commonBenefits:
        cleanStrings(
          result.commonBenefits
        ),
   
      commonComplaints:
        cleanStrings(
          result.commonComplaints
        ),
   
      averageRating:
        averageRating === undefined
          ? undefined
          : clamp(
              averageRating,
              0,
              5
            ),
   
      reviewCount:
        reviewCount === undefined
          ? undefined
          : Math.max(
              0,
              Math.round(
                reviewCount
              )
            ),
   
      reviewSummary:
        nullableString(
          result.reviewSummary
        ),
   
      aiSummary:
        result.aiSummary
          .trim(),
   
      aiConfidence:
        clamp(
          result.aiConfidence,
          0,
          1
        ),
   
      evidence,
    };
   }
   
   export async function
   researchProductWithOpenAi(
    productName: string
   ): Promise<ProductResearch | null> {
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
   
    if (!normalizedProductName) {
      throw new Error(
        "A product name is required for product research."
      );
    }
   
    console.log(
      "OpenAI product research started:",
      normalizedProductName
    );
   
    const response =
      await openai.responses.create({
        model:
          "gpt-5.6",
   
        tools: [
          {
            type:
              "web_search",
          },
        ],
   
        instructions: `
   You are a factual product research analyst for VidaPouch, a supplement comparison and personalization service.
   
   Research one supplement product using current public web sources.
   
   Terminology:
   - Supplement: the nutrient or ingredient category, such as Vitamin C.
   - Brand: the company or consumer brand, such as NOW Foods.
   - Product: the brand plus the supplement product being evaluated.
   - Vendor listing: an offer for that product from a retailer or seller.
   
   Your task is to collect and structure product facts. Do not recommend the product and do not assign an overall product score.
   
   SOURCE PRIORITY
   
   1. The official manufacturer or brand product page.
   2. Official certification databases, including USP and NSF.
   3. Government, regulatory, NIH, or PubMed sources.
   4. Established national retailers and reputable specialty supplement retailers.
   5. Other reliable sources only when primary sources are unavailable.
   
   IDENTITY RULES
   
   - Confirm that every product-specific conclusion refers to the correct brand and supplement.
   - Do not confuse the brand with a retailer, marketplace seller, ingredient, dosage, or product subtitle.
   - Vendor-specific price, shipping, seller, and inventory data do not belong in this record.
   - Do not combine facts from different brands.
   - Do not apply facts from one product to every product made by the brand.
   - A brand-wide certification or manufacturing statement is not automatically a product-specific certification.
   - When a requested product name is broad, such as "NOW Foods Vitamin C," research the clearest current core product match and explain any identity limitation in the summary.
   
   FORMULATION RULES
   
   - Extract active and inactive ingredients only when supported by a source.
   - Do not guess whether a product is vegan, vegetarian, non-GMO, gluten-free, soy-free, or dairy-free.
   - Set the field to null when the claim is not clearly supported.
   - Artificial colors, artificial sweeteners, and preservatives must be based on the ingredient list or an explicit manufacturer statement.
   - Do not treat every excipient as artificial or harmful.
   - Preserve meaningful ingredient forms, such as magnesium glycinate, methylcobalamin, cholecalciferol, or ascorbic acid.
   
   TESTING AND CERTIFICATION RULES
   
   - Never infer third-party testing from general quality language.
   - Never infer USP verification or NSF certification without product-specific supporting evidence.
   - Do not treat FDA registration as FDA approval.
   - Do not treat cGMP manufacturing as proof that the finished product was independently tested.
   - Set certification fields to null when the evidence is insufficient or contradictory.
   - Only include certifications that are supported by evidence.
   
   REVIEW RULES
   
   - Use review ratings only when they plausibly refer to the same brand and supplement product.
   - Ratings may be aggregated across reputable vendor listings when the product identity is sufficiently consistent.
   - Do not fabricate an average rating or review count.
   - Use null when reliable review data cannot be established.
   - Summarize recurring benefits and complaints neutrally.
   - Customer reviews are not proof of clinical effectiveness, purity, or certification.
   
   SCIENTIFIC-EVIDENCE RULES
   
   - Distinguish evidence about the supplement ingredient from evidence about the exact commercial product.
   - Do not imply that an ingredient study tested the branded product unless it actually did.
   - Common benefits should be cautious, factual, and consistent with reliable evidence.
   - Do not make disease-treatment claims.
   - Do not use scientific evidence to invent product-specific formulation facts.
   
   EVIDENCE RULES
   
   - Every important factual conclusion must be supported by at least one evidence entry.
   - Evidence URLs must point to pages actually used.
   - Prefer direct product pages and official records.
   - Extracted facts must briefly identify what each source supports.
   - Source confidence must reflect the authority, specificity, and clarity of that source.
   - Overall AI confidence must reflect identity confidence, source quality, agreement among sources, and completeness.
   - When evidence is missing, ambiguous, or contradictory, use null or an empty array rather than guessing.
   
   OUTPUT RULES
   
   - Return facts only through the required JSON schema.
   - Use empty arrays when no reliable list information is available.
   - Use null for unknown optional scalar fields.
   - Keep aiSummary concise but informative.
   - Explicitly mention major identity uncertainty or conflicting evidence in aiSummary.
   `,
   
        input: `
   Research this supplement product:
   
   ${normalizedProductName}
   
   Confirm the correct brand and supplement identity before extracting product facts.
   
   Do not confuse this product with similarly named products, retailers, marketplace sellers, different formulations, or different brands.
   `,
   
        text: {
          format: {
            type:
              "json_schema",
   
            name:
              "product_research",
   
            strict: true,
   
            schema:
              PRODUCT_RESEARCH_SCHEMA,
          },
        },
      });
   
    const outputText =
      response.output_text
        ?.trim();
   
    if (!outputText) {
      console.error(
        "OpenAI returned no product research:",
        normalizedProductName
      );
   
      return null;
    }
   
    let parsed:
      OpenAiProductResearchResult;
   
    try {
      parsed =
        JSON.parse(
          outputText
        ) as OpenAiProductResearchResult;
    } catch (error) {
      console.error(
        "Unable to parse OpenAI product research:",
        {
          productName:
            normalizedProductName,
   
          outputText,
   
          error,
        }
      );
   
      return null;
    }
   
    const research =
      mapResearchResult(
        parsed,
        normalizedProductName
      );
   
    console.log(
      "OpenAI product research completed:",
      {
        requestedProduct:
          normalizedProductName,
   
        productName:
          research.productName,
   
        brand:
          research.brand,
   
        supplement:
          research.supplement,
   
        confidence:
          research.aiConfidence,
   
        evidenceCount:
          research.evidence.length,
   
        reviewCount:
          research.reviewCount,
   
        certifications:
          research.certifications,
      }
    );
   
    return research;
   }