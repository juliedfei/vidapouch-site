import { NextResponse } from "next/server";
import { VIDAPOUCH_CATALOG } from "@/components/routine-builder/catalog";

import { validateSupplement } from "@/lib/pricing/validateSupplement";

import type {
 CatalogProduct,
 PouchTiming,
 ReviewReason,
 Supplement,
 SuggestedAddition,
 UnrecognizedItem,
 WellnessGoal,
} from "@/components/routine-builder/types";

type SuggestedAdditionInput = {
 id: string;
 reason: string;
 suggestedTiming: PouchTiming;
};

type ScoredProduct = {
 product: CatalogProduct;
 totalScore: number;
 goalMatchScore: number;
 priorityScore: number;
 anchorScore: number;
 lifestyleScore: number;
 considerationScore: number;
 safetyPenalty: number;
 costControlScore: number;
};

type RecognitionConfidence = "high" | "medium" | "low";

type AiRecognizedSupplement = {
 inputIndex: number;
 canonicalName: string;
 timing: PouchTiming;
 confidence: RecognitionConfidence;
 note?: string;
};

type AiUnrecognizedSupplement = {
 inputIndex: number;
 suggestion?: string;
 reason: ReviewReason;
 note: string;
};

type AiRoutineRecognitionResponse = {
 recognized?: AiRecognizedSupplement[];
 unrecognized?: AiUnrecognizedSupplement[];
};

type IndexedSupplement = {
 inputIndex: number;
 supplement: Supplement;
};

type CurrentRoutineBuildResult = {
 morning: Supplement[];
 evening: Supplement[];
 unrecognized: UnrecognizedItem[];
 matchedCatalogIds: string[];
 usedFallback: boolean;
};

const AI_REQUEST_TIMEOUT_MS = 20_000;

const GOAL_ALIASES: Record<WellnessGoal, string[]> = {
 general_wellness: [
   "general",
   "wellness",
   "overall",
   "daily",
   "foundation",
 ],
 sleep: ["sleep", "rest", "night", "insomnia"],
 stress_mood: ["stress", "mood", "calm", "anxiety", "relax"],
 energy: ["energy", "fatigue", "tired"],
 focus_brain: ["focus", "brain", "memory", "cognitive", "clarity"],
 heart_circulation: ["heart", "circulation", "cardio", "blood flow"],
 muscle_strength: ["muscle", "strength", "strong"],
 endurance: ["endurance", "stamina", "performance"],
 hair_skin_nails: ["hair", "skin", "nails", "beauty"],
 gut_health: ["gut", "digest", "digestion", "bloat"],
 immune_support: ["immune", "immunity"],
 bone_joint: ["bone", "joint", "mobility"],
 metabolism_weight: ["metabolism", "weight", "blood sugar"],
 healthy_aging: ["longevity", "aging", "healthy aging", "antioxidant"],
 womens_health: ["women", "female", "prenatal", "urinary"],
 mens_health: ["men", "male", "prostate"],
 hormone_support: ["hormone", "hormonal"],
 eye_health: ["eye", "vision"],
 liver_support: ["liver"],
 hydration: ["hydration", "hydrate"],
 recovery: ["recovery", "soreness"],
};

const GOAL_ANCHOR_PRODUCT_IDS: Partial<
 Record<WellnessGoal, string[]>
> = {
 sleep: ["magnesium"],
 energy: ["b-complex", "coq10"],
 stress_mood: ["l-theanine", "ashwagandha"],
 focus_brain: ["lion-mane", "omega3"],
 gut_health: ["probiotic"],
 immune_support: ["vitamin-c", "zinc"],
 general_wellness: ["multivitamin", "omega3"],
 heart_circulation: ["omega3", "coq10"],
 muscle_strength: ["creatine", "magnesium"],
 endurance: ["creatine", "electrolytes"],
 hair_skin_nails: ["biotin", "collagen"],
 bone_joint: ["vitamin-d3", "vitamin-k2"],
 metabolism_weight: ["berberine", "fiber"],
 hydration: ["electrolytes"],
 recovery: ["magnesium", "turmeric"],
};

const LIFESTYLE_PRODUCT_BOOSTS: Record<string, string[]> = {
 vegetarian: ["b12", "iron", "omega3", "multivitamin"],
 vegan: ["b12", "iron", "omega3", "multivitamin"],
 pregnant: ["prenatal-multi", "omega3", "iron", "vitamin-d3"],
 breastfeeding: ["prenatal-multi", "omega3", "vitamin-d3"],
 tryingtoconceive: [
   "prenatal-multi",
   "omega3",
   "vitamin-d3",
 ],
 athleticactive: [
   "creatine",
   "electrolytes",
   "magnesium",
   "coq10",
 ],
 caffeinesensitive: [
   "b-complex",
   "coq10",
   "magnesium",
 ],
 minimalcapsulespreferred: [
   "multivitamin",
   "omega3",
   "magnesium",
 ],
 lowsunexposure: [
   "vitamin-d3",
   "vitamin-k2",
   "calcium",
 ],
};

