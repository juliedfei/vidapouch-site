import type {
  ProductResearch,
 } from "@/lib/intelligence/productResearch/productResearchTypes";
 
 import type {
  ProductScoringInput,
 } from "./productScoringInput";
 
 import {
  calculateReviewScore,
 } from "./evaluators/calculateReviewScore";
 
 import {
  calculateAvailabilityScore,
 } from "./evaluators/calculateAvailabilityScore";
 
 import {
  calculateCertificationScore,
 } from "./evaluators/calculateCertificationScore";
 
 import {
  calculateCleanIngredientScore,
 } from "./evaluators/calculateCleanIngredientScore";
 
 import {
  calculateEvidenceScore,
 } from "./evaluators/calculateEvidenceScore";
 
 function clampScore(
  value: number
 ) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value)
    )
  );
 }
 
 export function evaluateProduct(
  research: ProductResearch
 ): ProductScoringInput {
  const reviews =
    calculateReviewScore({
      averageRating:
        research.averageRating,
 
      reviewCount:
        research.reviewCount,
    });
 
  /*
   * Temporary value input.
   *
   * VidaSearch replaces this with actual
   * product pricing before scoreProduct()
   * runs.
   *
   * Checkout should eventually supply its
   * actual calculated value here as well.
   */
  const value = 50;
 
  const evidence =
    calculateEvidenceScore({
      aiConfidence:
        research.aiConfidence ??
        0,
 
      evidenceCount:
        research.evidence.length,
    });
 
  /*
   * Temporary availability input.
   *
   * VidaSearch replaces this with real
   * listing and retailer counts before
   * scoreProduct() runs.
   */
  const availability =
    calculateAvailabilityScore({
      vendorCount: 1,
 
      listingCount: 1,
    });
 
  const cleanIngredients =
    calculateCleanIngredientScore({
      artificialColors:
        research.artificialColors,
 
      artificialSweeteners:
        research.artificialSweeteners,
 
      preservatives:
        research.preservatives,
 
      soyFree:
        research.soyFree,
 
      dairyFree:
        research.dairyFree,
 
      glutenFree:
        research.glutenFree,
 
      vegan:
        research.vegan,
    });
 
  const certifications =
    calculateCertificationScore({
      thirdPartyTested:
        research.thirdPartyTested,
 
      uspVerified:
        research.uspVerified,
 
      nsfCertified:
        research.nsfCertified,
 
      certifications:
        research.certifications,
 
      qualityClaims:
        research.qualityClaims,
    });
 
  /*
   * Product quality is no longer assigned a
   * default score.
   *
   * Certifications and testing are the
   * dominant quality signal.
   *
   * Clean-ingredient information provides
   * supporting credit but cannot compensate
   * for weak or missing quality verification.
   */
  const quality =
    clampScore(
      certifications * 0.75 +
      cleanIngredients * 0.25
    );
 
  const aiConfidence =
    clampScore(
      (
        research.aiConfidence ??
        0
      ) * 100
    );
 
  /*
   * Completeness is based only on fields
   * that materially support product scoring.
   *
   * Missing data does not count as positive.
   */
  const completenessFields = [
    research.ingredients.length >
      0,
 
    research.certifications.length >
      0 ||
      
      
      
      (
        research.qualityClaims
          ?.length ??
        0
       ) >
        0,



 
    research.evidence.length >
      0,
 
    typeof research.averageRating ===
      "number",
 
    typeof research.reviewCount ===
      "number",
 
    Boolean(
      research.aiSummary
        ?.trim()
    ),
 
    research.researchStatus !==
      "not-found",
  ];
 
  const knownFields =
    completenessFields.filter(
      Boolean
    ).length;
 
  const dataCompleteness =
    clampScore(
      (
        knownFields /
        completenessFields.length
      ) * 100
    );
 
  return {
    quality,
 
    reviews,
 
    value,
 
    evidence,
 
    availability,
 
    cleanIngredients,
 
    certifications,
 
    aiConfidence,
 
    dataCompleteness,
  };
 }
 