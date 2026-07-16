type CalculateReviewScoreInput = {

    averageRating?: number;
   
    reviewCount?: number;
   
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
   
   export function calculateReviewScore({
    averageRating,
    reviewCount,
   }: CalculateReviewScoreInput) {
   
    /*
     * Unknown review data.
     */
    if (
      averageRating === undefined ||
      reviewCount === undefined
    ) {
      return 50;
    }
   
    /*
     * Rating contributes roughly 70%
     * of the review score.
     */
    const ratingScore =
      (averageRating / 5) * 70;
   
    /*
     * Review count contributes roughly
     * 30%.
     *
     * Log scaling prevents huge brands
     * from completely dominating.
     */
    const reviewVolumeScore =
      Math.min(
        30,
        Math.log10(
          reviewCount + 1
        ) * 8
      );
   
    return clamp(
      Math.round(
        ratingScore +
        reviewVolumeScore
      )
    );
   
   }
   