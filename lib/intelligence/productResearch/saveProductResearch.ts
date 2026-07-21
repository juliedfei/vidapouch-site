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
 
 export async function saveProductResearch(
  productName: string,
 
  research:
    ProductResearch,
 
  shoppingProductId?:
    string | null
 ) {
  const normalizedKey =
    normalizeKey(
      productName
    );
 
  const normalizedShoppingProductId =
    shoppingProductId
      ?.trim() ||
    research
      .shoppingProductId
      ?.trim() ||
    null;
 
  /*
   * Prefer an existing record tied to the
   * stable Google Shopping product ID.
   *
   * This prevents slightly different titles
   * for the same exact product from creating
   * duplicate cache records.
   */
  if (
    normalizedShoppingProductId
  ) {
    const existingByShoppingId =
      await prisma
        .productResearchCache
        .findUnique({
          where: {
            shoppingProductId:
              normalizedShoppingProductId,
          },
        });
 
    if (
      existingByShoppingId
    ) {
      await prisma
        .productResearchCache
        .update({
          where: {
            id:
              existingByShoppingId.id,
          },
 
          data: {
            requestedProductName:
              productName,
 
            canonicalProductName:
              research.productName ||
              productName,
 
            brand:
              research.brand ||
              null,
 
            supplement:
              research.supplement ||
              null,
 
            research: {
              ...research,
 
              shoppingProductId:
                normalizedShoppingProductId,
            },
 
            status:
              "COMPLETED",
 
            aiConfidence:
              research.aiConfidence,
 
            sourceProvider:
              "product-enrichment",
 
            methodologyVersion:
              research
                .researchVersion
                ? `product-research-v${research.researchVersion}`
                : "product-research-v1",
 
            researchedAt:
              new Date(),
 
            lastError:
              null,
          },
        });
 
      return research;
    }
  }
 
  await prisma
    .productResearchCache
    .upsert({
      where: {
        normalizedKey,
      },
 
      update: {
        shoppingProductId:
          normalizedShoppingProductId,
 
        requestedProductName:
          productName,
 
        canonicalProductName:
          research.productName ||
          productName,
 
        brand:
          research.brand ||
          null,
 
        supplement:
          research.supplement ||
          null,
 
        research: {
          ...research,
 
          shoppingProductId:
            normalizedShoppingProductId ||
            research.shoppingProductId,
        },
 
        status:
          "COMPLETED",
 
        aiConfidence:
          research.aiConfidence,
 
        sourceProvider:
          "product-enrichment",
 
        methodologyVersion:
          research
            .researchVersion
            ? `product-research-v${research.researchVersion}`
            : "product-research-v1",
 
        researchedAt:
          new Date(),
 
        lastError:
          null,
      },
 
      create: {
        normalizedKey,
 
        shoppingProductId:
          normalizedShoppingProductId,
 
        requestedProductName:
          productName,
 
        canonicalProductName:
          research.productName ||
          productName,
 
        brand:
          research.brand ||
          null,
 
        supplement:
          research.supplement ||
          null,
 
        research: {
          ...research,
 
          shoppingProductId:
            normalizedShoppingProductId ||
            research.shoppingProductId,
        },
 
        status:
          "COMPLETED",
 
        aiConfidence:
          research.aiConfidence,
 
        sourceProvider:
          "product-enrichment",
 
        methodologyVersion:
          research
            .researchVersion
            ? `product-research-v${research.researchVersion}`
            : "product-research-v1",
 
        researchedAt:
          new Date(),
 
        lastError:
          null,
      },
    });
 
  return research;
 }
 