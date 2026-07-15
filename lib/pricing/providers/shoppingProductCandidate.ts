import type {
    RetailProduct,
   } from "@/lib/pricing/types";
   
   import type {
    ShoppingResultQuality,
   } from "./shoppingResultQuality";
   
   /*
   * Represents a relevant Google Shopping
   * result before VitaPouch decides whether
   * it contains enough information for
   * reliable monthly pricing.
   *
   * Unlike RetailProduct, fields that Google
   * may omit are allowed to be null.
   */
   export type ShoppingProductCandidate = {
    retailer: string;
   
    brand: string;
   
    supplement: string;
   
    dosage: string;
   
    bottlePrice: number;
   
    capsulesPerBottle:
      | number
      | null;
   
    servingSize:
      | number
      | null;
   
    estimatedShipping?: number;
   
    url?: string;
   
    /*
     * The original Google Shopping title is
     * retained for debugging and potential
     * future enrichment.
     */
    title: string;
   
    /*
     * Describes which important fields were
     * present or absent in the search result.
     */
    quality: ShoppingResultQuality;
   };
   
   /*
   * Only complete candidates can safely
   * become RetailProduct records because
   * monthly pricing requires a known package
   * count and serving size.
   */
   export function candidateToRetailProduct(
    candidate: ShoppingProductCandidate
   ): RetailProduct | null {
    if (
      !candidate.quality.isComplete ||
      candidate.capsulesPerBottle == null ||
      candidate.servingSize == null
    ) {
      return null;
    }
   
    return {
      retailer:
        candidate.retailer,
   
      brand:
        candidate.brand,
   
      supplement:
        candidate.supplement,
   
      dosage:
        candidate.dosage,
   
      bottlePrice:
        candidate.bottlePrice,
   
      capsulesPerBottle:
        candidate.capsulesPerBottle,
   
      servingSize:
        candidate.servingSize,
   
      estimatedShipping:
        candidate.estimatedShipping,
   
      url:
        candidate.url,
    };
   }