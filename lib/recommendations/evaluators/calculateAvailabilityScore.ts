type CalculateAvailabilityScoreInput = {

    vendorCount: number;
   
    listingCount: number;
   
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
   
   export function calculateAvailabilityScore({
    vendorCount,
    listingCount,
   }: CalculateAvailabilityScoreInput) {
   
    /*
     * Vendor diversity matters more than
     * duplicate listings.
     */
    const vendorScore =
      Math.min(
        70,
        vendorCount * 12
      );
   
    /*
     * Multiple listings increase
     * confidence that the product
     * is widely available.
     */
    const listingScore =
      Math.min(
        30,
        listingCount * 3
      );
   
    return clamp(
      vendorScore +
      listingScore
    );
   
   }
   