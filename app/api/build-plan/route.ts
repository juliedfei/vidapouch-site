import { NextResponse } from "next/server";
import { VIDAPOUCH_CATALOG } from "@/components/routine-builder/catalog";

import type {
 CatalogProduct,
 Supplement,
 SuggestedAddition,
 WellnessGoal,
} from "@/components/routine-builder/types";

type SuggestedAdditionInput = {
 id: string;
 reason: string;
 suggestedTiming: "morning" | "evening";
};

type AiPlanResponse = {
 morning?: string[];
 evening?: string[];
 unrecognized?: any[];
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

const GOAL_ALIASES: Record<WellnessGoal, string[]> = {
 general_wellness: ["general", "wellness", "overall", "daily", "foundation"],
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

const GOAL_ANCHOR_PRODUCT_IDS: Partial<Record<WellnessGoal, string[]>> = {
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
 tryingtoconceive: ["prenatal-multi", "omega3", "vitamin-d3"],
 athleticactive: ["creatine", "electrolytes", "magnesium", "coq10"],
 caffeinesensitive: ["b-complex", "coq10", "magnesium"],
 minimalcapsulespreferred: ["multivitamin", "omega3", "magnesium"],
 lowsunexposure: ["vitamin-d3", "vitamin-k2", "calcium"],
};

const CONSIDERATION_PRODUCT_BOOSTS: Record<string, string[]> = {
 migraines: ["magnesium", "coq10", "b-complex", "omega3"],
 ataxianeurologicalsupport: ["omega3", "coq10", "b-complex", "vitamin-d3"],
 irondeficiency: ["iron", "vitamin-c", "multivitamin"],
 thyroidsupport: ["zinc", "multivitamin"],
 menopause: ["calcium", "vitamin-d3", "magnesium", "omega3"],
 autoimmunesupport: ["vitamin-d3", "omega3", "quercetin", "probiotic"],
 chronicfatigue: ["b-complex", "coq10", "magnesium", "vitamin-d3"],
 jointpaininflammation: ["turmeric", "glucosamine", "boswellia", "omega3"],
 digestivesensitivity: ["probiotic", "digestive-enzymes", "fiber"],
 highstress: ["magnesium", "l-theanine", "ashwagandha", "saffron"],
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

function catalogProductToSupplement(product: CatalogProduct): Supplement {
 return {
   id: product.id,
   name: product.displayName,
   dosage: product.dosage,
   monthlyPrice: product.monthlyPrice,
   description: product.description,
   category: product.category,
 };
}

function findCatalogProduct(productId: string) {
 return VIDAPOUCH_CATALOG.find((product) => product.id === productId);
}

function hydrateCatalogIds(productIds: string[]): Supplement[] {
 return productIds
   .map((productId) => findCatalogProduct(productId))
   .filter((product): product is CatalogProduct => Boolean(product))
   .map(catalogProductToSupplement);
}

function hydrateSuggestedAdditions(
 additions: SuggestedAdditionInput[]
): SuggestedAddition[] {
 return additions
   .map((addition) => {
     const product = findCatalogProduct(addition.id);
     if (!product) return null;

     return {
       ...catalogProductToSupplement(product),
       reason: addition.reason,
       suggestedTiming: addition.suggestedTiming,
     };
   })
   .filter((addition): addition is SuggestedAddition => Boolean(addition));
}

function normalizeText(value: string) {
 return value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function inferGoalsFromText(values: string[]): WellnessGoal[] {
 const text = values.join(" ").toLowerCase();

 return Array.from(
   new Set(
     Object.entries(GOAL_ALIASES)
       .filter(([, aliases]) =>
         aliases.some((alias) => text.includes(alias.toLowerCase()))
       )
       .map(([goal]) => goal as WellnessGoal)
   )
 );
}

function getCatalogSearchTerms(product: CatalogProduct) {
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

function findExactCatalogProductId(name: string) {
 const normalizedName = normalizeText(name);
 if (!normalizedName) return null;

 const match = VIDAPOUCH_CATALOG.find((product) =>
   getCatalogSearchTerms(product).some((term) => normalizedName === term)
 );

 return match?.id || null;
}

function getLevenshteinDistance(a: string, b: string) {
 const matrix = Array.from({ length: a.length + 1 }, () =>
   Array.from({ length: b.length + 1 }, () => 0)
 );

 for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
 for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

 for (let i = 1; i <= a.length; i += 1) {
   for (let j = 1; j <= b.length; j += 1) {
     const cost = a[i - 1] === b[j - 1] ? 0 : 1;

     matrix[i][j] = Math.min(
       matrix[i - 1][j] + 1,
       matrix[i][j - 1] + 1,
       matrix[i - 1][j - 1] + cost
     );
   }
 }

 return matrix[a.length][b.length];
}

function findPossibleCatalogMisspelling(name: string): CatalogProduct | null {
 const normalizedName = normalizeText(name);

 if (!normalizedName || normalizedName.length < 4) return null;
 if (findExactCatalogProductId(name)) return null;

 let bestMatch: CatalogProduct | null = null;
 let bestDistance = Number.POSITIVE_INFINITY;

 for (const product of VIDAPOUCH_CATALOG) {
   for (const term of getCatalogSearchTerms(product)) {
     if (term.length < 4) continue;

     const distance = getLevenshteinDistance(normalizedName, term);
     const isStrongPrefix =
       term.startsWith(normalizedName) && normalizedName.length >= 5;
     const isCloseDistance = distance <= 2;

     if ((isStrongPrefix || isCloseDistance) && distance < bestDistance) {
       bestDistance = distance;
       bestMatch = product;
     }
   }
 }

 return bestMatch;
}

function splitSupplementsForRecognition(supplements: any[]) {
 const supplementsForAi: any[] = [];
 const forcedUnrecognized: any[] = [];

 supplements.forEach((item) => {
   const name = String(item?.name || "");
   const possibleMisspelling = findPossibleCatalogMisspelling(name);

   if (possibleMisspelling) {
     forcedUnrecognized.push({
       ...item,
       reason: "possible_misspelling",
       suggestion: possibleMisspelling.displayName,
       note: `Did you mean ${possibleMisspelling.displayName}? Please edit and recheck before adding it to a pouch.`,
     });
     return;
   }

   supplementsForAi.push(item);
 });

 return { supplementsForAi, forcedUnrecognized };
}

function validateRecognizedProductIds(
 productIds: string[],
 unrecognizedItems: any[]
) {
 const blockedNames = unrecognizedItems
   .filter(
     (item) =>
       item.reason === "possible_misspelling" ||
       item.reason === "needs_confirmation" ||
       item.reason === "unsupported_format" ||
       item.reason === "unrecognized"
   )
   .flatMap((item) => [item.name, item.suggestion])
   .filter(Boolean)
   .map((value) => normalizeText(String(value)));

 return productIds.filter((productId) => {
   const product = findCatalogProduct(productId);
   if (!product) return false;

   const productNames = [product.id, product.name, product.displayName].map(
     (value) => normalizeText(value)
   );

   return !productNames.some((productName) =>
     blockedNames.some(
       (blockedName) =>
         blockedName === productName ||
         blockedName.includes(productName) ||
         productName.includes(blockedName)
     )
   );
 });
}

function removeDuplicateIds(productIds: string[]) {
 return Array.from(new Set(productIds)).filter((id) => findCatalogProduct(id));
}

function splitProductIdsByTiming(productIds: string[]) {
 const morning: string[] = [];
 const evening: string[] = [];

 productIds.forEach((productId) => {
   const product = findCatalogProduct(productId);
   if (!product) return;

   if (product.defaultTiming === "evening") {
     evening.push(product.id);
   } else {
     morning.push(product.id);
   }
 });

 return { morning, evening };
}

function getCoreLimit(goals: WellnessGoal[]) {
 if (goals.length === 1 && goals.includes("sleep")) return 1;
 if (goals.length <= 1) return 2;
 if (goals.length === 2) return 4;
 return 6;
}

function getAnchorIdsForGoals(goals: WellnessGoal[]) {
 return goals.flatMap((goal) => GOAL_ANCHOR_PRODUCT_IDS[goal] || []);
}

function getSuppressedIdsForCoreProduct(coreProductId: string) {
 if (coreProductId === "magnesium") {
   return ["melatonin", "5-htp", "l-theanine", "ashwagandha"];
 }

 if (coreProductId === "b-complex") return ["b12"];
 if (coreProductId === "omega3") return ["fish-oil"];
 if (coreProductId === "fish-oil") return ["omega3"];
 if (coreProductId === "multivitamin") return ["prenatal-multi"];
 if (coreProductId === "probiotic") return ["digestive-enzymes"];

 return [];
}

function getBoostedProductIds(values: string[], boostMap: Record<string, string[]>) {
 return values.flatMap((value) => boostMap[normalizeText(value)] || []);
}

function getSafetyPenalty(product: CatalogProduct, lifestyle: string[]) {
 const normalizedLifestyle = lifestyle.map(normalizeText);

 if (
   normalizedLifestyle.some((item) =>
     ["pregnant", "breastfeeding", "tryingtoconceive"].includes(item)
   )
 ) {
   if (
     ["ashwagandha", "berberine", "green-tea-extract", "5-htp", "melatonin"].includes(
       product.id
     )
   ) {
     return -999;
   }
 }

 if (normalizedLifestyle.includes("caffeinesensitive")) {
   if (product.id === "green-tea-extract") return -999;
   if (product.id === "rhodiola") return -40;
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
 const anchorIds = getAnchorIdsForGoals(goals);
 const lifestyleBoostIds = getBoostedProductIds(lifestyle, LIFESTYLE_PRODUCT_BOOSTS);
 const considerationBoostIds = getBoostedProductIds(
   considerations,
   CONSIDERATION_PRODUCT_BOOSTS
 );

 const matchingGoalCount = product.supports.filter((goal) =>
   goals.includes(goal)
 ).length;

 const goalMatchScore = matchingGoalCount * 30;
 const priorityScore = product.corePriority * 10;
 const anchorScore = anchorIds.includes(product.id) ? 50 : 0;
 const lifestyleScore = lifestyleBoostIds.includes(product.id) ? 25 : 0;
 const considerationScore = considerationBoostIds.includes(product.id) ? 30 : 0;
 const safetyPenalty = getSafetyPenalty(product, lifestyle);
 const costControlScore =
   goals.length <= 1 && product.monthlyPrice >= 30 ? -10 : 0;

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
 const suppressedIds = new Set<string>();

 const boostedAnchorIds = [
   ...getAnchorIdsForGoals(goals),
   ...getBoostedProductIds(lifestyle, LIFESTYLE_PRODUCT_BOOSTS),
   ...getBoostedProductIds(considerations, CONSIDERATION_PRODUCT_BOOSTS),
 ];

 boostedAnchorIds.forEach((anchorId) => {
   const product = findCatalogProduct(anchorId);
   if (!product) return;
   if (product.isOptionalOnly) return;
   if (selectedIds.includes(anchorId)) return;
   if (suppressedIds.has(anchorId)) return;
   if (getSafetyPenalty(product, lifestyle) <= -999) return;
   if (selectedIds.length >= limit) return;

   selectedIds.push(anchorId);

   getSuppressedIdsForCoreProduct(anchorId).forEach((id) =>
     suppressedIds.add(id)
   );
 });

 const rankedProducts: ScoredProduct[] = VIDAPOUCH_CATALOG.filter(
   (product) =>
     !product.isOptionalOnly &&
     !selectedIds.includes(product.id) &&
     !suppressedIds.has(product.id) &&
     getSafetyPenalty(product, lifestyle) > -999 &&
     product.supports.some((goal) => goals.includes(goal))
 )
   .map((product) =>
     scoreProductForCore({
       product,
       goals,
       lifestyle,
       considerations,
     })
   )
   .sort((a, b) => b.totalScore - a.totalScore);

 rankedProducts.forEach(({ product }) => {
   if (selectedIds.length >= limit) return;
   if (selectedIds.includes(product.id)) return;
   if (suppressedIds.has(product.id)) return;

   selectedIds.push(product.id);

   getSuppressedIdsForCoreProduct(product.id).forEach((id) =>
     suppressedIds.add(id)
   );
 });

 return removeDuplicateIds(selectedIds);
}

function getSuggestionBenefitText(product: CatalogProduct) {
 return product.description;
}

function isRelevantSuggestionForGoals(
 product: CatalogProduct,
 goals: WellnessGoal[]
) {
 return product.supports.some((goal) => goals.includes(goal));
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
 const coreIdSet = new Set(coreIds);
 const lifestyleBoostIds = getBoostedProductIds(lifestyle, LIFESTYLE_PRODUCT_BOOSTS);
 const considerationBoostIds = getBoostedProductIds(
   considerations,
   CONSIDERATION_PRODUCT_BOOSTS
 );

 const matchingGoalCount = product.supports.filter((goal) =>
   goals.includes(goal)
 ).length;

 const pairedCoreCount = coreIds.filter((coreId) => {
   const coreProduct = findCatalogProduct(coreId);
   return coreProduct?.pairsWellWith.includes(product.id);
 }).length;

 const suppressedByCoreCount = coreIds.filter((coreId) =>
   getSuppressedIdsForCoreProduct(coreId).includes(product.id)
 ).length;

 const goalMatchScore = matchingGoalCount * 25;
 const pairingScore = pairedCoreCount * 35;
 const suppressionMovedToOptionalScore = suppressedByCoreCount * 40;
 const lifestyleScore = lifestyleBoostIds.includes(product.id) ? 20 : 0;
 const considerationScore = considerationBoostIds.includes(product.id) ? 25 : 0;
 const priorityScore = product.suggestionPriority * 10;
 const optionalOnlyScore = product.isOptionalOnly ? 15 : 0;
 const duplicatePenalty = coreIdSet.has(product.id) ? -999 : 0;
 const safetyPenalty = getSafetyPenalty(product, lifestyle);

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
 const coreIdSet = new Set(coreIds);
 const lifestyleBoostIds = getBoostedProductIds(lifestyle, LIFESTYLE_PRODUCT_BOOSTS);
 const considerationBoostIds = getBoostedProductIds(
   considerations,
   CONSIDERATION_PRODUCT_BOOSTS
 );

 const candidates = VIDAPOUCH_CATALOG.filter((product) => {
   if (coreIdSet.has(product.id)) return false;
   if (getSafetyPenalty(product, lifestyle) <= -999) return false;

   const hasGoalRelevance = isRelevantSuggestionForGoals(product, goals);
   const hasLifestyleRelevance = lifestyleBoostIds.includes(product.id);
   const hasConsiderationRelevance = considerationBoostIds.includes(product.id);

   const pairsWithCore = coreIds.some((coreId) => {
     const coreProduct = findCatalogProduct(coreId);
     return coreProduct?.pairsWellWith.includes(product.id);
   });

   const wasSuppressedFromCore = coreIds.some((coreId) =>
     getSuppressedIdsForCoreProduct(coreId).includes(product.id)
   );

   return (
     hasGoalRelevance ||
     hasLifestyleRelevance ||
     hasConsiderationRelevance ||
     pairsWithCore ||
     wasSuppressedFromCore
   );
 });

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
   .sort((a, b) => b.totalScore - a.totalScore)
   .map(({ product }) => ({
     id: product.id,
     reason: getSuggestionBenefitText(product),
     suggestedTiming: product.defaultTiming,
   }))
   .slice(0, 4);
}

function buildSafetyReviewItems(lifestyle: string[], considerations: string[]) {
 const selected = [...lifestyle, ...considerations];
 const normalizedSelected = selected.map(normalizeText);

 if (
   !normalizedSelected.some((item) =>
     CLINICIAN_REVIEW_CONSIDERATIONS.includes(item)
   )
 ) {
   return [];
 }

 return [
   {
     name: "Clinician review recommended",
     dosage: "",
     reason: "needs_confirmation",
     note:
       "Because of your lifestyle or health considerations, please review this supplement routine with a clinician before starting or changing supplements.",
   },
 ];
}

function directMatchSupplementToCatalogId(name: string) {
 return findExactCatalogProductId(name);
}

async function askAiToRecognizeSupplements(supplements: any[]) {
 const catalogForPrompt = VIDAPOUCH_CATALOG.map((product) => ({
   id: product.id,
   displayName: product.displayName,
   category: product.category,
   defaultTiming: product.defaultTiming,
 }));

 const response = await fetch("https://api.openai.com/v1/chat/completions", {
   method: "POST",
   headers: {
     "Content-Type": "application/json",
     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
   },
   body: JSON.stringify({
     model: "gpt-4o-mini",
     temperature: 0.1,
     messages: [
       {
         role: "system",
         content:
           "You translate user-entered supplements into approved Vidapouch catalog product IDs. Return ONLY valid JSON. Never invent products. Misspelled, incomplete, uncertain, unsupported format, medication, or prescription items must stay in unrecognized and must not also be placed into a pouch.",
       },
       {
         role: "user",
         content: `
User-entered supplements:
${JSON.stringify(supplements)}

Approved Vidapouch catalog:
${JSON.stringify(catalogForPrompt)}

Return ONLY this exact JSON shape:
{
"morning": [],
"evening": [],
"unrecognized": []
}

Rules:
- morning and evening must contain catalog IDs only.
- Exact or clearly written supplement names may be placed into morning or evening.
- Do NOT autocorrect misspellings into the pouch.
- If the item looks misspelled or incomplete, put it in unrecognized with reason "possible_misspelling" and a suggestion if likely.
- If an item is possible_misspelling, do NOT also place the suggested product in morning or evening.
- If the user writes powder, drink mix, scoop, liquid, gummy, food, medication, or prescription, put it in unrecognized with reason "unsupported_format".
- If a product is uncertain, put it in unrecognized with reason "needs_confirmation".
- Use morning for energizing/general supplements.
- Use evening for magnesium, melatonin, l-theanine, ashwagandha, inositol, and 5-htp.

For unrecognized items, return:
{
"name": original name,
"dosage": original dosage or "",
"suggestion": optional correction,
"reason": "unrecognized" | "possible_misspelling" | "unsupported_format" | "needs_confirmation",
"note": "Short explanation"
}
`,
       },
     ],
   }),
 });

 const data = await response.json();

 if (!response.ok) {
   console.error("OpenAI API error:", data);
   throw new Error("AI supplement recognition failed.");
 }

 const content = data.choices?.[0]?.message?.content;

 if (!content) {
   throw new Error("AI returned no content.");
 }

 const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();

 return JSON.parse(cleaned) as AiPlanResponse;
}

function fallbackRecognizeSupplements(supplements: any[]) {
 const morning: string[] = [];
 const evening: string[] = [];
 const unrecognized: any[] = [];

 supplements.forEach((item) => {
   const name = String(item?.name || "");
   const normalizedName = normalizeText(name);

   const unsupportedFormat =
     normalizedName.includes("powder") ||
     normalizedName.includes("drinkmix") ||
     normalizedName.includes("liquid") ||
     normalizedName.includes("gummy") ||
     normalizedName.includes("food") ||
     normalizedName.includes("prescription") ||
     normalizedName.includes("medication");

   if (unsupportedFormat) {
     unrecognized.push({
       ...item,
       reason: "unsupported_format",
       note: "This format is not currently supported for daily pouches.",
     });
     return;
   }

   const productId = directMatchSupplementToCatalogId(name);

   if (!productId) {
     unrecognized.push({
       ...item,
       reason: "needs_confirmation",
       note: "This item needs review before it can be added to a pouch.",
     });
     return;
   }

   const product = findCatalogProduct(productId);
   if (!product) return;

   if (product.defaultTiming === "evening") {
     evening.push(productId);
   } else {
     morning.push(productId);
   }
 });

 return { morning, evening, unrecognized };
}

export async function POST(req: Request) {
 let supplements: any[] = [];
 let goals: string[] = [];
 let lifestyle: string[] = [];
 let considerations: string[] = [];

 try {
   const body = await req.json();

   supplements = body.supplements || [];
   goals = body.goals || [];
   lifestyle = body.lifestyle || [];
   considerations = body.considerations || [];

   const isGoalBasedRequest = goals.length > 0;

   if (isGoalBasedRequest) {
     const inferredGoals = inferGoalsFromText(goals);

     if (inferredGoals.length === 0) {
       return NextResponse.json({
         morning: [],
         evening: [],
         unrecognized: goals.map((goal) => ({
           name: goal,
           dosage: "",
           reason: "needs_confirmation",
           note: "This goal needs review before a pouch can be built.",
         })),
         suggestedAdditions: [],
         source: "ai",
       });
     }

     const coreIds = buildGoalBasedCoreProductIds({
       goals: inferredGoals,
       lifestyle,
       considerations,
     });

     const splitCoreIds = splitProductIdsByTiming(coreIds);

     const suggestedAdditions = buildSuggestedAdditions({
       coreIds,
       goals: inferredGoals,
       lifestyle,
       considerations,
     });

     const safetyReviewItems = buildSafetyReviewItems(
       lifestyle,
       considerations
     );

     return NextResponse.json({
       morning: hydrateCatalogIds(splitCoreIds.morning),
       evening: hydrateCatalogIds(splitCoreIds.evening),
       unrecognized: safetyReviewItems,
       suggestedAdditions: hydrateSuggestedAdditions(suggestedAdditions),
       source: "ai",
     });
   }

   const { supplementsForAi, forcedUnrecognized } =
     splitSupplementsForRecognition(supplements);

   let parsed: AiPlanResponse;

   try {
     parsed =
       supplementsForAi.length > 0
         ? await askAiToRecognizeSupplements(supplementsForAi)
         : { morning: [], evening: [], unrecognized: [] };
   } catch (error) {
     console.error("AI recognition fallback used:", error);
     parsed = fallbackRecognizeSupplements(supplementsForAi);
   }

   const unrecognized = [...(parsed.unrecognized || []), ...forcedUnrecognized];

   const validatedMorningIds = validateRecognizedProductIds(
     parsed.morning || [],
     unrecognized
   );

   const validatedEveningIds = validateRecognizedProductIds(
     parsed.evening || [],
     unrecognized
   );

   const coreIds = removeDuplicateIds([
     ...validatedMorningIds,
     ...validatedEveningIds,
   ]);

   const routineGoalHints = coreIds.flatMap((coreId) => {
     const product = findCatalogProduct(coreId);
     return product?.supports || [];
   });

   const suggestedAdditions = buildSuggestedAdditions({
     coreIds,
     goals: Array.from(new Set(routineGoalHints)),
     lifestyle: [],
     considerations: [],
   });

   return NextResponse.json({
     morning: hydrateCatalogIds(validatedMorningIds),
     evening: hydrateCatalogIds(validatedEveningIds),
     unrecognized,
     suggestedAdditions: hydrateSuggestedAdditions(suggestedAdditions),
     source: "ai",
   });
 } catch (error) {
   console.error("Build plan route error:", error);

   return NextResponse.json(
     {
       morning: [],
       evening: [],
       unrecognized: supplements.map((item) => ({
         ...item,
         reason: "needs_confirmation",
         note:
           "Something went wrong while building the plan, so this item needs review.",
       })),
       suggestedAdditions: [],
       source: "error",
     },
     { status: 500 }
   );
 }
}
