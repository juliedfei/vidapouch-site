import OpenAI from "openai";

import type {
 OpenAiBrandResolution,
} from "../brandResolutionTypes";

const DEFAULT_BRAND_MODEL =
 "gpt-5-mini";

/*
* Keep background batches deliberately small.
*
* Health-goal searches can contain hundreds of titles.
* Only a limited number of unresolved titles should be
* researched during each background run.
*/
const MAX_TITLES_PER_BATCH =
 20;

const MAX_TITLE_LENGTH =
 300;

const MAX_RETAILER_LENGTH =
 120;

const MAX_PARSER_CANDIDATE_LENGTH =
 120;

/*
* The previous value of 1,400 was too restrictive for
* a strict 20-item structured response.
*
* Even short objects can consume substantial output
* tokens once JSON property names and punctuation are
* included.
*/
const MAX_OUTPUT_TOKENS =
 4000;

type BrandTitleInput = {
 key:
   string;

 productTitle:
   string;

 retailer?:
   string;

 /*
  * Optional deterministic-parser proposal.
  *
  * Existing callers do not need to provide this
  * immediately. When supplied, OpenAI treats it as an
  * untrusted hypothesis that must be corrected.
  */
 parserCandidate?:
   string | null;
};

type OpenAiBrandBatchItem = {
 key:
   string;

 canonicalBrand:
   string | null;

 observedAlias:
   string | null;

 existingBrandLikely:
   boolean;

 identifiable:
   boolean;

 confidence:
   number;
};

type OpenAiBrandBatchResponse = {
 results:
   OpenAiBrandBatchItem[];
};

type OpenAiResponseDiagnostic = {
 status?:
   unknown;

 incomplete_details?:
   unknown;

 error?:
   unknown;

 output?:
   unknown;
};

let openAiClient:
 OpenAI | null =
 null;

function getOpenAiClient() {
 if (
   openAiClient
 ) {
   return openAiClient;
 }

 const apiKey =
   process.env
     .OPENAI_API_KEY;

 if (
   !apiKey
 ) {
   return null;
 }

 openAiClient =
   new OpenAI({
     apiKey,
   });

 return openAiClient;
}

function isOpenAiBrandResolutionEnabled() {
 return (
   process.env
     .ENABLE_OPENAI_BRAND_RESOLUTION ===
   "true"
 );
}

function getBrandResolutionModel() {
 return (
   process.env
     .OPENAI_BRAND_RESOLUTION_MODEL
     ?.trim() ||
   DEFAULT_BRAND_MODEL
 );
}

function cleanText(
 value:
   string
) {
 return value
   .replace(
     /\s+/g,
     " "
   )
   .trim();
}

function cleanBrandText(
 value:
   string
) {
 return cleanText(
   value
 )
   .replace(
     /^[\s,;:|/\\–—-]+/,
     ""
   )
   .replace(
     /[\s,;:|/\\–—-]+$/,
     ""
   )
   .trim();
}

