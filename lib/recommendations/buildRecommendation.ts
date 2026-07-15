import type {
  RetailProduct,
 } from "@/lib/pricing/types";
 
 import type {
  BrandOption,
 } from "./brandOption";
 
 import type {
  Recommendation,
 } from "./recommendationTypes";
 
 import {
  buildBrandOptions,
 } from "./buildBrandOptions";
 
 import {
  buildBrandComparison,
 } from "./buildBrandComparison";
 
 import {
  recommendProduct,
 } from "./recommendProduct";
 
 export type BuildRecommendationResult = {
  recommendation: Recommendation;
  brandOptions: BrandOption[];
 };
 
 export function buildRecommendation(
  products: RetailProduct[],
  capsulesPerDay: number
 ): BuildRecommendationResult | null {
  const brandOptions =
    buildBrandOptions(
      products,
      capsulesPerDay
    );
 
  if (brandOptions.length === 0) {
    return null;
  }
 
  const comparison =
    buildBrandComparison(
      brandOptions
    );
 
  const recommendation =
    recommendProduct(
      comparison.brands
    );
 
  if (!recommendation) {
    return null;
  }
 
  return {
    recommendation,
    brandOptions:
      comparison.brands,
  };
 }
 