const CONSIDERATION_PRODUCT_BOOSTS: Record<string, string[]> = {
 migraines: [
   "magnesium",
   "coq10",
   "b-complex",
   "omega3",
 ],
 ataxianeurologicalsupport: [
   "omega3",
   "coq10",
   "b-complex",
   "vitamin-d3",
 ],
 irondeficiency: [
   "iron",
   "vitamin-c",
   "multivitamin",
 ],
 thyroidsupport: [
   "zinc",
   "multivitamin",
 ],
 menopause: [
   "calcium",
   "vitamin-d3",
   "magnesium",
   "omega3",
 ],
 autoimmunesupport: [
   "vitamin-d3",
   "omega3",
   "quercetin",
   "probiotic",
 ],
 chronicfatigue: [
   "b-complex",
   "coq10",
   "magnesium",
   "vitamin-d3",
 ],
 jointpaininflammation: [
   "turmeric",
   "glucosamine",
   "boswellia",
   "omega3",
 ],
 digestivesensitivity: [
   "probiotic",
   "digestive-enzymes",
   "fiber",
 ],
 highstress: [
   "magnesium",
   "l-theanine",
   "ashwagandha",
   "saffron",
 ],
};

const CLINICIAN_REVIEW_CONSIDERATIONS = [
 "pregnant",
 "breastfeeding",
 "tryingtoconceive",
 "migraines",
 "ataxianeurologicalsupport",
 "irondeficiency",
 "thyroidsupport",
 "autoimmunesupport",
 "chronicfatigue",
];

const EVENING_SUPPLEMENT_KEYWORDS = [
 "magnesium",
 "melatonin",
 "ltheanine",
 "theanine",
 "ashwagandha",
 "inositol",
 "5htp",
 "glycine",
 "valerian",
 "gaba",
 "sleep",
 "night",
 "bedtime",
];

const UNSUPPORTED_FORMAT_KEYWORDS = [
 "powder",
 "drinkmix",
 "drinkpowder",
 "liquid",
 "gummy",
 "gummies",
 "syrup",
 "tea",
 "food",
 "prescription",
 "medication",
];

function catalogProductToSupplement(
 product: CatalogProduct
): Supplement {
 return {
   id: product.id,
   name: product.displayName,
   dosage: product.dosage,
   brand: product.brand,
   monthlyPrice: product.monthlyPrice,
   description: product.description,
   category: product.category,
 };
}

function findCatalogProduct(productId: string) {
 return VIDAPOUCH_CATALOG.find(
   (product) => product.id === productId
 );
}

function hydrateCatalogIds(
 productIds: string[]
): Supplement[] {
 return productIds
   .map((productId) => findCatalogProduct(productId))
   .filter(
     (product): product is CatalogProduct =>
       Boolean(product)
   )
   .map(catalogProductToSupplement);
}

function hydrateSuggestedAdditions(
 additions: SuggestedAdditionInput[]
): SuggestedAddition[] {
 return additions
   .map((addition) => {
     const product = findCatalogProduct(addition.id);

     if (!product) {
       return null;
     }

     return {
       ...catalogProductToSupplement(product),
       reason: addition.reason,
       suggestedTiming: addition.suggestedTiming,
     };
   })
   .filter(
     (addition): addition is SuggestedAddition =>
       Boolean(addition)
   );
}

function normalizeText(value: string) {
 return value
   .toLowerCase()
   .replace(/[^a-z0-9]/g, "")
   .trim();
}

function normalizeUserSupplement(
 item: Partial<Supplement>
): Supplement {
 const selectedBrand =
   String(item.brand || "").trim();

 const customBrand =
   String(item.customBrand || "").trim();

 const resolvedBrand =
   selectedBrand.toLowerCase() === "other" && customBrand
     ? customBrand
     : selectedBrand || customBrand;

     return {
      ...(item.id ? { id: item.id } : {}),
     
      name: String(item.name || "").trim(),
     
      dosage: String(item.dosage || "").trim(),
     
      ...(resolvedBrand
        ? { brand: resolvedBrand }
        : {}),
     
      ...(customBrand
        ? { customBrand }
        : {}),
     
      ...(typeof item.vidapouchChoosesBrand === "boolean"
        ? {
            vidapouchChoosesBrand:
              item.vidapouchChoosesBrand,
          }
        : {}),
     
      ...(typeof item.monthlyPrice === "number"
        ? {
            monthlyPrice:
              item.monthlyPrice,
          }
        : {}),
     
      ...(item.description
        ? {
            description:
              item.description,
          }
        : {}),
     
      ...(item.category
        ? {
            category:
              item.category,
          }
        : {}),
     };
}

function inferGoalsFromText(
 values: string[]
): WellnessGoal[] {
 const text = values.join(" ").toLowerCase();

 return Array.from(
   new Set(
     Object.entries(GOAL_ALIASES)
       .filter(([, aliases]) =>
         aliases.some((alias) =>
           text.includes(alias.toLowerCase())
         )
       )
       .map(([goal]) => goal as WellnessGoal)
   )
 );
}

function getCatalogSearchTerms(
 product: CatalogProduct
) {
 return [
   product.id,
   product.name,
   product.displayName,
   product.displayName.replace("Daily ", ""),
   product.displayName.replace(" Capsules", ""),
   product.displayName.replace(" Glycinate", ""),
 ]
   .map(normalizeText)
   .filter(Boolean);
}

function findExactCatalogProduct(
 name: string
): CatalogProduct | null {
 const normalizedName = normalizeText(name);

 if (!normalizedName) {
   return null;
 }

 return (
   VIDAPOUCH_CATALOG.find((product) =>
     getCatalogSearchTerms(product).some(
       (term) => term === normalizedName
     )
   ) || null
 );
}