function normalizeTitleKey(
 value:
   string
) {
 return cleanText(
   value
 )
   .toLowerCase()
   .replace(
     /[®™©]/g,
     ""
   )
   .replace(
     /['’]/g,
     "'"
   );
}

function normalizeComparisonText(
 value:
   string
) {
 return cleanBrandText(
   value
 )
   .toLowerCase()
   .replace(
     /[®™©]/g,
     ""
   )
   .replace(
     /&/g,
     " and "
   )
   .replace(
     /['’]/g,
     ""
   )
   .replace(
     /[^a-z0-9]+/g,
     " "
   )
   .replace(
     /\s+/g,
     " "
   )
   .trim();
}

function clampConfidence(
 value:
   unknown
) {
 if (
   typeof value !==
     "number" ||
   !Number.isFinite(
     value
   )
 ) {
   return 0;
 }

 return Math.max(
   0,
   Math.min(
     1,
     value
   )
 );
}

function nullableCleanText(
 value:
   unknown
) {
 if (
   typeof value !==
     "string"
 ) {
   return null;
 }

 const cleaned =
   cleanBrandText(
     value
   );

 return cleaned ||
   null;
}

function buildUnknownResolution(
 reason:
   string | null =
   null
): OpenAiBrandResolution {
 return {
   canonicalBrand:
     null,

   observedAlias:
     null,

   existingBrandLikely:
     false,

   identifiable:
     false,

   confidence:
     0,

   reason,
 };
}

/*
* These are not universally invalid words inside every
* brand name.
*
* They are rejected when the returned value is only a
* generic product, ingredient, benefit, or formula
* phrase rather than a plausible commercial brand.
*/
const GENERIC_BRAND_VALUES =
 new Set([
   "advanced formula",
   "bowel movements",
   "capsules",
   "chewable laxative",
   "chia",
   "chia seed",
   "clear fiber",
   "constipation",
   "daily fiber",
   "detox",
   "digestive support",
   "double potency",
   "fiber",
   "fiber blend",
   "flax",
   "flax chia",
   "flaxseed",
   "full spectrum",
   "glp",
   "glp 1",
   "gummies",
   "healthy bowel movements",
   "l theanine",
   "laxative",
   "magnesium",
   "maximum strength",
   "new mood",
   "organic fiber",
   "powder",
   "probiotic",
   "psyllium",
   "psyllium husk",
   "regularity",
   "same",
   "senna",
   "softgels",
   "stool softener",
   "stress support",
   "tablets",
   "triple",
   "triple magnesium",
   "ultra strength",
 ]);

const PRODUCT_PHRASE_SUFFIXES =
 [
   " advanced",
   " blend",
   " bowel",
   " bowel movement",
   " bowel movements",
   " capsules",
   " chewable",
   " constipation",
   " daily fiber",
   " detox",
   " digestive",
   " double potency",
   " extract",
   " fiber",
   " fiber blend",
   " formula",
   " full spectrum",
   " glp",
   " glp 1",
   " gummies",
   " healthy bowel movements",
   " laxative",
   " magnesium",
   " maximum strength",
   " new mood",
   " powder",
   " probiotic",
   " psyllium",
   " regularity",
   " senna",
   " softgels",
   " stool softener",
   " stress support",
   " tablets",
   " triple",
   " triple magnesium",
   " ultra strength",
 ];

function appearsToBeProductPhrase(
 value:
   string
) {
 const normalized =
   normalizeComparisonText(
     value
   );

 if (
   !normalized
 ) {
   return true;
 }

 if (
   GENERIC_BRAND_VALUES.has(
     normalized
   )
 ) {
   return true;
 }

 /*
  * Single numeric fragments and formula fragments are
  * not customer-facing brands.
  */
 if (
   /^(?:\d+|glp|htp|mg|mcg|g|iu)$/i.test(
     normalized
   )
 ) {
   return true;
 }

 /*
  * Reject suspiciously long extracted values that end
  * in an obvious formula, ingredient, dosage form, or
  * health-benefit phrase.
  *
  * The model is expected to return only the actual
  * commercial brand.
  */
 const wordCount =
   normalized
     .split(
       " "
     )
     .filter(
       Boolean
     )
     .length;

 if (
   wordCount >=
     3 &&
   PRODUCT_PHRASE_SUFFIXES.some(
     (
       suffix
     ) =>
       normalized.endsWith(
         suffix
       )
   )
 ) {
   return true;
 }

 return false;
}

function mapBatchItem(
 item:
   OpenAiBrandBatchItem
): OpenAiBrandResolution {
 const canonicalBrand =
   nullableCleanText(
     item.canonicalBrand
   );

 const observedAlias =
   nullableCleanText(
     item.observedAlias
   );

 const confidence =
   clampConfidence(
     item.confidence
   );

 const brandIsUsable =
   Boolean(
     canonicalBrand &&
     !appearsToBeProductPhrase(
       canonicalBrand
     )
   );

 const identifiable =
   Boolean(
     item.identifiable &&
     brandIsUsable
   );

 if (
   !identifiable
 ) {
   return buildUnknownResolution(
     canonicalBrand
       ? (
           `Rejected possible product phrase: ${canonicalBrand}`
         )
       : null
   );
 }

 return {
   canonicalBrand,

   observedAlias:
     observedAlias &&
     !appearsToBeProductPhrase(
       observedAlias
     )
       ? observedAlias
       : canonicalBrand,

   existingBrandLikely:
     Boolean(
       item.existingBrandLikely
     ),

   identifiable:
     true,

   confidence,

   reason:
     null,
 };
}

function deduplicateInputs(
 inputs:
   BrandTitleInput[]
) {
 const uniqueInputs =
   new Map<
     string,
     BrandTitleInput
>();

 for (
   const input of
   inputs
 ) {
   const productTitle =
     cleanText(
       input.productTitle
     ).slice(
       0,
       MAX_TITLE_LENGTH
     );

   if (
     !productTitle
   ) {
     continue;
   }

   const normalizedTitle =
     normalizeTitleKey(
       productTitle
     );

   if (
     uniqueInputs.has(
       normalizedTitle
     )
   ) {
     continue;
   }

   const retailer =
     input.retailer
       ? cleanText(
           input.retailer
         ).slice(
           0,
           MAX_RETAILER_LENGTH
         )
       : undefined;

   const parserCandidate =
     input.parserCandidate
       ? cleanBrandText(
           input.parserCandidate
         ).slice(
           0,
           MAX_PARSER_CANDIDATE_LENGTH
         )
       : null;

   uniqueInputs.set(
     normalizedTitle,
     {
       key:
         input.key,

       productTitle,

       retailer,

       parserCandidate,
     }
   );
 }

 return Array.from(
   uniqueInputs.values()
 ).slice(
   0,
   MAX_TITLES_PER_BATCH
 );
}

/*
* The parser candidate is explicitly marked as
* untrusted.
*
* The complete product title remains the primary
* evidence. Retailer information is weak supporting
* context only.
*/
function buildPromptInput(
 inputs:
   BrandTitleInput[]
) {
 return inputs.map(
   (
     input
   ) => ({
     key:
       input.key,

     fullProductTitle:
       input.productTitle,

     parserCandidate:
       input.parserCandidate ??
       null,

     retailerHint:
       input.retailer ??
       null,
   })
 );
}

function isPlainObject(
 value:
   unknown
): value is Record<
 string,
 unknown
>{
 return (
   typeof value ===
     "object" &&
   value !==
     null &&
   !Array.isArray(
     value
   )
 );
}

function isValidBatchItem(
 value:
   unknown
): value is OpenAiBrandBatchItem {
 if (
   !isPlainObject(
     value
   )
 ) {
   return false;
 }

 const canonicalBrandIsValid =
   value.canonicalBrand ===
     null ||
   typeof value.canonicalBrand ===
     "string";

 const observedAliasIsValid =
   value.observedAlias ===
     null ||
   typeof value.observedAlias ===
     "string";

 return (
   typeof value.key ===
     "string" &&
   canonicalBrandIsValid &&
   observedAliasIsValid &&
   typeof value.existingBrandLikely ===
     "boolean" &&
   typeof value.identifiable ===
     "boolean" &&
   typeof value.confidence ===
     "number" &&
   Number.isFinite(
     value.confidence
   )
 );
}

function stripCodeFence(
 value:
   string
) {
 const trimmed =
   value.trim();

 if (
   !trimmed.startsWith(
     "```"
   )
 ) {
   return trimmed;
 }

 return trimmed
   .replace(
     /^```(?:json)?\s*/i,
     ""
   )
   .replace(
     /\s*```$/,
     ""
   )
   .trim();
}

function parseResponse(
 outputText:
   string
): OpenAiBrandBatchResponse | null {
 const cleanedOutput =
   stripCodeFence(
     outputText
   );

 if (
   !cleanedOutput
 ) {
   return null;
 }

 try {
   const parsed =
     JSON.parse(
       cleanedOutput
     ) as unknown;

   if (
     !isPlainObject(
       parsed
     ) ||
     !Array.isArray(
       parsed.results
     )
   ) {
     return null;
   }

   const validResults =
     parsed.results.filter(
       isValidBatchItem
     );

   if (
     validResults.length !==
       parsed.results.length
   ) {
     return null;
   }

   return {
     results:
       validResults,
   };
 } catch {
   return null;
 }
}

function getResponseOutputText(
 response:
   unknown
) {
 if (
   !isPlainObject(
     response
   )
 ) {
   return "";
 }

 if (
   typeof response.output_text ===
     "string" &&
   response.output_text.trim()
 ) {
   return response.output_text;
 }

 /*
  * Defensive fallback for SDK response shapes where
  * output_text is unavailable but message content is
  * still present in response.output.
  */
 const output =
   response.output;

 if (
   !Array.isArray(
     output
   )
 ) {
   return "";
 }

 const textParts:
   string[] = [];

 for (
   const outputItem of
   output
 ) {
   if (
     !isPlainObject(
       outputItem
     ) ||
     !Array.isArray(
       outputItem.content
     )
   ) {
     continue;
   }

   for (
     const contentItem of
     outputItem.content
   ) {
     if (
       !isPlainObject(
         contentItem
       )
     ) {
       continue;
     }

     if (
       typeof contentItem.text ===
         "string"
     ) {
       textParts.push(
         contentItem.text
       );
     }
   }
 }

 return textParts.join(
   ""
 );
}

function getResponseDiagnostic(
 response:
   unknown
): OpenAiResponseDiagnostic {
 if (
   !isPlainObject(
     response
   )
 ) {
   return {};
 }

 return {
   status:
     response.status,

   incomplete_details:
     response.incomplete_details,

   error:
     response.error,

   output:
     response.output,
 };
}

function hasRefusal(
 response:
   unknown
) {
 if (
   !isPlainObject(
     response
   ) ||
   !Array.isArray(
     response.output
   )
 ) {
   return false;
 }

 return response.output.some(
   (
     outputItem
   ) => {
     if (
       !isPlainObject(
         outputItem
       ) ||
       !Array.isArray(
         outputItem.content
       )
     ) {
       return false;
     }

     return outputItem.content.some(
       (
         contentItem
       ) =>
         isPlainObject(
           contentItem
         ) &&
         contentItem.type ===
           "refusal"
     );
   }
 );
}

function isQuotaError(
 error:
   unknown
) {
 if (
   !error ||
   typeof error !==
     "object"
 ) {
   return false;
 }

 const possibleError =
   error as {
     status?:
       unknown;

     code?:
       unknown;

     message?:
       unknown;
   };

 return (
   possibleError.status ===
     429 ||
   possibleError.code ===
     "insufficient_quota" ||
   (
     typeof possibleError
       .message ===
       "string" &&
     possibleError.message
       .toLowerCase()
       .includes(
         "exceeded your current quota"
       )
   )
 );
}

/*
* Extracts and normalizes a brand from complete retail
* product titles.
*
* The model is used as a title-analysis verifier. It
* does not independently prove trademark ownership,
* authenticity, or manufacturer identity.
*/
export async function
resolveBrandsWithOpenAi(
 inputs:
   BrandTitleInput[]
): Promise<
 Map<
   string,
   OpenAiBrandResolution
>
>{
 const resolutions =
   new Map<
     string,
     OpenAiBrandResolution
>();

 const uniqueInputs =
   deduplicateInputs(
     inputs
   );

 if (
   uniqueInputs.length ===
     0
 ) {
   return resolutions;
 }

 if (
   !isOpenAiBrandResolutionEnabled()
 ) {
   return resolutions;
 }

 const client =
   getOpenAiClient();

 if (
   !client
 ) {
   console.warn(
     "VidaSearch OpenAI brand resolution skipped because OPENAI_API_KEY is not configured."
   );

   return resolutions;
 }

 try {
   const response =
     await client.responses.create({
       model:
         getBrandResolutionModel(),

       max_output_tokens:
         MAX_OUTPUT_TOKENS,

       instructions: [
         "You are a precise commercial-brand extractor for retail dietary supplements, foods, wellness products, and over-the-counter products.",
         "",
         "For each supplied item, determine the actual customer-facing commercial brand represented by fullProductTitle.",
         "",
         "The complete title is the primary evidence.",
         "parserCandidate is an untrusted guess produced by a deterministic parser.",
         "Correct parserCandidate whenever it contains ingredients, formulas, benefits, product lines, strengths, dosage forms, or other product-description words.",
         "retailerHint is weak supporting context only.",
         "",
         "Return only the brand in canonicalBrand.",
         "Do not include the product name, product line, ingredient, health benefit, formula, flavor, strength, dosage, count, package size, or dosage form.",
         "",
         "Examples:",
         '"Natrol Triple Magnesium Capsules" → canonicalBrand "Natrol", observedAlias "Natrol".',
         '"Metamucil Clear Fiber Blend Unflavored" → canonicalBrand "Metamucil", observedAlias "Metamucil".',
         '"Dulcolax Stimulant Laxative Tablets" → canonicalBrand "Dulcolax", observedAlias "Dulcolax".',
         '"O Positiv Healthy Bowel Movements Constipation Support" → canonicalBrand "O Positiv", observedAlias "O Positiv".',
         '"Supergut GLP-1 Daily Fiber Mix" → canonicalBrand "Supergut", observedAlias "Supergut".',
         '"Pedia-Lax Chewable Laxative Tablets" → canonicalBrand "Pedia-Lax", observedAlias "Pedia-Lax".',
         '"Lemme Chill De-Stress Gummies" → canonicalBrand "Lemme", observedAlias "Lemme".',
         '"Onnit New Mood Daily Stress Support" → canonicalBrand "Onnit", observedAlias "Onnit".',
         '"Doctor\'s Best SAM-e 200 mg Tablets" → canonicalBrand "Doctor\'s Best", observedAlias "Doctor\'s Best".',
         '"Source Naturals SAMe 400 mg Tablets" → canonicalBrand "Source Naturals", observedAlias "Source Naturals".',
         '"Irwin Naturals Double Potency 5-HTP" → canonicalBrand "Irwin Naturals", observedAlias "Irwin Naturals".',
         '"NOW Foods Magnesium Citrate" → canonicalBrand "NOW", observedAlias "NOW Foods".',
         '"5 HTP Natrol" → canonicalBrand "Natrol", observedAlias "Natrol".',
         "",
         "Hyphenated formula names such as GLP-1, 5-HTP, SAM-e, De-Stress, and Omega-3 are generally product descriptors, not extensions of the brand.",
         "",
         "Words and phrases such as Triple, Clear Fiber, Healthy Bowel Movements, Constipation Support, GLP-1, Ultra Strength, New Mood, Full Spectrum, Double Potency, Daily, Maximum, Advanced, Complete, Blend, Formula, Gummies, Capsules, Tablets, Softgels, Powder, Magnesium, Senna, Psyllium, Fiber, Probiotic, Saffron, SAM-e, 5-HTP, and L-Theanine are normally not part of the brand.",
         "",
         "Do not assume every capitalized word belongs to the brand.",
         "Do not copy parserCandidate without independently evaluating the full title.",
         "Do not substitute the retailer, marketplace, or seller for a clearly identified product brand.",
         "",
         "When the title does not contain enough evidence to identify a brand reliably, set identifiable=false and return null for canonicalBrand and observedAlias.",
         "",
         "canonicalBrand is the normalized customer-facing brand.",
         "observedAlias is the exact brand wording visibly represented in the title when available.",
         "existingBrandLikely indicates whether it appears to be an established commercial brand; it is not independent legal verification.",
         "",
         "Confidence must be between 0 and 1.",
         "Use confidence of 0.97 or higher only when the brand is explicit and unambiguous.",
         "",
         "Return exactly one result for every supplied key.",
       ].join(
         "\n"
       ),

       input:
         JSON.stringify(
           buildPromptInput(
             uniqueInputs
           )
         ),

       text: {
         format: {
           type:
             "json_schema",

           name:
             "brand_resolution_batch",

           description:
             "Canonical commercial-brand extraction results for a batch of retail product titles.",

           strict:
             true,

           schema: {
             type:
               "object",

             additionalProperties:
               false,

             properties: {
               results: {
                 type:
                   "array",

                 items: {
                   type:
                     "object",

                   additionalProperties:
                     false,

                   properties: {
                     key: {
                       type:
                         "string",
                     },

                     canonicalBrand: {
                       type: [
                         "string",
                         "null",
                       ],
                     },

                     observedAlias: {
                       type: [
                         "string",
                         "null",
                       ],
                     },

                     existingBrandLikely: {
                       type:
                         "boolean",
                     },

                     identifiable: {
                       type:
                         "boolean",
                     },

                     confidence: {
                       type:
                         "number",

                       minimum:
                         0,

                       maximum:
                         1,
                     },
                   },

                   required: [
                     "key",
                     "canonicalBrand",
                     "observedAlias",
                     "existingBrandLikely",
                     "identifiable",
                     "confidence",
                   ],
                 },
               },
             },

             required: [
               "results",
             ],
           },
         },
       },
     });

   const outputText =
     getResponseOutputText(
       response
     );

   if (
     hasRefusal(
       response
     )
   ) {
     console.error(
       "VidaSearch OpenAI brand resolution was refused:",
       {
         model:
           getBrandResolutionModel(),

         titleCount:
           uniqueInputs.length,

         diagnostic:
           getResponseDiagnostic(
             response
           ),
       }
     );

     return resolutions;
   }

   const parsed =
     parseResponse(
       outputText
     );

   if (
     !parsed
   ) {
     console.error(
       "VidaSearch OpenAI brand resolution returned unusable structured output:",
       {
         model:
           getBrandResolutionModel(),

         titleCount:
           uniqueInputs.length,

         outputTextLength:
           outputText.length,

         outputPreview:
           outputText
             .slice(
               0,
               500
             ),

         diagnostic:
           getResponseDiagnostic(
             response
           ),
       }
     );

     return resolutions;
   }

   const requestedKeys =
     new Set(
       uniqueInputs.map(
         (
           input
         ) =>
           input.key
       )
     );

   const returnedKeys =
     new Set<
       string
>();

   for (
     const item of
     parsed.results
   ) {
     if (
       !requestedKeys.has(
         item.key
       ) ||
       returnedKeys.has(
         item.key
       )
     ) {
       continue;
     }

     returnedKeys.add(
       item.key
     );

     resolutions.set(
       item.key,
       mapBatchItem(
         item
       )
     );
   }

   /*
    * Ensure every submitted title receives a result,
    * even if a model response unexpectedly omits or
    * duplicates a key.
    */
   for (
     const input of
     uniqueInputs
   ) {
     if (
       !resolutions.has(
         input.key
       )
     ) {
       resolutions.set(
         input.key,
         buildUnknownResolution(
           "OpenAI omitted this key from the batch response."
         )
       );
     }
   }

   const resolutionValues =
     Array.from(
       resolutions.values()
     );

   console.log(
     "VidaSearch OpenAI brand batch completed:",
     {
       model:
         getBrandResolutionModel(),

       requestedTitleCount:
         uniqueInputs.length,

       parsedResultCount:
         parsed.results.length,

       returnedResolutionCount:
         resolutions.size,

       identifiableCount:
         resolutionValues.filter(
           (
             resolution
           ) =>
             resolution
               .identifiable
         ).length,

       rejectedOrUnknownCount:
         resolutionValues.filter(
           (
             resolution
           ) =>
             !resolution
               .identifiable
         ).length,
     }
   );

   return resolutions;
 } catch (
   error
 ) {
   if (
     isQuotaError(
       error
     )
   ) {
     console.error(
       "VidaSearch OpenAI brand batch skipped because the OpenAI API quota or billing limit was exceeded:",
       {
         model:
           getBrandResolutionModel(),

         titleCount:
           uniqueInputs.length,
       }
     );

     return resolutions;
   }

   console.error(
     "VidaSearch OpenAI brand batch failed:",
     {
       model:
         getBrandResolutionModel(),

       titleCount:
         uniqueInputs.length,

       error:
         error instanceof
           Error
           ? error.message
           : String(
               error
             ),
     }
   );

   return resolutions;
 }
}
