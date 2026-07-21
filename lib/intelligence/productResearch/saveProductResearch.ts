import { prisma } from "@/lib/db";

import type {
 ProductResearch,
} from "./productResearchTypes";

function normalizeKey(productName: string) {
 return productName
   .trim()
   .toLowerCase()
   .replace(/['’"]/g, "")
   .replace(/[^a-z0-9]+/g, " ")
   .trim();
}

export async function saveProductResearch(
 productName: string,
 research: ProductResearch
) {
 const normalizedKey = normalizeKey(productName);

 await prisma.productResearchCache.upsert({
   where: {
     normalizedKey,
   },

   update: {
     requestedProductName: productName,
     canonicalProductName:
       research.productName ?? productName,
     brand: research.brand ?? null,
     supplement: research.supplement ?? null,
     research,
     status: "COMPLETED",
     researchedAt: new Date(),
     lastError: null,
   },

   create: {
     normalizedKey,
     requestedProductName: productName,
     canonicalProductName:
       research.productName ?? productName,
     brand: research.brand ?? null,
     supplement: research.supplement ?? null,
     research,
     status: "COMPLETED",
     researchedAt: new Date(),
   },
 });

 return research;
}
