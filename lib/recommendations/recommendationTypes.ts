import type { RetailProduct } from "../pricing/types";
import type { BrandScoreBreakdown } from "./brandOption";

export type ProductScore = {

 quality: number;

 value: number;

 reviews: number;

 evidence: number;

 availability: number;

 overall: number;

};

export type RecommendationReason = {

 title: string;

 description: string;

 importance: number;

};

export type Recommendation = {

 product: RetailProduct;

 score: BrandScoreBreakdown;

 confidence: "high" | "medium" | "low";

 reasons: RecommendationReason[];

 alternatives: RetailProduct[];

 recommended: boolean;

};

export type CustomerShoppingPreferences = {

 preferredBrands?: string[];

 avoidedBrands?: string[];

 prefersLowestCost?: boolean;

 prefersHighestQuality?: boolean;

 prefersThirdPartyTesting?: boolean;

 prefersFastShipping?: boolean;

};
