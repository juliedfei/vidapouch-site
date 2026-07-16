import type {
  ProductScoringInput,
 } from "./productScoringInput";
 
 import type {
  ProductScore,
 } from "./recommendationTypes";
 
 import {
  DEFAULT_RECOMMENDATION_WEIGHTS,
 } from "./recommendationCriteria";
 
 /*
 * Combines the evaluated category
 * scores into one overall product
 * recommendation score.
 *
 * IMPORTANT:
 *
 * This file performs NO AI,
 * NO pricing,
 * NO searching,
 * NO database lookups.
 *
 * Every category has already been
 * evaluated before reaching this
 * function.
 */
 export function scoreProduct(
  scoring: ProductScoringInput
 ): ProductScore {
 
  const weights =
    DEFAULT_RECOMMENDATION_WEIGHTS;
 
  const overall =
 
    (
 
      scoring.quality *
      weights.quality +
 
      scoring.reviews *
      weights.reviews +
 
      scoring.value *
      weights.value +
 
      scoring.evidence *
      weights.evidence +
 
      scoring.availability *
      weights.availability
 
    ) / 100;
 
  return {
 
    quality:
      scoring.quality,
 
    reviews:
      scoring.reviews,
 
    value:
      scoring.value,
 
    evidence:
      scoring.evidence,
 
    availability:
      scoring.availability,
 
    overall:
      Math.round(
        overall * 10
      ) / 10,
 
  };
 
 }
 