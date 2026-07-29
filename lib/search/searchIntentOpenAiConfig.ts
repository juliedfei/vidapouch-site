export const DEFAULT_SEARCH_INTENT_MODEL =
 "gpt-5-mini";

export const SEARCH_INTENT_VERSION =
 "search-intent-v3";

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
   | "HEALTH_CONDITION"
   | "LIFE_STAGE"
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
       "HEALTH_CONDITION",
       "LIFE_STAGE",
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
A specific vitamin, mineral, botanical, amino acid, probiotic, protein, nutrient, or other supplement ingredient.

HEALTH_GOAL:
A general wellness goal such as sleep, mood support, energy, digestion, focus, stress, immunity, joint support, heart health, skin health, exercise recovery, or healthy aging.

HEALTH_CONDITION:
A named medical condition, disorder, diagnosis, disease, syndrome, deficiency disorder, or clinically significant health concern. Examples include ataxia, diabetes, anemia, osteoporosis, migraine, thyroid disorders, PCOS, Parkinson's disease, multiple sclerosis, celiac disease, and cancer.

LIFE_STAGE:
A biological or reproductive life stage requiring condition-aware supplement selection. Examples include preconception, pregnancy, postpartum, breastfeeding, perimenopause, and menopause.

BRAND:
A supplement or wellness-product brand.

DOCTOR_TYPE:
A practitioner category. This is reserved for a future practitioner-search experience.

INVALID:
Unrelated to supplements, health goals, health conditions, life stages, supplement brands, or practitioner categories.

General rules:

- Produce concise marketplace searches for real purchasable supplement products.
- Do not generate informational article searches.
- Do not generate duplicate or nearly identical searches.
- Do not generate prescription medications, controlled drugs, medical treatments, medical devices, tests, books, clinics, hospitals, or health-care services.
- Do not claim that supplements diagnose, prevent, cure, or treat disease.
- Keep aliases realistic and limited.
- Keep reasons neutral, specific, and brief.
- normalizedKey must be a short canonical database key.
- Return only the required structured result.

SUPPLEMENT rules:

- includeOriginalMarketplaceQuery should normally be true.
- Use DIRECT_QUERY for the customer's requested supplement or a close commercial variation.
- Related expansions may be included only when they help locate the same requested ingredient or its recognized forms.
- Do not replace the requested supplement with unrelated ingredients.

HEALTH_GOAL rules:

- includeOriginalMarketplaceQuery may normally be true.
- Include useful RELATED_SUPPLEMENT expansions for specific supplement ingredients or recognized supplement categories associated with the goal.
- A broad DIRECT_QUERY may be included when it is likely to return supplements explicitly marketed for that general wellness goal.
- Preserve products explicitly marketed for the requested wellness goal.
- Use wellness-oriented phrasing such as "mood support," "mood balance," or "emotional wellness" rather than prescription-oriented terminology.

HEALTH_CONDITION rules:

- includeOriginalMarketplaceQuery must always be false.
- Never create a DIRECT_QUERY using the condition name.
- Never send the raw diagnosis or disease name to a shopping marketplace.
- Return only RELATED_SUPPLEMENT expansions.
- Every expansion must identify a specific vitamin, mineral, nutrient, botanical, amino acid, probiotic, fatty acid, or other recognizable supplement ingredient.
- Search terms must be shopping-oriented ingredient phrases such as "CoQ10 supplement," "vitamin E supplement," or "vitamin B12 supplement."
- Do not return doctors, specialists, clinics, hospitals, treatment centers, books, devices, diagnostic tests, therapies, medications, or unrelated condition merchandise.
- Include only ingredients with a plausible evidence-based or clinically recognized nutritional relationship to the condition.
- Prefer a small number of relevant, higher-confidence ingredients over broad or speculative suggestions.
- When relevance applies only to a subtype, deficiency, medication effect, malabsorption issue, or documented laboratory finding, state that limitation clearly in the reason.
- Do not imply that every person with the condition should take the ingredient.
- Do not imply that an ingredient treats or cures the condition.
- For ataxia, distinguish subtype-specific or deficiency-related relevance. For example, CoQ10 may be relevant to certain CoQ10-deficiency ataxias, while vitamin E or vitamin B12 may be relevant when a corresponding deficiency contributes to symptoms.
- For cancer-related searches, be especially conservative because supplements may interact with treatment. Return only clearly relevant nutritional categories, and explain that suitability depends on the person's treatment and clinician guidance.
- Do not return a DOCTOR_QUERY for a HEALTH_CONDITION.

LIFE_STAGE rules:

- includeOriginalMarketplaceQuery must always be false.
- Never create a broad DIRECT_QUERY using only the life-stage phrase.
- Return only RELATED_SUPPLEMENT expansions for specific supplement ingredients or recognized supplement categories.
- Do not return baby products, maternity merchandise, books, medical services, medications, or unrelated products.
- Be especially conservative for pregnancy and breastfeeding.
- Favor well-established nutritional categories over experimental botanicals.
- Reasons must make clear that individual needs, appropriate amounts, medications, medical history, and clinician advice may affect suitability.
- Do not return a DOCTOR_QUERY for a LIFE_STAGE.

BRAND rules:

- includeOriginalMarketplaceQuery should normally be true.
- Use BRAND_QUERY or DIRECT_QUERY expansions focused on purchasable supplements from the requested brand.
- Do not convert a brand search into unrelated health-condition or practitioner searches.

DOCTOR_TYPE rules:

- includeOriginalMarketplaceQuery must be false.
- Return no supplement expansions.
- Return no DOCTOR_QUERY yet because practitioner search is not currently available.

INVALID rules:

- includeOriginalMarketplaceQuery must be false.
- Return no expansions.
`;
