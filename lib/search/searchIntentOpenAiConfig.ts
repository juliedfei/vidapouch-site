export const DEFAULT_SEARCH_INTENT_MODEL =
 "gpt-5-mini";

export const SEARCH_INTENT_VERSION =
 "search-intent-v2";

export const MAX_SEARCH_INTENT_ALIASES =
 8;

export const MAX_DIRECT_SEARCH_QUERIES =
 3;

export const MAX_RELATED_SEARCH_QUERIES =
 6;

export const MAX_SEARCH_INTENT_OUTPUT_TOKENS =
 2200;

export type OpenAiSearchIntentExpansion = {
 kind:
   | "DIRECT_QUERY"
   | "RELATED_SUPPLEMENT"
   | "BRAND_QUERY"
   | "DOCTOR_QUERY";

 searchTerm:
   string;

 displayName:
   string | null;

 reason:
   string | null;

 priority:
   number;

 confidence:
   number;
};

export type OpenAiSearchIntentResult = {
 normalizedKey:
   string;

 displayName:
   string;

 intentType:
   | "SUPPLEMENT"
   | "HEALTH_GOAL"
   | "BRAND"
   | "DOCTOR_TYPE"
   | "INVALID";

 includeOriginalMarketplaceQuery:
   boolean;

 aliases:
   string[];

 expansions:
   OpenAiSearchIntentExpansion[];

 confidence:
   number;

 notes:
   string | null;
};

export const SEARCH_INTENT_SCHEMA = {
 type:
   "object",

 additionalProperties:
   false,

 properties: {
   normalizedKey: {
     type:
       "string",
   },

   displayName: {
     type:
       "string",
   },

   intentType: {
     type:
       "string",

     enum: [
       "SUPPLEMENT",
       "HEALTH_GOAL",
       "BRAND",
       "DOCTOR_TYPE",
       "INVALID",
     ],
   },

   includeOriginalMarketplaceQuery: {
     type:
       "boolean",
   },

   aliases: {
     type:
       "array",

     maxItems:
       MAX_SEARCH_INTENT_ALIASES,

     items: {
       type:
         "string",
     },
   },

   expansions: {
     type:
       "array",

     maxItems:
       MAX_DIRECT_SEARCH_QUERIES +
       MAX_RELATED_SEARCH_QUERIES,

     items: {
       type:
         "object",

       additionalProperties:
         false,

       properties: {
         kind: {
           type:
             "string",

           enum: [
             "DIRECT_QUERY",
             "RELATED_SUPPLEMENT",
             "BRAND_QUERY",
             "DOCTOR_QUERY",
           ],
         },

         searchTerm: {
           type:
             "string",
         },

         displayName: {
           type: [
             "string",
             "null",
           ],
         },

         reason: {
           type: [
             "string",
             "null",
           ],
         },

         priority: {
           type:
             "integer",

           minimum:
             1,

           maximum:
             1000,
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
         "kind",
         "searchTerm",
         "displayName",
         "reason",
         "priority",
         "confidence",
       ],
     },
   },

   confidence: {
     type:
       "number",

     minimum:
       0,

     maximum:
       1,
   },

   notes: {
     type: [
       "string",
       "null",
     ],
   },
 },

 required: [
   "normalizedKey",
   "displayName",
   "intentType",
   "includeOriginalMarketplaceQuery",
   "aliases",
   "expansions",
   "confidence",
   "notes",
 ],
} as const;

export const SEARCH_INTENT_INSTRUCTIONS = `
You resolve search intent for VidaSearch, a supplement shopping and comparison service.

Classify the customer query as exactly one of:

SUPPLEMENT:
A specific vitamin, mineral, botanical, amino acid, probiotic, protein, or other supplement ingredient.

HEALTH_GOAL:
A wellness goal such as sleep, mood support, energy, digestion, focus, stress, immunity, joint support, or skin health.

BRAND:
A supplement or wellness-product brand.

DOCTOR_TYPE:
A practitioner category. This is reserved for a future practitioner-search experience.

INVALID:
Unrelated to supplements, wellness goals, supplement brands, or practitioner categories.

Rules:

- Produce concise marketplace searches for real purchasable products.
- For HEALTH_GOAL, include direct commercial discovery plus useful related supplement categories.
- Preserve products explicitly marketed for the requested health goal.
- Do not generate informational article searches.
- Do not generate duplicate or nearly identical searches.
- Do not generate prescription medication, controlled-drug, or disease-treatment searches.
- Do not claim that supplements diagnose, prevent, cure, or treat disease.
- Use "mood support," "mood balance," or "emotional wellness" rather than prescription-oriented terminology.
- For INVALID, return no expansions.
- For DOCTOR_TYPE, return no supplement expansions.
- Keep aliases realistic and limited.
- Keep reasons neutral and brief.
- normalizedKey must be a short canonical database key.
- includeOriginalMarketplaceQuery should normally be true for SUPPLEMENT, HEALTH_GOAL, and BRAND.
- Return only the required structured result.
`;
