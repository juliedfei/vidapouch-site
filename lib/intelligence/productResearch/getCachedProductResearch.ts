import { prisma } from "@/lib/db";

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
   .replace(/[^a-z0-9]+/g, " ")
   .trim();
}

export async function getCachedProductResearch(
 productName: string
): Promise<ProductResearch | null> {
 const normalizedKey =
   normalizeKey(productName);

 const cached =
   await prisma.productResearchCache.findUnique({
     where: {
       normalizedKey,
     },
   });

 if (!cached?.research) {
   return null;
 }

 console.log(
   "Using cached research:",
   productName
 );

 return cached.research as ProductResearch;
}