function findExactCatalogProductId(
 name: string
) {
 return findExactCatalogProduct(name)?.id || null;
}

function removeDuplicateIds(
 productIds: string[]
) {
 return Array.from(new Set(productIds)).filter(
   (id) => findCatalogProduct(id)
 );
}

function splitProductIdsByTiming(
 productIds: string[]
) {
 const morning: string[] = [];
 const evening: string[] = [];

 productIds.forEach((productId) => {
   const product = findCatalogProduct(productId);

   if (!product) {
     return;
   }

   if (product.defaultTiming === "evening") {
     evening.push(product.id);
   } else {
     morning.push(product.id);
   }
 });

 return {
   morning,
   evening,
 };
}

function inferTimingWithoutAi(
 supplementName: string
): PouchTiming {
 const normalizedName = normalizeText(supplementName);

 const appearsEveningFocused =
   EVENING_SUPPLEMENT_KEYWORDS.some((keyword) =>
     normalizedName.includes(keyword)
   );

 return appearsEveningFocused
   ? "evening"
   : "morning";
}

function isClearlyUnsupportedFormat(
 supplement: Supplement
) {
 const searchableText = normalizeText(
   `${supplement.name} ${supplement.dosage}`
 );

 return UNSUPPORTED_FORMAT_KEYWORDS.some(
   (keyword) => searchableText.includes(keyword)
 );
}

function isValidInputIndex(
 value: unknown,
 inputCount: number
): value is number {
 return (
   typeof value === "number" &&
   Number.isInteger(value) &&
   value >= 0 &&
   value < inputCount
 );
}

function sanitizeRecognitionReason(
 value: unknown
): ReviewReason {
 const allowedReasons: ReviewReason[] = [
   "unrecognized",
   "possible_misspelling",
   "unsupported_format",
   "needs_confirmation",
 ];

 return allowedReasons.includes(
   value as ReviewReason
 )
   ? (value as ReviewReason)
   : "needs_confirmation";
}

function sanitizeTiming(
 value: unknown,
 supplementName: string
): PouchTiming {
 if (value === "morning" || value === "evening") {
   return value;
 }

 return inferTimingWithoutAi(supplementName);
}

function parseAiJsonContent(
 content: string
): AiRoutineRecognitionResponse {
 const cleaned = content
   .replace(/```json/gi, "")
   .replace(/```/g, "")
   .trim();

 const parsed = JSON.parse(cleaned);

 if (
   !parsed ||
   typeof parsed !== "object"
 ) {
   throw new Error(
     "AI returned an invalid recognition response."
   );
 }

 return parsed as AiRoutineRecognitionResponse;
}

async function askAiToRecognizeSupplements(
 indexedSupplements: IndexedSupplement[]
): Promise<AiRoutineRecognitionResponse> {
 if (!process.env.OPENAI_API_KEY) {
   throw new Error(
     "OPENAI_API_KEY is not configured."
   );
 }

 const controller = new AbortController();

 const timeout = setTimeout(() => {
   controller.abort();
 }, AI_REQUEST_TIMEOUT_MS);

 try {
   const recognitionInput =
     indexedSupplements.map(
       ({ inputIndex, supplement }) => ({
         inputIndex,
         name: supplement.name,
         brand: supplement.brand || "",
         dosage: supplement.dosage || "",
       })
     );

   const response = await fetch(
     "https://api.openai.com/v1/chat/completions",
     {
       method: "POST",
       signal: controller.signal,
       headers: {
         "Content-Type": "application/json",
         Authorization:
           `Bearer ${process.env.OPENAI_API_KEY}`,
       },
       body: JSON.stringify({
         model: "gpt-4o-mini",
         temperature: 0,
         response_format: {
           type: "json_object",
         },
         messages: [
           {
             role: "system",
             content: `
You review supplements entered by a VidaPouch customer.

The customer may enter any legitimate dietary supplement from any brand.
A supplement does NOT need to exist in the VidaPouch recommendation catalog.

Your job is to:
1. Decide whether each entry is a recognizable dietary supplement.
2. Preserve the user's brand and daily amount.
3. Provide a clean canonical supplement name.
4. Assign it to either a morning pouch or an evening pouch.
5. Flag only genuinely uncertain entries, medications, unsupported formats, or likely misspellings.

Important rules:
- Vitamin A is a valid supplement.
- Vitamin C is a valid supplement.
- Vitamin A must never be corrected to Vitamin C.
- Different vitamins, minerals, herbs, amino acids, fatty acids, probiotics, and specialty supplements are distinct products, even if their names differ by only one letter.
- Do not use spelling distance alone to change one real supplement into another.
- Do not require the product to exist in a supplied catalog.
- Do not reject a legitimate supplement merely because you are unfamiliar with the brand.
- Preserve the user's original dosage and brand outside your response; identify supplements using inputIndex.
- Use morning for most vitamins, energizing supplements, general wellness products, and products normally taken earlier in the day.
- Use evening for supplements commonly associated with relaxation or nighttime use, such as magnesium, melatonin, L-theanine, glycine, valerian, GABA, inositol, and 5-HTP.
- If timing could reasonably be either, use morning.
- Do not provide medical advice.
- Prescription medications and non-supplement medications must be returned as unsupported_format.
- Powders, liquids, gummies, drink mixes, foods, and other formats that cannot currently be placed into a capsule pouch must be returned as unsupported_format.
- A likely misspelling should be flagged only when the intended supplement is genuinely clear.
- When uncertain, use needs_confirmation rather than inventing a correction.
- Every inputIndex must appear exactly once, either in recognized or unrecognized.
- Return JSON only.
`,
           },
           {
             role: "user",
             content: `
Review these customer-entered supplements:

${JSON.stringify(recognitionInput, null, 2)}

Return this exact JSON structure:

{
 "recognized": [
   {
     "inputIndex": 0,
     "canonicalName": "Vitamin A",
     "timing": "morning",
     "confidence": "high",
     "note": "Recognized as a dietary supplement."
   }
 ],
 "unrecognized": [
   {
     "inputIndex": 1,
     "suggestion": "Magnesium Glycinate",
     "reason": "possible_misspelling",
     "note": "This may be a misspelling. Confirm the supplement name before adding it."
   }
 ]
}

Allowed timing values:
- morning
- evening

Allowed confidence values:
- high
- medium
- low

Allowed unrecognized reasons:
- unrecognized
- possible_misspelling
- unsupported_format
- needs_confirmation
`,
           },
         ],
       }),
     }
   );

   const data = await response.json();

   if (!response.ok) {
     console.error(
       "OpenAI supplement recognition error:",
       data
     );

     throw new Error(
       "AI supplement recognition failed."
     );
   }

   const content =
     data.choices?.[0]?.message?.content;

   if (!content) {
     throw new Error(
       "AI returned no supplement recognition content."
     );
   }

   return parseAiJsonContent(content);
 } finally {
   clearTimeout(timeout);
 }
}

