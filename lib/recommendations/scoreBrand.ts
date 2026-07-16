import type {
    BrandProfile,
   } from "./brandProfileTypes";
   
   export type BrandIntelligenceScore = {
    quality: number;
    testing: number;
    evidence: number;
    reputation: number;
    availability: number;
    dataCompleteness: number;
    overall: number;
    confidence: number;
   };
   
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
   
   function confidencePoints(
    confidence:
      | "verified"
      | "reported"
      | "unknown"
   ) {
    switch (confidence) {
      case "verified":
        return 1;
   
      case "reported":
        return 0.65;
   
      default:
        return 0.25;
    }
   }
   
   function scoreBooleanFact({
    value,
    confidence,
    truePoints,
    falsePoints = 0,
    unknownPoints = 0,
   }: {
    value: boolean | null;
    confidence:
      | "verified"
      | "reported"
      | "unknown";
    truePoints: number;
    falsePoints?: number;
    unknownPoints?: number;
   }) {
    if (value === null) {
      return unknownPoints;
    }
   
    const multiplier =
      confidencePoints(
        confidence
      );
   
    return value
      ? truePoints * multiplier
      : falsePoints * multiplier;
   }
   
   function scorePricePosition(
    priceTier:
      BrandProfile["priceTier"]
   ) {
    switch (priceTier) {
      case "budget":
        return 90;
   
      case "value":
        return 95;
   
      case "midrange":
        return 82;
   
      case "premium":
        return 72;
   
      case "professional":
        return 65;
   
      default:
        return 70;
    }
   }
   
   function scoreAvailability(
    availability:
      BrandProfile["availability"]
   ) {
    switch (availability) {
      case "national":
        return 100;
   
      case "wide":
        return 88;
   
      case "moderate":
        return 70;
   
      case "limited":
        return 48;
   
      default:
        return 55;
    }
   }
   
   function calculateDataCompleteness(
    profile: BrandProfile
   ) {
    const facts = [
      profile.thirdPartyTesting.value,
      profile.practitionerGrade.value,
      profile.cGmpCompliant.value,
      profile.hypoallergenicFocus.value,
      profile.veganOptions.value,
      profile.priceTier,
      profile.availability,
      profile.displayName,
    ];
   
    const completedFacts =
      facts.filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      ).length;
   
    const baseCompleteness =
      (
        completedFacts /
        facts.length
      ) * 85;
   
    const evidenceBonus =
      Math.min(
        15,
        profile.certifications.length *
          5
      );
   
    return clampScore(
      baseCompleteness +
        evidenceBonus
    );
   }
   
   function calculateConfidence(
    profile: BrandProfile,
    dataCompleteness: number
   ) {
    const profileConfidenceScore =
      confidencePoints(
        profile.profileConfidence
      ) * 70;
   
    const certificationBonus =
      Math.min(
        15,
        profile.certifications.length *
          5
      );
   
    const completenessBonus =
      dataCompleteness * 0.15;
   
    return clampScore(
      profileConfidenceScore +
        certificationBonus +
        completenessBonus
    );
   }
   
   export function scoreBrand(
    profile: BrandProfile
   ): BrandIntelligenceScore {
    /*
     * Product and manufacturing quality.
     */
    const quality =
      clampScore(
        35 +
          scoreBooleanFact({
            value:
              profile.cGmpCompliant
                .value,
   
            confidence:
              profile.cGmpCompliant
                .confidence,
   
            truePoints: 30,
            falsePoints: -15,
            unknownPoints: 0,
          }) +
          scoreBooleanFact({
            value:
              profile.practitionerGrade
                .value,
   
            confidence:
              profile.practitionerGrade
                .confidence,
   
            truePoints: 15,
            falsePoints: 0,
            unknownPoints: 0,
          }) +
          scoreBooleanFact({
            value:
              profile.hypoallergenicFocus
                .value,
   
            confidence:
              profile.hypoallergenicFocus
                .confidence,
   
            truePoints: 10,
            falsePoints: 0,
            unknownPoints: 0,
          }) +
          scoreBooleanFact({
            value:
              profile.veganOptions
                .value,
   
            confidence:
              profile.veganOptions
                .confidence,
   
            truePoints: 10,
            falsePoints: 0,
            unknownPoints: 0,
          })
      );
   
    /*
     * Independent testing and formal
     * certification strength.
     */
    const testing =
      clampScore(
        25 +
          scoreBooleanFact({
            value:
              profile.thirdPartyTesting
                .value,
   
            confidence:
              profile.thirdPartyTesting
                .confidence,
   
            truePoints: 45,
            falsePoints: -10,
            unknownPoints: 0,
          }) +
          Math.min(
            30,
            profile.certifications.length *
              10
          )
      );
   
    /*
     * Strength and quality of the facts
     * currently available.
     */
    const evidence =
      clampScore(
        confidencePoints(
          profile.profileConfidence
        ) * 65 +
          Math.min(
            35,
            profile.certifications.length *
              10
          )
      );
   
    /*
     * Brand positioning is not itself proof
     * of quality. It receives limited weight.
     */
    const reputation =
      clampScore(
        scorePricePosition(
          profile.priceTier
        )
      );
   
    const availability =
      scoreAvailability(
        profile.availability
      );
   
    const dataCompleteness =
      calculateDataCompleteness(
        profile
      );
   
    const confidence =
      calculateConfidence(
        profile,
        dataCompleteness
      );
   
    /*
     * Brand score only.
     *
     * This will later become one component
     * of the final product recommendation.
     */
    const overall =
      clampScore(
        quality * 0.28 +
          testing * 0.25 +
          evidence * 0.20 +
          reputation * 0.10 +
          availability * 0.07 +
          dataCompleteness * 0.10
      );
   
    return {
      quality,
      testing,
      evidence,
      reputation,
      availability,
      dataCompleteness,
      overall,
      confidence,
    };
   }