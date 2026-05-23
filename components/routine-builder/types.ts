export type Path = "start" | "current" | "goal" | "plan";

export type PouchTiming = "morning" | "evening";

export type WellnessGoal =
 | "general_wellness"
 | "sleep"
 | "stress_mood"
 | "energy"
 | "focus_brain"
 | "heart_circulation"
 | "muscle_strength"
 | "endurance"
 | "hair_skin_nails"
 | "gut_health"
 | "immune_support"
 | "bone_joint"
 | "metabolism_weight"
 | "healthy_aging"
 | "womens_health"
 | "mens_health"
 | "hormone_support"
 | "eye_health"
 | "liver_support"
 | "hydration"
 | "recovery";

export type CatalogProduct = {
 id: string;
 name: string;
 displayName: string;
 description: string;
 category: string;
 defaultTiming: PouchTiming;
 monthlyPrice: number;
 dosage: string;
 brand: "Vidapouch";
 supports: WellnessGoal[];
 pairsWellWith: string[];
 avoidPairingWith?: string[];
 suggestionPriority: number;
 corePriority: number;
 isOptionalOnly?: boolean;
};

export type Supplement = {
 id?: string;
 name: string;
 dosage: string;
 monthlyPrice?: number;
 description?: string;
 category?: string;
};

export type ReviewReason =
 | "unrecognized"
 | "possible_misspelling"
 | "unsupported_format"
 | "needs_confirmation";

export type UnrecognizedItem = Supplement & {
 suggestion?: string;
 reason?: ReviewReason;
 note?: string;
};

export type SuggestedAddition = Supplement & {
 reason: string;
 suggestedTiming: PouchTiming;
};

export type PouchSummary = {
 subtotal: number;
 itemCount: number;
 monthlyLabel: string;
};

export type BuildPlanResponse = {
 morning: Supplement[];
 evening: Supplement[];
 unrecognized: UnrecognizedItem[];
 suggestedAdditions?: SuggestedAddition[];
 source?: "ai" | "fallback" | "error";
};