function buildFallbackRecognition(
 indexedSupplements: IndexedSupplement[]
): CurrentRoutineBuildResult {
 const morning: Supplement[] = [];
 const evening: Supplement[] = [];
 const unrecognized: UnrecognizedItem[] = [];
 const matchedCatalogIds: string[] = [];

 indexedSupplements.forEach(
   ({ supplement }) => {
     if (isClearlyUnsupportedFormat(supplement)) {
       unrecognized.push({
         ...supplement,
         reason: "unsupported_format",
         note:
           "This supplement format is not currently supported for daily pouches.",
       });

       return;
     }

     const exactCatalogProduct =
       findExactCatalogProduct(supplement.name);

     if (exactCatalogProduct) {
       matchedCatalogIds.push(
         exactCatalogProduct.id
       );
     }

     const timing =
       exactCatalogProduct?.defaultTiming ||
       inferTimingWithoutAi(
         supplement.name
       );

     const normalizedSupplement: Supplement = {
       ...supplement,
       name:
         exactCatalogProduct?.displayName ||
         supplement.name,
       ...(exactCatalogProduct?.category
         ? {
             category:
               exactCatalogProduct.category,
           }
         : {}),
     };

     if (timing === "evening") {
       evening.push(normalizedSupplement);
     } else {
       morning.push(normalizedSupplement);
     }
   }
 );

 return {
   morning,
   evening,
   unrecognized,
   matchedCatalogIds:
     removeDuplicateIds(matchedCatalogIds),
   usedFallback: true,
 };
}

