import type {
  RetailProduct,
 } from "@/lib/pricing/types";
 
 export type ProductSearchMode =
  | "supplement"
  | "direct-marketplace";
 
 /*
 * supplement:
 * - Uses supplement aliases.
 * - Validates that each returned listing contains
 *   the requested supplement or one of its aliases.
 *
 * direct-marketplace:
 * - Searches the supplied marketplace phrase as-is.
 * - Does not require every result to match a known
 *   ingredient alias.
 * - Used for searches such as "mood supplements"
 *   so combination products and products explicitly
 *   marketed for the goal are preserved.
 */
 export type ProductSearchRequest = {
  supplement:
    string;
 
  brand?:
    string;
 
  dosage?:
    string;
 
  searchMode?:
    ProductSearchMode;
 
  /*
   * When false, findSearchProducts must use the
   * supplied query as an already-expanded search
   * rather than creating additional alias searches.
   */
  expandAliases?:
    boolean;
 
  /*
   * Number of Google Shopping result pages to
   * request for each marketplace query.
   *
   * This controls provider retrieval, not the
   * customer-facing pagination in SearchResults.
   */
  maxPages?:
    number;
 
  /*
   * Optional safety ceiling for raw retailer
   * listings returned by the provider.
   *
   * Product-level grouping happens later, so this
   * should be much larger than the number of cards
   * displayed at once.
   */
  maxRetailListings?:
    number;
 };
 
 export type ProductProviderResult = {
  provider:
    string;
 
  products:
    RetailProduct[];
 };
 
 export interface ProductProvider {
  readonly name:
    string;
 
  search(
    request:
      ProductSearchRequest
  ): Promise<ProductProviderResult>;
 }