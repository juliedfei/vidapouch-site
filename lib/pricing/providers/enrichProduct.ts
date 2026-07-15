import type { RetailProduct } from "../types";

export async function enrichProduct(
 product: RetailProduct
): Promise<RetailProduct> {
 /*
  * Future enrichment pipeline:
  *
  * 1. Use Google Shopping metadata.
  * 2. Use additional structured APIs.
  * 3. Scrape retailer page only if needed.
  */

 return product;
}