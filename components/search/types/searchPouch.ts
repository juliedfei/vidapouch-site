import type {
    SearchProductUnitLabel,
   } from "@/lib/search/searchProductOption";
   
   export type SearchPouchTiming =
    | "morning"
    | "evening";
   
   export type SearchPouchTimingPreference =
    | "vidapouch"
    | "morning"
    | "evening";
   
   export type SearchPouchItem = {
    /*
     * Stable identity for preventing the
     * same exact Google Shopping product
     * from being added more than once.
     */
    id: string;
   
    shoppingProductId:
      string | null;
   
    productName: string;
   
    brand: string;
   
    dosage: string;
   
    form:
      string | null;
   
    unitLabel:
      SearchProductUnitLabel;
   
    unitsPerDay: number;
   
    monthlyUnitCount: number;
   
    monthlyPrice: number;
   
    bottlePrice: number;
   
    retailer: string;
   
    imageUrl:
      string | null;
   
    vitaPouchScore:
      number | null;
   
    certifications:
      string[];
   
    qualityClaims:
      string[];
   
    /*
     * The actual pouch section where the
     * product currently appears.
     */
    timing:
      SearchPouchTiming;
   
    /*
     * "vidapouch" means the timing engine
     * selected the current section.
     *
     * "morning" or "evening" means the
     * customer manually overrode it.
     */
    timingPreference:
      SearchPouchTimingPreference;
   
    /*
     * Short customer-facing explanation for
     * the automatic timing recommendation.
     */
    timingReason:
      string;
   };
   