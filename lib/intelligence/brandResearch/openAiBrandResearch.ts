import OpenAI from "openai";

import type {
 BrandResearch,
} from "./brandResearchTypes";

type OpenAiEvidence = {
 source: string;
 url: string | null;
 notes: string | null;
};

type OpenAiBrandResearchResult = {
 canonicalName: string;

 website: string | null;

 practitionerGrade:
   boolean | null;

 thirdPartyTesting:
   boolean | null;

 cgmpCertified:
   boolean | null;

 veganOptions:
   boolean | null;

 hypoallergenic:
   boolean | null;

 certifications: string[];

 priceTier:
   | "budget"
   | "value"
   | "midrange"
   | "premium"
   | "professional"
   | null;

 availability:
   | "limited"
   | "moderate"
   | "wide"
   | "national"
   | null;

 confidence: number;

 evidence: OpenAiEvidence[];
};

const BRAND_RESEARCH_SCHEMA = {
 type: "object",

 additionalProperties: false,

 properties: {
   canonicalName: {
     type: "string",
   },

   website: {
     type: [
       "string",
       "null",
     ],
   },

   practitionerGrade: {
     type: [
       "boolean",
       "null",
     ],
   },

   thirdPartyTesting: {
     type: [
       "boolean",
       "null",
     ],
   },

   cgmpCertified: {
     type: [
       "boolean",
       "null",
     ],
   },

   veganOptions: {
     type: [
       "boolean",
       "null",
     ],
   },

   hypoallergenic: {
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

   priceTier: {
     anyOf: [
       {
         type: "string",

         enum: [
           "budget",
           "value",
           "midrange",
           "premium",
           "professional",
         ],
       },
       {
         type: "null",
       },
     ],
   },

   availability: {
     anyOf: [
       {
         type: "string",

         enum: [
           "limited",
           "moderate",
           "wide",
           "national",
         ],
       },
       {
         type: "null",
       },
     ],
   },

   confidence: {
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
         source: {
           type: "string",
         },

         url: {
           type: [
             "string",
             "null",
           ],
         },

         notes: {
           type: [
             "string",
             "null",
           ],
         },
       },

       required: [
         "source",
         "url",
         "notes",
       ],
     },
   },
 },

 required: [
   "canonicalName",
   "website",
   "practitionerGrade",
   "thirdPartyTesting",
   "cgmpCertified",
   "veganOptions",
   "hypoallergenic",
   "certifications",
   "priceTier",
   "availability",
   "confidence",
   "evidence",
 ],
} as const;

function nullableValue<T>(
 value: T | null
): T | undefined {
 return value === null
   ? undefined
   : value;
}

function cleanUrl(
 value: string | null
) {
 if (!value) {
   return undefined;
 }

 try {
   const parsed =
     new URL(value);

   if (
     parsed.protocol !==
       "https:" &&
     parsed.protocol !==
       "http:"
   ) {
     return undefined;
   }

   return parsed.toString();
 } catch {
   return undefined;
 }
}

function mapResearchResult(
 result: OpenAiBrandResearchResult
): BrandResearch {
 return {
   canonicalName:
     result.canonicalName.trim(),

   website:
     cleanUrl(
       result.website
     ),

   practitionerGrade:
     nullableValue(
       result.practitionerGrade
     ),

   thirdPartyTesting:
     nullableValue(
       result.thirdPartyTesting
     ),

   cgmpCertified:
     nullableValue(
       result.cgmpCertified
     ),

   veganOptions:
     nullableValue(
       result.veganOptions
     ),

   hypoallergenic:
     nullableValue(
       result.hypoallergenic
     ),

   certifications:
     result.certifications
       .map((certification) =>
         certification.trim()
       )
       .filter(Boolean),

   priceTier:
     nullableValue(
       result.priceTier
     ),

   availability:
     nullableValue(
       result.availability
     ),

   confidence:
     Math.max(
       0,
       Math.min(
         1,
         result.confidence
       )
     ),

   evidence:
     result.evidence
       .map((item) => ({
         source:
           item.source.trim(),

         url:
           cleanUrl(
             item.url
           ),

         notes:
           item.notes
             ?.trim() ||
           undefined,
       }))
       .filter(
         (item) =>
           item.source.length > 0
       ),
 };
}

export async function researchBrandWithOpenAi(
 brandName: string
): Promise<BrandResearch | null> {
 const apiKey =
   process.env.OPENAI_API_KEY;

 if (!apiKey) {
   throw new Error(
     "OPENAI_API_KEY is not configured."
   );
 }

 const client =
   new OpenAI({
     apiKey,
   });

 console.log(
   "OpenAI brand research started:",
   brandName
 );

 const response =
   await client.responses.create({
     model:
       "gpt-5.6",

     tools: [
       {
         type:
           "web_search",
       },
     ],

     instructions: `
You are a factual research analyst for VidaPouch, a supplement comparison service.

Research the named supplement brand using current public web sources.

Your task is to collect facts only. Do not recommend the brand and do not assign an overall product score.

Source priority:
1. Official brand or manufacturer website.
2. Official certification databases such as NSF or USP.
3. Government and regulatory sources.
4. Established national retailers.
5. Other reputable sources only when primary sources are unavailable.

Rules:
- Never infer a certification merely because a brand mentions quality.
- Never treat FDA facility registration as FDA product approval.
- A brand may follow cGMP without every product having an independent certification.
- Set a field to null when evidence is insufficient or contradictory.
- "Practitioner grade" is a distribution or positioning characteristic, not proof of superior quality.
- Only list certifications that you found evidence for.
- Do not treat retailer customer ratings as proof of testing or manufacturing quality.
- Price tier should describe the brand's general U.S. supplement market positioning.
- Availability should describe the general U.S. market.
- Every factual conclusion should be supported by an evidence entry.
- URLs must point to sources you actually used.
- Confidence must reflect the quality, agreement, and completeness of the evidence.
`,

     input: `
Research this supplement brand:

${brandName}

Confirm that the result refers to the correct brand and not merely a retailer, seller, product name, ingredient name, or similarly named company.
`,

     text: {
       format: {
         type:
           "json_schema",

         name:
           "brand_research",

         strict: true,

         schema:
           BRAND_RESEARCH_SCHEMA,
       },
     },
   });

 const outputText =
   response.output_text?.trim();

 if (!outputText) {
   console.error(
     "OpenAI returned no brand research:",
     brandName
   );

   return null;
 }

 let parsed:
   OpenAiBrandResearchResult;

 try {
   parsed =
     JSON.parse(
       outputText
     ) as OpenAiBrandResearchResult;
 } catch (error) {
   console.error(
     "Unable to parse OpenAI brand research:",
     {
       brandName,
       outputText,
       error,
     }
   );

   return null;
 }

 const research =
   mapResearchResult(
     parsed
   );

 console.log(
   "OpenAI brand research completed:",
   {
     requestedBrand:
       brandName,

     canonicalName:
       research.canonicalName,

     confidence:
       research.confidence,

     evidenceCount:
       research.evidence.length,

     certifications:
       research.certifications,
   }
 );

 return research;
}