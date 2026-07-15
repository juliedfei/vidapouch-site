import {
    findProducts,
   } from "./findProducts";
   
   import type {
    RetailProduct,
   } from "./types";
   
   const MINIMUM_COMPARISON_BRANDS = 3;
   
   function normalizeText(
    value: string
   ) {
    return value
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim();
   }
   
   function buildProductKey(
    product: RetailProduct
   ) {
    return [
      normalizeText(product.brand),
      normalizeText(product.retailer),
      normalizeText(product.dosage),
      product.bottlePrice.toFixed(2),
      product.capsulesPerBottle,
    ].join("|");
   }
   
   function deduplicateProducts(
    products: RetailProduct[]
   ) {
    const uniqueProducts =
      new Map<
        string,
        RetailProduct
   >();
   
    products.forEach((product) => {
      const key =
        buildProductKey(product);
   
      if (!uniqueProducts.has(key)) {
        uniqueProducts.set(
          key,
          product
        );
      }
    });
   
    return Array.from(
      uniqueProducts.values()
    );
   }
   
   function countUniqueBrands(
    products: RetailProduct[]
   ) {
    return new Set(
      products
        .map((product) =>
          normalizeText(product.brand)
        )
        .filter(Boolean)
    ).size;
   }
   
   function buildFallbackSearchTerms(
    supplement: string
   ) {
    const cleanSupplement =
      supplement.trim();
   
    return [
      `${cleanSupplement} capsules`,
      `${cleanSupplement} tablets`,
    ];
   }
   
   export async function findComparisonProducts({
    supplement,
    dosage,
   }: {
    supplement: string;
    dosage?: string;
   }): Promise<RetailProduct[]> {
    const cleanSupplement =
      supplement.trim();
   
    const cleanDosage =
      dosage?.trim() || undefined;
   
    if (!cleanSupplement) {
      return [];
    }
   
    /*
     * Begin with a general, unbranded
     * product search.
     */
    const initialProducts =
      await findProducts({
        supplement:
          cleanSupplement,
   
        dosage:
          cleanDosage,
      });
   
    const normalizedInitialProducts =
      initialProducts.map(
        (product) => ({
          ...product,
   
          supplement:
            cleanSupplement,
        })
      );
   
    /*
     * Do not make additional API calls
     * when the first search already found
     * enough competing brands.
     */
    if (
      countUniqueBrands(
        normalizedInitialProducts
      ) >= MINIMUM_COMPARISON_BRANDS
    ) {
      return deduplicateProducts(
        normalizedInitialProducts
      );
    }
   
    /*
     * If Google favored only one or two
     * brands, perform broader form-based
     * searches. These are dynamic search
     * variations, not a hard-coded list
     * of competing brands.
     */
    const fallbackResults =
      await Promise.all(
        buildFallbackSearchTerms(
          cleanSupplement
        ).map((searchTerm) =>
          findProducts({
            supplement:
              searchTerm,
   
            dosage:
              cleanDosage,
          })
        )
      );
   
    const normalizedFallbackProducts =
      fallbackResults
        .flat()
        .map((product) => ({
          ...product,
   
          supplement:
            cleanSupplement,
        }));
   
    return deduplicateProducts([
      ...normalizedInitialProducts,
      ...normalizedFallbackProducts,
    ]);
   }