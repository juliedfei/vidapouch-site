import type {
  RetailProduct,
 } from "@/lib/pricing/types";
 
 import type {
  ProductOption,
 } from "./productOption";
 
 import type {
  Recommendation,
 } from "./recommendationTypes";
 
 import {
  buildProductOptions,
 } from "./buildProductOptions";
 
 import {
  recommendProduct,
 } from "./recommendProduct";
 
 export type BuildRecommendationResult = {
  recommendation: Recommendation;
 
  productOptions: ProductOption[];
 };
 
 export async function buildRecommendation(
  products: RetailProduct[],
  capsulesPerDay: number
 ): Promise<BuildRecommendationResult | null> {
 
  const productOptions =
    await buildProductOptions(
      products,
      capsulesPerDay
    );
 
  if (productOptions.length === 0) {
    return null;
  }
 
  const recommendation =
    recommendProduct(
      productOptions
    );
 
  if (!recommendation) {
    return null;
  }
 
  return {
    recommendation,
 
    productOptions,
  };
 
 }
 