async function buildCurrentRoutine(
 rawSupplements: unknown[]
): Promise<CurrentRoutineBuildResult> {


  console.log(
    "BUILD CURRENT ROUTINE INPUT:",
    JSON.stringify(rawSupplements, null, 2)
   );




 const normalizedSupplements =
   rawSupplements
     .map((item) =>
       normalizeUserSupplement(
         (item || {}) as Partial<Supplement>
       )
     )
     .filter(
       (supplement) =>
         Boolean(supplement.name.trim())
     );

 const morning: Supplement[] = [];
 const evening: Supplement[] = [];
 const unrecognized: UnrecognizedItem[] = [];
 const matchedCatalogIds: string[] = [];
 const supplementsNeedingAi: IndexedSupplement[] =
   [];

 normalizedSupplements.forEach(
   (supplement, inputIndex) => {
     if (isClearlyUnsupportedFormat(supplement)) {
       unrecognized.push({
         ...supplement,
         reason: "unsupported_format",
         note:
           "This supplement format is not currently supported for daily pouches.",
       });

       return;
     }

     const exactCatalogProduct =
       findExactCatalogProduct(supplement.name);

     if (exactCatalogProduct) {
       matchedCatalogIds.push(
         exactCatalogProduct.id
       );

       const recognizedSupplement: Supplement = {
         ...supplement,
         name: exactCatalogProduct.displayName,
         category:
           exactCatalogProduct.category,
       };


       if (
         exactCatalogProduct.defaultTiming ===
         "evening"
       ) {
         evening.push(recognizedSupplement);
       } else {
         morning.push(recognizedSupplement);
       }

       return;
     }

     supplementsNeedingAi.push({
       inputIndex,
       supplement,
     });
   }
 );

 if (supplementsNeedingAi.length === 0) {
   return {
     morning,
     evening,
     unrecognized,
     matchedCatalogIds:
       removeDuplicateIds(matchedCatalogIds),
     usedFallback: false,
   };
 }

 let aiResponse: AiRoutineRecognitionResponse;

 try {
   aiResponse =
     await askAiToRecognizeSupplements(
       supplementsNeedingAi
     );



     console.log(
      "AI RECOGNITION RESPONSE:",
      JSON.stringify(aiResponse, null, 2)
     );






 } catch (error) {


  console.log(
    "CHEESE MAY BE ENTERING THROUGH AI FALLBACK"
   );



   console.error(
     "AI recognition fallback used:",
     error
   );

   const fallback =
     buildFallbackRecognition(
       supplementsNeedingAi
     );

   return {
     morning: [
       ...morning,
       ...fallback.morning,
     ],
     evening: [
       ...evening,
       ...fallback.evening,
     ],
     unrecognized: [
       ...unrecognized,
       ...fallback.unrecognized,
     ],
     matchedCatalogIds:
       removeDuplicateIds([
         ...matchedCatalogIds,
         ...fallback.matchedCatalogIds,
       ]),
     usedFallback: true,
   };
 }

 const supplementsByInputIndex =
   new Map<number, Supplement>();

 supplementsNeedingAi.forEach(
   ({ inputIndex, supplement }) => {
     supplementsByInputIndex.set(
       inputIndex,
       supplement
     );
   }
 );

 const handledInputIndexes = new Set<number>();

 const aiUnrecognized =
   Array.isArray(aiResponse.unrecognized)
     ? aiResponse.unrecognized
     : [];

 aiUnrecognized.forEach((item) => {
   if (
     !isValidInputIndex(
       item?.inputIndex,
       normalizedSupplements.length
     )
   ) {
     return;
   }

   const originalSupplement =
     supplementsByInputIndex.get(
       item.inputIndex
     );

   if (!originalSupplement) {
     return;
   }

   handledInputIndexes.add(item.inputIndex);

   unrecognized.push({
     ...originalSupplement,
     suggestion:
       typeof item.suggestion === "string"
         ? item.suggestion.trim()
         : undefined,
     reason: sanitizeRecognitionReason(
       item.reason
     ),
     note:
       typeof item.note === "string" &&
       item.note.trim()
         ? item.note.trim()
         : "Please confirm this supplement before adding it to a pouch.",
   
 });


});

 const aiRecognized =
   Array.isArray(aiResponse.recognized)
     ? aiResponse.recognized
     : [];

 for (const item of aiRecognized) {
   if (
     !isValidInputIndex(
       item?.inputIndex,
       normalizedSupplements.length
     )
   ) {
     continue;
   }

   if (
     handledInputIndexes.has(
       item.inputIndex
     )
   ) {
     continue;
   }

   const originalSupplement =
     supplementsByInputIndex.get(
       item.inputIndex
     );

   if (!originalSupplement) {
     continue;
   }

   const confidence:
     RecognitionConfidence =
     item.confidence === "high" ||
     item.confidence === "medium" ||
     item.confidence === "low"
       ? item.confidence
       : "medium";

   if (confidence === "low") {
     handledInputIndexes.add(
       item.inputIndex
     );

     unrecognized.push({
       ...originalSupplement,
       reason: "needs_confirmation",
       note:
         item.note?.trim() ||
         "Please confirm this supplement before adding it to a pouch.",
     });

     continue;
   }

   const canonicalName =
     typeof item.canonicalName === "string" &&
     item.canonicalName.trim()
       ? item.canonicalName.trim()
       : originalSupplement.name;



   const recognizedSupplement: Supplement = {
     ...originalSupplement,
     name: canonicalName,
   };



const validation = await validateSupplement({
 supplement: canonicalName,
 brand: originalSupplement.brand,
 dosage: originalSupplement.dosage,
});

if (!validation.valid) {
 handledInputIndexes.add(item.inputIndex);

 unrecognized.push({
   ...originalSupplement,
   reason: "needs_confirmation",
   note:
     originalSupplement.brand
       ? `${originalSupplement.brand} does not appear to make ${canonicalName}. Please choose a different brand.`
       : `${canonicalName} could not be verified. Please review this supplement before adding it to your pouch.`,
 });

 continue;
}








   const timing = sanitizeTiming(
     item.timing,
     canonicalName
   );

   const matchedCatalogProduct =
     findExactCatalogProduct(canonicalName);

   if (matchedCatalogProduct) {
     matchedCatalogIds.push(
       matchedCatalogProduct.id
     );

     recognizedSupplement.category =
       matchedCatalogProduct.category;
   }

   if (timing === "evening") {
     evening.push(recognizedSupplement);
   } else {
     morning.push(recognizedSupplement);
   }

   handledInputIndexes.add(
     item.inputIndex);
 }

 supplementsNeedingAi.forEach(
   ({ inputIndex, supplement }) => {
     if (
       handledInputIndexes.has(inputIndex)
     ) {
       return;
     }

     const fallbackTiming =
       inferTimingWithoutAi(
         supplement.name
       );

     if (fallbackTiming === "evening") {
       evening.push(supplement);
     } else {
       morning.push(supplement);
     }
   }
 );

 return {
   morning,
   evening,
   unrecognized,
   matchedCatalogIds:
     removeDuplicateIds(
       matchedCatalogIds
     ),
   usedFallback: false,
 };
}

function getCoreLimit(
 goals: WellnessGoal[]
) {
 if (
   goals.length === 1 &&
   goals.includes("sleep")
 ) {
   return 1;
 }

 if (goals.length <= 1) {
   return 2;
 }

 if (goals.length === 2) {
   return 4;
 }

 return 6;
}

