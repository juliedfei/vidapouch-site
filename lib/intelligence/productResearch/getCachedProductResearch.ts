import {
  prisma,
 } from "@/lib/db";
 
 import type {
  ProductResearch,
 } from "./productResearchTypes";
 
 function normalizeKey(
  productName: string
 ) {
  return productName
    .trim()
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .trim();
 }
 
 export async function
 getCachedProductResearch(
  productName: string,
 
  shoppingProductId?:
    string | null
 ): Promise<ProductResearch | null> {
  const normalizedProductName =
    productName.trim();
 
  const normalizedShoppingProductId =
    shoppingProductId
      ?.trim() ||
    null;
 
  /*
   * Prefer the stable Google Shopping
   * product identity when available.
   */
  if (
    normalizedShoppingProductId
  ) {
    const cachedByShoppingId =
      await prisma
        .productResearchCache
        .findUnique({
          where: {
            shoppingProductId:
              normalizedShoppingProductId,
          },
        });
 
    if (
      cachedByShoppingId
        ?.research
    ) {
      console.log(
        "Using cached research by shopping product ID:",
        {
          productName:
            normalizedProductName,
 
          shoppingProductId:
            normalizedShoppingProductId,
        }
      );
 
      return cachedByShoppingId
        .research as
        ProductResearch;
    }
  }
 
  /*
   * Preserve compatibility with all
   * existing title-based cache records.
   */
  const normalizedKey =
    normalizeKey(
      normalizedProductName
    );
 
  if (!normalizedKey) {
    return null;
  }
 
  const cachedByName =
    await prisma
      .productResearchCache
      .findUnique({
        where: {
          normalizedKey,
        },
      });
 
  if (
    !cachedByName?.research
  ) {
    return null;
  }
 
  console.log(
    "Using cached research by product name:",
    normalizedProductName
  );
 
  return cachedByName
    .research as
    ProductResearch;
 }