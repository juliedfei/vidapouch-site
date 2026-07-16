export type ValueScoreInput = {

    /*
     * Price selected according to the
     * current PricingStrategy.
     */
    displayedPerCapsulePrice: number;
   
    /*
     * Lowest price discovered across
     * all vendor listings.
     */
    lowestPerCapsulePrice: number;
   
    /*
     * Highest price discovered across
     * all vendor listings.
     */
    highestPerCapsulePrice: number;
   
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
   
   /*
   * Returns a customer-facing
   * value score from 0–100.
   *
   * Lower prices receive higher
   * value scores.
   */
   export function calculateValueScore({
    displayedPerCapsulePrice,
    lowestPerCapsulePrice,
    highestPerCapsulePrice,
   }: ValueScoreInput) {
   
    /*
     * Every listing costs the same.
     */
    if (
      highestPerCapsulePrice ===
      lowestPerCapsulePrice
    ) {
      return 100;
    }
   
    const normalized =
   
      (highestPerCapsulePrice -
        displayedPerCapsulePrice) /
   
      (highestPerCapsulePrice -
        lowestPerCapsulePrice);
   
    return clamp(
      Math.round(
        normalized * 100
      )
    );
   
   }
   