function getAnchorIdsForGoals(
 goals: WellnessGoal[]
) {
 return goals.flatMap(
   (goal) =>
     GOAL_ANCHOR_PRODUCT_IDS[goal] || []
 );
}

function getSuppressedIdsForCoreProduct(
 coreProductId: string
) {
 if (coreProductId === "magnesium") {
   return [
     "melatonin",
     "5-htp",
     "l-theanine",
     "ashwagandha",
   ];
 }

 if (coreProductId === "b-complex") {
   return ["b12"];
 }

 if (coreProductId === "omega3") {
   return ["fish-oil"];
 }

 if (coreProductId === "fish-oil") {
   return ["omega3"];
 }

 if (coreProductId === "multivitamin") {
   return ["prenatal-multi"];
 }

 if (coreProductId === "probiotic") {
   return ["digestive-enzymes"];
 }

 return [];
}

function getBoostedProductIds(
 values: string[],
 boostMap: Record<string, string[]>
) {
 return values.flatMap(
   (value) =>
     boostMap[normalizeText(value)] || []
 );
}

function getSafetyPenalty(
 product: CatalogProduct,
 lifestyle: string[]
) {
 const normalizedLifestyle =
   lifestyle.map(normalizeText);

 if (
   normalizedLifestyle.some((item) =>
     [
       "pregnant",
       "breastfeeding",
       "tryingtoconceive",
     ].includes(item)
   )
 ) {
   if (
     [
       "ashwagandha",
       "berberine",
       "green-tea-extract",
       "5-htp",
       "melatonin",
     ].includes(product.id)
   ) {
     return -999;
   }
 }

 if (
   normalizedLifestyle.includes(
     "caffeinesensitive"
   )
 ) {
   if (
     product.id ===
     "green-tea-extract"
   ) {
     return -999;
   }

   if (product.id === "rhodiola") {
     return -40;
   }
 }

 return 0;
}

function scoreProductForCore({
 product,
 goals,
 lifestyle,
 considerations,
}: {
 product: CatalogProduct;
 goals: WellnessGoal[];
 lifestyle: string[];
 considerations: string[];
}) {
 const anchorIds =
   getAnchorIdsForGoals(goals);

 const lifestyleBoostIds =
   getBoostedProductIds(
     lifestyle,
     LIFESTYLE_PRODUCT_BOOSTS
   );

 const considerationBoostIds =
   getBoostedProductIds(
     considerations,
     CONSIDERATION_PRODUCT_BOOSTS
   );

 const matchingGoalCount =
   product.supports.filter((goal) =>
     goals.includes(goal)
   ).length;

 const goalMatchScore =
   matchingGoalCount * 30;

 const priorityScore =
   product.corePriority * 10;

 const anchorScore =
   anchorIds.includes(product.id)
     ? 50
     : 0;

 const lifestyleScore =
   lifestyleBoostIds.includes(product.id)
     ? 25
     : 0;

 const considerationScore =
   considerationBoostIds.includes(product.id)
     ? 30
     : 0;

 const safetyPenalty =
   getSafetyPenalty(
     product,
     lifestyle
   );

 const costControlScore =
   goals.length <= 1 &&
   product.monthlyPrice >= 30
     ? -10
     : 0;

 return {
   product,
   totalScore:
     goalMatchScore +
     priorityScore +
     anchorScore +
     lifestyleScore +
     considerationScore +
     safetyPenalty +
     costControlScore,
   goalMatchScore,
   priorityScore,
   anchorScore,
   lifestyleScore,
   considerationScore,
   safetyPenalty,
   costControlScore,
 };
}

function buildGoalBasedCoreProductIds({
 goals,
 lifestyle,
 considerations,
}: {
 goals: WellnessGoal[];
 lifestyle: string[];
 considerations: string[];
}) {
 const limit = getCoreLimit(goals);
 const selectedIds: string[] = [];
 const suppressedIds =
   new Set<string>();

 const boostedAnchorIds = [
   ...getAnchorIdsForGoals(goals),
   ...getBoostedProductIds(
     lifestyle,
     LIFESTYLE_PRODUCT_BOOSTS
   ),
   ...getBoostedProductIds(
     considerations,
     CONSIDERATION_PRODUCT_BOOSTS
   ),
 ];

 boostedAnchorIds.forEach(
   (anchorId) => {
     const product =
       findCatalogProduct(anchorId);

     if (!product) {
       return;
     }

     if (product.isOptionalOnly) {
       return;
     }

     if (
       selectedIds.includes(anchorId)
     ) {
       return;
     }

     if (
       suppressedIds.has(anchorId)
     ) {
       return;
     }

     if (
       getSafetyPenalty(
         product,
         lifestyle
       ) <= -999
     ) {
       return;
     }

     if (
       selectedIds.length >= limit
     ) {
       return;
     }

     selectedIds.push(anchorId);

     getSuppressedIdsForCoreProduct(
       anchorId
     ).forEach((id) =>
       suppressedIds.add(id)
     );
   }
 );

 const rankedProducts: ScoredProduct[] =
   VIDAPOUCH_CATALOG.filter(
     (product) =>
       !product.isOptionalOnly &&
       !selectedIds.includes(
         product.id
       ) &&
       !suppressedIds.has(
         product.id
       ) &&
       getSafetyPenalty(
         product,
         lifestyle
       ) > -999 &&
       product.supports.some((goal) =>
         goals.includes(goal)
       )
   )
     .map((product) =>
       scoreProductForCore({
         product,
         goals,
         lifestyle,
         considerations,
       })
     )
     .sort(
       (a, b) =>
         b.totalScore - a.totalScore
     );

 rankedProducts.forEach(
   ({ product }) => {
     if (
       selectedIds.length >= limit
     ) {
       return;
     }

     if (
       selectedIds.includes(
         product.id
       )
     ) {
       return;
     }

     if (
       suppressedIds.has(product.id)
     ) {
       return;
     }

     selectedIds.push(product.id);

     getSuppressedIdsForCoreProduct(
       product.id
     ).forEach((id) =>
       suppressedIds.add(id)
     );
   }
 );

 return removeDuplicateIds(
   selectedIds
 );
}

