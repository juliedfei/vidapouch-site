type CalculateEvidenceScoreInput = {

    aiConfidence: number;
   
    evidenceCount: number;
   
   };
   
   function clamp(
    value: number
   ) {
    return Math.max(
      0,
      Math.min(
        100,
        value
      )
    );
   }
   
   export function calculateEvidenceScore({
   
    aiConfidence,
   
    evidenceCount,
   
   }: CalculateEvidenceScoreInput) {
   
    /*
     * AI confidence contributes roughly
     * 70% of the score.
     */
    const confidenceScore =
      aiConfidence * 70;
   
    /*
     * More independent sources increase
     * confidence.
     */
    const evidenceScore =
      Math.min(
        30,
        evidenceCount * 5
      );
   
    return clamp(
      Math.round(
        confidenceScore +
        evidenceScore
      )
    );
   
   }
   