import type {
  RetailProduct,
 } from "@/lib/pricing/types";
 
 export type SearchProductForm =
  | "Capsule"
  | "Tablet"
  | "Caplet"
  | "Softgel"
  | "Gummy"
  | "Powder"
  | "Liquid"
  | "Chewable"
  | "Other"
  | "Unknown";
 
 export type SearchDosageUnit =
  | "mg"
  | "mcg"
  | "g"
  | "IU"
  | null;
 
 export type SearchRetailProduct =
  RetailProduct & {
    /*
     * Exact Google Shopping listing title.
     *
     * This prevents different products from
     * the same brand from being merged into
     * one product card.
     */
    productTitle: string;
 
    /*
     * Normalized physical product form.
     *
     * Used by:
     *
     * - product cards
     * - form filters
     * - unit-price labels
     * - VitaPouch eligibility
     */
    form:
      SearchProductForm;
 
    /*
     * Human-readable unit used for pricing.
     *
     * Examples:
     *
     * $0.07 per tablet
     * $0.05 per capsule
     * $0.32 per gummy
     * $0.21 per softgel
     * $0.80 per serving
     */
    unitLabel:
      | "capsule"
      | "tablet"
      | "caplet"
      | "softgel"
      | "gummy"
      | "serving"
      | "unit";
 
    /*
     * Whether the product form may be added
     * to a VitaPouch.
     *
     * The eligibility rules are determined
     * in findSearchProducts.ts.
     */
    vitaPouchFormEligible:
      boolean;
 
    /*
     * Numeric dosage extracted from the
     * shopping result.
     *
     * Examples:
     *
     * "250 mg" becomes 250
     * "500 mcg" becomes 500
     * "2 g" becomes 2
     *
     * Null means the listing did not provide
     * a trustworthy dosage amount.
     */
    dosageAmount:
      number | null;
 
    /*
     * Unit associated with dosageAmount.
     */
    dosageUnit:
      SearchDosageUnit;
 
    /*
     * Indicates whether the dosage appears
     * to apply to one unit or a full serving.
     *
     * Examples:
     *
     * "250 mg per tablet"
     * dosageIsPerServing: false
     *
     * "240 mg per serving"
     * dosageIsPerServing: true
     *
     * Null means the listing is unclear.
     */
    dosageIsPerServing:
      boolean | null;
 
    /*
     * SerpApi/Google product identifier for
     * this exact Google Shopping product.
     *
     * This may be used for product-detail
     * or seller lookup requests.
     */
    shoppingProductId?:
      string;
 
    /*
     * Token required to request the exact
     * product's immersive product details
     * and seller list.
     *
     * This is what we will use to retrieve
     * direct merchant links such as Walmart,
     * Target, CVS, or the manufacturer's
     * website.
     */
    immersiveProductPageToken?:
      string;
 
    /*
     * SerpApi-generated URL for retrieving
     * the immersive product details.
     *
     * This is stored for diagnostics and
     * future compatibility. The server route
     * should still make the authenticated
     * request using SERPAPI_API_KEY.
     */
    serpApiImmersiveProductUrl?:
      string;
 
    /*
     * Indicates that Google reported more
     * than one seller or source for this
     * product.
     */
    multipleSourcesAvailable:
      boolean;
 
    /*
     * Retailer rating supplied by the
     * shopping result.
     */
    rating?: number;
 
    /*
     * Number of retailer reviews supplied
     * by the shopping result.
     */
    reviewCount?: number;
  };
 