function getSuggestionBenefitText(
 product: CatalogProduct
) {
 return product.description;
}

function isRelevantSuggestionForGoals(
 product: CatalogProduct,
 goals: WellnessGoal[]
) {
 return product.supports.some((goal) =>
   goals.includes(goal)
 );
}

function scoreProductForSuggestion({
 product,
 goals,
 coreIds,
 lifestyle,
 considerations,
}: {
 product: CatalogProduct;
 goals: WellnessGoal[];
 coreIds: string[];
 lifestyle: string[];
 considerations: string[];
}) {
 const coreIdSet =
   new Set(coreIds);

 const lifestyleBoostIds =
   getBoostedProductIds(
     lifestyle,
     LIFESTYLE_PRODUCT_BOOSTS
   );

 const considerationBoostIds =
   getBoostedProductIds(
     considerations,
     CONSIDERATION_PRODUCT_BOOSTS
   );

 const matchingGoalCount =
   product.supports.filter((goal) =>
     goals.includes(goal)
   ).length;

 const pairedCoreCount =
   coreIds.filter((coreId) => {
     const coreProduct =
       findCatalogProduct(coreId);

     return coreProduct?.pairsWellWith.includes(
       product.id
     );
   }).length;

 const suppressedByCoreCount =
   coreIds.filter((coreId) =>
     getSuppressedIdsForCoreProduct(
       coreId
     ).includes(product.id)
   ).length;

 const goalMatchScore =
   matchingGoalCount * 25;

 const pairingScore =
   pairedCoreCount * 35;

 const suppressionMovedToOptionalScore =
   suppressedByCoreCount * 40;

 const lifestyleScore =
   lifestyleBoostIds.includes(product.id)
     ? 20
     : 0;

 const considerationScore =
   considerationBoostIds.includes(product.id)
     ? 25
     : 0;

 const priorityScore =
   product.suggestionPriority * 10;

 const optionalOnlyScore =
   product.isOptionalOnly ? 15 : 0;

 const duplicatePenalty =
   coreIdSet.has(product.id)
     ? -999
     : 0;

 const safetyPenalty =
   getSafetyPenalty(
     product,
     lifestyle
   );

 return {
   product,
   totalScore:
     goalMatchScore +
     pairingScore +
     suppressionMovedToOptionalScore +
     lifestyleScore +
     considerationScore +
     priorityScore +
     optionalOnlyScore +
     duplicatePenalty +
     safetyPenalty,
 };
}

function buildSuggestedAdditions({
 coreIds,
 goals,
 lifestyle,
 considerations,
}: {
 coreIds: string[];
 goals: WellnessGoal[];
 lifestyle: string[];
 considerations: string[];
}) {
 const coreIdSet =
   new Set(coreIds);

 const lifestyleBoostIds =
   getBoostedProductIds(
     lifestyle,
     LIFESTYLE_PRODUCT_BOOSTS
   );

 const considerationBoostIds =
   getBoostedProductIds(
     considerations,
     CONSIDERATION_PRODUCT_BOOSTS
   );

 const candidates =
   VIDAPOUCH_CATALOG.filter(
     (product) => {
       if (
         coreIdSet.has(product.id)
       ) {
         return false;
       }

       if (
         getSafetyPenalty(
           product,
           lifestyle
         ) <= -999
       ) {
         return false;
       }

       const hasGoalRelevance =
         isRelevantSuggestionForGoals(
           product,
           goals
         );

       const hasLifestyleRelevance =
         lifestyleBoostIds.includes(
           product.id
         );

       const hasConsiderationRelevance =
         considerationBoostIds.includes(
           product.id
         );

       const pairsWithCore =
         coreIds.some((coreId) => {
           const coreProduct =
             findCatalogProduct(coreId);

           return coreProduct?.pairsWellWith.includes(
             product.id
           );
         });

       const wasSuppressedFromCore =
         coreIds.some((coreId) =>
           getSuppressedIdsForCoreProduct(
             coreId
           ).includes(product.id)
         );

       return (
         hasGoalRelevance ||
         hasLifestyleRelevance ||
         hasConsiderationRelevance ||
         pairsWithCore ||
         wasSuppressedFromCore
       );
     }
   );

 return candidates
   .map((product) =>
     scoreProductForSuggestion({
       product,
       goals,
       coreIds,
       lifestyle,
       considerations,
     })
   )
   .sort(
     (a, b) =>
       b.totalScore - a.totalScore
   )
   .map(({ product }) => ({
     id: product.id,
     reason:
       getSuggestionBenefitText(
         product
       ),
     suggestedTiming:
       product.defaultTiming,
   }))
   .slice(0, 4);
}

function buildSafetyReviewItems(
 lifestyle: string[],
 considerations: string[]
): UnrecognizedItem[] {
 const selected = [
   ...lifestyle,
   ...considerations,
 ];

 const normalizedSelected =
   selected.map(normalizeText);

 if (
   !normalizedSelected.some((item) =>
     CLINICIAN_REVIEW_CONSIDERATIONS.includes(
       item
     )
   )
 ) {
   return [];
 }

 return [
   {
     name:
       "Clinician review recommended",
     dosage: "",
     reason: "needs_confirmation",
     note:
       "Because of your lifestyle or health considerations, please review this supplement routine with a clinician before starting or changing supplements.",
   },
 ];
}

export async function POST(
 req: Request
) {
 let supplements: unknown[] = [];
 let goals: string[] = [];
 let lifestyle: string[] = [];
 let considerations: string[] = [];

 try {
   const body = await req.json();

   supplements =
     Array.isArray(body.supplements)
       ? body.supplements
       : [];

   goals =
     Array.isArray(body.goals)
       ? body.goals
       : [];

   lifestyle =
     Array.isArray(body.lifestyle)
       ? body.lifestyle
       : [];

   considerations =
     Array.isArray(body.considerations)
       ? body.considerations
       : [];

   const isGoalBasedRequest =
     goals.length > 0;

   /*
    * GOAL-BASED AI PATH
    *
    * This remains catalog-driven so the AI builder
    * recommends products that VidaPouch has intentionally
    * configured, priced, categorized, and reviewed.
    */
   if (isGoalBasedRequest) {
     const inferredGoals =
       inferGoalsFromText(goals);

     if (
       inferredGoals.length === 0
     ) {
       return NextResponse.json({
         morning: [],
         evening: [],
         unrecognized: goals.map(
           (goal) => ({
             name: goal,
             dosage: "",
             reason:
               "needs_confirmation",
             note:
               "This goal needs review before a pouch can be built.",
           })
         ),
         suggestedAdditions: [],
         source: "ai",
       });
     }

     const coreIds =
       buildGoalBasedCoreProductIds({
         goals: inferredGoals,
         lifestyle,
         considerations,
       });

     const splitCoreIds =
       splitProductIdsByTiming(
         coreIds
       );

     const suggestedAdditions =
       buildSuggestedAdditions({
         coreIds,
         goals: inferredGoals,
         lifestyle,
         considerations,
       });

     const safetyReviewItems =
       buildSafetyReviewItems(
         lifestyle,
         considerations
       );

     return NextResponse.json({
       morning: hydrateCatalogIds(
         splitCoreIds.morning
       ),
       evening: hydrateCatalogIds(
         splitCoreIds.evening
       ),
       unrecognized:
         safetyReviewItems,
       suggestedAdditions:
         hydrateSuggestedAdditions(
           suggestedAdditions
         ),
       source: "ai",
     });
   }

   /*
    * EXISTING-ROUTINE PATH
    *
    * The customer's supplement no longer needs to exist
    * in VIDAPOUCH_CATALOG.
    *
    * Exact catalog matches are handled immediately.
    * All other legitimate supplements are recognized and
    * assigned by AI while preserving the customer's brand
    * and daily amount.
    *
    * The catalog is retained only for matching known items
    * and generating optional suggested additions.
    */
   const currentRoutine =
     await buildCurrentRoutine(
       supplements
     );

   const routineGoalHints =
     currentRoutine.matchedCatalogIds.flatMap(
       (productId) => {
         const product =
           findCatalogProduct(productId);

         return product?.supports || [];
       }
     );

   const uniqueRoutineGoalHints =
     Array.from(
       new Set(routineGoalHints)
     );

   const suggestedAdditions =
     currentRoutine.matchedCatalogIds
       .length > 0
       ? buildSuggestedAdditions({
           coreIds:
             currentRoutine.matchedCatalogIds,
           goals:
             uniqueRoutineGoalHints,
           lifestyle: [],
           considerations: [],
         })
       : [];

   return NextResponse.json({
     morning: currentRoutine.morning,
     evening: currentRoutine.evening,
     unrecognized:
       currentRoutine.unrecognized,
     suggestedAdditions:
       hydrateSuggestedAdditions(
         suggestedAdditions
       ),
     source:
       currentRoutine.usedFallback
         ? "fallback"
         : "ai",
   });
 } catch (error) {
   console.error(
     "Build plan route error:",
     error
   );

   const recoverableSupplements =
     supplements
       .map((item) =>
         normalizeUserSupplement(
           (item || {}) as Partial<Supplement>
         )
       )
       .filter((item) =>
         Boolean(item.name)
       );

   const morning: Supplement[] = [];
   const evening: Supplement[] = [];

   recoverableSupplements.forEach(
     (supplement) => {
       const timing =
         inferTimingWithoutAi(
           supplement.name
         );

       if (timing === "evening") {
         evening.push(supplement);
       } else {
         morning.push(supplement);
       }
     }
   );

   return NextResponse.json(
     {
       morning,
       evening,
       unrecognized: [],
       suggestedAdditions: [],
       source: "fallback",
     },
     {
       status: 200,
     }
   );
 }
}